"use client";

import React, { useRef, useState } from "react";
import Webcam from "react-webcam";

const CameraPage = () => {
  const webcamRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);

  const capture = () => {
    const image = webcamRef.current.getScreenshot();
    setImageSrc(image);
    console.log(image);
  };

  const videoConstraints = {
    facingMode: { exact: "environment" },
  };

  return (
    <div className="relative h-screen w-screen">
      <Webcam
        audio={false}
        ref={webcamRef}
        videoConstraints={videoConstraints}
        screenshotFormat="image/jpeg"
        className="absolute left-0 top-0 w-full "
      />
      <button
        onClick={capture}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 transform rounded-md bg-blue-500 p-3 text-white"
      >
        Capture
      </button>
      {imageSrc && (
        <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center bg-black bg-opacity-75">
          <img
            src={imageSrc}
            alt="Captured"
            className="max-h-full max-w-full"
          />
          <button
            onClick={() => setImageSrc(null)}
            className="bg-red-500 absolute right-5 top-5 rounded-md p-2 text-white"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default CameraPage;
