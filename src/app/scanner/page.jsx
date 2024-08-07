"use client";

import { Scanner } from "@yudiel/react-qr-scanner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Page = () => {
  const router = useRouter();
  const [mode, setMode] = useState(0);

  const scan_result = (value) => {
    if (mode == 0) {
      localStorage.setItem("qrcode", value);
    } else {
      localStorage.setItem("qrcode_case", value);
    }

    router.back();
  };

  useEffect(() => {
    const getMode = localStorage.getItem("scanner_mode");
    setMode(getMode);
  }, []);

  return (
    <div className="flex min-h-screen items-center  bg-boxdark-2">
      <Scanner
        onScan={(result) => {
          scan_result(result[0].rawValue);
        }}
      />
    </div>
  );
};

export default Page;
