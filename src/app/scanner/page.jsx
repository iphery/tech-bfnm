"use client";

import { Scanner } from "@yudiel/react-qr-scanner";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();

  const scan_result = (value) => {
    console.log(value);
    localStorage.setItem("qrcode", value);
    router.back();
  };

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
