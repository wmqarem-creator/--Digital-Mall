import React from 'react';
import { UserRole } from '../types';

interface SkeletonLoaderProps {
  role: UserRole;
}

export default function SkeletonLoader({ role }: SkeletonLoaderProps) {
  // Skeleton template based on role
  return (
    <div className="w-full space-y-6 animate-pulse text-right" dir="rtl">
      {role === 'admin' && (
        <div className="space-y-6">
          {/* Header row skeleton */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-2">
              <div className="h-7 w-64 bg-stone-800 rounded-lg"></div>
              <div className="h-3.5 w-96 bg-stone-850 rounded-md"></div>
            </div>
            <div className="h-10 w-44 bg-stone-800 rounded-xl"></div>
          </div>

          {/* Grid layout containing 4 metrics cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[#1E1E1E] p-6 rounded-2xl border border-stone-800 space-y-3">
                <div className="h-3 w-28 bg-stone-800 rounded"></div>
                <div className="h-8 w-36 bg-stone-800 rounded-lg"></div>
                <div className="h-2.5 w-full bg-stone-850 rounded"></div>
              </div>
            ))}
          </div>

          {/* Large dashboard body split into Sidebar + Main Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Sidebar list items */}
            <div className="lg:col-span-1 bg-[#1E1E1E] border border-stone-800 rounded-2xl p-4 space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-10 w-full bg-stone-800 rounded-xl"></div>
              ))}
            </div>

            {/* Main chart visual container */}
            <div className="lg:col-span-4 bg-[#1E1E1E] border border-stone-800 rounded-2xl p-6 space-y-6">
              <div className="h-6 w-48 bg-stone-800 rounded-md"></div>
              <div className="h-64 w-full bg-stone-900 border border-stone-850 rounded-xl flex items-end justify-between p-4 gap-2">
                {[40, 60, 20, 80, 50, 75, 90, 45, 60, 30].map((h, i) => (
                  <div key={i} style={{ height: `${h}%` }} className="w-full bg-stone-800 rounded-t-md"></div>
                ))}
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-stone-800 rounded"></div>
                <div className="h-4 w-3/4 bg-stone-850 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {role === 'customer' && (
        <div className="space-y-6">
          {/* Top visual Banner carousel skeleton */}
          <div className="w-full h-44 bg-stone-900 border border-stone-800 rounded-2xl p-6 flex flex-col justify-end space-y-3">
            <div className="h-3 w-32 bg-stone-800 rounded"></div>
            <div className="h-8 w-64 bg-stone-800 rounded-lg"></div>
            <div className="h-4 w-96 bg-stone-850 rounded"></div>
          </div>

          {/* Categories slider row skeletons */}
          <div className="space-y-3">
            <div className="h-5 w-40 bg-stone-800 rounded"></div>
            <div className="flex gap-4 overflow-x-hidden py-1">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex flex-col items-center gap-2 min-w-[70px]">
                  <div className="w-16 h-16 bg-stone-800 rounded-full"></div>
                  <div className="h-3 w-12 bg-stone-850 rounded"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Product grid of items (columns of card templates) */}
          <div className="space-y-3">
            <div className="h-5 w-32 bg-stone-800 rounded"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-[#1E1E1E] border border-stone-800 rounded-2xl overflow-hidden p-3 space-y-3">
                  <div className="w-full aspect-square bg-stone-900 rounded-xl"></div>
                  <div className="h-4 w-3/4 bg-stone-800 rounded"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-5 w-16 bg-stone-800 rounded"></div>
                    <div className="h-7 w-20 bg-stone-800 rounded-lg"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {role === 'vendor' && (
        <div className="space-y-6">
          {/* Vendor Welcome card skeleton */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-2">
              <div className="h-7 w-52 bg-stone-800 rounded-lg"></div>
              <div className="h-4 w-80 bg-stone-850 rounded"></div>
            </div>
            <div className="h-10 w-32 bg-stone-800 rounded-xl"></div>
          </div>

          {/* Three columns metrics cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#1E1E1E] p-6 rounded-2xl border border-stone-800 space-y-3">
                <div className="h-3 w-24 bg-stone-800 rounded"></div>
                <div className="h-8 w-32 bg-stone-800 rounded-lg"></div>
                <div className="h-2.5 w-full bg-stone-850 rounded"></div>
              </div>
            ))}
          </div>

          {/* Vendor items table/list visual container */}
          <div className="bg-[#1E1E1E] border border-stone-800 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-stone-850">
              <div className="h-6 w-36 bg-stone-800 rounded"></div>
              <div className="h-8 w-24 bg-stone-800 rounded-lg"></div>
            </div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between items-center py-2.5 border-b border-stone-850 last:border-0 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-stone-900 rounded-lg"></div>
                  <div className="space-y-1.5">
                    <div className="h-4.5 w-40 bg-stone-800 rounded"></div>
                    <div className="h-3 w-20 bg-stone-850 rounded"></div>
                  </div>
                </div>
                <div className="h-6 w-16 bg-stone-800 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Default fallback for staff / receiver / accountant */}
      {role !== 'admin' && role !== 'customer' && role !== 'vendor' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <div className="h-6 w-48 bg-stone-800 rounded"></div>
              <div className="h-3.5 w-64 bg-stone-850 rounded"></div>
            </div>
            <div className="h-10 w-28 bg-stone-800 rounded-xl"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-[#1E1E1E] p-6 rounded-2xl border border-stone-800 space-y-4">
                <div className="h-5 w-32 bg-stone-800 rounded"></div>
                <div className="space-y-2">
                  <div className="h-3.5 w-full bg-stone-850 rounded"></div>
                  <div className="h-3.5 w-full bg-stone-850 rounded"></div>
                  <div className="h-3.5 w-2/3 bg-stone-850 rounded"></div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#1E1E1E] border border-stone-800 rounded-2xl p-6 space-y-3">
            <div className="h-5.5 w-48 bg-stone-800 rounded"></div>
            <div className="space-y-2 pt-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 w-full bg-stone-900 border border-stone-850 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
