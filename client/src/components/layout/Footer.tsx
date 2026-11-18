import React from 'react';
import { Link } from 'react-router';
import { FileText, Heart } from 'lucide-react';
import { ATS_DISCLAIMER } from '@smartresume/shared';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <FileText className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-gray-900">SmartResume AI</span>
            </div>
            <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
              Empowering students and job-seekers to craft verified, ATS-friendly resumes, optimize with transparent heuristic scoring, and land more technical interviews.
            </p>
            <p className="text-[11px] text-gray-400 italic">
              {ATS_DISCLAIMER}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Product</h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li><Link to="/templates" className="hover:text-indigo-600">Resume Templates</Link></li>
              <li><Link to="/ats" className="hover:text-indigo-600">ATS Resume Checker</Link></li>
              <li><Link to="/job-match" className="hover:text-indigo-600">Job Description Matcher</Link></li>
              <li><Link to="/assistant" className="hover:text-indigo-600">AI Assistant</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Account</h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li><Link to="/register" className="hover:text-indigo-600">Create Free Account</Link></li>
              <li><Link to="/login" className="hover:text-indigo-600">Sign In</Link></li>
              <li><Link to="/dashboard" className="hover:text-indigo-600">User Dashboard</Link></li>
              <li><Link to="/settings" className="hover:text-indigo-600">Settings & Privacy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400 gap-4">
          <p>© {new Date().getFullYear()} SmartResume AI. B.Tech CSE Mini Project.</p>
          <div className="flex items-center gap-1 text-[11px]">
            <span>Engineered with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>for engineering students everywhere</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
