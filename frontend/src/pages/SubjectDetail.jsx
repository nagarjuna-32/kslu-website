import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { COURSES, SUBJECTS_MAP } from '../utils/coursesData';
import api from '../api/axios';
import SEO from '../components/common/SEO';
import { useTranslation } from '../contexts/LanguageContext';
import MaterialCard from '../components/materials/MaterialCard';
import SkeletonCard from '../components/common/SkeletonCard';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Calendar, BookOpen, GraduationCap, Download, 
  ChevronRight, Inbox, HelpCircle, Scale, PlusCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';

const SubjectDetail = () => {
  const { courseSlug, semesterNum, subjectSlug } = useParams();
  const location = useLocation();
  const { t } = useTranslation();
  
  // Resolve subject code from query param
  const queryParams = new URLSearchParams(location.search);
  const subjectCode = queryParams.get('code') || '';

  const course = COURSES.find(c => c.slug === courseSlug);
  const semesterSubjects = SUBJECTS_MAP[course?.id]?.[parseInt(semesterNum)] || [];
  const subject = semesterSubjects.find(s => s.code === subjectCode);

  const [activeTab, setActiveTab] = useState('notes'); // 'notes', 'pyqs', 'important', 'books', 'caselaws'
  const [marksFilter, setMarksFilter] = useState(''); // '', '80', '100'
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchResources = async () => {
    setLoading(true);
    try {
      let params = { subjectCode: subjectCode.toUpperCase() };

      if (activeTab === 'notes') {
        params.type = 'note';
      } else if (activeTab === 'pyqs') {
        params.type = 'paper';
      } else if (activeTab === 'important') {
        params.type = 'note';
        params.search = 'important';
      } else if (activeTab === 'books') {
        params.type = 'note';
        params.search = 'book';
      } else if (activeTab === 'caselaws') {
        params.search = 'case law';
      }

      if (marksFilter) {
        params.marks = marksFilter;
      }

      const response = await api.get('/materials', { params });
      if (response.data.success) {
        setMaterials(response.data.materials);
      }
    } catch (err) {
      toast.error('Failed to load subject resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (subjectCode) {
      fetchResources();
    }
  }, [subjectCode, activeTab, marksFilter]);

  if (!course || !subject) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold">{t('subjectNotFound')}</h2>
        <Link to="/" className="text-royal hover:underline mt-4 inline-block">{t('home')}</Link>
      </div>
    );
  }

  const tabs = [
    { id: 'notes', label: t('studyNotesTab'), icon: <FileText className="w-4 h-4" /> },
    { id: 'pyqs', label: t('pyqsTab'), icon: <Calendar className="w-4 h-4" /> },
    { id: 'important', label: t('importantQsTab'), icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'books', label: t('refBooksTab'), icon: <BookOpen className="w-4 h-4" /> },
    { id: 'caselaws', label: t('caseLawsTab'), icon: <Scale className="w-4 h-4" /> }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 transition-colors duration-300">
      <SEO 
        title={`${subject.name} Syllabus, Notes & PYQs`}
        description={`Download previous year papers, reference books, case laws, and lecture notes for ${subject.name} (${subject.code}) at KSLU.`}
        canonicalUrl={`https://kslucircle.online/course/${courseSlug}/semester/${semesterNum}/subject/${subjectSlug}`}
      />

      {/* Breadcrumbs */}
      {/* Breadcrumbs */}
      <nav className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
        <Link to="/" className="hover:text-royal transition-colors">{t('home')}</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to={`/course/${courseSlug}`} className="hover:text-royal transition-colors">{course.name}</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-400">{t('semester')} {semesterNum}</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-800 dark:text-slate-200">{subject.name}</span>
      </nav>

      {/* Main Subject Banner */}
      <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-royal/10 dark:bg-secondary/10 text-royal dark:text-secondary text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded border border-royal/10 dark:border-secondary/10">
              {subject.code}
            </span>
            <span className="text-slate-400 dark:text-slate-500 text-[10px] font-bold">
              {t('semester')} {semesterNum} • {course.name}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {subject.name}
          </h1>
          <div className="flex gap-4 text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>{t('credits')}: {subject.credits}</span>
            <span>•</span>
            <span>{t('marks')}: {subject.marks}</span>
          </div>
        </div>

        <div>
          <Link
            to={`/upload?subjectCode=${subject.code}&subjectName=${encodeURIComponent(subject.name)}&course=${encodeURIComponent(course.name)}${marksFilter ? `&marks=${marksFilter}` : ''}`}
            className="inline-flex items-center gap-2 bg-royal dark:bg-secondary text-white dark:text-primary px-5 py-3 rounded-2xl text-xs font-bold hover:scale-[1.02] active:scale-95 shadow transition-all"
          >
            <PlusCircle className="w-4 h-4" /> {t('upload')}
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <div className="flex gap-2 overflow-x-auto pb-px scrollbar-none">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-bold transition-all relative border-b-2 whitespace-nowrap ${
                  isActive 
                    ? 'border-royal dark:border-secondary text-royal dark:text-secondary' 
                    : 'border-transparent text-slate-500 hover:text-slate-755 dark:hover:text-slate-350'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Marks Scheme Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50/60 dark:bg-slate-900/50 p-2 border border-slate-200 dark:border-slate-800/80 rounded-2xl">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {[
            { id: '', label: t('allSchemes') },
            { id: '80', label: t('marksScheme80') },
            { id: '100', label: t('marksScheme100') }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setMarksFilter(opt.id)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                marksFilter === opt.id
                  ? 'bg-royal dark:bg-secondary text-white dark:text-primary shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        
        <div className="text-[10px] text-slate-450 dark:text-slate-550 font-bold px-2.5 py-1 bg-slate-100 dark:bg-slate-800/40 rounded-lg">
          {t('filterScheme')}
        </div>
      </div>

      {/* Resources content */}
      <div className="space-y-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : materials.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-3xl space-y-4">
            <div className="flex justify-center">
              <Inbox className="w-12 h-12 text-slate-300 dark:text-slate-700" />
            </div>
            <h3 className="text-sm font-bold text-slate-750 dark:text-slate-300">{t('noResources')}</h3>
            <p className="text-xs text-slate-455 dark:text-slate-500 max-w-sm mx-auto leading-relaxed">
              {t('noResourcesDesc')}
            </p>
            <div className="pt-2">
              <Link
                to={`/upload?subjectCode=${subject.code}&subjectName=${encodeURIComponent(subject.name)}&course=${encodeURIComponent(course.name)}${marksFilter ? `&marks=${marksFilter}` : ''}`}
                className="inline-flex items-center gap-1.5 border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-300 px-4 py-2.5 rounded-xl text-xs font-bold hover:border-royal dark:hover:border-secondary transition-all"
              >
                {t('beFirstUpload')} <PlusCircle className="w-4.5 h-4.5 text-royal dark:text-secondary" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map(mat => (
              <MaterialCard key={mat._id} material={mat} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectDetail;
