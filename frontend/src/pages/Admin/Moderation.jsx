import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ShieldCheck, Eye, Check, X, AlertOctagon, Inbox } from 'lucide-react';
import toast from 'react-hot-toast';

const Moderation = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/pending');
      if (response.data.success) {
        setMaterials(response.data.materials);
      }
    } catch (err) {
      toast.error('Failed to load pending queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id) => {
    try {
      const response = await api.put(`/admin/materials/${id}/approve`);
      if (response.data.success) {
        setMaterials(prev => prev.filter(m => m._id !== id));
        toast.success('Material approved and published!');
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const triggerRejectModal = (material) => {
    setSelectedMaterial(material);
    setRejectReason('');
    setModalOpen(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      return toast.error('Please enter a rejection reason');
    }
    
    try {
      const response = await api.put(`/admin/materials/${selectedMaterial._id}/reject`, {
        reason: rejectReason
      });
      if (response.data.success) {
        setMaterials(prev => prev.filter(m => m._id !== selectedMaterial._id));
        setModalOpen(false);
        setSelectedMaterial(null);
        toast.success('Upload rejected and uploader notified');
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Moderation Queue</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Review pending files, verify compliance, and approve uploads.</p>
      </div>

      {materials.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl space-y-3">
          <div className="flex justify-center">
            <Inbox className="w-12 h-12 text-gray-300 dark:text-gray-700" />
          </div>
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">Moderation queue empty</h3>
          <p className="text-xs text-gray-450 dark:text-gray-500">All submissions have been reviewed.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-955/50 border-b border-gray-150 dark:border-gray-850 text-gray-500 dark:text-gray-400 font-bold uppercase">
                  <th className="p-4">Resource Details</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Uploader</th>
                  <th className="p-4">Submitted Date</th>
                  <th className="p-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {materials.map(item => (
                  <tr key={item._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10">
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-gray-850 dark:text-gray-250 truncate max-w-[200px]" title={item.title}>{item.title}</p>
                        <span className="inline-block uppercase text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-650 dark:text-gray-350 mt-1">
                          {item.type} • {item.university}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-secondary uppercase">{item.subjectCode}</span>
                      {item.subjectName && (
                        <p className="text-[10px] text-gray-450 dark:text-gray-500 truncate max-w-[150px] mt-0.5">{item.subjectName}</p>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <img 
                          src={item.uploadedBy?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${item.uploadedBy?.name}`} 
                          alt="Uploader" 
                          className="w-6.5 h-6.5 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-bold text-gray-800 dark:text-gray-200 line-clamp-1">{item.uploadedBy?.name}</p>
                          <p className="text-[9px] text-gray-450 dark:text-gray-500 font-semibold">Rep: {item.uploadedBy?.reputation || 0} ⭐</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-500 dark:text-gray-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={item.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 border border-gray-250 dark:border-gray-750 hover:border-secondary dark:text-gray-300 rounded-xl transition-all"
                          title="Preview Document"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleApprove(item._id)}
                          className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors"
                          title="Approve & Publish"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => triggerRejectModal(item)}
                          className="p-2 bg-red-500 hover:bg-red-650 text-white rounded-xl transition-colors"
                          title="Reject"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rejection Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 max-w-md w-full rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
              <AlertOctagon className="w-6 h-6 text-red-500" />
              <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">Reject Submission</h3>
            </div>
            
            <p className="text-xs text-gray-550 dark:text-gray-400 leading-normal">
              Please declare the reason for rejecting <strong>"{selectedMaterial?.title}"</strong>. The student will be notified and can adjust their submission.
            </p>

            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Attached file is blank / contains copyrighted scans / wrong course subject code..."
              className="w-full bg-white dark:bg-gray-950 border border-gray-250 dark:border-gray-700 rounded-xl px-4 py-2.5 text-xs text-gray-950 dark:text-white focus:outline-none focus:border-secondary"
            />

            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-white dark:bg-gray-850 text-gray-650 dark:text-gray-300 border border-gray-250 dark:border-gray-750 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button 
                onClick={handleRejectSubmit}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl shadow-sm"
              >
                Reject submission
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Moderation;
