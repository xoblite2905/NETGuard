// src/components/charts/SecurityPostureGauge.js

import React, { useContext } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import ThemeContext from '../../context/ThemeContext';

const SecurityPostureGauge = ({ value }) => {
  const { theme } = useContext(ThemeContext);
  const data = [
    { name: 'Score', value: value },
    { name: 'Remaining', value: 100 - value },
  ];
  const scoreColor = theme === 'dark' ? 'text-accent-cyan' : 'text-light-chart-1';
  const scoreLabel = theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary';
  
  return (
    <div className="h-full w-full flex flex-col">
      <h3 className="text-lg font-semibold text-light-text dark:text-dark-text text-center">Security Posture</h3>
      
      <div className="w-full flex-grow relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              <linearGradient id="darkScoreGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#00FFFF" />
                <stop offset="60%" stopColor="#EE7200" />
                <stop offset="100%" stopColor="#F43F5E" />
              </linearGradient>
              <linearGradient id="lightScoreGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#5E1B8A" />
                <stop offset="100%" stopColor="#C51383" />
              </linearGradient>
            </defs>
            <Pie data={data} cx="50%" cy="50%" innerRadius="70%" outerRadius="90%" startAngle={90} endAngle={-270} dataKey="value" stroke="none">
              <Cell fill={theme === 'dark' ? "url(#darkScoreGradient)" : "url(#lightScoreGradient)"} />
              <Cell fill={theme === 'dark' ? "rgba(128, 128, 128, 0.15)" : "rgba(229, 231, 235, 1)"} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <span className={`text-4xl font-bold ${scoreColor} tracking-tighter`}>{value}%</span>
          <span className={`text-xs ${scoreLabel} -mt-1`}>HEALTH SCORE</span>
        </div>
      </div>
    </div>
  );
};

export default SecurityPostureGauge;
