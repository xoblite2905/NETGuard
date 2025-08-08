// src/components/charts/ProtocolAnomalyChart.js

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const data = [ { name: 'Malformed', tcp: 12, udp: 12 }, { name: 'Unexpected', tcp: 25, udp: 20 }, { name: 'DDoS Sig', tcp: 0, udp: 12 }, { name: 'Replay Atk', tcp: 8, udp: 0 }, { name: 'Beaconing', tcp: 31, udp: 0 } ];

const CustomTooltip = ({ active, payload, colors }) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 bg-light-card/90 dark:bg-dark-card/90 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-lg shadow-lg">
                <p className="label text-sm text-light-text dark:text-dark-text font-bold mb-1">{payload[0].payload.name}</p>
                <p className="intro text-xs" style={{color: colors.tcp}}>{`TCP: ${payload[0].value} events`}</p>
                <p className="intro text-xs" style={{color: colors.udp}}>{`UDP: ${payload[1].value} events`}</p>
            </div>
        );
    }
    return null;
};

const ProtocolAnomalyChart = () => {
    // THE FIX: Get colors directly from our centralized hook
    const { chartColors } = useTheme();
    const [tcpColor, udpColor] = chartColors.liveThroughput; // Use the same palette as Live Throughput for consistency

    return (
        <div className='h-full w-full flex flex-col'>
            <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-1">Protocol Anomaly Events</h3>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">Last 24 hours</p>
            <div className="w-full flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={data} margin={{ top: 5, right: 20, left: 10, bottom: 20 }} barCategoryGap="20%">
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" stroke={chartColors.textColor} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} width={80}/>
                        <Tooltip content={<CustomTooltip colors={{ tcp: tcpColor, udp: udpColor }} />} cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }}/>
                        <Legend wrapperStyle={{fontSize: "12px", paddingTop: "10px", color: chartColors.textColor }}/>
                        <Bar dataKey="tcp" stackId="a" fill={tcpColor} radius={[0, 5, 5, 0]} />
                        <Bar dataKey="udp" stackId="a" fill={udpColor} radius={[0, 5, 5, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
export default ProtocolAnomalyChart;