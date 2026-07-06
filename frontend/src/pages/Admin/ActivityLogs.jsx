import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { History, Search, Inbox } from 'lucide-react';
import toast from 'react-hot-toast';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = '';
      if (actionFilter) query = `?action=${actionFilter}`;
      const response = await api.get(`/admin/activity-logs${query}`);
      if (response.data.success) {
        setLogs(response.data.logs);
      }
    } catch (err) {
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  const actions = ['login', 'logout', 'register', 'upload', 'download', 'upvote', 'approve', 'reject', 'delete'];

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Activity Audit Trail</h1>
        <p className="text-xs text-gray-550 dark:text-gray-400 mt-1">Audit log records representing student actions and moderation logs.</p>
      </div>

      {/* Filter Options */}
      <div className="flex gap-4">
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-700 dark:text-gray-350 focus:outline-none"
        >
          <option value="">All Actions</option>
          {actions.map(act => (
            <option key={act} value={act}>{act.toUpperCase()}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingSpinner size="md" />
      ) : logs.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl space-y-3">
          <div className="flex justify-center">
            <History className="w-12 h-12 text-gray-300 dark:text-gray-750" />
          </div>
          <p className="text-xs text-gray-500">No logs found matching selection.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-955/50 border-b border-gray-150 dark:border-gray-850 text-gray-500 dark:text-gray-400 font-bold uppercase">
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">IP / User Agent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {logs.map(log => (
                  <tr key={log._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10">
                    <td className="p-4 font-bold text-gray-850 dark:text-gray-250">
                      {log.user ? log.user.name : 'Guest Client'}
                      {log.user && <p className="text-[9px] text-gray-450 font-normal mt-0.5">{log.user.email}</p>}
                    </td>
                    <td className="p-4 uppercase text-[9px] font-bold text-gray-450">
                      {log.user ? log.user.role : 'Guest'}
                    </td>
                    <td className="p-4">
                      <span className="bg-gray-100 dark:bg-gray-850 text-gray-700 dark:text-gray-300 font-bold px-2 py-0.5 rounded-lg text-[9px] uppercase tracking-wide">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 dark:text-gray-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 text-gray-450 dark:text-gray-500 truncate max-w-xs" title={log.userAgent}>
                      {log.ip || '0.0.0.0'} • {log.userAgent || 'Unknown Browser'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default ActivityLogs;
