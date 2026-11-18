import React from 'react';
import { NavLink } from 'react-router';
import { LayoutDashboard, Palette, CheckCircle, Briefcase, Sparkles, Settings } from 'lucide-react';
import { cn } from '../../lib/cn.js';

export function MobileNav() {
  const tabs = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/templates', label: 'Templates', icon: Palette },
    { to: '/ats', label: 'ATS', icon: CheckCircle },
    { to: '/job-match', label: 'Match', icon: Briefcase },
    { to: '/assistant', label: 'AI', icon: Sparkles },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 flex justify-around items-center h-16 px-1 shadow-lg">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors',
                isActive ? 'text-indigo-600 font-bold' : 'text-gray-500 hover:text-gray-900',
              )
            }
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span>{tab.label}</span>
          </NavLink>
        );
      })}
    </div>
  );
}
