"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { useMediaQuery } from "react-responsive";
import { useRouter } from "next/navigation";
import {
  MdArrowBack,
  MdOutlineSearch,
  MdOutlineLightMode,
  MdOutlineDarkMode,
  MdOutlinePrecisionManufacturing,
  MdOutlineWarningAmber,
  MdOutlineDirectionsCar,
  MdOutlineAcUnit,
  MdOutlineComputer,
  MdOutlineLocalFireDepartment,
  MdOutlineElectricBolt,
  MdOutlineApps,
} from "react-icons/md";
import { LiaUser } from "react-icons/lia";
import { AiTwotonePicture } from "react-icons/ai";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import UserAuth from "@/components/auth";
import useColorMode from "@/hooks/useColorMode";
import { IMAGE_ASSET } from "@/utils/constant";

const CATEGORIES = [
  { label: "Kendaraan", types: ["K"], icon: <MdOutlineDirectionsCar /> },
  { label: "Mesin", types: ["MP"], icon: <MdOutlinePrecisionManufacturing /> },
  { label: "AC", types: ["AC"], icon: <MdOutlineAcUnit /> },
  { label: "Komputer", types: ["PC"], icon: <MdOutlineComputer /> },
  { label: "Fire Safety", types: ["AP", "HY"], icon: <MdOutlineLocalFireDepartment /> },
  { label: "Power", types: ["PN", "FK", "ME", "GS", "KL"], icon: <MdOutlineElectricBolt /> },
  { label: "Semua", types: null, icon: <MdOutlineApps /> },
];

function resolveCategoryFromStorage() {
  if (typeof window === "undefined") return "Semua";
  try {
    const raw = localStorage.getItem("menu");
    if (!raw) return "Semua";
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr) || arr.length === 0) return "Semua";

    for (const cat of CATEGORIES) {
      if (cat.types && cat.types.some((t) => arr.includes(t))) {
        return cat.label;
      }
    }
  } catch (e) {
    console.error("Error reading stored menu:", e);
  }
  return "Semua";
}

export default function ListAsset() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const isSmallScreen = useMediaQuery({ query: "(max-width: 640px)" });
  const [colorMode, setColorMode] = useColorMode();

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [ready, setReady] = useState(false);

  const observerTarget = useRef(null);
  const activeCategoryRef = useRef(activeCategory);
  activeCategoryRef.current = activeCategory;

  const getTypesForCategory = (catLabel) => {
    const cat = CATEGORIES.find((c) => c.label === catLabel);
    return cat ? cat.types : null;
  };

  const fetchAssets = async (targetPage, catLabel, searchKeyword, isAppend = false) => {
    if (isAppend) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const types = getTypesForCategory(catLabel);
      const isAll = !types || types.length === 0;

      const res = await axios.post("/api/getallasset", {
        page: targetPage,
        per_page: 15,
        isAll: isAll ? 1 : 0,
        type: types,
        search: searchKeyword,
      });

      if (res.status === 200 && res.data.success) {
        const newItems = res.data.items || [];
        setHasMore(res.data.pagination.has_more);
        setTotal(res.data.pagination.total);
        setTotalPages(res.data.pagination.total_pages);

        if (isAppend) {
          setItems((prev) => [...prev, ...newItems]);
        } else {
          setItems(newItems);
        }
      }
    } catch (err) {
      console.error("Fetch assets error:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // 1. Initial Load: Read stored category first, then trigger single fetch
  useEffect(() => {
    setIsClient(true);
    const initialCat = resolveCategoryFromStorage();
    setActiveCategory(initialCat);
    setReady(true);
    fetchAssets(1, initialCat, "", false);
  }, []);

  // 2. Debounced search trigger (only after initialized)
  useEffect(() => {
    if (!ready) return;

    const timer = setTimeout(() => {
      setPage(1);
      fetchAssets(1, activeCategory, search, false);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // 3. Category switch handler
  const handleSelectCategory = (catLabel) => {
    if (activeCategory === catLabel) return;
    setActiveCategory(catLabel);
    const cat = CATEGORIES.find((c) => c.label === catLabel);
    if (cat?.types) {
      localStorage.setItem("menu", JSON.stringify(cat.types));
    } else {
      localStorage.removeItem("menu");
    }
    setPage(1);
    setItems([]);
    fetchAssets(1, catLabel, search, false);
  };

  // 4. Infinite Scroll Observer for Mobile
  useEffect(() => {
    if (!isSmallScreen || !ready) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          setPage((prev) => {
            const next = prev + 1;
            fetchAssets(next, activeCategoryRef.current, search, true);
            return next;
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
  }, [hasMore, loading, loadingMore, search, isSmallScreen, ready]);

  if (!isClient) return null;

  return (
    <UserAuth>
      <div className="min-h-screen bg-whiten text-slate-800 transition-colors duration-200 dark:bg-boxdark-2 dark:text-bodydark">
        {isSmallScreen ? (
          <div className="pb-16">
            {/* Mobile Header */}
            <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-md dark:border-slate-800 dark:bg-boxdark/90">
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-700 transition active:scale-95 dark:border-slate-700 dark:bg-boxdark-2 dark:text-slate-200"
                >
                  <MdArrowBack className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-sm font-bold text-slate-900 dark:text-white">
                    Aset: {activeCategory}
                  </h1>
                  <p className="text-[11px] text-slate-400">
                    {total} Unit {activeCategory !== "Semua" ? activeCategory : ""} Terdaftar
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

            {/* Search Input Bar */}
            <div className="sticky top-[57px] z-30 border-b border-slate-200/80 bg-white/90 p-3 backdrop-blur-md dark:border-slate-800 dark:bg-boxdark/90">
              <div className="relative">
                <MdOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Cari dalam kategori ${activeCategory}...`}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-primary dark:border-slate-700 dark:bg-boxdark-2 dark:text-white"
                />
              </div>
            </div>

            {/* Asset Cards List */}
            <main className="p-4 space-y-2.5">
              {loading ? (
                <div className="py-20 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                  <p className="mt-2 text-xs text-slate-400">Memuat data {activeCategory}...</p>
                </div>
              ) : items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-400 dark:border-slate-700">
                  Tidak ada aset {activeCategory !== "Semua" ? `kategori ${activeCategory}` : ""} ditemukan.
                </div>
              ) : (
                items.map((item, index) => {
                  const mfg = item["Manufacture"] ? ` ${item["Manufacture"]}` : "";
                  const mdl = item["Model"] ? ` ${item["Model"]}` : "";
                  const title =
                    item["Type"] === "K"
                      ? `${item["Model"] || item["Description"] || "Kendaraan"} (${item["No"] || "-"})`
                      : `${item["Description"] || ""}${mfg}${mdl}`.trim();
                  const image = item["Image"] ? `${IMAGE_ASSET}/${item["Image"]}` : null;
                  const isBreakdown = item["Reserve"] === 1;

                  return (
                    <div
                      key={index}
                      onClick={() => router.push(`/asset/${item["ID_Asset"]}`)}
                      className="flex items-center space-x-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm transition active:scale-[0.99] dark:border-slate-800 dark:bg-boxdark"
                    >
                      {/* Image Thumbnail */}
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-boxdark-2">
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
                        {isBreakdown && (
                          <span
                            className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-white shadow"
                            title="Sedang Dalam Perbaikan"
                          >
                            <MdOutlineWarningAmber className="h-3 w-3" />
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black tracking-tight text-primary">
                            {item["ID_Asset"]}
                          </span>
                          <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-semibold text-slate-600 dark:bg-boxdark-2 dark:text-slate-300">
                            {item["Class"] || item["Type"] || "-"}
                          </span>
                        </div>

                        <h3 className="mt-0.5 truncate text-xs font-bold text-slate-900 dark:text-white" title={title}>
                          {title || "Aset Tanpa Nama"}
                        </h3>

                        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                          <span className="flex items-center truncate">
                            <LiaUser className="mr-1 h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate">{item["User"] || "-"}</span>
                          </span>

                          <span
                            className={`rounded-full px-2 py-0.2 text-[9px] font-bold ${
                              isBreakdown
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            }`}
                          >
                            {isBreakdown ? "Perbaikan" : "Ready"}
                          </span>
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
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent"></div>
                    <span>Memuat aset lainnya...</span>
                  </div>
                )}
                {!hasMore && items.length > 0 && (
                  <p className="text-[11px] text-slate-400">Seluruh aset telah ditampilkan</p>
                )}
              </div>
            </main>
          </div>
        ) : (
          /* Desktop Layout (Master All Assets) */
          <DefaultLayout>
            <div className="space-y-6">
              {/* Header & Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-boxdark/90">
                <div>
                  <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                    Master Data Aset & Inventaris Mesin
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Total {total} aset tercatat dalam sistem pemeliharaan
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative w-64">
                    <MdOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Cari ID, nama aset..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-primary dark:border-slate-700 dark:bg-boxdark-2 dark:text-white"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push("/new_asset")}
                    className="rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-primary/90 transition"
                  >
                    + Tambah Aset
                  </button>
                </div>
              </div>

              {/* Category Chips Bar */}
              <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.label}
                    type="button"
                    onClick={() => handleSelectCategory(cat.label)}
                    className={`flex items-center space-x-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                      activeCategory === cat.label
                        ? "bg-primary text-white shadow-sm"
                        : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-boxdark dark:text-slate-300 dark:hover:bg-boxdark-2 border border-slate-200/80 dark:border-slate-800"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>

              {/* Desktop Table */}
              <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-boxdark/90">
                {loading ? (
                  <div className="py-24 text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                    <p className="mt-2 text-xs text-slate-400">Memuat aset...</p>
                  </div>
                ) : items.length === 0 ? (
                  <div className="p-12 text-center text-xs text-slate-400">
                    Tidak ada aset ditemukan.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200/80 bg-slate-50/70 text-slate-500 dark:border-slate-700 dark:bg-boxdark-2/40 dark:text-slate-400">
                          <th className="py-3 px-4 font-semibold">ID Aset</th>
                          <th className="py-3 px-4 font-semibold">Deskripsi / Nama</th>
                          <th className="py-3 px-4 font-semibold">Manufaktur</th>
                          <th className="py-3 px-4 font-semibold">Model / Seri</th>
                          <th className="py-3 px-4 font-semibold">Penanggung Jawab</th>
                          <th className="py-3 px-4 font-semibold">Status</th>
                          <th className="py-3 px-4 text-right font-semibold">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {items.map((item, idx) => {
                          const isBreakdown = item["Reserve"] === 1;

                          return (
                            <tr
                              key={idx}
                              className="hover:bg-slate-50/70 dark:hover:bg-boxdark-2/50 transition-colors"
                            >
                              <td className="py-3.5 px-4 font-bold text-primary">
                                {item["ID_Asset"]}
                              </td>
                              <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                                {item["Description"] || item["No"] || "-"}
                              </td>
                              <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                                {item["Manufacture"] || "-"}
                              </td>
                              <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                                {item["Model"] || "-"}
                              </td>
                              <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                                {item["User"] || "-"}
                              </td>
                              <td className="py-3.5 px-4">
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                    isBreakdown
                                      ? "bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-400"
                                      : "bg-emerald-100 text-emerald-700 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400"
                                  }`}
                                >
                                  {isBreakdown ? "⚠️ Perbaikan" : "✓ Siap Pakai"}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => router.push(`/asset/${item["ID_Asset"]}`)}
                                  className="rounded-lg bg-slate-100 px-3 py-1 font-semibold text-slate-700 hover:bg-primary hover:text-white transition dark:bg-boxdark-2 dark:text-slate-300"
                                >
                                  Lihat Detail →
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Desktop Pagination */}
                <div className="flex items-center justify-between border-t border-slate-200/80 px-4 py-3 dark:border-slate-800">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Halaman {page} dari {totalPages} (Total {total} aset)
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => {
                        const prev = page - 1;
                        setPage(prev);
                        fetchAssets(prev, activeCategory, search, false);
                      }}
                      className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-boxdark-2"
                    >
                      ← Sebelumnya
                    </button>

                    <button
                      type="button"
                      disabled={!hasMore}
                      onClick={() => {
                        const next = page + 1;
                        setPage(next);
                        fetchAssets(next, activeCategory, search, false);
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
    </UserAuth>
  );
}
