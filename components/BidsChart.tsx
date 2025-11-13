import React from 'react';
import { Bid } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface BidsChartProps {
  bids: Bid[];
  isLoading: boolean;
}

const processBidsForChart = (bids: Bid[]) => {
    const bidsByHour: { [hour: number]: number } = {};
    for (let i = 0; i < 24; i++) {
        bidsByHour[i] = 0;
    }
    
    bids.forEach(bid => {
        const hour = new Date(bid.timestamp).getHours();
        bidsByHour[hour]++;
    });
    
    return Object.entries(bidsByHour).map(([hour, count]) => ({
        name: `${String(hour).padStart(2, '0')}:00`,
        Lances: count
    }));
};

const BidsChart: React.FC<BidsChartProps> = ({ bids, isLoading }) => {
    if(isLoading) {
        return <div className="bg-gray-200 dark:bg-gray-700 h-80 rounded-md animate-pulse"></div>;
    }

    if (bids.length === 0) {
        return (
            <div className="flex items-center justify-center h-80 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">Sem dados para exibir o gráfico.</p>
            </div>
        );
    }
    
    const chartData = processBidsForChart(bids);

    return (
        <div className="h-80 w-full">
            <ResponsiveContainer>
                <BarChart
                    data={chartData}
                    margin={{
                        top: 5,
                        right: 20,
                        left: -10,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                    <XAxis dataKey="name" tick={{ fill: 'rgb(107 114 128)', fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fill: 'rgb(107 114 128)', fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(31, 41, 55, 0.8)', 
                        borderColor: 'rgba(75, 85, 99, 0.5)',
                        color: '#fff'
                      }} 
                    />
                    <Legend />
                    <Bar dataKey="Lances" fill="#4f46e5" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default BidsChart;