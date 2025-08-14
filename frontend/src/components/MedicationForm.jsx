import React, { useEffect, useMemo, useState } from 'react';

const empty = { name: '', dosage: '', scheduleTime: '', ampm: 'AM', mealTiming: '', notes: '' };

const to24h = (hhmm, ampm) => {
	const [hStr, mStr] = (hhmm || '').split(':');
	let h = parseInt(hStr, 10);
	const m = parseInt(mStr, 10);
	if (!Number.isFinite(h) || !Number.isFinite(m)) return hhmm || '';
	if (ampm === 'PM' && h !== 12) h += 12;
	if (ampm === 'AM' && h === 12) h = 0;
	return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const from24h = (hhmm) => {
	const [hStr, mStr] = (hhmm || '').split(':');
	let h = parseInt(hStr, 10);
	const m = parseInt(mStr, 10);
	if (!Number.isFinite(h) || !Number.isFinite(m)) return { time: '', ampm: 'AM' };
	const ampm = h >= 12 ? 'PM' : 'AM';
	if (h === 0) h = 12; else if (h > 12) h -= 12;
	return { time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`, ampm };
};

const MedicationForm = ({ onSubmit, editing }) => {
	const [form, setForm] = useState(empty);

    useEffect(() => {
		if (editing) {
			setForm({
				name: editing.name || '',
				dosage: editing.dosage || '',
                scheduleTime: from24h(editing.scheduleTime || '').time,
                ampm: from24h(editing.scheduleTime || '').ampm,
                mealTiming: editing.mealTiming || '',
				notes: editing.notes || '',
			});
		} else {
			setForm(empty);
		}
	}, [editing]);

	const handleChange = (e) => {
		setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
	};

    const handleSubmit = (e) => {
		e.preventDefault();
        const payload = {
            name: form.name,
            dosage: form.dosage,
            scheduleTime: to24h(form.scheduleTime, form.ampm),
            mealTiming: form.mealTiming || null,
            notes: form.notes,
        };
        onSubmit(payload);
		if (!editing) setForm(empty);
	};

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
			<div>
				<label className="block text-sm font-medium">Medicine name</label>
				<input name="name" value={form.name} onChange={handleChange} className="mt-1 w-full border rounded px-3 py-2" required />
			</div>
			<div className="grid grid-cols-2 gap-3">
				<div>
					<label className="block text-sm font-medium">Dosage</label>
					<input name="dosage" value={form.dosage} onChange={handleChange} className="mt-1 w-full border rounded px-3 py-2" />
				</div>
                <div>
                    <label className="block text-sm font-medium">Time</label>
                    <div className="mt-1 grid grid-cols-[1fr_auto] gap-2">
                        <input name="scheduleTime" value={form.scheduleTime} onChange={handleChange} pattern="^([0]?[1-9]|1[0-2]):[0-5][0-9]$" placeholder="08:30" className="w-full border rounded px-3 py-2" required />
                        <select name="ampm" value={form.ampm} onChange={handleChange} className="border rounded px-2">
                            <option>AM</option>
                            <option>PM</option>
                        </select>
                    </div>
                </div>
			</div>
            <div>
                <label className="block text-sm font-medium">Meal timing</label>
                <select name="mealTiming" value={form.mealTiming} onChange={handleChange} className="mt-1 w-full border rounded px-3 py-2">
                    <option value="">Select...</option>
                    <option value="before breakfast">Before breakfast</option>
                    <option value="after breakfast">After breakfast</option>
                    <option value="before lunch">Before lunch</option>
                    <option value="after lunch">After lunch</option>
                    <option value="before dinner">Before dinner</option>
                    <option value="after dinner">After dinner</option>
                </select>
            </div>
			<div>
				<label className="block text-sm font-medium">Notes</label>
				<textarea name="notes" value={form.notes} onChange={handleChange} className="mt-1 w-full border rounded px-3 py-2" rows={2} />
			</div>
            <button type="submit" className="bg-gradient-to-r from-teal-500 to-blue-600 text-white px-4 py-2 rounded shadow">
				{editing ? 'Update' : 'Add'}
			</button>
		</form>
	);
};

export default MedicationForm;
