
import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  label: string;
  colorClass: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, label, colorClass }) => {
  const percentage = Math.min(100, Math.max(0, value));

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{percentage.toFixed(0)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div
          className={`${colorClass} h-2.5 rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
