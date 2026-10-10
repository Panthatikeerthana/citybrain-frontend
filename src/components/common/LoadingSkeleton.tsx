import React from 'react';

interface LoadingSkeletonProps {
  rows?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ rows = 4, className = '' }) => {
  return (
    <div className={`animate-pulse space-y-4 ${className}`}>
      <div className="h-6 bg-[#E1E7E2] rounded-lg w-1/3"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-[#E1E7E2]/70 rounded-xl"></div>
        ))}
      </div>
      <div className="space-y-2 pt-4">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="h-12 bg-[#E1E7E2]/50 rounded-lg"></div>
        ))}
      </div>
    </div>
  );
};
