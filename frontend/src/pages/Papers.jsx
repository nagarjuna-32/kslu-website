import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import SEO from '../components/common/SEO';
import PyqCard from '../components/pyq/PyqCard';
import PyqPdfModal from '../components/pyq/PyqPdfModal';
import SkeletonCard from '../components/common/SkeletonCard';
import { 
  Landmark, BookOpen, GraduationCap, Calendar, 
  Search, Filter, ChevronRight, RotateCcw, 
  Award, FileText, ChevronLeft, Inbox, AlertCircle, ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

// Canonical courses for student navigation
const DEFAULT_COURSES = [
  { id: '3-year-llb', name: '3-Year LL.B', code: '3-year-llb', totalSemesters: 6, desc: 'Post-graduate Law Program' },
  { id: 'ba-llb', name: 'B.A. LL.B', code: 'ba-llb', totalSemesters: 10, desc: '5-Year Integrated Arts & Law' },
  { id: 'bba-llb', name: 'B.B.A. LL.B', code: 'bba-llb', totalSemesters: 10, desc: '5-Year Integrated Business & Law' }
];

const Papers = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Selected hierarchy state
  const [selectedCourse, setSelectedCourse] = useState(null); // Course object
  const [selectedSemester, setSelectedSemester] = useState(null); // Semester object or number
  const [selectedSubject, setSelectedSubject] = useState(null); // Subject object
  const [selectedMarks, setSelectedMarks] = useState(''); // '' | '80' | '100'
  const [selectedYear, setSelectedYear] = useState(''); // '' | '2024' | '2023' etc.
  const [sortBy, setSortBy] = useState('year_desc'); // 'year_desc' | 'year_asc' | 'downloads' | 'views'
  const [searchQuery, setSearchQuery] = useState('');

  // Data states
  const [courses, setCourses] = useState(DEFAULT_COURSES);
  const [semestersList, setSemestersList] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);
  const [schemesList, setSchemesList] = useState([]);
  
  const [pyqs, setPyqs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(false);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Active preview paper for modal
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
          // Generate fallback semester numbers based on course totalSemesters
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
        // If semester has a real database UUID, fetch from API
        if (selectedSemester.id && !selectedSemester.id.includes('-s')) {
          const res = await api.get(`/pyqs/subjects/${selectedSemester.id}`);
          if (res.data.success) {
            setSubjectsList(res.data.subjects);
          }
        } else {
          // Query available subjects via main /api/pyqs endpoint
          const res = await api.get(`/pyqs?course=${selectedCourse?.code || ''}&semester=${selectedSemester.semesterNumber}&limit=100`);
          if (res.data.success) {
            // Group distinct subjects from papers
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

  // 4. Fetch PYQs list based on all filters
  const fetchPYQs = async (pageToFetch = 1) => {
    // If user has not selected anything and has not searched, don't show everything yet
    if (!selectedCourse && !searchQuery.trim()) {
      setPyqs([]);
      setPagination({ total: 0, page: 1, pages: 1 });
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('page', pageToFetch.toString());
      params.append('limit', '12');
      params.append('sortBy', sortBy);

      if (selectedCourse) {
        params.append('course', selectedCourse.name || selectedCourse.code);
      }
      if (selectedSemester) {
        params.append('semester', selectedSemester.semesterNumber.toString());
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

      const res = await api.get(`/pyqs?${params.toString()}`);
      if (res.data.success) {
        setPyqs(res.data.pyqs);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to load question papers');
      toast.error('Failed to load question papers');
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when criteria change
  useEffect(() => {
    fetchPYQs(1);
  }, [selectedCourse, selectedSemester, selectedSubject, selectedMarks, selectedYear, sortBy, searchQuery]);

  // Reset entire navigation
  const handleResetFilters = () => {
    setSelectedCourse(null);
    setSelectedSemester(null);
    setSelectedSubject(null);
    setSelectedMarks('');
    setSelectedYear('');
    setSearchQuery('');
    setSortBy('year_desc');
  };

  // Available examination years (for year filter)
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let y = currentYear; y >= 2017; y--) {
      years.push(y);
    }
    return years;
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 transition-colors duration-300">
      <SEO 
        title="KSLU Previous Year Question Papers (PYQs) - All Semesters"
        description="Download KSLU Previous Year Question Papers for 3-Year LL.B, B.A. LL.B, and B.B.A. LL.B. Filter by semester, subject, scheme 80 & 100 marks."
        keywords={['KSLU PYQ', 'KSLU previous year question papers', 'LLB question papers', 'Karnataka State Law University exam papers', 'KSLU Scheme 80', 'KSLU Scheme 100']}
      />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-royal/10 dark:bg-secondary/15 text-royal dark:text-secondary text-xs font-black uppercase tracking-wider mb-2">
            <Landmark className="w-3.5 h-3.5" />
            <span>Official University Question Paper Repository</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Previous Year Question Papers
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Browse verified KSLU semester question papers organized by course, semester, subject, and examination scheme (80 & 100 Marks).
          </p>
        </div>

        {/* Global Reset */}
        {(selectedCourse || searchQuery || selectedYear || selectedMarks) && (
          <button
            onClick={handleResetFilters}
            className="self-start md:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Flow</span>
          </button>
        )}
      </div>

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

      {/* STUDENT NAVIGATION FLOW */}

      {/* STEP 1: Select Course */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-royal dark:bg-secondary text-white dark:text-primary text-[10px] flex items-center justify-center font-bold">1</span>
            Select Law Degree Program
          </h2>
          {selectedCourse && (
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">✓ Selected</span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {courses.map(course => {
            const isSelected = selectedCourse?.code === course.code;
            return (
              <button
                key={course.code || course.id}
                onClick={() => {
                  setSelectedCourse(course);
                  setSelectedSemester(null);
                  setSelectedSubject(null);
                  setSelectedMarks('');
                }}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 relative overflow-hidden ${
                  isSelected
                    ? 'bg-royal border-royal text-white dark:bg-secondary dark:border-secondary dark:text-primary shadow-lg ring-2 ring-royal/20 dark:ring-secondary/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-royal dark:hover:border-secondary text-slate-800 dark:text-slate-200 hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    isSelected
                      ? 'bg-white/20 text-white dark:bg-primary/20 dark:text-primary'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}>
                    {course.totalSemesters || 6} Semesters
                  </span>
                  <GraduationCap className={`w-4 h-4 ${isSelected ? 'text-white dark:text-primary' : 'text-slate-400'}`} />
                </div>
                <h3 className="text-base font-black truncate">{course.name}</h3>
                <p className={`text-[11px] mt-0.5 line-clamp-1 ${
                  isSelected ? 'text-white/80 dark:text-primary/80' : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {course.desc || 'KSLU Curriculum'}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 2: Select Semester (Appears after Step 1) */}
      {selectedCourse && (
        <div className="space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-royal dark:bg-secondary text-white dark:text-primary text-[10px] flex items-center justify-center font-bold">2</span>
              Select Semester ({selectedCourse.name})
            </h2>
            {selectedSemester && (
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">✓ Selected</span>
            )}
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-10 gap-2">
            {semestersList.map(sem => {
              const isSelected = selectedSemester?.semesterNumber === sem.semesterNumber;
              return (
                <button
                  key={sem.id || sem.semesterNumber}
                  onClick={() => {
                    setSelectedSemester(sem);
                    setSelectedSubject(null);
                    setSelectedMarks('');
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-black border transition-all text-center ${
                    isSelected
                      ? 'bg-royal border-royal text-white dark:bg-secondary dark:border-secondary dark:text-primary shadow-md'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-royal dark:hover:border-secondary text-slate-700 dark:text-slate-300'
                  }`}
                >
                  S{sem.semesterNumber}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 3 & 4: Subject & Scheme Controls (Appears after Semester) */}
      {selectedSemester && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          {/* Step 3: Subject Selection */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-royal dark:bg-secondary text-white dark:text-primary text-[10px] flex items-center justify-center font-bold">3</span>
                Select Subject
              </h2>
              {selectedSubject && (
                <button
                  onClick={() => setSelectedSubject(null)}
                  className="text-[11px] font-bold text-royal dark:text-secondary hover:underline"
                >
                  Show All Subjects
                </button>
              )}
            </div>

            {subjectsLoading ? (
              <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs text-slate-500">
                <div className="w-4 h-4 border-2 border-royal border-t-transparent rounded-full animate-spin mr-2" />
                Loading semester subjects...
              </div>
            ) : subjectsList.length === 0 ? (
              <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
                All subject question papers for this term are listed below.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {subjectsList.map(sub => {
                  const isSelected = selectedSubject?.id === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSubject(isSelected ? null : sub)}
                      className={`p-3 rounded-xl text-left border transition-all text-xs font-bold flex items-center justify-between ${
                        isSelected
                          ? 'bg-royal border-royal text-white dark:bg-secondary dark:border-secondary dark:text-primary shadow-sm'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-royal dark:hover:border-secondary text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <span className="truncate pr-2">{sub.name}</span>
                      {sub.code && (
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          isSelected ? 'bg-white/20 text-white dark:bg-primary/20 dark:text-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}>
                          {sub.code}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 4: Scheme Selection (80 / 100 Marks) */}
          <div className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-royal dark:bg-secondary text-white dark:text-primary text-[10px] flex items-center justify-center font-bold">4</span>
              Exam Marking Scheme
            </h2>

            <div className="flex flex-col gap-2">
              {[
                { value: '', label: 'All Schemes (80 & 100 Marks)' },
                { value: '80', label: 'Scheme 80 Marks' },
                { value: '100', label: 'Scheme 100 Marks' }
              ].map(scheme => {
                const isSelected = selectedMarks === scheme.value;
                return (
                  <button
                    key={scheme.value}
                    onClick={() => setSelectedMarks(scheme.value)}
                    className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between ${
                      isSelected
                        ? 'bg-royal border-royal text-white dark:bg-secondary dark:border-secondary dark:text-primary shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-royal dark:hover:border-secondary text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{scheme.label}</span>
                    <Award className="w-4 h-4 opacity-75" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SEARCH, YEAR FILTER, & SORT BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search papers by subject, title or keyword..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-royal dark:focus:ring-secondary"
          />
        </div>

        {/* Filter by Exam Year */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 whitespace-nowrap">
            <Calendar className="w-3.5 h-3.5 text-royal dark:text-secondary" />
            <span className="font-bold">Year:</span>
          </div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="">All Exam Years</option>
            {availableYears.map(yr => (
              <option key={yr} value={yr.toString()}>{yr}</option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="year_desc">Newest Year First</option>
            <option value="year_asc">Oldest Year First</option>
            <option value="downloads">Most Downloaded</option>
            <option value="views">Most Viewed</option>
          </select>
        </div>
      </div>

      {/* STEP 5: PYQ RESULTS & LIST */}
      <div>
        {/* Results Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Available Question Papers
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-royal/10 dark:bg-secondary/15 text-royal dark:text-secondary text-[11px] font-black">
              {pagination.total} Papers
            </span>
          </div>

          {pagination.pages > 1 && (
            <span className="text-xs text-slate-500 font-semibold">
              Page {pagination.page} of {pagination.pages}
            </span>
          )}
        </div>

        {/* Dynamic Display States */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/40 rounded-3xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">Failed to load question papers</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">{error}</p>
            <button
              onClick={() => fetchPYQs(pagination.page)}
              className="px-4 py-2 bg-royal dark:bg-secondary text-white dark:text-primary text-xs font-bold rounded-xl"
            >
              Try Again
            </button>
          </div>
        ) : !selectedCourse && !searchQuery ? (
          // Guide when nothing selected
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
          // Empty State
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
          // Results Grid
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

        {/* Pagination Controls */}
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

      {/* In-app PDF Viewer Modal */}
      <PyqPdfModal
        paper={previewPaper}
        isOpen={Boolean(previewPaper)}
        onClose={() => setPreviewPaper(null)}
      />
    </div>
  );
};

export default Papers;
