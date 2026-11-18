import React from 'react';
import { NavLink } from 'react-router';
import {
  LayoutDashboard,
  Palette,
  CheckCircle,
  Briefcase,
  Sparkles,
  Settings,
  FileText,
} from 'lucide-react';
import { cn } from '../../lib/cn.js';

export function Sidebar() {
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/templates', label: 'Templates', icon: Palette },
    { to: '/ats', label: 'ATS Analyzer', icon: CheckCircle },
    { to: '/job-match', label: 'Job Matcher', icon: Briefcase },
    { to: '/assistant', label: 'AI Assistant', icon: Sparkles },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-60 bg-white border-r border-gray-200 h-screen sticky top-0 flex-shrink-0 z-30">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <NavLink to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <FileText className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm tracking-tight text-gray-900">
            SmartResume <span className="text-indigo-600">AI</span>
          </span>
        </NavLink>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
          Main Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                )
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info in Sidebar */}
      <div className="p-4 border-t border-gray-100">
        <div className="bg-indigo-50/50 border border-indigo-100/60 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-indigo-700 text-xs font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Honest AI Guarantee</span>
          </div>
          <p className="text-[11px] text-gray-600 leading-tight">
            AI never invents false figures or metrics. You control every edit.
          </p>
        </div>
      </div>
    </aside>
  );
}
