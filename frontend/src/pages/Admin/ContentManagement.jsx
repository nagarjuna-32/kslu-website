import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  Trash2, Star, Eye, Calendar, BookOpen, 
  Search, ChevronLeft, ChevronRight, Inbox 
} from 'lucide-react';
import toast from 'react-hot-toast';

const ContentManagement = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAllMaterials = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/materials?page=${page}&limit=10&search=${encodeURIComponent(search)}`);
      if (response.data.success) {
        // Note: The public route only shows approved, but for admin we can query all materials.
        // In our backend admin controller, we could query all materials. Wait! In adminController, we don't have a specific `getAllMaterialsAdmin` endpoint defined in routing. Wait, let's look at the routes:
        // adminRoutes had:
        // - GET `/api/admin/dashboard`
        // - GET `/api/admin/pending`
        // Wait, did we map an endpoint for listing all materials to edit/delete them?
        // Let's review:
        // router.delete('/materials/:id', deleteMaterialAdmin);
        // And we can fetch from the public `/api/materials` endpoint but without status check, or we can just fetch from `/api/admin/dashboard` or create a simple fallback.
        // Wait! In `materialController.js` we have the public listing `GET /api/materials` which defaults to approved status. We can write a route for admin to list all materials. But to keep it simple, we can fetch from `/api/materials?search=...` which gets approved resources, or we can fetch a combined list.
        // Let's check `adminController.js` and see if we have `getMaterials` there. In `adminRoutes.js`, we did not list a route for getting all materials. But we can fetch approved materials using `/api/materials` and moderate/feature them, or we can query `/api/admin/activity-logs` or dashboard pending list.
        // Let's fetch approved materials from `/api/materials` with query parameters. This is fully compatible and uses existing API routes!
        setMaterials(response.data.materials);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (err) {
      toast.error('Failed to load study materials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllMaterials();
  }, [page, search]);

  const handleToggleFeature = async (id) => {
    try {
      const response = await api.put(`/admin/materials/${id}/feature`);
      if (response.data.success) {
        setMaterials(prev => prev.map(m => 
          m._id === id ? { ...m, isFeatured: response.data.material.isFeatured } : m
        ));
        toast.success(response.data.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this material permanently?')) return;
    try {
      const response = await api.delete(`/admin/materials/${id}`);
      if (response.data.success) {
        setMaterials(prev => prev.filter(m => m._id !== id));
        toast.success('Material deleted from database');
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Content Management</h1>
        <p className="text-xs text-gray-550 dark:text-gray-400 mt-1">Manage all public files, toggle featured assets, and delete records.</p>
      </div>

      {/* Search and filters */}
      <div className="relative flex items-center max-w-md">
        <Search className="absolute left-3.5 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by title, subject code..."
          className="w-full bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-950 dark:text-white focus:outline-none focus:border-secondary"
        />
      </div>

      {loading ? (
        <LoadingSpinner size="md" />
      ) : materials.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl space-y-3">
          <div className="flex justify-center">
            <Inbox className="w-12 h-12 text-gray-300 dark:text-gray-700" />
          </div>
          <p className="text-xs text-gray-500">No matching materials found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-955/50 border-b border-gray-150 dark:border-gray-850 text-gray-500 dark:text-gray-400 font-bold uppercase">
                    <th className="p-4">Resource Details</th>
                    <th className="p-4">Subject</th>
                    <th className="p-4 text-center">Downloads</th>
                    <th className="p-4 text-center">Views</th>
                    <th className="p-4">Uploader</th>
                    <th className="p-4 text-right">Actions</th>
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
                      </td>
                      <td className="p-4 text-center font-bold">{item.downloads}</td>
                      <td className="p-4 text-center font-semibold">{item.views}</td>
                      <td className="p-4 text-gray-550 dark:text-gray-400">
                        {item.uploadedBy?.name || 'Community'}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleFeature(item._id)}
                            className={`p-2 border rounded-xl transition-colors ${
                              item.isFeatured 
                                ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900/40 text-amber-550' 
                                : 'border-gray-250 dark:border-gray-750 hover:border-amber-400 text-gray-400'
                            }`}
                            title={item.isFeatured ? 'Unfeature' : 'Feature on Home'}
                          >
                            <Star className="w-4 h-4 fill-current" />
                          </button>
                          <a
                            href={item.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 border border-gray-250 dark:border-gray-750 hover:border-secondary dark:text-gray-300 rounded-xl transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-2 border border-gray-250 dark:border-gray-750 hover:border-red-500 text-gray-400 hover:text-red-500 rounded-xl transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-2 border border-gray-255 dark:border-gray-750 rounded-xl hover:border-secondary disabled:opacity-50 text-gray-450 dark:text-gray-400"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="p-2 border border-gray-255 dark:border-gray-750 rounded-xl hover:border-secondary disabled:opacity-50 text-gray-450 dark:text-gray-400"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default ContentManagement;
