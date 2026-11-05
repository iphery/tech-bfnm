import React from "react";
import { HiOutlineXMark } from "react-icons/hi2";

export const CustomModal = ({
  isVisible,
  onClose,
  isSmallWidth,
  children,
}: {
  isVisible: boolean;
  isSmallWidth: string;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full max-h-[92vh] flex flex-col my-auto ${
          isSmallWidth === "sm"
            ? "sm:max-w-md"
            : isSmallWidth === "md"
            ? "sm:max-w-xl"
            : "sm:max-w-2xl"
        }`}
      >
        <div className="flex justify-end pb-2 shrink-0">
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors shadow-sm"
            onClick={() => onClose()}
          >
            <HiOutlineXMark className="text-xl" />
          </button>
        </div>
        <div className="rounded-2xl border border-stroke bg-white shadow-2xl dark:border-strokedark dark:bg-boxdark text-black dark:text-white flex flex-col overflow-hidden max-h-[calc(92vh-2.5rem)]">
          {children}
        </div>
      </div>
    </div>
  );
};
