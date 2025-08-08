// src/components/charts/OSDistributionChart.js

import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 bg-light-card/90 dark:bg-dark-card/90 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-lg">
                <p className="text-sm text-light-text dark:text-dark-text">{`${payload[0].name}: ${payload[0].value} endpoints`}</p>
            </div>
        );
    }
    return null;
};

const OSDistributionChart = ({ data }) => {
    const { chartColors } = useTheme();

    const { osData, onlineCount, totalCount } = useMemo(() => {
        if (!data || data.length === 0) return { osData: [], onlineCount: 0, totalCount: 0 };
        const counts = data.reduce((acc, host) => {
            let osName = 'Unknown';
            const rawOs = host.os_name || 'Unknown';
            if (rawOs.toLowerCase().includes('windows')) osName = 'Windows';
            else if (rawOs.toLowerCase().includes('linux')) osName = 'Linux';
            else if (rawOs.toLowerCase().includes('mac')) osName = 'macOS';
            else if (rawOs !== 'Unknown' && !rawOs.toLowerCase().includes('vmware')) osName = 'Other';
            acc.os[osName] = (acc.os[osName] || 0) + 1;
            if (host.status === 'up') acc.online += 1;
            return acc;
        }, { os: {}, online: 0 });
        const osEntries = Object.entries(counts.os).map(([name, value]) => ({ name, value }));
        return { osData: osEntries, onlineCount: counts.online, totalCount: data.length };
    }, [data]);

    return (
        <div className="h-full w-full flex flex-col">
            <h3 className="text-lg font-semibold text-light-text dark:text-dark-text">Operating Systems</h3>
            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-2">Endpoint Distribution</p>
            
            <div className="flex flex-col items-center justify-center my-3 transition-all duration-300 ease-in-out">
                <div className="flex items-center space-x-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    <span className="relative flex h-2.5 w-2.5">
                        {/* **THE FIX**: Removed hardcoded green. Pulsing dot now uses the correct theme color. */}
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: chartColors.status.good }}></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: chartColors.status.good }}></span>
                    </span>
                    <span>Live Endpoints</span>
                </div>
                {/* **THE FIX**: Removed the green text gradient. The number now uses the correct theme color. */}
                <div className="font-bold p-1 transition-all">
                    <span className="text-4xl" style={{ color: chartColors.status.good }}>{onlineCount}</span>
                    <span className="text-xl text-light-text-secondary dark:text-dark-text-secondary">/{totalCount}</span>
                </div>
            </div>

            <div className="w-full flex-grow">
                {osData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={osData} cx="50%" cy="50%" innerRadius="60%" outerRadius="80%" fill="#8884d8" paddingAngle={5} dataKey="value">
                                {osData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={chartColors.protocolDistribution[index % chartColors.protocolDistribution.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend iconType="circle" layout="vertical" align="right" verticalAlign="middle" height={80} wrapperStyle={{ fontSize: '12px', color: chartColors.textColor, paddingLeft: '10px' }}/>
                        </PieChart>
                    </ResponsiveContainer>
                ) : ( <div className="flex items-center justify-center h-full text-sm text-light-text-secondary dark:text-dark-text-secondary">Awaiting OS data from hosts...</div> )}
            </div>
        </div>
    );
};
export default OSDistributionChart;