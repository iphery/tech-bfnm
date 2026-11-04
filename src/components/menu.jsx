import React from "react";

export const Menu = ({ children, icon, color = "primary", badge }) => {
  // Pre-configured color variants for sleek industrial cards
  const colorStyles = {
    blue: "text-blue-500 bg-blue-50 border-blue-200/60 dark:bg-blue-950/30 dark:border-blue-800/40 dark:text-blue-400 group-hover:border-blue-400",
    amber: "text-amber-500 bg-amber-50 border-amber-200/60 dark:bg-amber-950/30 dark:border-amber-800/40 dark:text-amber-400 group-hover:border-amber-400",
    cyan: "text-cyan-500 bg-cyan-50 border-cyan-200/60 dark:bg-cyan-950/30 dark:border-cyan-800/40 dark:text-cyan-400 group-hover:border-cyan-400",
    indigo: "text-indigo-500 bg-indigo-50 border-indigo-200/60 dark:bg-indigo-950/30 dark:border-indigo-800/40 dark:text-indigo-400 group-hover:border-indigo-400",
    rose: "text-rose-500 bg-rose-50 border-rose-200/60 dark:bg-rose-950/30 dark:border-rose-800/40 dark:text-rose-400 group-hover:border-rose-400",
    yellow: "text-yellow-600 bg-yellow-50 border-yellow-200/60 dark:bg-yellow-950/30 dark:border-yellow-800/40 dark:text-yellow-400 group-hover:border-yellow-400",
    emerald: "text-emerald-500 bg-emerald-50 border-emerald-200/60 dark:bg-emerald-950/30 dark:border-emerald-800/40 dark:text-emerald-400 group-hover:border-emerald-400",
    purple: "text-purple-500 bg-purple-50 border-purple-200/60 dark:bg-purple-950/30 dark:border-purple-800/40 dark:text-purple-400 group-hover:border-purple-400",
  };

  const selectedColor = colorStyles[color] || colorStyles.blue;

  return (
    <div className="group flex flex-col items-center justify-center cursor-pointer transition-all duration-200 active:scale-95">
      <div className={`relative flex h-15 w-15 sm:h-18 sm:w-18 items-center justify-center rounded-2xl border p-3 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-0.5 ${selectedColor}`}>
        {badge && (
          <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-meta-1 px-1 text-[9px] font-bold text-white shadow">
            {badge}
          </span>
        )}
        <div className="text-2xl sm:text-3xl transition-transform duration-200 group-hover:scale-110">
          {icon}
        </div>
      </div>

      <span className="mt-2 text-center text-xs font-semibold tracking-tight text-slate-700 transition-colors group-hover:text-primary dark:text-slate-300">
        {children}
      </span>
    </div>
  );
};

export default Menu;
