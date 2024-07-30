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
