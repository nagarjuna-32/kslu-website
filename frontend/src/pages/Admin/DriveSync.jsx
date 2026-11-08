import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  RefreshCw, CheckCircle2, AlertTriangle, 
  XCircle, Clock, FileCheck, FilePlus, FileX, 
  FolderTree, Info, ShieldAlert, Sparkles, ExternalLink 
} from 'lucide-react';
import toast from 'react-hot-toast';

const DriveSync = () => {
  const [syncStatus, setSyncStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [syncType, setSyncType] = useState('full'); // 'full' | 'incremental'

  const pollIntervalRef = useRef(null);

  // Fetch status from /api/admin/pyqs/sync-status
  const fetchStatus = async () => {
    try {
      const res = await api.get('/admin/pyqs/sync-status');
      if (res.data.success) {
        setSyncStatus(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch sync status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    // Cleanup interval on unmount
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // Poll status while isRunning is true
  useEffect(() => {
    if (syncStatus?.isRunning) {
      if (!pollIntervalRef.current) {
        pollIntervalRef.current = setInterval(async () => {
          try {
            const res = await api.get('/admin/pyqs/sync-status');
            if (res.data.success) {
              setSyncStatus(res.data);
              if (!res.data.isRunning) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
                toast.success('Google Drive synchronization completed!');
              }
            }
          } catch (e) {
            console.error('Polling error:', e);
          }
        }, 3000);
      }
    } else {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }
  }, [syncStatus?.isRunning]);

  // Trigger sync
  const handleTriggerSync = async () => {
    if (syncStatus?.isRunning || triggering) {
      return toast.error('A synchronization process is already actively running.');
    }

    setTriggering(true);
    try {
      const res = await api.post('/admin/pyqs/sync', { syncType });
      if (res.data.success) {
        toast.success(res.data.message || 'Synchronization initiated in background.');
        // Refresh status immediately
        await fetchStatus();
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to trigger sync';
      toast.error(msg);
    } finally {
      setTriggering(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  const isRunning = Boolean(syncStatus?.isRunning || triggering);
  const latestLog = syncStatus?.latestLog;
  const stats = syncStatus?.stats || {};

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/15 text-secondary text-xs font-black uppercase tracking-wider mb-2">
            <FolderTree className="w-3.5 h-3.5" />
            <span>Google Drive PYQ Synchronization Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Question Paper Sync
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xl">
            Synchronize university question papers directly from the official Google Drive repository into Neon PostgreSQL.
          </p>
        </div>

        {/* Live Status Badge */}
        <div className={`self-start sm:self-auto flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold ${
          isRunning 
            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 animate-pulse'
            : latestLog?.status === 'completed'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
              : latestLog?.status === 'failed'
                ? 'bg-red-500/10 text-red-500 border-red-500/30'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
        }`}>
          {isRunning ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Sync In Progress...</span>
            </>
          ) : latestLog?.status === 'completed' ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Ready & Synchronized</span>
            </>
          ) : latestLog?.status === 'failed' ? (
            <>
              <XCircle className="w-3.5 h-3.5" />
              <span>Last Sync Failed</span>
            </>
          ) : (
            <span>Ready for Sync</span>
          )}
        </div>
      </div>

      {/* Sync Control & Action Panel */}
      <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="text-base font-black text-gray-900 dark:text-white">Trigger Synchronization</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Choose the sync scope and initiate a background scan against the configured Google Drive folder.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Sync Type Selector */}
            <div className="inline-flex rounded-xl p-1 bg-gray-100 dark:bg-gray-800 text-xs font-bold">
              <button
                type="button"
                disabled={isRunning}
                onClick={() => setSyncType('full')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  syncType === 'full'
                    ? 'bg-white dark:bg-gray-900 text-primary dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                Full Scan
              </button>
              <button
                type="button"
                disabled={isRunning}
                onClick={() => setSyncType('incremental')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  syncType === 'incremental'
                    ? 'bg-white dark:bg-gray-900 text-primary dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                Incremental
              </button>
            </div>

            {/* Sync Action Button */}
            <button
              onClick={handleTriggerSync}
              disabled={isRunning}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all shadow-md ${
                isRunning
                  ? 'bg-gray-300 dark:bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-secondary hover:bg-secondary-dark text-primary cursor-pointer active:scale-95'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'Syncing Drive...' : 'Sync Google Drive Now'}</span>
            </button>
          </div>
        </div>

        {/* Global Catalog Stats Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-850/60 border border-gray-150 dark:border-gray-800">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Available PYQs</span>
            <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">
              {stats.availablePYQs || 0} <span className="text-xs font-bold text-gray-400">PDFs</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-850/60 border border-gray-150 dark:border-gray-800">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Tracked Courses</span>
            <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">
              {stats.totalCourses || 0} <span className="text-xs font-bold text-gray-400">Programs</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-850/60 border border-gray-150 dark:border-gray-800">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Mapped Subjects</span>
            <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">
              {stats.totalSubjects || 0} <span className="text-xs font-bold text-gray-400">Modules</span>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Sync Report */}
      {latestLog && (
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
            <div>
              <h3 className="text-base font-black text-gray-900 dark:text-white">Last Synchronization Report</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Completed on {formatDate(latestLog.completedAt || latestLog.startedAt)}
              </p>
            </div>
            <span className={`text-[11px] font-black uppercase px-2.5 py-1 rounded-lg ${
              latestLog.status === 'completed' 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                : latestLog.status === 'running'
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : 'bg-red-500/10 text-red-500'
            }`}>
              {latestLog.status} ({latestLog.syncType})
            </span>
          </div>

          {/* Sync Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Files Scanned</span>
                <p className="text-lg font-black text-gray-900 dark:text-white">{latestLog.filesFound || 0}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
                <FilePlus className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Newly Imported</span>
                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{latestLog.filesImported || 0}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center flex-shrink-0">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Updated</span>
                <p className="text-lg font-black text-gray-900 dark:text-white">{latestLog.filesUpdated || 0}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
                <FileX className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Unavailable</span>
                <p className="text-lg font-black text-amber-600 dark:text-amber-400">{latestLog.filesUnavailable || 0}</p>
              </div>
            </div>
          </div>

          {/* Sync Errors display if any */}
          {latestLog.errorsCount > 0 && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 space-y-2">
              <div className="flex items-center gap-2 text-red-500 text-xs font-black">
                <AlertTriangle className="w-4 h-4" />
                <span>Encountered {latestLog.errorsCount} non-fatal error(s) during last scan:</span>
              </div>
              <p className="text-xs text-red-600 dark:text-red-400 font-mono whitespace-pre-wrap leading-relaxed">
                {latestLog.errorDetails || 'See backend Winston logs for stack traces.'}
              </p>
            </div>
          )}

          {/* Initiated by footer */}
          <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
            <span>Started: {formatDate(latestLog.startedAt)}</span>
            {latestLog.triggeredBy && (
              <span>Triggered by: <strong>{latestLog.triggeredBy.name}</strong> ({latestLog.triggeredBy.email})</span>
            )}
          </div>
        </div>
      )}

      {/* Configuration & Architecture Guidance Card */}
      <div className="p-6 rounded-3xl bg-royal/5 dark:bg-secondary/5 border border-royal/10 dark:border-secondary/15 space-y-3">
        <div className="flex items-center gap-2 text-royal dark:text-secondary text-xs font-black uppercase">
          <Info className="w-4 h-4" />
          <span>Expected Google Drive Folder Hierarchy</span>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
          The synchronization engine expects your Google Drive folder structure to follow this convention:
        </p>
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-950 font-mono text-xs text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 leading-relaxed overflow-x-auto">
          <div>📁 KSLU CIRCLE – PYQs (Root Folder)</div>
          <div className="pl-4">└── 📁 3-Year LL.B / B.A. LL.B / B.B.A. LL.B (Course)</div>
          <div className="pl-8">└── 📁 Semester 1 .. 10 (Semester)</div>
          <div className="pl-12">└── 📁 Constitutional Law - I (Subject)</div>
          <div className="pl-16">├── 📁 Scheme 80 Marks / Scheme 100 Marks (Scheme)</div>
          <div className="pl-20">└── 📄 Dec_2022.pdf (Question Paper PDF)</div>
        </div>
        <p className="text-[11px] text-gray-500">
          * Ensure your Service Account email has <strong>Viewer</strong> access to the root folder, and that <code className="font-mono text-royal dark:text-secondary">GOOGLE_DRIVE_PYQ_ROOT_FOLDER_ID</code> is configured in backend environment variables.
        </p>
      </div>
    </div>
  );
};

export default DriveSync;
