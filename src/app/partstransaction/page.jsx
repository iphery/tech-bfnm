"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "react-responsive";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import UserAuth from "@/components/auth";
import { CommonInput } from "@/components/input";
import { PageCardLimited } from "@/components/card";
import { CardSkeleton, TableSkeleton } from "@/components/loader";
import { formatDate } from "@/utils/dateformat";

// Icons
import {
  HiArrowLeft,
  HiOutlineSearch,
  HiOutlineCube,
} from "react-icons/hi";
import {
  HiOutlineArrowDownTray,
  HiOutlineArrowUpTray,
} from "react-icons/hi2";
import { BsBoxSeam } from "react-icons/bs";

export default function PageTransaction() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const isSmallScreen = useMediaQuery({ query: "(max-width: 640px)" });

  const [detailData, setDetailData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [keyword, setKeyword] = useState("");

  // Server pagination (15 items per page)
  const pageSize = 15;
  const [page, setPage] = useState(1);
  const [desktopPage, setDesktopPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const observerTarget = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Server-Side Fetch
  const fetch_data = async (targetPage = 1, searchKeyword = keyword, isAppend = false) => {
    if (isAppend) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await axios.post("/api/gettransaction", {
        page: targetPage,
        per_page: pageSize,
        search: searchKeyword,
        paginate: true,
      });

      if (response.status === 200) {
        const array = response.data.response || [];
        const pagination = response.data.pagination || {};

        if (isAppend) {
          setDetailData((prev) => [...prev, ...array]);
        } else {
          setDetailData(array);
        }

        setPage(targetPage);
        setDesktopPage(targetPage);
        setTotalPages(pagination.total_pages || 1);
        setTotalCount(pagination.total || 0);
        setHasMore(Boolean(pagination.has_more));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetch_data(1, "", false);
    setIsClient(true);
  }, []);

  const handleSearchChange = (val) => {
    setKeyword(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetch_data(1, val, false);
    }, 400);
  };

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
                    onClick={() => router.push("/parts")}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-black hover:bg-gray-200 dark:bg-meta-4 dark:text-white"
                  >
                    <HiArrowLeft className="text-lg" />
                  </button>
                  <div>
                    <h1 className="text-base font-bold text-black dark:text-white leading-none">
                      Mutasi & Transaksi Stok
                    </h1>
                    <span className="text-[11px] text-body dark:text-bodydark">
                      {totalCount} catatan transaksi
                    </span>
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <CommonInput
                  input={keyword}
                  type="text"
                  onInputChange={handleSearchChange}
                  placeholder="Cari part, keterangan, nomor tiket..."
                >
                  <HiOutlineSearch className="text-body dark:text-bodydark" />
                </CommonInput>
              </div>
            </div>

            {/* List of Transactions */}
            <div className="p-4 space-y-2.5">
              {loading && detailData.length === 0 ? (
                <CardSkeleton count={5} />
              ) : detailData.length === 0 ? (
                <div className="rounded-2xl border border-stroke bg-white p-8 text-center text-xs text-body dark:border-strokedark dark:bg-boxdark dark:text-bodydark">
                  Tidak ada transaksi mutasi yang cocok.
                </div>
              ) : (
                detailData.map((item, index) => {
                  const isIncoming = Number(item.qty || 0) > 0;
                  return (
                    <div
                      key={index}
                      onClick={() => {
                        if (item.id_part) router.push(`/parts/${item.id_part}`);
                      }}
                      className="group cursor-pointer rounded-2xl border border-stroke bg-white p-3.5 shadow-sm hover:border-primary hover:shadow dark:border-strokedark dark:bg-boxdark dark:hover:border-primary transition-all active:scale-[0.99]"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-xs font-bold text-black dark:text-white truncate">
                            {item.description || "Tanpa Nama"}
                          </h3>
                          {item.vendor_code && (
                            <span className="font-mono text-[10px] text-body dark:text-bodydark">
                              {item.vendor_code}
                            </span>
                          )}
                        </div>

                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold shrink-0 ${
                            isIncoming
                              ? "bg-success/15 text-success"
                              : "bg-warning/15 text-warning"
                          }`}
                        >
                          {isIncoming ? <HiOutlineArrowDownTray /> : <HiOutlineArrowUpTray />}
                          {isIncoming ? `+${item.quantity}` : `-${item.quantity}`} {item.unit || "pcs"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-t border-stroke/60 pt-2 text-[11px] text-body dark:border-strokedark/60 dark:text-bodydark">
                        <span>{item.subject || item.id_asset || "-"}</span>
                        <span>{formatDate(item.date)}</span>
                      </div>
                    </div>
                  );
                })
              )}

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
              {/* Header */}
              <div className="flex items-center justify-between gap-4">
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
                      Mutasi & Transaksi Stok Barang
                    </h1>
                    <p className="text-xs text-body dark:text-bodydark">
                      Seluruh rekapitulasi penerimaan (Stock In) dan pengeluaran (Stock Out) gudang
                    </p>
                  </div>
                </div>
              </div>

              {/* Table Card (15 items per page) */}
              <PageCardLimited>
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stroke pb-4 dark:border-strokedark">
                    <div className="w-full sm:w-80">
                      <CommonInput
                        input={keyword}
                        type="text"
                        onInputChange={handleSearchChange}
                        placeholder="Cari transaksi, part, tiket..."
                      >
                        <HiOutlineSearch className="text-body dark:text-bodydark" />
                      </CommonInput>
                    </div>

                    <span className="text-xs text-body dark:text-bodydark">
                      Menampilkan {detailData.length} dari {totalCount} transaksi
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full table-auto text-left text-xs">
                      <thead>
                        <tr className="border-b border-stroke bg-gray-50 text-body dark:border-strokedark dark:bg-meta-4/20 dark:text-bodydark">
                          <th className="py-3 px-4 font-semibold">Tanggal</th>
                          <th className="py-3 px-4 font-semibold">Deskripsi Barang</th>
                          <th className="py-3 px-4 font-semibold">Part No / Detail</th>
                          <th className="py-3 px-4 font-semibold text-center">Mutasi</th>
                          <th className="py-3 px-4 font-semibold">Satuan</th>
                          <th className="py-3 px-4 font-semibold">Keterangan / Tujuan</th>
                          <th className="py-3 px-4 font-semibold">Aset</th>
                          <th className="py-3 px-4 font-semibold">No. Tiket</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stroke dark:divide-strokedark">
                        {loading && detailData.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="p-0">
                              <TableSkeleton rows={8} cols={8} />
                            </td>
                          </tr>
                        ) : detailData.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-8 text-center text-body dark:text-bodydark">
                              Tidak ada riwayat mutasi stok.
                            </td>
                          </tr>
                        ) : (
                          detailData.map((item, index) => {
                            const isIncoming = Number(item.qty || 0) > 0;
                            return (
                              <tr
                                key={index}
                                onClick={() => {
                                  if (item.id_part) router.push(`/parts/${item.id_part}`);
                                }}
                                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-meta-4/10 transition-colors"
                              >
                                <td className="py-3 px-4 text-black dark:text-white whitespace-nowrap">
                                  {formatDate(item.date)}
                                </td>
                                <td className="py-3 px-4 font-semibold text-black dark:text-white">
                                  {item.description}
                                </td>
                                <td className="py-3 px-4 font-mono text-body dark:text-bodydark">
                                  {item.vendor_code || "-"}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span
                                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                      isIncoming
                                        ? "bg-success/15 text-success"
                                        : "bg-warning/15 text-warning"
                                    }`}
                                  >
                                    {isIncoming ? `+${item.quantity}` : `-${item.quantity}`}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-body dark:text-bodydark">
                                  {item.unit || "pcs"}
                                </td>
                                <td className="py-3 px-4 text-body dark:text-bodydark">
                                  {item.subject || "-"}
                                </td>
                                <td className="py-3 px-4 font-mono text-body dark:text-bodydark">
                                  {item.id_asset || "-"}
                                </td>
                                <td className="py-3 px-4 font-mono text-body dark:text-bodydark">
                                  {item.id_for || "-"}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Desktop Server-Side Pagination Controls (15 per page) */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-stroke pt-4 dark:border-strokedark text-xs">
                      <span className="text-body dark:text-bodydark">
                        Halaman {desktopPage} dari {totalPages} (Total {totalCount} transaksi)
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
      </div>
    </UserAuth>
  );
}
