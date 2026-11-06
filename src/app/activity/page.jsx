"use client";

import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "react-responsive";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import UserAuth from "@/components/auth";
import { PageLoader } from "@/components/loader";
import { NotifyError } from "@/utils/notify";
import { formatDateLocal } from "@/utils/dateformat";
import { RepairStatus } from "@/utils/repairstatus";

// Icons
import {
  HiOutlineWrenchScrewdriver,
  HiOutlineClock,
  HiOutlineMagnifyingGlass,
  HiOutlineArrowPath,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineBuildingOffice2,
  HiOutlineMapPin,
  HiOutlineUser,
  HiOutlineArrowTopRightOnSquare,
} from "react-icons/hi2";
import {
  FaWrench,
  FaCalendarCheck,
  FaExclamationTriangle,
  FaClock,
  FaTools,
} from "react-icons/fa";

export default function MaintenanceActivityPage() {
  const router = useRouter();
  const isSmallScreen = useMediaQuery({ query: "(max-width: 768px)" });

  // Tab State: 'CM' (Perbaikan) | 'PM' (Maintenance)
  const [activeTab, setActiveTab] = useState("CM");
  const [loading, setLoading] = useState(true);
  const [activityData, setActivityData] = useState([]);
  const [counts, setCounts] = useState({ cm: 0, pm: 0, total: 0 });

  // Filter Search & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch Ongoing Activities
  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/maintenanceactivity?type=ALL");
      if (res.data?.success) {
        setActivityData(res.data.data || []);
        if (res.data.counts) {
          setCounts(res.data.counts);
        }
      } else {
        NotifyError(res.data?.error || "Gagal memuat aktivitas maintenance");
      }
    } catch (err) {
      console.error("fetchActivities error:", err);
      NotifyError("Gagal memuat data aktivitas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  // Filter based on active tab ('CM' or 'PM') and search query
  const filteredItems = useMemo(() => {
    const tabFiltered = activityData.filter(
      (item) => item.Maintenance_Type === activeTab
    );

    if (!searchQuery.trim()) return tabFiltered;
    const q = searchQuery.toLowerCase().trim();

    return tabFiltered.filter((item) => {
      const title =
        item.Type === "K"
          ? `${item.Manufacture || ""} ${item.Model || ""} ${item.No || ""}`
          : `${item.Description || ""} ${item.Manufacture || ""} ${item.Model || ""}`;

      return (
        String(item.ID_Request || "").toLowerCase().includes(q) ||
        String(item.ID_Asset || "").toLowerCase().includes(q) ||
        String(title || "").toLowerCase().includes(q) ||
        String(item.Problem || "").toLowerCase().includes(q) ||
        String(item.Requestor || "").toLowerCase().includes(q) ||
        String(item.tech_name || "").toLowerCase().includes(q) ||
        String(item.Location || "").toLowerCase().includes(q)
      );
    });
  }, [activityData, activeTab, searchQuery]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchQuery("");
  };

  return (
    <UserAuth>
      <DefaultLayout>
        <div className="space-y-5 pb-12">
          {/* ================= HEADER SECTION ================= */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-primary/5 p-5 sm:p-6 shadow-sm backdrop-blur-md dark:border-slate-800 dark:from-boxdark dark:via-boxdark-2 dark:to-primary/10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {/* Title & Info */}
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">
                  <FaTools className="text-xs" />
                  <span>ONGOING WORK ORDER &amp; ACTIVITY</span>
                </div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                  Aktivitas Maintenance &amp; Perbaikan
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                  Daftar tiket pengerjaan yang sedang berjalan (aktif) di lapangan. Pantau progres perbaikan dan perawatan rutin secara real-time.
                </p>
              </div>

              {/* Action Buttons: Refresh */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchActivities}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95 disabled:opacity-50 dark:border-slate-700 dark:bg-boxdark dark:text-slate-200"
                >
                  <HiOutlineArrowPath
                    className={`text-sm ${loading ? "animate-spin text-primary" : ""}`}
                  />
                  <span>Refresh Data</span>
                </button>
              </div>
            </div>

            {/* TAB SELECTOR (PERBAIKAN vs MAINTENANCE) */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/60 pt-4 dark:border-slate-800">
              <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-meta-4">
                <button
                  type="button"
                  onClick={() => handleTabChange("CM")}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200 ${
                    activeTab === "CM"
                      ? "bg-white text-primary shadow-sm dark:bg-boxdark dark:text-white"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  <FaWrench className="text-xs" />
                  <span>Perbaikan (CM)</span>
                  <span
                    className={`rounded-full px-2 py-0.2 font-mono text-[10px] font-extrabold ${
                      activeTab === "CM"
                        ? "bg-primary/10 text-primary"
                        : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {counts.cm}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange("PM")}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200 ${
                    activeTab === "PM"
                      ? "bg-white text-primary shadow-sm dark:bg-boxdark dark:text-white"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  <FaCalendarCheck className="text-xs" />
                  <span>Maintenance (PM)</span>
                  <span
                    className={`rounded-full px-2 py-0.2 font-mono text-[10px] font-extrabold ${
                      activeTab === "PM"
                        ? "bg-primary/10 text-primary"
                        : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {counts.pm}
                  </span>
                </button>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-72">
                <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder={`Cari tiket, aset, teknisi ${activeTab === "CM" ? "perbaikan" : "maintenance"}...`}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs outline-none transition focus:border-primary dark:border-slate-700 dark:bg-boxdark dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* ================= TABLE LIST CONTENT ================= */}
          {loading ? (
            <div className="flex h-72 items-center justify-center">
              <PageLoader />
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-boxdark">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] border-collapse text-left text-xs">
                  {/* Table Header */}
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 font-bold text-slate-700 dark:border-slate-800 dark:bg-boxdark-2/60 dark:text-slate-300">
                      <th className="py-3 px-4 text-center" style={{ width: "4%" }}>
                        #
                      </th>
                      <th className="py-3 px-4" style={{ width: "16%" }}>
                        No Tiket &amp; Tanggal
                      </th>
                      <th className="py-3 px-4" style={{ width: "26%" }}>
                        Aset Mesin / Kendaraan
                      </th>
                      <th className="py-3 px-4" style={{ width: "24%" }}>
                        Keluhan / Rencana Pekerjaan
                      </th>
                      <th className="py-3 px-4" style={{ width: "16%" }}>
                        Requestor &amp; Teknisi
                      </th>
                      <th className="py-3 px-4 text-center" style={{ width: "14%" }}>
                        Status Pengerjaan
                      </th>
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {paginatedItems.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-16 text-center text-slate-400">
                          {searchQuery
                            ? "Tidak ada aktivitas yang sesuai dengan kriteria pencarian"
                            : `Saat ini tidak ada pengerjaan ${activeTab === "CM" ? "perbaikan" : "maintenance rutin"} yang sedang aktif/berjalan`}
                        </td>
                      </tr>
                    ) : (
                      paginatedItems.map((item, idx) => {
                        const rowIndex = (currentPage - 1) * itemsPerPage + idx + 1;
                        const mfg = item.Manufacture || "";
                        const model = item.Model || "";
                        const no = item.No || "";
                        const title =
                          item.Type === "K"
                            ? `${mfg} ${model} ${no ? `- ${no}` : ""}`.trim()
                            : `${item.Description || ""} ${mfg} ${model}`.trim();

                        const statusObj = RepairStatus(String(item.Step)) || {
                          status: "Dalam Proses",
                          color: "bg-warning",
                        };

                        return (
                          <tr
                            key={item.ID_Request || idx}
                            onClick={() => router.push(`/asset/${item.ID_Asset}`)}
                            className="cursor-pointer transition hover:bg-slate-50/70 dark:hover:bg-meta-4/10"
                          >
                            {/* # Index */}
                            <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                              {rowIndex}
                            </td>

                            {/* ID Request & Tgl Request */}
                            <td className="py-3.5 px-4">
                              <div className="font-mono font-bold text-primary">
                                #{item.ID_Request}
                              </div>
                              <div className="mt-0.5 inline-flex items-center gap-1 font-mono text-[11px] text-slate-400">
                                <HiOutlineClock className="text-xs" />
                                <span>{formatDateLocal(item.Time_Request)}</span>
                              </div>
                            </td>

                            {/* Aset & Lokasi */}
                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-slate-900 dark:text-white">
                                {title || item.ID_Asset}
                              </div>
                              <div className="mt-0.5 flex items-center gap-2">
                                <span className="font-mono text-[11px] font-bold text-slate-500">
                                  {item.ID_Asset}
                                </span>
                                {item.Location && (
                                  <span className="inline-flex items-center gap-0.5 rounded bg-slate-100 px-1.5 py-0.2 text-[10px] text-slate-600 dark:bg-boxdark-2 dark:text-slate-400">
                                    <HiOutlineMapPin className="text-[10px]" />
                                    <span>{item.Location}</span>
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Problem / Keluhan */}
                            <td className="py-3.5 px-4">
                              <div className="max-w-xs truncate font-medium text-slate-800 dark:text-slate-200">
                                {item.Problem || "-"}
                              </div>
                            </td>

                            {/* Requestor & Teknisi */}
                            <td className="py-3.5 px-4">
                              <div className="text-slate-700 dark:text-slate-300">
                                <span className="text-[10px] text-slate-400 block">Pelapor:</span>
                                <strong>{item.Requestor || "-"}</strong>
                              </div>
                              <div className="mt-1 text-slate-700 dark:text-slate-300">
                                <span className="text-[10px] text-slate-400 block">Teknisi:</span>
                                <span className="font-medium text-primary">
                                  {item.tech_name && item.tech_name !== "-" ? item.tech_name : "Belum ditentukan"}
                                </span>
                              </div>
                            </td>

                            {/* Status Badge */}
                            <td className="py-3.5 px-4 text-center">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold text-white shadow-2xs ${statusObj.color}`}
                              >
                                <span>{statusObj.status}</span>
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* ================= PAGINATION CONTROLS ================= */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-100 p-4 dark:border-slate-800 text-xs">
                  <span className="text-slate-500 dark:text-slate-400">
                    Menampilkan <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> -{" "}
                    <strong>{Math.min(currentPage * itemsPerPage, filteredItems.length)}</strong> dari total{" "}
                    <strong>{filteredItems.length}</strong> aktivitas
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:opacity-30 dark:border-slate-700 dark:text-slate-300"
                    >
                      <HiOutlineChevronLeft className="text-sm" />
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const p = i + 1;
                      if (
                        p === 1 ||
                        p === totalPages ||
                        (p >= currentPage - 1 && p <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setCurrentPage(p)}
                            className={`flex h-8 w-8 items-center justify-center rounded-xl font-mono text-xs font-bold transition ${
                              currentPage === p
                                ? "bg-primary text-white shadow-sm"
                                : "border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {p}
                          </button>
                        );
                      }
                      if (p === currentPage - 2 || p === currentPage + 2) {
                        return (
                          <span key={p} className="px-1 text-slate-400">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}

                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:opacity-30 dark:border-slate-700 dark:text-slate-300"
                    >
                      <HiOutlineChevronRight className="text-sm" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DefaultLayout>
    </UserAuth>
  );
}
