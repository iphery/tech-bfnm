"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  HiOutlineMagnifyingGlass,
  HiOutlineArrowPath,
  HiOutlinePencilSquare,
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineTruck,
} from "react-icons/hi2";
import { NotifySuccess, NotifyError } from "@/utils/notify";

export const FLAG_OPTIONS = [
  { value: 0, label: "0 - Minor Service → Next: Intermediate" },
  { value: 1, label: "1 - Intermediate Service → Next: Minor" },
  { value: 2, label: "2 - Minor Service → Next: Full Service" },
  { value: 3, label: "3 - Full Service → Next: Minor" },
];

export function getMaintenanceByFlag(flag) {
  const f = Number(flag);
  switch (f) {
    case 0:
      return { current: "Minor Service", next: "Intermediate Service" };
    case 1:
      return { current: "Intermediate Service", next: "Minor Service" };
    case 2:
      return { current: "Minor Service", next: "Full Service" };
    case 3:
      return { current: "Full Service", next: "Minor Service" };
    default:
      return { current: "Minor Service", next: "Intermediate Service" };
  }
}

export default function KmScheduleMatrix() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    flagKm: 0,
    currentKm: 0,
    scheduleKm: 0,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/kmschedule");
      if (res.data?.success) {
        setData(res.data.data || []);
      } else {
        NotifyError(res.data?.error || "Gagal memuat matrix KM");
      }
    } catch (err) {
      console.error("fetchData matrix KM error:", err);
      NotifyError("Gagal memuat matrix KM");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (row) => {
    setEditingId(row.ID_Asset);
    setEditForm({
      flagKm: Number(row.Flag_KM) || 0,
      currentKm: Number(row.Current_KM) || 0,
      scheduleKm: Number(row.Schedule_KM) || 0,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleFlagChange = (newFlag) => {
    setEditForm((prev) => ({
      ...prev,
      flagKm: Number(newFlag),
    }));
  };

  const saveEdit = async (idAsset) => {
    try {
      setSaving(true);
      const res = await axios.post("/api/kmschedule", {
        idAsset,
        flagKm: editForm.flagKm,
        currentKm: editForm.currentKm,
        scheduleKm: editForm.scheduleKm,
      });

      if (res.data?.success) {
        NotifySuccess(res.data.message || "Matrix KM berhasil diperbarui!");
        // Update local state langsung agar responsif
        const preview = getMaintenanceByFlag(editForm.flagKm);
        const late = Number(editForm.currentKm) - Number(editForm.scheduleKm);
        setData((prev) =>
          prev.map((item) =>
            item.ID_Asset === idAsset
              ? {
                  ...item,
                  Flag_KM: editForm.flagKm,
                  Current_KM: editForm.currentKm,
                  Schedule_KM: editForm.scheduleKm,
                  Current_Maintenance: preview.current,
                  Next_Maintenance: preview.next,
                  Late_KM: late,
                }
              : item
          )
        );
        setEditingId(null);
      } else {
        NotifyError(res.data?.error || "Gagal menyimpan perubahan");
      }
    } catch (err) {
      console.error("saveEdit KM error:", err);
      NotifyError("Terjadi kesalahan saat menyimpan perubahan matrix KM");
    } finally {
      setSaving(false);
    }
  };

  const filteredData = data.filter((row) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (row.ID_Asset || "").toLowerCase().includes(q) ||
      (row.Description || "").toLowerCase().includes(q) ||
      (row.No || "").toLowerCase().includes(q) ||
      (row.Model || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-boxdark overflow-hidden">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 p-4 sm:p-5 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <HiOutlineTruck className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-black dark:text-white">
              Matrix Jadwal Servis Berbasis KM (KMbasedSchedule)
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Kelola Flag KM, Current KM, dan Schedule KM kendaraan/forklift. Mengubah <strong>Flag_KM</strong> otomatis memperbarui status <strong>Current Maintenance</strong> &amp; <strong>Next Maintenance</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Bar */}
          <div className="relative w-full sm:w-56">
            <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari aset KM..."
              className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs outline-none transition focus:border-primary dark:border-slate-700 dark:bg-boxdark-2 dark:text-white"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <HiOutlineXMark className="text-xs" />
              </button>
            )}
          </div>

          {/* Refresh */}
          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-boxdark-2 dark:text-slate-200"
          >
            <HiOutlineArrowPath className={`text-xs ${loading ? "animate-spin text-primary" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-600 uppercase tracking-wider dark:border-slate-800 dark:bg-boxdark-2/60 dark:text-slate-300">
              <th className="px-4 py-3">Aset</th>
              <th className="px-3 py-3 text-center">Flag KM</th>
              <th className="px-3 py-3">Current Maintenance</th>
              <th className="px-3 py-3">Next Maintenance</th>
              <th className="px-3 py-3 text-right">Current KM</th>
              <th className="px-3 py-3 text-right">Schedule KM</th>
              <th className="px-3 py-3 text-right">Terlambat (Late KM)</th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-r-transparent"></div>
                  <p className="mt-2 text-xs">Memuat data matrix KM...</p>
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  Tidak ada aset berbasis KM yang ditemukan.
                </td>
              </tr>
            ) : (
              filteredData.map((row) => {
                const isEditing = editingId === row.ID_Asset;
                const preview = isEditing
                  ? getMaintenanceByFlag(editForm.flagKm)
                  : { current: row.Current_Maintenance, next: row.Next_Maintenance };

                const lateVal = isEditing
                  ? Number(editForm.currentKm) - Number(editForm.scheduleKm)
                  : Number(row.Late_KM);

                return (
                  <tr
                    key={row.ID_Asset}
                    className={`transition-colors hover:bg-slate-50/60 dark:hover:bg-boxdark-2/40 ${
                      isEditing ? "bg-primary/5 dark:bg-primary/10" : ""
                    }`}
                  >
                    {/* Aset info */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-primary dark:text-sky-400">
                          {row.ID_Asset}
                        </span>
                        {row.No && row.No !== "-" && (
                          <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                            {row.No}
                          </span>
                        )}
                      </div>
                      <div className="font-medium text-slate-900 dark:text-white truncate max-w-[200px]">
                        {row.Description}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {row.Manufacture} {row.Model && `• ${row.Model}`}
                      </div>
                    </td>

                    {/* Flag KM */}
                    <td className="px-3 py-3 text-center">
                      {isEditing ? (
                        <select
                          value={editForm.flagKm}
                          onChange={(e) => handleFlagChange(e.target.value)}
                          className="rounded-lg border border-primary bg-white px-2 py-1 text-xs font-bold text-slate-900 outline-none dark:bg-boxdark dark:text-white"
                        >
                          <option value={0}>0 (Minor → Inter)</option>
                          <option value={1}>1 (Inter → Minor)</option>
                          <option value={2}>2 (Minor → Full)</option>
                          <option value={3}>3 (Full → Minor)</option>
                        </select>
                      ) : (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                          {row.Flag_KM ?? 0}
                        </span>
                      )}
                    </td>

                    {/* Current Maintenance */}
                    <td className="px-3 py-3 font-semibold text-slate-900 dark:text-white">
                      <span
                        className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-bold ${
                          preview.current === "Full Service"
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                            : preview.current === "Intermediate Service"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                        }`}
                      >
                        {preview.current || "-"}
                      </span>
                    </td>

                    {/* Next Maintenance */}
                    <td className="px-3 py-3 text-slate-600 dark:text-slate-300">
                      <span
                        className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-medium ${
                          preview.next === "Full Service"
                            ? "bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400"
                            : preview.next === "Intermediate Service"
                            ? "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {preview.next || "-"}
                      </span>
                    </td>

                    {/* Current KM */}
                    <td className="px-3 py-3 text-right font-mono">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.currentKm}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              currentKm: Number(e.target.value),
                            }))
                          }
                          className="w-24 rounded-lg border border-primary bg-white px-2 py-1 text-right text-xs font-mono font-bold text-slate-900 outline-none dark:bg-boxdark dark:text-white"
                        />
                      ) : (
                        <span className="font-bold text-slate-900 dark:text-white">
                          {Number(row.Current_KM || 0).toLocaleString("id-ID")} km
                        </span>
                      )}
                    </td>

                    {/* Schedule KM */}
                    <td className="px-3 py-3 text-right font-mono">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.scheduleKm}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              scheduleKm: Number(e.target.value),
                            }))
                          }
                          className="w-24 rounded-lg border border-primary bg-white px-2 py-1 text-right text-xs font-mono font-bold text-slate-900 outline-none dark:bg-boxdark dark:text-white"
                        />
                      ) : (
                        <span className="text-slate-600 dark:text-slate-300">
                          {Number(row.Schedule_KM || 0).toLocaleString("id-ID")} km
                        </span>
                      )}
                    </td>

                    {/* Late KM */}
                    <td className="px-3 py-3 text-right font-mono">
                      <span
                        className={`font-semibold ${
                          lateVal > 0
                            ? "text-danger"
                            : lateVal === 0
                            ? "text-slate-400"
                            : "text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {lateVal > 0 ? `+${lateVal.toLocaleString("id-ID")}` : lateVal.toLocaleString("id-ID")} km
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-center">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => saveEdit(row.ID_Asset)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-sm transition hover:bg-emerald-600 disabled:opacity-50"
                            title="Simpan Perubahan"
                          >
                            <HiOutlineCheck className="text-sm font-bold" />
                          </button>
                          <button
                            type="button"
                            disabled={saving}
                            onClick={cancelEdit}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-boxdark dark:text-slate-300"
                            title="Batal"
                          >
                            <HiOutlineXMark className="text-sm" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => startEdit(row)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:text-primary dark:border-slate-700 dark:bg-boxdark-2 dark:text-slate-300 dark:hover:text-primary"
                        >
                          <HiOutlinePencilSquare className="text-xs" />
                          <span>Edit</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
