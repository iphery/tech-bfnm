"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "react-responsive";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import UserAuth from "@/components/auth";
import { CommonInput } from "@/components/input";
import { CommonButtonFull } from "@/components/button";
import { PageCardLimited } from "@/components/card";
import { PageLoader, CardSkeleton, TableSkeleton } from "@/components/loader";
import { CustomModal } from "@/components/modal";
import { NotifySuccess, NotifyError } from "@/utils/notify";
import { useProvider } from "@/app/appcontext";

// Icons
import {
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlineCube,
  HiOutlineLocationMarker,
  HiOutlineTag,
  HiOutlineArrowRight,
  HiArrowLeft,
} from "react-icons/hi";
import {
  HiOutlineWrenchScrewdriver,
  HiOutlineArrowDownTray,
  HiOutlineArrowUpTray,
  HiOutlineDocumentText,
  HiOutlineChartBar,
} from "react-icons/hi2";
import { BsCartPlus, BsBoxSeam } from "react-icons/bs";
import { MdAddToPhotos } from "react-icons/md";

export default function ListPart() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const isSmallScreen = useMediaQuery({ query: "(max-width: 640px)" });

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [modalNewPart, setModalNewPart] = useState(false);
  const [keyword, setKeyword] = useState("");

  // Server-side pagination (15 items per page)
  const [page, setPage] = useState(1);
  const [desktopPage, setDesktopPage] = useState(1);
  const pageSize = 15;
  const [displayedParts, setDisplayedParts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const observerTarget = useRef(null);
  const searchTimeoutRef = useRef(null);

  const [inputNewData, setInputNewData] = useState({
    description: "",
    vendor_code: "",
    unit: "",
    location: "",
    remark: "",
  });

  const [inputNewDataError, setInputNewDataError] = useState({
    descriptionError: false,
    codeError: false,
    unitError: false,
    locationError: false,
    remarkError: false,
  });

  const [onloadNew, setOnloadNew] = useState(false);
  const [userLevel, setUserLevel] = useState("");

  // True Server-Side Fetch
  const fetch_data = async (targetPage = 1, searchKeyword = keyword, isAppend = false) => {
    if (isAppend) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await axios.post("/api/stocklist", {
        page: targetPage,
        per_page: pageSize,
        search: searchKeyword,
        paginate: true,
      });

      if (response.status === 200) {
        const array = response.data["response"] || [];
        const pagination = response.data["pagination"] || {};

        if (isAppend) {
          setDisplayedParts((prev) => [...prev, ...array]);
        } else {
          setDisplayedParts(array);
        }

        setPage(targetPage);
        setDesktopPage(targetPage);
        setTotalPages(pagination.total_pages || 1);
        setTotalCount(pagination.total || 0);
        setHasMore(Boolean(pagination.has_more));
      }
    } catch (e) {
      console.error("fetch_data stocklist error:", e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const user = localStorage.getItem("info");
    if (user) {
      try {
        const parseUser = JSON.parse(user);
        setUserLevel(parseUser[0]?.Level ?? "");
      } catch (err) {
        console.error(err);
      }
    }
    fetch_data(1, "", false);
    setIsClient(true);
  }, []);

  // Handle Search with debounce
  const handleSearchChange = (val) => {
    setKeyword(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetch_data(1, val, false);
    }, 400);
  };

  // Infinite Scroll Observer for Mobile
  const handleObserver = useCallback(
    (entries) => {
      const [target] = entries;
      if (target.isIntersecting && hasMore && !loading && !loadingMore) {
        fetch_data(page + 1, keyword, true);
      }
    },
    [hasMore, loading, loadingMore, page, keyword]
  );

  useEffect(() => {
    const element = observerTarget.current;
    if (!element) return;
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.2 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [handleObserver, isSmallScreen]);

  if (!isClient) return null;

  if (userLevel !== "" && parseInt(userLevel) > 2) {
    return (
      <UserAuth>
        <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-whiten dark:bg-boxdark-2 text-black dark:text-white">
          <div className="rounded-2xl border border-stroke bg-white p-8 shadow-sm dark:border-strokedark dark:bg-boxdark max-w-md">
            <BsBoxSeam className="mx-auto text-4xl text-warning mb-3" />
            <h2 className="text-lg font-bold mb-1">Akses Khusus Tim Pemeliharaan</h2>
            <p className="text-xs text-body dark:text-bodydark mb-5 leading-relaxed">
              Menu inventaris dan suku cadang hanya dapat diakses oleh teknisi dan tim pemeliharaan (Role Level 2).
            </p>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow hover:bg-opacity-90"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </UserAuth>
    );
  }

  return (
    <UserAuth>
      <div className="min-h-screen bg-whiten text-body dark:bg-boxdark-2 dark:text-bodydark">
        {isSmallScreen ? (
          /* ================= MOBILE VIEW ================= */
          <div className="flex flex-col min-h-screen pb-20">
            {/* Top Bar */}
            <div className="sticky top-0 z-40 border-b border-stroke/60 bg-white/80 px-4 py-3 backdrop-blur-md dark:border-strokedark/60 dark:bg-boxdark/80">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => router.push("/")}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-black hover:bg-gray-200 dark:bg-meta-4 dark:text-white"
                  >
                    <HiArrowLeft className="text-lg" />
                  </button>
                  <div>
                    <h1 className="text-base font-bold text-black dark:text-white leading-none">
                      Suku Cadang & Stok
                    </h1>
                    <span className="text-[11px] text-body dark:text-bodydark">
                      {totalCount} item terdaftar
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setModalNewPart(true)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-sm hover:bg-opacity-90 transition-all"
                    title="Tambah Part Baru"
                  >
                    <HiOutlinePlus className="text-lg" />
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/partsout")}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-warning/15 text-warning hover:bg-warning/25 transition-all"
                    title="Stock Out"
                  >
                    <BsCartPlus className="text-lg" />
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <CommonInput
                  input={keyword}
                  type="text"
                  onInputChange={handleSearchChange}
                  placeholder="Cari suku cadang, part no, lokasi..."
                >
                  <HiOutlineSearch className="text-body dark:text-bodydark" />
                </CommonInput>
              </div>
            </div>

            {/* Quick Filter & Shortcuts */}
            <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto scrollbar-none text-xs">
              <button
                type="button"
                onClick={() => router.push("/partsusage")}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 font-semibold text-primary shadow-sm dark:bg-primary/20 dark:text-primary"
              >
                <HiOutlineChartBar className="text-primary text-sm" />
                <span>Summary Penggunaan</span>
              </button>
              <button
                type="button"
                onClick={() => router.push("/partsin")}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-stroke bg-white px-3 py-1.5 font-medium text-black shadow-sm dark:border-strokedark dark:bg-boxdark dark:text-white"
              >
                <HiOutlineArrowDownTray className="text-success" />
                <span>Stock In</span>
              </button>
              <button
                type="button"
                onClick={() => router.push("/partsout")}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-stroke bg-white px-3 py-1.5 font-medium text-black shadow-sm dark:border-strokedark dark:bg-boxdark dark:text-white"
              >
                <HiOutlineArrowUpTray className="text-warning" />
                <span>Stock Out</span>
              </button>
              <button
                type="button"
                onClick={() => router.push("/partsorder")}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-stroke bg-white px-3 py-1.5 font-medium text-black shadow-sm dark:border-strokedark dark:bg-boxdark dark:text-white"
              >
                <HiOutlineDocumentText className="text-primary" />
                <span>PO Order</span>
              </button>
              <button
                type="button"
                onClick={() => router.push("/partstransaction")}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-stroke bg-white px-3 py-1.5 font-medium text-black shadow-sm dark:border-strokedark dark:bg-boxdark dark:text-white"
              >
                <BsBoxSeam className="text-meta-5" />
                <span>Mutasi Stok</span>
              </button>
            </div>

            {/* List of Spare Part Cards */}
            <div className="p-4 space-y-2.5">
              {loading && displayedParts.length === 0 ? (
                <CardSkeleton count={5} />
              ) : displayedParts.length === 0 ? (
                <div className="rounded-2xl border border-stroke bg-white p-8 text-center dark:border-strokedark dark:bg-boxdark">
                  <BsBoxSeam className="mx-auto text-3xl opacity-20 mb-2" />
                  <span className="text-xs text-body dark:text-bodydark">
                    Tidak ada suku cadang yang cocok dengan pencarian.
                  </span>
                </div>
              ) : (
                displayedParts.map((item, index) => {
                  const available = Number(item["available_quantity"] || 0);
                  return (
                    <div
                      key={index}
                      onClick={() => router.push(`/parts/${item["id_part"]}`)}
                      className="group cursor-pointer rounded-2xl border border-stroke bg-white p-3.5 shadow-sm hover:border-primary hover:shadow dark:border-strokedark dark:bg-boxdark dark:hover:border-primary transition-all active:scale-[0.99]"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-bold text-black dark:text-white leading-tight truncate">
                            {item["description"]}
                          </h3>
                          {item["vendor_code"] && (
                            <span className="font-mono text-[11px] text-body dark:text-bodydark">
                              Part No: {item["vendor_code"]}
                            </span>
                          )}
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold shrink-0 ${
                            available > 0
                              ? "bg-success/15 text-success"
                              : "bg-danger/15 text-danger"
                          }`}
                        >
                          {available} {item["unit"] || "pcs"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-t border-stroke/60 pt-2 text-[11px] text-body dark:border-strokedark/60 dark:text-bodydark">
                        <div className="flex items-center gap-1">
                          <HiOutlineLocationMarker className="text-xs text-primary" />
                          <span>{item["location"] || "Lokasi -"}</span>
                        </div>
                        {item["remark"] && (
                          <span className="truncate max-w-[150px] italic opacity-80">
                            {item["remark"]}
                          </span>
                        )}
                        <HiOutlineArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  );
                })
              )}

              {/* Infinite Scroll Trigger */}
              <div ref={observerTarget} className="py-2 text-center">
                {loadingMore && (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ================= DESKTOP VIEW ================= */
          <DefaultLayout>
            <div className="mx-auto max-w-7xl space-y-6">
              {/* Header & Quick Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-black dark:text-white">
                    Manajemen Stok & Suku Cadang
                  </h1>
                  <p className="text-xs text-body dark:text-bodydark">
                    Katalog inventory suku cadang dan pemantauan pergerakan stok barang
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setModalNewPart(true)}
                    className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white shadow hover:bg-opacity-90 active:scale-[0.99] transition-all"
                  >
                    <MdAddToPhotos className="text-base" />
                    <span>Tambah Part Baru</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push("/partsin")}
                    className="flex items-center gap-2 rounded-xl border border-stroke bg-white px-4 py-2.5 text-xs font-semibold text-black hover:bg-gray-50 dark:border-strokedark dark:bg-boxdark dark:text-white dark:hover:bg-meta-4/20 transition-all shadow-sm"
                  >
                    <HiOutlineArrowDownTray className="text-success text-base" />
                    <span>Stock In</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push("/partsout")}
                    className="flex items-center gap-2 rounded-xl border border-stroke bg-white px-4 py-2.5 text-xs font-semibold text-black hover:bg-gray-50 dark:border-strokedark dark:bg-boxdark dark:text-white dark:hover:bg-meta-4/20 transition-all shadow-sm"
                  >
                    <BsCartPlus className="text-warning text-base" />
                    <span>Stock Out</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push("/partsorder")}
                    className="flex items-center gap-2 rounded-xl border border-stroke bg-white px-4 py-2.5 text-xs font-semibold text-black hover:bg-gray-50 dark:border-strokedark dark:bg-boxdark dark:text-white dark:hover:bg-meta-4/20 transition-all shadow-sm"
                  >
                    <HiOutlineDocumentText className="text-primary text-base" />
                    <span>PO Order</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push("/partstransaction")}
                    className="flex items-center gap-2 rounded-xl border border-stroke bg-white px-4 py-2.5 text-xs font-semibold text-black hover:bg-gray-50 dark:border-strokedark dark:bg-boxdark dark:text-white dark:hover:bg-meta-4/20 transition-all shadow-sm"
                  >
                    <BsBoxSeam className="text-meta-5 text-base" />
                    <span>Mutasi Stok</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push("/partsusage")}
                    className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-all shadow-sm"
                  >
                    <HiOutlineChartBar className="text-primary text-base" />
                    <span>Summary Penggunaan</span>
                  </button>
                </div>
              </div>

              {/* Data Table Card */}
              <PageCardLimited>
                <div className="space-y-4">
                  {/* Search Bar & Summary */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stroke pb-4 dark:border-strokedark">
                    <div className="w-full sm:w-80">
                      <CommonInput
                        input={keyword}
                        type="text"
                        onInputChange={handleSearchChange}
                        placeholder="Cari deskripsi, kode part, lokasi..."
                      >
                        <HiOutlineSearch className="text-body dark:text-bodydark" />
                      </CommonInput>
                    </div>

                    <span className="text-xs text-body dark:text-bodydark">
                      Menampilkan {displayedParts.length} dari {totalCount} total suku cadang
                    </span>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto text-left text-xs">
                      <thead>
                        <tr className="border-b border-stroke bg-gray-50 text-body dark:border-strokedark dark:bg-meta-4/20 dark:text-bodydark">
                          <th className="py-3 px-4 font-semibold">Deskripsi Suku Cadang</th>
                          <th className="py-3 px-4 font-semibold">Part No / Detail</th>
                          <th className="py-3 px-4 font-semibold">Remark</th>
                          <th className="py-3 px-4 font-semibold text-center">Stok Tersedia</th>
                          <th className="py-3 px-4 font-semibold">Satuan</th>
                          <th className="py-3 px-4 font-semibold">Lokasi Simpan</th>
                          <th className="py-3 px-4 font-semibold text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stroke dark:divide-strokedark">
                        {loading && displayedParts.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-0">
                              <TableSkeleton rows={8} cols={7} />
                            </td>
                          </tr>
                        ) : displayedParts.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-body dark:text-bodydark">
                              Tidak ada suku cadang yang sesuai kriteria pencarian.
                            </td>
                          </tr>
                        ) : (
                          displayedParts.map((item, index) => {
                            const available = Number(item["available_quantity"] || 0);
                            return (
                              <tr
                                key={index}
                                onClick={() => router.push(`/parts/${item["id_part"]}`)}
                                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-meta-4/10 transition-colors"
                              >
                                <td className="py-3 px-4 font-semibold text-black dark:text-white">
                                  {item["description"]}
                                </td>
                                <td className="py-3 px-4 font-mono text-body dark:text-bodydark">
                                  {item["vendor_code"] || "-"}
                                </td>
                                <td className="py-3 px-4 text-body dark:text-bodydark">
                                  {item["remark"] || "-"}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span
                                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                      available > 0
                                        ? "bg-success/15 text-success"
                                        : "bg-danger/15 text-danger"
                                    }`}
                                  >
                                    {available}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-body dark:text-bodydark">
                                  {item["unit"] || "pcs"}
                                </td>
                                <td className="py-3 px-4 text-body dark:text-bodydark">
                                  {item["location"] || "-"}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      router.push(`/parts/${item["id_part"]}`);
                                    }}
                                    className="rounded-lg border border-stroke px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-primary hover:text-white dark:border-strokedark transition-colors"
                                  >
                                    Detail Stok
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Desktop Server-Side Pagination Controls (15 items per page) */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-stroke pt-4 dark:border-strokedark text-xs">
                      <span className="text-body dark:text-bodydark">
                        Halaman {desktopPage} dari {totalPages} (Total {totalCount} item)
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={desktopPage <= 1 || loading}
                          onClick={() => fetch_data(desktopPage - 1, keyword, false)}
                          className="rounded-lg border border-stroke px-3 py-1.5 font-semibold text-black dark:border-strokedark dark:text-white hover:bg-gray-100 dark:hover:bg-meta-4 disabled:opacity-40 transition"
                        >
                          Sebelumnya
                        </button>
                        <span className="px-2 font-medium">
                          {desktopPage} / {totalPages}
                        </span>
                        <button
                          type="button"
                          disabled={desktopPage >= totalPages || loading}
                          onClick={() => fetch_data(desktopPage + 1, keyword, false)}
                          className="rounded-lg border border-stroke px-3 py-1.5 font-semibold text-black dark:border-strokedark dark:text-white hover:bg-gray-100 dark:hover:bg-meta-4 disabled:opacity-40 transition"
                        >
                          Selanjutnya
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </PageCardLimited>
            </div>
          </DefaultLayout>
        )}

        {/* Modal New Part */}
        <CustomModal
          isVisible={modalNewPart}
          isSmallWidth="md"
          title="Registrasi Part Baru"
          onClose={() => setModalNewPart(false)}
        >
          <div className="space-y-4">
            <p className="text-xs text-body dark:text-bodydark pb-2 border-b border-stroke/60 dark:border-strokedark/60">
              Lengkapi rincian suku cadang untuk dimasukkan ke dalam katalog master sistem inventaris.
            </p>

            <div className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-black dark:text-white mb-1">
                  Deskripsi / Nama Part <span className="text-danger">*</span>
                </label>
                <CommonInput
                  placeholder="Contoh: Bearing 6205, Filter Oli, dsb..."
                  input={inputNewData.description}
                  onInputChange={(val) =>
                    setInputNewData((prev) => ({ ...prev, description: val }))
                  }
                  error={inputNewDataError.descriptionError}
                  errorMessage="Deskripsi wajib diisi"
                  onChg={() =>
                    setInputNewDataError((prev) => ({ ...prev, descriptionError: false }))
                  }
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-black dark:text-white mb-1">
                  Part Number / Detail Vendor <span className="text-danger">*</span>
                </label>
                <CommonInput
                  placeholder="Nomor part vendor / kode pabrikan..."
                  input={inputNewData.vendor_code}
                  onInputChange={(val) =>
                    setInputNewData((prev) => ({ ...prev, vendor_code: val }))
                  }
                  error={inputNewDataError.codeError}
                  errorMessage="Part Number wajib diisi"
                  onChg={() =>
                    setInputNewDataError((prev) => ({ ...prev, codeError: false }))
                  }
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-black dark:text-white mb-1">
                    Satuan Unit <span className="text-danger">*</span>
                  </label>
                  <CommonInput
                    placeholder="Contoh: Pcs, Box, Ltr, Roll"
                    input={inputNewData.unit}
                    onInputChange={(val) =>
                      setInputNewData((prev) => ({ ...prev, unit: val }))
                    }
                    error={inputNewDataError.unitError}
                    errorMessage="Satuan wajib diisi"
                    onChg={() =>
                      setInputNewDataError((prev) => ({ ...prev, unitError: false }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-black dark:text-white mb-1">
                    Lokasi Rak / Gudang <span className="text-danger">*</span>
                  </label>
                  <CommonInput
                    placeholder="Contoh: Rak A-02, Gudang 1"
                    input={inputNewData.location}
                    onInputChange={(val) =>
                      setInputNewData((prev) => ({ ...prev, location: val }))
                    }
                    error={inputNewDataError.locationError}
                    errorMessage="Lokasi wajib diisi"
                    onChg={() =>
                      setInputNewDataError((prev) => ({ ...prev, locationError: false }))
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-black dark:text-white mb-1">
                  Catatan / Remark <span className="text-danger">*</span>
                </label>
                <CommonInput
                  placeholder="Catatan spesifikasi / peruntukan part..."
                  input={inputNewData.remark}
                  onInputChange={(val) =>
                    setInputNewData((prev) => ({ ...prev, remark: val }))
                  }
                  error={inputNewDataError.remarkError}
                  errorMessage="Catatan wajib diisi"
                  onChg={() =>
                    setInputNewDataError((prev) => ({ ...prev, remarkError: false }))
                  }
                />
              </div>
            </div>

            <div className="pt-3 border-t border-stroke/60 dark:border-strokedark/60 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setModalNewPart(false)}
                className="rounded-xl border border-stroke px-4 py-2.5 text-xs font-semibold text-body hover:bg-gray-100 dark:border-strokedark dark:text-bodydark dark:hover:bg-meta-4 transition"
              >
                Batal
              </button>
              <CommonButtonFull
                label="Simpan Part Baru"
                onload={onloadNew}
                disabled={onloadNew}
                onClick={async () => {
                  let hasErr = false;
                  const errState = {
                    descriptionError: !inputNewData.description.trim(),
                    codeError: !inputNewData.vendor_code.trim(),
                    unitError: !inputNewData.unit.trim(),
                    locationError: !inputNewData.location.trim(),
                    remarkError: !inputNewData.remark.trim(),
                  };
                  if (Object.values(errState).some(Boolean)) {
                    setInputNewDataError(errState);
                    return;
                  }

                  setOnloadNew(true);
                  try {
                    const res = await axios.post("/api/newpart", {
                      data: inputNewData,
                    });
                    if (res.status === 200) {
                      NotifySuccess(res.data.response || "Part berhasil ditambahkan");
                      setModalNewPart(false);
                      setInputNewData({
                        description: "",
                        vendor_code: "",
                        unit: "",
                        location: "",
                        remark: "",
                      });
                      fetch_data();
                    }
                  } catch (e) {
                    NotifyError("Gagal menyimpan part baru");
                  } finally {
                    setOnloadNew(false);
                  }
                }}
              />
            </div>
          </div>
        </CustomModal>
      </div>
    </UserAuth>
  );
}
