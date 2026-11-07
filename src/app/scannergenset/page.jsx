"use client";

import { Scanner } from "@yudiel/react-qr-scanner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DataProvider, useProvider } from "@/app/appcontext";
import Loader from "@/components/common/Loader";
import { PageLoader } from "@/components/loader";
import axios from "axios";
import { NotifyError, NotifySuccess } from "@/utils/notify";
import { HiArrowLeft } from "react-icons/hi2";
import { BsFire, BsQrCodeScan } from "react-icons/bs";

const Page = () => {
  const router = useRouter();
  const { gensetSelectedId } = useProvider();
  const [loader, setLoader] = useState(false);

  const scan_result = (value) => {
    setLoader(true);
    const scanned = String(value || "").trim().toUpperCase();
    if (scanned !== "BFNMF0402") {
      wrong_qr();
    } else {
      save();
    }
  };

  const save = async () => {
    try {
      const user = localStorage.getItem("info");
      const parseUser = user ? JSON.parse(user) : [{}];
      const uid = parseUser[0]?.Uid || "";

      const apiUrl = "/api/updatepemanasan";
      const response = await axios.post(apiUrl, {
        idRequest: gensetSelectedId,
        uid: uid,
      });

      if (response.status === 200) {
        NotifySuccess("Scan pemanasan genset berhasil!");
        router.back();
      } else {
        NotifyError("Gagal memperbarui status pemanasan");
        setLoader(false);
      }
    } catch (e) {
      console.error(e);
      NotifyError("Terjadi kesalahan saat memproses data");
      setLoader(false);
    }
  };

  const wrong_qr = () => {
    NotifyError("QRCode salah! Bukan QR Genset BFNMF0402");
    setLoader(false);
  };

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col justify-between">
      {/* Top Floating Appbar */}
      <div className="absolute top-0 inset-x-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-md hover:bg-white/30 transition active:scale-95 shadow-md"
        >
          <HiArrowLeft className="text-xl" />
        </button>
        <div className="flex items-center gap-2 rounded-full bg-danger/80 px-3.5 py-1 text-xs font-bold shadow-lg backdrop-blur-md">
          <BsFire className="text-sm" />
          <span>Scan Pemanasan Genset</span>
        </div>
        <div className="w-10" />
      </div>

      {loader ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-xs text-white/80">Memproses verifikasi genset...</span>
        </div>
      ) : (
        <div className="relative flex flex-1 items-center justify-center overflow-hidden">
          <Scanner
            onScan={(result) => {
              if (result && result[0]?.rawValue) {
                scan_result(result[0].rawValue);
              }
            }}
          />
          {/* Viewfinder Target Framing */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <div className="relative h-64 w-64 rounded-3xl border-2 border-dashed border-danger/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-danger px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow">
                BFNMF0402
              </div>
            </div>
            <p className="mt-4 text-xs font-medium text-white/90 drop-shadow">
              Arahkan kamera ke QR Code unit Genset
            </p>
          </div>
        </div>
      )}

      {/* Bottom info helper */}
      <div className="p-4 text-center text-[11px] text-white/60 bg-gradient-to-t from-black/90 to-transparent">
        Genset Request ID: <span className="font-mono text-white font-bold">{gensetSelectedId || "-"}</span>
      </div>
    </div>
  );
};

export default Page;
