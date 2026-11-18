import React from 'react';
import { cn } from '../../lib/cn.js';

export interface ProgressRingProps {
  progress: number; // 0-100
  size?: number; // diameter in px
  strokeWidth?: number;
  className?: string;
  showText?: boolean;
}

export function ProgressRing({
  progress,
  size = 36,
  strokeWidth = 3.5,
  className,
  showText = true,
}: ProgressRingProps) {
  const normalizedRadius = (size - strokeWidth * 2) / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, progress)) / 100) * circumference;

  const colorClass =
    progress >= 80 ? 'text-emerald-500' : progress >= 50 ? 'text-amber-500' : 'text-indigo-600';

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg height={size} width={size} className="transform -rotate-90">
        <circle
          stroke="#E5E7EB"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          className={cn('transition-all duration-500 ease-out', colorClass)}
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {showText && (
        <span className="absolute text-[10px] font-bold text-gray-700">
          {Math.round(progress)}%
        </span>
      )}
    </div>
  );
}
