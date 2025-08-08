// src/components/charts/LiveThroughputChart.js

import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const useLiveData = (maxPoints = 30) => {
  const [data, setData] = useState(Array.from({ length: maxPoints }, (_, i) => ({ time: new Date(Date.now() - (maxPoints - i) * 1500).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), in: Math.floor(Math.random() * 50) + 10, out: Math.floor(Math.random() * 40) + 5, })));
  useEffect(() => { const interval = setInterval(() => { setData(currentData => { const newDataPoint = { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), in: Math.floor(Math.random() * 200) + 50, out: Math.floor(Math.random() * 150) + 30, }; const updatedData = [...currentData, newDataPoint]; return updatedData.length > maxPoints ? updatedData.slice(1) : updatedData; }); }, 1500); return () => clearInterval(interval); }, [maxPoints]);
  return data;
};

const CustomTooltip = ({ active, payload, label, colors }) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-3 bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-lg shadow-lg">
                <p className="label font-semibold text-sm text-light-text dark:text-dark-text">{`${label}`}</p>
                <p className="intro" style={{ color: colors.in }}>{`Ingress : ${payload[0].value.toFixed(2)} Mbps`}</p>
                <p className="intro" style={{ color: colors.out }}>{`Egress : ${payload[1].value.toFixed(2)} Mbps`}</p>
            </div>
        );
    }
    return null;
};

const LiveThroughputChart = () => {
  const liveData = useLiveData();
  // THE FIX: Get colors and theme state directly from our centralized hook
  const { theme, chartColors } = useTheme();

  // No longer use local colors; assign from the theme.
  const [inColor, outColor] = chartColors.liveThroughput;

  return (
    <div className="h-full w-full flex flex-col">
      <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-1">Live Network Throughput</h3>
      <div className="w-full flex-grow pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={liveData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`colorIn-${theme}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={inColor} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={inColor} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id={`colorOut-${theme}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={outColor} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={outColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="time" stroke={chartColors.textColor} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis stroke={chartColors.textColor} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} unit=" M" />
            <CartesianGrid strokeDasharray="1 5" stroke={chartColors.gridColor} />
            <Tooltip content={<CustomTooltip colors={{ in: inColor, out: outColor }} />} />
            <Area type="monotone" dataKey="in" stroke={inColor} strokeWidth={2} fillOpacity={1} fill={`url(#colorIn-${theme})`} />
            <Area type="monotone" dataKey="out" stroke={outColor} strokeWidth={2} fillOpacity={1} fill={`url(#colorOut-${theme})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
export default LiveThroughputChart;