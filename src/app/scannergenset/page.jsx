"use client";

import { Scanner } from "@yudiel/react-qr-scanner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DataProvider, useProvider } from "@/app/appcontext";
import Loader from "@/components/common/Loader";
import { PageLoader } from "@/components/loader";
import { API_URL } from "@/utils/constant";
import axios from "axios";
import { NotifyError } from "@/utils/notify";

const Page = () => {
  const router = useRouter();
  const [mode, setMode] = useState(0);
  const { scanGenset, setScanGenset, gensetSelectedId } = useProvider();
  const [loader, setLoader] = useState(false);

  const scan_result = (value) => {
    //setScanGenset(value);
    setLoader(true);
    if (value != "BFNMF0402") {
      wrong_qr();
    } else {
      save();
    }
  };

  const save = async () => {
    const user = localStorage.getItem("info");
    const parseUser = JSON.parse(user);

    //save disini
    const apiUrl = `${API_URL}/updatepemanasan`;
    const response = await axios.post(apiUrl, {
      idRequest: gensetSelectedId,
      uid: parseUser[0]["Uid"],
    });
    if (response.status == 200) {
      router.back();
    }
  };

  const wrong_qr = () => {
    NotifyError("Invalid QRCode");
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
