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
  AlertCircle, Scale, GraduationCap, Compass, Landmark, Layers 
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

  const [heroTab, setHeroTab] = useState('overview'); // 'overview' | 'pyqs' | 'syllabi' | 'caselaws'
  const [selectedDegree, setSelectedDegree] = useState('3-Year LL.B');
  const [selectedSem, setSelectedSem] = useState('1');
  const [quizAnswerSelected, setQuizAnswerSelected] = useState(null);
  const [showQuizExplanation, setShowQuizExplanation] = useState(false);

  const degreeSemesters = selectedDegree === '3-Year LL.B' ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const legalQuiz = {
    question: "Which landmark Article of the Constitution guarantees the Right to Protection of Life and Personal Liberty?",
    options: [
      { text: "Article 14 - Equality Before Law", correct: false },
      { text: "Article 19 - Freedom of Speech & Expression", correct: false },
      { text: "Article 21 - Right to Life & Personal Liberty", correct: true },
      { text: "Article 32 - Right to Constitutional Remedies", correct: false }
    ],
    explanation: "Article 21 provides that no person shall be deprived of his life or personal liberty except according to procedure established by law. Landmark cases include Maneka Gandhi v. Union of India (1978) & K.S. Puttaswamy (2017)."
  };

  const handleQuizSelect = (index) => {
    setQuizAnswerSelected(index);
    setShowQuizExplanation(true);
  };

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
        <div className="bg-gradient-to-r from-royal via-blue-900 to-indigo-900 text-white py-3 px-4 text-xs font-bold text-center flex items-center justify-center gap-2 relative shadow-lg">
          <AlertCircle className="w-4 h-4 animate-pulse text-amber-400" />
          <span>ANNOUNCEMENT: {announcements[0].title} — {announcements[0].content}</span>
          {announcements[0].link && (
            <a href={announcements[0].link} className="underline pl-1 text-amber-300 hover:text-white transition-colors">Learn More</a>
          )}
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-900 text-slate-800 dark:text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-slate-200 dark:border-slate-800">
        {/* Ambient Gradient Orbs */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 dark:bg-amber-500/15 rounded-full filter blur-3xl animate-pulse-glow -z-10" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600/10 dark:bg-blue-600/15 rounded-full filter blur-3xl animate-pulse-glow -z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-100/60 via-white to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-950 -z-10" />
        
        {/* Subtle legal grid background */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px] -z-10" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Glowing Pill Badge */}
            <span className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 dark:from-amber-400/10 dark:to-amber-400/20 text-slate-900 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-amber-500/30 dark:border-amber-400/30 shadow-sm backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <Landmark className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> {t('tagline')}
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
              Master Law Exams with <span className="gradient-text">KSLU Peer Resources</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
              Access semester-wise lecture notes, previous year question papers, official syllabus modules, and study guides created specifically for law students across Karnataka.
            </p>

            <div className="flex flex-wrap gap-4 pt-3">
              <Link to="/notes" className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 dark:from-amber-400 dark:to-amber-500 dark:hover:from-amber-500 dark:hover:to-amber-600 text-white dark:text-slate-950 px-7 py-3.5 rounded-2xl text-xs font-black shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> {t('browseNotesBtn')} <ChevronRight className="w-4 h-4" />
              </Link>
              <Link to="/papers" className="bg-white hover:bg-slate-50 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-250 dark:border-slate-750 px-7 py-3.5 rounded-2xl text-xs font-black transition-all shadow-sm hover:shadow active:scale-95 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-500" /> {t('previousPapersBtn')}
              </Link>
            </div>
          </div>

          {/* Interactive Glassmorphism Hero Showcase with Interactive Tabs */}
          <div className="lg:col-span-5 hidden lg:flex justify-center relative">
            
            {/* Main Floating Glass Panel */}
            <div className="animate-float-slow glass-panel rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
              <div className="absolute -top-5 -left-5 bg-gradient-to-r from-amber-500 to-amber-600 text-white p-3 rounded-2xl shadow-xl ring-4 ring-white dark:ring-slate-900">
                <Scale className="w-6 h-6" />
              </div>

              {/* Interactive Showcase Tabs */}
              <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl mb-4 text-[10px] font-bold">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'pyqs', label: '📄 PYQs' },
                  { id: 'syllabi', label: '📘 Syllabus' },
                  { id: 'caselaws', label: '⚖️ Case Laws' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setHeroTab(tab.id)}
                    className={`flex-1 py-1.5 rounded-xl transition-all ${
                      heroTab === tab.id
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-amber-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {heroTab === 'overview' && (
                  <div className="space-y-3 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-150 dark:border-slate-750">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        3-Year LL.B Exam Notes & Summaries
                      </span>
                      <span className="text-amber-500 font-bold text-[10px]">Verified</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-150 dark:border-slate-750">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        5-Year B.A. LL.B Question Papers
                      </span>
                      <span className="text-amber-500 font-bold text-[10px]">2015-2026</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-150 dark:border-slate-750">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        Official Syllabus & Subject Digests
                      </span>
                      <span className="text-emerald-500 font-bold text-[10px]">Active</span>
                    </div>
                  </div>
                )}

                {heroTab === 'pyqs' && (
                  <div className="space-y-2.5 text-[11px]">
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Instant PYQ Downloads by Marks Scheme:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Link to="/papers?marks=80" className="p-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl text-center transition-all">
                        <span className="block font-black text-amber-600 dark:text-amber-400 text-sm">80 Marks</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">Regular Exams</span>
                      </Link>
                      <Link to="/papers?marks=100" className="p-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl text-center transition-all">
                        <span className="block font-black text-blue-600 dark:text-blue-400 text-sm">100 Marks</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">Non-CBCS Papers</span>
                      </Link>
                    </div>
                  </div>
                )}

                {heroTab === 'syllabi' && (
                  <div className="space-y-2 text-[11px]">
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-150 dark:border-slate-750 flex justify-between items-center">
                      <span className="font-bold text-slate-800 dark:text-slate-200">3-Year LL.B Curriculum</span>
                      <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded font-bold">6 Semesters</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-150 dark:border-slate-750 flex justify-between items-center">
                      <span className="font-bold text-slate-800 dark:text-slate-200">5-Year Integrated LL.B</span>
                      <span className="text-[10px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded font-bold">10 Semesters</span>
                    </div>
                  </div>
                )}

                {heroTab === 'caselaws' && (
                  <div className="space-y-2 text-[11px]">
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-150 dark:border-slate-750">
                      <p className="font-bold text-amber-600 dark:text-amber-400">Kesavananda Bharati v. State of Kerala (1973)</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Established Basic Structure Doctrine of the Constitution.</p>
                    </div>
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-150 dark:border-slate-750">
                      <p className="font-bold text-blue-600 dark:text-blue-400">Maneka Gandhi v. Union of India (1978)</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Expanded Right to Life & Personal Liberty under Art. 21.</p>
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                  <span>Peer Sharing Platform</span>
                  <span className="text-amber-500">100% Free Access</span>
                </div>
              </div>
            </div>

            {/* Sub Floating Badge */}
            <div className="absolute -bottom-6 -right-4 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 p-3.5 rounded-2xl shadow-xl flex items-center gap-3 backdrop-blur-md">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-base">
                🏆
              </div>
              <div>
                <p className="text-xs font-black text-slate-900 dark:text-white leading-none">10,000+ Downloads</p>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">Law Students Empowered</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Search & Quick Filters Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-16 relative z-20 space-y-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6 backdrop-blur-xl">
          <MaterialSearch 
            onSearch={handleSearchSubmit} 
            placeholder={t('searchPlaceholder')} 
          />
          
          {/* 1-Click Interactive Semester Matrix Navigator */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                ⚡ 1-Click Semester Quick Finder
              </span>
              <div className="flex gap-1.5">
                {['3-Year LL.B', 'B.A. LL.B', 'B.B.A. LL.B'].map(deg => (
                  <button
                    key={deg}
                    onClick={() => { setSelectedDegree(deg); setSelectedSem('1'); }}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      selectedDegree === deg
                        ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {deg}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Semesters:</span>
              {degreeSemesters.map(sem => {
                const isSelected = selectedSem === sem.toString();
                return (
                  <button
                    key={sem}
                    onClick={() => setSelectedSem(sem.toString())}
                    className={`w-8 h-8 rounded-xl text-xs font-black border transition-all flex items-center justify-center ${
                      isSelected
                        ? 'bg-slate-900 dark:bg-amber-400 text-white dark:text-slate-950 border-transparent shadow-md scale-105'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-500'
                    }`}
                  >
                    S{sem}
                  </button>
                );
              })}
              <button
                onClick={() => navigate(`/notes?course=${encodeURIComponent(selectedDegree)}&semester=${selectedSem}`)}
                className="ml-auto bg-amber-500 hover:bg-amber-600 text-slate-950 text-[11px] font-black px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1 active:scale-95"
              >
                Jump to S{selectedSem} Materials <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-1 items-center border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mr-1">
              {t('quickFilters')}:
            </span>
            {quickFilters.map((filter, index) => (
              <button
                key={index}
                onClick={() => navigate(filter.path)}
                className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-300 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-[1.03] shadow-xs"
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Daily Legal Quiz Spotlight Widget */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="lg:col-span-6 space-y-4">
            <span className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-amber-500/30">
              💡 Daily Legal Prep Challenge
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
              {legalQuiz.question}
            </h3>
            <p className="text-xs text-slate-400">
              Test your legal knowledge before exams! Select your answer below to reveal explanation and landmark case laws.
            </p>
          </div>

          <div className="lg:col-span-6 space-y-3">
            {legalQuiz.options.map((opt, idx) => {
              const isSelected = quizAnswerSelected === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleQuizSelect(idx)}
                  className={`w-full text-left p-3.5 rounded-2xl text-xs font-bold border transition-all flex items-center justify-between ${
                    isSelected
                      ? opt.correct
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-rose-500/20 border-rose-500 text-rose-300'
                      : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/80 text-slate-200'
                  }`}
                >
                  <span>{opt.text}</span>
                  {isSelected && (
                    <span className="text-sm">{opt.correct ? '✅ Correct!' : '❌ Try again'}</span>
                  )}
                </button>
              );
            })}

            {showQuizExplanation && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-1.5 animate-fadeIn">
                <p className="font-bold text-amber-400">📖 Explanation & Reference:</p>
                <p className="leading-relaxed text-[11px] text-slate-300">{legalQuiz.explanation}</p>
                <Link to="/notes?search=constitutional+law" className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:underline pt-1">
                  Explore Constitutional Law Notes <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Public Platform Statistics Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { id: 'notes', label: 'Study Notes Available', value: stats?.totalNotes || '1,200+', icon: <FileText className="w-5 h-5 text-amber-500" />, bg: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-900/30' },
            { id: 'papers', label: 'Question Papers', value: stats?.totalPapers || '850+', icon: <BookOpen className="w-5 h-5 text-blue-500" />, bg: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-900/30' },
            { id: 'downloads', label: 'Total Downloads', value: stats?.totalDownloads || '15,000+', icon: <Download className="w-5 h-5 text-emerald-500" />, bg: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-900/30' },
            { id: 'users', label: 'Law Students Community', value: stats?.totalUsers || '5,000+', icon: <Users className="w-5 h-5 text-indigo-500" />, bg: 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200/50 dark:border-indigo-900/30' },
          ].map((card) => (
            <div 
              key={card.id} 
              className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5`}
            >
              <div className={`p-3 rounded-xl border ${card.bg}`}>{card.icon}</div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white leading-none">{card.value}</h3>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">{card.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

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
                  <div key={c._id || idx} className="flex items-center justify-between gap-2 py-1">
                    <div className="flex items-center gap-3">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ${
                        idx === 0 ? 'bg-yellow-500 text-white animate-bounce' : idx === 1 ? 'bg-slate-300 text-slate-800' : idx === 2 ? 'bg-amber-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {idx + 1}
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-royal/10 dark:bg-secondary/10 flex items-center justify-center text-royal dark:text-secondary font-black text-xs">
                        C{idx + 1}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 line-clamp-1">Contributor #{idx + 1}</h4>
                        <p className="text-[9px] text-slate-400 dark:text-slate-500 truncate max-w-[130px]">KSLU Member</p>
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
