import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import SEO from '../components/common/SEO';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/LanguageContext';
import MaterialSearch from '../components/materials/MaterialSearch';
import MaterialCard from '../components/materials/MaterialCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { COURSES } from '../utils/coursesData';
import { motion } from 'framer-motion';
import { 
  FileText, Award, Download, Users, ChevronRight, BookOpen, 
  AlertCircle, Scale, GraduationCap, Compass, Landmark 
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [topContributors, setTopContributors] = useState([]);
  
  const [featured, setFeatured] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  const [recent, setRecent] = useState([]);
  const [recentLoading, setRecentLoading] = useState(true);

  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    // 1. Fetch stats and leaderboard
    api.get('/stats')
      .then(res => {
        if (res.data.success) {
          setStats(res.data.stats);
          setTopContributors(res.data.topContributors || []);
        }
      })
      .catch(err => console.error('Failed to load stats:', err))
      .finally(() => setStatsLoading(false));

    // 2. Fetch featured materials
    api.get('/materials/featured')
      .then(res => {
        if (res.data.success) {
          setFeatured(res.data.materials.slice(0, 3));
        }
      })
      .catch(err => console.error('Failed to load featured materials:', err))
      .finally(() => setFeaturedLoading(false));

    // 3. Fetch recent materials
    api.get('/materials/recent')
      .then(res => {
        if (res.data.success) {
          setRecent(res.data.materials.slice(0, 6));
        }
      })
      .catch(err => console.error('Failed to load recent materials:', err))
      .finally(() => setRecentLoading(false));

    // 4. Fetch announcements
    api.get('/announcements/active')
      .then(res => {
        if (res.data.success) {
          setAnnouncements(res.data.announcements);
        }
      })
      .catch(err => console.error('Failed to load announcements:', err));
  }, []);

  const handleSearchSubmit = (searchTerm) => {
    if (searchTerm.trim()) {
      navigate(`/notes?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const quickFilters = [
    { label: '📝 Study Notes', path: '/notes?type=note' },
    { label: '📄 Previous Papers (PYQs)', path: '/notes?type=paper' },
    { label: '📘 Syllabus', path: '/notes?search=syllabus' },
    { label: '❓ Important Questions', path: '/notes?search=important' },
    { label: '⚖️ Case Laws', path: '/notes?search=case+law' }
  ];

  return (
    <div className="space-y-16 pb-20 bg-transparent transition-colors duration-300">
      <SEO />
      
      {/* Announcements Banner */}
      {announcements.length > 0 && (
        <div className="bg-royal text-white py-3 px-4 text-xs font-bold text-center flex items-center justify-center gap-2 relative shadow-md">
          <AlertCircle className="w-4 h-4 animate-pulse text-secondary" />
          <span>ANNOUNCEMENT: {announcements[0].title} — {announcements[0].content}</span>
          {announcements[0].link && (
            <a href={announcements[0].link} className="underline pl-1 text-secondary hover:text-white transition-colors">Learn More</a>
          )}
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-900 text-slate-800 dark:text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-slate-200 dark:border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-100/50 via-white to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-950 -z-10" />
        
        {/* Subtle legal grid background */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px] -z-10" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-secondary text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800">
              <Landmark className="w-3.5 h-3.5 text-slate-900 dark:text-secondary" /> {t('tagline')}
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
              {t('heroTitle')}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
              {t('heroSubtitle')}
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link to="/notes" className="bg-slate-900 hover:bg-slate-800 dark:bg-secondary dark:hover:bg-secondary-dark text-white dark:text-primary px-6 py-3 rounded-2xl text-xs font-black shadow-md transition-transform active:scale-95 flex items-center gap-1.5">
                {t('browseNotesBtn')} <ChevronRight className="w-4 h-4" />
              </Link>
              <Link to="/papers" className="bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-6 py-3 rounded-2xl text-xs font-black transition-transform active:scale-95">
                {t('previousPapersBtn')}
              </Link>
            </div>
          </div>

          {/* Minimal Legal Illustration Panel */}
          <div className="lg:col-span-5 hidden lg:flex justify-center relative">
            <div className="absolute w-72 h-72 bg-slate-200/50 dark:bg-slate-800/20 filter blur-3xl rounded-full top-10 right-10 -z-10" />
            <div className="bg-white dark:bg-slate-850/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-sm w-full shadow-xl relative backdrop-blur-md">
              <div className="absolute -top-6 -left-6 bg-secondary text-primary p-3 rounded-2xl shadow-lg ring-4 ring-white dark:ring-slate-900">
                <Scale className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-4 pt-4">
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-secondary" /> KSLU Course Syllabus
                </h3>
                <div className="space-y-2.5 text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span>3-Year LL.B Course Syllabus</span>
                    <span className="text-secondary font-bold">Updated</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span>5-Year B.A. LL.B Pre-law Grid</span>
                    <span className="text-secondary font-bold">Updated</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span>Constitutional Law Case Digests</span>
                    <span className="text-secondary font-bold">New</span>
                  </div>
                </div>
                <div className="pt-2 text-center">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">Learn • Share • Succeed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Quick Filters Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-16 relative z-20">
        <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
          <MaterialSearch 
            onSearch={handleSearchSubmit} 
            placeholder={t('searchPlaceholder')} 
          />
          <div className="flex flex-wrap gap-2.5 pt-1 items-center">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mr-1">
              {t('quickFilters')}:
            </span>
            {quickFilters.map((filter, index) => (
              <button
                key={index}
                onClick={() => navigate(filter.path)}
                className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 border border-gray-150 dark:border-slate-750 text-slate-700 dark:text-slate-350 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-[1.02]"
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section - ONLY visible after login */}
      {isAuthenticated && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {statsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { id: 'notes', label: t('studyNotes'), value: stats.totalNotes, icon: <FileText className="w-5 h-5 text-slate-800 dark:text-slate-200" />, bg: 'bg-slate-100 dark:bg-slate-800' },
                { id: 'papers', label: t('papers'), value: stats.totalPapers, icon: <BookOpen className="w-5 h-5 text-amber-600 dark:text-secondary" />, bg: 'bg-amber-50 dark:bg-secondary/10' },
                { id: 'downloads', label: t('totalDownloads'), value: stats.totalDownloads, icon: <Download className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />, bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
                { id: 'users', label: t('activeStudents'), value: stats.totalUsers, icon: <Users className="w-5 h-5 text-amber-600 dark:text-amber-500" />, bg: 'bg-amber-50 dark:bg-amber-950/20' },
              ].map((card) => (
                <div 
                  key={card.id} 
                  className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm"
                >
                  <div className={`p-3 rounded-xl ${card.bg}`}>{card.icon}</div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white leading-none">{card.value}</h3>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">{card.label}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </section>
      )}

      {/* Browse by Course */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <span className="text-xs font-bold text-royal dark:text-secondary uppercase tracking-widest">Syllabus Portal</span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">{t('browseCourses')}</h2>
          <p className="text-xs text-slate-500 mt-1">Select your program to access semester-wise modules and subject syllabi.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {COURSES.map(course => (
            <Link
              key={course.id}
              to={`/course/${course.slug}`}
              className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 hover:border-royal dark:hover:border-secondary rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-royal/10 dark:bg-secondary/10 text-royal dark:text-secondary flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-royal dark:group-hover:text-secondary transition-colors">
                  {course.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {course.description}
                </p>
              </div>

              <div className="flex justify-between items-center pt-6 mt-6 border-t border-slate-100 dark:border-slate-800/80 text-[10px] font-bold text-slate-500 dark:text-slate-500">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-royal dark:text-secondary" /> {course.stats.subjects} Subjects
                </span>
                <span className="text-royal dark:text-secondary flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                  Browse Course <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Resources Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <span className="text-xs font-bold text-royal dark:text-secondary uppercase tracking-widest">Recommended</span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Featured Study Resources</h2>
        </div>
        {featuredLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-44 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-450 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
            No featured materials available yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.map(mat => (
              <MaterialCard key={mat._id} material={mat} />
            ))}
          </div>
        )}
      </section>

      {/* Recent Contributions & Leaderboard Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recent Contributions */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-xs font-bold text-royal dark:text-secondary uppercase tracking-widest">Newly Published</span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Recent Uploads</h3>
              </div>
              <Link to="/notes" className="text-xs font-bold text-royal dark:text-secondary flex items-center gap-0.5 hover:underline">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {recentLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-44 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : recent.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
                No resources published yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {recent.slice(0, 4).map(mat => (
                  <MaterialCard key={mat._id} material={mat} />
                ))}
              </div>
            )}
          </div>

          {/* Top Contributors Leaderboard */}
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-royal dark:text-secondary uppercase tracking-widest">Leaderboard</span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Top Contributors</h3>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
              {statsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-12 bg-gray-100 dark:bg-slate-800 animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : topContributors.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">Leaderboard currently empty.</p>
              ) : (
                topContributors.map((c, idx) => (
                  <div key={c._id} className="flex items-center justify-between gap-2 py-1">
                    <div className="flex items-center gap-3">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ${
                        idx === 0 ? 'bg-yellow-500 text-white animate-bounce' : idx === 1 ? 'bg-slate-300 text-slate-800' : idx === 2 ? 'bg-amber-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {idx + 1}
                      </span>
                      <img 
                        src={c.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${c.name}`} 
                        alt={c.name}
                        className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-100 dark:ring-slate-800"
                      />
                      <div>
                        <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 line-clamp-1">{c.name}</h4>
                        <p className="text-[9px] text-slate-400 dark:text-slate-500 truncate max-w-[130px]">KSLU Student</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-black text-royal dark:text-secondary tracking-wider bg-royal/5 dark:bg-secondary/5 border border-royal/10 dark:border-secondary/10 px-2 py-0.5 rounded">
                      {c.reputation} ⭐
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default Home;
