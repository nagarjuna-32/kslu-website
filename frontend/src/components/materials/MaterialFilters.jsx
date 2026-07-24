import React from 'react';

const MaterialFilters = ({ filters, setFilters, showYearFilter = false }) => {
  const courses = ['3-Year LL.B', 'B.A. LL.B', 'B.B.A. LL.B', 'B.Com. LL.B', 'B.Sc. LL.B'];
  const sorts = [
    { value: 'newest', label: 'Newest Uploads' },
    { value: 'downloads', label: 'Most Downloaded' },
    { value: 'views', label: 'Most Viewed' },
    { value: 'upvotes', label: 'Highest Upvoted' }
  ];

  const maxSemesters = filters.course?.includes('3-Year') ? 6 : 10;
  const semesters = Array.from({ length: maxSemesters }, (_, i) => i + 1);

  const handleSelectCourse = (course) => {
    setFilters(prev => {
      const isSelected = prev.course === course;
      return {
        ...prev,
        course: isSelected ? '' : course,
        semester: '', // Reset semester on course change
        marks: '',
        year: ''
      };
    });
  };

  const handleSelect = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key] === value ? '' : value
    }));
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 space-y-6 shadow-sm">
      {/* Course Filter (Always Visible) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Law Course</h4>
          {filters.course && (
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">✓ Selected</span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          {courses.map(course => {
            const isSelected = filters.course === course;
            return (
              <button
                key={course}
                onClick={() => handleSelectCourse(course)}
                className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                  isSelected
                    ? 'bg-royal border-royal text-white dark:bg-secondary dark:border-secondary dark:text-primary shadow-sm'
                    : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-300 hover:border-royal dark:hover:border-secondary'
                }`}
              >
                {course}
              </button>
            );
          })}
        </div>
      </div>

      {/* Semester (Only Visible AFTER Course is selected) */}
      {filters.course && (
        <div className="animate-fadeIn">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Semester
            </h4>
            {filters.semester && (
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">✓ Selected</span>
            )}
          </div>
          <div className="grid grid-cols-5 gap-2">
            {semesters.map(sem => {
              const isSelected = filters.semester === sem.toString();
              return (
                <button
                  key={sem}
                  onClick={() => handleSelect('semester', sem.toString())}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all text-center ${
                    isSelected
                      ? 'bg-royal border-royal text-white dark:bg-secondary dark:border-secondary dark:text-primary shadow-sm'
                      : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-350 hover:border-royal dark:hover:border-secondary'
                  }`}
                >
                  S{sem}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Marks Scheme Filter (Only for Question Papers AFTER Semester is selected) */}
      {filters.course && filters.semester && (filters.type === 'pyq' || filters.type === 'paper' || showYearFilter) && (
        <div className="animate-fadeIn">
          <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-3">Marks Scheme</h4>
          <div className="flex gap-2">
            {[
              { value: '80', label: '80 Marks' },
              { value: '100', label: '100 Marks' }
            ].map(opt => {
              const isSelected = filters.marks === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => handleSelect('marks', opt.value)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all text-center ${
                    isSelected
                      ? 'bg-royal border-royal text-white dark:bg-secondary dark:border-secondary dark:text-primary shadow-sm'
                      : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-750 text-slate-750 dark:text-slate-350 hover:border-royal dark:hover:border-secondary'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 3: Year Filter (Only for Question Papers AFTER Semester is selected) */}
      {filters.course && filters.semester && showYearFilter && (
        <div className="animate-fadeIn">
          <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-3">Paper Year</h4>
          <select
            value={filters.year || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
            className="w-full bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-royal dark:focus:border-secondary"
          >
            <option value="">All Years</option>
            {Array.from({ length: 27 }, (_, i) => 2000 + i).reverse().map(yr => (
              <option key={yr} value={yr}>{yr}</option>
            ))}
          </select>
        </div>
      )}

      {/* Sort Option */}
      <div>
        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-3">Sort Results</h4>
        <select
          value={filters.sortBy || 'newest'}
          onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
          className="w-full bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-royal dark:focus:border-secondary"
        >
          {sorts.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Reset */}
      <button
        onClick={() => setFilters({ type: filters.type, course: '', semester: '', university: '', marks: '', year: '', sortBy: 'newest', search: '', subjectCode: '' })}
        className="w-full py-2.5 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-750 text-xs font-black text-slate-750 dark:text-slate-300 rounded-xl transition-all"
      >
        Reset Filters
      </button>
    </div>
  );
};

export default MaterialFilters;
