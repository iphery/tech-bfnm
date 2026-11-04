"use client";
import React from "react";

export const ButtonLoader = ({ color = "white" }) => {
  return (
    <div className="flex items-center justify-center gap-2">
      <div
        className={`h-4 w-4 animate-spin rounded-full border-2 border-solid border-${color} border-t-transparent`}
      ></div>
      <span className={`text-xs font-semibold text-${color}`}>Memproses...</span>
    </div>
  );
};

export const TextLoader = ({ color = "primary" }) => {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <div
        className={`h-4 w-4 animate-spin rounded-full border-2 border-solid border-${color} border-t-transparent`}
      ></div>
      <span className={`text-xs font-medium text-${color}`}>Memuat data...</span>
    </div>
  );
};

export const CommonLoader = ({ color = "primary" }) => {
  return (
    <div
      className={`h-5 w-5 animate-spin rounded-full border-2 border-solid border-${color} border-t-transparent`}
    ></div>
  );
};

/**
 * Mobile Card List Skeleton Shimmer
 */
export const CardSkeleton = ({ count = 5 }) => {
  return (
    <div className="space-y-3 p-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-200/70 dark:border-strokedark/50 bg-white dark:bg-boxdark p-4 shadow-sm space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="h-4 w-28 rounded-md bg-slate-200/80 dark:bg-slate-700/60"></div>
            <div className="h-4 w-16 rounded-full bg-slate-200/80 dark:bg-slate-700/60"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-3/4 rounded-md bg-slate-200/80 dark:bg-slate-700/60"></div>
            <div className="h-3 w-1/2 rounded-md bg-slate-100 dark:bg-slate-700/40"></div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-strokedark/50">
            <div className="h-3 w-20 rounded-md bg-slate-100 dark:bg-slate-700/40"></div>
            <div className="h-3 w-16 rounded-md bg-slate-200/80 dark:bg-slate-700/60"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Desktop Table Rows Skeleton
 */
export const TableSkeleton = ({ rows = 6, cols = 5 }) => {
  return (
    <div className="w-full animate-pulse p-4 space-y-4">
      {/* Table header placeholder */}
      <div className="h-10 w-full rounded-xl bg-slate-200/60 dark:bg-slate-700/50"></div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="flex items-center gap-4 py-3 border-b border-slate-100 dark:border-strokedark/50"
        >
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              className={`h-4 rounded-md bg-slate-200/70 dark:bg-slate-700/50 ${
                c === 0 ? "w-10" : c === 1 ? "w-48" : "flex-1"
              }`}
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
};

/**
 * Detail Screen Skeleton
 */
export const DetailSkeleton = () => {
  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-4 animate-pulse">
      <div className="h-6 w-40 rounded-lg bg-slate-200/80 dark:bg-slate-700/60"></div>
      <div className="rounded-2xl border border-slate-200/70 dark:border-strokedark/50 bg-white dark:bg-boxdark p-6 space-y-4 shadow-sm">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="h-6 w-60 rounded-md bg-slate-200/80 dark:bg-slate-700/60"></div>
            <div className="h-4 w-36 rounded-md bg-slate-100 dark:bg-slate-700/40"></div>
          </div>
          <div className="h-8 w-24 rounded-full bg-slate-200/80 dark:bg-slate-700/60"></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-slate-100 dark:bg-slate-700/30"
            ></div>
          ))}
        </div>
        <div className="space-y-2 pt-4">
          <div className="h-4 w-full rounded-md bg-slate-200/80 dark:bg-slate-700/60"></div>
          <div className="h-4 w-5/6 rounded-md bg-slate-100 dark:bg-slate-700/40"></div>
        </div>
      </div>
    </div>
  );
};

/**
 * Modern Full Page Skeleton
 */
export const PageLoader = () => {
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900/40 text-slate-800 dark:text-slate-100 animate-pulse transition-colors duration-200">
      {/* Top Bar Skeleton */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200/80 bg-white/80 dark:bg-boxdark/80 px-4 backdrop-blur-md dark:border-strokedark/60">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-slate-200/80 dark:bg-slate-700/60"></div>
          <div className="h-4 w-32 rounded-md bg-slate-200/80 dark:bg-slate-700/60"></div>
        </div>
        <div className="h-8 w-8 rounded-xl bg-slate-200/80 dark:bg-slate-700/60"></div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4">
        {/* Search & Actions Bar Placeholder */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
          <div className="h-10 w-full sm:w-80 rounded-xl bg-slate-200/80 dark:bg-slate-700/60"></div>
          <div className="flex gap-2">
            <div className="h-10 w-28 rounded-xl bg-slate-200/80 dark:bg-slate-700/60"></div>
            <div className="h-10 w-24 rounded-xl bg-slate-200/80 dark:bg-slate-700/60"></div>
          </div>
        </div>

        {/* Metric Cards Placeholder */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200/70 dark:border-strokedark/50 bg-white dark:bg-boxdark p-4 shadow-sm space-y-2"
            >
              <div className="h-3 w-16 rounded bg-slate-200/70 dark:bg-slate-700/50"></div>
              <div className="h-6 w-20 rounded bg-slate-300/80 dark:bg-slate-700/70"></div>
            </div>
          ))}
        </div>

        {/* List / Table Card Placeholder */}
        <div className="rounded-2xl border border-slate-200/70 dark:border-strokedark/50 bg-white dark:bg-boxdark p-4 sm:p-6 shadow-sm space-y-3">
          <div className="h-4 w-44 rounded bg-slate-200/80 dark:bg-slate-700/60 mb-4"></div>
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-strokedark/50 last:border-0"
            >
              <div className="space-y-1.5 flex-1">
                <div className="h-4 w-48 rounded bg-slate-200/80 dark:bg-slate-700/60"></div>
                <div className="h-3 w-32 rounded bg-slate-100 dark:bg-slate-700/40"></div>
              </div>
              <div className="h-6 w-20 rounded-full bg-slate-200/80 dark:bg-slate-700/60"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
