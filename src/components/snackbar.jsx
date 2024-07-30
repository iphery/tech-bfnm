"use client";
import { useState, useEffect } from "react";
import { HiOutlineExclamationCircle } from "react-icons/hi2";

export default function Snackbar({ message, show }) {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 transform rounded bg-black bg-opacity-40 px-4 py-2 text-white shadow-lg transition-opacity duration-300">
      <div className="flex flex-row items-center justify-center">
        <div className="pr-2">
          <HiOutlineExclamationCircle />
        </div>
        <div>{message}</div>
      </div>
    </div>
  );
}
