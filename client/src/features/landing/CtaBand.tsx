import React from 'react';
import { Link } from 'react-router';
import { Button } from '../../components/ui/Button.js';
import { ArrowRight, Sparkles } from 'lucide-react';

export function CtaBand() {
  return (
    <section className="py-20 bg-indigo-600 text-white relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold border border-white/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Free for Students & Job Seekers</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Ready to Build Your Verified ATS-Friendly Resume?
        </h2>

        <p className="text-sm sm:text-base text-indigo-100 max-w-xl mx-auto leading-relaxed">
          Produce a clean, honest, job-tailored resume in under 15 minutes. No paywalls, no credit cards, no fake credentials.
        </p>

        <div className="pt-2">
          <Link to="/register">
            <Button
              size="lg"
              className="bg-white text-indigo-700 hover:bg-gray-100 font-bold px-8 shadow-xl"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Get Started for Free
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
