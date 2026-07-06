import React from 'react';

const LoadingSpinner = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className="flex justify-center items-center py-6">
      <div className={`animate-spin rounded-full border-secondary border-t-transparent ${sizeClasses[size]}`}></div>
    </div>
  );
};

export default LoadingSpinner;
