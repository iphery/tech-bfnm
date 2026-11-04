"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import ChartOne from "../Charts/ChartOne";
import CardDataStats from "../CardDataStats";
import axios from "axios";
import {
  MdOutlineBuild,
  MdOutlinePendingActions,
  MdOutlineCalendarMonth,
  MdOutlineShoppingBag,
  MdOutlineWarningAmber,
  MdOutlineAccessTime,
  MdOutlineCheckCircle,
  MdArrowForward,
  MdOutlinePrecisionManufacturing,
  MdOutlineQrCodeScanner,
  MdOutlineAddBox,
} from "react-icons/md";
import { LiaUser } from "react-icons/lia";
import { useProvider } from "@/app/appcontext";
import { formatTime, shortDate } from "@/utils/dateformat";
import { IMAGE_ASSET } from "@/utils/constant";

const ECommerce: React.FC = () => {
  const [series, setSeries] = useState([]);
  const [inYear, setInYear] = useState(0);
  const [inMonth, setInMonth] = useState(0);
  const [waitingPart, setWaitingPart] = useState(0);
  const [openOrder, setOpenOrder] = useState(0);

  const { dataMaintenance, dataOutstanding, outCount, mainCount } =
    useProvider();

  const fetch_data = async () => {
    try {
      const response = await axios.get("/api/datadashboard");
      if (response.status === 200 && response.data) {
        setSeries(response.data["data"] || []);
        setInYear(response.data["inyear"] || 0);
        setInMonth(response.data["inmonth"] || 0);
        setWaitingPart(response.data["waiting_part"] || 0);
        setOpenOrder(response.data["open_order"] || 0);
      }
    } catch (err) {
      console.error("Fetch dashboard data error:", err);
    }
  };

  useEffect(() => {
    fetch_data();
  }, []);

  return (
    <div className="space-y-6">
      {/* 4 Core Maintenance KPIs */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <CardDataStats title="Perbaikan Bulan Ini" total={`${inMonth}`}>
          <MdOutlineCalendarMonth className="h-6 w-6 text-primary dark:text-white" />
        </CardDataStats>

        <CardDataStats title="Total Perbaikan Tahun Ini" total={`${inYear}`}>
          <MdOutlineBuild className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />
        </CardDataStats>

        <CardDataStats title="Menunggu Sparepart" total={`${waitingPart}`}>
          <MdOutlinePendingActions className="h-6 w-6 text-amber-500 dark:text-amber-400" />
        </CardDataStats>

        <CardDataStats title="Open Order Part" total={`${openOrder}`}>
          <MdOutlineShoppingBag className="h-6 w-6 text-rose-500 dark:text-rose-400" />
        </CardDataStats>
      </div>

      {/* Main Grid: Chart + Sidebar Panels */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: Trend Chart & Recent Breakdown Tickets */}
        <div className="col-span-12 space-y-6 xl:col-span-8">
          <ChartOne series={series} inMonth={inMonth} inYear={inYear} />

          {/* Outstanding Breakdown Jobs (CM) Table */}
          <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-boxdark/90">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="flex items-center gap-2 text-base font-bold text-slate-800 dark:text-white">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                  Antrean Perbaikan Berjalan (CM)
                </h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Daftar tiket breakdown mesin & kendaraan yang membutuhkan
                  tindakan
                </p>
              </div>

              <Link
                href="/listoutstanding"
                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
              >
                Lihat Semua ({outCount}) <MdArrowForward className="h-4 w-4" />
              </Link>
            </div>

            {dataOutstanding.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400 dark:border-slate-700">
                Semua aset dalam kondisi normal, tidak ada perbaikan aktif.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200/80 text-slate-500 dark:border-slate-700/80 dark:text-slate-400">
                      <th className="pb-3 font-semibold">Aset / Mesin</th>
                      <th className="pb-3 font-semibold">Tipe</th>
                      <th className="pb-3 font-semibold">Pemohon</th>
                      <th className="pb-3 font-semibold">Waktu Lapor</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 text-right font-semibold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {dataOutstanding
                      .slice(0, 5)
                      .map((item: any, index: number) => {
                        const title =
                          item["Type"] === "K"
                            ? item["Class"]
                            : item["Description"];
                        const isKendaraan = item["Type"] === "K";

                        return (
                          <tr
                            key={index}
                            className="transition-colors hover:bg-slate-50/80 dark:hover:bg-boxdark-2/50"
                          >
                            <td className="py-3.5 pr-3 font-bold text-slate-800 dark:text-white">
                              <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-boxdark-2 dark:text-slate-300">
                                  <MdOutlinePrecisionManufacturing className="h-4 w-4" />
                                </div>
                                <span className="max-w-[180px] truncate">
                                  {title || "-"}
                                </span>
                              </div>
                            </td>
                            <td className="py-3.5 pr-3">
                              <span
                                className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                                  isKendaraan
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                                    : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                                }`}
                              >
                                {isKendaraan ? "Kendaraan" : "Mesin"}
                              </span>
                            </td>
                            <td className="py-3.5 pr-3 text-slate-600 dark:text-slate-300">
                              <div className="flex items-center gap-1.5">
                                <LiaUser className="h-3.5 w-3.5 text-slate-400" />
                                <span>{item["Requestor"] || "-"}</span>
                              </div>
                            </td>
                            <td className="py-3.5 pr-3 text-slate-500 dark:text-slate-400">
                              <div className="flex items-center gap-1 text-[11px]">
                                <MdOutlineAccessTime className="h-3 w-3" />
                                <span>
                                  {shortDate(item["Time_Request"])}{" "}
                                  {formatTime(item["Time_Request"])}
                                </span>
                              </div>
                            </td>
                            <td className="py-3.5 pr-3">
                              <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-400">
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500"></span>
                                Step {item["Step"] || 1}
                              </span>
                            </td>
                            <td className="py-3.5 text-right">
                              <Link
                                href={`/asset/${item["ID_Asset"]}`}
                                className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-primary hover:text-white dark:bg-boxdark-2 dark:text-slate-300"
                              >
                                Detail →
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Preventive Maintenance & Quick Shortcuts */}
        <div className="col-span-12 space-y-6 xl:col-span-4">
          {/* Quick Operations Actions */}
          <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white shadow-md">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Aksi Cepat Operasional
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Pintasan cepat untuk input pekerjaan dan laporan
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <Link
                href="/new_asset"
                className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/10 p-3 text-center transition hover:bg-white/20"
              >
                <MdOutlineAddBox className="h-6 w-6 text-emerald-400" />
                <span className="mt-1.5 text-xs font-semibold">
                  Tambah Aset
                </span>
              </Link>

              <Link
                href="/scanner"
                className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/10 p-3 text-center transition hover:bg-white/20"
              >
                <MdOutlineQrCodeScanner className="h-6 w-6 text-sky-400" />
                <span className="mt-1.5 text-xs font-semibold">
                  Scan QR Barcode
                </span>
              </Link>

              <Link
                href="/machineutilize"
                className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/10 p-3 text-center transition hover:bg-white/20"
              >
                <MdOutlinePrecisionManufacturing className="h-6 w-6 text-amber-400" />
                <span className="mt-1.5 text-xs font-semibold">
                  Utilisasi Mesin
                </span>
              </Link>

              <Link
                href="/partstransaction"
                className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/10 p-3 text-center transition hover:bg-white/20"
              >
                <MdOutlineShoppingBag className="h-6 w-6 text-purple-400" />
                <span className="mt-1.5 text-xs font-semibold">
                  Transaksi Part
                </span>
              </Link>
            </div>
          </div>

          {/* Preventive Maintenance (PM) Feed */}
          <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-boxdark/90">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-white">
                  <span className="h-2.5 w-2.5 rounded-full bg-sky-500"></span>
                  Jadwal Servis Berkala (PM)
                </h3>
                <span className="text-xs text-slate-400">
                  Total {mainCount} jadwal
                </span>
              </div>

              <Link
                href="/listmaintenance"
                className="text-xs font-bold text-primary hover:underline"
              >
                Semua →
              </Link>
            </div>

            {dataMaintenance.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-xs text-slate-400 dark:border-slate-700">
                Tidak ada jadwal PM aktif saat ini.
              </div>
            ) : (
              <div className="space-y-3">
                {dataMaintenance.slice(0, 4).map((item: any, index: number) => {
                  const title =
                    item["Type"] === "K" ? item["Class"] : item["Description"];

                  return (
                    <div
                      key={index}
                      className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3 transition hover:border-sky-300 hover:bg-white dark:border-slate-800 dark:bg-boxdark-2/60 dark:hover:border-sky-800"
                    >
                      <div className="min-w-0 flex-1 pr-3">
                        <h4
                          className="truncate text-xs font-bold text-slate-800 dark:text-white"
                          title={title}
                        >
                          {title || "Aset Tanpa Nama"}
                        </h4>
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <MdOutlineCalendarMonth className="h-3 w-3" />
                            {shortDate(item["Time_Request"])}
                          </span>
                          <span>•</span>
                          <span className="truncate">
                            {item["Requestor"] || "Tim"}
                          </span>
                        </div>
                      </div>

                      <Link
                        href={`/asset/${item["ID_Asset"]}`}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-sm transition hover:bg-primary hover:text-white dark:border-slate-700 dark:bg-boxdark dark:text-slate-200"
                      >
                        Cek
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ECommerce;
