import os
import base64
import requests
import re
import subprocess
from typing import List
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import google.generativeai as genai

# Load API keys
load_dotenv(dotenv_path="D:/medical_advisor/ml_service/.env")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not TAVILY_API_KEY or not GEMINI_API_KEY:
    raise ValueError("Missing API keys in .env (TAVILY_API_KEY, GEMINI_API_KEY).")

# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)

app = FastAPI(title="AI Prescription API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def extract_text_gemini(image_path: str):
    with open(image_path, "rb") as img:
        img_data = img.read()

    prompt = "Extract all medicine names from this prescription. Respond with a comma-separated list only."
    mime = "image/jpeg"
    if image_path.lower().endswith(".png"):
        mime = "image/png"
    elif image_path.lower().endswith(".webp"):
        mime = "image/webp"

    model = genai.GenerativeModel("gemini-1.5-flash")
    result = model.generate_content([
        {"role": "user", "parts": [
            {"text": prompt},
            {"inline_data": {
                "mime_type": mime,
                "data": base64.b64encode(img_data).decode()
            }}
        ]}
    ])
    text = getattr(result, "text", "").strip()
    return [m.strip() for m in re.split(r',|\n', text) if m.strip()]

def fetch_drug_info_tavily(drug_name: str):
    url = "https://api.tavily.com/search"
    headers = {"Authorization": f"Bearer {TAVILY_API_KEY}", "Content-Type": "application/json"}
    payload = {"query": f"{drug_name} dosage, uses, side effects, interactions", "search_depth": "advanced"}
    r = requests.post(url, headers=headers, json=payload)
    return r.json() if r.status_code == 200 else {"error": r.status_code}

def analyze_with_granite(text: str):
    if not text.strip():
        return ""
    try:
        result = subprocess.run(
            ["ollama", "generate", "granite3.3:2b", text],
            capture_output=True, text=True, encoding="utf-8", errors="replace"
        )
        if result.returncode != 0 or not result.stdout.strip():
            return ""
        return re.sub(r'^.*?Output:', '', result.stdout.strip(), flags=re.DOTALL).strip()
    except Exception:
        return ""

@app.post("/process_prescription")
async def process_prescription(
    image_file: List[UploadFile] = File(None),
    typed_names: str = Form(None)
):
    medicines = []

    # Process uploaded images
    if image_file:
        for img in image_file:
            temp_path = f"temp_{img.filename}"
            with open(temp_path, "wb") as f:
                f.write(await img.read())
            meds = extract_text_gemini(temp_path)
            medicines.extend(meds)
            os.remove(temp_path)

    # Process typed names
    if typed_names:
        medicines.extend([m.strip() for m in typed_names.split(",") if m.strip()])

    # Remove duplicates
    medicines = list(set(medicines))

    if not medicines:
        return JSONResponse({"error": "No medicines detected."}, status_code=400)

    # Fetch details
    response = {"medicines": medicines, "details": {}}
    for med in medicines:
        data = fetch_drug_info_tavily(med)
        if "results" in data and data["results"]:
            scores = [r.get("score", 0) for r in data["results"]]
            highest_score = round(max(scores) * 100, 2) if scores else None
            content_combined = " ".join(r.get("content", "") for r in data["results"] if r.get("content"))
            summary = analyze_with_granite(content_combined)
            response["details"][med] = {
                "highest_score": highest_score,
                "content": content_combined,
                "summary": summary
            }
        else:
            response["details"][med] = {"error": data.get("error", "Unknown error")}

    return JSONResponse(response)
