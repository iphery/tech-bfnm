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
import { CustomModal } from "@/components/modal";
import { formatDate } from "@/utils/dateformat";
import { NotifySuccess, NotifyError } from "@/utils/notify";

// Icons
import {
  HiArrowLeft,
  HiOutlineMagnifyingGlass as HiOutlineSearch,
  HiOutlineCalendar,
  HiOutlineArrowRight,
  HiOutlineExclamationTriangle,
  HiOutlineCheckCircle,
  HiOutlineArrowDownTray,
  HiOutlineAdjustmentsHorizontal,
  HiOutlineChartBar,
  HiOutlineBuildingOffice2,
  HiOutlineWrench,
  HiOutlineCube,
} from "react-icons/hi2";
import { BsBoxSeam, BsCartPlus, BsShieldCheck, BsExclamationCircle } from "react-icons/bs";

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export default function PartsUsageSummaryPage() {
  const router = useRouter();
  const isSmallScreen = useMediaQuery({ query: "(max-width: 640px)" });

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, DEFISIT, AMAN, USED

  const [partsData, setPartsData] = useState([]);
  const [kpiData, setKpiData] = useState(null);
  const [periodInfo, setPeriodInfo] = useState(null);
  const [loader, setLoader] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [userLevel, setUserLevel] = useState("");

  // Server Pagination (15 items per page)
  const pageSize = 15;
  const [mobilePage, setMobilePage] = useState(1);
  const [desktopPage, setDesktopPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMoreMobile, setHasMoreMobile] = useState(false);
  const observerTarget = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Modal Detail Distribusi Mesin
  const [modalDetailPart, setModalDetailPart] = useState(null);

  const fetch_data = async (
    targetPage = 1,
    searchVal = keyword,
    m = selectedMonth,
    y = selectedYear,
    filter = statusFilter,
    isAppend = false
  ) => {
    if (isAppend) {
      setLoadingMore(true);
    } else {
      setLoader(true);
    }

    try {
      const response = await axios.post("/api/partsusage", {
        page: targetPage,
        per_page: pageSize,
        search: searchVal,
        month: m,
        year: y,
        status_filter: filter,
      });

      if (response.status === 200) {
        const items = response.data.response || [];
        const pagination = response.data.pagination || {};

        if (isAppend) {
          setPartsData((prev) => [...prev, ...items]);
        } else {
          setPartsData(items);
        }

        setKpiData(response.data.kpi || null);
        setPeriodInfo(response.data.period || null);

        setMobilePage(targetPage);
        setDesktopPage(targetPage);
        setTotalPages(pagination.total_pages || 1);
        setTotalCount(pagination.total || 0);
        setHasMoreMobile(Boolean(pagination.has_more));
      }
    } catch (err) {
      console.error("fetch partsusage error:", err);
      NotifyError("Gagal memuat ringkasan pemakaian spare part.");
    } finally {
      setLoader(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const user = localStorage.getItem("info");
    if (user) {
      try {
        const parseUser = JSON.parse(user);
        setUserLevel(parseUser[0]?.Level ?? "");
      } catch (e) {
        console.error(e);
      }
    }
    fetch_data(1, "", selectedMonth, selectedYear, "ALL", false);
    setIsClient(true);
  }, []);

  const handleSearchChange = (val) => {
    setKeyword(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetch_data(1, val, selectedMonth, selectedYear, statusFilter, false);
    }, 400);
  };

  const handleMonthYearChange = (m, y) => {
    setSelectedMonth(m);
    setSelectedYear(y);
    fetch_data(1, keyword, m, y, statusFilter, false);
  };

  const handleStatusFilterChange = (filter) => {
    setStatusFilter(filter);
    fetch_data(1, keyword, selectedMonth, selectedYear, filter, false);
  };

  // Mobile Infinite Scroll
  const handleObserver = useCallback(
    (entries) => {
      const [target] = entries;
      if (target.isIntersecting && hasMoreMobile && !loader && !loadingMore) {
        fetch_data(mobilePage + 1, keyword, selectedMonth, selectedYear, statusFilter, true);
      }
    },
    [hasMoreMobile, loader, loadingMore, mobilePage, keyword, selectedMonth, selectedYear, statusFilter]
  );

  useEffect(() => {
    const element = observerTarget.current;
    if (!element) return;
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    observer.observe(element);
    return () => observer.unobserve(element);
  }, [handleObserver]);

  // Export CSV Helper
  const exportToCSV = () => {
    if (partsData.length === 0) {
      NotifyError("Tidak ada data untuk diekspor");
      return;
    }
    const headers = [
      "ID Part",
      "Nama Part",
      "Vendor Code",
      "Satuan",
      "Stok Gudang",
      "Pemakaian Bulan Ini",
      "Rata-rata AMC",
      "Rekomendasi Kebutuhan",
      "Saran Beli",
      "Status",
      "Mesin Terpasang"
    ];

    const rows = partsData.map((p) => [
      `"${p.id_part}"`,
      `"${p.description}"`,
      `"${p.vendor_code}"`,
      `"${p.unit}"`,
      p.available_stock,
      p.month_usage,
      p.amc,
      p.recommended_monthly_need,
      p.suggested_purchase,
      `"${p.status}"`,
      `"${(p.machines || []).map((m) => `${m.asset_name} (${m.total_qty})`).join(", ")}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Summary_Pemakaian_Sparepart_${periodInfo?.month_name || selectedMonth}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    NotifySuccess("Laporan CSV berhasil diunduh");
  };

  if (!isClient) return null;

  // Role Restriction: Role Level <= 2 only
  if (userLevel !== "" && parseInt(userLevel) > 2) {
    return (
      <UserAuth>
        <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-whiten dark:bg-boxdark-2 text-black dark:text-white">
          <div className="rounded-2xl border border-stroke bg-white p-8 shadow-sm dark:border-strokedark dark:bg-boxdark max-w-md">
            <BsBoxSeam className="mx-auto text-4xl text-warning mb-3" />
            <h2 className="text-lg font-bold mb-1">Akses Khusus Tim Pemeliharaan</h2>
            <p className="text-xs text-body dark:text-bodydark mb-5 leading-relaxed">
              Fitur ringkasan penggunaan dan rekomendasi perencanaan stok suku cadang hanya dapat diakses oleh teknisi dan tim pemeliharaan.
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
                    onClick={() => router.push("/parts")}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-black hover:bg-gray-200 dark:bg-meta-4 dark:text-white"
                  >
                    <HiArrowLeft className="text-lg" />
                  </button>
                  <div>
                    <h1 className="text-base font-bold text-black dark:text-white leading-none">
                      Summary Penggunaan
                    </h1>
                    <span className="text-[11px] text-primary font-semibold">
                      {periodInfo?.month_name || MONTH_NAMES[selectedMonth - 1]} {selectedYear}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={exportToCSV}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-stroke bg-white text-black shadow-sm dark:border-strokedark dark:bg-boxdark dark:text-white hover:bg-gray-50"
                  title="Ekspor CSV"
                >
                  <HiOutlineArrowDownTray className="text-base" />
                </button>
              </div>

              {/* Month & Year Selectors */}
              <div className="grid grid-cols-2 gap-2 mb-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => handleMonthYearChange(parseInt(e.target.value, 10), selectedYear)}
                  className="w-full rounded-xl border border-stroke bg-gray-50 px-2.5 py-1.5 text-xs font-semibold text-black dark:border-strokedark dark:bg-meta-4 dark:text-white outline-none"
                >
                  {MONTH_NAMES.map((mName, idx) => (
                    <option key={idx} value={idx + 1}>
                      {mName}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedYear}
                  onChange={(e) => handleMonthYearChange(selectedMonth, parseInt(e.target.value, 10))}
                  className="w-full rounded-xl border border-stroke bg-gray-50 px-2.5 py-1.5 text-xs font-semibold text-black dark:border-strokedark dark:bg-meta-4 dark:text-white outline-none"
                >
                  {[2024, 2025, 2026, 2027].map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <CommonInput
                  input={keyword}
                  type="text"
                  onInputChange={handleSearchChange}
                  placeholder="Cari spare part, kode, atau mesin..."
                >
                  <HiOutlineSearch className="text-body dark:text-bodydark" />
                </CommonInput>
              </div>
            </div>

            {/* Quick KPI Badges / Metrics */}
            {kpiData && (
              <div className="grid grid-cols-3 gap-2 p-4 pb-1">
                <div className="rounded-xl border border-stroke bg-white p-2.5 text-center shadow-sm dark:border-strokedark dark:bg-boxdark">
                  <span className="block text-[10px] text-body dark:text-bodydark">Total Terpakai</span>
                  <span className="text-base font-bold text-black dark:text-white">
                    {kpiData.total_parts_consumed} <span className="text-[10px] font-normal">unit</span>
                  </span>
                </div>
                <div className="rounded-xl border border-warning/30 bg-warning/5 p-2.5 text-center shadow-sm dark:bg-warning/10">
                  <span className="block text-[10px] text-warning font-semibold">Perlu Beli</span>
                  <span className="text-base font-bold text-warning">
                    {kpiData.deficit_count} <span className="text-[10px] font-normal">item</span>
                  </span>
                </div>
                <div className="rounded-xl border border-success/30 bg-success/5 p-2.5 text-center shadow-sm dark:bg-success/10">
                  <span className="block text-[10px] text-success font-semibold">Stok Aman</span>
                  <span className="text-base font-bold text-success">
                    {kpiData.safe_count} <span className="text-[10px] font-normal">item</span>
                  </span>
                </div>
              </div>
            )}

            {/* Status Filter Chips */}
            <div className="flex items-center gap-1.5 px-4 py-2 overflow-x-auto scrollbar-none text-[11px]">
              {[
                { id: "ALL", label: "Semua Part" },
                { id: "DEFISIT", label: "⚠️ Perlu Beli" },
                { id: "USED", label: "📦 Ada Pemakaian" },
                { id: "AMAN", label: "✅ Stok Aman" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleStatusFilterChange(tab.id)}
                  className={`shrink-0 rounded-full px-3 py-1 font-semibold transition ${
                    statusFilter === tab.id
                      ? "bg-primary text-white shadow-sm"
                      : "border border-stroke bg-white text-black dark:border-strokedark dark:bg-boxdark dark:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* List of Usage Summary Cards */}
            <div className="p-4 space-y-3">
              {loader && partsData.length === 0 ? (
                <CardSkeleton count={5} />
              ) : partsData.length === 0 ? (
                <div className="rounded-2xl border border-stroke bg-white p-8 text-center text-xs text-body dark:border-strokedark dark:bg-boxdark dark:text-bodydark">
                  <BsBoxSeam className="mx-auto text-3xl opacity-20 mb-2" />
                  Tidak ada catatan suku cadang sesuai filter.
                </div>
              ) : (
                <>
                  {partsData.map((part, index) => {
                    const isDeficit = part.status === "DEFISIT" || part.status === "KRITIS";
                    return (
                      <div
                        key={index}
                        className="rounded-2xl border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark space-y-3"
                      >
                        {/* Title & Available stock */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-bold text-black dark:text-white leading-tight">
                              {part.description}
                            </h3>
                            {part.vendor_code && (
                              <span className="font-mono text-[11px] text-body dark:text-bodydark">
                                Part No: {part.vendor_code}
                              </span>
                            )}
                          </div>

                          <div className="text-right shrink-0">
                            <span
                              className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                isDeficit
                                  ? "bg-danger/15 text-danger"
                                  : "bg-success/15 text-success"
                              }`}
                            >
                              Stok: {part.available_stock} {part.unit}
                            </span>
                          </div>
                        </div>

                        {/* Consumption & Decision Grid */}
                        <div className="grid grid-cols-3 gap-2 rounded-xl bg-gray-50 p-2.5 text-center text-xs dark:bg-meta-4/20">
                          <div>
                            <span className="block text-[10px] text-body dark:text-bodydark">Pakai Bln Ini</span>
                            <span className="font-bold text-black dark:text-white">
                              {part.month_usage} {part.unit}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-body dark:text-bodydark">Rata2 (AMC)</span>
                            <span className="font-bold text-black dark:text-white">
                              {part.amc} {part.unit}/bln
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-body dark:text-bodydark">Saran Beli</span>
                            <span className={`font-bold ${isDeficit ? "text-danger" : "text-success"}`}>
                              {part.suggested_purchase > 0 ? `+${part.suggested_purchase} ${part.unit}` : "0"}
                            </span>
                          </div>
                        </div>

                        {/* Recommendation Decision Banner */}
                        <div
                          className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold ${
                            part.status === "KRITIS"
                              ? "bg-danger/10 text-danger border border-danger/20"
                              : part.status === "DEFISIT"
                              ? "bg-warning/10 text-warning border border-warning/20"
                              : "bg-success/10 text-success border border-success/20"
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            {isDeficit ? (
                              <BsExclamationCircle className="text-sm shrink-0" />
                            ) : (
                              <BsShieldCheck className="text-sm shrink-0" />
                            )}
                            <span>
                              {part.status === "KRITIS"
                                ? `Stok Habis! Beli min ${part.suggested_purchase} ${part.unit}`
                                : part.status === "DEFISIT"
                                ? `Perlu Pengadaan: Order ${part.suggested_purchase} ${part.unit}`
                                : `Stok Aman untuk ${part.recommended_monthly_need} ${part.unit}/bln`}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold underline">
                            Target: {part.recommended_monthly_need} {part.unit}
                          </span>
                        </div>

                        {/* Machine Breakdown Chips */}
                        <div className="border-t border-stroke/60 pt-2 text-[11px] space-y-1.5 dark:border-strokedark/60">
                          <div className="flex items-center justify-between text-body dark:text-bodydark">
                            <span className="flex items-center gap-1">
                              <HiOutlineBuildingOffice2 className="text-primary" />
                              <span>Dipakai di {part.machines.length} Mesin</span>
                            </span>
                            {part.machines.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setModalDetailPart(part)}
                                className="font-semibold text-primary hover:underline"
                              >
                                Lihat Rincian &rarr;
                              </button>
                            )}
                          </div>

                          {part.machines.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                              {part.machines.map((m, mIdx) => (
                                <span
                                  key={mIdx}
                                  onClick={() => setModalDetailPart(part)}
                                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-stroke bg-white px-2 py-0.5 text-[10px] font-medium text-black dark:border-strokedark dark:bg-boxdark dark:text-white"
                                >
                                  <span>{m.asset_name}</span>
                                  <span className="font-bold text-primary">({m.total_qty})</span>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[10px] italic text-body dark:text-bodydark">
                              Belum ada transaksi pemakaian pada periode ini.
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Infinite scroll observer target */}
                  <div ref={observerTarget} className="py-2 text-center text-xs text-body dark:text-bodydark">
                    {loadingMore && (
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                        <span>Memuat 15 suku cadang berikutnya...</span>
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
              {/* Header & Quick Action Buttons */}
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
                    <h1 className="text-xl font-bold text-black dark:text-white flex items-center gap-2">
                      <span>Ringkasan & Analisis Penggunaan Suku Cadang</span>
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        Kebutuhan Bulanan
                      </span>
                    </h1>
                    <p className="text-xs text-body dark:text-bodydark">
                      Pantau konsumsi spare part bulanan, distribusi mesin terpasang, rata-rata AMC, dan kalkulasi rekomendasi pembelian
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => router.push("/parts")}
                    className="flex items-center gap-2 rounded-xl border border-stroke bg-white px-4 py-2.5 text-xs font-semibold text-black hover:bg-gray-50 dark:border-strokedark dark:bg-boxdark dark:text-white transition shadow-sm"
                  >
                    <BsBoxSeam className="text-base" />
                    <span>Katalog Stok</span>
                  </button>

                  <button
                    type="button"
                    onClick={exportToCSV}
                    className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white shadow hover:bg-opacity-90 active:scale-[0.99] transition"
                  >
                    <HiOutlineArrowDownTray className="text-base" />
                    <span>Ekspor CSV</span>
                  </button>
                </div>
              </div>

              {/* Top KPI Metric Cards */}
              {kpiData && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Total Consumption */}
                  <div className="rounded-2xl border border-stroke bg-white p-5 shadow-sm dark:border-strokedark dark:bg-boxdark">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-body dark:text-bodydark">
                        Total Penggunaan Bulan Ini
                      </span>
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <HiOutlineCube className="text-lg" />
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-black dark:text-white">
                        {kpiData.total_parts_consumed}
                      </span>
                      <span className="text-xs text-body dark:text-bodydark">unit terpakai</span>
                    </div>
                    <span className="text-[11px] text-body dark:text-bodydark block mt-1">
                      Dari {kpiData.active_consumed_parts_count} jenis spare part
                    </span>
                  </div>

                  {/* Deficit / Need Purchase */}
                  <div className="rounded-2xl border border-warning/30 bg-white p-5 shadow-sm dark:border-warning/30 dark:bg-boxdark">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-warning">
                        Part Defisit / Perlu Beli
                      </span>
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-warning/15 text-warning">
                        <HiOutlineExclamationTriangle className="text-lg" />
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-warning">
                        {kpiData.deficit_count}
                      </span>
                      <span className="text-xs text-body dark:text-bodydark">item butuh order</span>
                    </div>
                    <span className="text-[11px] text-danger block mt-1 font-semibold">
                      {kpiData.critical_count} item stok habis (0 pcs)
                    </span>
                  </div>

                  {/* Safe Stock */}
                  <div className="rounded-2xl border border-success/30 bg-white p-5 shadow-sm dark:border-success/30 dark:bg-boxdark">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-success">
                        Part Stok Aman
                      </span>
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-success/15 text-success">
                        <HiOutlineCheckCircle className="text-lg" />
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-success">
                        {kpiData.safe_count}
                      </span>
                      <span className="text-xs text-body dark:text-bodydark">item mencukupi</span>
                    </div>
                    <span className="text-[11px] text-body dark:text-bodydark block mt-1">
                      Stok gudang &ge; AMC sebulan
                    </span>
                  </div>

                  {/* Top Consumed Part */}
                  <div className="rounded-2xl border border-stroke bg-white p-5 shadow-sm dark:border-strokedark dark:bg-boxdark">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-body dark:text-bodydark">
                        Part Paling Banyak Dipakai
                      </span>
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-meta-5/10 text-meta-5">
                        <HiOutlineChartBar className="text-lg" />
                      </div>
                    </div>
                    {kpiData.top_consumed_part ? (
                      <>
                        <span className="text-sm font-bold text-black dark:text-white block truncate">
                          {kpiData.top_consumed_part.description}
                        </span>
                        <span className="text-xs font-semibold text-primary block mt-1">
                          {kpiData.top_consumed_part.qty} {kpiData.top_consumed_part.unit} terpasang
                        </span>
                      </>
                    ) : (
                      <span className="text-xs italic text-body dark:text-bodydark">Belum ada konsumsi</span>
                    )}
                  </div>
                </div>
              )}

              {/* Data Table Card */}
              <PageCardLimited>
                <div className="space-y-4">
                  {/* Filter Toolbar: Month, Year, Search, Status Tabs */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stroke pb-4 dark:border-strokedark">
                    <div className="flex flex-wrap items-center gap-3 flex-1">
                      {/* Search */}
                      <div className="w-full sm:w-72">
                        <CommonInput
                          input={keyword}
                          type="text"
                          onInputChange={handleSearchChange}
                          placeholder="Cari spare part, kode, atau mesin..."
                        >
                          <HiOutlineSearch className="text-body dark:text-bodydark" />
                        </CommonInput>
                      </div>

                      {/* Month Selector */}
                      <div className="flex items-center gap-1.5">
                        <HiOutlineCalendar className="text-primary text-base" />
                        <select
                          value={selectedMonth}
                          onChange={(e) => handleMonthYearChange(parseInt(e.target.value, 10), selectedYear)}
                          className="rounded-xl border border-stroke bg-gray-50 px-3 py-2 text-xs font-semibold text-black dark:border-strokedark dark:bg-meta-4 dark:text-white outline-none focus:border-primary"
                        >
                          {MONTH_NAMES.map((mName, idx) => (
                            <option key={idx} value={idx + 1}>
                              {mName}
                            </option>
                          ))}
                        </select>

                        <select
                          value={selectedYear}
                          onChange={(e) => handleMonthYearChange(selectedMonth, parseInt(e.target.value, 10))}
                          className="rounded-xl border border-stroke bg-gray-50 px-3 py-2 text-xs font-semibold text-black dark:border-strokedark dark:bg-meta-4 dark:text-white outline-none focus:border-primary"
                        >
                          {[2024, 2025, 2026, 2027].map((yr) => (
                            <option key={yr} value={yr}>
                              {yr}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1 dark:bg-meta-4/30 text-xs">
                      {[
                        { id: "ALL", label: "Semua Part" },
                        { id: "DEFISIT", label: "Perlu Beli" },
                        { id: "USED", label: "Ada Pemakaian" },
                        { id: "AMAN", label: "Stok Aman" },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => handleStatusFilterChange(tab.id)}
                          className={`rounded-lg px-3 py-1.5 font-semibold transition ${
                            statusFilter === tab.id
                              ? "bg-white text-primary shadow-sm dark:bg-boxdark dark:text-white"
                              : "text-body hover:text-black dark:text-bodydark dark:hover:text-white"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Summary Count Line */}
                  <div className="flex items-center justify-between text-xs text-body dark:text-bodydark">
                    <span>
                      Periode Analisis:{" "}
                      <strong className="text-black dark:text-white">
                        {periodInfo?.month_name || MONTH_NAMES[selectedMonth - 1]} {selectedYear}
                      </strong>
                    </span>
                    <span>
                      Menampilkan {partsData.length} dari {totalCount} spare part
                    </span>
                  </div>

                  {/* Analytics Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto text-left text-xs">
                      <thead>
                        <tr className="border-b border-stroke bg-gray-50 text-body dark:border-strokedark dark:bg-meta-4/20 dark:text-bodydark">
                          <th className="py-3 px-4 font-semibold">Spare Part</th>
                          <th className="py-3 px-4 font-semibold text-center">Stok Gudang</th>
                          <th className="py-3 px-4 font-semibold text-center">Pakai Bln Ini</th>
                          <th className="py-3 px-4 font-semibold text-center">Rata2 (AMC)</th>
                          <th className="py-3 px-4 font-semibold text-center">Kebutuhan/Bln</th>
                          <th className="py-3 px-4 font-semibold text-center">Saran Order Beli</th>
                          <th className="py-3 px-4 font-semibold text-center">Status</th>
                          <th className="py-3 px-4 font-semibold">Distribusi Mesin (&quot;Di Pakai Dimana Aja&quot;)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stroke dark:divide-strokedark">
                        {loader && partsData.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="p-0">
                              <TableSkeleton rows={8} cols={8} />
                            </td>
                          </tr>
                        ) : partsData.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-12 text-center text-body dark:text-bodydark">
                              Tidak ada data suku cadang sesuai filter kriteria yang dipilih.
                            </td>
                          </tr>
                        ) : (
                          partsData.map((part, index) => {
                            const isDeficit = part.status === "DEFISIT" || part.status === "KRITIS";
                            return (
                              <tr
                                key={index}
                                className="hover:bg-gray-50 dark:hover:bg-meta-4/10 transition-colors"
                              >
                                {/* Name & Code */}
                                <td className="py-3 px-4">
                                  <div
                                    onClick={() => router.push(`/parts/${part.id_part}`)}
                                    className="cursor-pointer font-bold text-black hover:text-primary dark:text-white dark:hover:text-primary transition"
                                  >
                                    {part.description}
                                  </div>
                                  <div className="flex items-center gap-2 text-[11px] text-body dark:text-bodydark">
                                    <span className="font-mono">{part.vendor_code || "-"}</span>
                                    <span>&bull;</span>
                                    <span>Lok: {part.location}</span>
                                  </div>
                                </td>

                                {/* Available Stock */}
                                <td className="py-3 px-4 text-center">
                                  <span
                                    className={`inline-block rounded-full px-2.5 py-0.5 font-bold ${
                                      part.available_stock > 0
                                        ? "bg-slate-100 text-slate-800 dark:bg-meta-4/40 dark:text-white"
                                        : "bg-danger/15 text-danger"
                                    }`}
                                  >
                                    {part.available_stock} {part.unit}
                                  </span>
                                </td>

                                {/* Month Usage */}
                                <td className="py-3 px-4 text-center font-bold text-black dark:text-white">
                                  <span className={part.month_usage > 0 ? "text-primary text-sm" : "opacity-40"}>
                                    {part.month_usage}
                                  </span>
                                </td>

                                {/* AMC */}
                                <td className="py-3 px-4 text-center font-semibold text-body dark:text-bodydark">
                                  <span>{part.amc}</span>
                                  <span className="text-[10px] block opacity-70">/bulan</span>
                                </td>

                                {/* Recommended Monthly Need */}
                                <td className="py-3 px-4 text-center font-bold text-black dark:text-white">
                                  <span className="rounded-lg bg-gray-100 px-2.5 py-1 dark:bg-meta-4/40">
                                    {part.recommended_monthly_need} {part.unit}
                                  </span>
                                </td>

                                {/* Suggested Purchase */}
                                <td className="py-3 px-4 text-center">
                                  {part.suggested_purchase > 0 ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-danger/15 px-3 py-1 font-bold text-danger text-xs animate-pulse">
                                      <span>+{part.suggested_purchase} {part.unit}</span>
                                    </span>
                                  ) : (
                                    <span className="text-body dark:text-bodydark opacity-50 font-medium">
                                      0 (Aman)
                                    </span>
                                  )}
                                </td>

                                {/* Status */}
                                <td className="py-3 px-4 text-center">
                                  <span
                                    className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                      part.status === "KRITIS"
                                        ? "bg-danger text-white shadow-sm"
                                        : part.status === "DEFISIT"
                                        ? "bg-warning/20 text-warning"
                                        : "bg-success/15 text-success"
                                    }`}
                                  >
                                    {part.status === "KRITIS"
                                      ? "KRITIS (HABIS)"
                                      : part.status === "DEFISIT"
                                      ? "PERLU BELI"
                                      : "STOK AMAN"}
                                  </span>
                                </td>

                                {/* Machines Distribution */}
                                <td className="py-3 px-4">
                                  {part.machines.length > 0 ? (
                                    <div className="flex flex-wrap items-center gap-1.5 max-w-sm">
                                      {part.machines.map((m, mIdx) => (
                                        <button
                                          key={mIdx}
                                          type="button"
                                          onClick={() => setModalDetailPart(part)}
                                          className="inline-flex items-center gap-1 rounded-lg border border-stroke bg-white px-2 py-0.5 text-[11px] font-medium text-black hover:border-primary hover:text-primary dark:border-strokedark dark:bg-boxdark dark:text-white dark:hover:border-primary transition"
                                          title={`Klik untuk rincian riwayat penggunaan pada ${m.asset_name}`}
                                        >
                                          <span>{m.asset_name}</span>
                                          <span className="font-bold text-primary">({m.total_qty})</span>
                                        </button>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-[11px] italic text-body dark:text-bodydark opacity-50">
                                      Tidak ada pemakaian
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Desktop Server Pagination Controls (15 items per page) */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-stroke pt-4 dark:border-strokedark text-xs">
                      <span className="text-body dark:text-bodydark">
                        Halaman {desktopPage} dari {totalPages} (Total {totalCount} spare part)
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={desktopPage <= 1 || loader}
                          onClick={() => fetch_data(desktopPage - 1, keyword, selectedMonth, selectedYear, statusFilter, false)}
                          className="rounded-lg border border-stroke px-3 py-1.5 font-semibold text-black dark:border-strokedark dark:text-white hover:bg-gray-100 dark:hover:bg-meta-4 disabled:opacity-40 transition"
                        >
                          Sebelumnya
                        </button>
                        <span className="px-2 font-medium">
                          {desktopPage} / {totalPages}
                        </span>
                        <button
                          type="button"
                          disabled={desktopPage >= totalPages || loader}
                          onClick={() => fetch_data(desktopPage + 1, keyword, selectedMonth, selectedYear, statusFilter, false)}
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

        {/* Modal Rincian Distribusi Mesin ("Di Pakai Dimana Aja") */}
        {modalDetailPart && (
          <CustomModal
            isOpen={Boolean(modalDetailPart)}
            onClose={() => setModalDetailPart(null)}
            title={`Rincian Distribusi Mesin: ${modalDetailPart.description}`}
          >
            <div className="space-y-4 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-gray-50 p-3 dark:bg-meta-4/20">
                <div>
                  <span className="text-body dark:text-bodydark block">Part Number:</span>
                  <span className="font-mono font-bold text-black dark:text-white">
                    {modalDetailPart.vendor_code || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-body dark:text-bodydark block">Total Konsumsi Bln Ini:</span>
                  <span className="font-bold text-primary">
                    {modalDetailPart.month_usage} {modalDetailPart.unit}
                  </span>
                </div>
                <div>
                  <span className="text-body dark:text-bodydark block">Stok Gudang:</span>
                  <span className="font-bold text-black dark:text-white">
                    {modalDetailPart.available_stock} {modalDetailPart.unit}
                  </span>
                </div>
                <div>
                  <span className="text-body dark:text-bodydark block">Saran Order:</span>
                  <span className={`font-bold ${modalDetailPart.suggested_purchase > 0 ? "text-danger" : "text-success"}`}>
                    {modalDetailPart.suggested_purchase > 0 ? `+${modalDetailPart.suggested_purchase} ${modalDetailPart.unit}` : "Aman"}
                  </span>
                </div>
              </div>

              {/* Grouped by Machine */}
              <div>
                <h4 className="font-bold text-black dark:text-white mb-2 flex items-center gap-1.5">
                  <HiOutlineBuildingOffice2 className="text-primary text-sm" />
                  <span>Ringkasan per Mesin / Aset ({modalDetailPart.machines.length} Mesin)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {modalDetailPart.machines.map((m, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-stroke bg-white p-3 dark:border-strokedark dark:bg-boxdark flex items-center justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-black dark:text-white block truncate">
                          {m.asset_name}
                        </span>
                        <span className="text-[10px] text-body dark:text-bodydark font-mono">
                          ID: {m.id_asset} &bull; No: {m.asset_no}
                        </span>
                      </div>
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary shrink-0 dark:bg-primary/20">
                        {m.total_qty} {modalDetailPart.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Individual Transaction Logs */}
              <div>
                <h4 className="font-bold text-black dark:text-white mb-2 flex items-center gap-1.5">
                  <HiOutlineWrench className="text-primary text-sm" />
                  <span>Log Riwayat Pengeluaran Barang (Stock Out)</span>
                </h4>
                <div className="max-h-60 overflow-y-auto rounded-xl border border-stroke dark:border-strokedark">
                  <table className="w-full table-auto text-left text-[11px]">
                    <thead>
                      <tr className="border-b border-stroke bg-gray-50 text-body dark:border-strokedark dark:bg-meta-4/30 dark:text-bodydark">
                        <th className="py-2 px-3 font-semibold">Tanggal</th>
                        <th className="py-2 px-3 font-semibold">Mesin</th>
                        <th className="py-2 px-3 font-semibold text-center">Qty</th>
                        <th className="py-2 px-3 font-semibold">No Tiket</th>
                        <th className="py-2 px-3 font-semibold">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stroke dark:divide-strokedark">
                      {(modalDetailPart.usage_logs || []).map((log, lIdx) => (
                        <tr key={lIdx} className="hover:bg-gray-50 dark:hover:bg-meta-4/10">
                          <td className="py-2 px-3 text-black dark:text-white whitespace-nowrap">
                            {formatDate(log.date)}
                          </td>
                          <td className="py-2 px-3 font-semibold text-black dark:text-white">
                            {log.asset_name}
                          </td>
                          <td className="py-2 px-3 text-center font-bold text-danger">
                            -{log.quantity}
                          </td>
                          <td className="py-2 px-3 font-mono text-body dark:text-bodydark">
                            {log.request_id}
                          </td>
                          <td className="py-2 px-3 text-body dark:text-bodydark">
                            {log.subject}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setModalDetailPart(null)}
                  className="rounded-xl bg-gray-100 px-4 py-2 font-semibold text-black hover:bg-gray-200 dark:bg-meta-4 dark:text-white transition"
                >
                  Tutup
                </button>
              </div>
            </div>
          </CustomModal>
        )}
      </div>
    </UserAuth>
  );
}

