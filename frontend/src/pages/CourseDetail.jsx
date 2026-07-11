import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { COURSES, SUBJECTS_MAP } from '../utils/coursesData';
import SEO from '../components/common/SEO';
import { useTranslation } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, GraduationCap, ChevronRight, FileText, LayoutGrid } from 'lucide-react';

const CourseDetail = () => {
  const { courseSlug } = useParams();
  const { t } = useTranslation();
  const course = COURSES.find(c => c.slug === courseSlug);
  const [selectedSemester, setSelectedSemester] = useState(1);

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold">{t('courseNotFound')}</h2>
        <Link to="/" className="text-royal hover:underline mt-4 inline-block">Go back to Home</Link>
      </div>
    );
  }

  const semestersList = Array.from({ length: course.semesters }, (_, i) => i + 1);
  const subjects = SUBJECTS_MAP[course.id]?.[selectedSemester] || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 transition-colors duration-300">
      <SEO 
        title={`${course.name} Study Materials & Semesters`}
        description={`Explore lecture notes, syllabus courses, and question papers for ${course.name}. View curriculum modules semester-wise.`}
        canonicalUrl={`https://kslucircle.online/course/${courseSlug}`}
      />

      {/* Breadcrumbs */}
      <nav className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
        <Link to="/" className="hover:text-royal transition-colors">{t('home')}</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-800 dark:text-slate-200">{course.name}</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 text-slate-900 dark:text-white rounded-3xl p-8 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-5 dark:opacity-10 translate-x-10 translate-y-10 text-slate-200 dark:text-slate-800">
          <GraduationCap className="w-80 h-80" />
        </div>
        <div className="max-w-2xl space-y-3 relative z-10">
          <span className="inline-block bg-slate-100 dark:bg-secondary text-slate-700 dark:text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
            {t('academicHub')}
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">{course.name}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed">{course.description}</p>
        </div>
      </div>

      {/* Semester Selector Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-royal dark:text-secondary" /> {t('selectSemester')}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-10 gap-3">
          {semestersList.map(sem => {
            const isSelected = selectedSemester === sem;
            return (
              <button
                key={sem}
                onClick={() => setSelectedSemester(sem)}
                className={`py-3.5 px-4 rounded-2xl text-xs font-bold border transition-all text-center ${
                  isSelected 
                    ? 'bg-royal border-royal text-white dark:bg-secondary dark:border-secondary dark:text-primary shadow-md' 
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-750 hover:scale-[1.02]'
                }`}
              >
                {t('semester')} {sem}
              </button>
            );
          })}
        </div>
      </div>

      {/* Subjects Section */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            {t('semester')} {selectedSemester} {t('notes')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('syllabusMapped')}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={selectedSemester}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {subjects.map(sub => {
              const subjectSlug = sub.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
              return (
                <Link
                  key={sub.code}
                  to={`/course/${courseSlug}/semester/${selectedSemester}/subject/${subjectSlug}?code=${sub.code}`}
                  className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800/80 hover:border-royal dark:hover:border-secondary rounded-2xl p-5 shadow-sm transition-all hover:shadow-md hover:scale-[1.01] flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] font-extrabold text-royal dark:text-secondary uppercase tracking-wider bg-slate-50 dark:bg-gray-850 border border-slate-100 dark:border-slate-800 px-2 py-0.5 rounded">
                        {sub.code}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                        {sub.credits} {t('credits')}
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 leading-snug group-hover:text-royal dark:group-hover:text-secondary transition-colors">
                      {sub.name}
                    </h4>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-4 text-[10px] font-bold text-slate-400 dark:text-slate-500">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" /> {t('maxMarks')}: {sub.marks}
                    </span>
                    <span className="text-royal dark:text-secondary flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                      {t('viewResources')} <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CourseDetail;
