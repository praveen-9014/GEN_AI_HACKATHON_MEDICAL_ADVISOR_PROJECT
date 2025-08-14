import React, { useRef, useState, useEffect } from 'react';
import api from '../api';

const Advisor = () => {
    const [input, setInput] = useState('');
    const [imageFiles, setImageFiles] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    // Load saved images from localStorage on mount
    useEffect(() => {
        const savedImages = JSON.parse(localStorage.getItem('advisorImages') || '[]');
        setImageFiles(savedImages.map(url => ({ previewUrl: url })));
    }, []);

    // Save whenever imageFiles changes
    useEffect(() => {
        localStorage.setItem('advisorImages', JSON.stringify(imageFiles.map(f => f.previewUrl)));
    }, [imageFiles]);

    const addMessage = (msg) => setMessages((m) => [...m, msg]);

    const formatMedicineDetails = (medicines, details) => {
        return medicines.map((m) => {
            const d = details[m];
            return `Name: ${m}
Score: ${d?.highest_score ?? 'N/A'}
Details: ${d?.error || JSON.stringify(d)}`;
        }).join('\n\n');
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input && imageFiles.length === 0) return;

        const userMessage = {
            id: Date.now(),
            role: 'user',
            text: input,
            imageUrls: imageFiles.map(f => f.previewUrl)
        };
        addMessage(userMessage);
        setInput('');

        // Convert previewUrls back to real File objects
        const filesToSend = await Promise.all(imageFiles.map(async (img) => {
            const res = await fetch(img.previewUrl);
            const blob = await res.blob();
            return new File([blob], img.name || 'upload.jpg', { type: blob.type });
        }));

        setImageFiles([]); // clear after sending
        setLoading(true);

        try {
            // Check localStorage first if no files are sent
            if (!filesToSend.length && userMessage.text) {
                const storedData = JSON.parse(localStorage.getItem('medicineData') || '{}');
                const searchName = userMessage.text.trim().toLowerCase();

                if (storedData[searchName]) {
                    const textMsg = formatMedicineDetails([searchName], { [searchName]: storedData[searchName] });
                    addMessage({ id: Date.now() + 1, role: 'assistant', text: textMsg });
                    setLoading(false);
                    return;
                }
            }

            const mlBase = import.meta.env.VITE_ML_BASE_URL || 'http://127.0.0.1:8000';
            const fd = new FormData();

            if (filesToSend.length) {
                filesToSend.forEach((file) => fd.append('image_file', file));
            } else if (userMessage.text) {
                fd.append('typed_names', userMessage.text);
            }

            const r = await fetch(`${mlBase}/process_prescription`, { method: 'POST', body: fd });
            const j = await r.json();
            if (!r.ok) throw new Error(j?.error || 'Processing failed');

            const { medicines, details } = j;

            // Store results in localStorage
            const storedData = JSON.parse(localStorage.getItem('medicineData') || '{}');
            medicines.forEach((med) => {
                storedData[med.toLowerCase()] = details[med];
            });
            localStorage.setItem('medicineData', JSON.stringify(storedData));

            // Create formatted text
            const formattedText = formatMedicineDetails(medicines, details);
            addMessage({ id: Date.now() + 1, role: 'assistant', text: formattedText });

            // Save score average
            const scores = medicines
                .map((m) => details?.[m]?.highest_score)
                .filter((s) => typeof s === 'number');
            const score = scores.length
                ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
                : 50;
            await api.post('/scores', { value: score });

        } catch (err) {
            addMessage({
                id: Date.now() + 1,
                role: 'assistant',
                text: `Could not process prescription automatically. ${err.message}`
            });
        } finally {
            setLoading(false);
        }
    };

    const handleImageSelect = (files) => {
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImageFiles(prev => [...prev, { name: file.name, previewUrl: e.target.result }]);
            };
            reader.readAsDataURL(file);
        });
    };

    return (
        <div className="mx-auto max-w-4xl p-4">
            <div className="bg-white rounded-2xl shadow border overflow-hidden flex flex-col h-[600px]">
                {/* Chat history */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {messages.map((m) => (
                        <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-gray-900'} max-w-[80%] rounded-2xl px-4 py-3 shadow`}>
                                {Array.isArray(m.imageUrls) && m.imageUrls.length > 0 && (
                                    <div className="mb-2 flex gap-2 overflow-x-auto">
                                        {m.imageUrls.map((url, idx) => (
                                            <img key={idx} src={url} alt={`upload-${idx}`} className="rounded-lg max-h-40 object-contain" />
                                        ))}
                                    </div>
                                )}
                                {m.text && m.text.split('\n').map((line, i) => (
                                    <p key={i} className="whitespace-pre-wrap text-sm leading-6">{line}</p>
                                ))}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-white text-gray-900 max-w-[80%] rounded-2xl px-4 py-3 shadow">
                                <span className="inline-flex items-center gap-2 text-sm">
                                    <span className="w-2 h-2 rounded-full bg-gray-300 animate-pulse" />
                                    <span>Thinking...</span>
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-3 border-t bg-white">
                    <div className="flex items-end gap-2">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-2 rounded-lg border hover:bg-gray-50"
                        >
                            Images
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                                const files = Array.from(e.target.files || []);
                                if (files.length) handleImageSelect(files);
                            }}
                        />
                        <div className="flex-1">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Message Medical Advisor..."
                                rows={2}
                                className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {imageFiles.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {imageFiles.map((f, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-2 bg-blue-50 text-blue-700 rounded px-2 py-1"
                                        >
                                            <span className="truncate max-w-[160px]">{f.name || `Image ${idx+1}`}</span>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setImageFiles((prev) => prev.filter((_, i) => i !== idx))
                                                }
                                                className="text-red-600 hover:underline"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button
                            disabled={loading}
                            className="px-4 py-2 rounded-xl bg-blue-600 text-white disabled:opacity-50"
                        >
                            {loading ? 'Sending...' : 'Send'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Advisor;
