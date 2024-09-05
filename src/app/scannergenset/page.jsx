"use client";

import { Scanner } from "@yudiel/react-qr-scanner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DataProvider, useProvider } from "@/app/appcontext";
import Loader from "@/components/common/Loader";
import { PageLoader } from "@/components/loader";

const Page = () => {
  const router = useRouter();
  const [mode, setMode] = useState(0);
  const { scanGenset, setScanGenset, gensetSelectedId } = useProvider();
  const [loader, setLoader] = useState(false);

  const scan_result = (value) => {
    setScanGenset(value);
    setLoader(true);
    save();
  };

  const save = async () => {
    console.log(gensetSelectedId);
    //save disini
    router.back();
  };

  return (
    <div>
      {loader ? (
        <PageLoader />
      ) : (
        <div className="flex min-h-screen items-center  bg-boxdark-2">
          <Scanner
            onScan={(result) => {
              scan_result(result[0].rawValue);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Page;
