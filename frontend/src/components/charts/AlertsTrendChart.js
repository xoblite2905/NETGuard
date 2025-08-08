// src/components/charts/AlertsTrendChart.js

import React from 'react';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const data = Array.from({ length: 12 }, (_, i) => ({
  name: `${i * 5}m ago`,
  alerts: Math.floor(Math.random() * (i % 5 === 0 ? 20 : 5))
}));
data[11].alerts = 12;

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 bg-light-card/90 dark:bg-dark-card/90 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-lg">
                <p className="text-sm text-light-text dark:text-dark-text">{`${payload[0].value} Alerts`}</p>
            </div>
        );
    }
    return null;
};

// IMPROVEMENT: Component now correctly handles the `minimal` prop
const AlertsTrendChart = ({ minimal = false }) => {
  const { chartColors } = useTheme();
  const alertColor = chartColors.alerts;

  return (
    <div className="h-full w-full">
      {/* Hide title section if `minimal` is true */}
      {!minimal && (
        <div className="flex justify-between items-center mb-1">
          <div>
            <h3 className="text-lg font-semibold text-light-text dark:text-dark-text">Active Alerts</h3>
            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Last 60 minutes</p>
          </div>
          <p className="text-3xl font-bold" style={{ color: alertColor }}>12</p>
        </div>
      )}
      <div className={minimal ? "w-full h-full" : "w-full h-24"}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="alertGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={alertColor} stopOpacity={0.7}/>
                <stop offset="95%" stopColor={alertColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: alertColor, strokeWidth: 1, strokeDasharray: '3 3' }}/>
            <Area type="monotone" dataKey="alerts" stroke={alertColor} strokeWidth={2} fill="url(#alertGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AlertsTrendChart;