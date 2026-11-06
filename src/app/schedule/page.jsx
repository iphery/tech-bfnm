"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "react-responsive";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import UserAuth from "@/components/auth";
import { PageLoader } from "@/components/loader";
import { NotifyError, NotifySuccess } from "@/utils/notify";

// Icons
import {
  HiOutlineCalendar,
  HiOutlineBriefcase,
  HiOutlineCheckCircle,
  HiOutlineMagnifyingGlass,
  HiOutlineXMark,
  HiOutlineArrowPath,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineBuildingOffice2,
  HiOutlineMapPin,
  HiOutlineCheck,
  HiOutlineWrenchScrewdriver,
} from "react-icons/hi2";
import {
  FaIndustry,
  FaFireExtinguisher,
  FaSnowflake,
  FaWater,
  FaWarehouse,
  FaCube,
  FaChartPie,
  FaCalendarAlt,
} from "react-icons/fa";

export default function MaintenanceSchedulePage() {
  const router = useRouter();
  const isSmallScreen = useMediaQuery({ query: "(max-width: 768px)" });

  // Current date
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1); // 1 - 12
  const [loading, setLoading] = useState(true);
  const [scheduleData, setScheduleData] = useState(null);

  // Search input & Focused date
  const [searchQuery, setSearchQuery] = useState("");
  const [focusedDate, setFocusedDate] = useState(null);

  // Modal detail selected date
  const [modalDate, setModalDate] = useState(null);
  const [modalPage, setModalPage] = useState(1);
  const modalPerPage = 8;
  const [creatingMaintenanceId, setCreatingMaintenanceId] = useState(null);

  // Buat request maintenance rutin (PM)
  const handleCreateMaintenance = async (idAsset) => {
    try {
      setCreatingMaintenanceId(idAsset);
      const userStr = typeof window !== "undefined" ? localStorage.getItem("info") : null;
      let userUid = null;
      if (userStr) {
        try {
          const parsed = JSON.parse(userStr);
          userUid = Array.isArray(parsed) ? parsed[0]?.Uid : parsed?.Uid;
        } catch (e) {
          console.error("Parse user error:", e);
        }
      }

      const response = await axios.post("/api/createmaintenance", {
        idAsset,
        uid: userUid,
      });

      if (response.data && response.data.error === 0) {
        NotifySuccess(`Request perawatan rutin aset #${idAsset} berhasil dibuat`);
        // Refresh data jadwal agar status is_serviced ter-update
        fetchScheduleData(selectedYear, selectedMonth);
      } else {
        NotifyError(response.data?.message || "Gagal membuat perawatan rutin");
      }
    } catch (err) {
      console.error("handleCreateMaintenance error:", err);
      NotifyError("Gagal membuat request perawatan rutin");
    } finally {
      setCreatingMaintenanceId(null);
    }
  };

  // Month Names in Indonesian
  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const dayNamesIndo = [
    "Minggu",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
  ];

  // Fetch Schedule Data
  const fetchScheduleData = async (yr, mo) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `/api/maintenanceschedule?year=${yr}&month=${mo}`,
      );
      if (res.data?.success) {
        setScheduleData(res.data.data);
      } else {
        NotifyError(res.data?.error || "Gagal memuat jadwal maintenance");
      }
    } catch (err) {
      console.error("fetchScheduleData error:", err);
      NotifyError("Gagal memuat data jadwal maintenance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduleData(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  // Type metadata with distinct colors and icons
  const typeMetadata = {
    MP: {
      name: "Mesin Produksi",
      icon: <FaIndustry className="text-xs text-emerald-500" />,
      colorText: "text-emerald-600 dark:text-emerald-400",
      calBadgeBg:
        "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60",
      badgeColor: "bg-emerald-600 text-white",
    },
    AP: {
      name: "APAR",
      icon: <FaFireExtinguisher className="text-xs text-blue-500" />,
      colorText: "text-blue-600 dark:text-blue-400",
      calBadgeBg:
        "bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/60",
      badgeColor: "bg-blue-600 text-white",
    },
    AC: {
      name: "Air Conditioner",
      icon: <FaSnowflake className="text-xs text-amber-500" />,
      colorText: "text-amber-600 dark:text-amber-400",
      calBadgeBg:
        "bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60",
      badgeColor: "bg-amber-500 text-white",
    },
    HY: {
      name: "Hydrant",
      icon: <FaWater className="text-xs text-cyan-500" />,
      colorText: "text-cyan-600 dark:text-cyan-400",
      calBadgeBg:
        "bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200/60 dark:border-cyan-800/60",
      badgeColor: "bg-cyan-600 text-white",
    },
    BH: {
      name: "Box Hydrant",
      icon: <FaWarehouse className="text-xs text-rose-500" />,
      colorText: "text-rose-600 dark:text-rose-400",
      calBadgeBg:
        "bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/60",
      badgeColor: "bg-rose-600 text-white",
    },
  };

  // Search results dropdown
  const searchResults = useMemo(() => {
    if (!scheduleData?.asset_search_index || !searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return scheduleData.asset_search_index
      .filter(
        (item) =>
          String(item.id_asset || "")
            .toLowerCase()
            .includes(q) ||
          String(item.description || "")
            .toLowerCase()
            .includes(q),
      )
      .slice(0, 8);
  }, [scheduleData, searchQuery]);

  // All days of the month list (for mobile and flat views)
  const allDaysOfMonth = useMemo(() => {
    if (!scheduleData) return [];

    const totalDays = scheduleData.total_days_in_month || 30;
    const todayStr = new Date().toISOString().slice(0, 10);
    const list = [];

    for (let day = 1; day <= totalDays; day++) {
      const monthStr = String(selectedMonth).padStart(2, "0");
      const dayStr = String(day).padStart(2, "0");
      const dateStr = `${selectedYear}-${monthStr}-${dayStr}`;

      const dateObj = new Date(selectedYear, selectedMonth - 1, day);
      const dayOfWeek = dateObj.getDay(); // 0 - 6
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isToday = dateStr === todayStr;

      const dayItems = scheduleData.schedules_mapped_by_date?.[dateStr] || [];
      const hasSchedule = dayItems.length > 0;

      // Group counts by type
      const typeCounts = {};
      dayItems.forEach((it) => {
        typeCounts[it.Type] = (typeCounts[it.Type] || 0) + 1;
      });

      list.push({
        day,
        dateStr,
        dayOfWeek,
        dayName: dayNamesIndo[dayOfWeek],
        isWeekend,
        isToday,
        hasSchedule,
        itemsCount: dayItems.length,
        items: dayItems,
        typeCounts,
      });
    }

    return list;
  }, [scheduleData, selectedYear, selectedMonth]);

  // Calendar Matrix Calculation (7 columns for desktop)
  const calendarWeeks = useMemo(() => {
    if (!scheduleData) return [];

    const firstDay = new Date(selectedYear, selectedMonth - 1, 1);
    const startDayOfWeek = firstDay.getDay(); // 0 (Sun) to 6 (Sat)

    const weeks = [];
    let currentWeek = [];

    // Empty cells before start of month
    for (let i = 0; i < startDayOfWeek; i++) {
      currentWeek.push({ isOtherMonth: true });
    }

    allDaysOfMonth.forEach((dayObj) => {
      currentWeek.push({
        ...dayObj,
        isOtherMonth: false,
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    // Trailing empty cells
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({ isOtherMonth: true });
      }
      weeks.push(currentWeek);
    }

    return weeks;
  }, [scheduleData, allDaysOfMonth, selectedYear, selectedMonth]);

  // Modal active day items & pagination
  const modalDateItems = useMemo(() => {
    if (!modalDate || !scheduleData?.schedules_mapped_by_date) return [];
    return scheduleData.schedules_mapped_by_date[modalDate] || [];
  }, [modalDate, scheduleData]);

  const totalModalPages = Math.max(
    1,
    Math.ceil(modalDateItems.length / modalPerPage),
  );
  const paginatedModalItems = useMemo(() => {
    const start = (modalPage - 1) * modalPerPage;
    return modalDateItems.slice(start, start + modalPerPage);
  }, [modalDateItems, modalPage, modalPerPage]);

  const openDateModal = (dateStr) => {
    setModalDate(dateStr);
    setModalPage(1);
    setSearchQuery("");
  };

  const closeDateModal = () => {
    setModalDate(null);
  };

  // Handler search selection: focus & auto-scroll
  const handleSelectSearchResult = (targetDate) => {
    setFocusedDate(targetDate);
    setSearchQuery("");

    // Auto-scroll on mobile or desktop if element exists
    setTimeout(() => {
      const el = document.getElementById(`date-card-${targetDate}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-4", "ring-primary", "scale-[1.02]");
        setTimeout(() => {
          el.classList.remove("ring-4", "ring-primary", "scale-[1.02]");
        }, 3000);
      }
    }, 100);
  };

  // Badge Notif Style: Icon with small badge notification on top
  const renderIconWithNotificationBadge = (typeCounts) => {
    const entries = Object.entries(typeCounts);
    if (!entries.length) return null;

    return (
      <div className="mt-1 flex flex-wrap items-center gap-1.5">
        {entries.map(([tCode, count]) => {
          const meta = typeMetadata[tCode] || {
            icon: <FaCube className="text-xs text-slate-400" />,
            calBadgeBg: "bg-slate-50 border border-slate-200",
            badgeColor: "bg-slate-700 text-white",
          };

          return (
            <div
              key={tCode}
              title={`${meta.name || tCode}: ${count} Aset`}
              className={`shadow-2xs relative flex h-6 w-6 items-center justify-center rounded-lg transition hover:scale-110 sm:h-7 sm:w-7 ${meta.calBadgeBg}`}
            >
              {/* Icon Center */}
              <div className="flex items-center justify-center">
                {meta.icon}
              </div>

              {/* Notification Badge on top right */}
              <span
                className={`font-mono shadow-xs absolute -right-1.5 -top-1.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full px-0.5 text-[8px] font-black ring-1 ring-white dark:ring-boxdark ${meta.badgeColor}`}
              >
                {count}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <UserAuth>
      <DefaultLayout>
        <div className="space-y-4 pb-10">
          {/* ================= COMPACT HEADER SECTION ================= */}
          <div className="shadow-xs relative z-20 rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-primary/5 p-4 backdrop-blur-md dark:border-slate-800 dark:from-boxdark dark:via-boxdark-2 dark:to-primary/10 sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              {/* Title & Info */}
              <div className="space-y-1">
                <div className="flex items-center gap-2"></div>
                <h1 className="text-xl font-bold text-black dark:text-white">
                  Jadwal Maintenance Rutin
                </h1>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Periode:{" "}
                  <strong className="text-slate-800 dark:text-white">
                    {monthNames[selectedMonth - 1]} {selectedYear}
                  </strong>
                </span>
              </div>

              {/* Controls: Month, Year, Search, Refresh */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Search with Autocomplete Dropdown */}
                <div className="relative w-full sm:w-56">
                  <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari ID/nama aset..."
                    className="w-full rounded-xl border border-slate-200 bg-white/90 py-1.5 pl-8 pr-3 text-xs outline-none transition focus:border-primary dark:border-slate-700 dark:bg-boxdark dark:text-white"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <HiOutlineXMark className="text-xs" />
                    </button>
                  )}

                  {/* Dropdown Search Results */}
                  {searchResults.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-boxdark">
                      {searchResults.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleSelectSearchResult(item.date)}
                          className="flex cursor-pointer items-center justify-between border-b border-slate-100 p-2.5 text-xs transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-boxdark-2"
                        >
                          <div className="overflow-hidden pr-2">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-primary">
                                {item.id_asset}
                              </span>
                              <span className="py-0.2 rounded bg-slate-100 px-1 text-[9px] font-bold text-slate-600 dark:bg-meta-4 dark:text-slate-300">
                                {item.type}
                              </span>
                            </div>
                            <div className="truncate text-[11px] text-slate-700 dark:text-slate-300">
                              {item.description}
                            </div>
                            {item.user_name && (
                              <div className="mt-0.5 truncate text-[10px] text-slate-400 dark:text-slate-400">
                                User:{" "}
                                <span className="font-semibold text-slate-600 dark:text-slate-300">
                                  {item.user_name}
                                </span>
                              </div>
                            )}
                          </div>
                          <span className="font-mono shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                            {item.date}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Month Selector */}
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="rounded-xl border border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-900 outline-none dark:border-slate-700 dark:bg-boxdark dark:text-white"
                >
                  {monthNames.map((mName, idx) => (
                    <option key={idx + 1} value={idx + 1}>
                      {mName}
                    </option>
                  ))}
                </select>

                {/* Year Selector */}
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="rounded-xl border border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-900 outline-none dark:border-slate-700 dark:bg-boxdark dark:text-white"
                >
                  {[
                    selectedYear - 2,
                    selectedYear - 1,
                    selectedYear,
                    selectedYear + 1,
                  ].map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>

                {/* Refresh */}
                <button
                  type="button"
                  onClick={() => fetchScheduleData(selectedYear, selectedMonth)}
                  disabled={loading}
                  className="shadow-2xs inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-boxdark dark:text-slate-200"
                >
                  <HiOutlineArrowPath
                    className={`text-xs ${loading ? "animate-spin text-primary" : ""}`}
                  />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </div>

          {/* ================= MAIN LAYOUT (2/3 CALENDAR + 1/3 SUMMARY) ================= */}
          {loading && !scheduleData ? (
            /* Custom Skeleton Khusus Layout Schedule (2/3 Kalender Grid + 1/3 Summary Panel) */
            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12 animate-pulse">
              {/* 2/3 Bagian Kiri: Kalender Skeleton */}
              <div className="order-2 lg:order-1 lg:col-span-8 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-boxdark space-y-3">
                {/* Header Hari (Min - Sab) */}
                <div className="grid grid-cols-7 gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="h-5 rounded-md bg-slate-200/70 dark:bg-slate-700/50"></div>
                  ))}
                </div>
                {/* 5 Baris Grid Kalender */}
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, row) => (
                    <div key={row} className="grid grid-cols-7 gap-2">
                      {Array.from({ length: 7 }).map((_, col) => (
                        <div
                          key={col}
                          className="h-[68px] rounded-xl bg-slate-100/80 dark:bg-slate-800/40 p-2 space-y-2"
                        >
                          <div className="h-4 w-5 rounded-md bg-slate-200/80 dark:bg-slate-700/60"></div>
                          <div className="flex gap-1">
                            <div className="h-5 w-5 rounded-md bg-slate-200/60 dark:bg-slate-700/40"></div>
                            <div className="h-5 w-5 rounded-md bg-slate-200/60 dark:bg-slate-700/40"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* 1/3 Bagian Kanan: Summary Skeleton */}
              <div className="order-1 lg:order-2 lg:col-span-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-boxdark space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3 w-28 rounded bg-slate-200/70 dark:bg-slate-700/50"></div>
                    <div className="h-5 w-36 rounded bg-slate-200/80 dark:bg-slate-700/60"></div>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-slate-200/60 dark:bg-slate-700/40"></div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800/50"></div>
                  <div className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800/50"></div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="h-3 w-32 rounded bg-slate-200/70 dark:bg-slate-700/50"></div>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800/30"></div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12">
              {/* ================= BAGIAN 2/3: KALENDER COMPACT TANPA SCROLL (DESKTOP) ================= */}
              <div className="order-2 lg:order-1 lg:col-span-8">
                {/* Mobile View: Vertical scrolling cards */}
                <div className="block space-y-2.5 md:hidden">
                  <div className="flex items-center justify-between px-1 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <span>Daftar Tanggal ({allDaysOfMonth.length} Hari)</span>
                    <span className="text-[11px] font-normal lowercase">
                      klik tanggal untuk rincian
                    </span>
                  </div>

                  {allDaysOfMonth.map((dayObj) => {
                    const isFocused = focusedDate === dayObj.dateStr;

                    return (
                      <div
                        id={`date-card-${dayObj.dateStr}`}
                        key={dayObj.dateStr}
                        onClick={() =>
                          dayObj.hasSchedule && openDateModal(dayObj.dateStr)
                        }
                        className={`w-full rounded-2xl border p-3 transition-all duration-300 ${
                          isFocused
                            ? "shadow-xs border-primary bg-primary/5 ring-1 ring-primary"
                            : dayObj.hasSchedule
                              ? "shadow-2xs cursor-pointer border-slate-200/90 bg-white hover:border-primary active:scale-[0.99] dark:border-slate-800 dark:bg-boxdark"
                              : dayObj.isWeekend
                                ? "border-rose-100 bg-rose-50/20 opacity-70 dark:border-rose-950/40 dark:bg-rose-950/10"
                                : "border-slate-100 bg-slate-50/50 opacity-60 dark:border-slate-800 dark:bg-boxdark/40"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-mono flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black ${
                                dayObj.isToday
                                  ? "shadow-xs bg-primary text-white"
                                  : dayObj.isWeekend
                                    ? "bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
                                    : "bg-slate-100 text-slate-800 dark:bg-meta-4 dark:text-white"
                              }`}
                            >
                              {dayObj.day}
                            </span>
                            <div>
                              <div className="text-xs font-bold text-slate-800 dark:text-white">
                                {dayObj.dayName}
                                {dayObj.isToday && (
                                  <span className="py-0.2 ml-1.5 rounded-full bg-primary/10 px-1.5 text-[9px] font-bold text-primary">
                                    Hari Ini
                                  </span>
                                )}
                              </div>
                              <div className="font-mono text-[10px] text-slate-400">
                                {dayObj.dateStr}
                              </div>
                            </div>
                          </div>

                          {dayObj.hasSchedule ? (
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                                {dayObj.itemsCount} Aset
                              </span>
                              <HiOutlineChevronRight className="text-xs text-slate-400" />
                            </div>
                          ) : (
                            <span className="text-[10px] italic text-slate-400">
                              {dayObj.isWeekend ? "Hari Libur" : "Kosong"}
                            </span>
                          )}
                        </div>

                        {/* Badge notification icons */}
                        {dayObj.hasSchedule &&
                          renderIconWithNotificationBadge(dayObj.typeCounts)}
                      </div>
                    );
                  })}
                </div>

                {/* Desktop View: Fit in 1 Screen (No Scroll Needed) */}
                <div className="shadow-2xs hidden overflow-hidden rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-boxdark md:block">
                  <table className="w-full table-fixed border-collapse text-left">
                    {/* Header Minggu s/d Sabtu */}
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-center text-xs font-bold text-slate-700 dark:border-slate-800 dark:bg-boxdark-2/60 dark:text-slate-300">
                        <th className="w-[14.28%] py-2 font-extrabold text-rose-500">
                          Min
                        </th>
                        <th className="w-[14.28%] py-2">Sen</th>
                        <th className="w-[14.28%] py-2">Sel</th>
                        <th className="w-[14.28%] py-2">Rab</th>
                        <th className="w-[14.28%] py-2">Kam</th>
                        <th className="w-[14.28%] py-2">Jum</th>
                        <th className="w-[14.28%] py-2 font-extrabold text-rose-500">
                          Sab
                        </th>
                      </tr>
                    </thead>

                    {/* Matrix Body: Compact height (h-[70px]) agar seluruh bulan muat tanpa scroll */}
                    <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
                      {calendarWeeks.map((week, wIdx) => (
                        <tr
                          key={wIdx}
                          className="divide-x divide-slate-100 dark:divide-slate-800"
                        >
                          {week.map((cell, cIdx) => {
                            if (cell.isOtherMonth) {
                              return (
                                <td
                                  key={cIdx}
                                  className="h-[74px] bg-slate-50/30 p-1.5 dark:bg-boxdark-2/20"
                                />
                              );
                            }

                            const isFocused = focusedDate === cell.dateStr;

                            return (
                              <td
                                id={`date-card-${cell.dateStr}`}
                                key={cIdx}
                                onClick={() =>
                                  cell.hasSchedule &&
                                  openDateModal(cell.dateStr)
                                }
                                className={`relative h-[74px] p-1.5 align-top transition-all duration-200 ${
                                  isFocused
                                    ? "bg-primary/10 shadow-inner ring-1 ring-primary"
                                    : cell.hasSchedule
                                      ? "hover:shadow-xs cursor-pointer bg-slate-50/20 hover:bg-primary/5"
                                      : cell.isWeekend
                                        ? "bg-rose-50/20 dark:bg-rose-950/10"
                                        : "bg-white dark:bg-boxdark"
                                }`}
                              >
                                {/* Day Number Header */}
                                <div className="flex items-center justify-between leading-none">
                                  <span
                                    className={`font-mono flex h-5 w-5 items-center justify-center rounded-md text-[11px] font-black ${
                                      cell.isToday
                                        ? "shadow-2xs bg-primary text-white"
                                        : cell.isWeekend
                                          ? "text-rose-500"
                                          : "text-slate-800 dark:text-slate-200"
                                    }`}
                                  >
                                    {cell.day}
                                  </span>

                                  {cell.hasSchedule && (
                                    <span className="font-mono text-[9px] font-extrabold text-primary">
                                      {cell.itemsCount}
                                    </span>
                                  )}
                                </div>

                                {/* Icon + Badge Notif on Top */}
                                {cell.hasSchedule &&
                                  renderIconWithNotificationBadge(
                                    cell.typeCounts,
                                  )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ================= BAGIAN 1/3: RINGKASAN & STATISTIK (DESKTOP) ================= */}
              <div className="order-1 space-y-3 lg:order-2 lg:col-span-4">
                {/* Info Card Ringkasan Bulan */}
                <div className="shadow-xs rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-boxdark">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Ringkasan Maintenance
                      </span>
                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        {monthNames[selectedMonth - 1]} {selectedYear}
                      </h3>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <FaChartPie className="text-base" />
                    </div>
                  </div>

                  {/* Summary Metric Stats */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-boxdark-2">
                      <span className="text-[10px] font-medium text-slate-400">
                        Hari Kerja
                      </span>
                      <div className="mt-0.5 text-base font-black text-slate-800 dark:text-white">
                        {scheduleData?.total_workdays || 0} Hari
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-boxdark-2">
                      <span className="text-[10px] font-medium text-slate-400">
                        Total Jadwal
                      </span>
                      <div className="mt-0.5 text-base font-black text-primary">
                        {scheduleData?.total_assets || 0} Aset
                      </div>
                    </div>
                  </div>

                  {/* Breakdown Per Tipe Aset */}
                  <div className="mt-4 space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Rincian Berdasarkan Tipe
                    </div>

                    {scheduleData?.summary_by_type &&
                      Object.entries(scheduleData.summary_by_type).map(
                        ([tCode, count]) => {
                          const meta = typeMetadata[tCode] || {
                            name: tCode,
                            icon: <FaCube className="text-xs text-primary" />,
                            colorText: "text-slate-800",
                          };

                          return (
                            <div
                              key={tCode}
                              className="flex items-center justify-between rounded-xl border border-slate-100 p-2.5 transition hover:bg-slate-50 dark:border-slate-800/80 dark:hover:bg-boxdark-2"
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-meta-4">
                                  {meta.icon}
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                    {meta.name}
                                  </div>
                                  <div className="font-mono text-[10px] text-slate-400">
                                    Kode: {tCode}
                                  </div>
                                </div>
                              </div>
                              <span className="font-mono rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-black text-slate-800 dark:bg-meta-4 dark:text-white">
                                {count}
                              </span>
                            </div>
                          );
                        },
                      )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================= MODAL DETAIL HARIAN (CLICKED DATE) ================= */}
        {modalDate && (
          <div className="animate-fadeIn fixed inset-0 z-9999 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-4">
            <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-boxdark">
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-slate-100 p-5 dark:border-slate-800">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <HiOutlineCalendar className="text-xl" />
                  </div>
                  <div>
                    <span className="font-mono text-xs font-bold text-primary">
                      JADWAL PREVENTIVE MAINTENANCE
                    </span>
                    <h3 className="text-base font-black text-slate-900 dark:text-white sm:text-lg">
                      Rincian Aset Tanggal: {modalDate}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeDateModal}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-meta-4 dark:hover:text-white"
                >
                  <HiOutlineXMark className="text-xl" />
                </button>
              </div>

              {/* Modal Subheader Bar */}
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-3 dark:border-slate-800 dark:bg-boxdark-2/40">
                <span className="text-xs font-semibold text-slate-500">
                  Daftar seluruh mesin &amp; utilitas yang dijadwalkan pada hari
                  ini
                </span>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Total:{" "}
                  <strong className="text-primary">
                    {modalDateItems.length}
                  </strong>{" "}
                  Aset
                </div>
              </div>

              {/* Modal Table Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {paginatedModalItems.length === 0 ? (
                  <div className="py-16 text-center text-xs text-slate-400">
                    Tidak ditemukan aset yang cocok dengan filter pencarian
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 font-bold text-slate-700 dark:border-slate-800 dark:bg-meta-4/20 dark:text-slate-200">
                          <th
                            className="px-3.5 py-2.5 text-center"
                            style={{ width: "5%" }}
                          >
                            #
                          </th>
                          <th
                            className="px-3.5 py-2.5"
                            style={{ width: "20%" }}
                          >
                            ID Aset
                          </th>
                          <th
                            className="px-3.5 py-2.5"
                            style={{ width: "35%" }}
                          >
                            Deskripsi Mesin &amp; Lokasi
                          </th>
                          <th
                            className="px-3.5 py-2.5"
                            style={{ width: "25%" }}
                          >
                            Model / Manufaktur
                          </th>
                          <th
                            className="px-3.5 py-2.5 text-center"
                            style={{ width: "15%" }}
                          >
                            Tipe / Kategori
                          </th>
                          <th
                            className="px-3.5 py-2.5 text-center"
                            style={{ width: "15%" }}
                          >
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {paginatedModalItems.map((item, idx) => {
                          const meta = typeMetadata[item.Type] || {
                            calBadgeBg: "bg-slate-100 text-slate-800",
                          };
                          const itemIndex =
                            (modalPage - 1) * modalPerPage + idx + 1;
                          const isProcessing = creatingMaintenanceId === item.ID_Asset;

                          return (
                            <tr
                              key={item.ID_Asset || idx}
                              className="transition hover:bg-slate-50/70 dark:hover:bg-meta-4/10"
                            >
                              <td className="px-3.5 py-2.5 text-center font-bold text-slate-400">
                                {itemIndex}
                              </td>
                              <td className="px-3.5 py-2.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono font-bold text-primary">
                                    {item.ID_Asset}
                                  </span>
                                  {item.is_serviced && (
                                    <span
                                      className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300"
                                      title="Sudah diservis (PM) bulan ini"
                                    >
                                      <HiOutlineCheck className="text-[10px] font-black" />
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-3.5 py-2.5">
                                <div className="font-semibold text-slate-800 dark:text-white">
                                  {item.Description}
                                </div>
                                {item.Location && (
                                  <div className="mt-0.5 inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600 dark:bg-boxdark-2 dark:text-slate-400">
                                    <HiOutlineMapPin className="text-[10px]" />
                                    <span>{item.Location}</span>
                                  </div>
                                )}
                              </td>
                              <td className="px-3.5 py-2.5 text-slate-600 dark:text-slate-300">
                                <div>{item.Manufacture || "-"}</div>
                                <div className="text-[11px] text-slate-400">
                                  {item.Model || ""}
                                </div>
                              </td>
                              <td className="px-3.5 py-2.5 text-center">
                                <div className="flex flex-wrap items-center justify-center gap-1">
                                  <span
                                    className={`font-mono rounded px-1.5 py-0.5 text-[10px] font-bold ${meta.calBadgeBg}`}
                                  >
                                    {item.Type}
                                  </span>
                                  {item.factory && (
                                    <span className="font-mono rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-meta-4 dark:text-slate-300">
                                      {item.factory}
                                    </span>
                                  )}
                                  {item.PM_Category && (
                                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600 dark:bg-meta-4 dark:text-slate-300">
                                      {item.PM_Category}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-3.5 py-2.5 text-center">
                                {item.is_serviced ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600 border border-emerald-200/60 dark:bg-emerald-950/40 dark:border-emerald-800/60 dark:text-emerald-400">
                                    <HiOutlineCheck className="text-xs font-black" />
                                    <span>Sudah Dibuat</span>
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    disabled={isProcessing}
                                    onClick={() => handleCreateMaintenance(item.ID_Asset)}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-meta-3 px-2.5 py-1.5 text-[11px] font-bold text-white shadow-2xs transition hover:bg-opacity-90 active:scale-95 disabled:opacity-50"
                                    title="Buat Permintaan Perawatan Rutin (PM)"
                                  >
                                    <HiOutlineWrenchScrewdriver className={`text-xs ${isProcessing ? "animate-spin" : ""}`} />
                                    <span>{isProcessing ? "Memproses..." : "Buat PM"}</span>
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Modal Pagination */}
                {totalModalPages > 1 && (
                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">
                      Halaman <strong>{modalPage}</strong> dari{" "}
                      <strong>{totalModalPages}</strong> (
                      {modalDateItems.length} data)
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={modalPage <= 1}
                        onClick={() => setModalPage((p) => Math.max(1, p - 1))}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:opacity-30 dark:border-slate-700 dark:text-slate-300"
                      >
                        <HiOutlineChevronLeft className="text-sm" />
                      </button>
                      <button
                        type="button"
                        disabled={modalPage >= totalModalPages}
                        onClick={() =>
                          setModalPage((p) => Math.min(totalModalPages, p + 1))
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:opacity-30 dark:border-slate-700 dark:text-slate-300"
                      >
                        <HiOutlineChevronRight className="text-sm" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end border-t border-slate-100 bg-slate-50/50 px-5 py-3 dark:border-slate-800 dark:bg-boxdark-2/30">
                <button
                  type="button"
                  onClick={closeDateModal}
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
