import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-5 space-y-4 animate-pulse shadow-sm">
      <div className="flex justify-between items-center">
        <div className="w-16 h-5 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
      </div>
      <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-lg w-3/4"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/2"></div>
      <div className="flex gap-2 pt-1">
        <div className="w-12 h-4 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
        <div className="w-16 h-4 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
      </div>
      <div className="border-t border-gray-100 dark:border-gray-800 pt-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-gray-800"></div>
          <div className="w-16 h-3 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
        </div>
        <div className="w-20 h-8 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
      </div>
    </div>
  );
};

export default SkeletonCard;
