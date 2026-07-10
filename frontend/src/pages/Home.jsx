import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import SEO from '../components/common/SEO';
import { useAuth } from '../contexts/AuthContext';
import MaterialSearch from '../components/materials/MaterialSearch';
import MaterialCard from '../components/materials/MaterialCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { motion } from 'framer-motion';
import { 
  FileText, Award, Download, Users, ChevronRight, 
  ArrowRight, UploadCloud, BookOpen, AlertCircle, Quote 
} from 'lucide-react';
import toast from 'react-hot-toast';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [topContributors, setTopContributors] = useState([]);
  
  const [featured, setFeatured] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  const [recent, setRecent] = useState([]);
  const [recentLoading, setRecentLoading] = useState(true);

  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);

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

    // 4. Fetch subjects
    api.get('/subject-codes')
      .then(res => {
        if (res.data.success) {
          setSubjects(res.data.subjects.slice(0, 6));
        }
      })
      .catch(err => console.error('Failed to load subjects:', err))
      .finally(() => setSubjectsLoading(false));

    // 5. Fetch announcements
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="space-y-12 pb-16 transition-colors duration-300">
      <SEO />
      
      {/* Announcements Banner */}
      {announcements.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 text-white py-2.5 px-4 text-xs font-bold text-center flex items-center justify-center gap-2 relative">
          <AlertCircle className="w-4 h-4 animate-bounce" />
          <span>ANNOUNCEMENT: {announcements[0].title} — {announcements[0].content}</span>
          {announcements[0].link && (
            <a href={announcements[0].link} className="underline pl-1 hover:text-gray-200">Learn More</a>
          )}
        </div>
      )}

      {/* Hero Section - Loads instantly without waiting for API */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6 text-center space-y-6">
        <div className="absolute inset-0 -z-10 flex items-center justify-center filter blur-3xl opacity-20 pointer-events-none">
          <div className="w-[40rem] h-[25rem] bg-gradient-to-tr from-primary to-secondary rounded-full"></div>
        </div>

        <motion.h1 
          className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tight leading-none"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Your Academic Law Circle, <br/>
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent dark:from-secondary dark:to-yellow-400">
            Powered by Peers.
          </span>
        </motion.h1>

        <motion.p 
          className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Find, download, and share notes, syllabus documents, and old question papers for KSLU and other law colleges across Karnataka.
        </motion.p>

        {/* Search Bar Container */}
        <motion.div 
          className="max-w-2xl mx-auto pt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <MaterialSearch onSearch={handleSearchSubmit} placeholder="Search by title, course code (e.g. KSLU-301)..." />
          <div className="flex justify-center gap-4 mt-4">
            <Link to="/notes" className="text-xs font-bold bg-primary text-white dark:bg-gray-800 dark:text-secondary px-5 py-2.5 rounded-xl hover:bg-secondary dark:hover:bg-secondary dark:hover:text-white transition-all shadow-sm">
              Explore Study Notes
            </Link>
            <Link to="/papers" className="text-xs font-bold border border-gray-250 dark:border-gray-850 hover:border-secondary dark:text-gray-300 px-5 py-2.5 rounded-xl transition-all">
              Question Papers
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Counters Section - ONLY visible after login */}
      {isAuthenticated && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {statsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : stats ? (
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                { id: 'notes', label: 'Study Notes', value: stats.totalNotes, icon: <FileText className="w-5 h-5 text-blue-500" />, bg: 'bg-blue-50 dark:bg-blue-950/20' },
                { id: 'papers', label: 'Question Papers', value: stats.totalPapers, icon: <BookOpen className="w-5 h-5 text-indigo-500" />, bg: 'bg-indigo-50 dark:bg-indigo-950/20' },
                { id: 'downloads', label: 'Total Downloads', value: stats.totalDownloads, icon: <Download className="w-5 h-5 text-emerald-500" />, bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
                { id: 'users', label: 'Active Students', value: stats.totalUsers, icon: <Users className="w-5 h-5 text-amber-500" />, bg: 'bg-amber-50 dark:bg-amber-950/20' },
              ].map((card) => (
                <motion.div 
                  key={card.id} 
                  className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm"
                  variants={itemVariants}
                >
                  <div className={`p-3 rounded-xl ${card.bg}`}>{card.icon}</div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white leading-none">{card.value}</h3>
                    <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">{card.label}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : null}
        </section>
      )}

      {/* Featured Resources Carousel/Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-xs font-bold text-secondary uppercase tracking-widest">Recommended</span>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Featured Study Resources</h2>
          </div>
        </div>
        {featuredLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-44 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-450 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
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

      {/* Recent Uploads Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-xs font-bold text-secondary uppercase tracking-widest">Newly Published</span>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Recent Contributions</h2>
          </div>
          <Link to="/notes" className="text-xs font-bold text-secondary flex items-center gap-0.5 hover:underline">
            View All Notes <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        
        {recentLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-44 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500 border border-dashed border-gray-250 dark:border-gray-800 rounded-2xl">
            No resources published yet. Be the first to upload!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recent.map(mat => (
              <MaterialCard key={mat._id} material={mat} />
            ))}
          </div>
        )}
      </section>

      {/* Popular Subjects & Top Contributors Split */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Top Subjects */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-black text-gray-900 dark:text-white">Popular Subjects</h3>
            {subjectsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : subjects.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-500 border border-dashed border-gray-200 rounded-2xl">
                No subjects registered yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {subjects.map(sub => (
                  <div 
                    key={sub.code}
                    onClick={() => navigate(`/notes?search=${encodeURIComponent(sub.code)}`)}
                    className="cursor-pointer bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 hover:border-secondary dark:hover:border-secondary p-4 rounded-2xl flex items-center justify-between shadow-sm transition-colors"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-primary dark:text-secondary tracking-wide uppercase">{sub.code}</h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium line-clamp-1 mt-0.5">{sub.name || 'Law Syllabus Course'}</p>
                    </div>
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-850 px-2.5 py-1 rounded-lg">
                      {sub.count} files
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Contributors */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-gray-900 dark:text-white">Top Contributors</h3>
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-5 space-y-4 shadow-sm">
              {statsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-10 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : topContributors.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">Leaderboard currently empty.</p>
              ) : (
                topContributors.map((c, idx) => (
                  <div key={c._id} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        idx === 0 ? 'bg-yellow-500 text-white' : idx === 1 ? 'bg-slate-300 text-gray-800' : idx === 2 ? 'bg-amber-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                      }`}>
                        {idx + 1}
                      </span>
                      <img 
                        src={c.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${c.name}`} 
                        alt={c.name}
                        className="w-8 h-8 rounded-lg object-cover ring-1 ring-gray-100 dark:ring-gray-800"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-gray-850 dark:text-gray-200 line-clamp-1">{c.name}</h4>
                        <p className="text-[9px] text-gray-450 dark:text-gray-555 truncate max-w-[150px]">{c.college || 'KSLU College'}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold text-secondary tracking-wider bg-yellow-50 dark:bg-yellow-950/20 px-2 py-0.5 rounded">
                      {c.reputation} ⭐
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        <h3 className="text-lg font-black text-gray-900 dark:text-white text-center">Student Testimonials</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { quote: "Finding previous year papers of KSLU was a headache until I found KSLU Circle. It saved me weeks of prep!", author: "Santhosh M.", role: "3rd Year LLB, Bangalore" },
            { quote: "I uploaded my Constitutional Law summary notes, and got positive comments from students of other colleges. It feels great to contribute.", author: "Aishwarya R.", role: "5-Year BA LLB, Hubballi" },
            { quote: "The clean UI and fast search make indexing law modules super easy. Highly recommended for KSLU students.", author: "Nagarjuna N.", role: "5th Year Student, Dharwad" }
          ].map((t, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
              <Quote className="w-8 h-8 text-secondary/35 dark:text-secondary/20" />
              <p className="text-xs text-gray-650 dark:text-gray-450 italic leading-relaxed">"{t.quote}"</p>
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800/80 mt-2">
                <h4 className="text-xs font-bold text-gray-850 dark:text-gray-200">{t.author}</h4>
                <p className="text-[10px] text-gray-500 mt-0.5">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
