import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  Users, UploadCloud, ShieldAlert, Download, 
  ArrowRight, ShieldCheck, History, UserCheck 
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/dashboard');
      if (response.data.success) {
        setStats(response.data.stats);
        setPending(response.data.recentPending);
        setLogs(response.data.recentLogs);
      }
    } catch (err) {
      toast.error('Failed to load admin stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-8">
      
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Summary metrics and moderation updates.</p>
      </div>

      {/* Counters Grid */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Registrations', value: stats.totalUsers, icon: <Users className="w-5 h-5 text-blue-500" />, bg: 'bg-blue-50 dark:bg-blue-950/20' },
            { label: 'Uploaded Materials', value: stats.totalUploads, icon: <UploadCloud className="w-5 h-5 text-indigo-500" />, bg: 'bg-indigo-50 dark:bg-indigo-950/20' },
            { label: 'Downloads Served', value: stats.totalDownloads, icon: <Download className="w-5 h-5 text-emerald-500" />, bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
            { label: 'Pending Moderation', value: stats.pendingUploads, icon: <ShieldAlert className="w-5 h-5 text-amber-500" />, bg: 'bg-amber-50 dark:bg-amber-950/20', alert: stats.pendingUploads > 0 },
          ].map((card) => (
            <div 
              key={card.label} 
              className={`bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-5 flex items-center justify-between shadow-sm ${
                card.alert ? 'ring-2 ring-amber-550 dark:ring-amber-500/50' : ''
              }`}
            >
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{card.label}</p>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-none">{card.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${card.bg}`}>{card.icon}</div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Navigation Panels split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Pending Verification Queue */}
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-amber-550" /> Pending Verification ({pending.length})
            </h3>
            <Link to="/admin/moderation" className="text-xs font-bold text-secondary flex items-center gap-0.5 hover:underline">
              Moderation Page <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {pending.length === 0 ? (
            <p className="text-xs text-gray-500 py-6 text-center">Moderation queue currently empty.</p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800/60">
              {pending.map(item => (
                <div key={item._id} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-gray-800 dark:text-gray-250 truncate max-w-[200px]" title={item.title}>{item.title}</p>
                    <p className="text-[10px] text-gray-450 dark:text-gray-550 mt-0.5 uppercase">
                      {item.type} • {item.subjectCode}
                    </p>
                  </div>
                  <span className="text-[9px] font-semibold text-gray-500 bg-gray-50 dark:bg-gray-850 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-800">
                    Uploaded: {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity Audit Log feed */}
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-5 h-5 text-gray-400" /> Recent Activity Feed
            </h3>
            <Link to="/admin/logs" className="text-xs font-bold text-secondary flex items-center gap-0.5 hover:underline">
              Audit Logs <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {logs.length === 0 ? (
            <p className="text-xs text-gray-500 py-6 text-center">No system activities logged recently.</p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800/60">
              {logs.map(log => (
                <div key={log._id} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-gray-850 dark:text-gray-250">{log.user?.name || 'Guest'}</span>{' '}
                    <span className="text-gray-500 dark:text-gray-450">performed</span>{' '}
                    <span className="bg-gray-100 dark:bg-gray-850 text-gray-650 dark:text-gray-350 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                      {log.action}
                    </span>
                  </div>
                  <span className="text-[9px] text-gray-450 dark:text-gray-500">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
