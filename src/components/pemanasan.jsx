"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FaRegUser, FaHistory } from "react-icons/fa";
import { BsFire } from "react-icons/bs";
import { formatTime, shortDate } from "@/utils/dateformat";
import { useProvider } from "@/app/appcontext";
import { CustomModal } from "./modal";

export default function Pemanasan() {
  const [dataPemanasan, setDataPemanasan] = useState([]);
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLastPage, setHistoryLastPage] = useState(1);
  const [loadMoreHistory, setLoadMoreHistory] = useState(false);

  const router = useRouter();
  const { setGensetSelectedId } = useProvider();

  // 1. Fetch data terbaru untuk tampilan card utama
  const fetch_latest = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/listpemanasan?page=1&per_page=1");
      if (res.status === 200 && res.data?.data) {
        setDataPemanasan(res.data.data.data || []);
      }
    } catch (e) {
      console.error("fetch_latest pemanasan error:", e);
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch riwayat lengkap untuk ditampilkan di modal
  const fetch_history = async (page = 1, append = false) => {
    try {
      if (append) {
        setLoadMoreHistory(true);
      } else {
        setHistoryLoading(true);
      }
      const res = await axios.get(`/api/listpemanasan?page=${page}&per_page=8`);
      if (res.status === 200 && res.data?.data) {
        const paginated = res.data.data;
        const items = paginated.data || [];
        setHistoryLastPage(paginated.last_page || 1);
        if (append) {
          setHistoryItems((prev) => [...prev, ...items]);
        } else {
          setHistoryItems(items);
        }
      }
    } catch (e) {
      console.error("fetch_history error:", e);
    } finally {
      setHistoryLoading(false);
      setLoadMoreHistory(false);
    }
  };

  const openHistoryModal = () => {
    setModalOpen(true);
    setHistoryPage(1);
    fetch_history(1, false);
  };

  const scan = (id) => {
    setGensetSelectedId(id);
    router.push("/scannergenset");
  };

  useEffect(() => {
    fetch_latest();
  }, []);

  const latestItem = dataPemanasan[0];

  const renderBadge = (step, idRequest) => {
    const s = Number(step);
    if (s === 0) {
      return (
        <button
          type="button"
          onClick={() => scan(idRequest)}
          className="rounded-lg bg-primary px-2.5 py-1 text-[11px] font-bold text-white shadow-sm transition hover:bg-primary/90"
        >
          Scan Mulai (Issued)
        </button>
      );
    }
    if (s === 1) {
      return (
        <button
          type="button"
          onClick={() => scan(idRequest)}
          className="rounded-lg bg-warning px-2.5 py-1 text-[11px] font-bold text-white shadow-sm transition hover:bg-warning/90 animate-pulse"
        >
          Scan Selesai (Running)
        </button>
      );
    }
    if (s === 2) {
      return (
        <span className="rounded-full bg-success/15 px-2.5 py-0.5 text-[10px] font-bold text-success">
          Completed
        </span>
      );
    }
    return (
      <span className="rounded-full bg-danger/15 px-2.5 py-0.5 text-[10px] font-bold text-danger">
        Missed
      </span>
    );
  };

  return (
    <div className="space-y-3">
      {loading ? (
        <div className="py-4 text-center text-xs text-body dark:text-bodydark">
          Memuat jadwal pemanasan terakhir...
        </div>
      ) : !latestItem ? (
        <div className="rounded-xl border border-dashed border-stroke p-4 text-center text-xs text-body dark:border-strokedark dark:text-bodydark">
          Belum ada jadwal pemanasan tercatat.
        </div>
      ) : (
        /* Card Pemanasan Terakhir Saja */
        <div className="rounded-xl border border-stroke bg-white p-3.5 shadow-sm dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center justify-between gap-2 border-b border-stroke/60 pb-2 dark:border-strokedark/60">
            <div className="flex items-center gap-2">
              <span className="rounded bg-danger/10 px-1.5 py-0.5 text-[10px] font-bold text-danger">
                Terakhir
              </span>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-white">
                <FaRegUser className="text-primary text-xs" />
                <span>{latestItem["Name"] || "Belum ada PIC"}</span>
              </div>
            </div>

            {renderBadge(latestItem["Step"], latestItem["ID_Request"])}
          </div>

          <div className="mt-2.5 flex items-center justify-between text-xs text-body dark:text-bodydark">
            <div>
              <span className="block text-[10px] text-slate-400">Tanggal</span>
              <span className="font-semibold text-black dark:text-white">
                {shortDate(latestItem["Time_Request"])}
              </span>
            </div>
            <div className="text-right">
              <span className="block text-[10px] text-slate-400">Jam Operasi (Start - Stop)</span>
              <span className="font-mono font-semibold text-black dark:text-white">
                {latestItem["Time_Start"] ? formatTime(latestItem["Time_Start"]) : "-"} -{" "}
                {latestItem["Time_Stop"] ? formatTime(latestItem["Time_Stop"]) : "-"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tombol Lihat Riwayat Lengkap (Membuka Modal) */}
      <div className="flex justify-end pt-1">
        <button
          type="button"
          onClick={openHistoryModal}
          className="inline-flex items-center gap-1.5 rounded-xl border border-stroke bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-strokedark dark:bg-boxdark dark:text-slate-200 dark:hover:bg-meta-4"
        >
          <FaHistory className="text-xs text-primary" />
          <span>Lihat Riwayat Lainnya</span>
        </button>
      </div>

      {/* Modal Riwayat Pemanasan Genset */}
      <CustomModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Riwayat Pemanasan Genset (BFNMF0402)"
        isSmallWidth="md"
      >
        <div className="space-y-3">
          {historyLoading && historyItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-body dark:text-bodydark">
              Memuat riwayat pemanasan...
            </div>
          ) : historyItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Tidak ada catatan riwayat pemanasan.
            </div>
          ) : (
            <div className="max-h-[60vh] space-y-2.5 overflow-y-auto pr-1">
              {historyItems.map((item, idx) => {
                const start = item["Time_Start"] ? formatTime(item["Time_Start"]) : "-";
                const stop = item["Time_Stop"] ? formatTime(item["Time_Stop"]) : "-";

                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-stroke/70 bg-slate-50/50 p-3 text-xs dark:border-strokedark/70 dark:bg-meta-4/20"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-stroke/40 pb-2 dark:border-strokedark/40">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-white">
                        <FaRegUser className="text-primary text-xs" />
                        <span>{item["Name"] || "Belum ada PIC"}</span>
                      </div>
                      {renderBadge(item["Step"], item["ID_Request"])}
                    </div>

                    <div className="mt-2 flex items-center justify-between text-body dark:text-bodydark">
                      <div>
                        <span className="block text-[10px] text-slate-400">Tanggal</span>
                        <span className="font-semibold text-black dark:text-white">
                          {shortDate(item["Time_Request"])}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[10px] text-slate-400">Jam Operasi (Start - Stop)</span>
                        <span className="font-mono font-semibold text-black dark:text-white">
                          {start} - {stop}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {historyPage < historyLastPage && (
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    disabled={loadMoreHistory}
                    onClick={() => {
                      const next = historyPage + 1;
                      setHistoryPage(next);
                      fetch_history(next, true);
                    }}
                    className="rounded-lg border border-stroke bg-white px-3.5 py-1.5 text-xs font-semibold text-body hover:bg-slate-50 dark:border-strokedark dark:bg-boxdark dark:text-bodydark dark:hover:bg-meta-4 transition"
                  >
                    {loadMoreHistory ? "Memuat..." : "Muat Riwayat Lainnya..."}
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end border-t border-stroke pt-3 dark:border-strokedark">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-xl border border-stroke bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-strokedark dark:bg-boxdark dark:text-slate-200"
            >
              Tutup
            </button>
          </div>
        </div>
      </CustomModal>
    </div>
  );
}
