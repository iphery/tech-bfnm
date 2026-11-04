"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "react-responsive";
import UserAuth from "@/components/auth";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { PageCard } from "@/components/card";
import { CommonInput } from "@/components/input";
import { PageLoader, DetailSkeleton } from "@/components/loader";
import { formatDateLocal } from "@/utils/dateformat";
import { NotifyError, NotifySuccess } from "@/utils/notify";

// Icons
import {
  HiArrowLeft,
  HiOutlineTrash,
  HiOutlineCalendar,
  HiOutlineCube,
  HiOutlineLocationMarker,
  HiOutlineTag,
} from "react-icons/hi";
import {
  HiOutlineArrowDownTray,
  HiOutlineArrowUpTray,
  HiOutlineChartBar,
  HiOutlineBuildingOffice2,
  HiOutlineArrowTrendingUp,
  HiOutlineExclamationTriangle,
  HiOutlineCheckCircle,
  HiOutlineWrenchScrewdriver,
} from "react-icons/hi2";
import { BsBoxSeam, BsShieldCheck, BsExclamationCircle } from "react-icons/bs";

// Visual Trend Chart & Decision Component
function AnalyticsDashboard({ analytics, unit = "pcs", isMobile = false }) {
  if (!analytics) return null;

  const maxVal = Math.max(
    ...(analytics.monthly_trend?.map((m) => m.consumed) || [0]),
    1
  );

  const statusConfig = {
    AMAN: {
      bg: "bg-success/10 text-success border-success/30",
      pill: "bg-success text-white",
      label: "Stok Aman",
      desc: "Stok mencukupi untuk kebutuhan 1 bulan ke depan.",
    },
    DEFISIT: {
      bg: "bg-warning/10 text-warning border-warning/30",
      pill: "bg-warning text-white",
      label: "Perlu Restock",
      desc: `Disarankan restock +${analytics.suggested_reorder} ${unit} agar aman.`,
    },
    KRITIS: {
      bg: "bg-danger/10 text-danger border-danger/30",
      pill: "bg-danger text-white",
      label: "Kritis / Kurang",
      desc: `Stok kritis! Segera order minimal +${analytics.suggested_reorder} ${unit}.`,
    },
  };

  const currentStatus = statusConfig[analytics.status] || statusConfig.AMAN;

  return (
    <div className="space-y-4">
      {/* KPI Metric Cards */}
      <div className={`grid ${isMobile ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-4"} gap-3`}>
        {/* Metric 1: Pemakaian Bulan Ini */}
        <div className="rounded-2xl border border-stroke bg-white p-3.5 shadow-sm dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center justify-between text-body dark:text-bodydark mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Bulan Ini</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <HiOutlineArrowTrendingUp className="text-sm" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-black dark:text-white">
              {analytics.current_month_usage}
            </span>
            <span className="text-xs font-semibold text-body dark:text-bodydark">{unit}</span>
          </div>
          <span className="mt-1 block text-[10px] text-body dark:text-bodydark">
            Pemakaian bulan berjalan
          </span>
        </div>

        {/* Metric 2: Rata-rata Pemakaian (AMC) */}
        <div className="rounded-2xl border border-stroke bg-white p-3.5 shadow-sm dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center justify-between text-body dark:text-bodydark mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Rata-rata (AMC)</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-meta-5/10 text-meta-5">
              <HiOutlineChartBar className="text-sm" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-black dark:text-white">
              {analytics.amc}
            </span>
            <span className="text-xs font-semibold text-body dark:text-bodydark">{unit}/bln</span>
          </div>
          <span className="mt-1 block text-[10px] text-body dark:text-bodydark">
            Rata-rata 6 bulan terakhir
          </span>
        </div>

        {/* Metric 3: Estimasi Kebutuhan Sebulan */}
        <div className="rounded-2xl border border-stroke bg-white p-3.5 shadow-sm dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center justify-between text-body dark:text-bodydark mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Kebutuhan / Bln</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-meta-3/10 text-meta-3">
              <BsBoxSeam className="text-sm" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-black dark:text-white">
              {analytics.recommended_monthly_need}
            </span>
            <span className="text-xs font-semibold text-body dark:text-bodydark">{unit}</span>
          </div>
          <span className="mt-1 block text-[10px] text-body dark:text-bodydark">
            Estimasi buffer operasional
          </span>
        </div>

        {/* Metric 4: Rekomendasi Restock */}
        <div className={`rounded-2xl border p-3.5 shadow-sm ${currentStatus.bg}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Keputusan Stok</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${currentStatus.pill}`}>
              {currentStatus.label}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-black dark:text-white">
              {analytics.suggested_reorder > 0 ? `+${analytics.suggested_reorder}` : "Cukup"}
            </span>
            {analytics.suggested_reorder > 0 && (
              <span className="text-xs font-semibold">{unit}</span>
            )}
          </div>
          <span className="mt-1 block text-[10px] line-clamp-1 opacity-90">
            {currentStatus.desc}
          </span>
        </div>
      </div>

      {/* Visual Chart: 6-Month Trend & Machine List (Combined or Grid) */}
      <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-12"} gap-4`}>
        {/* Trend Bar Chart */}
        <div className={`rounded-2xl border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark ${isMobile ? "" : "lg:col-span-7"}`}>
          <div className="flex items-center justify-between mb-4 border-b border-stroke/60 pb-2.5 dark:border-strokedark/60">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white flex items-center gap-1.5">
                <HiOutlineChartBar className="text-primary text-base" />
                Tren Pemakaian 6 Bulan Terakhir
              </h3>
              <p className="text-[11px] text-body dark:text-bodydark">
                Frekuensi dan kuantitas barang keluar setiap bulan
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-meta-4 text-body dark:text-bodydark">
              Max: {maxVal} {unit}
            </span>
          </div>

          {/* Bar Chart Container */}
          <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 px-1">
            {analytics.monthly_trend?.map((item, idx) => {
              const heightPct = Math.max(Math.round((item.consumed / maxVal) * 100), item.consumed > 0 ? 8 : 3);
              const isLatest = idx === analytics.monthly_trend.length - 1;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                  {/* Tooltip / Value on Top */}
                  <div className="mb-1.5 flex flex-col items-center transition-all group-hover:scale-110">
                    <span className={`text-[11px] font-extrabold ${item.consumed > 0 ? "text-black dark:text-white" : "text-gray-400 dark:text-gray-600"}`}>
                      {item.consumed}
                    </span>
                  </div>

                  {/* The Bar */}
                  <div className="w-full max-w-[36px] bg-gray-100 dark:bg-meta-4/40 rounded-t-lg overflow-hidden flex items-end h-28 p-0.5">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t-md transition-all duration-500 ${
                        isLatest
                          ? "bg-gradient-to-t from-primary to-primary/80 shadow-md shadow-primary/30"
                          : item.consumed > 0
                          ? "bg-gradient-to-t from-primary/70 to-primary/50 group-hover:from-primary group-hover:to-primary/80"
                          : "bg-gray-200 dark:bg-meta-4/60"
                      }`}
                    />
                  </div>

                  {/* Label Month & Tx Count */}
                  <div className="mt-2 text-center w-full">
                    <span className={`block text-[10px] font-bold truncate ${isLatest ? "text-primary" : "text-black dark:text-white"}`}>
                      {item.month_label}
                    </span>
                    <span className="block text-[9px] text-body dark:text-bodydark truncate">
                      {item.tx_count > 0 ? `${item.tx_count}x ganti` : "-"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Machine Distribution List */}
        <div className={`rounded-2xl border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark ${isMobile ? "" : "lg:col-span-5"}`}>
          <div className="flex items-center justify-between mb-3 border-b border-stroke/60 pb-2.5 dark:border-strokedark/60">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white flex items-center gap-1.5">
                <HiOutlineWrenchScrewdriver className="text-meta-5 text-base" />
                Dipakai di Mesin Mana Saja?
              </h3>
              <p className="text-[11px] text-body dark:text-bodydark">
                Distribusi pemakaian suku cadang pada unit mesin
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-meta-5/10 text-meta-5">
              {analytics.machines_used?.length || 0} Mesin
            </span>
          </div>

          <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
            {!analytics.machines_used || analytics.machines_used.length === 0 ? (
              <div className="py-8 text-center text-xs text-body dark:text-bodydark">
                Belum ada riwayat penggantian part pada mesin.
              </div>
            ) : (
              analytics.machines_used.map((mach, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl bg-gray-50 p-2.5 text-xs dark:bg-meta-4/20 border border-stroke/40 dark:border-strokedark/40"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px] font-bold text-primary">
                        {mach.id_asset}
                      </span>
                      {mach.asset_model && (
                        <span className="text-[10px] text-body dark:text-bodydark truncate">
                          • {mach.asset_model}
                        </span>
                      )}
                    </div>
                    <span className="block font-semibold text-black dark:text-white truncate text-[11px]">
                      {mach.asset_name || "Pemakaian Umum / Tiket"}
                    </span>
                    {mach.last_used_date && (
                      <span className="block text-[10px] text-body dark:text-bodydark">
                        Terakhir: {formatDateLocal(mach.last_used_date)}
                      </span>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span className="block font-mono font-bold text-black dark:text-white">
                      {mach.total_qty} {unit}
                    </span>
                    <span className="block text-[10px] text-meta-3 font-semibold">
                      {mach.times_used}x ganti
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DetailPart({ params }) {
  const router = useRouter();
  const isSmallScreen = useMediaQuery({ query: "(max-width: 640px)" });

  const [loader, setLoader] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [detailData, setDetailData] = useState({});
  const [analytics, setAnalytics] = useState(null);
  const [stockData, setStockData] = useState([]);

  const getFirstDate = () => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1).toISOString().substring(0, 10);
  };

  const [startDate, setStartDate] = useState(getFirstDate());
  const [endDate, setEndDate] = useState(new Date().toISOString().substring(0, 10));

  const [deleteOnload, setDeleteOnload] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const fetch_data = async () => {
    try {
      const response = await axios.post("/api/getpartdetail", { idPart: params.idPart });
      if (response.status === 200 && response.data?.response?.length > 0) {
        setDetailData(response.data.response[0]);
        setAnalytics(response.data.analytics || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoader(false);
    }
  };

  const fetch_stock_data = async () => {
    try {
      const response = await axios.post("/api/getstockcard", {
        idPart: params.idPart,
        startDate: startDate,
        endDate: endDate,
      });

      if (response.status === 200) {
        const array = response.data["response"] || [];
        setStockData([...array].reverse());
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (startDate > endDate) {
      setEndDate(startDate);
    }
  }, [startDate, endDate]);

  const delete_part = async () => {
    setDeleteOnload(true);
    try {
      const response = await axios.post("/api/deletepart", {
        idPart: params.idPart,
      });

      if (response.status === 200) {
        const error = response.data["error"];
        const message = response.data["message"];
        if (error === 0) {
          NotifySuccess(message);
          router.push("/parts");
        } else {
          NotifyError(message);
        }
      }
    } catch (e) {
      NotifyError("Gagal menghapus suku cadang");
    } finally {
      setDeleteOnload(false);
      setDeleteConfirm(false);
    }
  };

  useEffect(() => {
    fetch_data();
    setIsClient(true);
  }, [params.idPart]);

  useEffect(() => {
    if (params.idPart && startDate && endDate) {
      fetch_stock_data();
    }
  }, [params.idPart, startDate, endDate]);

  if (!isClient) return null;

  const availableStock = Number(detailData["available"] || 0);

  return (
    <UserAuth>
      <div className="min-h-screen bg-whiten text-body dark:bg-boxdark-2 dark:text-bodydark">
        {isSmallScreen ? (
          /* ================= MOBILE VIEW ================= */
          <div className="flex flex-col min-h-screen pb-20">
            {/* Top Bar */}
            <div className="sticky top-0 z-40 flex items-center justify-between border-b border-stroke/60 bg-white/80 px-4 py-3 backdrop-blur-md dark:border-strokedark/60 dark:bg-boxdark/80">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-black hover:bg-gray-200 dark:bg-meta-4 dark:text-white transition-colors"
              >
                <HiArrowLeft className="text-lg" />
              </button>
              <div className="flex flex-col items-center max-w-[200px]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  Detail Suku Cadang
                </span>
                <span className="text-xs font-bold text-black dark:text-white truncate">
                  {detailData["description"] || "Part"}
                </span>
              </div>
              <div className="w-9" />
            </div>

            {loader ? (
              <DetailSkeleton />
            ) : (
              <div className="p-4 space-y-4">
                {/* Part Overview Card */}
              <div className="rounded-2xl border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h2 className="text-base font-bold text-black dark:text-white leading-tight">
                      {detailData["description"]}
                    </h2>
                    {detailData["vendor_code"] && (
                      <span className="font-mono text-xs text-body dark:text-bodydark">
                        Part No: {detailData["vendor_code"]}
                      </span>
                    )}
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold shrink-0 ${
                      availableStock > 0
                        ? "bg-success/15 text-success"
                        : "bg-danger/15 text-danger"
                    }`}
                  >
                    {availableStock} {detailData["unit"] || "pcs"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs border-t border-stroke/60 pt-3 dark:border-strokedark/60">
                  <div className="rounded-xl bg-gray-50 dark:bg-meta-4/20 p-2.5">
                    <span className="block text-[10px] text-body dark:text-bodydark">Lokasi Rak</span>
                    <span className="font-semibold text-black dark:text-white truncate block">
                      {detailData["location"] || "-"}
                    </span>
                  </div>
                  <div className="rounded-xl bg-gray-50 dark:bg-meta-4/20 p-2.5">
                    <span className="block text-[10px] text-body dark:text-bodydark">Satuan</span>
                    <span className="font-semibold text-black dark:text-white">
                      {detailData["unit"] || "pcs"}
                    </span>
                  </div>
                </div>

                {detailData["remark"] && (
                  <div className="mt-2 text-xs text-body dark:text-bodydark italic bg-gray-50 dark:bg-meta-4/20 p-2.5 rounded-xl">
                    Catatan: {detailData["remark"]}
                  </div>
                )}

                {/* Delete button option */}
                <div className="mt-3 pt-3 border-t border-stroke/60 dark:border-strokedark/60 flex justify-end">
                  {deleteConfirm ? (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-body dark:text-bodydark">Hapus part ini?</span>
                      <button
                        type="button"
                        disabled={deleteOnload}
                        onClick={delete_part}
                        className="rounded-lg bg-danger px-3 py-1 font-bold text-white shadow hover:bg-opacity-90"
                      >
                        {deleteOnload ? "..." : "Ya, Hapus"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirm(false)}
                        className="rounded-lg bg-gray-100 dark:bg-meta-4 px-3 py-1 font-medium text-black dark:text-white"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm(true)}
                      className="flex items-center gap-1.5 text-xs text-danger hover:underline"
                    >
                      <HiOutlineTrash className="text-sm" />
                      <span>Hapus Suku Cadang</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Monthly Analytics, Chart & Machine Usage */}
              {analytics && (
                <AnalyticsDashboard
                  analytics={analytics}
                  unit={detailData["unit"] || "pcs"}
                  isMobile={true}
                />
              )}

              {/* Date Filter */}
              <div className="rounded-2xl border border-stroke bg-white p-3 shadow-sm dark:border-strokedark dark:bg-boxdark">
                <span className="text-[11px] font-bold uppercase tracking-wider text-body dark:text-bodydark block mb-2">
                  Periode Kartu Stok
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <CommonInput
                    type="date"
                    input={startDate}
                    onInputChange={(val) => setStartDate(val)}
                  />
                  <CommonInput
                    type="date"
                    input={endDate}
                    onInputChange={(val) => setEndDate(val)}
                  />
                </div>
              </div>

              {/* Stock Movement Feed */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-black dark:text-white block px-1">
                  Mutasi & Riwayat Kartu Stok
                </span>
                {stockData.length === 0 ? (
                  <div className="rounded-2xl border border-stroke bg-white p-8 text-center text-xs text-body dark:border-strokedark dark:bg-boxdark dark:text-bodydark">
                    Tidak ada catatan pergerakan stok pada periode ini.
                  </div>
                ) : (
                  stockData.map((item, idx) => {
                    const isBefore = idx === stockData.length - 1;
                    const qtyIn = Number(item.in || 0);
                    const qtyOut = Number(item.out || 0);

                    return (
                      <div
                        key={idx}
                        className={`rounded-2xl border p-3 shadow-sm ${
                          isBefore
                            ? "border-primary/30 bg-primary/5 dark:bg-primary/10"
                            : "border-stroke bg-white dark:border-strokedark dark:bg-boxdark"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-semibold text-black dark:text-white">
                            {isBefore ? "Saldo Awal Periode" : formatDateLocal(item.date)}
                          </span>
                          <span className="font-mono font-bold text-primary">
                            Saldo: {item.balance}
                          </span>
                        </div>

                        {!isBefore && (
                          <div className="flex items-center justify-between border-t border-stroke/50 pt-2 text-xs dark:border-strokedark/50">
                            <div className="flex items-center gap-2">
                              {qtyIn > 0 && (
                                <span className="inline-flex items-center gap-1 font-semibold text-success">
                                  <HiOutlineArrowDownTray /> +{qtyIn} Masuk
                                </span>
                              )}
                              {qtyOut > 0 && (
                                <span className="inline-flex items-center gap-1 font-semibold text-warning">
                                  <HiOutlineArrowUpTray /> -{qtyOut} Keluar
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-body dark:text-bodydark text-right">
                              <span>{item.subject || item.asset || item.request || "-"}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
          /* ================= DESKTOP VIEW ================= */
          <DefaultLayout>
            {loader ? (
              <DetailSkeleton />
            ) : (
              <div className="mx-auto max-w-7xl space-y-6">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => router.push("/parts")}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-stroke bg-white text-black hover:bg-gray-50 dark:border-strokedark dark:bg-boxdark dark:text-white dark:hover:bg-meta-4/20 transition-all shadow-sm"
                  >
                    <HiArrowLeft className="text-xl" />
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-primary">
                        {detailData["vendor_code"] || "PART"}
                      </span>
                    </div>
                    <h1 className="text-xl font-bold text-black dark:text-white">
                      {detailData["description"] || "Detail Suku Cadang"}
                    </h1>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      availableStock > 0
                        ? "bg-success/15 text-success"
                        : "bg-danger/15 text-danger"
                    }`}
                  >
                    Stok Saat Ini: {availableStock} {detailData["unit"] || "pcs"}
                  </span>
                </div>
              </div>

              {/* Part Spec Card */}
              <PageCard>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-stroke pb-3 dark:border-strokedark">
                    <h2 className="text-base font-bold text-black dark:text-white">
                      Spesifikasi Suku Cadang
                    </h2>

                    {deleteConfirm ? (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-body dark:text-bodydark">Yakin ingin menghapus?</span>
                        <button
                          type="button"
                          disabled={deleteOnload}
                          onClick={delete_part}
                          className="rounded-lg bg-danger px-3 py-1.5 font-bold text-white shadow hover:bg-opacity-90"
                        >
                          {deleteOnload ? "Menghapus..." : "Ya, Hapus Part"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(false)}
                          className="rounded-lg border border-stroke px-3 py-1.5 font-medium text-black dark:border-strokedark dark:text-white"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteConfirm(true)}
                        className="flex items-center gap-1.5 text-xs text-danger hover:underline"
                      >
                        <HiOutlineTrash className="text-sm" />
                        <span>Hapus Suku Cadang</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div className="rounded-xl bg-gray-50 p-3 dark:bg-meta-4/20">
                      <span className="block text-[10px] text-body dark:text-bodydark">Deskripsi</span>
                      <span className="font-semibold text-black dark:text-white truncate block">
                        {detailData["description"]}
                      </span>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-3 dark:bg-meta-4/20">
                      <span className="block text-[10px] text-body dark:text-bodydark">Part Number / Vendor</span>
                      <span className="font-mono font-bold text-black dark:text-white">
                        {detailData["vendor_code"] || "-"}
                      </span>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-3 dark:bg-meta-4/20">
                      <span className="block text-[10px] text-body dark:text-bodydark">Lokasi Gudang / Rak</span>
                      <span className="font-semibold text-black dark:text-white">
                        {detailData["location"] || "-"}
                      </span>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-3 dark:bg-meta-4/20">
                      <span className="block text-[10px] text-body dark:text-bodydark">Satuan Ukur</span>
                      <span className="font-semibold text-black dark:text-white">
                        {detailData["unit"] || "pcs"}
                      </span>
                    </div>
                  </div>

                  {detailData["remark"] && (
                    <div className="rounded-xl bg-gray-50 p-3 text-xs text-body dark:bg-meta-4/20 dark:text-bodydark">
                      <span className="font-semibold text-black dark:text-white">Catatan: </span>
                      {detailData["remark"]}
                    </div>
                  )}
                </div>
              </PageCard>

              {/* Monthly Analytics, Chart & Machine Usage */}
              {analytics && (
                <AnalyticsDashboard
                  analytics={analytics}
                  unit={detailData["unit"] || "pcs"}
                  isMobile={false}
                />
              )}

              {/* Stock Card (Kartu Stok) Table Card */}
              <PageCard>
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stroke pb-4 dark:border-strokedark">
                    <div>
                      <h3 className="text-base font-bold text-black dark:text-white">
                        Kartu Stok Barang
                      </h3>
                      <p className="text-xs text-body dark:text-bodydark">
                        Catatan kronologis penerimaan, pengeluaran, dan sisa saldo barang
                      </p>
                    </div>

                    {/* Date Pickers */}
                    <div className="flex items-center gap-2">
                      <div className="w-36">
                        <CommonInput
                          type="date"
                          input={startDate}
                          onInputChange={(val) => setStartDate(val)}
                        />
                      </div>
                      <span className="text-xs text-body dark:text-bodydark">s/d</span>
                      <div className="w-36">
                        <CommonInput
                          type="date"
                          input={endDate}
                          onInputChange={(val) => setEndDate(val)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto text-left text-xs">
                      <thead>
                        <tr className="border-b border-stroke bg-gray-50 text-body dark:border-strokedark dark:bg-meta-4/20 dark:text-bodydark">
                          <th className="py-3 px-4 font-semibold">Tanggal</th>
                          <th className="py-3 px-4 font-semibold text-center text-success">Masuk (+)</th>
                          <th className="py-3 px-4 font-semibold text-center text-warning">Keluar (-)</th>
                          <th className="py-3 px-4 font-semibold text-center text-primary">Saldo Akhir</th>
                          <th className="py-3 px-4 font-semibold">Keterangan / Tujuan</th>
                          <th className="py-3 px-4 font-semibold">Aset Terkait</th>
                          <th className="py-3 px-4 font-semibold">No. Request</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stroke dark:divide-strokedark">
                        {stockData.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-body dark:text-bodydark">
                              Tidak ada riwayat pergerakan stok pada periode terpilih.
                            </td>
                          </tr>
                        ) : (
                          stockData.map((item, index) => {
                            const isBefore = index === stockData.length - 1;
                            const qtyIn = Number(item["in"] || 0);
                            const qtyOut = Number(item["out"] || 0);

                            return (
                              <tr
                                key={index}
                                className={`transition-colors ${
                                  isBefore
                                    ? "bg-primary/5 dark:bg-primary/10 font-bold"
                                    : "hover:bg-gray-50 dark:hover:bg-meta-4/10"
                                }`}
                              >
                                <td className="py-3 px-4 whitespace-nowrap text-black dark:text-white">
                                  {isBefore ? "Saldo Awal Periode" : formatDateLocal(item["date"])}
                                </td>
                                <td className="py-3 px-4 text-center font-bold text-success">
                                  {isBefore ? "" : qtyIn > 0 ? `+${qtyIn}` : "-"}
                                </td>
                                <td className="py-3 px-4 text-center font-bold text-warning">
                                  {isBefore ? "" : qtyOut > 0 ? `-${qtyOut}` : "-"}
                                </td>
                                <td className="py-3 px-4 text-center font-mono font-bold text-primary">
                                  {item["balance"]}
                                </td>
                                <td className="py-3 px-4 text-body dark:text-bodydark">
                                  {item["subject"] || "-"}
                                </td>
                                <td className="py-3 px-4 font-mono text-body dark:text-bodydark">
                                  {item["asset"] || "-"}
                                </td>
                                <td className="py-3 px-4 font-mono text-body dark:text-bodydark">
                                  {item["request"] || "-"}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </PageCard>
            </div>
          )}
          </DefaultLayout>
        )}
      </div>
    </UserAuth>
  );
}
