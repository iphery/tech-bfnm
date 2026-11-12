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
        className={`relative w-full max-h-[92vh] flex flex-col my-auto ${
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
        <div className="relative rounded-2xl border border-stroke bg-white shadow-2xl dark:border-strokedark dark:bg-boxdark text-black dark:text-white flex flex-col overflow-hidden max-h-[92vh]">
          {/* Close button inside modal container */}
          <button
            type="button"
            aria-label="Tutup Modal"
            className="absolute top-3.5 right-3.5 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-black dark:bg-meta-4 dark:text-gray-300 dark:hover:bg-strokedark dark:hover:text-white transition-colors shadow-sm"
            onClick={() => onClose()}
          >
            <HiOutlineXMark className="text-xl" />
          </button>

          {title && (
            <div className="border-b border-stroke pl-5 pr-12 py-3.5 dark:border-strokedark">
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
