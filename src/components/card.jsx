import React from "react";
import { AiOutlineQuestionCircle } from "react-icons/ai";
import { HiCheckCircle } from "react-icons/hi2";

export const ProgressCard = ({ title, name, dateString, isActive }) => {
  return (
    <div className={`flex flex-row items-center justify-between p-2 rounded-lg transition-colors ${
      isActive 
        ? "bg-primary/5 dark:bg-primary/10 border border-primary/20" 
        : "bg-gray-50 dark:bg-meta-4/20 opacity-60"
    } mb-1.5`}>
      <div className="flex items-center gap-2">
        {isActive ? (
          <HiCheckCircle className="text-success text-base shrink-0" />
        ) : (
          <AiOutlineQuestionCircle className="text-body dark:text-bodydark text-base shrink-0 opacity-40" />
        )}
        <span className={`text-xs font-semibold ${isActive ? "text-black dark:text-white" : "text-body dark:text-bodydark"}`}>
          {title}
        </span>
      </div>
      {isActive && (
        <div className="flex flex-col text-right">
          <span className="text-xs font-medium text-black dark:text-white">{name || "-"}</span>
          <span className="text-[10px] text-body dark:text-bodydark">{dateString}</span>
        </div>
      )}
    </div>
  );
};

export const ProgressSummary = ({ title, hour, isActive }) => {
  return (
    <div className="flex flex-row items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-meta-4/20 mb-1.5 border border-stroke/50 dark:border-strokedark/50">
      <span className="text-xs font-medium text-black dark:text-white">{title}</span>
      {isActive ? (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary">
          {hour} Jam
        </span>
      ) : (
        <AiOutlineQuestionCircle className="text-body dark:text-bodydark text-sm opacity-40" />
      )}
    </div>
  );
};

export const PageCard = ({ children, className = "" }) => {
  return (
    <div className={`w-full rounded-xl border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark ${className}`}>
      {children}
    </div>
  );
};

export const PageCardLimited = ({ children, className = "" }) => {
  return (
    <div className={`w-full flex-1 rounded-xl border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark ${className}`}>
      {children}
    </div>
  );
};
