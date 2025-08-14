import React, { useEffect, useMemo, useRef, useState } from 'react';
import api from '../api';
import DoughnutChart from '../components/DoughnutChart';
import MedicationForm from '../components/MedicationForm';
import MedicationList from '../components/MedicationList';
import NextReminder from '../components/NextReminder';

const Home = () => {
	const [items, setItems] = useState([]);
	const [editing, setEditing] = useState(null);
	const notificationRef = useRef(null);

	const fetchItems = async () => {
		const res = await api.get('/medications');
		setItems(res.data);
	};

	useEffect(() => {
		fetchItems();
		if (typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
			Notification.requestPermission();
		}
	}, []);

	const scheduleAlarms = useMemo(() => {
		const timers = [];
		items.forEach((m) => {
			const [hh, mm] = (m.scheduleTime || '').split(':').map(Number);
			if (Number.isFinite(hh) && Number.isFinite(mm)) {
				const now = new Date();
				const target = new Date();
				target.setHours(hh, mm, 0, 0);
				if (target < now) target.setDate(target.getDate() + 1);
				const delay = target - now;
				const id = setTimeout(() => {
					try {
						if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
							new Notification('Medicine reminder', { body: `${m.name} at ${m.scheduleTime}` });
						}
						// Audible buzz for web (short beep sequence)
						const ctx = new (window.AudioContext || window.webkitAudioContext)();
						const o = ctx.createOscillator();
						const g = ctx.createGain();
						o.connect(g); g.connect(ctx.destination);
						o.type = 'square'; o.frequency.value = 850; g.gain.value = 0.05;
						o.start(); setTimeout(() => o.stop(), 600);
					} catch {}
				}, delay);
				timers.push(id);
			}
		});
		return () => timers.forEach(clearTimeout);
	}, [items]);

	useEffect(() => {
		notificationRef.current = scheduleAlarms;
		return () => {
			if (notificationRef.current) notificationRef.current();
		};
	}, [scheduleAlarms]);

	const onCreate = async (payload) => {
		if (editing) {
			await api.put(`/medications/${editing.id}`, payload);
			setEditing(null);
		} else {
			await api.post('/medications', payload);
		}
		fetchItems();
	};

	const onDelete = async (m) => {
		await api.delete(`/medications/${m.id}`);
		fetchItems();
	};

	return (
		<div className="p-4 max-w-6xl mx-auto">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div className="md:col-span-2 space-y-4">
					<div className="bg-white rounded-2xl shadow border p-4">
						<h2 className="font-semibold mb-3">Your medications</h2>
						<MedicationList items={items} onEdit={setEditing} onDelete={onDelete} />
					</div>
					<div className="bg-white rounded-2xl shadow border p-4">
						<h2 className="font-semibold mb-3">{editing ? 'Edit medication' : 'Add medication'}</h2>
						<MedicationForm onSubmit={onCreate} editing={editing} />
					</div>
				</div>
				<div className="bg-white rounded-2xl shadow border p-4 space-y-4">
					<h2 className="font-semibold mb-3">Health score</h2>
					<DoughnutChart />
					<div className="border-t pt-3">
						<NextReminder items={items} />
					</div>
				</div>
			</div>
		</div>
	);
};

export default Home;
