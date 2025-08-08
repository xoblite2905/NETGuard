// src/components/charts/RiskSourceChart.js

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const data = [ { country: 'US', risk: 4 }, { country: 'BR', risk: 8 }, { country: 'UA', risk: 12 }, { country: 'VN', risk: 5 }, { country: 'FR', risk: 3 }];

const CustomTooltip = ({ active, payload }) => { /* ... unchanged ... */ };

const RiskSourceChart = () => {
    // THE FIX: Get colors directly from our centralized hook
    const { chartColors } = useTheme();
    const [color1, color2] = chartColors.protocolDistribution;
    const highlightColor = chartColors.highlight;

    // A clean, theme-aware color palette
    const themeColors = [color1, color1, highlightColor, color2, color2];

    return (
        <div className="h-full w-full">
           <h3 className="text-lg font-semibold text-light-text dark:text-dark-text">Threat Origins</h3>
           <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-2">New High-Risk IPs by Country</p>
           <div className="w-full h-28">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="country" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: chartColors.textColor }} width={30} />
                        <Tooltip cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }} content={<CustomTooltip />} />
                        <Bar dataKey="risk" background={{ fill: 'rgba(128, 128, 128, 0.1)' }} radius={[0, 4, 4, 0]}>
                           {data.map((entry, index) => (<Cell key={`cell-${index}`} fill={themeColors[index % themeColors.length]} />))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
           </div>
        </div>
    );
};
export default RiskSourceChart;