import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import SEO from '../components/common/SEO';
import { useAuth } from '../contexts/AuthContext';

// Official Google Drive PYQ Components
import PyqCard from '../components/pyq/PyqCard';
import PyqPdfModal from '../components/pyq/PyqPdfModal';

// Community / Student-Uploaded Material Components
import MaterialCard from '../components/materials/MaterialCard';
import MaterialFilters from '../components/materials/MaterialFilters';
import MaterialSearch from '../components/materials/MaterialSearch';
import SkeletonCard from '../components/common/SkeletonCard';

import { 
  Landmark, BookOpen, GraduationCap, Calendar, 
  Search, Filter, ChevronRight, RotateCcw, 
  Award, FileText, ChevronLeft, Inbox, AlertCircle, ArrowLeft,
  Users, FolderTree, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

// Canonical courses for student navigation
const DEFAULT_COURSES = [
  { id: '3-year-llb', name: '3-Year LL.B', code: '3-year-llb', totalSemesters: 6, desc: 'Post-graduate Law Program' },
  { id: 'ba-llb', name: 'B.A. LL.B', code: 'ba-llb', totalSemesters: 10, desc: '5-Year Integrated Arts & Law' },
  { id: 'bba-llb', name: 'B.B.A. LL.B', code: 'bba-llb', totalSemesters: 10, desc: '5-Year Integrated Business & Law' }
];

const Papers = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Determine initial active tab from URL search params ('official' | 'community')
  const initialParams = new URLSearchParams(location.search);
  const initialTab = initialParams.get('tab') === 'community' ? 'community' : 'official';
  const [activeTab, setActiveTab] = useState(initialTab); // 'official' | 'community'

  // =========================================================================
  // SECTION A: OFFICIAL GOOGLE DRIVE PYQ STATE & FLOW
  // =========================================================================
  const [selectedCourse, setSelectedCourse] = useState(null); // Course object
  const [selectedSemester, setSelectedSemester] = useState(null); // Semester object
  const [selectedSubject, setSelectedSubject] = useState(null); // Subject object
  const [selectedMarks, setSelectedMarks] = useState(''); // '' | '80' | '100'
  const [selectedYear, setSelectedYear] = useState(''); // '' | '2024' | '2023' etc.
  const [sortBy, setSortBy] = useState('year_desc'); // 'year_desc' | 'year_asc' | 'downloads' | 'views'
  const [searchQuery, setSearchQuery] = useState(initialParams.get('search') || '');

  const [courses, setCourses] = useState(DEFAULT_COURSES);
  const [semestersList, setSemestersList] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);
  const [schemesList, setSchemesList] = useState([]);
  
  const [pyqs, setPyqs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(false);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Active preview paper for in-app modal
  const [previewPaper, setPreviewPaper] = useState(null);

  // 1. Initial Load: Fetch Courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/pyqs/courses');
        if (res.data.success && res.data.courses.length > 0) {
          setCourses(res.data.courses);
        }
      } catch (err) {
        // Fall back to default canonical courses gracefully
        setCourses(DEFAULT_COURSES);
      }
    };
    fetchCourses();
  }, []);

  // 2. Load Semesters when Course changes
  useEffect(() => {
    if (!selectedCourse) {
      setSemestersList([]);
      setSelectedSemester(null);
      return;
    }

    const fetchSemesters = async () => {
      try {
        const courseIdentifier = selectedCourse.id || selectedCourse.code;
        const res = await api.get(`/pyqs/semesters/${courseIdentifier}`);
        if (res.data.success && res.data.semesters.length > 0) {
          setSemestersList(res.data.semesters);
        } else {
          const total = selectedCourse.totalSemesters || 6;
          setSemestersList(
            Array.from({ length: total }, (_, i) => ({
              semesterNumber: i + 1,
              name: `Semester ${i + 1}`,
              id: `${selectedCourse.code}-s${i + 1}`
            }))
          );
        }
      } catch (err) {
        const total = selectedCourse.totalSemesters || 6;
        setSemestersList(
          Array.from({ length: total }, (_, i) => ({
            semesterNumber: i + 1,
            name: `Semester ${i + 1}`,
            id: `${selectedCourse.code}-s${i + 1}`
          }))
        );
      }
    };

    fetchSemesters();
  }, [selectedCourse]);

  // 3. Load Subjects when Semester changes
  useEffect(() => {
    if (!selectedSemester) {
      setSubjectsList([]);
      setSelectedSubject(null);
      return;
    }

    const fetchSubjects = async () => {
      setSubjectsLoading(true);
      try {
        if (selectedSemester.id && !selectedSemester.id.includes('-s')) {
          const res = await api.get(`/pyqs/subjects/${selectedSemester.id}`);
          if (res.data.success) {
            setSubjectsList(res.data.subjects);
          }
        } else {
          const res = await api.get(`/pyqs?course=${selectedCourse?.code || ''}&semester=${selectedSemester.semesterNumber}&limit=100`);
          if (res.data.success) {
            const map = new Map();
            res.data.pyqs.forEach(p => {
              if (p.subject && !map.has(p.subject.id)) {
                map.set(p.subject.id, p.subject);
              }
            });
            setSubjectsList(Array.from(map.values()));
          }
        }
      } catch (err) {
        console.error('Failed to load subjects:', err);
      } finally {
        setSubjectsLoading(false);
      }
    };

    fetchSubjects();
  }, [selectedSemester]);

  // 4. Fetch PYQs list based on filters
  const fetchPYQs = async (pageToFetch = 1) => {
    if (!selectedCourse && !searchQuery.trim()) {
      setPyqs([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (selectedCourse) {
        if (selectedCourse.id && !selectedCourse.id.includes('-')) {
          params.append('courseId', selectedCourse.id);
        } else {
          params.append('course', selectedCourse.code || selectedCourse.name);
        }
      }

      if (selectedSemester) {
        if (selectedSemester.id && !selectedSemester.id.includes('-s')) {
          params.append('semesterId', selectedSemester.id);
        } else {
          params.append('semester', selectedSemester.semesterNumber);
        }
      }

      if (selectedSubject) {
        params.append('subjectId', selectedSubject.id);
      }

      if (selectedMarks) {
        params.append('marks', selectedMarks);
      }

      if (selectedYear) {
        params.append('year', selectedYear);
      }

      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      params.append('sortBy', sortBy);
      params.append('page', pageToFetch);
      params.append('limit', 12);

      const res = await api.get(`/pyqs?${params.toString()}`);
      if (res.data.success) {
        setPyqs(res.data.pyqs);
        setPagination(res.data.pagination);
      } else {
        setPyqs([]);
      }
    } catch (err) {
      console.error('Failed to load PYQs:', err);
      setError('Unable to load question papers. Please try again or check connection.');
      toast.error('Failed to load question papers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'official') {
      fetchPYQs(1);
    }
  }, [selectedCourse, selectedSemester, selectedSubject, selectedMarks, selectedYear, sortBy, activeTab]);

  const handleOfficialSearchSubmit = (e) => {
    e.preventDefault();
    fetchPYQs(1);
  };

  const handleResetFilters = () => {
    setSelectedCourse(null);
    setSelectedSemester(null);
    setSelectedSubject(null);
    setSelectedMarks('');
    setSelectedYear('');
    setSearchQuery('');
    setPyqs([]);
  };

  // Available unique examination years from current PYQ list
  const availableYears = useMemo(() => {
    const years = new Set();
    pyqs.forEach(p => {
      if (p.examYear) years.add(p.examYear);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [pyqs]);

  // =========================================================================
  // SECTION B: COMMUNITY QUESTION PAPERS & BOOKMARKS STATE & FLOW
  // =========================================================================
  const getInitialCommunitySearch = () => {
    const params = new URLSearchParams(location.search);
    return params.get('search') || '';
  };

  const [communityMaterials, setCommunityMaterials] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [communityLoading, setCommunityLoading] = useState(true);
  const [communityPage, setCommunityPage] = useState(1);
  const [communityPagination, setCommunityPagination] = useState({ total: 0, pages: 1 });

  const [communityFilters, setCommunityFilters] = useState({
    type: 'paper',
    course: '',
    semester: '',
    university: '',
    marks: '',
    year: '',
    sortBy: 'newest',
    search: getInitialCommunitySearch()
  });

  const fetchBookmarks = async () => {
    if (isAuthenticated) {
      try {
        const response = await api.get('/bookmarks');
        if (response.data.success) {
          setBookmarkedIds(new Set(response.data.bookmarks.map(b => b.material.id)));
        }
      } catch (err) {
        console.error('Failed to load bookmarks:', err);
      }
    }
  };

  const fetchCommunityMaterials = async () => {
    if (!communityFilters.course && !communityFilters.search) {
      setCommunityMaterials([]);
      setCommunityLoading(false);
      return;
    }
    if (communityFilters.course && !communityFilters.semester && !communityFilters.search) {
      setCommunityMaterials([]);
      setCommunityLoading(false);
      return;
    }

    setCommunityLoading(true);
    try {
      const { course, semester, university, year, sortBy: sortOption, search, marks } = communityFilters;
      
      let queryParams = `?type=paper&page=${communityPage}&limit=9&sortBy=${sortOption}`;
      if (course) queryParams += `&course=${encodeURIComponent(course)}`;
      if (semester) queryParams += `&semester=${semester}`;
      if (university) queryParams += `&university=${university}`;
      if (year) queryParams += `&year=${year}`;
      if (marks) queryParams += `&marks=${marks}`;
      if (search) queryParams += `&search=${encodeURIComponent(search)}`;

      const response = await api.get(`/materials${queryParams}`);
      if (response.data.success) {
        setCommunityMaterials(response.data.materials);
        setCommunityPagination(response.data.pagination);
      }
    } catch (err) {
      toast.error('Failed to load community question papers');
    } finally {
      setCommunityLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, [isAuthenticated]);

  useEffect(() => {
    if (activeTab === 'community') {
      fetchCommunityMaterials();
    }
  }, [communityFilters, communityPage, activeTab]);

  const handleCommunitySearch = (searchTerm) => {
    setCommunityFilters(prev => ({ ...prev, search: searchTerm }));
  };

  const handleBookmarkToggle = (materialId, isBookmarked) => {
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      if (isBookmarked) next.add(materialId);
      else next.delete(materialId);
      return next;
    });
  };

  // Sync tab with URL
  const switchTab = (tab) => {
    setActiveTab(tab);
    const params = new URLSearchParams(location.search);
    params.set('tab', tab);
    navigate({ search: params.toString() }, { replace: true });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 transition-colors duration-300">
      <SEO 
        title="KSLU Previous Year Law Question Papers | Official & Community"
        description="Download KSLU previous year question papers. Find 3-Year LLB, BA LLB, and BBA LLB university question papers for all semesters, Scheme 80 & 100 Marks."
        keywords={['KSLU question papers', 'LLB question papers', 'Karnataka law exam papers', 'KSLU semester papers', 'Scheme 80 Marks', 'Scheme 100 Marks']}
      />

      {/* Main Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-royal/10 dark:bg-secondary/15 text-royal dark:text-secondary mb-3">
            <Landmark className="w-3.5 h-3.5" />
            <span>Karnataka State Law University</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Previous Year Question Papers
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Access verified university question papers organized by course, semester, and marks scheme, alongside peer-submitted community study papers.
          </p>
        </div>

        {/* Global Reset Button for Official Flow */}
        {activeTab === 'official' && (selectedCourse || searchQuery || selectedYear || selectedMarks) && (
          <button
            onClick={handleResetFilters}
            className="self-start md:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset PYQ Flow</span>
          </button>
        )}
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl w-fit">
        <button
          onClick={() => switchTab('official')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all ${
            activeTab === 'official'
              ? 'bg-white dark:bg-slate-800 text-royal dark:text-secondary shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FolderTree className="w-4 h-4 text-royal dark:text-secondary" />
          <span>Official KSLU PYQs (Google Drive)</span>
          <span className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[10px] uppercase font-bold rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
            Verified
          </span>
        </button>

        <button
          onClick={() => switchTab('community')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all ${
            activeTab === 'community'
              ? 'bg-white dark:bg-slate-800 text-royal dark:text-secondary shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4 text-royal dark:text-secondary" />
          <span>Community Uploads</span>
          <span className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[10px] uppercase font-bold rounded-md bg-royal/10 dark:bg-secondary/15 text-royal dark:text-secondary">
            Peer Shared
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OFFICIAL GOOGLE DRIVE PYQ HIERARCHICAL NAVIGATOR                   */}
      {/* ========================================================================= */}
      {activeTab === 'official' && (
        <div className="space-y-6">
          {/* Breadcrumb Trail */}
          <nav className="flex items-center flex-wrap gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 bg-white/70 dark:bg-slate-900/70 p-3 rounded-2xl border border-slate-150 dark:border-slate-800 backdrop-blur-sm">
            <button
              onClick={handleResetFilters}
              className="hover:text-royal dark:hover:text-secondary transition-colors"
            >
              All Programs
            </button>

            {selectedCourse && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <button
                  onClick={() => {
                    setSelectedSemester(null);
                    setSelectedSubject(null);
                    setSelectedMarks('');
                  }}
                  className={`hover:text-royal dark:hover:text-secondary transition-colors ${
                    !selectedSemester ? 'text-royal dark:text-secondary font-black' : ''
                  }`}
                >
                  {selectedCourse.name}
                </button>
              </>
            )}

            {selectedSemester && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <button
                  onClick={() => {
                    setSelectedSubject(null);
                    setSelectedMarks('');
                  }}
                  className={`hover:text-royal dark:hover:text-secondary transition-colors ${
                    !selectedSubject ? 'text-royal dark:text-secondary font-black' : ''
                  }`}
                >
                  {selectedSemester.name}
                </button>
              </>
            )}

            {selectedSubject && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <button
                  onClick={() => setSelectedMarks('')}
                  className={`hover:text-royal dark:hover:text-secondary transition-colors ${
                    !selectedMarks ? 'text-royal dark:text-secondary font-black' : ''
                  }`}
                >
                  {selectedSubject.name}
                </button>
              </>
            )}

            {selectedMarks && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-royal dark:text-secondary font-black">
                  Scheme {selectedMarks} Marks
                </span>
              </>
            )}
          </nav>

          {/* STEP 1: Select Course */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Step 1: Select Your Degree Program
              </span>
              {selectedCourse && (
                <span className="text-xs text-royal dark:text-secondary font-bold">
                  {selectedCourse.name} Selected
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {courses.map(course => {
                const isSelected = selectedCourse?.code === course.code || selectedCourse?.id === course.id;
                return (
                  <button
                    key={course.id || course.code}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedCourse(null);
                        setSelectedSemester(null);
                        setSelectedSubject(null);
                      } else {
                        setSelectedCourse(course);
                        setSelectedSemester(null);
                        setSelectedSubject(null);
                        setSelectedMarks('');
                      }
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                      isSelected
                        ? 'bg-royal text-white dark:bg-secondary dark:text-primary border-royal dark:border-secondary shadow-md'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white hover:border-royal/50 dark:hover:border-secondary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <GraduationCap className={`w-5 h-5 ${isSelected ? 'text-white dark:text-primary' : 'text-royal dark:text-secondary'}`} />
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isSelected 
                          ? 'bg-white/20 text-white dark:text-primary' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {course.totalSemesters || 6} Semesters
                      </span>
                    </div>
                    <h3 className="font-black text-sm tracking-tight">{course.name}</h3>
                    <p className={`text-xs mt-1 ${isSelected ? 'text-white/80 dark:text-primary/80' : 'text-slate-500 dark:text-slate-400'}`}>
                      {course.desc || `${course.totalSemesters} Semesters Law Curriculum`}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: Select Semester (Revealed when Course selected) */}
          {selectedCourse && (
            <div className="pt-2 animate-fadeIn">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Step 2: Select Semester
                </span>
                {selectedSemester && (
                  <span className="text-xs text-royal dark:text-secondary font-bold">
                    {selectedSemester.name}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {semestersList.map(sem => {
                  const isSelected = selectedSemester?.semesterNumber === sem.semesterNumber;
                  return (
                    <button
                      key={sem.id || sem.semesterNumber}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedSemester(null);
                          setSelectedSubject(null);
                        } else {
                          setSelectedSemester(sem);
                          setSelectedSubject(null);
                          setSelectedMarks('');
                        }
                      }}
                      className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
                        isSelected
                          ? 'bg-royal text-white dark:bg-secondary dark:text-primary shadow-sm scale-105'
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {sem.name}
                      {sem.pyqCount > 0 && (
                        <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full ${
                          isSelected ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}>
                          {sem.pyqCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Select Subject (Revealed when Semester selected) */}
          {selectedSemester && (
            <div className="pt-2 animate-fadeIn">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Step 3: Select Subject
                </span>
                {selectedSubject && (
                  <button
                    onClick={() => setSelectedSubject(null)}
                    className="text-xs text-slate-500 hover:text-royal dark:hover:text-secondary underline font-bold"
                  >
                    View All Semester Subjects
                  </button>
                )}
              </div>

              {subjectsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-14 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
                  ))}
                </div>
              ) : subjectsList.length === 0 ? (
                <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    No subjects loaded for {selectedSemester.name}. Question papers can still be searched below.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {subjectsList.map(sub => {
                    const isSelected = selectedSubject?.id === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedSubject(null);
                          } else {
                            setSelectedSubject(sub);
                            setSelectedMarks('');
                          }
                        }}
                        className={`p-3.5 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'bg-royal text-white dark:bg-secondary dark:text-primary border-royal dark:border-secondary shadow-md'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white hover:border-royal/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-black line-clamp-1">{sub.name}</span>
                          {sub.code && (
                            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                              isSelected ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            }`}>
                              {sub.code}
                            </span>
                          )}
                        </div>
                        {sub.pyqCount !== undefined && (
                          <span className={`text-[11px] block mt-1 ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                            {sub.pyqCount} papers available
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Scheme, Year & Search Filters Bar */}
          {(selectedCourse || searchQuery) && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm space-y-4">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                {/* Search Bar */}
                <form onSubmit={handleOfficialSearchSubmit} className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search papers by subject, year or keywords..."
                    className="w-full pl-9 pr-20 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-750 text-slate-900 dark:text-white focus:outline-none focus:border-royal dark:focus:border-secondary transition-colors"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-royal dark:bg-secondary text-white dark:text-primary text-[11px] font-black rounded-lg"
                  >
                    Search
                  </button>
                </form>

                {/* Scheme & Year Filters */}
                <div className="flex items-center flex-wrap gap-2">
                  {/* Scheme Buttons (80 / 100 Marks) */}
                  <div className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button
                      onClick={() => setSelectedMarks('')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        selectedMarks === ''
                          ? 'bg-white dark:bg-slate-700 text-royal dark:text-secondary shadow-sm'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      All Schemes
                    </button>
                    <button
                      onClick={() => setSelectedMarks('80')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        selectedMarks === '80'
                          ? 'bg-royal text-white dark:bg-secondary dark:text-primary shadow-sm'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      80 Marks
                    </button>
                    <button
                      onClick={() => setSelectedMarks('100')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        selectedMarks === '100'
                          ? 'bg-royal text-white dark:bg-secondary dark:text-primary shadow-sm'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      100 Marks
                    </button>
                  </div>

                  {/* Year Dropdown */}
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-300 focus:outline-none"
                  >
                    <option value="">All Exam Years</option>
                    {availableYears.map(yr => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>

                  {/* Sort By Dropdown */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-300 focus:outline-none"
                  >
                    <option value="year_desc">Newest Year</option>
                    <option value="year_asc">Oldest Year</option>
                    <option value="downloads">Most Downloaded</option>
                    <option value="views">Most Viewed</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: PYQ Papers Results */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/40 rounded-3xl space-y-3">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
              <h3 className="text-sm font-black text-red-600 dark:text-red-400">{error}</h3>
              <button
                onClick={() => fetchPYQs(pagination.page)}
                className="px-4 py-2 bg-royal dark:bg-secondary text-white dark:text-primary text-xs font-bold rounded-xl"
              >
                Try Again
              </button>
            </div>
          ) : !selectedCourse && !searchQuery ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 space-y-3 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-royal/10 dark:bg-secondary/15 text-royal dark:text-secondary flex items-center justify-center mx-auto text-2xl font-bold">
                📚
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Step 1: Choose Your Law Degree
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                Select <strong>3-Year LL.B</strong>, <strong>B.A. LL.B</strong>, or <strong>B.B.A. LL.B</strong> above to reveal your semesters, subjects, and verified question papers.
              </p>
            </div>
          ) : pyqs.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Inbox className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-black text-slate-800 dark:text-white">No Question Papers Found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                No papers match your selected filters. Try choosing "All Schemes" or clearing search keywords.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-royal dark:bg-secondary text-white dark:text-primary text-xs font-bold rounded-xl shadow-sm"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {pyqs.map(paper => (
                <PyqCard
                  key={paper.id}
                  paper={paper}
                  onPreview={(p) => setPreviewPaper(p)}
                />
              ))}
            </div>
          )}

          {/* Official PYQs Pagination Controls */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchPYQs(pagination.page - 1)}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === pagination.pages || Math.abs(p - pagination.page) <= 2)
                .map((p, idx, arr) => {
                  const prev = arr[idx - 1];
                  return (
                    <React.Fragment key={p}>
                      {prev && p - prev > 1 && <span className="px-1 text-slate-400">...</span>}
                      <button
                        onClick={() => fetchPYQs(p)}
                        className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${
                          pagination.page === p
                            ? 'bg-royal border-royal text-white dark:bg-secondary dark:border-secondary dark:text-primary shadow-sm'
                            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  );
                })}

              <button
                disabled={pagination.page >= pagination.pages}
                onClick={() => fetchPYQs(pagination.page + 1)}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: COMMUNITY CONTRIBUTED QUESTION PAPERS & BOOKMARKS                  */}
      {/* ========================================================================= */}
      {activeTab === 'community' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar Filters */}
          <div className="lg:col-span-1">
            <MaterialFilters 
              filters={communityFilters} 
              setFilters={setCommunityFilters} 
              showYearFilter={true} 
            />
          </div>

          {/* Right Content Area */}
          <div className="lg:col-span-3 space-y-6">
            <MaterialSearch 
              onSearch={handleCommunitySearch} 
              placeholder="Search question papers by title, course, year..." 
            />

            {communityLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : !communityFilters.course && !communityFilters.search ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-8 space-y-3 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-royal/10 dark:bg-secondary/10 text-royal dark:text-secondary flex items-center justify-center mx-auto text-xl font-bold">
                  🎓
                </div>
                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">
                  Select Your Law Course
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Please select your program (3-Year LL.B, B.A. LL.B, B.B.A. LL.B, etc.) from the left filter panel to proceed.
                </p>
              </div>
            ) : communityFilters.course && !communityFilters.semester && !communityFilters.search ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-8 space-y-3 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto text-xl font-bold">
                  📄
                </div>
                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">
                  Select Your Semester
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Select your semester (S1 - {communityFilters.course.includes('3-Year') ? 'S6' : 'S10'}) from the left filter panel to reveal Exam Pattern, Paper Year & Question Papers.
                </p>
              </div>
            ) : communityMaterials.length === 0 ? (
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
                  {communityMaterials.map(mat => (
                    <MaterialCard 
                      key={mat.id} 
                      material={mat} 
                      initialBookmarked={bookmarkedIds.has(mat.id)}
                      onBookmarkToggle={handleBookmarkToggle}
                    />
                  ))}
                </div>

                {/* Community Pagination Controls */}
                {communityPagination.pages > 1 && (
                  <div className="flex justify-center items-center gap-4 pt-4">
                    <button
                      disabled={communityPage === 1}
                      onClick={() => setCommunityPage(p => Math.max(1, p - 1))}
                      className="p-2.5 border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl hover:border-royal dark:hover:border-secondary transition-all disabled:opacity-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold text-slate-650 dark:text-slate-400">
                      Page {communityPage} of {communityPagination.pages}
                    </span>
                    <button
                      disabled={communityPage === communityPagination.pages}
                      onClick={() => setCommunityPage(p => Math.min(communityPagination.pages, p + 1))}
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
      )}

      {/* In-app PDF Viewer Modal for Official PYQs */}
      <PyqPdfModal
        paper={previewPaper}
        isOpen={Boolean(previewPaper)}
        onClose={() => setPreviewPaper(null)}
      />
    </div>
  );
};

export default Papers;
