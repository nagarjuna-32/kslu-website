import React, { useState } from 'react';
import { 
  X, Download, ExternalLink, FileText, AlertCircle, 
  Maximize2, Minimize2, Calendar, Award 
} from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const PyqPdfModal = ({ paper, isOpen, onClose }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [loading, setLoading] = useState(true);

  if (!isOpen || !paper) return null;

  const previewUrl = `${api.defaults.baseURL}/pyqs/${paper.id}/preview`;
  const downloadUrl = `${api.defaults.baseURL}/pyqs/${paper.id}/download`;

  const handleDownload = () => {
    try {
      window.open(downloadUrl, '_blank');
      toast.success('Starting PDF download...');
    } catch (err) {
      toast.error('Failed to initiate download');
    }
  };

  const handleOpenExternal = () => {
    window.open(previewUrl, '_blank');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isFullScreen 
            ? 'w-full h-full rounded-none' 
            : 'w-full max-w-5xl h-[92vh] max-h-[850px]'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <div className="w-9 h-9 rounded-xl bg-royal/10 dark:bg-secondary/15 text-royal dark:text-secondary flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
                {paper.title || paper.fileName}
              </h3>
              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                <span>{paper.subject?.name || paper.course?.name}</span>
                {paper.examYear && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 font-bold text-royal dark:text-secondary">
                      <Calendar className="w-3 h-3" />
                      {paper.examSession ? `${paper.examSession} ` : ''}{paper.examYear}
                    </span>
                  </>
                )}
                {paper.marks && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <Award className="w-3 h-3" />
                      {paper.marks} Marks
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <button
              onClick={handleOpenExternal}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-royal dark:hover:text-secondary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-bold transition-colors hidden sm:flex items-center gap-1.5"
              title="Open in new window"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="text-[11px]">New Tab</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-royal dark:bg-secondary text-white dark:text-primary hover:opacity-90 rounded-xl text-xs font-bold transition-all shadow-sm"
              title="Download PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors hidden md:block"
              title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Viewer Body */}
        <div className="flex-1 bg-slate-100 dark:bg-slate-950 relative overflow-hidden">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-950/80 z-10 backdrop-blur-xs">
              <div className="w-10 h-10 border-4 border-royal dark:border-secondary border-t-transparent rounded-full animate-spin" />
              <p className="mt-3 text-xs font-bold text-slate-600 dark:text-slate-400">Loading Question Paper...</p>
            </div>
          )}

          {hasError ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h4 className="text-base font-black text-slate-900 dark:text-white">Unable to display PDF preview</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
                Your browser may block inline PDF embeds, or the file is temporarily unavailable from Google Drive.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-royal dark:bg-secondary text-white dark:text-primary rounded-xl text-xs font-bold shadow-sm"
                >
                  Download PDF Directly
                </button>
                <button
                  onClick={handleOpenExternal}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
                >
                  Open in New Tab
                </button>
              </div>
            </div>
          ) : (
            <iframe
              src={previewUrl}
              title={paper.title || 'Question Paper'}
              className="w-full h-full border-0"
              onLoad={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setHasError(true);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PyqPdfModal;
