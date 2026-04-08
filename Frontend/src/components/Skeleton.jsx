import React from 'react';

const shimmerClass = "animate-pulse bg-gradient-to-r from-surface-container-high via-outline-variant/20 to-surface-container-high bg-[length:200%_100%]";

export const SkeletonText = ({ lines = 3, className = '' }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {[...Array(lines)].map((_, i) => (
        <div
          key={i}
          className={`h-4 rounded ${shimmerClass}`}
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
};

export const SkeletonCard = ({ className = '' }) => {
  return (
    <div className={`bg-white/60 rounded-[2rem] p-6 border border-white shadow-sm ${shimmerClass} ${className}`}>
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-surface-container-high" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded" />
          <div className="h-3 w-1/2 rounded" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 rounded" />
        <div className="h-3 rounded" />
        <div className="h-3 w-4/5 rounded" />
      </div>
    </div>
  );
};

export const SkeletonImage = ({ className = '' }) => {
  return (
    <div className={`rounded-[2rem] overflow-hidden ${shimmerClass} ${className}`}>
      <div className="aspect-video" />
    </div>
  );
};

export const SkeletonProfile = () => {
  return (
    <div className="bg-white/60 backdrop-blur-2xl rounded-[3rem] p-10 border border-white botanical-shadow">
      <div className="flex flex-col md:flex-row items-center gap-10">
        <div className="w-40 h-40 rounded-[2.5rem] bg-surface-container-high" />
        <div className="flex-grow space-y-4 text-center md:text-left">
          <div className="h-10 w-48 rounded mx-auto md:mx-0" />
          <div className="h-6 w-64 rounded mx-auto md:mx-0" />
          <div className="flex gap-4 justify-center md:justify-start">
            <div className="h-16 w-32 rounded-[2rem]" />
            <div className="h-16 w-32 rounded-[2rem]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const SkeletonRecipeCard = () => {
  return (
    <div className="bg-white/60 rounded-[2rem] overflow-hidden border border-white shadow-sm">
      <div className="h-48 bg-surface-container-high" />
      <div className="p-6 space-y-4">
        <div className="h-6 w-3/4 rounded" />
        <div className="h-4 w-full rounded" />
        <div className="h-4 w-2/3 rounded" />
        <div className="flex gap-2">
          <div className="h-8 w-20 rounded-full" />
          <div className="h-8 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export const SkeletonGrid = ({ count = 6, cardType = 'card' }) => {
  const Skeleton = cardType === 'recipe' ? SkeletonRecipeCard : SkeletonCard;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, i) => (
        <Skeleton key={i} />
      ))}
    </div>
  );
};

const SkeletonStyles = () => (
  <style>{`
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    .animate-pulse {
      animation: shimmer 1.5s ease-in-out infinite;
    }
  `}</style>
);

export default SkeletonStyles;