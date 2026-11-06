"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "react-responsive";
import UserAuth from "@/components/auth";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { PageCard } from "@/components/card";
import { PageLoader } from "@/components/loader";
import { NotifySuccess, NotifyError } from "@/utils/notify";
import useColorMode from "@/hooks/useColorMode";

// Icons
import {
  HiArrowLeft,
  HiOutlineCheckCircle,
  HiOutlineCube,
  HiOutlineCog6Tooth,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineBolt,
  HiOutlineCircleStack,
  HiOutlineCalculator,
  HiOutlineArrowPath,
  HiOutlineBanknotes,
  HiOutlineCalendarDays,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineCloudArrowDown,
  HiOutlinePencilSquare,
  HiOutlineXMark,
  HiOutlineWrenchScrewdriver,
} from "react-icons/hi2";
import { BsBoxSeam, BsCheck2Circle } from "react-icons/bs";

const DEFAULT_POS_LIST = [
  { code: "ME01", name: "Pelumasan", category: "Oil & Lubricant" },
  { code: "ME02", name: "Servis Kendaraan", category: "Vehicle Service" },
  {
    code: "ME03",
    name: "Servis Mesin Produksi",
    category: "Production Service",
  },
  { code: "ME04", name: "Spare Part Kendaraan", category: "Vehicle Parts" },
  {
    code: "ME05",
    name: "Spare Part Mesin Produksi",
    category: "Production Parts",
  },
];

const REPAIR_TARGET_LIST = [
  {
    code: "RTM",
    name: "Target Repair Time Mesin (RTM)",
    description: "Repair Time Mesin",
    unit: "Jam",
    defaultVal: 7,
  },
  {
    code: "RTK",
    name: "Target Repair Time Kendaraan (RTK)",
    description: "Repair Time Kendaraan",
    unit: "Jam",
    defaultVal: 15,
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const isSmallScreen = useMediaQuery({ query: "(max-width: 640px)" });

  // Tab State
  const [activeTab, setActiveTab] = useState<
    "general" | "budget" | "repair_target" | "holidays" | "maintenance"
  >("general");

  const [loading, setLoading] = useState(true);
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizeResult, setOptimizeResult] = useState<any>(null);
  const [syncingFifo, setSyncingFifo] = useState(false);
  const [fifoResult, setFifoResult] = useState<any>(null);
  const [partStatusFilter, setPartStatusFilter] = useState("aktif");
  const [colorMode, setColorMode] = useColorMode();

  // --- Budget Setting States ---
  const currentYear = new Date().getFullYear();
  const [budgetYear, setBudgetYear] = useState<number>(currentYear);
  const [budgetMatrix, setBudgetMatrix] = useState<Record<string, number>>({});
  const [monthlyMatrix, setMonthlyMatrix] = useState<
    Record<string, Record<number, number>>
  >({});
  const [budgetViewMode, setBudgetViewMode] = useState<"uniform" | "monthly">(
    "uniform",
  );
  const [loadingBudget, setLoadingBudget] = useState(false);
  const [savingBudget, setSavingBudget] = useState(false);

  // --- Repair Target Setting States (RTM & RTK) ---
  const [repairYear, setRepairYear] = useState<number>(currentYear);
  const [repairMatrix, setRepairMatrix] = useState<Record<string, number>>({});
  const [monthlyRepairMatrix, setMonthlyRepairMatrix] = useState<
    Record<string, Record<number, number>>
  >({});
  const [repairViewMode, setRepairViewMode] = useState<"uniform" | "monthly">(
    "uniform",
  );
  const [loadingRepair, setLoadingRepair] = useState(false);
  const [savingRepair, setSavingRepair] = useState(false);

  // --- Holidays Setting States ---
  const [holidayYear, setHolidayYear] = useState<number>(currentYear);
  const [holidaysList, setHolidaysList] = useState<any[]>([]);
  const [loadingHolidays, setLoadingHolidays] = useState(false);
  const [syncingHolidays, setSyncingHolidays] = useState(false);
  const [savingHolidays, setSavingHolidays] = useState(false);
  const [editingOldDate, setEditingOldDate] = useState<string | null>(null);
  const [newHolidayDate, setNewHolidayDate] = useState("");
  const [newHolidayName, setNewHolidayName] = useState("");
  const [newHolidayType, setNewHolidayType] = useState("Kantor");

  const fetchSettings = async () => {
    try {
      const res = await axios.get("/api/systemsettings");
      if (res.data?.settings?.part_status_filter) {
        setPartStatusFilter(res.data.settings.part_status_filter);
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "part_status_filter",
            res.data.settings.part_status_filter,
          );
        }
      }
      if (res.data?.settings?.color_theme) {
        const serverTheme = res.data.settings.color_theme;
        if (typeof window !== "undefined") {
          const currentLocal = localStorage.getItem("color-theme");
          if (!currentLocal) {
            setColorMode(serverTheme);
          }
        }
      }
    } catch (e) {
      console.error("fetchSettings error:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchBudget = async (yr: number) => {
    setLoadingBudget(true);
    try {
      const res = await axios.get(`/api/budgetsetting?year=${yr}`);
      if (res.data?.success) {
        const mMatrix = res.data.monthly_matrix || {};
        setMonthlyMatrix(mMatrix);

        // Compute average/default monthly for the uniform view
        const uMatrix: Record<string, number> = {};
        DEFAULT_POS_LIST.forEach((p) => {
          if (mMatrix[p.code]) {
            // Find non-zero or month 1
            const m1 = mMatrix[p.code][1] || 0;
            const anyMonth =
              Object.values(mMatrix[p.code]).find((v) => Number(v) > 0) || m1;
            uMatrix[p.code] = Number(anyMonth || 0);
          } else {
            uMatrix[p.code] = 0;
          }
        });
        setBudgetMatrix(uMatrix);
      }
    } catch (e) {
      console.error("fetchBudget error:", e);
      NotifyError("Gagal memuat pengaturan budget");
    } finally {
      setLoadingBudget(false);
    }
  };

  const fetchRepairTargets = async (yr: number) => {
    setLoadingRepair(true);
    try {
      const res = await axios.get(`/api/repairtarget?year=${yr}`);
      if (res.data?.success) {
        setMonthlyRepairMatrix(res.data.monthly_matrix || {});
        setRepairMatrix(res.data.uniform_matrix || {});
      }
    } catch (e) {
      console.error("fetchRepairTargets error:", e);
      NotifyError("Gagal memuat target perbaikan");
    } finally {
      setLoadingRepair(false);
    }
  };

  const fetchHolidays = async (yr: number) => {
    setLoadingHolidays(true);
    try {
      const res = await axios.get(`/api/holidays?year=${yr}`);
      if (res.data?.success) {
        setHolidaysList(res.data.holidays || []);
      }
    } catch (e) {
      console.error("fetchHolidays error:", e);
      NotifyError("Gagal memuat daftar hari libur");
    } finally {
      setLoadingHolidays(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (activeTab === "budget") {
      fetchBudget(budgetYear);
    } else if (activeTab === "repair_target") {
      fetchRepairTargets(repairYear);
    } else if (activeTab === "holidays") {
      fetchHolidays(holidayYear);
    }
  }, [activeTab, budgetYear, repairYear, holidayYear]);

  const handleThemeChange = async (theme: "light" | "dark") => {
    setColorMode(theme);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("color-theme", JSON.stringify(theme));
        if (theme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      } catch (err) {
        console.error("Error setting theme in localStorage:", err);
      }
    }

    try {
      await axios.post("/api/systemsettings", { color_theme: theme });
    } catch (err) {
      console.error("Failed to sync theme with server:", err);
    }
  };

  const handleSaveGeneral = async () => {
    setSavingGeneral(true);
    try {
      const res = await axios.post("/api/systemsettings", {
        part_status_filter: partStatusFilter,
        color_theme: colorMode,
      });

      if (res.status === 200) {
        NotifySuccess("Pengaturan umum berhasil disimpan");
        if (typeof window !== "undefined") {
          localStorage.setItem("part_status_filter", partStatusFilter);
          localStorage.setItem("color-theme", JSON.stringify(colorMode));
        }
      }
    } catch (e) {
      NotifyError("Gagal menyimpan pengaturan umum");
      console.error(e);
    } finally {
      setSavingGeneral(false);
    }
  };

  const handleSaveBudget = async () => {
    setSavingBudget(true);
    try {
      const payload: any = { year: budgetYear };

      if (budgetViewMode === "uniform") {
        payload.matrix = budgetMatrix;
      } else {
        payload.monthly_matrix = monthlyMatrix;
      }

      const res = await axios.post("/api/budgetsetting", payload);
      if (res.data?.success) {
        NotifySuccess(
          res.data.message || "Pengaturan budget berhasil disimpan!",
        );
        fetchBudget(budgetYear);
      } else {
        NotifyError(res.data?.error || "Gagal menyimpan budget");
      }
    } catch (err: any) {
      NotifyError(err?.response?.data?.error || "Gagal menyimpan budget");
    } finally {
      setSavingBudget(false);
    }
  };

  const handleSaveRepairTarget = async () => {
    setSavingRepair(true);
    try {
      const payload: any = { year: repairYear };

      if (repairViewMode === "uniform") {
        payload.matrix = repairMatrix;
      } else {
        payload.monthly_matrix = monthlyRepairMatrix;
      }

      const res = await axios.post("/api/repairtarget", payload);
      if (res.data?.success) {
        NotifySuccess(
          res.data.message || "Target perbaikan berhasil disimpan!",
        );
        fetchRepairTargets(repairYear);
      } else {
        NotifyError(res.data?.error || "Gagal menyimpan target perbaikan");
      }
    } catch (err: any) {
      NotifyError(
        err?.response?.data?.error || "Gagal menyimpan target perbaikan",
      );
    } finally {
      setSavingRepair(false);
    }
  };

  const handleSyncNationalHolidays = async () => {
    setSyncingHolidays(true);
    try {
      const res = await axios.post("/api/holidays", {
        action: "fetch_api",
        year: holidayYear,
      });
      if (res.data?.success) {
        NotifySuccess(
          res.data.message || "Hari libur nasional berhasil disinkronkan",
        );
        setHolidaysList(res.data.holidays || []);
      } else {
        NotifyError(
          res.data?.error || "Gagal sinkronisasi hari libur nasional",
        );
      }
    } catch (err: any) {
      NotifyError(
        err?.response?.data?.error ||
          "Gagal menghubungi layanan hari libur online",
      );
    } finally {
      setSyncingHolidays(false);
    }
  };

  const handleSaveHolidayItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHolidayDate || !newHolidayName) {
      NotifyError("Mohon isi tanggal dan nama hari libur");
      return;
    }
    setSavingHolidays(true);
    try {
      const res = await axios.post("/api/holidays", {
        action: "save_one",
        old_date: editingOldDate,
        date: newHolidayDate,
        description: newHolidayName,
        type: newHolidayType,
        year: holidayYear,
      });
      if (res.data?.success) {
        NotifySuccess(res.data.message || "Hari libur berhasil disimpan");
        setEditingOldDate(null);
        setNewHolidayName("");
        setNewHolidayDate("");
        setNewHolidayType("Kantor");
        fetchHolidays(holidayYear);
      } else {
        NotifyError(res.data?.error || "Gagal menyimpan hari libur");
      }
    } catch (err: any) {
      NotifyError(err?.response?.data?.error || "Gagal menyimpan hari libur");
    } finally {
      setSavingHolidays(false);
    }
  };

  const handleStartEditHoliday = (item: any) => {
    setEditingOldDate(item.date);
    setNewHolidayDate(item.date);
    setNewHolidayName(item.description || "");
    setNewHolidayType(item.type || "Kantor");
    // Scroll smoothly to form
    const formElem = document.getElementById("holiday-form");
    if (formElem) {
      formElem.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleCancelEditHoliday = () => {
    setEditingOldDate(null);
    setNewHolidayDate("");
    setNewHolidayName("");
    setNewHolidayType("Kantor");
  };

  const handleDeleteHoliday = async (item: any) => {
    if (!confirm(`Hapus libur: "${item.description}" (${item.date})?`)) return;
    try {
      const res = await axios.post("/api/holidays", {
        action: "delete_one",
        date: item.date,
        year: holidayYear,
      });
      if (res.data?.success) {
        NotifySuccess("Hari libur berhasil dihapus dari database");
        setHolidaysList((prev) => prev.filter((h) => h.date !== item.date));
        if (editingOldDate === item.date) {
          handleCancelEditHoliday();
        }
      }
    } catch (err) {
      NotifyError("Gagal menghapus hari libur");
    }
  };

  const handleOptimizeDb = async () => {
    setOptimizing(true);
    try {
      const res = await axios.post("/api/optimize-db");
      if (res.data?.success) {
        setOptimizeResult(res.data);
        NotifySuccess(res.data.message || "Database berhasil dioptimasi!");
      } else {
        NotifyError(res.data?.error || "Gagal mengoptimasi database");
      }
    } catch (err: any) {
      NotifyError(
        err?.response?.data?.error ||
          err.message ||
          "Gagal mengoptimasi database",
      );
    } finally {
      setOptimizing(false);
    }
  };

  const handleSyncFifo = async () => {
    setSyncingFifo(true);
    try {
      const res = await axios.post("/api/fifosync");
      if (res.data?.success) {
        setFifoResult(res.data);
        NotifySuccess(
          res.data.message || "Sistem FIFO berhasil disinkronisasi!",
        );
      } else {
        NotifyError(res.data?.error || "Gagal sinkronisasi FIFO");
      }
    } catch (err: any) {
      NotifyError(
        err?.response?.data?.error ||
          err.message ||
          "Gagal sinkronisasi sistem FIFO",
      );
    } finally {
      setSyncingFifo(false);
    }
  };

  // Calculate budget total
  const MONTH_NAMES = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Ags",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];

  const totalBudgetCalculated =
    budgetViewMode === "uniform"
      ? Object.values(budgetMatrix).reduce(
          (sum, val) => sum + (Number(val) || 0) * 12,
          0,
        )
      : Object.keys(monthlyMatrix).reduce((acc, code) => {
          let posSum = 0;
          for (let m = 1; m <= 12; m++) {
            posSum += Number(monthlyMatrix[code]?.[m] || 0);
          }
          return acc + posSum;
        }, 0);

  const tabs = [
    { id: "general", label: "Umum & Tampilan", icon: HiOutlineCog6Tooth },
    { id: "budget", label: "Target Budget (POS)", icon: HiOutlineBanknotes },
    {
      id: "repair_target",
      label: "Target Perbaikan",
      icon: HiOutlineWrenchScrewdriver,
    },
    {
      id: "holidays",
      label: "Hari Libur & Kalender",
      icon: HiOutlineCalendarDays,
    },
    { id: "maintenance", label: "Database & FIFO", icon: HiOutlineCircleStack },
  ];

  const SettingsContent = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-stroke pb-4 dark:border-strokedark">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <HiOutlineCog6Tooth className="text-xl" />
          </div>
          <h1 className="text-xl font-bold text-black dark:text-white">
            Pengaturan Sistem
          </h1>
        </div>
        <p className="mt-1 text-xs text-body dark:text-bodydark">
          Konfigurasi preferensi tampilan, target alokasi budget tahunan, target
          perbaikan, kalender hari libur, dan pemeliharaan database.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto rounded-2xl border border-stroke bg-white p-1.5 shadow-sm dark:border-strokedark dark:bg-boxdark">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex min-w-[130px] flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition-all ${
                isActive
                  ? "bg-primary text-white shadow-md"
                  : "hover:bg-gray-100 text-body hover:text-black dark:text-bodydark dark:hover:bg-meta-4 dark:hover:text-white"
              }`}
            >
              <Icon className="text-base" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= TAB 1: UMUM & TAMPILAN ================= */}
      {activeTab === "general" && (
        <div className="space-y-6">
          {/* Setting Card 1: Tema Tampilan (Dark / Light Mode) */}
          <PageCard>
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3 border-b border-stroke/60 pb-3 dark:border-strokedark/60">
                <div>
                  <div className="flex items-center gap-2">
                    {colorMode === "dark" ? (
                      <HiOutlineMoon className="text-base text-primary" />
                    ) : (
                      <HiOutlineSun className="text-base text-warning" />
                    )}
                    <h2 className="text-sm font-bold text-black dark:text-white">
                      Tema Tampilan Aplikasi (Theme Mode)
                    </h2>
                  </div>
                  <p className="mt-0.5 text-xs text-body dark:text-bodydark">
                    Pilih mode warna tampilan antarmuka (terkunci di perangkat
                    ini).
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    colorMode === "dark"
                      ? "bg-primary/15 text-primary"
                      : "bg-warning/15 text-warning"
                  }`}
                >
                  {colorMode === "dark" ? "Mode Gelap" : "Mode Terang"}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
                {/* Option A: Light Mode */}
                <div
                  onClick={() => handleThemeChange("light")}
                  className={`group cursor-pointer rounded-2xl border p-4 transition-all ${
                    colorMode === "light"
                      ? "border-primary bg-primary/5 shadow-sm dark:border-primary dark:bg-primary/10"
                      : "hover:border-gray-400 border-stroke bg-white dark:border-strokedark dark:bg-boxdark"
                  }`}
                >
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-4 w-4 items-center justify-center rounded-full border-2 transition-all ${
                          colorMode === "light"
                            ? "border-primary bg-primary text-white"
                            : "border-gray-300 dark:border-meta-4"
                        }`}
                      >
                        {colorMode === "light" && (
                          <div className="h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="text-xs font-bold text-black dark:text-white">
                        Light Mode (Mode Terang)
                      </span>
                    </div>
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-warning/15 text-warning">
                      <HiOutlineSun className="text-base" />
                    </div>
                  </div>
                  <p className="pl-6 text-[11px] text-body dark:text-bodydark">
                    Latar putih bersih dengan kontras teks tajam, ideal untuk
                    penggunaan siang hari.
                  </p>
                </div>

                {/* Option B: Dark Mode */}
                <div
                  onClick={() => handleThemeChange("dark")}
                  className={`group cursor-pointer rounded-2xl border p-4 transition-all ${
                    colorMode === "dark"
                      ? "border-primary bg-primary/5 shadow-sm dark:border-primary dark:bg-primary/10"
                      : "hover:border-gray-400 border-stroke bg-white dark:border-strokedark dark:bg-boxdark"
                  }`}
                >
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-4 w-4 items-center justify-center rounded-full border-2 transition-all ${
                          colorMode === "dark"
                            ? "border-primary bg-primary text-white"
                            : "border-gray-300 dark:border-meta-4"
                        }`}
                      >
                        {colorMode === "dark" && (
                          <div className="h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="text-xs font-bold text-black dark:text-white">
                        Dark Mode (Mode Gelap)
                      </span>
                    </div>
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      <HiOutlineMoon className="text-base" />
                    </div>
                  </div>
                  <p className="pl-6 text-[11px] text-body dark:text-bodydark">
                    Latar gelap elegan, meminimalkan ketegangan mata di
                    lingkungan minim cahaya.
                  </p>
                </div>
              </div>
            </div>
          </PageCard>

          {/* Setting Card 2: Filter Status Suku Cadang */}
          <PageCard>
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3 border-b border-stroke/60 pb-3 dark:border-strokedark/60">
                <div>
                  <div className="flex items-center gap-2">
                    <HiOutlineCube className="text-base text-primary" />
                    <h2 className="text-sm font-bold text-black dark:text-white">
                      Visibilitas Status Suku Cadang (Spare Parts)
                    </h2>
                  </div>
                  <p className="mt-0.5 text-xs text-body dark:text-bodydark">
                    Tentukan data suku cadang yang ditampilkan pada daftar
                    inventaris gudang.
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                  {partStatusFilter === "all" ? "Semua Status" : "Hanya Aktif"}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
                <div
                  onClick={() => setPartStatusFilter("aktif")}
                  className={`group cursor-pointer rounded-2xl border p-4 transition-all ${
                    partStatusFilter === "aktif"
                      ? "border-primary bg-primary/5 shadow-sm dark:border-primary dark:bg-primary/10"
                      : "hover:border-gray-400 border-stroke bg-white dark:border-strokedark dark:bg-boxdark"
                  }`}
                >
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-4 w-4 items-center justify-center rounded-full border-2 transition-all ${
                          partStatusFilter === "aktif"
                            ? "border-primary bg-primary text-white"
                            : "border-gray-300 dark:border-meta-4"
                        }`}
                      >
                        {partStatusFilter === "aktif" && (
                          <div className="h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="text-xs font-bold text-black dark:text-white">
                        Hanya Tampilkan Status &quot;Aktif&quot;
                      </span>
                    </div>
                    <BsBoxSeam className="text-sm text-primary" />
                  </div>
                  <p className="pl-6 text-[11px] text-body dark:text-bodydark">
                    Menyembunyikan suku cadang yang sudah non-aktif atau
                    discontinued.
                  </p>
                </div>

                <div
                  onClick={() => setPartStatusFilter("all")}
                  className={`group cursor-pointer rounded-2xl border p-4 transition-all ${
                    partStatusFilter === "all"
                      ? "border-primary bg-primary/5 shadow-sm dark:border-primary dark:bg-primary/10"
                      : "hover:border-gray-400 border-stroke bg-white dark:border-strokedark dark:bg-boxdark"
                  }`}
                >
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-4 w-4 items-center justify-center rounded-full border-2 transition-all ${
                          partStatusFilter === "all"
                            ? "border-primary bg-primary text-white"
                            : "border-gray-300 dark:border-meta-4"
                        }`}
                      >
                        {partStatusFilter === "all" && (
                          <div className="h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="text-xs font-bold text-black dark:text-white">
                        Tampilkan Semua Status (Aktif &amp; Non-Aktif)
                      </span>
                    </div>
                    <HiOutlineCube className="text-sm text-primary" />
                  </div>
                  <p className="pl-6 text-[11px] text-body dark:text-bodydark">
                    Menampilkan seluruh katalog suku cadang untuk kebutuhan
                    audit &amp; history.
                  </p>
                </div>
              </div>
            </div>
          </PageCard>

          {/* Action button Tab 1 */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              disabled={savingGeneral}
              onClick={handleSaveGeneral}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-opacity-90 active:scale-[0.99] disabled:opacity-50"
            >
              <BsCheck2Circle className="text-sm" />
              {savingGeneral ? "Menyimpan..." : "Simpan Pengaturan Umum"}
            </button>
          </div>
        </div>
      )}

      {/* ================= TAB 2: TARGET BUDGET (POS) ================= */}
      {activeTab === "budget" && (
        <div className="space-y-6">
          <PageCard>
            <div className="space-y-4">
              {/* Header Card & Filter Tahun */}
              <div className="flex flex-col gap-3 border-b border-stroke/60 pb-3 dark:border-strokedark/60 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <HiOutlineBanknotes className="text-base text-primary" />
                    <h2 className="text-sm font-bold text-black dark:text-white">
                      Matrix Target Anggaran
                    </h2>
                  </div>
                  <p className="mt-0.5 text-xs text-body dark:text-bodydark">
                    Tiap kode disimpan per bulan (Jan - Des). Anda bisa input
                    per kode (otomatis copy ke 12 bulan) atau atur rinci per
                    bulan.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Mode Selector */}
                  <div className="bg-gray-100 flex rounded-xl border border-stroke p-1 dark:border-strokedark dark:bg-meta-4">
                    <button
                      type="button"
                      onClick={() => setBudgetViewMode("uniform")}
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                        budgetViewMode === "uniform"
                          ? "bg-white text-primary shadow-sm dark:bg-boxdark dark:text-white"
                          : "text-body hover:text-black dark:text-bodydark"
                      }`}
                    >
                      Bagi Rata (Tiap Kode)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBudgetViewMode("monthly")}
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                        budgetViewMode === "monthly"
                          ? "bg-white text-primary shadow-sm dark:bg-boxdark dark:text-white"
                          : "text-body hover:text-black dark:text-bodydark"
                      }`}
                    >
                      Rinci Per Bulan (12 Bln)
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-black dark:text-white">
                      Tahun:
                    </span>
                    <select
                      value={budgetYear}
                      onChange={(e) => setBudgetYear(Number(e.target.value))}
                      className="rounded-xl border border-stroke bg-white px-3 py-1.5 text-xs font-bold text-black shadow-sm outline-none transition focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    >
                      {[
                        currentYear - 2,
                        currentYear - 1,
                        currentYear,
                        currentYear + 1,
                        currentYear + 2,
                      ].map((yr) => (
                        <option key={yr} value={yr}>
                          Tahun {yr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {loadingBudget ? (
                <div className="py-12 text-center">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-r-transparent" />
                  <p className="mt-2 text-xs text-body dark:text-bodydark">
                    Memuat data anggaran...
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {budgetViewMode === "uniform" ? (
                    /* VIEW A: UNIFORM INPUT (1 Input per Pos -> Otomatis tercopy ke semua bulan saat disimpan) */
                    <div className="overflow-x-auto rounded-xl border border-stroke dark:border-strokedark">
                      <table className="w-full border-collapse text-left text-xs">
                        <thead>
                          <tr className="bg-gray-50 border-b border-stroke dark:border-strokedark dark:bg-meta-4/20">
                            <th className="px-4 py-3 font-bold text-black dark:text-white">
                              Kode POS
                            </th>
                            <th className="px-4 py-3 font-bold text-black dark:text-white">
                              Nama Pos Anggaran
                            </th>
                            <th className="px-4 py-3 font-bold text-black dark:text-white">
                              Kategori
                            </th>
                            <th className="px-4 py-3 text-right font-bold text-black dark:text-white">
                              Alokasi / Bulan (Rp)
                            </th>
                            <th className="px-4 py-3 text-right font-bold text-black dark:text-white">
                              Estimasi 1 Tahun (12 Bln)
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stroke dark:divide-strokedark">
                          {DEFAULT_POS_LIST.map((pos) => {
                            const currentMonthlyVal =
                              budgetMatrix[pos.code] ?? 0;
                            const estAnnual = currentMonthlyVal * 12;

                            return (
                              <tr
                                key={pos.code}
                                className="hover:bg-gray-50/60 transition-colors dark:hover:bg-meta-4/10"
                              >
                                <td className="px-4 py-3">
                                  <span className="font-mono rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                                    {pos.code}
                                  </span>
                                </td>
                                <td className="px-4 py-3 font-semibold text-black dark:text-white">
                                  {pos.name}
                                </td>
                                <td className="px-4 py-3 text-body dark:text-bodydark">
                                  {pos.category}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <div className="inline-flex items-center gap-1.5">
                                    <span className="font-mono text-xs text-body dark:text-bodydark">
                                      Rp
                                    </span>
                                    <input
                                      type="number"
                                      min="0"
                                      step="100000"
                                      value={
                                        currentMonthlyVal === 0
                                          ? ""
                                          : currentMonthlyVal
                                      }
                                      placeholder="0"
                                      onChange={(e) => {
                                        const num = Math.max(
                                          0,
                                          Number(e.target.value) || 0,
                                        );
                                        setBudgetMatrix((prev) => ({
                                          ...prev,
                                          [pos.code]: num,
                                        }));
                                        // Also update monthly matrix
                                        setMonthlyMatrix((prev) => {
                                          const copy = { ...prev };
                                          copy[pos.code] = {
                                            ...(copy[pos.code] || {}),
                                          };
                                          for (let m = 1; m <= 12; m++) {
                                            copy[pos.code][m] = num;
                                          }
                                          return copy;
                                        });
                                      }}
                                      className="font-mono w-44 rounded-xl border border-stroke bg-white px-3 py-1.5 text-right text-xs font-bold text-black outline-none transition focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
                                    />
                                  </div>
                                </td>
                                <td className="font-mono px-4 py-3 text-right font-bold text-black dark:text-white">
                                  Rp {estAnnual.toLocaleString("id-ID")}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="bg-gray-100/70 border-t-2 border-stroke font-bold dark:border-strokedark dark:bg-meta-4/30">
                            <td
                              colSpan={3}
                              className="px-4 py-3 text-right text-xs text-black dark:text-white"
                            >
                              Total Alokasi Budget Tahun {budgetYear} (12
                              Bulan):
                            </td>
                            <td className="font-mono px-4 py-3 text-right text-xs text-body dark:text-bodydark">
                              Rp{" "}
                              {(totalBudgetCalculated / 12).toLocaleString(
                                "id-ID",
                              )}
                              /bln
                            </td>
                            <td className="font-mono px-4 py-3 text-right text-sm text-primary">
                              Rp {totalBudgetCalculated.toLocaleString("id-ID")}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  ) : (
                    /* VIEW B: MATRIX 12 BULAN RINCI */
                    <div className="overflow-x-auto rounded-xl border border-stroke dark:border-strokedark">
                      <table className="w-full border-collapse whitespace-nowrap text-left text-xs">
                        <thead>
                          <tr className="bg-gray-50 border-b border-stroke dark:border-strokedark dark:bg-meta-4/20">
                            <th className="bg-gray-50 sticky left-0 z-10 px-3 py-3 font-bold text-black dark:bg-boxdark dark:text-white">
                              POS
                            </th>
                            {MONTH_NAMES.map((mName, i) => (
                              <th
                                key={mName}
                                className="px-2 py-3 text-center font-bold text-black dark:text-white"
                              >
                                {mName}
                              </th>
                            ))}
                            <th className="px-3 py-3 text-right font-bold text-black dark:text-white">
                              Total 1 Thn
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stroke dark:divide-strokedark">
                          {DEFAULT_POS_LIST.map((pos) => {
                            const posMonths = monthlyMatrix[pos.code] || {};
                            let posYearTotal = 0;
                            for (let m = 1; m <= 12; m++) {
                              posYearTotal += Number(posMonths[m] || 0);
                            }

                            return (
                              <tr
                                key={pos.code}
                                className="hover:bg-gray-50/60 transition-colors dark:hover:bg-meta-4/10"
                              >
                                <td className="sticky left-0 z-10 bg-white px-3 py-2 font-bold text-black dark:bg-boxdark dark:text-white">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono text-primary">
                                      {pos.code}
                                    </span>
                                    <span className="hidden text-[10px] text-body dark:text-bodydark sm:inline">
                                      {pos.name}
                                    </span>
                                  </div>
                                </td>
                                {MONTH_NAMES.map((_, idx) => {
                                  const mNum = idx + 1;
                                  const val = posMonths[mNum] ?? 0;
                                  return (
                                    <td key={mNum} className="px-1 py-1.5">
                                      <input
                                        type="number"
                                        min="0"
                                        step="100000"
                                        value={val === 0 ? "" : val}
                                        placeholder="0"
                                        onChange={(e) => {
                                          const num = Math.max(
                                            0,
                                            Number(e.target.value) || 0,
                                          );
                                          setMonthlyMatrix((prev) => ({
                                            ...prev,
                                            [pos.code]: {
                                              ...(prev[pos.code] || {}),
                                              [mNum]: num,
                                            },
                                          }));
                                        }}
                                        className="font-mono w-24 rounded-lg border border-stroke bg-white px-2 py-1 text-right text-[11px] font-semibold text-black outline-none transition focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
                                      />
                                    </td>
                                  );
                                })}
                                <td className="font-mono px-3 py-2 text-right font-bold text-primary">
                                  Rp {posYearTotal.toLocaleString("id-ID")}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="bg-gray-100/70 border-t-2 border-stroke font-bold dark:border-strokedark dark:bg-meta-4/30">
                            <td className="bg-gray-100/70 sticky left-0 z-10 px-3 py-2.5 text-xs text-black dark:bg-meta-4 dark:text-white">
                              Total Budget:
                            </td>
                            {MONTH_NAMES.map((_, idx) => {
                              const mNum = idx + 1;
                              let monthSum = 0;
                              DEFAULT_POS_LIST.forEach((p) => {
                                monthSum += Number(
                                  monthlyMatrix[p.code]?.[mNum] || 0,
                                );
                              });
                              return (
                                <td
                                  key={mNum}
                                  className="font-mono px-1 py-2.5 text-right text-[10px] text-black dark:text-white"
                                >
                                  Rp {monthSum.toLocaleString("id-ID")}
                                </td>
                              );
                            })}
                            <td className="font-mono px-3 py-2.5 text-right text-xs text-primary">
                              Rp {totalBudgetCalculated.toLocaleString("id-ID")}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}

                  <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-end">
                    {/* <span className="text-[11px] text-body dark:text-bodydark">
                      *Saat disimpan, setiap nominal otomatis dicatat ke tabel <strong>Budget_Set</strong> per bulan (1 s/d 12) dan langsung menjadi tolok ukur target di Dashboard.
                    </span> */}
                    <button
                      type="button"
                      disabled={savingBudget}
                      onClick={handleSaveBudget}
                      className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white shadow-md transition hover:bg-opacity-90 disabled:opacity-50"
                    >
                      {savingBudget
                        ? "Menyimpan ke Semua Bulan..."
                        : "Simpan Perubahan Budget"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </PageCard>
        </div>
      )}

      {/* ================= TAB 3: TARGET PERBAIKAN (RTK & RTM) ================= */}
      {activeTab === "repair_target" && (
        <div className="space-y-6">
          <PageCard>
            <div className="space-y-4">
              {/* Header Card & Filter Tahun */}
              <div className="flex flex-col gap-3 border-b border-stroke/60 pb-3 dark:border-strokedark/60 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <HiOutlineWrenchScrewdriver className="text-base text-primary" />
                    <h2 className="text-sm font-bold text-black dark:text-white">
                      Target Durasi Perbaikan / Repair Time
                    </h2>
                  </div>
                  <p className="mt-0.5 text-xs text-body dark:text-bodydark">
                    Tetapkan standar target maksimal durasi perbaikan Kendaraan
                    dan Mesin Produksi dalam satuan Jam.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Mode Selector */}
                  <div className="bg-gray-100 flex rounded-xl border border-stroke p-1 dark:border-strokedark dark:bg-meta-4">
                    <button
                      type="button"
                      onClick={() => setRepairViewMode("uniform")}
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                        repairViewMode === "uniform"
                          ? "bg-white text-primary shadow-sm dark:bg-boxdark dark:text-white"
                          : "text-body hover:text-black dark:text-bodydark"
                      }`}
                    >
                      Bagi Rata (Tiap Kode)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRepairViewMode("monthly")}
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                        repairViewMode === "monthly"
                          ? "bg-white text-primary shadow-sm dark:bg-boxdark dark:text-white"
                          : "text-body hover:text-black dark:text-bodydark"
                      }`}
                    >
                      Rinci Per Bulan (12 Bln)
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-black dark:text-white">
                      Tahun:
                    </span>
                    <select
                      value={repairYear}
                      onChange={(e) => setRepairYear(Number(e.target.value))}
                      className="rounded-xl border border-stroke bg-white px-3 py-1.5 text-xs font-bold text-black shadow-sm outline-none transition focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    >
                      {[
                        currentYear - 2,
                        currentYear - 1,
                        currentYear,
                        currentYear + 1,
                        currentYear + 2,
                      ].map((yr) => (
                        <option key={yr} value={yr}>
                          Tahun {yr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {loadingRepair ? (
                <div className="py-12 text-center">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-r-transparent" />
                  <p className="mt-2 text-xs text-body dark:text-bodydark">
                    Memuat data target perbaikan...
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {repairViewMode === "uniform" ? (
                    /* VIEW A: UNIFORM INPUT (1 Input per Pos Target -> Otomatis tercopy ke semua bulan saat disimpan) */
                    <div className="overflow-x-auto rounded-xl border border-stroke dark:border-strokedark">
                      <table className="w-full border-collapse text-left text-xs">
                        <thead>
                          <tr className="bg-gray-50 border-b border-stroke dark:border-strokedark dark:bg-meta-4/20">
                            <th className="px-4 py-3 font-bold text-black dark:text-white">
                              Kode
                            </th>
                            <th className="px-4 py-3 font-bold text-black dark:text-white">
                              Deskripsi Target Perbaikan
                            </th>
                            <th className="px-4 py-3 font-bold text-black dark:text-white">
                              Kategori
                            </th>
                            <th className="px-4 py-3 text-right font-bold text-black dark:text-white">
                              Target Perbaikan / Bulan
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stroke dark:divide-strokedark">
                          {REPAIR_TARGET_LIST.map((item) => {
                            const currentVal =
                              repairMatrix[item.code] ?? item.defaultVal ?? 0;

                            return (
                              <tr
                                key={item.code}
                                className="hover:bg-gray-50/60 transition-colors dark:hover:bg-meta-4/10"
                              >
                                <td className="px-4 py-3">
                                  <span className="font-mono rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                                    {item.code}
                                  </span>
                                </td>
                                <td className="px-4 py-3 font-semibold text-black dark:text-white">
                                  {item.name}
                                </td>
                                <td className="px-4 py-3 text-body dark:text-bodydark">
                                  {item.description}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <div className="inline-flex items-center gap-1.5">
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.5"
                                      value={currentVal === 0 ? "" : currentVal}
                                      placeholder="0"
                                      onChange={(e) => {
                                        const num = Math.max(
                                          0,
                                          Number(e.target.value) || 0,
                                        );
                                        setRepairMatrix((prev) => ({
                                          ...prev,
                                          [item.code]: num,
                                        }));
                                        setMonthlyRepairMatrix((prev) => {
                                          const copy = { ...prev };
                                          copy[item.code] = {
                                            ...(copy[item.code] || {}),
                                          };
                                          for (let m = 1; m <= 12; m++) {
                                            copy[item.code][m] = num;
                                          }
                                          return copy;
                                        });
                                      }}
                                      className="font-mono w-32 rounded-xl border border-stroke bg-white px-3 py-1.5 text-right text-xs font-bold text-black outline-none transition focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
                                    />
                                    <span className="font-mono text-xs text-body dark:text-bodydark">
                                      {item.unit}
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    /* VIEW B: MATRIX 12 BULAN RINCI */
                    <div className="overflow-x-auto rounded-xl border border-stroke dark:border-strokedark">
                      <table className="w-full border-collapse whitespace-nowrap text-left text-xs">
                        <thead>
                          <tr className="bg-gray-50 border-b border-stroke dark:border-strokedark dark:bg-meta-4/20">
                            <th className="bg-gray-50 sticky left-0 z-10 px-3 py-3 font-bold text-black dark:bg-boxdark dark:text-white">
                              Kode
                            </th>
                            {MONTH_NAMES.map((mName) => (
                              <th
                                key={mName}
                                className="px-2 py-3 text-center font-bold text-black dark:text-white"
                              >
                                {mName}
                              </th>
                            ))}
                            <th className="px-3 py-3 text-right font-bold text-black dark:text-white">
                              Rata-rata 1 Thn
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stroke dark:divide-strokedark">
                          {REPAIR_TARGET_LIST.map((item) => {
                            const posMonths =
                              monthlyRepairMatrix[item.code] || {};
                            let posYearTotal = 0;
                            for (let m = 1; m <= 12; m++) {
                              posYearTotal += Number(posMonths[m] || 0);
                            }
                            const avgVal = (posYearTotal / 12).toFixed(1);

                            return (
                              <tr
                                key={item.code}
                                className="hover:bg-gray-50/60 transition-colors dark:hover:bg-meta-4/10"
                              >
                                <td className="sticky left-0 z-10 bg-white px-3 py-2 font-bold text-black dark:bg-boxdark dark:text-white">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono text-primary">
                                      {item.code}
                                    </span>
                                    <span className="hidden text-[10px] text-body dark:text-bodydark sm:inline">
                                      {item.name}
                                    </span>
                                  </div>
                                </td>
                                {MONTH_NAMES.map((_, idx) => {
                                  const mNum = idx + 1;
                                  const val = posMonths[mNum] ?? 0;
                                  return (
                                    <td key={mNum} className="px-1 py-1.5">
                                      <input
                                        type="number"
                                        min="0"
                                        step="0.5"
                                        value={val === 0 ? "" : val}
                                        placeholder="0"
                                        onChange={(e) => {
                                          const num = Math.max(
                                            0,
                                            Number(e.target.value) || 0,
                                          );
                                          setMonthlyRepairMatrix((prev) => ({
                                            ...prev,
                                            [item.code]: {
                                              ...(prev[item.code] || {}),
                                              [mNum]: num,
                                            },
                                          }));
                                        }}
                                        className="font-mono w-20 rounded-lg border border-stroke bg-white px-2 py-1 text-right text-[11px] font-semibold text-black outline-none transition focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
                                      />
                                    </td>
                                  );
                                })}
                                <td className="font-mono px-3 py-2 text-right font-bold text-primary">
                                  {avgVal} Jam/bln
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-end">
                    <button
                      type="button"
                      disabled={savingRepair}
                      onClick={handleSaveRepairTarget}
                      className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white shadow-md transition hover:bg-opacity-90 disabled:opacity-50"
                    >
                      {savingRepair
                        ? "Menyimpan ke Budget_Set..."
                        : "Simpan Target Perbaikan"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </PageCard>
        </div>
      )}

      {/* ================= TAB 4: HARI LIBUR & KALENDER ================= */}
      {activeTab === "holidays" && (
        <div className="space-y-6">
          <PageCard>
            <div className="space-y-5">
              {/* Header & Controls */}
              <div className="flex flex-col gap-3 border-b border-stroke/60 pb-4 dark:border-strokedark/60 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <HiOutlineCalendarDays className="text-base text-primary" />
                    <h2 className="text-sm font-bold text-black dark:text-white">
                      Pengaturan Kalender Hari Libur
                    </h2>
                  </div>
                  <p className="mt-0.5 text-xs text-body dark:text-bodydark">
                    Kelola hari libur nasional dan hari libur khusus
                    kantor/pabrik untuk perhitungan jam kerja dan utilitas
                    mesin.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-black dark:text-white">
                      Tahun:
                    </span>
                    <select
                      value={holidayYear}
                      onChange={(e) => setHolidayYear(Number(e.target.value))}
                      className="rounded-xl border border-stroke bg-white px-3 py-1.5 text-xs font-bold text-black shadow-sm outline-none transition focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    >
                      {[
                        currentYear - 1,
                        currentYear,
                        currentYear + 1,
                        currentYear + 2,
                      ].map((yr) => (
                        <option key={yr} value={yr}>
                          Tahun {yr}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    disabled={syncingHolidays}
                    onClick={handleSyncNationalHolidays}
                    className="flex items-center gap-1.5 rounded-xl border border-primary bg-primary/10 px-3.5 py-1.5 text-xs font-bold text-primary transition hover:bg-primary hover:text-white disabled:opacity-50"
                  >
                    <HiOutlineCloudArrowDown className="text-base" />
                    {syncingHolidays
                      ? "Mengambil Data..."
                      : "Ambil Libur Nasional Online"}
                  </button>
                </div>
              </div>

              {/* Form Tambah / Edit Hari Libur */}
              <form
                id="holiday-form"
                onSubmit={handleSaveHolidayItem}
                className={`rounded-2xl border p-4 transition-all ${
                  editingOldDate
                    ? "border-primary bg-primary/5 dark:border-primary dark:bg-primary/10"
                    : "bg-gray-50/70 border-stroke dark:border-strokedark dark:bg-meta-4/20"
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-black dark:text-white">
                    {editingOldDate ? (
                      <>
                        <HiOutlinePencilSquare className="text-base text-primary" />
                        <span>Edit Hari Libur ({editingOldDate})</span>
                      </>
                    ) : (
                      <>
                        <HiOutlinePlus className="text-base text-primary" />
                        <span>Tambah Hari Libur Kantor / Khusus</span>
                      </>
                    )}
                  </div>
                  {editingOldDate && (
                    <button
                      type="button"
                      onClick={handleCancelEditHoliday}
                      className="flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-meta-4"
                    >
                      <HiOutlineXMark />
                      Batal Edit
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-body dark:text-bodydark">
                      Tanggal Libur
                    </label>
                    <input
                      type="date"
                      required
                      value={newHolidayDate}
                      onChange={(e) => setNewHolidayDate(e.target.value)}
                      className="w-full rounded-xl border border-stroke bg-white px-3 py-1.5 text-xs font-semibold text-black outline-none transition focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-[11px] font-medium text-body dark:text-bodydark">
                      Nama / Keterangan Libur
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Cuti Bersama Pabrik, Maintenance Tahunan"
                      value={newHolidayName}
                      onChange={(e) => setNewHolidayName(e.target.value)}
                      className="w-full rounded-xl border border-stroke bg-white px-3 py-1.5 text-xs text-black outline-none transition focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-body dark:text-bodydark">
                      Jenis Libur
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={newHolidayType}
                        onChange={(e) => setNewHolidayType(e.target.value)}
                        className="w-full rounded-xl border border-stroke bg-white px-3 py-1.5 text-xs font-semibold text-black outline-none transition focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
                      >
                        <option value="Kantor">Libur Kantor / Pabrik</option>
                        <option value="Nasional">Libur Nasional</option>
                        <option value="Cuti Bersama">Cuti Bersama</option>
                      </select>
                      <button
                        type="submit"
                        disabled={savingHolidays}
                        className="shrink-0 rounded-xl bg-primary px-4 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-opacity-90 disabled:opacity-50"
                      >
                        {editingOldDate ? "Simpan" : "Tambah"}
                      </button>
                    </div>
                  </div>
                </div>
              </form>

              {/* Tabel Daftar Hari Libur */}
              {loadingHolidays ? (
                <div className="py-12 text-center">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-r-transparent" />
                  <p className="mt-2 text-xs text-body dark:text-bodydark">
                    Memuat kalender libur...
                  </p>
                </div>
              ) : holidaysList.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-stroke p-8 text-center text-xs text-body dark:border-strokedark dark:text-bodydark">
                  Belum ada data hari libur untuk tahun {holidayYear}. Silakan
                  klik &quot;Ambil Libur Nasional Online&quot; atau tambahkan
                  libur kantor secara manual.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-stroke dark:border-strokedark">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-stroke dark:border-strokedark dark:bg-meta-4/20">
                        <th className="px-4 py-2.5 font-bold text-black dark:text-white">
                          Tanggal
                        </th>
                        <th className="px-4 py-2.5 font-bold text-black dark:text-white">
                          Hari
                        </th>
                        <th className="px-4 py-2.5 font-bold text-black dark:text-white">
                          Keterangan Hari Libur
                        </th>
                        <th className="px-4 py-2.5 font-bold text-black dark:text-white">
                          Kategori
                        </th>
                        <th className="px-4 py-2.5 text-right font-bold text-black dark:text-white">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stroke dark:divide-strokedark">
                      {holidaysList.map((item, idx) => {
                        const dateObj = new Date(item.date);
                        const dayName = isNaN(dateObj.getTime())
                          ? ""
                          : dateObj.toLocaleDateString("id-ID", {
                              weekday: "long",
                            });
                        const isNat =
                          (item.type || "").toLowerCase() === "nasional";

                        return (
                          <tr
                            key={item.date || idx}
                            className={`hover:bg-gray-50/60 transition-colors dark:hover:bg-meta-4/10 ${
                              editingOldDate === item.date
                                ? "bg-primary/5 dark:bg-primary/10"
                                : ""
                            }`}
                          >
                            <td className="font-mono px-4 py-2.5 font-semibold text-black dark:text-white">
                              {item.date}
                            </td>
                            <td className="px-4 py-2.5 text-body dark:text-bodydark">
                              {dayName}
                            </td>
                            <td className="px-4 py-2.5 font-medium text-black dark:text-white">
                              {item.description || "Hari Libur"}
                            </td>
                            <td className="px-4 py-2.5">
                              <span
                                className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                  isNat
                                    ? "bg-rose-500/10 text-rose-500"
                                    : "bg-primary/10 text-primary"
                                }`}
                              >
                                {item.type || "Nasional"}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleStartEditHoliday(item)}
                                  className="rounded-lg p-1.5 text-slate-500 transition hover:bg-primary/10 hover:text-primary dark:text-slate-400 dark:hover:bg-meta-4"
                                  title="Edit hari libur"
                                >
                                  <HiOutlinePencilSquare className="text-base" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteHoliday(item)}
                                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-meta-4"
                                  title="Hapus hari libur"
                                >
                                  <HiOutlineTrash className="text-base" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </PageCard>
        </div>
      )}

      {/* ================= TAB 4: DATABASE & FIFO ================= */}
      {activeTab === "maintenance" && (
        <div className="space-y-6">
          {/* Card: Optimasi Database */}
          <PageCard>
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3 border-b border-stroke/60 pb-3 dark:border-strokedark/60">
                <div>
                  <div className="flex items-center gap-2">
                    <HiOutlineBolt className="text-base text-warning" />
                    <h2 className="text-sm font-bold text-black dark:text-white">
                      Optimasi Database &amp; Performa Indeks (Performance
                      Engine)
                    </h2>
                  </div>
                  <p className="mt-0.5 text-xs text-body dark:text-bodydark">
                    Terapkan indeks performa tinggi pada query-query penting
                    transaksi stok, spare parts, dan tiket servis.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={optimizing}
                  onClick={handleOptimizeDb}
                  className="flex shrink-0 items-center gap-1.5 rounded-xl bg-warning px-4 py-2 text-xs font-bold text-white shadow-md transition-all hover:bg-opacity-90 active:scale-[0.99] disabled:opacity-50"
                >
                  <HiOutlineBolt className="text-sm" />
                  {optimizing
                    ? "Mengoptimasi..."
                    : "Jalankan Optimasi Database"}
                </button>
              </div>

              {optimizeResult && (
                <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 text-xs dark:bg-warning/10">
                  <div className="mb-2 flex items-center gap-2 font-bold text-warning">
                    <HiOutlineCheckCircle className="text-base" />
                    <span>{optimizeResult.message}</span>
                  </div>
                  <div className="text-[11px] text-body dark:text-bodydark">
                    Total Indeks Berhasil Dibuat:{" "}
                    <strong>{optimizeResult.summary?.createdCount || 0}</strong>{" "}
                    • Sudah Terpasang Sebelumnya:{" "}
                    <strong>
                      {optimizeResult.summary?.alreadyExistedCount || 0}
                    </strong>
                  </div>
                </div>
              )}
            </div>
          </PageCard>

          {/* Card: Sinkronisasi FIFO */}
          <PageCard>
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3 border-b border-stroke/60 pb-3 dark:border-strokedark/60">
                <div>
                  <div className="flex items-center gap-2">
                    <HiOutlineCalculator className="text-base text-success" />
                    <h2 className="text-sm font-bold text-black dark:text-white">
                      Sinkronisasi &amp; Rekalkulasi FIFO (First-In, First-Out)
                    </h2>
                  </div>
                  <p className="mt-0.5 text-xs text-body dark:text-bodydark">
                    Membangun ulang struktur batch FIFO dari riwayat transaksi
                    masuk dan alokasikan pengeluaran stok.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={syncingFifo}
                  onClick={handleSyncFifo}
                  className="flex shrink-0 items-center gap-1.5 rounded-xl bg-success px-4 py-2 text-xs font-bold text-white shadow-md transition-all hover:bg-opacity-90 active:scale-[0.99] disabled:opacity-50"
                >
                  <HiOutlineArrowPath className="text-sm" />
                  {syncingFifo ? "Menyinkronkan..." : "Sinkronisasi Layer FIFO"}
                </button>
              </div>

              {fifoResult && (
                <div className="rounded-xl border border-success/30 bg-success/5 p-4 text-xs dark:bg-success/10">
                  <div className="mb-2 flex items-center gap-2 font-bold text-success">
                    <HiOutlineCheckCircle className="text-base" />
                    <span>{fifoResult.message}</span>
                  </div>
                  <div className="text-[11px] text-body dark:text-bodydark">
                    Total Batch Terdaftar:{" "}
                    <strong>
                      {fifoResult.summary?.totalBatchesCreated || 0}
                    </strong>{" "}
                    • Transaksi Keluar Tervalidasi:{" "}
                    <strong>
                      {fifoResult.summary?.allocatedOutCount || 0}
                    </strong>{" "}
                    • Total Nilai Pengeluaran (COGS):{" "}
                    <strong className="text-success">
                      Rp{" "}
                      {Number(
                        fifoResult.summary?.totalValuationOut || 0,
                      ).toLocaleString("id-ID")}
                    </strong>
                  </div>
                </div>
              )}
            </div>
          </PageCard>
        </div>
      )}
    </div>
  );

  return (
    <UserAuth>
      <div className="min-h-screen bg-whiten text-body transition-colors duration-200 dark:bg-boxdark-2 dark:text-bodydark">
        {isSmallScreen ? (
          /* ================= MOBILE VIEW ================= */
          <div className="flex min-h-screen flex-col pb-20">
            {/* Top Bar */}
            <div className="sticky top-0 z-40 flex items-center justify-between border-b border-stroke/60 bg-white/80 px-4 py-3 backdrop-blur-md dark:border-strokedark/60 dark:bg-boxdark/80">
              <button
                type="button"
                onClick={() => router.back()}
                className="bg-gray-100 hover:bg-gray-200 flex h-9 w-9 items-center justify-center rounded-xl text-black transition-colors dark:bg-meta-4 dark:text-white"
              >
                <HiArrowLeft className="text-lg" />
              </button>
              <span className="text-xs font-bold text-black dark:text-white">
                Pengaturan Sistem
              </span>
              <div className="w-9" />
            </div>

            {loading ? (
              <PageLoader />
            ) : (
              <div className="p-4">
                <SettingsContent />
              </div>
            )}
          </div>
        ) : (
          /* ================= DESKTOP VIEW ================= */
          <DefaultLayout>
            {loading ? (
              <PageLoader />
            ) : (
              <div className="mx-auto max-w-5xl">
                <SettingsContent />
              </div>
            )}
          </DefaultLayout>
        )}
      </div>
    </UserAuth>
  );
}
