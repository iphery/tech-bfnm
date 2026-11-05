"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  HiOutlineBanknotes,
  HiOutlineArrowTrendingUp,
  HiOutlineShieldCheck,
  HiOutlineExclamationTriangle,
  HiOutlineSparkles,
} from "react-icons/hi2";
import { FaGasPump, FaTruck, FaIndustry, FaCogs, FaOilCan } from "react-icons/fa";

export default function BudgetPosOverview() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [loading, setLoading] = useState(true);
  const [budgetData, setBudgetData] = useState(null);

  const fetchBudget = async (year) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/budgetsummary?year=${year}`);
      if (res.status === 200 && res.data) {
        setBudgetData(res.data);
      }
    } catch (err) {
      console.error("Gagal memuat ringkasan budget pos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudget(selectedYear);
  }, [selectedYear]);

  const posIcons = {
    ME01: <FaOilCan className="text-amber-500" />,
    ME02: <FaTruck className="text-blue-500" />,
    ME03: <FaIndustry className="text-emerald-500" />,
    ME04: <FaCogs className="text-purple-500" />,
    ME05: <HiOutlineSparkles className="text-rose-500" />,
  };

  const posList = budgetData?.pos_summary || [];
  const grandSummary = budgetData?.summary || {
    grand_target: 0,
    grand_actual: 0,
    grand_remaining: 0,
    grand_percentage: 0,
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-boxdark/90 space-y-4">
      {/* Header Widget */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stroke pb-3 dark:border-strokedark">
        <div>
          <h3 className="flex items-center gap-2 text-base font-bold text-slate-800 dark:text-white">
            <HiOutlineBanknotes className="h-5 w-5 text-primary" />
            Monitoring Anggaran Pemeliharaan (Budget Pos)
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Realisasi pengadaan & servis per pos anggaran terhadap target tahunan (Tabel Budget_Set)
          </p>
        </div>

        {/* Year Selector & Grand Status Badge */}
        <div className="flex items-center gap-2.5">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="rounded-xl border border-stroke bg-gray-50 px-3 py-1.5 text-xs font-bold text-black outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4/20 dark:text-white cursor-pointer"
          >
            {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
              <option key={y} value={y}>
                Tahun {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grand Target Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-stroke bg-gray-50/70 p-3 dark:border-strokedark dark:bg-meta-4/10">
          <span className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400">
            Total Target Anggaran ({selectedYear})
          </span>
          <span className="text-sm font-bold font-mono text-black dark:text-white">
            Rp {Number(grandSummary.grand_target || 0).toLocaleString("id-ID")}
          </span>
        </div>

        <div className="rounded-xl border border-stroke bg-gray-50/70 p-3 dark:border-strokedark dark:bg-meta-4/10">
          <span className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400">
            Total Realisasi Terpakai
          </span>
          <span className="text-sm font-bold font-mono text-primary">
            Rp {Number(grandSummary.grand_actual || 0).toLocaleString("id-ID")}
          </span>
          <span className="text-[10px] text-body dark:text-bodydark block mt-0.5">
            Serapan: <strong>{grandSummary.grand_percentage}%</strong>
          </span>
        </div>

        <div className="rounded-xl border border-stroke bg-gray-50/70 p-3 dark:border-strokedark dark:bg-meta-4/10">
          <span className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400">
            Sisa Anggaran Tersedia
          </span>
          <span className="text-sm font-bold font-mono text-success">
            Rp {Number(grandSummary.grand_remaining || 0).toLocaleString("id-ID")}
          </span>
        </div>
      </div>

      {/* Grid Pos Cards (ME01 s/d ME05) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {loading ? (
          <div className="col-span-full py-6 text-center text-xs text-body dark:text-bodydark">
            Memuat data budget...
          </div>
        ) : (
          posList.map((pos) => {
            const pct = Math.min(100, pos.percentage_used);
            let barColor = "bg-primary";
            if (pos.is_overbudget || pos.percentage_used >= 100) {
              barColor = "bg-danger";
            } else if (pos.percentage_used >= 75) {
              barColor = "bg-warning";
            }

            return (
              <div
                key={pos.code}
                className="flex flex-col justify-between rounded-xl border border-stroke bg-white p-3 shadow-xs dark:border-strokedark dark:bg-boxdark hover:border-primary/50 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-primary">
                      {posIcons[pos.code] || <FaCogs />}
                      {pos.code}
                    </span>
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[9px] font-bold ${
                        pos.is_overbudget
                          ? "bg-danger/15 text-danger"
                          : pos.percentage_used >= 75
                          ? "bg-warning/15 text-warning"
                          : "bg-success/15 text-success"
                      }`}
                    >
                      {pos.percentage_used}%
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-black dark:text-white line-clamp-1">
                    {pos.name}
                  </h4>
                  <span className="text-[10px] text-body dark:text-bodydark block mb-2">
                    {pos.category}
                  </span>

                  <div className="space-y-1 text-[11px] pt-1 border-t border-stroke/60 dark:border-strokedark/60">
                    <div className="flex justify-between">
                      <span className="text-body dark:text-bodydark text-[10px]">Realisasi:</span>
                      <span className="font-mono font-bold text-black dark:text-white">
                        Rp {Number(pos.actual_total || 0).toLocaleString("id-ID")}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-body dark:text-bodydark text-[10px]">Target:</span>
                      <span className="font-mono text-body dark:text-bodydark">
                        Rp {Number(pos.target_budget || 0).toLocaleString("id-ID")}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-body dark:text-bodydark text-[10px]">Sisa:</span>
                      <span className="font-mono font-semibold text-success">
                        Rp {Number(pos.remaining_budget || 0).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3 pt-2">
                  <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-meta-4 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${barColor} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

