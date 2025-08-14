import React, { useEffect, useMemo, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
	Chart as ChartJS,
	ArcElement,
	Tooltip,
	Legend
} from 'chart.js';
import api from '../api';

ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutChart = () => {
	const [scores, setScores] = useState([]);

	useEffect(() => {
		api.get('/scores').then((res) => setScores(res.data)).catch(() => setScores([]));
	}, []);

    const chartData = useMemo(() => {
        const last = scores.length ? Math.round(scores[scores.length - 1].value) : 0;
        const unhealthy = Math.max(0, 100 - last);
        return {
            labels: ['Healthy', 'Unhealthy'],
            datasets: [
                {
                    label: 'Health Score',
                    data: [last, unhealthy],
                    backgroundColor: ['#22c55e', '#ef4444'],
                    borderWidth: 0,
                },
            ],
        };
    }, [scores]);

	return (
        <div className="w-full max-w-xs">
            <Doughnut data={chartData} />
            <div className="mt-2 text-center text-sm">
                <span className="font-semibold text-gray-900">{scores.length ? Math.round(scores[scores.length - 1].value) : 0}%</span>
                <span className="text-gray-500"> score</span>
            </div>
        </div>
	);
};

export default DoughnutChart;
