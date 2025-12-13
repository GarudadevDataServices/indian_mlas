import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { getPartyColor } from '../utils/colors';

ChartJS.register(ArcElement, Tooltip, Legend);

const BattleChart = ({ candidates }) => {
    // Take top 3 + others
    const top3 = candidates.slice(0, 3);
    const others = candidates.slice(3);
    const othersVotes = others.reduce((sum, c) => sum + c.votes, 0);

    const data = {
        labels: [...top3.map(c => c.party), 'Others'],
        datasets: [
            {
                data: [...top3.map(c => c.votes), othersVotes],
                backgroundColor: [
                    ...top3.map(c => getPartyColor(c.party)),
                    '#9ca3af' // Grey for others
                ],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    boxWidth: 10,
                    font: { size: 10 }
                }
            }
        },
        maintainAspectRatio: false
    };

    return <div style={{ height: '200px' }}><Doughnut data={data} options={options} /></div>;
};

export default BattleChart;
