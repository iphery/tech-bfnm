"use client";

import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import { DataProvider, useProvider } from "@/app/appcontext";
import { CommonButton } from "@/components/button";
import { useRouter } from "next/navigation";
import { API_URL } from "@/utils/constant";
import axios from "axios";

const CameraPage = () => {
  const webcamRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const { cameraResult, setCameraResult } = useProvider();
  const { globalIdAsset, setGlobalIdAsset } = useProvider();
  const [showCamera, setShowCamera] = useState(false);
  const router = useRouter();
  const [onloadImage, setOnloadImage] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  const capture = () => {
    const image = webcamRef.current.getScreenshot();
    setImageSrc(image);
    setShowCamera(true);
  };

  const videoConstraints = {
    facingMode: { exact: "environment" },
  };

  return (
    <div className="min-h-screen bg-boxdark-2">
      {!showCamera ? (
        <div>
          <Webcam
            audio={false}
            ref={webcamRef}
            // videoConstraints={videoConstraints}
            onUserMedia={() => {
              setCameraReady(true);
            }}
            screenshotFormat="image/jpeg"
            className=" left-0 top-0 w-full "
          />
          {cameraReady ? (
            <div className="mt-5  flex justify-center">
              <CommonButton onClick={capture} label={"Capture"} />
            </div>
          ) : (
            <></>
          )}
        </div>
      ) : (
        <div className=" left-0 top-0 w-full">
          <img
            src={imageSrc}
            alt="Captured"
            className="max-h-full max-w-full"
          />
          <div className="mt-5  flex justify-center">
            {!onloadImage ? (
              <CommonButton
                onClick={() => {
                  setShowCamera(false);
                  setImageSrc(null);
                }}
                label={"Ulangi"}
              />
            ) : (
              <></>
            )}

            <CommonButton
              disabled={onloadImage}
              onload={onloadImage}
              onClick={async () => {
                if (cameraResult == "asset_user") {
                  const apiUrl = `${API_URL}/savinguserimage`;
                  const response = await axios.post(apiUrl, {
                    image: imageSrc,
                    idAsset: globalIdAsset,
                  });

                  if (response.status == 200) {
                    setImageSrc("");
                    setGlobalIdAsset("");
                    setCameraResult("");
                    router.back();
                  }
                }
              }}
              label={"Simpan"}
            />
          </div>
        </div>
      )}
    </div>

    /*imageSrc && (
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
      )*/
  );
};

export default CameraPage;
