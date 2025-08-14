import React, { useEffect, useMemo, useState } from 'react';

const getNextOccurrence = (scheduleTime) => {
    if (!scheduleTime) return null;
    const [hh, mm] = scheduleTime.split(':').map(Number);
    if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
    const now = new Date();
    const target = new Date();
    target.setHours(hh, mm, 0, 0);
    if (target < now) target.setDate(target.getDate() + 1);
    return target;
};

const formatRemaining = (msRemaining) => {
    if (msRemaining <= 0) return 'Due now';
    const totalSeconds = Math.floor(msRemaining / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    const ss = String(seconds).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
};

const MedicationList = ({ items, onEdit, onDelete }) => {
    const [tick, setTick] = useState(Date.now());
    useEffect(() => {
        const id = setInterval(() => setTick(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);

    return (
        <ul className="divide-y">
			{items.map((m) => (
                <li key={m.id} className="py-3 flex items-center justify-between">
                    <div>
                        <p className="font-medium text-gray-900">{m.name} <span className="text-sm text-gray-500">{m.dosage}</span></p>
                        <p className="text-sm text-gray-600">Time: <span className="inline-flex items-center gap-1"><span className="w-2 h-2 bg-teal-500 rounded-full" />{m.scheduleTime}</span>{m.mealTiming ? ` · ${m.mealTiming}` : ''}{m.notes ? ` · ${m.notes}` : ''}</p>
                        <p className="text-xs text-gray-500">Time left: {(() => { const t = getNextOccurrence(m.scheduleTime); return t ? formatRemaining(t - tick) : '-'; })()}</p>
                    </div>
                    <div className="space-x-2">
                        <button onClick={() => onEdit(m)} className="px-3 py-1 text-sm rounded border hover:bg-gray-50">Edit</button>
                        <button onClick={() => onDelete(m)} className="px-3 py-1 text-sm rounded border text-red-600 hover:bg-red-50">Delete</button>
                    </div>
                </li>
			))}
		</ul>
	);
};

export default MedicationList;
