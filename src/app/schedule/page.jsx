"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "react-responsive";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import UserAuth from "@/components/auth";
import { Appbar } from "@/components/appbar";
import { PageCard } from "@/components/card";
import {
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiChevronRight,
  FiTool,
  FiTruck,
  FiZap,
} from "react-icons/fi";
import {
  MdDirectionsCar,
  MdElectricBolt,
  MdPrecisionManufacturing,
} from "react-icons/md";
import { shortDate, formatTime } from "@/utils/dateformat";

export default function SchedulePage() {
  const router = useRouter();
  const isSmallScreen = useMediaQuery({ query: "(max-width: 640px)" });
  const [isClient, setIsClient] = useState(false);

  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `/api/listmaintenance?status=all&per_page=100`
      );
      if (response.status === 200 && response.data?.success) {
        setSchedules(response.data.items || []);
      }
    } catch (err) {
      console.error("Gagal load jadwal PM:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
    fetchSchedules();
  }, []);

  const getCategoryIcon = (type, desc = "") => {
    const t = (desc || "").toLowerCase();
    if (type === "K" || t.includes("mobil") || t.includes("truck")) {
      return <MdDirectionsCar className="text-amber-500 h-5 w-5" />;
    }
    if (t.includes("genset") || t.includes("trafo") || t.includes("panel")) {
      return <MdElectricBolt className="text-amber-500 h-5 w-5" />;
    }
    return <MdPrecisionManufacturing className="text-primary h-5 w-5" />;
  };

  const filteredSchedules = schedules.filter((item) => {
    // Filter status
    if (statusFilter !== "all" && item.status_key !== statusFilter) {
      return false;
    }
    // Filter category
    if (categoryFilter === "vehicle" && item.Type !== "K") return false;
    if (categoryFilter === "machine" && item.Type !== "MP") return false;
    // Filter month if set
    if (selectedMonth && item.Time_Request) {
      const itemMonth = item.Time_Request.slice(0, 7);
      if (itemMonth !== selectedMonth) return false;
    }
    return true;
  });

  const totalCount = schedules.length;
  const issuedCount = schedules.filter((s) => s.status_key === "issued").length;
  const progressCount = schedules.filter((s) => s.status_key === "onprogress").length;
  const completedCount = schedules.filter((s) => s.status_key === "completed").length;

  if (!isClient) return null;

  return (
    <UserAuth>
      {isSmallScreen ? (
        /* ================= MOBILE VIEW ================= */
        <div className="min-h-screen bg-slate-50 dark:bg-boxdark-2 text-slate-800 dark:text-slate-100 pb-20">
          <Appbar
            title="Jadwal Pemeliharaan (PM)"
            backAction={() => router.back()}
          />

          <div className="p-4 space-y-4">
            {/* Filter controls */}
            <div className="bg-white dark:bg-boxdark rounded-2xl p-4 shadow-sm border border-slate-200/80 dark:border-strokedark space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <FiCalendar className="text-primary" /> Periode Bulan
                </label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="rounded-xl border border-slate-200 dark:border-strokedark bg-slate-50 dark:bg-meta-4 px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-primary"
                />
              </div>

              {/* Category pills */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setCategoryFilter("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                    categoryFilter === "all"
                      ? "bg-primary text-white shadow-sm"
                      : "bg-slate-100 dark:bg-meta-4 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  Semua Kategori
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter("machine")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                    categoryFilter === "machine"
                      ? "bg-primary text-white shadow-sm"
                      : "bg-slate-100 dark:bg-meta-4 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  Mesin Produksi
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter("vehicle")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                    categoryFilter === "vehicle"
                      ? "bg-primary text-white shadow-sm"
                      : "bg-slate-100 dark:bg-meta-4 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  Kendaraan
                </button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2">
              <div
                onClick={() => setStatusFilter(statusFilter === "issued" ? "all" : "issued")}
                className={`rounded-2xl p-3 border text-center cursor-pointer transition-all ${
                  statusFilter === "issued"
                    ? "bg-amber-500/10 border-amber-500"
                    : "bg-white dark:bg-boxdark border-slate-200/80 dark:border-strokedark shadow-sm"
                }`}
              >
                <div className="text-[10px] font-bold text-amber-600 uppercase">Jadwal Baru</div>
                <div className="text-lg font-black text-amber-500 mt-0.5">{issuedCount}</div>
              </div>
              <div
                onClick={() => setStatusFilter(statusFilter === "onprogress" ? "all" : "onprogress")}
                className={`rounded-2xl p-3 border text-center cursor-pointer transition-all ${
                  statusFilter === "onprogress"
                    ? "bg-sky-500/10 border-sky-500"
                    : "bg-white dark:bg-boxdark border-slate-200/80 dark:border-strokedark shadow-sm"
                }`}
              >
                <div className="text-[10px] font-bold text-sky-600 uppercase">Dikerjakan</div>
                <div className="text-lg font-black text-sky-500 mt-0.5">{progressCount}</div>
              </div>
              <div
                onClick={() => setStatusFilter(statusFilter === "completed" ? "all" : "completed")}
                className={`rounded-2xl p-3 border text-center cursor-pointer transition-all ${
                  statusFilter === "completed"
                    ? "bg-emerald-500/10 border-emerald-500"
                    : "bg-white dark:bg-boxdark border-slate-200/80 dark:border-strokedark shadow-sm"
                }`}
              >
                <div className="text-[10px] font-bold text-emerald-600 uppercase">Selesai</div>
                <div className="text-lg font-black text-emerald-500 mt-0.5">{completedCount}</div>
              </div>
            </div>

            {/* List Agenda */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Agenda PM Terdaftar ({filteredSchedules.length})
                </h3>
                {statusFilter !== "all" && (
                  <button
                    type="button"
                    onClick={() => setStatusFilter("all")}
                    className="text-[11px] font-semibold text-primary"
                  >
                    Reset Filter
                  </button>
                )}
              </div>

              {loading ? (
                <div className="text-center py-12 text-xs text-slate-400">Memuat jadwal...</div>
              ) : filteredSchedules.length === 0 ? (
                <div className="bg-white dark:bg-boxdark rounded-2xl p-8 text-center text-xs text-slate-400 border border-slate-200/80 dark:border-strokedark">
                  Tidak ada agenda pemeliharaan pada periode ini.
                </div>
              ) : (
                filteredSchedules.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => router.push(`/asset/${item.ID_Asset}`)}
                    className="bg-white dark:bg-boxdark rounded-2xl p-4 shadow-sm border border-slate-200/80 dark:border-strokedark space-y-2.5 cursor-pointer active:scale-[0.99] transition-transform"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(item.Type, item.Description)}
                        <span className="text-xs font-black text-primary">
                          {item.ID_Request}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.status_key === "completed"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : item.status_key === "onprogress"
                          ? "bg-sky-500/10 text-sky-600"
                          : "bg-amber-500/10 text-amber-600"
                      }`}>
                        {item.status_label}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                        {item.Type === "K"
                          ? item.Class
                          : [item.Description, item.Manufacture, item.Model].filter(Boolean).join(" ")}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                        {item.Problem || "Pemeriksaan rutin berkala (PM)"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-strokedark text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <FiCalendar size={13} className="text-primary" />
                        {shortDate(item.Time_Request)}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200">
                        Detail Aset <FiChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ================= DESKTOP VIEW ================= */
        <DefaultLayout>
          <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Jadwal Preventive Maintenance (PM)
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Monitoring agenda pemeliharaan preventif rutin mesin, fasilitas, dan armada
                </p>
              </div>

              {/* Month Picker */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <FiCalendar className="text-primary" /> Pilih Bulan:
                </label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="rounded-xl border border-slate-200 dark:border-strokedark bg-white dark:bg-boxdark px-3.5 py-2 text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:border-primary shadow-sm"
                />
              </div>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div
                onClick={() => setStatusFilter("all")}
                className={`bg-white dark:bg-boxdark rounded-2xl p-4 shadow-sm border cursor-pointer transition-all ${
                  statusFilter === "all"
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-slate-200 dark:border-strokedark"
                }`}
              >
                <div className="text-xs font-semibold text-slate-400">Total Agenda PM</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {totalCount} <span className="text-xs font-normal text-slate-400">Tugas</span>
                </div>
              </div>

              <div
                onClick={() => setStatusFilter("issued")}
                className={`bg-white dark:bg-boxdark rounded-2xl p-4 shadow-sm border cursor-pointer transition-all ${
                  statusFilter === "issued"
                    ? "border-amber-500 ring-2 ring-amber-500/20"
                    : "border-slate-200 dark:border-strokedark"
                }`}
              >
                <div className="text-xs font-semibold text-slate-400">Jadwal Menunggu (Issued)</div>
                <div className="text-2xl font-black text-amber-500 mt-1">
                  {issuedCount} <span className="text-xs font-normal text-slate-400">Tugas</span>
                </div>
              </div>

              <div
                onClick={() => setStatusFilter("onprogress")}
                className={`bg-white dark:bg-boxdark rounded-2xl p-4 shadow-sm border cursor-pointer transition-all ${
                  statusFilter === "onprogress"
                    ? "border-sky-500 ring-2 ring-sky-500/20"
                    : "border-slate-200 dark:border-strokedark"
                }`}
              >
                <div className="text-xs font-semibold text-slate-400">Sedang Dikerjakan</div>
                <div className="text-2xl font-black text-sky-500 mt-1">
                  {progressCount} <span className="text-xs font-normal text-slate-400">Tugas</span>
                </div>
              </div>

              <div
                onClick={() => setStatusFilter("completed")}
                className={`bg-white dark:bg-boxdark rounded-2xl p-4 shadow-sm border cursor-pointer transition-all ${
                  statusFilter === "completed"
                    ? "border-emerald-500 ring-2 ring-emerald-500/20"
                    : "border-slate-200 dark:border-strokedark"
                }`}
              >
                <div className="text-xs font-semibold text-slate-400">Selesai (Completed)</div>
                <div className="text-2xl font-black text-emerald-500 mt-1">
                  {completedCount} <span className="text-xs font-normal text-slate-400">Tugas</span>
                </div>
              </div>
            </div>

            {/* Table */}
            <PageCard>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCategoryFilter("all")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        categoryFilter === "all"
                          ? "bg-primary text-white"
                          : "bg-slate-100 hover:bg-slate-200 dark:bg-meta-4 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      Semua
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategoryFilter("machine")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        categoryFilter === "machine"
                          ? "bg-primary text-white"
                          : "bg-slate-100 hover:bg-slate-200 dark:bg-meta-4 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      Mesin Produksi
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategoryFilter("vehicle")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        categoryFilter === "vehicle"
                          ? "bg-primary text-white"
                          : "bg-slate-100 hover:bg-slate-200 dark:bg-meta-4 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      Kendaraan
                    </button>
                  </div>

                  <span className="text-xs font-bold text-slate-400">
                    Menampilkan {filteredSchedules.length} tugas
                  </span>
                </div>

                <div className="border border-slate-200 dark:border-strokedark rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-meta-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-strokedark">
                      <tr>
                        <th className="py-3 px-4 w-12 text-center">No</th>
                        <th className="py-3 px-4 w-32">ID Request</th>
                        <th className="py-3 px-4 w-36">Jadwal Tanggal</th>
                        <th className="py-3 px-4 min-w-[200px]">Aset / Mesin</th>
                        <th className="py-3 px-4 min-w-[240px]">Rincian Pemeliharaan</th>
                        <th className="py-3 px-4 w-36">Status</th>
                        <th className="py-3 px-4 w-28 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-strokedark bg-white dark:bg-boxdark">
                      {loading ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                            Memuat data jadwal...
                          </td>
                        </tr>
                      ) : filteredSchedules.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                            Tidak ada agenda PM yang cocok dengan filter.
                          </td>
                        </tr>
                      ) : (
                        filteredSchedules.map((item, index) => (
                          <tr
                            key={index}
                            className="hover:bg-slate-50/60 dark:hover:bg-meta-4/30 transition-colors"
                          >
                            <td className="py-3 px-4 text-center font-bold text-xs text-slate-400">
                              {index + 1}
                            </td>
                            <td className="py-3 px-4 font-bold text-xs text-primary">
                              {item.ID_Request}
                            </td>
                            <td className="py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                              {shortDate(item.Time_Request)}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900 dark:text-white">
                                {item.Type === "K"
                                  ? item.Class
                                  : [item.Description, item.Manufacture, item.Model].filter(Boolean).join(" ")}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {item.ID_Asset}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">
                              {item.Problem || "Pemeriksaan rutin berkala (PM)"}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                                item.status_key === "completed"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : item.status_key === "onprogress"
                                  ? "bg-sky-500/10 text-sky-600 dark:text-sky-400"
                                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              }`}>
                                {item.status_label}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => router.push(`/asset/${item.ID_Asset}`)}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-meta-4 text-slate-700 dark:text-slate-200 transition-colors"
                              >
                                Detail
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </PageCard>
          </div>
        </DefaultLayout>
      )}
    </UserAuth>
  );
}
