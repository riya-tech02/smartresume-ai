import React from 'react';
import { cn } from '../../lib/cn.js';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export function Card({ className, hover = false, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden',
        hover && 'hover:shadow-md hover:border-gray-300 transition-all duration-150',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
