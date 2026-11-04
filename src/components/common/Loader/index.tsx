import React from "react";

const Loader = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-boxdark-2 text-slate-800 dark:text-slate-100 animate-pulse transition-colors duration-200">
      <div className="flex h-14 items-center justify-between border-b border-slate-200/80 bg-white/80 dark:bg-boxdark/80 px-4 backdrop-blur-md dark:border-strokedark">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-slate-200 dark:bg-meta-4/80"></div>
          <div className="h-4 w-28 rounded-md bg-slate-200 dark:bg-meta-4/80"></div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4">
        <div className="h-10 w-full sm:w-80 rounded-xl bg-slate-200 dark:bg-meta-4/80"></div>
        <div className="rounded-2xl border border-slate-200/80 dark:border-strokedark bg-white dark:bg-boxdark p-6 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-strokedark">
              <div className="h-4 w-48 rounded bg-slate-200 dark:bg-meta-4/80"></div>
              <div className="h-4 w-16 rounded bg-slate-100 dark:bg-meta-4/50"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Loader;
