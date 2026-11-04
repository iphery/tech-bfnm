"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "react-responsive";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import UserAuth from "@/components/auth";
import { CommonInput } from "@/components/input";
import { PageCardLimited } from "@/components/card";
import { PageLoader } from "@/components/loader";
import { formatDate } from "@/utils/dateformat";

// Icons
import {
  HiArrowLeft,
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlineWrenchScrewdriver,
  HiOutlineArrowRight,
} from "react-icons/hi2";

export default function PartService() {
  const router = useRouter();
  const isSmallScreen = useMediaQuery({ query: "(max-width: 640px)" });

  const [orderData, setOrderData] = useState([]);
  const [loader, setLoader] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [isClient, setIsClient] = useState(false);

  // Pagination (15 items per page)
  const pageSize = 15;
  const [mobilePage, setMobilePage] = useState(1);
  const [desktopPage, setDesktopPage] = useState(1);
  const observerTarget = useRef(null);

  const fetch_data = async () => {
    try {
      const response = await axios.post("/api/getservice");
      if (response.status === 200) {
        setOrderData(response.data.response || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    fetch_data();
    setIsClient(true);
  }, []);

  const filteredList = orderData.filter((item) => {
    const q = keyword.toLowerCase();
    const reg = (item.id_register || "").toLowerCase();
    const req = (item.requestor || item.Name || "").toLowerCase();
    return reg.includes(q) || req.includes(q);
  });

  // Mobile Infinite Scroll (15 per batch)
  const displayedMobile = filteredList.slice(0, mobilePage * pageSize);
  const hasMoreMobile = displayedMobile.length < filteredList.length;

  const handleObserver = useCallback(
    (entries) => {
      const [target] = entries;
      if (target.isIntersecting && hasMoreMobile) {
        setMobilePage((prev) => prev + 1);
      }
    },
    [hasMoreMobile]
  );

  useEffect(() => {
    const element = observerTarget.current;
    if (!element) return;
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    observer.observe(element);
    return () => observer.unobserve(element);
  }, [handleObserver]);

  // Desktop Pagination (15 per page)
  const totalDesktopPages = Math.ceil(filteredList.length / pageSize) || 1;
  const displayedDesktop = filteredList.slice(
    (desktopPage - 1) * pageSize,
    desktopPage * pageSize
  );

  if (!isClient) return null;

  return (
    <UserAuth>
      <div className="min-h-screen bg-whiten text-body dark:bg-boxdark-2 dark:text-bodydark">
        {loader ? (
          <PageLoader />
        ) : isSmallScreen ? (
          /* ================= MOBILE VIEW ================= */
          <div className="flex flex-col min-h-screen pb-20">
            {/* Top Bar */}
            <div className="sticky top-0 z-40 border-b border-stroke/60 bg-white/80 px-4 py-3 backdrop-blur-md dark:border-strokedark/60 dark:bg-boxdark/80">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => router.push("/parts")}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-black hover:bg-gray-200 dark:bg-meta-4 dark:text-white"
                  >
                    <HiArrowLeft className="text-lg" />
                  </button>
                  <div>
                    <h1 className="text-base font-bold text-black dark:text-white leading-none">
                      Order Service Luar
                    </h1>
                    <span className="text-[11px] text-body dark:text-bodydark">
                      {filteredList.length} order tercatat
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => router.push("/new_service")}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-sm hover:bg-opacity-90 transition-all"
                  title="Buat Order Baru"
                >
                  <HiOutlinePlus className="text-lg" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <CommonInput
                  input={keyword}
                  type="text"
                  onInputChange={(val) => {
                    setKeyword(val);
                    setMobilePage(1);
                  }}
                  placeholder="Cari ID order atau pemohon..."
                >
                  <HiOutlineSearch className="text-body dark:text-bodydark" />
                </CommonInput>
              </div>
            </div>

            {/* List of Services (15 items per batch) */}
            <div className="p-4 space-y-2.5">
              {filteredList.length === 0 ? (
                <div className="rounded-2xl border border-stroke bg-white p-8 text-center text-xs text-body dark:border-strokedark dark:bg-boxdark dark:text-bodydark">
                  Tidak ada order service luar yang cocok.
                </div>
              ) : (
                <>
                  {displayedMobile.map((item, index) => {
                    const isOpen = item.status === 0;
                    return (
                      <div
                        key={index}
                        onClick={() => router.push(`/partsservice/${item.id_register}`)}
                        className="group cursor-pointer rounded-2xl border border-stroke bg-white p-3.5 shadow-sm hover:border-primary hover:shadow dark:border-strokedark dark:bg-boxdark dark:hover:border-primary transition-all active:scale-[0.99]"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-mono text-xs font-bold text-black dark:text-white">
                            {item.id_register}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              isOpen
                                ? "bg-warning/15 text-warning"
                                : "bg-success/15 text-success"
                            }`}
                          >
                            {isOpen ? "PROSES" : "SELESAI"}
                          </span>
                        </div>

                        <div className="text-xs text-black dark:text-white font-medium mb-1">
                          Pemohon:{" "}
                          <span className="font-semibold text-primary">
                            {item.requestor || item.Name || "-"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between border-t border-stroke/60 pt-2 text-[11px] text-body dark:border-strokedark/60 dark:text-bodydark">
                          <span>Status: {isOpen ? "Sedang Dikerjakan" : "Diterima / Closed"}</span>
                          <span>{formatDate(item.date_issued || item.date)}</span>
                          <HiOutlineArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    );
                  })}

                  {/* Infinite scroll observer target */}
                  <div ref={observerTarget} className="py-2 text-center text-xs text-body dark:text-bodydark">
                    {hasMoreMobile && (
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                        <span>Memuat 15 order berikutnya...</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          /* ================= DESKTOP VIEW ================= */
          <DefaultLayout>
            <div className="mx-auto max-w-7xl space-y-6">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => router.push("/parts")}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-stroke bg-white text-black hover:bg-gray-50 dark:border-strokedark dark:bg-boxdark dark:text-white transition-all shadow-sm"
                  >
                    <HiArrowLeft className="text-xl" />
                  </button>
                  <div>
                    <h1 className="text-xl font-bold text-black dark:text-white">
                      Order Service Luar (DPS)
                    </h1>
                    <p className="text-xs text-body dark:text-bodydark">
                      Status pengiriman pekerjaan bubut, rewinding, perbaikan eksternal, dan invoice
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => router.push("/new_service")}
                  className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white shadow hover:bg-opacity-90 active:scale-[0.99] transition-all"
                >
                  <HiOutlineWrenchScrewdriver className="text-base" />
                  <span>+ Order Service Baru</span>
                </button>
              </div>

              {/* Table Card (15 items per page) */}
              <PageCardLimited>
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stroke pb-4 dark:border-strokedark">
                    <div className="w-full sm:w-80">
                      <CommonInput
                        input={keyword}
                        type="text"
                        onInputChange={(val) => {
                          setKeyword(val);
                          setDesktopPage(1);
                        }}
                        placeholder="Cari ID order, pemohon..."
                      >
                        <HiOutlineSearch className="text-body dark:text-bodydark" />
                      </CommonInput>
                    </div>

                    <span className="text-xs text-body dark:text-bodydark">
                      Menampilkan {displayedDesktop.length} dari {filteredList.length} order service
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full table-auto text-left text-xs">
                      <thead>
                        <tr className="border-b border-stroke bg-gray-50 text-body dark:border-strokedark dark:bg-meta-4/20 dark:text-bodydark">
                          <th className="py-3 px-4 font-semibold">ID Register</th>
                          <th className="py-3 px-4 font-semibold">Tanggal Order</th>
                          <th className="py-3 px-4 font-semibold">Pemohon</th>
                          <th className="py-3 px-4 font-semibold text-center">Status Pengerjaan</th>
                          <th className="py-3 px-4 font-semibold text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stroke dark:divide-strokedark">
                        {filteredList.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-body dark:text-bodydark">
                              Tidak ada data order service.
                            </td>
                          </tr>
                        ) : (
                          displayedDesktop.map((item, index) => {
                            const isOpen = item.status === 0;
                            return (
                              <tr
                                key={index}
                                onClick={() => router.push(`/partsservice/${item.id_register}`)}
                                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-meta-4/10 transition-colors"
                              >
                                <td className="py-3 px-4 font-mono font-bold text-black dark:text-white">
                                  {item.id_register}
                                </td>
                                <td className="py-3 px-4 text-body dark:text-bodydark whitespace-nowrap">
                                  {formatDate(item.date_issued || item.date)}
                                </td>
                                <td className="py-3 px-4 text-black dark:text-white">
                                  {item.requestor || item.Name || "-"}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span
                                    className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                      isOpen
                                        ? "bg-warning/15 text-warning"
                                        : "bg-success/15 text-success"
                                    }`}
                                  >
                                    {isOpen ? "PROSES PENGERJAAN" : "SELESAI / RETURN"}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      router.push(`/partsservice/${item.id_register}`);
                                    }}
                                    className="rounded-lg border border-stroke px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-primary hover:text-white dark:border-strokedark transition-colors"
                                  >
                                    Rincian
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Desktop Pagination Controls (15 items per page) */}
                  {totalDesktopPages > 1 && (
                    <div className="flex items-center justify-between border-t border-stroke pt-4 dark:border-strokedark text-xs">
                      <span className="text-body dark:text-bodydark">
                        Halaman {desktopPage} dari {totalDesktopPages}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={desktopPage === 1}
                          onClick={() => setDesktopPage((p) => Math.max(1, p - 1))}
                          className="rounded-lg border border-stroke px-3 py-1.5 font-semibold text-black dark:border-strokedark dark:text-white hover:bg-gray-100 dark:hover:bg-meta-4 disabled:opacity-40"
                        >
                          Sebelumnya
                        </button>
                        <button
                          type="button"
                          disabled={desktopPage === totalDesktopPages}
                          onClick={() => setDesktopPage((p) => Math.min(totalDesktopPages, p + 1))}
                          className="rounded-lg border border-stroke px-3 py-1.5 font-semibold text-black dark:border-strokedark dark:text-white hover:bg-gray-100 dark:hover:bg-meta-4 disabled:opacity-40"
                        >
                          Berikutnya
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </PageCardLimited>
            </div>
          </DefaultLayout>
        )}
      </div>
    </UserAuth>
  );
}
