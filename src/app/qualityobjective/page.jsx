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
  FiPrinter,
  FiCheckCircle,
  FiActivity,
  FiTruck,
  FiClock,
} from "react-icons/fi";

export default function QualityObjectivePage() {
  const router = useRouter();
  const isSmallScreen = useMediaQuery({ query: "(max-width: 640px)" });
  const [isClient, setIsClient] = useState(false);

  const [dataService, setDataService] = useState([]);
  const [loading, setLoading] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
  const [year, setYear] = useState(currentYear);
  const [dataAverage, setDataAverage] = useState(["0.00", "0.00", "0.00"]);

  const fetchData = async (selectedYear) => {
    setLoading(true);
    try {
      const response = await axios.post("/api/reportqo", {
        year: selectedYear,
      });
      if (response.status === 200 && Array.isArray(response.data)) {
        const data = response.data;
        setDataService(data);

        let down = 0;
        let avg = 0;
        let overhault = 0;
        data.forEach((item) => {
          down += item.down || 0;
          avg += item.average || 0;
          overhault += item.overhault || 0;
        });

        const len = data.length || 1;
        const avg_down = (down / len).toFixed(2);
        const avg_avg = (avg / len).toFixed(2);
        const avg_overhault = (overhault / len).toFixed(2);

        setDataAverage([avg_down, avg_avg, avg_overhault]);
      }
    } catch (err) {
      console.error("Gagal load Quality Objective:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
    fetchData(year);
  }, [year]);

  const handlePrint = () => {
    try {
      localStorage.setItem("qoyear", String(year));
      localStorage.setItem("dataqo", JSON.stringify(dataService));
      localStorage.setItem("dataavg", JSON.stringify(dataAverage));
      router.push("/qualityobjective/print");
    } catch (e) {
      console.error(e);
    }
  };

  if (!isClient) return null;

  return (
    <UserAuth>
      {isSmallScreen ? (
        /* ================= MOBILE VIEW ================= */
        <div className="min-h-screen bg-slate-50 dark:bg-boxdark-2 text-slate-800 dark:text-slate-100 pb-20">
          <Appbar
            title="Quality Objective (QO)"
            backAction={() => router.back()}
          />

          <div className="p-4 space-y-4">
            {/* Year selector & actions */}
            <div className="bg-white dark:bg-boxdark rounded-2xl p-4 shadow-sm border border-slate-200/80 dark:border-strokedark flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiCalendar className="text-primary" />
                <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                  Tahun:
                </span>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="rounded-xl border border-slate-200 dark:border-strokedark bg-slate-50 dark:bg-meta-4 px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-primary"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold shadow-md shadow-primary/20"
              >
                <FiPrinter /> Cetak
              </button>
            </div>

            {/* Annual KPI Average Cards */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
                Rata-Rata Tahunan ({year})
              </h3>
              <div className="grid grid-cols-1 gap-2.5">
                <div className="bg-white dark:bg-boxdark rounded-2xl p-4 shadow-sm border border-slate-200/80 dark:border-strokedark flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400">
                      Pemanfaatan Mesin Produksi
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Target Maks. 100%
                    </div>
                  </div>
                  <div className="text-xl font-black text-emerald-500">
                    {dataAverage[0]}%
                  </div>
                </div>

                <div className="bg-white dark:bg-boxdark rounded-2xl p-4 shadow-sm border border-slate-200/80 dark:border-strokedark flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400">
                      Kendaraan Tidak Layak Jalan
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Target 0 Kasus
                    </div>
                  </div>
                  <div className="text-xl font-black text-primary">
                    {dataAverage[2]} <span className="text-xs font-normal text-slate-400">Kasus</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-boxdark rounded-2xl p-4 shadow-sm border border-slate-200/80 dark:border-strokedark flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400">
                      Kecepatan Perbaikan Mesin
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Target Maks. 1.48 Jam
                    </div>
                  </div>
                  <div className="text-xl font-black text-amber-500">
                    {dataAverage[1]} <span className="text-xs font-normal text-slate-400">Jam</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Breakdowns */}
            <div className="space-y-3 pt-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
                Rincian Per Bulan ({dataService.length})
              </h3>

              {loading ? (
                <div className="text-center py-12 text-xs text-slate-400">
                  Memuat data QO...
                </div>
              ) : (
                dataService.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-boxdark rounded-2xl p-4 shadow-sm border border-slate-200/80 dark:border-strokedark space-y-2.5"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-strokedark pb-2">
                      <span className="text-xs font-black text-slate-800 dark:text-white">
                        {item.monthname}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {item.count} Perbaikan
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-xl bg-slate-50 dark:bg-meta-4/40 p-2">
                        <div className="text-[10px] text-slate-400">Mesin (%)</div>
                        <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                          {Number(item.down).toFixed(1)}%
                        </div>
                      </div>
                      <div className="rounded-xl bg-slate-50 dark:bg-meta-4/40 p-2">
                        <div className="text-[10px] text-slate-400">Mogok (K)</div>
                        <div className="text-xs font-bold text-primary mt-0.5">
                          {item.overhault}
                        </div>
                      </div>
                      <div className="rounded-xl bg-slate-50 dark:bg-meta-4/40 p-2">
                        <div className="text-[10px] text-slate-400">Durasi</div>
                        <div className="text-xs font-bold text-amber-500 mt-0.5">
                          {Number(item.average).toFixed(2)} j
                        </div>
                      </div>
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
                  Laporan Sasaran Mutu (Quality Objective)
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Monitoring pencapaian KPI pemeliharaan mesin, kesiapan kendaraan, dan kecepatan respon
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Tahun:
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="rounded-xl border border-slate-200 dark:border-strokedark bg-white dark:bg-boxdark px-3.5 py-2 text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:border-primary shadow-sm"
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-md shadow-primary/20 transition-all"
                >
                  <FiPrinter /> Cetak Laporan
                </button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-boxdark rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-strokedark">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Kesiapan Mesin Produksi
                  </span>
                  <FiActivity className="text-emerald-500" size={18} />
                </div>
                <div className="text-3xl font-black text-emerald-500 mt-2">
                  {dataAverage[0]}%
                </div>
                <p className="text-xs text-slate-400 mt-1">Target kapasitas: Maks. 100%</p>
              </div>

              <div className="bg-white dark:bg-boxdark rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-strokedark">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Kendaraan Tidak Layak Jalan
                  </span>
                  <FiTruck className="text-primary" size={18} />
                </div>
                <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                  {dataAverage[2]} <span className="text-sm font-normal text-slate-400">kasus / bln</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Target: 0% kendaraan mogok</p>
              </div>

              <div className="bg-white dark:bg-boxdark rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-strokedark">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Rata-Rata Kecepatan Perbaikan
                  </span>
                  <FiClock className="text-amber-500" size={18} />
                </div>
                <div className="text-3xl font-black text-amber-500 mt-2">
                  {dataAverage[1]} <span className="text-sm font-normal text-slate-400">Jam</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Target: Maksimal 1.476 Jam</p>
              </div>
            </div>

            {/* Table */}
            <PageCard>
              <div className="p-6">
                <div className="border border-slate-200 dark:border-strokedark rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-meta-4 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-strokedark">
                      <tr>
                        <th className="py-4 px-4 w-40 text-center">Periode</th>
                        <th className="py-4 px-4">
                          <div>Pemanfaatan Mesin Produksi</div>
                          <div className="text-[10px] text-slate-400 font-normal">Target: Maks. 100%</div>
                        </th>
                        <th className="py-4 px-4 text-center">
                          <div>Kendaraan Tidak Layak Jalan</div>
                          <div className="text-[10px] text-slate-400 font-normal">Target: 0% / 0 Kasus</div>
                        </th>
                        <th className="py-4 px-4 text-center">
                          <div>Kecepatan Perbaikan (Jam)</div>
                          <div className="text-[10px] text-slate-400 font-normal">Target: Maks. 1.476 Jam</div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-strokedark bg-white dark:bg-boxdark">
                      {loading ? (
                        <tr>
                          <td colSpan={4} className="py-12 text-center text-xs text-slate-400">
                            Memuat data sasaran mutu...
                          </td>
                        </tr>
                      ) : (
                        <>
                          {dataService.map((item, index) => (
                            <tr key={index} className="hover:bg-slate-50/60 dark:hover:bg-meta-4/30 transition-colors">
                              <td className="py-3 px-4 text-center font-bold text-xs text-slate-700 dark:text-slate-200">
                                {item.monthname}
                              </td>
                              <td className="py-3 px-4 font-semibold text-emerald-600 dark:text-emerald-400">
                                {Number(item.down).toFixed(2)}%
                              </td>
                              <td className="py-3 px-4 text-center font-semibold text-slate-700 dark:text-slate-200">
                                {item.overhault}
                              </td>
                              <td className="py-3 px-4 text-center font-semibold text-amber-500">
                                {Number(item.average).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                          {/* Average Summary Row */}
                          <tr className="bg-slate-100/80 dark:bg-meta-4/60 font-black">
                            <td className="py-3.5 px-4 text-center text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                              Rata-Rata Tahunan
                            </td>
                            <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400">
                              {dataAverage[0]}%
                            </td>
                            <td className="py-3.5 px-4 text-center text-slate-900 dark:text-white">
                              {dataAverage[2]}
                            </td>
                            <td className="py-3.5 px-4 text-center text-amber-500">
                              {dataAverage[1]}
                            </td>
                          </tr>
                        </>
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
