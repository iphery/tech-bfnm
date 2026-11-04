import React, { ReactNode } from "react";

interface CardDataStatsProps {
  title: string;
  total: string;
  //rate: string;
  //levelUp?: boolean;
  //levelDown?: boolean;
  children: ReactNode;
}

const CardDataStats: React.FC<CardDataStatsProps> = ({
  title,
  total,
  //rate,
  //levelUp,
  //levelDown,
  children,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-boxdark/80">
      <div className="flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-boxdark-2 shadow-inner">
          {children}
        </div>
      </div>

      <div className="mt-4">
        <h4 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          {total}
        </h4>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
      </div>
    </div>
  );
};

export default CardDataStats;
