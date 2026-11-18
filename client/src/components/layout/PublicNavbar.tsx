import React from 'react';
import { Link } from 'react-router';
import { Button } from '../ui/Button.js';
import { FileText, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';

export function PublicNavbar() {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:bg-indigo-700 transition-colors">
            <FileText className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight text-gray-900 leading-none">
              SmartResume <span className="text-indigo-600">AI</span>
            </span>
            <span className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase mt-0.5">
              ATS-Optimized Resumes
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-gray-600">
          <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
          <a href="#templates" className="hover:text-indigo-600 transition-colors">Templates</a>
          <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How It Works</a>
          <Link to="/templates" className="hover:text-indigo-600 transition-colors">Gallery</Link>
        </nav>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3">
          {user ? (
            <Link to="/dashboard">
              <Button size="sm" variant="primary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button size="sm" variant="ghost">
                  Sign in
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" variant="primary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Get Started Free
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
