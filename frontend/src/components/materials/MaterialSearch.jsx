import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import api from '../../api/axios';
import useDebounce from '../../hooks/useDebounce';

const MaterialSearch = ({ onSearch, placeholder = 'Search by title, subject code or course name...' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    onSearch(debouncedSearch);
  }, [debouncedSearch]);

  const fetchSuggestions = async () => {
    try {
      const response = await api.get('/subject-codes');
      if (response.data.success) {
        setSuggestions(response.data.subjects);
      }
    } catch (err) {
      console.error('Failed to load subject suggestions:', err);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const handleSuggestionClick = (code) => {
    setSearchTerm(code);
    setShowSuggestions(false);
  };

  const filteredSuggestions = suggestions.filter(s => 
    s.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase()))
  ).slice(0, 5);

  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        <Search className="absolute left-4 w-5 h-5 text-gray-450 dark:text-gray-550 pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-11 py-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 transition-all shadow-sm focus:shadow-md"
        />
        {searchTerm && (
          <button 
            onClick={() => {
              setSearchTerm('');
              setShowSuggestions(false);
            }}
            className="absolute right-4 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showSuggestions && searchTerm && filteredSuggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl shadow-xl z-40 overflow-hidden py-1.5 border-t-0">
          {filteredSuggestions.map((item) => (
            <div
              key={item.code}
              onClick={() => handleSuggestionClick(item.code)}
              className="px-4 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-55 dark:hover:bg-gray-800/30 cursor-pointer flex justify-between items-center transition-colors"
            >
              <span>{item.code} - {item.name || 'Law Resource'}</span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-850 px-2 py-0.5 rounded-md font-bold">
                {item.count} files
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MaterialSearch;
