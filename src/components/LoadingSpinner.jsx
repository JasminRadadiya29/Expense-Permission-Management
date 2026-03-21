import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ 
  size = 'md', 
  text = 'Loading...', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-7 w-7',
    lg: 'h-10 w-10'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <div className="relative">
        {/* Outer glow ring */}
        <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-blue-400/20 blur-sm animate-pulse`}></div>
        {/* Spinning loader */}
        <Loader2 className={`relative ${sizeClasses[size]} text-blue-600 animate-spin`} />
      </div>
      {text && (
        <span className={`font-medium text-slate-700 ${textSizeClasses[size]}`}>
          {text}
        </span>
      )}
    </div>
  );
};

export default LoadingSpinner;