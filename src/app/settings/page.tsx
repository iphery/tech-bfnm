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
} from "react-icons/hi2";
import { BsBoxSeam, BsCheck2Circle } from "react-icons/bs";

export default function SettingsPage() {
  const router = useRouter();
  const isSmallScreen = useMediaQuery({ query: "(max-width: 640px)" });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizeResult, setOptimizeResult] = useState<any>(null);
  const [partStatusFilter, setPartStatusFilter] = useState("aktif");
  const [colorMode, setColorMode] = useColorMode();

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

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleThemeChange = async (theme: "light" | "dark") => {
    setColorMode(theme);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("color-theme", JSON.stringify(theme));
        if (theme === "dark") {
          document.documentElement.classList.add("dark");
          document.body.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
          document.body.classList.remove("dark");
        }
      } catch (err) {
        console.error("Failed to set theme:", err);
      }
    }

    try {
      await axios.post("/api/systemsettings", {
        color_theme: theme,
        part_status_filter: partStatusFilter,
      });
      NotifySuccess(
        `Tema berhasil diubah dan dikunci ke ${theme === "dark" ? "Mode Gelap (Dark)" : "Mode Terang (Light)"}`,
      );
    } catch (err) {
      console.error("Failed to sync theme with server:", err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axios.post("/api/systemsettings", {
        part_status_filter: partStatusFilter,
        color_theme: colorMode,
      });

      if (res.status === 200) {
        NotifySuccess("Pengaturan sistem berhasil disimpan");
        if (typeof window !== "undefined") {
          localStorage.setItem("part_status_filter", partStatusFilter);
          localStorage.setItem("color-theme", JSON.stringify(colorMode));
        }
      }
    } catch (e) {
      NotifyError("Gagal menyimpan pengaturan sistem");
      console.error(e);
    } finally {
      setSaving(false);
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

  const SettingsContent = () => (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stroke pb-4 dark:border-strokedark">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <HiOutlineCog6Tooth className="text-xl" />
            </div>
            <h1 className="text-xl font-bold text-black dark:text-white">
              Pengaturan Sistem
            </h1>
          </div>
          <p className="mt-1 text-xs text-body dark:text-bodydark">
            Konfigurasi preferensi tampilan tema (Dark / Light) dan kebijakan
            visibilitas data sistem
          </p>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-opacity-90 active:scale-[0.99] disabled:opacity-50"
        >
          {saving ? "Menyimpan..." : "Simpan Pengaturan"}
        </button>
      </div>

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
                Pilih mode warna tampilan antarmuka. Pilihan tema ini akan
                dikunci secara permanen pada perangkat dan browser ini walaupun
                halaman ditutup atau dibuka kembali.
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                colorMode === "dark"
                  ? "bg-primary/15 text-primary"
                  : "bg-warning/15 text-warning"
              }`}
            >
              {colorMode === "dark"
                ? "Mode Gelap (Terkunci)"
                : "Mode Terang (Terkunci)"}
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
                  <div className="flex items-center gap-1.5">
                    <HiOutlineSun className="text-base text-warning" />
                    <h3 className="text-xs font-bold text-black dark:text-white">
                      Mode Terang (Light Mode)
                    </h3>
                  </div>
                </div>
                {colorMode === "light" && (
                  <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                    Aktif
                  </span>
                )}
              </div>
              <p className="pl-6 text-xs leading-relaxed text-body dark:text-bodydark">
                Latar belakang terang bersih dengan teks gelap berkontras
                tinggi. Standar untuk penggunaan di ruangan atau lingkungan
                dengan pencahayaan terang.
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
                  <div className="flex items-center gap-1.5">
                    <HiOutlineMoon className="text-base text-primary" />
                    <h3 className="text-xs font-bold text-black dark:text-white">
                      Mode Gelap (Dark Mode)
                    </h3>
                  </div>
                </div>
                {colorMode === "dark" && (
                  <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                    Aktif & Terkunci
                  </span>
                )}
              </div>
              <p className="pl-6 text-xs leading-relaxed text-body dark:text-bodydark">
                Latar belakang gelap pekat (Dark Slate/Navy) yang ramah di mata,
                mengurangi kelelahan visual, dan hemat konsumsi daya layar untuk
                operasional jangka panjang.
              </p>
            </div>
          </div>
        </div>
      </PageCard>

      {/* Setting Card 2: Part Status Visibility */}
      <PageCard>
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3 border-b border-stroke/60 pb-3 dark:border-strokedark/60">
            <div>
              <div className="flex items-center gap-2">
                <BsBoxSeam className="text-base text-primary" />
                <h2 className="text-sm font-bold text-black dark:text-white">
                  Visibilitas Status Suku Cadang (Inventory)
                </h2>
              </div>
              <p className="mt-0.5 text-xs text-body dark:text-bodydark">
                Menentukan kriteria suku cadang yang dimunculkan pada daftar
                stok, mutasi, kartu stok, opname, dan formulir servis di seluruh
                aplikasi.
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                partStatusFilter === "aktif"
                  ? "bg-success/15 text-success"
                  : "bg-warning/15 text-warning"
              }`}
            >
              {partStatusFilter === "aktif"
                ? "Hanya Aktif"
                : "Aktif & Discontinue"}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
            {/* Option A: Hanya Aktif */}
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
                  <h3 className="text-xs font-bold text-black dark:text-white">
                    Hanya Suku Cadang Aktif (Default)
                  </h3>
                </div>
                <span className="rounded bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success">
                  Rekomendasi
                </span>
              </div>
              <p className="pl-6 text-xs leading-relaxed text-body dark:text-bodydark">
                Hanya menampilkan suku cadang yang berstatus{" "}
                <strong>&quot;Aktif&quot;</strong>. Suku cadang berstatus{" "}
                <strong>&quot;Discontinue&quot;</strong> akan otomatis
                disembunyikan dari katalog, pemilihan part pada servis, dan
                kartu stok.
              </p>
            </div>

            {/* Option B: Semua (Aktif & Discontinue) */}
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
                  <h3 className="text-xs font-bold text-black dark:text-white">
                    Semua Suku Cadang (Termasuk Discontinue)
                  </h3>
                </div>
                <span className="rounded bg-warning/10 px-2 py-0.5 text-[10px] font-bold text-warning">
                  Arsip Penuh
                </span>
              </div>
              <p className="pl-6 text-xs leading-relaxed text-body dark:text-bodydark">
                Menampilkan seluruh suku cadang tanpa memfilter status, termasuk
                suku cadang yang sudah tidak diproduksi /{" "}
                <strong>&quot;Discontinue&quot;</strong> untuk kebutuhan
                pengecekan arsip riwayat mutasi lampau.
              </p>
            </div>
          </div>
        </div>
      </PageCard>

      {/* Setting Card 3: Optimasi & Performa Database */}
      <PageCard>
        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-stroke/60 pb-3 dark:border-strokedark/60">
            <div>
              <div className="flex items-center gap-2">
                <HiOutlineCircleStack className="text-base text-primary" />
                <h2 className="text-sm font-bold text-black dark:text-white">
                  Performa & Optimasi Database
                </h2>
              </div>
              <p className="mt-1 text-xs text-body dark:text-bodydark">
                Percepat query inventaris, simulasi stok, riwayat mesin, dan
                dashboard dengan index otomatis
              </p>
            </div>

            <button
              type="button"
              disabled={optimizing}
              onClick={handleOptimizeDb}
              className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-bold text-primary transition-all hover:bg-primary/20 active:scale-[0.99] disabled:opacity-50"
            >
              <HiOutlineBolt
                className={`text-sm ${optimizing ? "animate-spin" : ""}`}
              />
              <span>
                {optimizing ? "Mengoptimasi..." : "Optimasi Database Sekarang"}
              </span>
            </button>
          </div>

          <div className="bg-gray-50 space-y-2 rounded-xl p-4 text-xs dark:bg-meta-4/20">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-black dark:text-white">
                Status Pemeliharaan MySQL:
              </span>
              <span className="rounded bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success">
                Auto-Indexing Ready
              </span>
            </div>
            {/* <p className="text-[11px] text-body dark:text-bodydark leading-relaxed">
              Optimasi ini menambahkan index kecepatan tinggi pada tabel <code>stock_summary</code>, <code>stockin</code>, <code>stockout</code>, <code>order_detail</code>, <code>order_main</code>, <code>Request</code>, dan <code>parts</code>, serta memperbarui statistik perencana kueri (<code>ANALYZE TABLE</code>) agar kueri tidak lelet.
            </p> */}

            {optimizeResult && (
              <div className="mt-3 space-y-1 rounded-lg border border-stroke bg-white p-3 text-xs dark:border-strokedark dark:bg-boxdark">
                <div className="flex items-center gap-2 font-bold text-success">
                  <BsCheck2Circle className="text-base" />
                  <span>{optimizeResult.message}</span>
                </div>
                <div className="text-[11px] text-body dark:text-bodydark">
                  Indeks Baru:{" "}
                  <strong>
                    {optimizeResult.summary?.new_indexes_created || 0}
                  </strong>{" "}
                  • Indeks Sudah Ada:{" "}
                  <strong>
                    {optimizeResult.summary?.already_existing_indexes || 0}
                  </strong>{" "}
                  • Tabel Dianalisis:{" "}
                  <strong>
                    {optimizeResult.details?.analyzed_tables?.length || 0}
                  </strong>
                </div>
              </div>
            )}
          </div>
        </div>
      </PageCard>
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
