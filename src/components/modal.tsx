"use client";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { HiOutlineXMark } from "react-icons/hi2";

export const CustomModal = ({
  isVisible,
  isOpen,
  onClose,
  isSmallWidth,
  title,
  children,
}: {
  isVisible?: boolean;
  isOpen?: boolean;
  isSmallWidth?: string;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const show = isVisible !== undefined ? isVisible : (isOpen !== undefined ? isOpen : true);

  useEffect(() => {
    if (show && mounted) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [show, mounted]);

  if (!show || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-999999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 animate-fade-in"
      style={{ zIndex: 999999 }}
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
            : isSmallWidth === "lg"
            ? "sm:max-w-3xl"
            : isSmallWidth === "xl"
            ? "sm:max-w-5xl"
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
          {title && (
            <div className="border-b border-stroke px-5 py-3.5 dark:border-strokedark">
              <h3 className="text-sm font-bold text-black dark:text-white">
                {title}
              </h3>
            </div>
          )}
          {title ? (
            <div className="p-5 overflow-y-auto">{children}</div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
