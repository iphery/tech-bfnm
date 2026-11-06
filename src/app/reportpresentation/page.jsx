"use client";

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "react-responsive";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import UserAuth from "@/components/auth";
import { PageLoader } from "@/components/loader";
import { NotifyError } from "@/utils/notify";
import { formatDateTime } from "@/utils/dateformat";

// Dynamic import for ApexCharts (SSR disabled)
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

// Icons
import {
  HiOutlinePresentationChartBar,
  HiOutlineCalendar,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineMagnifyingGlass,
  HiOutlineXMark,
  HiOutlineArrowPath,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineArrowRight,
  HiOutlineChartBar,
  HiOutlineTableCells,
  HiOutlineArrowTrendingUp,
} from "react-icons/hi2";
import {
  FaOilCan,
  FaTruck,
  FaIndustry,
  FaCogs,
  FaWrench,
  FaCheck,
  FaExclamation,
  FaChevronRight,
} from "react-icons/fa";

export default function ReportPresentationPage() {
  const router = useRouter();
  const isSmallScreen = useMediaQuery({ query: "(max-width: 640px)" });

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [loading, setLoading] = useState(true);
  const [presentationData, setPresentationData] = useState(null);

  // Active Selected KPI for Detail Modal
  const [selectedKpi, setSelectedKpi] = useState(null);
  // View mode in modal: 'chart' (default) | 'table'
  const [modalViewMode, setModalViewMode] = useState("chart");

  const [modalSearch, setModalSearch] = useState("");
  const [modalFilterSource, setModalFilterSource] = useState("ALL"); // 'ALL' | 'PO' | 'DPS'
  const [modalPage, setModalPage] = useState(1);
  const modalPerPage = 10;

  const fetchPresentationData = async (yr) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/reportpresentation?year=${yr}`);
      if (res.data?.success) {
        setPresentationData(res.data.data);
      } else {
        NotifyError(res.data?.error || "Gagal memuat data presentasi");
      }
    } catch (err) {
      console.error("fetchPresentationData error:", err);
      NotifyError("Gagal memuat data presentasi KPI");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPresentationData(selectedYear);
  }, [selectedYear]);

  // Open modal handler
  const openKpiDetail = (kpi) => {
    setSelectedKpi(kpi);
    setModalViewMode("chart");
    setModalSearch("");
    setModalFilterSource("ALL");
    setModalPage(1);
  };

  const closeKpiDetail = () => {
    setSelectedKpi(null);
  };

  // 7 KPI structure
  const all7Kpis = useMemo(() => {
    if (!presentationData) return [];

    const k1 = presentationData.kpi_1_mp || {
      target: 7,
      actual: 0,
      count: 0,
      total_hours: 0,
      code: "RTM",
      is_achieved: true,
      supporting_tickets: [],
    };
    const k2 = presentationData.kpi_2_k || {
      target: 15,
      actual: 0,
      count: 0,
      total_hours: 0,
      code: "RTK",
      is_achieved: true,
      supporting_tickets: [],
    };
    const bList = presentationData.budget_kpis || [];

    const posIcons = {
      oil: <FaOilCan className="text-2xl text-amber-500" />,
      "truck-service": <FaTruck className="text-2xl text-blue-500" />,
      "factory-service": <FaIndustry className="text-2xl text-emerald-500" />,
      "truck-part": <FaCogs className="text-2xl text-purple-500" />,
      "factory-part": <FaWrench className="text-2xl text-rose-500" />,
    };

    const list = [
      {
        id: "kpi_1",
        number: 1,
        type: "repair",
        title: "Rata-rata Kecepatan Perbaikan Mesin Produksi",
        code: k1.code, // RTM
        icon: <FaIndustry className="text-2xl text-amber-500" />,
        metricUnit: "Jam",
        targetDisplay: `${k1.target} Jam`,
        actualDisplay: `${k1.actual} Jam`,
        targetNum: Number(k1.target) || 0,
        actualNum: Number(k1.actual) || 0,
        isAchieved: k1.is_achieved,
        rawData: k1,
      },
      {
        id: "kpi_2",
        number: 2,
        type: "repair",
        title: "Rata-rata Kecepatan Perbaikan Kendaraan",
        code: k2.code, // RTK
        icon: <FaTruck className="text-2xl text-blue-500" />,
        metricUnit: "Jam",
        targetDisplay: `${k2.target} Jam`,
        actualDisplay: `${k2.actual} Jam`,
        targetNum: Number(k2.target) || 0,
        actualNum: Number(k2.actual) || 0,
        isAchieved: k2.is_achieved,
        rawData: k2,
      },
    ];

    bList.forEach((b) => {
      const isAchieved = !b.is_overbudget;
      list.push({
        id: `kpi_${b.kpi_number}`,
        number: b.kpi_number,
        type: "budget",
        title: b.name,
        code: b.code,
        icon: posIcons[b.icon_type] || (
          <FaOilCan className="text-2xl text-primary" />
        ),
        metricUnit: "Rupiah",
        targetDisplay: `Rp ${Number(b.target || 0).toLocaleString("id-ID")}`,
        actualDisplay: `Rp ${Number(b.actual_total || 0).toLocaleString("id-ID")}`,
        targetNum: Number(b.target) || 0,
        actualNum: Number(b.actual_total) || 0,
        percentage: b.percentage,
        isAchieved,
        rawData: b,
      });
    });

    return list;
  }, [presentationData]);

  // Overall KPI score
  const achievedCount = useMemo(() => {
    return all7Kpis.filter((k) => k.isAchieved).length;
  }, [all7Kpis]);

  const totalKPIs = 7;
  const achievementRate = Number(
    ((achievedCount / totalKPIs) * 100).toFixed(1),
  );

  // Filtered & Paginated Supporting Data for Modal
  const filteredModalItems = useMemo(() => {
    if (!selectedKpi) return [];
    const q = modalSearch.trim().toLowerCase();

    if (selectedKpi.type === "repair") {
      const tickets = selectedKpi.rawData?.supporting_tickets || [];
      if (!q) return tickets;
      return tickets.filter((t) => {
        return (
          String(t.id_request || "")
            .toLowerCase()
            .includes(q) ||
          String(t.id_asset || "")
            .toLowerCase()
            .includes(q) ||
          String(t.asset_name || "")
            .toLowerCase()
            .includes(q) ||
          String(t.problem || "")
            .toLowerCase()
            .includes(q) ||
          String(t.technician || "")
            .toLowerCase()
            .includes(q)
        );
      });
    } else {
      const txs = selectedKpi.rawData?.supporting_transactions || [];
      return txs.filter((item) => {
        if (
          modalFilterSource !== "ALL" &&
          item.source_tag !== modalFilterSource
        ) {
          return false;
        }
        if (!q) return true;
        return (
          String(item.id_register || "")
            .toLowerCase()
            .includes(q) ||
          String(item.item || "")
            .toLowerCase()
            .includes(q) ||
          String(item.supplier || "")
            .toLowerCase()
            .includes(q) ||
          String(item.source_type || "")
            .toLowerCase()
            .includes(q)
        );
      });
    }
  }, [selectedKpi, modalSearch, modalFilterSource]);

  const totalModalPages = Math.max(
    1,
    Math.ceil(filteredModalItems.length / modalPerPage),
  );

  const paginatedModalItems = useMemo(() => {
    const start = (modalPage - 1) * modalPerPage;
    return filteredModalItems.slice(start, start + modalPerPage);
  }, [filteredModalItems, modalPage, modalPerPage]);

  // Chart Configuration for Selected KPI (Monthly Line Chart)
  const chartOptions = useMemo(() => {
    if (!selectedKpi) return null;

    const isRepair = selectedKpi.type === "repair";
    const raw = selectedKpi.rawData || {};

    const monthCategories = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ];

    // Monthly Target & Actual series
    const targetSeriesData =
      raw.monthly_target || Array(12).fill(selectedKpi.targetNum);
    const actualSeriesData = raw.monthly_actual || Array(12).fill(0);

    return {
      series: [
        {
          name: "Target Acuan",
          data: targetSeriesData,
        },
        {
          name: "Realisasi Aktual",
          data: actualSeriesData,
        },
      ],
      options: {
        chart: {
          type: "line",
          height: 330,
          toolbar: {
            show: true,
            tools: {
              download: true,
              selection: false,
              zoom: false,
              zoomin: false,
              zoomout: false,
              pan: false,
              reset: false,
            },
          },
          animations: {
            enabled: true,
            easing: "easeinout",
            speed: 800,
            animateGradually: {
              enabled: true,
              delay: 150,
            },
            dynamicAnimation: {
              enabled: true,
              speed: 450,
            },
          },
          fontFamily: "Satoshi, sans-serif",
          dropShadow: {
            enabled: true,
            color: "#64748B",
            top: 4,
            left: 0,
            blur: 4,
            opacity: 0.1,
          },
        },
        stroke: {
          curve: "smooth",
          width: [2.5, 3.5],
          dashArray: [5, 0], // Target = dashed line, Realisasi = solid bold line
        },
        colors: ["#3C50E0", "#10B981"],
        markers: {
          size: [4, 6],
          colors: ["#3C50E0", "#10B981"],
          strokeColors: "#fff",
          strokeWidth: 2,
          hover: {
            size: 8,
          },
        },
        dataLabels: {
          enabled: false,
        },
        xaxis: {
          categories: monthCategories,
          labels: {
            style: {
              colors: "#64748B",
              fontSize: "12px",
              fontWeight: 600,
            },
          },
          axisBorder: { show: false },
          axisTicks: { show: false },
        },
        yaxis: {
          labels: {
            formatter: function (val) {
              if (isRepair) return `${val} Jam`;
              if (val >= 1000000000)
                return `Rp ${(val / 1000000000).toFixed(1)}M`;
              if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(0)}Jt`;
              return `Rp ${Number(val).toLocaleString("id-ID")}`;
            },
            style: {
              colors: "#94A3B8",
              fontSize: "11px",
            },
          },
        },
        grid: {
          borderColor: "#E2E8F0",
          strokeDashArray: 4,
          yaxis: { lines: { show: true } },
          xaxis: { lines: { show: true } },
        },
        legend: {
          position: "top",
          horizontalAlign: "right",
          fontSize: "12px",
          fontWeight: 600,
          markers: {
            radius: 12,
          },
          itemMargin: {
            horizontal: 10,
          },
        },
        tooltip: {
          shared: true,
          intersect: false,
          y: {
            formatter: function (val) {
              if (isRepair) return `${val} Jam`;
              return `Rp ${Number(val).toLocaleString("id-ID")}`;
            },
          },
        },
      },
    };
  }, [selectedKpi]);

  return (
    <UserAuth>
      <DefaultLayout>
        <div className="space-y-6 pb-12">
          {/* ================= HEADER PRESENTASI ================= */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-primary/5 p-6 shadow-sm backdrop-blur-md dark:border-slate-800 dark:from-boxdark dark:via-boxdark-2 dark:to-primary/10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">
                  <HiOutlinePresentationChartBar className="text-sm" />
                  <span>KPI PRESENTATION</span>
                </div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                  KPI ME | {selectedYear}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                  Klik pada kartu KPI untuk membuka grafik perbandingan dan
                  rincian data.
                </p>
              </div>

              {/* Year Selector & Refresh */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/90 px-3.5 py-2 shadow-sm dark:border-slate-700 dark:bg-boxdark">
                  <HiOutlineCalendar className="text-base text-primary" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Tahun:
                  </span>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="cursor-pointer bg-transparent text-xs font-black text-slate-900 outline-none dark:text-white"
                  >
                    {[
                      currentYear - 3,
                      currentYear - 2,
                      currentYear - 1,
                      currentYear,
                      currentYear + 1,
                    ].map((y) => (
                      <option
                        key={y}
                        value={y}
                        className="bg-white text-slate-900 dark:bg-boxdark dark:text-white"
                      >
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => fetchPresentationData(selectedYear)}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95 disabled:opacity-50 dark:border-slate-700 dark:bg-boxdark dark:text-slate-200"
                >
                  <HiOutlineArrowPath
                    className={`text-sm ${loading ? "animate-spin text-primary" : ""}`}
                  />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </div>

          {/* ================= MAIN CONTENT ================= */}
          {loading && !presentationData ? (
            <div className="flex h-64 items-center justify-center">
              <PageLoader />
            </div>
          ) : (
            /* ================= 7 CLEAN KPI CARDS (TITLE + TARGET ONLY) ================= */
            <div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {all7Kpis.map((kpi) => {
                  return (
                    <div
                      key={kpi.id}
                      onClick={() => openKpiDetail(kpi)}
                      className="group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-xl dark:border-slate-800 dark:bg-boxdark"
                    >
                      {/* Top Bar: Icon + KPI Number Tag */}
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 transition-transform duration-300 group-hover:scale-110 dark:bg-meta-4">
                            {kpi.icon}
                          </div>
                          <span className="font-mono rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-600 transition-colors group-hover:bg-primary group-hover:text-white dark:bg-slate-800 dark:text-slate-300">
                            KPI #{kpi.number}
                          </span>
                        </div>

                        {/* Title & Code */}
                        <div className="mt-4">
                          <span className="font-mono text-[11px] font-bold tracking-wider text-primary">
                            {kpi.code}
                          </span>
                          <h3 className="mt-1 line-clamp-2 text-base font-bold text-slate-900 transition-colors group-hover:text-primary dark:text-white">
                            {kpi.title}
                          </h3>
                        </div>

                        {/* TARGET ONLY (Polosan Sesuai Request) */}
                        <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 dark:border-slate-800/80 dark:bg-boxdark-2/60">
                          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            Target Ditentukan
                          </div>
                          <div className="mt-1 truncate text-xl font-black text-slate-800 dark:text-slate-100">
                            {kpi.targetDisplay}
                          </div>
                        </div>
                      </div>

                      {/* Bottom Footer Hint */}
                      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-bold text-primary transition-colors group-hover:text-primary dark:border-slate-800">
                        <span>Lihat Grafik &amp; Data</span>
                        <FaChevronRight className="text-xs transition-transform duration-300 group-hover:translate-x-1" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ================= MODAL DETAIL INTERAKTIF (GRAFIK <-> TABEL) ================= */}
        {selectedKpi && (
          <div className="animate-fadeIn fixed inset-0 z-9999 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-4">
            <div className="flex max-h-[92vh] w-full max-w-4xl flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl transition-all duration-300 dark:border-slate-800 dark:bg-boxdark">
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-slate-100 p-5 dark:border-slate-800">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-2xl text-primary">
                    {selectedKpi.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-primary">
                        KPI #{selectedKpi.number} • {selectedKpi.code}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          selectedKpi.isAchieved
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                        }`}
                      >
                        {selectedKpi.isAchieved
                          ? "Tercapai (On Target)"
                          : "Over Target"}
                      </span>
                    </div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white sm:text-lg">
                      {selectedKpi.title}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeKpiDetail}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-meta-4 dark:hover:text-white"
                >
                  <HiOutlineXMark className="text-xl" />
                </button>
              </div>

              {/* View Switcher Bar (Grafik vs Data Terkait) */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-3 dark:border-slate-800 dark:bg-boxdark-2/40">
                <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-boxdark">
                  <button
                    type="button"
                    onClick={() => setModalViewMode("chart")}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200 ${
                      modalViewMode === "chart"
                        ? "bg-primary text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    }`}
                  >
                    <HiOutlineChartBar className="text-base" />
                    <span>Grafik Pencapaian</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalViewMode("table")}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200 ${
                      modalViewMode === "table"
                        ? "bg-primary text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    }`}
                  >
                    <HiOutlineTableCells className="text-base" />
                    <span>Data Terkait ({filteredModalItems.length})</span>
                  </button>
                </div>

                {/* Direct quick-link to toggle */}
                <button
                  type="button"
                  onClick={() =>
                    setModalViewMode(
                      modalViewMode === "chart" ? "table" : "chart",
                    )
                  }
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                >
                  {modalViewMode === "chart" ? (
                    <>
                      <span>Buka rincian data terkait</span>
                      <HiOutlineArrowRight className="text-sm" />
                    </>
                  ) : (
                    <>
                      <HiOutlineChevronLeft className="text-sm" />
                      <span>Kembali ke grafik perbandingan</span>
                    </>
                  )}
                </button>
              </div>

              {/* Modal Body Content (Switchable: Grafik OR Tabel) */}
              <div className="flex-1 overflow-y-auto p-5">
                {modalViewMode === "chart" ? (
                  /* ================= TAB 1: GRAFIK PENCAPAIAN VS TARGET ================= */
                  <div className="animate-fadeIn space-y-6">
                    {/* Summary Comparison Numbers */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-boxdark-2/50">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Target Ditetapkan
                        </span>
                        <div className="mt-1 text-xl font-black text-slate-800 dark:text-white">
                          {selectedKpi.targetDisplay}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-boxdark-2/50">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Realisasi Aktual
                        </span>
                        <div
                          className={`mt-1 text-xl font-black ${
                            selectedKpi.isAchieved
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {selectedKpi.actualDisplay}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-boxdark-2/50">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          {selectedKpi.type === "repair"
                            ? "Status Evaluasi"
                            : "Sisa Anggaran"}
                        </span>
                        <div className="mt-1 truncate text-lg font-black text-slate-900 dark:text-white">
                          {selectedKpi.type === "repair"
                            ? selectedKpi.isAchieved
                              ? "Terpenuhi (Sesuai)"
                              : "Melebihi Target"
                            : `Rp ${Number(selectedKpi.rawData?.remaining || 0).toLocaleString("id-ID")}`}
                        </div>
                      </div>
                    </div>

                    {/* ApexChart Line Chart (12 Months Trend) */}
                    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-boxdark">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                            Tren Bulanan: Target vs Realisasi (Jan - Des{" "}
                            {selectedYear})
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            Garis putus-putus biru = Target acuan bulanan, Garis
                            solid hijau = Realisasi aktual bulanan
                          </p>
                        </div>
                        <span className="font-mono rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                          12 Bulan
                        </span>
                      </div>

                      {chartOptions && (
                        <div className="min-h-[330px]">
                          <ReactApexChart
                            options={chartOptions.options}
                            series={chartOptions.series}
                            type="line"
                            height={330}
                          />
                        </div>
                      )}
                    </div>

                    {/* Bottom CTA to open table */}
                    <div className="flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-white">
                          Ingin meninjau rincian tiket atau transaksi di balik
                          angka ini?
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          Terdapat{" "}
                          {selectedKpi.type === "repair"
                            ? `${selectedKpi.rawData?.count || 0} Tiket Perbaikan`
                            : `${selectedKpi.rawData?.supporting_transactions?.length || 0} Catatan Transaksi (PO / DPS)`}{" "}
                          tercatat.
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setModalViewMode("table")}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-opacity-90 active:scale-95"
                      >
                        <HiOutlineTableCells className="text-base" />
                        <span>Buka Data Terkait</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ================= TAB 2: DATA TERKAIT (TABEL DENGAN SEARCH & PAGINASI) ================= */
                  <div className="animate-fadeIn space-y-4">
                    {/* Controls (Search & Filter) */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="relative flex-1">
                        <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base text-slate-400" />
                        <input
                          type="text"
                          value={modalSearch}
                          onChange={(e) => {
                            setModalSearch(e.target.value);
                            setModalPage(1);
                          }}
                          placeholder={
                            selectedKpi.type === "repair"
                              ? "Cari ID tiket, kode aset, nama mesin, keluhan, teknisi..."
                              : "Cari nomor PO/DPS, nama barang/jasa, supplier..."
                          }
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs outline-none transition focus:border-primary dark:border-slate-700 dark:bg-boxdark-2 dark:text-white"
                        />
                      </div>

                      {selectedKpi.type === "budget" && (
                        <div className="flex shrink-0 rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-meta-4">
                          {["ALL", "PO", "DPS"].map((src) => (
                            <button
                              key={src}
                              type="button"
                              onClick={() => {
                                setModalFilterSource(src);
                                setModalPage(1);
                              }}
                              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                                modalFilterSource === src
                                  ? "bg-white text-primary shadow-sm dark:bg-boxdark dark:text-white"
                                  : "text-slate-500 hover:text-black dark:text-slate-400 dark:hover:text-white"
                              }`}
                            >
                              {src === "ALL" ? "Semua Sumber" : src}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Table Data Pendukung */}
                    {paginatedModalItems.length === 0 ? (
                      <div className="py-16 text-center text-xs text-slate-400">
                        Tidak ditemukan data pendukung yang sesuai kriteria
                        pencarian
                      </div>
                    ) : selectedKpi.type === "repair" ? (
                      /* TABEL PERBAIKAN MESIN / KENDARAAN */
                      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                        <table className="w-full border-collapse text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 font-bold text-slate-700 dark:border-slate-800 dark:bg-meta-4/20 dark:text-slate-200">
                              <th className="px-3.5 py-2.5">ID Tiket</th>
                              <th className="px-3.5 py-2.5">
                                Aset Mesin / Kendaraan
                              </th>
                              <th className="px-3.5 py-2.5">
                                Keluhan Kerusakan
                              </th>
                              <th className="px-3.5 py-2.5">Teknisi</th>
                              <th className="px-3.5 py-2.5">Tgl Request</th>
                              <th className="px-3.5 py-2.5 text-right">
                                Durasi (Jam)
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {paginatedModalItems.map((item, idx) => (
                              <tr
                                key={item.id_request || idx}
                                className="transition hover:bg-slate-50/70 dark:hover:bg-meta-4/10"
                              >
                                <td className="font-mono px-3.5 py-2.5 font-bold text-primary">
                                  #{item.id_request}
                                </td>
                                <td className="px-3.5 py-2.5">
                                  <div className="font-semibold text-slate-800 dark:text-white">
                                    {item.id_asset}
                                  </div>
                                  <div className="max-w-xs truncate text-[11px] text-slate-400">
                                    {item.asset_name}{" "}
                                    {item.manufacture
                                      ? `• ${item.manufacture}`
                                      : ""}
                                  </div>
                                </td>
                                <td className="max-w-xs truncate px-3.5 py-2.5 text-slate-700 dark:text-slate-300">
                                  {item.problem}
                                </td>
                                <td className="px-3.5 py-2.5 text-slate-600 dark:text-slate-300">
                                  {item.technician}
                                </td>
                                <td className="font-mono px-3.5 py-2.5 text-[11px] text-slate-500">
                                  {item.time_request
                                    ? formatDateTime(item.time_request)
                                    : "-"}
                                </td>
                                <td className="font-mono px-3.5 py-2.5 text-right font-black text-amber-500">
                                  {item.repair_hours} Jam
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      /* TABEL TRANSAKSI BUDGET (PO / DPS) */
                      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                        <table className="w-full border-collapse text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 font-bold text-slate-700 dark:border-slate-800 dark:bg-meta-4/20 dark:text-slate-200">
                              <th className="px-3.5 py-2.5">Sumber</th>
                              <th className="px-3.5 py-2.5">No Registrasi</th>
                              <th className="px-3.5 py-2.5">Tanggal</th>
                              <th className="px-3.5 py-2.5">
                                Deskripsi Item / Jasa
                              </th>
                              <th className="px-3.5 py-2.5">
                                Supplier / Bengkel
                              </th>
                              <th className="px-3.5 py-2.5 text-right">
                                Biaya (Rp)
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {paginatedModalItems.map((item, idx) => (
                              <tr
                                key={item.id || idx}
                                className="transition hover:bg-slate-50/70 dark:hover:bg-meta-4/10"
                              >
                                <td className="px-3.5 py-2.5">
                                  <span
                                    className={`font-mono rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                      item.source_tag === "PO"
                                        ? "bg-primary/10 text-primary"
                                        : "bg-amber-500/15 text-amber-600"
                                    }`}
                                  >
                                    {item.source_tag}
                                  </span>
                                </td>
                                <td className="font-mono px-3.5 py-2.5 font-bold text-slate-800 dark:text-white">
                                  {item.id_register}
                                </td>
                                <td className="font-mono px-3.5 py-2.5 text-[11px] text-slate-500">
                                  {item.transaction_date
                                    ? String(item.transaction_date).split(
                                        "T",
                                      )[0]
                                    : "-"}
                                </td>
                                <td className="max-w-sm truncate px-3.5 py-2.5 font-medium text-slate-800 dark:text-white">
                                  {item.item}
                                  {item.quantity && (
                                    <span className="ml-1 text-[11px] font-normal text-slate-400">
                                      ({item.quantity} {item.unit})
                                    </span>
                                  )}
                                </td>
                                <td className="px-3.5 py-2.5 text-slate-600 dark:text-slate-300">
                                  {item.supplier || "-"}
                                </td>
                                <td className="font-mono px-3.5 py-2.5 text-right font-bold text-primary">
                                  Rp{" "}
                                  {Number(item.amount || 0).toLocaleString(
                                    "id-ID",
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Paginasi Table */}
                    {totalModalPages > 1 && (
                      <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400">
                          Halaman <strong>{modalPage}</strong> dari{" "}
                          <strong>{totalModalPages}</strong> (
                          {filteredModalItems.length} data)
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={modalPage <= 1}
                            onClick={() =>
                              setModalPage((p) => Math.max(1, p - 1))
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:opacity-30 dark:border-slate-700 dark:text-slate-300"
                          >
                            <HiOutlineChevronLeft className="text-sm" />
                          </button>
                          <button
                            type="button"
                            disabled={modalPage >= totalModalPages}
                            onClick={() =>
                              setModalPage((p) =>
                                Math.min(totalModalPages, p + 1),
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:opacity-30 dark:border-slate-700 dark:text-slate-300"
                          >
                            <HiOutlineChevronRight className="text-sm" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-5 py-3 dark:border-slate-800 dark:bg-boxdark-2/30">
                <span className="text-[11px] text-slate-400">
                  Tekan tombol Tutup atau klik area luar modal untuk kembali
                </span>
                <button
                  type="button"
                  onClick={closeKpiDetail}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-boxdark dark:text-slate-200"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </DefaultLayout>
    </UserAuth>
  );
}
