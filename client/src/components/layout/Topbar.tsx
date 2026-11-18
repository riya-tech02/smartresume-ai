import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '../../store/authStore.js';
import { api } from '../../lib/api.js';
import { LogOut, User as UserIcon, Shield, ChevronDown } from 'lucide-react';

export function Topbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      clearAuth();
      navigate('/login');
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-bold text-gray-800">
          Welcome back, {user?.name || 'User'}
        </h2>
      </div>

      {/* User Menu */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-gray-100 transition-colors select-none"
        >
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-200">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold text-gray-900 leading-none">{user?.name}</span>
            <span className="text-[10px] text-gray-500 truncate max-w-[140px] mt-0.5">{user?.email}</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </button>

        {dropdownOpen && (
          <div
            className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
            onClick={() => setDropdownOpen(false)}
          >
            <div className="px-3 py-2 border-b border-gray-100 text-xs text-gray-500">
              Signed in as <br />
              <strong className="text-gray-900 truncate block">{user?.email}</strong>
            </div>

            <button
              onClick={() => navigate('/settings')}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Account Settings</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
