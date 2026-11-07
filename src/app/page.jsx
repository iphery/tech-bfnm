"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LiaUser } from "react-icons/lia";
import {
  MdLogout,
  MdOutlineAccessTime,
  MdOutlineAddBox,
  MdOutlineCalendarMonth,
  MdOutlineDocumentScanner,
  MdOutlineDarkMode,
  MdOutlineLightMode,
  MdBuild,
  MdEngineering,
  MdOutlineQrCodeScanner,
  MdOutlineHome,
  MdOutlineAssignment,
  MdOutlineHandyman,
  MdDirectionsCar,
  MdPrecisionManufacturing,
  MdAcUnit,
  MdComputer,
  MdLocalFireDepartment,
  MdElectricBolt,
  MdOutlineWaterDrop,
  MdOutlineWidgets,
} from "react-icons/md";
import { useMediaQuery } from "react-responsive";
import { auth } from "@/app/firebase-config";
import { signOut } from "firebase/auth";

import {
  IMAGE_ASSET,
  IMAGE_PROFILE,
} from "@/utils/constant";
import axios from "axios";
import { Menu } from "@/components/menu";
import UserAuth from "@/components/auth";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { AiTwotonePicture } from "react-icons/ai";
import { useProvider } from "@/app/appcontext";
import { formatTime, shortDate } from "@/utils/dateformat";
import Notifikasi from "@/components/notifikasi";
import ECommerce from "@/components/Dashboard/E-commerce";
import BudgetPosOverview from "@/components/Dashboard/BudgetPosOverview";
import useColorMode from "@/hooks/useColorMode";

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const isSmallScreen = useMediaQuery({ query: "(max-width: 640px)" });
  const router = useRouter();
  const [openScanner, setOpenScanner] = useState(false);
  const [colorMode, setColorMode] = useColorMode();

  const {
    dataMaintenance,
    setDataMaintenance,
    dashboardFetching,
    setDashboardFetching,
    dataOutstanding,
    setDataOutstanding,
    outCount,
    setOutCount,
    mainCount,
    setMainCount,
  } = useProvider();

  const [imageUrl, setImageUrl] = useState("");
  const [userName, setUserName] = useState("Staff");
  const [userLevel, setUserLevel] = useState("");

  const getAssetIcon = (type, title = "") => {
    const t = (title || "").toLowerCase();
    if (type === "K" || t.includes("mobil") || t.includes("truck") || t.includes("forklift")) {
      return <MdDirectionsCar className="h-10 w-10 text-amber-500 group-hover:scale-110 transition-transform" />;
    }
    if (t.includes("genset") || t.includes("listrik") || t.includes("panel") || t.includes("trafo")) {
      return <MdElectricBolt className="h-10 w-10 text-amber-500 group-hover:scale-110 transition-transform" />;
    }
    if (t.includes("ac") || t.includes("chiller") || t.includes("cooling")) {
      return <MdAcUnit className="h-10 w-10 text-sky-500 group-hover:scale-110 transition-transform" />;
    }
    if (t.includes("komputer") || t.includes("server") || t.includes("printer") || t.includes("lan")) {
      return <MdComputer className="h-10 w-10 text-indigo-500 group-hover:scale-110 transition-transform" />;
    }
    if (t.includes("pompa") || t.includes("water") || t.includes("air") || t.includes("hydrant")) {
      return <MdOutlineWaterDrop className="h-10 w-10 text-teal-500 group-hover:scale-110 transition-transform" />;
    }
    return <MdPrecisionManufacturing className="h-10 w-10 text-primary group-hover:scale-110 transition-transform" />;
  };

  const sign_out = async () => {
    await signOut(auth);
    localStorage.removeItem("info");
    router.push("/signin");
  };

  const fetch_list_outstanding = async () => {
    try {
      const response = await axios.get("/api/listoutstandingoverview");
      if (response.status === 200) {
        const dataoutstanding = response.data["outstanding"] || [];
        const datamaintenance = response.data["maintenance"] || [];
        const outcount = response.data["outstanding_count"] || 0;
        const maincount = response.data["maintenance_count"] || 0;
        setDataOutstanding(dataoutstanding);
        setDataMaintenance(datamaintenance);
        setOutCount(outcount);
        setMainCount(maincount);
      }
    } catch (err) {
      console.error("Fetch dashboard overview error:", err);
    } finally {
      setDashboardFetching(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
    if (dashboardFetching) {
      fetch_list_outstanding();
    }
  }, []);

  useEffect(() => {
    const scannerResult = localStorage.getItem("qrcode");
    if (scannerResult) {
      localStorage.removeItem("qrcode");
      router.push(`/asset/${scannerResult}`);
    }
  }, [router]);

  useEffect(() => {
    const user = localStorage.getItem("info");
    if (user != null) {
      try {
        const parseUser = JSON.parse(user);
        if (parseUser && parseUser[0]) {
          setImageUrl(parseUser[0]["imageUrl"] || "");
          setUserName(parseUser[0]["Name"] || "Staff");
          setUserLevel(parseUser[0]["Level"] || "");
        }
      } catch (e) {
        console.error("Parse user error:", e);
      }
    }
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <UserAuth>
      {isSmallScreen ? (
        <div className="min-h-screen bg-whiten pb-24 text-slate-800 transition-colors duration-200 dark:bg-boxdark-2 dark:text-bodydark">
          {/* Top App Bar */}
          <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 py-3 backdrop-blur-md dark:border-slate-800 dark:bg-boxdark/80">
            <div className="flex items-center space-x-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-600 text-white shadow-sm">
                <MdEngineering className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-sm font-black tracking-wider text-slate-900 dark:text-white">
                    MITA
                  </span>
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary dark:bg-primary/20">
                    MAINTENANCE
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse"></span>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Hai, {userName.split(" ")[0]}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Theme Toggle Button */}
              <button
                type="button"
                onClick={() => setColorMode(colorMode === "light" ? "dark" : "light")}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-700 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-boxdark-2 dark:text-warning"
                title="Toggle Dark/Light Mode"
              >
                {colorMode === "dark" ? (
                  <MdOutlineLightMode className="h-4 w-4" />
                ) : (
                  <MdOutlineDarkMode className="h-4 w-4" />
                )}
              </button>

              {/* New Asset Button */}
              <button
                type="button"
                onClick={() => router.push("/new_asset")}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-700 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-boxdark-2 dark:text-slate-200"
                title="Tambah Asset Baru"
              >
                <MdOutlineAddBox className="h-5 w-5" />
              </button>

              {/* Logout Button */}
              <button
                type="button"
                onClick={sign_out}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200/60 bg-rose-50 text-danger transition hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/30"
                title="Logout"
              >
                <MdLogout className="h-4 w-4" />
              </button>

              {/* User Avatar */}
              <div className="relative">
                <img
                  src={
                    imageUrl ? `${IMAGE_PROFILE}/${imageUrl}` : "/images/user/user-01.png"
                  }
                  alt={userName}
                  className="h-9 w-9 rounded-xl border-2 border-primary/40 object-cover shadow-sm"
                />
              </div>
            </div>
          </header>

          <main className="px-4 py-3 space-y-4">
            {/* Hero Operations Status Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-5 text-white shadow-lg border border-slate-700/60">
              <div className="absolute -right-6 -bottom-6 opacity-10">
                <MdBuild className="h-40 w-40 text-white" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Engineering & Maintenance
                    </p>
                    <h2 className="mt-0.5 text-lg font-bold text-white">
                      Status Pemeliharaan Aset
                    </h2>
                  </div>
                  <span className="flex items-center space-x-1 rounded-full bg-emerald-500/20 px-2.5 py-1 text-[11px] font-bold text-emerald-300 border border-emerald-500/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>ONLINE</span>
                  </span>
                </div>

                {/* Quick KPI counters */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div
                    onClick={() => router.push("/listoutstanding")}
                    className="cursor-pointer rounded-xl bg-white/10 p-3 backdrop-blur-sm transition hover:bg-white/15 border border-white/10"
                  >
                    <div className="text-[11px] font-medium text-slate-300">
                      Antrean Perbaikan (CM)
                    </div>
                    <div className="mt-1 flex items-baseline space-x-1.5">
                      <span className="text-2xl font-black text-amber-400">
                        {outCount}
                      </span>
                      <span className="text-[10px] text-slate-400">Unit</span>
                    </div>
                  </div>

                  <div
                    onClick={() => router.push("/listmaintenance")}
                    className="cursor-pointer rounded-xl bg-white/10 p-3 backdrop-blur-sm transition hover:bg-white/15 border border-white/10"
                  >
                    <div className="text-[11px] font-medium text-slate-300">
                      Servis Berkala (PM)
                    </div>
                    <div className="mt-1 flex items-baseline space-x-1.5">
                      <span className="text-2xl font-black text-sky-400">
                        {mainCount}
                      </span>
                      <span className="text-[10px] text-slate-400">Jadwal</span>
                    </div>
                  </div>
                </div>

                {/* Scan Button CTA */}
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem("scanner_mode", "0");
                    setOpenScanner(true);
                    router.push("/scanner");
                  }}
                  className="mt-3.5 flex w-full items-center justify-center space-x-2 rounded-xl bg-primary py-2.5 font-bold text-white shadow-md hover:bg-primary/90 transition active:scale-[0.99]"
                >
                  <MdOutlineQrCodeScanner className="h-5 w-5" />
                  <span className="text-xs tracking-wide">SCAN QR BARCODE MESIN / KENDARAAN</span>
                </button>
              </div>
            </div>

            {/* Notification section (if pending request exists) */}
            <Notifikasi />

            {/* Lightweight Vector Icon Categories */}
            <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-4 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-boxdark/60">
              <div className="mb-3.5 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Kategori Aset & Mesin
                </h3>
                <span className="text-[11px] font-semibold text-primary">8 Modul</span>
              </div>

              <div className="grid grid-cols-4 gap-y-4 gap-x-2">
                <div
                  onClick={() => {
                    localStorage.setItem("menu", JSON.stringify(["K"]));
                    router.push("/asset");
                  }}
                >
                  <Menu icon={<MdDirectionsCar />} color="blue">
                    Kendaraan
                  </Menu>
                </div>

                <div
                  onClick={() => {
                    localStorage.setItem("menu", JSON.stringify(["MP"]));
                    router.push("/asset");
                  }}
                >
                  <Menu icon={<MdPrecisionManufacturing />} color="amber">
                    Mesin
                  </Menu>
                </div>

                <div
                  onClick={() => {
                    localStorage.setItem("menu", JSON.stringify(["AC"]));
                    router.push("/asset");
                  }}
                >
                  <Menu icon={<MdAcUnit />} color="cyan">
                    AC
                  </Menu>
                </div>

                <div
                  onClick={() => {
                    localStorage.setItem("menu", JSON.stringify(["PC"]));
                    router.push("/asset");
                  }}
                >
                  <Menu icon={<MdComputer />} color="indigo">
                    Komputer
                  </Menu>
                </div>

                <div
                  onClick={() => {
                    localStorage.setItem("menu", JSON.stringify(["AP", "HY"]));
                    router.push("/asset");
                  }}
                >
                  <Menu icon={<MdLocalFireDepartment />} color="rose">
                    Fire Safety
                  </Menu>
                </div>

                <div
                  onClick={() => {
                    localStorage.setItem("menu", JSON.stringify(["PN", "FK", "ME", "GS", "KL"]));
                    router.push("/asset");
                  }}
                >
                  <Menu icon={<MdElectricBolt />} color="yellow">
                    Power
                  </Menu>
                </div>

                <div onClick={() => router.push("/utility")}>
                  <Menu icon={<MdOutlineWaterDrop />} color="emerald">
                    Utility
                  </Menu>
                </div>

                <div onClick={() => router.push("/tables")}>
                  <Menu icon={<MdOutlineWidgets />} color="purple">
                    Lainnya
                  </Menu>
                </div>
              </div>
            </div>

            {/* Outstanding Jobs List (CM) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Antrean Perbaikan (CM)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/listoutstanding")}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Lihat Semua ({outCount}) →
                </button>
              </div>

              {dataOutstanding.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-xs text-slate-400 dark:border-slate-700">
                  Tidak ada perbaikan darurat saat ini.
                </div>
              ) : (
                <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-none">
                  {dataOutstanding.map((item, index) => {
                    const title =
                      item["Type"] === "K" ? item["Class"] : item["Description"];
                    const image = `${IMAGE_ASSET}/${item["Image"]}`;

                    return (
                      <div
                        key={index}
                        onClick={() => router.push(`/asset/${item["ID_Asset"]}`)}
                        className="group flex-shrink-0 w-44 cursor-pointer overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm transition hover:shadow-md hover:border-primary/50 dark:border-slate-800 dark:bg-boxdark"
                      >
                        <div className="relative h-24 w-full bg-slate-100 dark:bg-boxdark-2 flex items-center justify-center bg-gradient-to-br from-amber-500/10 via-slate-100 to-slate-200 dark:from-amber-500/10 dark:via-meta-4/30 dark:to-boxdark-2">
                          <span className="absolute top-2 left-2 z-10 rounded bg-amber-500/95 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm">
                            CM • BREAKDOWN
                          </span>
                          {getAssetIcon(item["Type"], title)}
                        </div>

                        <div className="p-2.5 space-y-1">
                          <h4 className="truncate text-xs font-bold text-slate-900 dark:text-white" title={title}>
                            {title || "Aset Tanpa Nama"}
                          </h4>

                          <div className="flex items-center text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            <LiaUser className="mr-1 h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                            <span className="truncate">{item["Requestor"] || "-"}</span>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                            <span className="flex items-center">
                              <MdOutlineCalendarMonth className="mr-0.5 h-3 w-3" />
                              {shortDate(item["Time_Request"])}
                            </span>
                            <span className="flex items-center">
                              <MdOutlineAccessTime className="mr-0.5 h-3 w-3" />
                              {formatTime(item["Time_Request"])}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Preventive Maintenance Section (PM) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="h-2 w-2 rounded-full bg-sky-500"></span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Jadwal Maintenance (PM)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/listmaintenance")}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Lihat Semua ({mainCount}) →
                </button>
              </div>

              {dataMaintenance.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-xs text-slate-400 dark:border-slate-700">
                  Tidak ada jadwal maintenance aktif.
                </div>
              ) : (
                <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-none">
                  {dataMaintenance.map((item, index) => {
                    const title =
                      item["Type"] === "K" ? item["Class"] : item["Description"];
                    const image = `${IMAGE_ASSET}/${item["Image"]}`;

                    return (
                      <div
                        key={index}
                        onClick={() => router.push(`/asset/${item["ID_Asset"]}`)}
                        className="group flex-shrink-0 w-44 cursor-pointer overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm transition hover:shadow-md hover:border-sky-500/50 dark:border-slate-800 dark:bg-boxdark"
                      >
                        <div className="relative h-24 w-full bg-slate-100 dark:bg-boxdark-2 flex items-center justify-center bg-gradient-to-br from-sky-500/10 via-slate-100 to-slate-200 dark:from-sky-500/10 dark:via-meta-4/30 dark:to-boxdark-2">
                          <span className="absolute top-2 left-2 z-10 rounded bg-sky-500/95 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm">
                            PM • ROUTINE
                          </span>
                          {getAssetIcon(item["Type"], title)}
                        </div>

                        <div className="p-2.5 space-y-1">
                          <h4 className="truncate text-xs font-bold text-slate-900 dark:text-white" title={title}>
                            {title || "Aset Tanpa Nama"}
                          </h4>

                          <div className="flex items-center text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            <LiaUser className="mr-1 h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                            <span className="truncate">{item["Requestor"] || "-"}</span>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                            <span className="flex items-center">
                              <MdOutlineCalendarMonth className="mr-0.5 h-3 w-3" />
                              {shortDate(item["Time_Request"])}
                            </span>
                            <span className="flex items-center">
                              <MdOutlineAccessTime className="mr-0.5 h-3 w-3" />
                              {formatTime(item["Time_Request"])}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Monitoring Anggaran Pemeliharaan (Budget Pos) Mobile (Hanya untuk Role <= 2) */}
            {userLevel !== "" && parseInt(userLevel) <= 2 && (
              <BudgetPosOverview />
            )}
          </main>

          {/* Floating Modern Bottom Dock Bar */}
          <nav className="fixed bottom-3 inset-x-4 z-50 flex items-center justify-around rounded-2xl border border-slate-200/80 bg-white/90 py-2 px-3 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-boxdark/90">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="flex flex-col items-center text-primary font-bold"
            >
              <MdOutlineHome className="h-5 w-5" />
              <span className="text-[10px] mt-0.5">Home</span>
            </button>

            <button
              type="button"
              onClick={() => router.push("/listoutstanding")}
              className="flex flex-col items-center text-slate-500 hover:text-primary transition dark:text-slate-400"
            >
              <MdOutlineAssignment className="h-5 w-5" />
              <span className="text-[10px] mt-0.5">Outstanding</span>
            </button>

            {/* Elevated Center Scanner FAB */}
            <button
              type="button"
              onClick={() => {
                localStorage.setItem("scanner_mode", "0");
                setOpenScanner(true);
                router.push("/scanner");
              }}
              className="-mt-7 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-blue-500 text-white shadow-xl ring-4 ring-whiten transition-transform active:scale-95 dark:ring-boxdark-2"
              title="Quick QR Scanner"
            >
              <MdOutlineDocumentScanner className="h-7 w-7" />
            </button>

            <button
              type="button"
              onClick={() => router.push("/listmaintenance")}
              className="flex flex-col items-center text-slate-500 hover:text-primary transition dark:text-slate-400"
            >
              <MdOutlineHandyman className="h-5 w-5" />
              <span className="text-[10px] mt-0.5">Maintenance</span>
            </button>

            {parseInt(userLevel) <= 2 && (
              <button
                type="button"
                onClick={() => router.push("/parts")}
                className="flex flex-col items-center text-slate-500 hover:text-primary transition dark:text-slate-400"
              >
                <MdBuild className="h-5 w-5" />
                <span className="text-[10px] mt-0.5">Inventory</span>
              </button>
            )}
          </nav>
        </div>
      ) : (
        <div className="min-h-screen bg-whiten text-slate-800 transition-colors duration-200 dark:bg-boxdark-2 dark:text-bodydark">
          <DefaultLayout>
            <ECommerce />
          </DefaultLayout>
        </div>
      )}
    </UserAuth>
  );
}
