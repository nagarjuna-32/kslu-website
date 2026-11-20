import React from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';

/**
 * UpdateAnnouncementBanner
 * Temporary site-wide announcement banner displayed at the top across all pages.
 * Easily removed or toggled once the Notes & PYQ library updates are completed.
 */
const UpdateAnnouncementBanner = () => {
  return (
    <div 
      role="region" 
      aria-label="Website Update Announcement"
      className="relative z-50 bg-slate-900 text-white border-b border-amber-500/30 shadow-sm"
    >
      {/* Subtle gold glow accent */}
      <div 
        aria-hidden="true" 
        className="absolute inset-0 bg-gradient-to-r from-royal/40 via-amber-500/10 to-royal/40 pointer-events-none" 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 relative z-10">
        <div className="flex flex-col md:flex-row items-center md:items-start lg:items-center justify-between gap-3 text-center md:text-left">
          
          {/* Badge & Icon */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-amber-400/15 text-secondary border border-amber-400/30 shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-secondary animate-pulse" />
            </span>
            <span className="text-xs sm:text-xs font-black tracking-wider text-secondary uppercase bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
              WE'RE WORKING ON SOMETHING BETTER!
            </span>
          </div>

          {/* Exact Message Body */}
          <div className="flex-1 text-xs sm:text-sm text-slate-200 leading-relaxed max-w-4xl space-y-0.5">
            <p className="font-semibold text-white">
              We're currently updating our Notes and Previous Year Question Papers (PYQs) library.
            </p>
            <p className="text-slate-300 text-xs sm:text-xs">
              New study materials and question papers will be available soon. Thank you for your patience and continued support!
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UpdateAnnouncementBanner;
