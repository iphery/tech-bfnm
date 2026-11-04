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
  FiTool,
  FiTruck,
  FiChevronRight,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";

export default function ReportServicePage() {
  const router = useRouter();
  const isSmallScreen = useMediaQuery({ query: "(max-width: 640px)" });
  const [isClient, setIsClient] = useState(false);

  const [dataService, setDataService] = useState([]);
  const [loading, setLoading] = useState(false);
  const [monthYear, setMonthYear] = useState("");
  const [selectedOption, setSelectedOption] = useState("mp");

  const fetchData = async (my, opt) => {
    if (!my) return;
    const [y, m] = my.split("-");
    setLoading(true);
    try {
      const response = await axios.post("/api/reportservice", {
        month: m,
        year: y,
        type: opt,
      });
      if (response.status === 200) {
        setDataService(response.data?.service || []);
      }
    } catch (err) {
      console.error("Gagal load service report:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
    const today = new Date();
    const currentMY = today.toISOString().slice(0, 7);
    setMonthYear(currentMY);
    fetchData(currentMY, selectedOption);
  }, []);

  const handleMonthChange = (e) => {
    const val = e.target.value;
    setMonthYear(val);
    fetchData(val, selectedOption);
  };

  const handleOptionChange = (opt) => {
    setSelectedOption(opt);
    fetchData(monthYear, opt);
  };

  if (!isClient) return null;

  const totalRepairs = dataService.length;
  const avgRepairTime =
    totalRepairs > 0
      ? (
          dataService.reduce((acc, curr) => acc + (curr.repair_time || 0), 0) /
          totalRepairs
        ).toFixed(1)
      : "0";

  return (
    <UserAuth>
      {isSmallScreen ? (
        /* ================= MOBILE VIEW ================= */
        <div className="min-h-screen bg-slate-50 dark:bg-boxdark-2 text-slate-800 dark:text-slate-100 pb-20">
          <Appbar
            title="Laporan Perbaikan (CM)"
            backAction={() => router.back()}
          />

          <div className="p-4 space-y-4">
            {/* Filter Card */}
            <div className="bg-white dark:bg-boxdark rounded-2xl p-4 shadow-sm border border-slate-200/80 dark:border-strokedark space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <FiCalendar className="text-primary" /> Periode Bulan
                </label>
                <input
                  type="month"
                  value={monthYear}
                  onChange={handleMonthChange}
                  className="rounded-xl border border-slate-200 dark:border-strokedark bg-slate-50 dark:bg-meta-4 px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-primary"
                />
              </div>

              {/* Segmented Option */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-meta-4/60 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => handleOptionChange("mp")}
                  className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                    selectedOption === "mp"
                      ? "bg-white dark:bg-boxdark text-primary shadow-sm"
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                  }`}
                >
                  <FiTool size={14} /> Mesin Produksi
                </button>
                <button
                  type="button"
                  onClick={() => handleOptionChange("k")}
                  className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                    selectedOption === "k"
                      ? "bg-white dark:bg-boxdark text-primary shadow-sm"
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                  }`}
                >
                  <FiTruck size={14} /> Kendaraan
                </button>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-boxdark rounded-2xl p-3.5 shadow-sm border border-slate-200/80 dark:border-strokedark">
                <div className="text-[11px] font-semibold text-slate-400">Total Kejadian</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {totalRepairs} <span className="text-xs font-normal text-slate-400">Kasus</span>
                </div>
              </div>
              <div className="bg-white dark:bg-boxdark rounded-2xl p-3.5 shadow-sm border border-slate-200/80 dark:border-strokedark">
                <div className="text-[11px] font-semibold text-slate-400">Rata-rata Durasi</div>
                <div className="text-2xl font-black text-amber-500 mt-1">
                  {avgRepairTime} <span className="text-xs font-normal text-slate-400">Jam</span>
                </div>
              </div>
            </div>

            {/* List */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
                Daftar Riwayat Perbaikan ({dataService.length})
              </h3>

              {loading ? (
                <div className="text-center py-12 text-xs text-slate-400">Memuat laporan...</div>
              ) : dataService.length === 0 ? (
                <div className="bg-white dark:bg-boxdark rounded-2xl p-8 text-center text-xs text-slate-400 border border-slate-200/80 dark:border-strokedark">
                  Tidak ada data perbaikan untuk periode ini.
                </div>
              ) : (
                dataService.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => router.push(`/asset/${item.id_asset}`)}
                    className="bg-white dark:bg-boxdark rounded-2xl p-4 shadow-sm border border-slate-200/80 dark:border-strokedark space-y-2.5 cursor-pointer active:scale-[0.99] transition-transform"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-primary px-2 py-0.5 rounded-md bg-primary/10">
                        {item.id_request}
                      </span>
                      <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                        <FiCalendar size={12} /> {item.time_request}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                        {item.description}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Kategori: {item.category}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 dark:bg-meta-4/40 p-2.5 text-xs space-y-1">
                      <div>
                        <span className="font-semibold text-danger">Keluhan: </span>
                        <span className="text-slate-600 dark:text-slate-300">{item.problem}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-success">Solusi: </span>
                        <span className="text-slate-600 dark:text-slate-300">{item.solution}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-strokedark text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                        <FiClock size={13} /> {item.repair_time} jam pengerjaan
                      </span>
                      <span className="text-[11px]">User: {item.user}</span>
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
                  Laporan Perbaikan Bulanan (Corrective Maintenance)
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Rekapitulasi catatan perbaikan, durasi penanganan, dan solusi mesin & kendaraan
                </p>
              </div>

              {/* Month Picker */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <FiCalendar className="text-primary" /> Pilih Bulan:
                </label>
                <input
                  type="month"
                  value={monthYear}
                  onChange={handleMonthChange}
                  className="rounded-xl border border-slate-200 dark:border-strokedark bg-white dark:bg-boxdark px-3.5 py-2 text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:border-primary shadow-sm"
                />
              </div>
            </div>

            {/* Quick Metrics & Segment Selector */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2 bg-white dark:bg-boxdark rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-strokedark flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOptionChange("mp")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                    selectedOption === "mp"
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "bg-slate-100 hover:bg-slate-200 dark:bg-meta-4 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  <FiTool /> Mesin Produksi (MP)
                </button>
                <button
                  type="button"
                  onClick={() => handleOptionChange("k")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                    selectedOption === "k"
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "bg-slate-100 hover:bg-slate-200 dark:bg-meta-4 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  <FiTruck /> Kendaraan (K)
                </button>
              </div>

              <div className="bg-white dark:bg-boxdark rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-strokedark">
                <div className="text-xs font-semibold text-slate-400">Total Kejadian CM</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {totalRepairs} <span className="text-xs font-normal text-slate-400">Insiden</span>
                </div>
              </div>

              <div className="bg-white dark:bg-boxdark rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-strokedark">
                <div className="text-xs font-semibold text-slate-400">Rata-rata Waktu Perbaikan</div>
                <div className="text-2xl font-black text-amber-500 mt-1">
                  {avgRepairTime} <span className="text-xs font-normal text-slate-400">Jam / Kasus</span>
                </div>
              </div>
            </div>

            {/* Data Table */}
            <PageCard>
              <div className="p-6">
                <div className="border border-slate-200 dark:border-strokedark rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-meta-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-strokedark">
                      <tr>
                        <th className="py-3 px-4 w-12 text-center">No</th>
                        <th className="py-3 px-4 w-32">Tanggal</th>
                        <th className="py-3 px-4 min-w-[200px]">Aset / Deskripsi</th>
                        <th className="py-3 px-4 w-32">Kategori</th>
                        <th className="py-3 px-4 min-w-[220px]">Keluhan / Masalah</th>
                        <th className="py-3 px-4 min-w-[220px]">Solusi & Tindakan</th>
                        <th className="py-3 px-4 w-32 text-center">Durasi (Jam)</th>
                        <th className="py-3 px-4 w-28">Pelapor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-strokedark bg-white dark:bg-boxdark">
                      {loading ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-xs text-slate-400">
                            Memuat data laporan...
                          </td>
                        </tr>
                      ) : dataService.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-xs text-slate-400">
                            Tidak ada rekaman perbaikan untuk filter ini.
                          </td>
                        </tr>
                      ) : (
                        dataService.map((item, index) => (
                          <tr
                            key={index}
                            onClick={() => router.push(`/asset/${item.id_asset}`)}
                            className="hover:bg-slate-50/60 dark:hover:bg-meta-4/30 cursor-pointer transition-colors"
                          >
                            <td className="py-3.5 px-4 text-center font-bold text-xs text-slate-400">
                              {index + 1}
                            </td>
                            <td className="py-3.5 px-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                              {item.time_request}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900 dark:text-white">
                                {item.description}
                              </div>
                              <div className="text-[11px] text-primary font-semibold">
                                {item.id_request}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                              {item.category}
                            </td>
                            <td className="py-3.5 px-4 text-xs text-danger font-medium">
                              {item.problem}
                            </td>
                            <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
                              {item.solution}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                <FiClock size={12} /> {item.repair_time}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">
                              {item.user}
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
