"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "react-responsive";
import axios from "axios";
import {
  MdArrowBack,
  MdOutlineAccessTime,
  MdOutlineCalendarMonth,
  MdOutlinePrecisionManufacturing,
  MdOutlineLightMode,
  MdOutlineDarkMode,
} from "react-icons/md";
import { LiaUser } from "react-icons/lia";
import { AiTwotonePicture } from "react-icons/ai";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import useColorMode from "@/hooks/useColorMode";
import { formatTime, shortDate } from "@/utils/dateformat";
import { IMAGE_ASSET } from "@/utils/constant";

export default function Page() {
  const [isClient, setIsClient] = useState(false);
  const isSmallScreen = useMediaQuery({ query: "(max-width: 640px)" });
  const router = useRouter();
  const [colorMode, setColorMode] = useColorMode();

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [status, setStatus] = useState("all");
  const [counts, setCounts] = useState({ all: 0, issued: 0, onprogress: 0, completed: 0 });
  const [totalPages, setTotalPages] = useState(1);

  const observerTarget = useRef(null);

  const fetchItems = async (targetPage, activeStatus, isAppend = false) => {
    if (isAppend) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await axios.get(
        `/api/listmaintenance?page=${targetPage}&per_page=15&status=${activeStatus}`
      );

      if (res.status === 200 && res.data.success) {
        const newItems = res.data.items || [];
        setHasMore(res.data.pagination.has_more);
        setTotalPages(res.data.pagination.total_pages);
        if (res.data.counts) {
          setCounts(res.data.counts);
        }

        if (isAppend) {
          setItems((prev) => [...prev, ...newItems]);
        } else {
          setItems(newItems);
        }
      }
    } catch (err) {
      console.error("Fetch list maintenance error:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
    setPage(1);
    fetchItems(1, status, false);
  }, [status]);

  // Infinite scroll trigger for mobile
  useEffect(() => {
    if (!isSmallScreen) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          setPage((prevPage) => {
            const nextPage = prevPage + 1;
            fetchItems(nextPage, status, true);
            return nextPage;
          });
        }
      },
      { threshold: 0.2 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
    };
  }, [hasMore, loading, loadingMore, status, isSmallScreen]);

  if (!isClient) return null;

  const tabs = [
    { key: "all", label: "Semua", count: counts.all },
    { key: "issued", label: "Baru", count: counts.issued },
    { key: "onprogress", label: "Proses", count: counts.onprogress },
    { key: "completed", label: "Selesai", count: counts.completed },
  ];

  return (
    <div className="min-h-screen bg-whiten text-slate-800 transition-colors duration-200 dark:bg-boxdark-2 dark:text-bodydark">
      {isSmallScreen ? (
        <div className="pb-16">
          {/* Mobile Sticky Header */}
          <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-md dark:border-slate-800 dark:bg-boxdark/90">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-700 transition active:scale-95 dark:border-slate-700 dark:bg-boxdark-2 dark:text-slate-200"
              >
                <MdArrowBack className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-sm font-bold text-slate-900 dark:text-white">
                  Servis Berkala (PM)
                </h1>
                <p className="text-[11px] text-slate-400">
                  {counts.all} Jadwal Maintenance
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setColorMode(colorMode === "light" ? "dark" : "light")}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-700 transition dark:border-slate-700 dark:bg-boxdark-2 dark:text-warning"
            >
              {colorMode === "dark" ? (
                <MdOutlineLightMode className="h-4 w-4" />
              ) : (
                <MdOutlineDarkMode className="h-4 w-4" />
              )}
            </button>
          </header>

          {/* Filter Tabs */}
          <div className="sticky top-[57px] z-30 flex space-x-2 overflow-x-auto border-b border-slate-200/80 bg-white/80 px-4 py-2.5 backdrop-blur-md scrollbar-none dark:border-slate-800 dark:bg-boxdark/80">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatus(tab.key)}
                className={`flex-shrink-0 flex items-center space-x-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition active:scale-95 ${
                  status === tab.key
                    ? "bg-sky-500 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-boxdark-2 dark:text-slate-300"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    status === tab.key
                      ? "bg-white/20 text-white"
                      : "bg-slate-200 text-slate-700 dark:bg-boxdark dark:text-slate-300"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* List Items */}
          <main className="p-4 space-y-3">
            {loading ? (
              <div className="py-20 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-sky-500 border-r-transparent"></div>
                <p className="mt-2 text-xs text-slate-400">Memuat jadwal maintenance...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-400 dark:border-slate-700">
                Tidak ada jadwal pada kategori ini.
              </div>
            ) : (
              items.map((item, index) => {
                const title =
                  item["Type"] === "K"
                    ? `${item["Manufacture"] || ""} ${item["Model"] || ""} ${item["No"] || ""}`
                    : `${item["Description"] || ""} ${item["Manufacture"] || ""} ${item["Model"] || ""}`;
                const image = item["Image"] ? `${IMAGE_ASSET}/${item["Image"]}` : null;

                return (
                  <div
                    key={index}
                    onClick={() => router.push(`/asset/${item["ID_Asset"]}`)}
                    className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm transition active:scale-[0.99] dark:border-slate-800 dark:bg-boxdark"
                  >
                    <div className="flex space-x-3">
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-boxdark-2">
                        {image ? (
                          <img
                            src={image}
                            alt={title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-400">
                            <AiTwotonePicture className="h-6 w-6 opacity-40" />
                          </div>
                        )}
                        <span className="absolute bottom-1 left-1 rounded bg-sky-600/90 px-1 py-0.2 text-[9px] font-bold text-white backdrop-blur-sm">
                          Step {item["Step"]}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                            #{item["ID_Request"]} • {item["ID_Asset"]}
                          </span>
                          <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[9px] font-bold text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
                            {item["Type"] === "K" ? "Kendaraan" : "Mesin"}
                          </span>
                        </div>

                        <h3 className="mt-0.5 truncate text-xs font-bold text-slate-900 dark:text-white" title={title}>
                          {title.trim() || "Aset Tanpa Nama"}
                        </h3>

                        <p className="mt-1 line-clamp-2 text-[11px] text-slate-600 dark:text-slate-300">
                          {item["Problem"] || "Servis berkala rutin."}
                        </p>

                        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                          <span className="flex items-center">
                            <LiaUser className="mr-0.5 h-3.5 w-3.5" />
                            {item["Name"] || "-"}
                          </span>
                          <span className="flex items-center">
                            <MdOutlineAccessTime className="mr-0.5 h-3 w-3" />
                            {shortDate(item["Time_Request"])} {formatTime(item["Time_Request"])}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Infinite Scroll Sentinel */}
            <div ref={observerTarget} className="py-4 text-center">
              {loadingMore && (
                <div className="inline-flex items-center space-x-2 text-xs font-medium text-slate-400">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-500 border-r-transparent"></div>
                  <span>Memuat lebih banyak...</span>
                </div>
              )}
              {!hasMore && items.length > 0 && (
                <p className="text-[11px] text-slate-400">Semua jadwal maintenance sudah dimuat</p>
              )}
            </div>
          </main>
        </div>
      ) : (
        /* Desktop Layout */
        <DefaultLayout>
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-boxdark/90">
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-sky-500"></span>
                  Daftar Servis Berkala (Preventive Maintenance)
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Pantau inspeksi rutin dan servis terjadwal seluruh aset perusahaan
                </p>
              </div>

              <div className="flex items-center space-x-2 rounded-xl bg-slate-100 p-1.5 dark:bg-boxdark-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => {
                      setStatus(tab.key);
                      setPage(1);
                    }}
                    className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      status === tab.key
                        ? "bg-white text-sky-600 shadow-sm dark:bg-boxdark dark:text-white"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="rounded-full bg-slate-200 px-1.5 py-0.2 text-[10px] dark:bg-slate-700">
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-boxdark/90">
              {loading ? (
                <div className="py-24 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-sky-500 border-r-transparent"></div>
                  <p className="mt-2 text-xs text-slate-400">Memuat data...</p>
                </div>
              ) : items.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400">
                  Tidak ada jadwal ditemukan.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200/80 bg-slate-50/70 text-slate-500 dark:border-slate-700 dark:bg-boxdark-2/40 dark:text-slate-400">
                        <th className="py-3 px-4 font-semibold">ID Tiket</th>
                        <th className="py-3 px-4 font-semibold">Aset / Mesin</th>
                        <th className="py-3 px-4 font-semibold">Tugas Servis</th>
                        <th className="py-3 px-4 font-semibold">Petugas / Pemohon</th>
                        <th className="py-3 px-4 font-semibold">Jadwal Tanggal</th>
                        <th className="py-3 px-4 font-semibold">Status Pengerjaan</th>
                        <th className="py-3 px-4 text-right font-semibold">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {items.map((item, idx) => {
                        const title =
                          item["Type"] === "K"
                            ? `${item["Manufacture"] || ""} ${item["Model"] || ""} ${item["No"] || ""}`
                            : `${item["Description"] || ""} ${item["Manufacture"] || ""} ${item["Model"] || ""}`;

                        return (
                          <tr
                            key={idx}
                            className="hover:bg-slate-50/70 dark:hover:bg-boxdark-2/50 transition-colors"
                          >
                            <td className="py-3.5 px-4 font-bold text-sky-600">
                              #{item["ID_Request"]}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                              <div>{title.trim() || "-"}</div>
                              <span className="text-[10px] text-slate-400 font-normal">
                                {item["ID_Asset"]}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate" title={item["Problem"]}>
                              {item["Problem"] || "Servis berkala rutin"}
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                              {item["Name"] || "-"}
                            </td>
                            <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                              {shortDate(item["Time_Request"])} {formatTime(item["Time_Request"])}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700 border border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-900/40">
                                <span className="h-1.5 w-1.5 rounded-full bg-sky-500"></span>
                                Step {item["Step"]}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => router.push(`/asset/${item["ID_Asset"]}`)}
                                className="rounded-lg bg-slate-100 px-3 py-1 font-semibold text-slate-700 hover:bg-sky-600 hover:text-white transition dark:bg-boxdark-2 dark:text-slate-300"
                              >
                                Detail Aset →
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Desktop Pagination Bar */}
              <div className="flex items-center justify-between border-t border-slate-200/80 px-4 py-3 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Halaman {page} dari {totalPages} (Total {counts.all} jadwal)
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => {
                      const prevPage = page - 1;
                      setPage(prevPage);
                      fetchItems(prevPage, status, false);
                    }}
                    className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-boxdark-2"
                  >
                    ← Sebelumnya
                  </button>

                  <button
                    type="button"
                    disabled={!hasMore}
                    onClick={() => {
                      const nextPage = page + 1;
                      setPage(nextPage);
                      fetchItems(nextPage, status, false);
                    }}
                    className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-boxdark-2"
                  >
                    Selanjutnya →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </DefaultLayout>
      )}
    </div>
  );
}
