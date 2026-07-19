import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';
import SEO from '../components/common/SEO';
import { useAuth } from '../contexts/AuthContext';
import MaterialCard from '../components/materials/MaterialCard';
import MaterialFilters from '../components/materials/MaterialFilters';
import MaterialSearch from '../components/materials/MaterialSearch';
import SkeletonCard from '../components/common/SkeletonCard';
import { FileText, Inbox, ChevronLeft, ChevronRight, Landmark } from 'lucide-react';
import toast from 'react-hot-toast';

const Papers = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Extract initial search and type from URL params if redirecting
  const getInitialSearch = () => {
    const params = new URLSearchParams(location.search);
    return params.get('search') || '';
  };

  const getInitialType = () => {
    const params = new URLSearchParams(location.search);
    return params.get('type') || 'paper';
  };

  const [materials, setMaterials] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const [filters, setFilters] = useState({
    type: getInitialType(),
    course: '',
    semester: '',
    university: '',
    year: '',
    sortBy: 'newest',
    search: getInitialSearch()
  });

  // Sync state with query parameters if they change externally (e.g. clicking header links)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchVal = params.get('search') || '';
    const typeVal = params.get('type') || 'paper';
    setFilters(prev => ({
      ...prev,
      search: searchVal,
      type: typeVal
    }));
    setPage(1);
  }, [location]);

  const fetchBookmarks = async () => {
    if (isAuthenticated) {
      try {
        const response = await api.get('/bookmarks');
        if (response.data.success) {
          setBookmarkedIds(new Set(response.data.bookmarks.map(b => b.material._id)));
        }
      } catch (err) {
        console.error('Failed to load bookmarks:', err);
      }
    }
  };

  const fetchMaterials = async () => {
    // If course and semester are not yet selected and user hasn't typed a search term, wait for user selection
    if (!filters.course && !filters.search) {
      setMaterials([]);
      setLoading(false);
      return;
    }
    if (filters.course && !filters.semester && !filters.search) {
      setMaterials([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { course, semester, university, year, sortBy, search } = filters;
      
      let queryParams = `?type=paper&page=${page}&limit=9&sortBy=${sortBy}`;
      if (course) queryParams += `&course=${encodeURIComponent(course)}`;
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 transition-colors duration-300">
      <SEO 
        title="KSLU Previous Year Law Question Papers"
        description="Download KSLU previous year question papers. Find LLB, BA LLB, and BBA LLB university question papers for all semesters."
        keywords={['KSLU question papers', 'LLB question papers', 'Karnataka law exam papers', 'KSLU semester papers']}
      />
      
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-royal dark:text-secondary uppercase tracking-widest">Repository</span>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2.5 mt-0.5">
          <Landmark className="w-8 h-8 text-royal dark:text-secondary" /> Question Papers
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
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
          ) : !filters.course && !filters.search ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-8 space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-royal/10 dark:bg-secondary/10 text-royal dark:text-secondary flex items-center justify-center mx-auto text-xl font-bold">
                🎓
              </div>
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">
                Step 1: Select Your Law Course
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                Please select your program (3-Year LL.B, B.A. LL.B, B.B.A. LL.B, etc.) from the left filter panel to proceed.
              </p>
            </div>
          ) : filters.course && !filters.semester && !filters.search ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-8 space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto text-xl font-bold">
                📄
              </div>
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">
                Step 2: Select Your Semester
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                Select your semester (S1 - {filters.course.includes('3-Year') ? 'S6' : 'S10'}) from the left filter panel to reveal Marks Scheme, Paper Year & Question Papers.
              </p>
            </div>
          ) : materials.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl space-y-4">
              <div className="flex justify-center">
                <Inbox className="w-12 h-12 text-slate-350 dark:text-slate-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-750 dark:text-slate-300">No question papers found</h3>
              <p className="text-xs text-slate-450 dark:text-slate-500 max-w-sm mx-auto leading-relaxed">
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

export default Papers;
