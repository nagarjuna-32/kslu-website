import React from 'react';

const MaterialFilters = ({ filters, setFilters, showYearFilter = false }) => {
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const universities = ['KSLU', 'NLSIU', 'Christ', 'Other'];
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
    <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-5 space-y-6 shadow-sm">
      {/* University */}
      <div>
        <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-3">University</h4>
        <div className="flex flex-wrap gap-2">
          {universities.map(uni => (
            <button
              key={uni}
              onClick={() => handleSelect('university', uni)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                filters.university === uni
                  ? 'bg-secondary border-secondary text-white shadow-sm'
                  : 'bg-white dark:bg-gray-800 border-gray-250 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-secondary'
              }`}
            >
              {uni}
            </button>
          ))}
        </div>
      </div>

      {/* Semester */}
      <div>
        <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-3">Semester</h4>
        <div className="grid grid-cols-5 gap-2">
          {semesters.map(sem => (
            <button
              key={sem}
              onClick={() => handleSelect('semester', sem.toString())}
              className={`py-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                filters.semester === sem.toString()
                  ? 'bg-secondary border-secondary text-white shadow-sm'
                  : 'bg-white dark:bg-gray-800 border-gray-250 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-secondary'
              }`}
            >
              S{sem}
            </button>
          ))}
        </div>
      </div>

      {/* Year Filter (only for Papers) */}
      {showYearFilter && (
        <div>
          <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-3">Paper Year</h4>
          <select
            value={filters.year || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
            className="w-full bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-xl px-3 py-2.5 text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:border-secondary"
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
        <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-3">Sort Results</h4>
        <select
          value={filters.sortBy || 'newest'}
          onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
          className="w-full bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-xl px-3 py-2.5 text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:border-secondary"
        >
          {sorts.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Reset */}
      <button
        onClick={() => setFilters({ type: filters.type, semester: '', university: '', year: '', sortBy: 'newest', search: '', subjectCode: '' })}
        className="w-full py-2.5 bg-gray-55 dark:bg-gray-850 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 rounded-xl transition-all"
      >
        Reset Filters
      </button>
    </div>
  );
};

export default MaterialFilters;
