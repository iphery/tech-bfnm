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

// Icons
import {
  HiArrowLeft,
  HiOutlineCheckCircle,
  HiOutlineCube,
  HiOutlineCog6Tooth,
} from "react-icons/hi2";
import { BsBoxSeam, BsCheck2Circle } from "react-icons/bs";

export default function SettingsPage() {
  const router = useRouter();
  const isSmallScreen = useMediaQuery({ query: "(max-width: 640px)" });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [partStatusFilter, setPartStatusFilter] = useState("aktif");

  const fetchSettings = async () => {
    try {
      const res = await axios.get("/api/systemsettings");
      if (res.data?.settings?.part_status_filter) {
        setPartStatusFilter(res.data.settings.part_status_filter);
        if (typeof window !== "undefined") {
          localStorage.setItem("part_status_filter", res.data.settings.part_status_filter);
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

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axios.post("/api/systemsettings", {
        part_status_filter: partStatusFilter,
      });

      if (res.status === 200) {
        NotifySuccess("Pengaturan sistem berhasil disimpan");
        if (typeof window !== "undefined") {
          localStorage.setItem("part_status_filter", partStatusFilter);
        }
      }
    } catch (e) {
      NotifyError("Gagal menyimpan pengaturan sistem");
      console.error(e);
    } finally {
      setSaving(false);
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
            Konfigurasi preferensi tampilan dan kebijakan visibilitas data di seluruh sistem
          </p>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-opacity-90 disabled:opacity-50 transition-all active:scale-[0.99]"
        >
          {saving ? "Menyimpan..." : "Simpan Pengaturan"}
        </button>
      </div>

      {/* Setting Card 1: Part Status Visibility */}
      <PageCard>
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3 border-b border-stroke/60 pb-3 dark:border-strokedark/60">
            <div>
              <div className="flex items-center gap-2">
                <BsBoxSeam className="text-primary text-base" />
                <h2 className="text-sm font-bold text-black dark:text-white">
                  Visibilitas Status Suku Cadang (Inventory)
                </h2>
              </div>
              <p className="mt-0.5 text-xs text-body dark:text-bodydark">
                Menentukan kriteria suku cadang yang dimunculkan pada daftar stok, mutasi, kartu stok, opname, dan formulir servis di seluruh aplikasi.
              </p>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
              partStatusFilter === 'aktif' ? "bg-success/15 text-success" : "bg-warning/15 text-warning"
            }`}>
              {partStatusFilter === 'aktif' ? "Hanya Aktif" : "Aktif & Discontinue"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Option A: Hanya Aktif */}
            <div
              onClick={() => setPartStatusFilter("aktif")}
              className={`group cursor-pointer rounded-2xl border p-4 transition-all ${
                partStatusFilter === "aktif"
                  ? "border-primary bg-primary/5 dark:border-primary dark:bg-primary/10 shadow-sm"
                  : "border-stroke bg-white hover:border-gray-400 dark:border-strokedark dark:bg-boxdark"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-4 w-4 rounded-full border-2 flex items-center justify-center transition-all ${
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
              <p className="text-xs text-body dark:text-bodydark pl-6 leading-relaxed">
                Hanya menampilkan suku cadang yang berstatus <strong>&quot;Aktif&quot;</strong>. Suku cadang berstatus <strong>&quot;Discontinue&quot;</strong> akan otomatis disembunyikan dari katalog, pemilihan part pada servis, dan kartu stok.
              </p>
            </div>

            {/* Option B: Semua (Aktif & Discontinue) */}
            <div
              onClick={() => setPartStatusFilter("all")}
              className={`group cursor-pointer rounded-2xl border p-4 transition-all ${
                partStatusFilter === "all"
                  ? "border-primary bg-primary/5 dark:border-primary dark:bg-primary/10 shadow-sm"
                  : "border-stroke bg-white hover:border-gray-400 dark:border-strokedark dark:bg-boxdark"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-4 w-4 rounded-full border-2 flex items-center justify-center transition-all ${
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
              <p className="text-xs text-body dark:text-bodydark pl-6 leading-relaxed">
                Menampilkan seluruh suku cadang tanpa memfilter status, termasuk suku cadang yang sudah tidak diproduksi / <strong>&quot;Discontinue&quot;</strong> untuk kebutuhan pengecekan arsip riwayat mutasi lampau.
              </p>
            </div>
          </div>
        </div>
      </PageCard>
    </div>
  );

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
