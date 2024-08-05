import React from "react";

export const ButtonLoader = ({ color }) => {
  return (
    <div className="flex flex-row justify-center">
      <div
        className={`h-5 w-5 animate-spin rounded-full border-2 border-solid border-${color} border-t-transparent`}
      ></div>
      <div className={`pl-2 text-${color}`}>Please wait..</div>
    </div>
  );
};

export const TextLoader = ({ color }) => {
  return (
    <div className="flex flex-row justify-center">
      <div
        className={`h-5 w-5 animate-spin rounded-full border-2 border-solid border-${color} border-t-transparent`}
      ></div>
      <div className={`pl-2 text-${color}`}>Please wait..</div>
    </div>
  );
};

export const CommonLoader = ({ color }) => {
  return (
    <div
      className={`h-4 w-4 animate-spin rounded-full border-2 border-solid border-${color} border-t-transparent`}
    ></div>
  );
};

export const PageLoader = ({ color }) => {
  return (
    <div className="flex  min-h-screen items-center justify-center bg-boxdark-2">
      <div className="relative h-10 w-10">
        <div
          className={`absolute inset-0 h-full w-full animate-spin rounded-full border-2 border-solid border-white border-t-transparent`}
        ></div>

        <img
          src="/logo/logo.png"
          alt="Inside Loader"
          className="absolute inset-0 h-full w-full rounded-full object-cover p-1"
        />
      </div>
    </div>
  );
};
