import React from 'react';
import { RefreshCw, Sparkles, BookOpen, FileText } from 'lucide-react';

/**
 * ResourceUpdateNotice
 * Contextual update notice displayed inside the Notes and Papers pages.
 * Informs students that resources are currently being updated while preserving page layout and features.
 */
const ResourceUpdateNotice = ({ resourceType = 'notes' }) => {
  const isNotes = resourceType === 'notes';

  return (
    <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 dark:border-amber-400/20 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-400/10 dark:via-amber-400/5 dark:to-transparent p-5 sm:p-6 shadow-sm">
      {/* Decorative subtle ambient circle */}
      <div 
        aria-hidden="true" 
        className="absolute -right-10 -bottom-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl pointer-events-none" 
      />

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Icon Pill */}
        <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-amber-500/15 dark:bg-amber-400/15 text-amber-600 dark:text-secondary flex items-center justify-center border border-amber-500/25 dark:border-amber-400/25 shadow-inner">
          {isNotes ? (
            <BookOpen className="w-5 h-5" />
          ) : (
            <FileText className="w-5 h-5" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 dark:bg-amber-400/20 text-amber-700 dark:text-amber-300 border border-amber-500/20">
              Library Upgrade In Progress
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-secondary inline" /> Coming Soon
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
            {isNotes 
              ? "We're updating our Law Study Notes & Lecture Guides"
              : "We're updating our Previous Year Question Papers (PYQs) Library"}
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
            {isNotes
              ? "We are currently reviewing and refreshing our notes library with enhanced curriculum summaries and updated study materials. Fresh notes will be available soon. Thank you for your patience and continued support!"
              : "We are currently organizing and updating our question papers repository across 3-Year LL.B, B.A. LL.B, and B.B.A. LL.B (Scheme 80 & 100 Marks). Verified past papers will be available soon. Thank you for your patience and continued support!"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResourceUpdateNotice;
