import React, { useEffect, useMemo, useRef, useState } from 'react';

const getNextOccurrence = (scheduleTime) => {
	if (!scheduleTime) return null;
	const [hours, minutes] = scheduleTime.split(':').map(Number);
	if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
	const now = new Date();
	const target = new Date();
	target.setHours(hours, minutes, 0, 0);
	if (target < now) target.setDate(target.getDate() + 1);
	return target;
};

const formatRemaining = (msRemaining) => {
	if (msRemaining <= 0) return 'Due now';
	const totalSeconds = Math.floor(msRemaining / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;
	const parts = [];
	if (hours) parts.push(String(hours).padStart(2, '0'));
	parts.push(String(minutes).padStart(2, '0'));
	parts.push(String(seconds).padStart(2, '0'));
	return parts.join(':');
};

const NextReminder = ({ items }) => {
	const [nowTick, setNowTick] = useState(Date.now());
	const next = useMemo(() => {
		const withTargets = items
			.map((m) => ({ ...m, target: getNextOccurrence(m.scheduleTime) }))
			.filter((m) => m.target);
		if (!withTargets.length) return null;
		withTargets.sort((a, b) => a.target - b.target);
		return withTargets[0];
	}, [items]);

	useEffect(() => {
		const id = setInterval(() => setNowTick(Date.now()), 1000);
		return () => clearInterval(id);
	}, []);

	if (!next) return (
		<div className="text-sm text-gray-600">No upcoming reminders</div>
	);

	const remainingMs = next.target - nowTick;

	return (
		<div className="flex items-center justify-between">
			<div>
				<p className="text-sm text-gray-600">Next reminder</p>
				<p className="font-medium text-gray-900">{next.name} <span className="text-sm text-gray-500">{next.dosage}</span></p>
			</div>
			<div className="text-right">
				<p className="text-xs text-gray-500">in</p>
				<p className="font-mono text-lg">{formatRemaining(remainingMs)}</p>
			</div>
		</div>
	);
};

export default NextReminder;




