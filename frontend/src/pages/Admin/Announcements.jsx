import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Megaphone, Trash2, Calendar, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      type: 'info',
      isGlobal: true,
      isActive: true
    }
  });

  const fetchAnnouncements = async () => {
    try {
      const response = await api.get('/admin/announcements');
      if (response.data.success) {
        setAnnouncements(response.data.announcements);
      }
    } catch (err) {
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const response = await api.post('/admin/announcements', {
        title: data.title,
        content: data.content,
        type: data.type,
        isGlobal: !!data.isGlobal,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null
      });

      if (response.data.success) {
        toast.success('System announcement published!');
        reset();
        fetchAnnouncements();
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (item) => {
    try {
      const response = await api.put(`/admin/announcements/${item._id}`, {
        isActive: !item.isActive
      });
      if (response.data.success) {
        setAnnouncements(prev => prev.map(a => 
          a._id === item._id ? { ...a, isActive: response.data.announcement.isActive } : a
        ));
        toast.success(`Announcement ${!item.isActive ? 'activated' : 'deactivated'}`);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement permanently?')) return;
    try {
      const response = await api.delete(`/admin/announcements/${id}`);
      if (response.data.success) {
        setAnnouncements(prev => prev.filter(a => a._id !== id));
        toast.success('Announcement deleted');
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">System Alerts & Banners</h1>
        <p className="text-xs text-gray-550 dark:text-gray-400 mt-1">Broadcast system announcements and notify students.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Creation Form (Col-Span-1) */}
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 space-y-5 shadow-sm h-fit">
          <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-gray-850 pb-3">Create Alert Banner</h3>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Banner Title</label>
              <input
                type="text"
                {...register('title', { required: true })}
                placeholder="e.g. Server Maintenance Notice"
                className="w-full bg-white dark:bg-gray-950 border border-gray-250 dark:border-gray-700 rounded-xl px-4 py-2.5 text-xs text-gray-950 dark:text-white focus:outline-none focus:border-secondary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Announcement Content</label>
              <textarea
                rows={3}
                {...register('content', { required: true })}
                placeholder="e.g. The database will be offline on July 10 between 2AM and 4AM for routine tuning..."
                className="w-full bg-white dark:bg-gray-950 border border-gray-250 dark:border-gray-700 rounded-xl px-4 py-2.5 text-xs text-gray-950 dark:text-white focus:outline-none focus:border-secondary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Alert Type</label>
                <select
                  {...register('type')}
                  className="w-full bg-white dark:bg-gray-955 border border-gray-250 dark:border-gray-700 rounded-xl px-2 py-2.5 text-xs text-gray-700 dark:text-gray-350 focus:outline-none focus:border-secondary"
                >
                  <option value="info">💡 Information</option>
                  <option value="success">✅ Success</option>
                  <option value="warning">⚠️ Warning</option>
                  <option value="urgent">🚨 Urgent Alert</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Expiry Date</label>
                <input
                  type="date"
                  {...register('expiresAt')}
                  className="w-full bg-white dark:bg-gray-955 border border-gray-250 dark:border-gray-700 rounded-xl px-2 py-2.5 text-xs text-gray-700 dark:text-gray-350 focus:outline-none focus:border-secondary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-primary dark:bg-secondary text-white dark:text-primary font-bold rounded-xl text-xs hover:bg-secondary dark:hover:bg-secondary-dark transition-colors disabled:opacity-50"
            >
              {submitting ? 'Publishing Alert...' : 'Publish Announcement'}
            </button>

          </form>
        </div>

        {/* Announcements List (Col-Span-2) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">Alerts History</h3>
          
          {announcements.length === 0 ? (
            <div className="text-center py-10 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl text-xs text-gray-550">
              No alert banners logged in history.
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((item) => (
                <div 
                  key={item._id}
                  className={`bg-white dark:bg-gray-900 border rounded-3xl p-5 shadow-sm flex justify-between items-start gap-4 transition-all ${
                    !item.isActive 
                      ? 'border-gray-200 dark:border-gray-850 opacity-60' 
                      : item.type === 'urgent'
                        ? 'border-red-300 dark:border-red-900/40 ring-1 ring-red-500/10'
                        : item.type === 'warning'
                          ? 'border-amber-300 dark:border-amber-900/40'
                          : 'border-gray-150 dark:border-gray-800'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide ${
                        item.type === 'urgent'
                          ? 'bg-red-550 text-white'
                          : item.type === 'warning'
                            ? 'bg-amber-500 text-white'
                            : item.type === 'success'
                              ? 'bg-emerald-500 text-white'
                              : 'bg-blue-500 text-white'
                      }`}>
                        {item.type}
                      </span>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white">{item.title}</h4>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5 leading-relaxed">{item.content}</p>
                    
                    {item.expiresAt && (
                      <span className="inline-flex items-center gap-1 text-[9px] text-gray-400 mt-2 font-semibold">
                        <Calendar className="w-3 h-3" /> Expires: {new Date(item.expiresAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleActive(item)}
                      className="p-1 text-gray-400 hover:text-secondary"
                      title={item.isActive ? 'Deactivate banner' : 'Activate banner'}
                    >
                      {item.isActive ? (
                        <ToggleRight className="w-6 h-6 text-emerald-500" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-gray-450" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-1 text-gray-400 hover:text-red-500"
                      title="Delete alert"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default Announcements;
