import React from 'react';

const MaterialFilters = ({ filters, setFilters, showYearFilter = false }) => {
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const universities = ['KSLU', 'NLSIU', 'Christ', 'Other'];
  const courses = ['3-Year LL.B', 'B.A. LL.B', 'B.B.A. LL.B', 'B.Com. LL.B', 'B.Sc. LL.B'];
  const sorts = [
    { value: 'newest', label: 'Newest Uploads' },
    { value: 'downloads', label: 'Most Downloaded' },
    { value: 'views', label: 'Most Viewed' },
    { value: 'upvotes', label: 'Highest Upvoted' }
  ];

  const handleSelect = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key] === value ? '' : value
    }));
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 space-y-6 shadow-sm">
      {/* Course Filter */}
      <div>
        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-3">Law Course</h4>
        <div className="flex flex-col gap-1.5">
          {courses.map(course => {
            const isSelected = filters.course === course;
            return (
              <button
                key={course}
                onClick={() => handleSelect('course', course)}
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

      {/* University */}
      <div>
        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-3">University</h4>
        <div className="flex flex-wrap gap-2">
          {universities.map(uni => {
            const isSelected = filters.university === uni;
            return (
              <button
                key={uni}
                onClick={() => handleSelect('university', uni)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  isSelected
                    ? 'bg-royal border-royal text-white dark:bg-secondary dark:border-secondary dark:text-primary shadow-sm'
                    : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-350 hover:border-royal dark:hover:border-secondary'
                }`}
              >
                {uni}
              </button>
            );
          })}
        </div>
      </div>

      {/* Semester */}
      <div>
        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-3">Semester</h4>
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

      {/* Year Filter (only for Papers) */}
      {showYearFilter && (
        <div>
          <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-3">Paper Year</h4>
          <select
            value={filters.year || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-royal dark:focus:border-secondary"
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
        onClick={() => setFilters({ type: filters.type, course: '', semester: '', university: '', year: '', sortBy: 'newest', search: '', subjectCode: '' })}
        className="w-full py-2.5 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-750 text-xs font-black text-slate-750 dark:text-slate-300 rounded-xl transition-all"
      >
        Reset Filters
      </button>
    </div>
  );
};

export default MaterialFilters;
