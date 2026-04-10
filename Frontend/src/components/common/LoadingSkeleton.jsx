import React from "react";

export const CardSkeleton = () => {
  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white overflow-hidden flex flex-col h-full animate-pulse">
      {/* Image Container Skeleton */}
      <div className="relative aspect-[4/3] bg-surface-container-high overflow-hidden">
        <div className="w-full h-full skeleton-shimmer" />
      </div>

      {/* Content Container Skeleton */}
      <div className="p-6 flex flex-col flex-grow space-y-4">
        <div className="space-y-2">
          <div className="h-2 w-20 bg-surface-container-highest rounded-full skeleton-shimmer" />
          <div className="h-6 w-full bg-surface-container-highest rounded-xl skeleton-shimmer" />
          <div className="h-6 w-3/4 bg-surface-container-highest rounded-xl skeleton-shimmer" />
        </div>

        <div className="mt-auto flex justify-between items-center pt-4 border-t border-outline-variant/5">
          <div className="h-4 w-16 bg-surface-container-highest rounded-full skeleton-shimmer" />
          <div className="w-10 h-10 rounded-xl bg-surface-container-highest skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
};

export const RecipeListSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
};

export const HeroSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-24 grid md:grid-cols-2 gap-12 items-center animate-pulse">
      <div className="space-y-8">
        <div className="h-6 w-48 bg-surface-container-high rounded-full skeleton-shimmer" />
        <div className="space-y-4">
          <div className="h-16 w-3/4 bg-surface-container-high rounded-3xl skeleton-shimmer" />
          <div className="h-16 w-1/2 bg-surface-container-high rounded-3xl skeleton-shimmer" />
        </div>
        <div className="h-20 w-full bg-surface-container-high rounded-2xl skeleton-shimmer" />
        <div className="flex gap-4">
          <div className="h-14 w-40 bg-surface-container-high rounded-xl skeleton-shimmer" />
          <div className="h-14 w-40 bg-surface-container-high rounded-xl skeleton-shimmer" />
        </div>
      </div>
      <div className="h-[500px] w-full bg-surface-container-high rounded-[2rem] skeleton-shimmer" />
    </div>
  );
};
