import React from 'react';
import { 
  FileText, Download, Eye, Calendar, Award, 
  BookOpen, Sparkles, ArrowUpRight 
} from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return 'PDF Document';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const PyqCard = ({ paper, onPreview }) => {
  const downloadUrl = `${api.defaults.baseURL}/pyqs/${paper.id}/download`;

  const handleDownloadClick = (e) => {
    e.stopPropagation();
    window.open(downloadUrl, '_blank');
    toast.success('Starting file download...');
  };

  return (
    <div
      onClick={() => onPreview(paper)}
      className="group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-royal/50 dark:hover:border-secondary/50 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between cursor-pointer"
    >
      {/* Top Meta Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-royal/10 dark:bg-secondary/15 text-royal dark:text-secondary flex items-center justify-center transition-transform group-hover:scale-105">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-wider uppercase text-royal dark:text-secondary block">
                {paper.course?.name || 'KSLU Law'}
              </span>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {paper.semester?.name || `Semester ${paper.semester?.semesterNumber || ''}`}
              </span>
            </div>
          </div>

          {/* Marks Scheme Badge */}
          {paper.marks && (
            <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-lg border ${
              paper.marks === 80
                ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/40'
                : 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/40'
            }`}>
              <Award className="w-3 h-3" />
              {paper.marks} Marks
            </span>
          )}
        </div>

        {/* Paper Title */}
        <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-royal dark:group-hover:text-secondary transition-colors line-clamp-2 leading-snug">
          {paper.title || paper.fileName}
        </h3>

        {/* Subject Line */}
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
          {paper.subject?.name}
          {paper.subject?.code && (
            <span className="ml-1 text-[10px] font-bold text-slate-400 dark:text-slate-500">
              ({paper.subject.code})
            </span>
          )}
        </p>
      </div>

      {/* Badges & Metrics Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-2">
          {/* Examination Year */}
          {paper.examYear ? (
            <span className="inline-flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md">
              <Calendar className="w-3 h-3 text-royal dark:text-secondary" />
              {paper.examSession ? `${paper.examSession} ` : ''}{paper.examYear}
            </span>
          ) : (
            <span className="text-[10px] text-slate-400 dark:text-slate-500">Question Paper</span>
          )}

          {/* File Size */}
          <span className="text-[10px] font-medium text-slate-400">
            {formatFileSize(paper.fileSize)}
          </span>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => onPreview(paper)}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-royal dark:text-secondary" />
            <span>Preview</span>
          </button>

          <button
            onClick={handleDownloadClick}
            className="py-2 px-3 rounded-xl bg-royal dark:bg-secondary text-white dark:text-primary hover:opacity-90 font-bold text-xs flex items-center justify-center gap-1 transition-all shadow-sm"
            title="Download PDF file"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PyqCard;
