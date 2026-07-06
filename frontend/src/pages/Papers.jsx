import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import MaterialCard from '../components/materials/MaterialCard';
import MaterialFilters from '../components/materials/MaterialFilters';
import MaterialSearch from '../components/materials/MaterialSearch';
import SkeletonCard from '../components/common/SkeletonCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FileText, Inbox, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Papers = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const getInitialSearch = () => {
    const params = new URLSearchParams(location.search);
    return params.get('search') || '';
  };

  const [materials, setMaterials] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const [filters, setFilters] = useState({
    type: 'paper',
    semester: '',
    university: '',
    year: '',
    sortBy: 'newest',
    search: getInitialSearch()
  });

  const fetchBookmarks = async () => {
    if (isAuthenticated) {
      try {
        const response = await api.get('/bookmarks');
        if (response.data.success) {
          setBookmarkedIds(new Set(response.data.bookmarks.map(b => b.material._id)));
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const { semester, university, year, sortBy, search } = filters;
      
      let queryParams = `?type=paper&page=${page}&limit=9&sortBy=${sortBy}`;
      if (semester) queryParams += `&semester=${semester}`;
      if (university) queryParams += `&university=${university}`;
      if (year) queryParams += `&year=${year}`;
      if (search) queryParams += `&search=${encodeURIComponent(search)}`;

      const response = await api.get(`/materials${queryParams}`);
      if (response.data.success) {
        setMaterials(response.data.materials);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      toast.error('Failed to load question papers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, [isAuthenticated]);

  useEffect(() => {
    fetchMaterials();
  }, [filters, page]);

  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
    setPage(1);
  };

  const handleBookmarkToggle = (materialId, isBookmarked) => {
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      if (isBookmarked) next.add(materialId);
      else next.delete(materialId);
      return next;
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 transition-colors duration-300">
      
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-secondary uppercase tracking-widest">Repository</span>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2 mt-0.5">
          <FileText className="w-8 h-8 text-primary dark:text-secondary" /> Exam Question Papers
        </h1>
        <p className="text-xs text-gray-550 dark:text-gray-400 mt-1.5">
          Browse previous years' university law question papers sorted by academic term.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filters */}
        <div className="lg:col-span-1">
          <MaterialFilters filters={filters} setFilters={setFilters} showYearFilter={true} />
        </div>

        {/* Content Section */}
        <div className="lg:col-span-3 space-y-6">
          <MaterialSearch onSearch={handleSearch} placeholder="Search question papers by title, course, year..." />

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : materials.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl space-y-4">
              <div className="flex justify-center">
                <Inbox className="w-12 h-12 text-gray-300 dark:text-gray-700" />
              </div>
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">No question papers found</h3>
              <p className="text-xs text-gray-450 dark:text-gray-500 max-w-sm mx-auto leading-relaxed">
                Be the first to upload previous semester papers for this course configuration.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {materials.map(mat => (
                  <MaterialCard 
                    key={mat._id} 
                    material={mat} 
                    initialBookmarked={bookmarkedIds.has(mat._id)}
                    onBookmarkToggle={handleBookmarkToggle}
                  />
                ))}
              </div>

              {/* Pagination bar */}
              {pagination.pages > 1 && (
                <div className="flex justify-center items-center gap-4 pt-4">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="p-2 border border-gray-250 dark:border-gray-750 rounded-xl hover:border-secondary dark:text-gray-300 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-gray-650 dark:text-gray-400">
                    Page {page} of {pagination.pages}
                  </span>
                  <button
                    disabled={page === pagination.pages}
                    onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                    className="p-2 border border-gray-250 dark:border-gray-750 rounded-xl hover:border-secondary dark:text-gray-300 disabled:opacity-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}

        </div>

      </div>

    </div>
  );
};

export default Papers;
