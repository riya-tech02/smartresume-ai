import React from 'react';
import { Sidebar } from './Sidebar.js';
import { Topbar } from './Topbar.js';
import { MobileNav } from './MobileNav.js';
import { ToastContainer } from '../ui/Toast.js';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <Topbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
      <MobileNav />
      <ToastContainer />
    </div>
  );
}
