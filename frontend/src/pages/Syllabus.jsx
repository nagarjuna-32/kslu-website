import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';
import SEO from '../components/common/SEO';
import { useAuth } from '../contexts/AuthContext';
import MaterialCard from '../components/materials/MaterialCard';
import MaterialFilters from '../components/materials/MaterialFilters';
import MaterialSearch from '../components/materials/MaterialSearch';
import SkeletonCard from '../components/common/SkeletonCard';
import { FileText, Inbox, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import toast from 'react-hot-toast';

const Syllabus = () => {
  const { isAuthenticated, user } = useAuth();
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
    type: 'note',
    course: '',
    semester: '',
    university: '',
    year: '',
    sortBy: 'newest',
    search: getInitialSearch()
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchVal = params.get('search') || '';
    setFilters(prev => ({
      ...prev,
      search: searchVal
    }));
    setPage(1);
  }, [location]);

  const fetchBookmarks = async () => {
    if (isAuthenticated) {
      try {
        const response = await api.get('/bookmarks');
        if (response.data.success) {
          setBookmarkedIds(new Set(response.data.bookmarks.map(b => b.material.id || b.material._id)));
        }
      } catch (err) {
        console.error('Failed to load bookmarks:', err);
      }
    }
  };

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const { course, semester, sortBy, search } = filters;
      
      // Request only materials with subjectCode=SYLLABUS
      let queryParams = `?subjectCode=SYLLABUS&page=${page}&limit=9&sortBy=${sortBy}`;
      if (course) queryParams += `&course=${encodeURIComponent(course)}`;
      if (semester) queryParams += `&semester=${semester}`;
      if (search) queryParams += `&search=${encodeURIComponent(search)}`;

      const response = await api.get(`/materials${queryParams}`);
      if (response.data.success) {
        setMaterials(response.data.materials);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      toast.error('Failed to load syllabus repository');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 transition-colors duration-300">
      <SEO 
        title="KSLU Law Syllabi & Course Curriculum Guides"
        description="Access free official course syllabi and subject curriculums for KSLU 3-Year LLB and 5-Year integrated law courses."
        keywords={['KSLU syllabus', 'LLB syllabus', 'law course syllabus', 'KSLU curriculum']}
      />
      
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-royal dark:text-secondary uppercase tracking-widest">Curriculum</span>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2.5 mt-0.5">
          <Layers className="w-8 h-8 text-royal dark:text-secondary" /> Course Syllabus
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
          Explore and download official KSLU law syllabus files and course outlines.
        </p>
      </div>

      {/* Grid container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Filters Sidebar */}
        <div className="lg:col-span-1">
          <MaterialFilters filters={filters} setFilters={setFilters} showYearFilter={false} />
        </div>

        {/* Right Search and Cards List */}
        <div className="lg:col-span-3 space-y-6">
          <MaterialSearch onSearch={handleSearch} placeholder="Search syllabus by title, course..." />

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : materials.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl space-y-4">
              <div className="flex justify-center">
                <Inbox className="w-12 h-12 text-slate-350 dark:text-slate-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-750 dark:text-slate-300">No syllabus found</h3>
              <p className="text-xs text-slate-450 dark:text-slate-500 max-w-sm mx-auto leading-relaxed">
                Be the first to upload course curriculum guides or syllabus files.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {materials.map(mat => {
                  const matId = mat.id || mat._id;
                  return (
                    <MaterialCard 
                      key={matId} 
                      material={mat} 
                      initialBookmarked={bookmarkedIds.has(matId)}
                      onBookmarkToggle={handleBookmarkToggle}
                    />
                  );
                })}
              </div>

              {/* Pagination controls */}
              {pagination.pages > 1 && (
                <div className="flex justify-center items-center gap-4 pt-4">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="p-2.5 border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl hover:border-royal dark:hover:border-secondary transition-all disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-slate-650 dark:text-slate-400">
                    Page {page} of {pagination.pages}
                  </span>
                  <button
                    disabled={page === pagination.pages}
                    onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                    className="p-2.5 border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl hover:border-royal dark:hover:border-secondary transition-all disabled:opacity-50"
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

export default Syllabus;
