import React from 'react';
import { Link } from 'react-router';
import { Button } from '../../components/ui/Button.js';
import { FileQuestion, Home } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4 shadow-sm">
        <FileQuestion className="w-8 h-8" />
      </div>
      <span className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">404</span>
      <h1 className="text-lg font-bold text-gray-800 mb-2">Page Not Found</h1>
      <p className="text-xs text-gray-500 max-w-sm mb-6 leading-relaxed">
        The page you are looking for does not exist or has been moved to another location.
      </p>
      <Link to="/dashboard">
        <Button leftIcon={<Home className="w-4 h-4" />}>
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
}
