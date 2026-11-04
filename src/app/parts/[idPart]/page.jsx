"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "react-responsive";
import UserAuth from "@/components/auth";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { PageCard } from "@/components/card";
import { CommonInput } from "@/components/input";
import { PageLoader, DetailSkeleton } from "@/components/loader";
import { formatDateLocal } from "@/utils/dateformat";
import { NotifyError, NotifySuccess } from "@/utils/notify";

// Icons
import {
  HiArrowLeft,
  HiOutlineTrash,
  HiOutlineCalendar,
  HiOutlineCube,
  HiOutlineLocationMarker,
  HiOutlineTag,
} from "react-icons/hi";
import { HiOutlineArrowDownTray, HiOutlineArrowUpTray } from "react-icons/hi2";
import { BsBoxSeam } from "react-icons/bs";

export default function DetailPart({ params }) {
  const router = useRouter();
  const isSmallScreen = useMediaQuery({ query: "(max-width: 640px)" });

  const [loader, setLoader] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [detailData, setDetailData] = useState({});
  const [stockData, setStockData] = useState([]);

  const getFirstDate = () => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1).toISOString().substring(0, 10);
  };

  const [startDate, setStartDate] = useState(getFirstDate());
  const [endDate, setEndDate] = useState(new Date().toISOString().substring(0, 10));

  const [deleteOnload, setDeleteOnload] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const fetch_data = async () => {
    try {
      const response = await axios.post("/api/getpartdetail", { idPart: params.idPart });
      if (response.status === 200 && response.data?.response?.length > 0) {
        setDetailData(response.data.response[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoader(false);
    }
  };

  const fetch_stock_data = async () => {
    try {
      const response = await axios.post("/api/getstockcard", {
        idPart: params.idPart,
        startDate: startDate,
        endDate: endDate,
      });

      if (response.status === 200) {
        const array = response.data["response"] || [];
        setStockData([...array].reverse());
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (startDate > endDate) {
      setEndDate(startDate);
    }
  }, [startDate, endDate]);

  const delete_part = async () => {
    setDeleteOnload(true);
    try {
      const response = await axios.post("/api/deletepart", {
        idPart: params.idPart,
      });

      if (response.status === 200) {
        const error = response.data["error"];
        const message = response.data["message"];
        if (error === 0) {
          NotifySuccess(message);
          router.push("/parts");
        } else {
          NotifyError(message);
        }
      }
    } catch (e) {
      NotifyError("Gagal menghapus suku cadang");
    } finally {
      setDeleteOnload(false);
      setDeleteConfirm(false);
    }
  };

  useEffect(() => {
    fetch_data();
    setIsClient(true);
  }, [params.idPart]);

  useEffect(() => {
    if (params.idPart && startDate && endDate) {
      fetch_stock_data();
    }
  }, [params.idPart, startDate, endDate]);

  if (!isClient) return null;

  const availableStock = Number(detailData["available"] || 0);

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
              <div className="flex flex-col items-center max-w-[200px]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  Detail Suku Cadang
                </span>
                <span className="text-xs font-bold text-black dark:text-white truncate">
                  {detailData["description"] || "Part"}
                </span>
              </div>
              <div className="w-9" />
            </div>

            {loader ? (
              <DetailSkeleton />
            ) : (
              <div className="p-4 space-y-4">
                {/* Part Overview Card */}
              <div className="rounded-2xl border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h2 className="text-base font-bold text-black dark:text-white leading-tight">
                      {detailData["description"]}
                    </h2>
                    {detailData["vendor_code"] && (
                      <span className="font-mono text-xs text-body dark:text-bodydark">
                        Part No: {detailData["vendor_code"]}
                      </span>
                    )}
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold shrink-0 ${
                      availableStock > 0
                        ? "bg-success/15 text-success"
                        : "bg-danger/15 text-danger"
                    }`}
                  >
                    {availableStock} {detailData["unit"] || "pcs"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs border-t border-stroke/60 pt-3 dark:border-strokedark/60">
                  <div className="rounded-xl bg-gray-50 dark:bg-meta-4/20 p-2.5">
                    <span className="block text-[10px] text-body dark:text-bodydark">Lokasi Rak</span>
                    <span className="font-semibold text-black dark:text-white truncate block">
                      {detailData["location"] || "-"}
                    </span>
                  </div>
                  <div className="rounded-xl bg-gray-50 dark:bg-meta-4/20 p-2.5">
                    <span className="block text-[10px] text-body dark:text-bodydark">Satuan</span>
                    <span className="font-semibold text-black dark:text-white">
                      {detailData["unit"] || "pcs"}
                    </span>
                  </div>
                </div>

                {detailData["remark"] && (
                  <div className="mt-2 text-xs text-body dark:text-bodydark italic bg-gray-50 dark:bg-meta-4/20 p-2.5 rounded-xl">
                    Catatan: {detailData["remark"]}
                  </div>
                )}

                {/* Delete button option */}
                <div className="mt-3 pt-3 border-t border-stroke/60 dark:border-strokedark/60 flex justify-end">
                  {deleteConfirm ? (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-body dark:text-bodydark">Hapus part ini?</span>
                      <button
                        type="button"
                        disabled={deleteOnload}
                        onClick={delete_part}
                        className="rounded-lg bg-danger px-3 py-1 font-bold text-white shadow hover:bg-opacity-90"
                      >
                        {deleteOnload ? "..." : "Ya, Hapus"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirm(false)}
                        className="rounded-lg bg-gray-100 dark:bg-meta-4 px-3 py-1 font-medium text-black dark:text-white"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm(true)}
                      className="flex items-center gap-1.5 text-xs text-danger hover:underline"
                    >
                      <HiOutlineTrash className="text-sm" />
                      <span>Hapus Suku Cadang</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Date Filter */}
              <div className="rounded-2xl border border-stroke bg-white p-3 shadow-sm dark:border-strokedark dark:bg-boxdark">
                <span className="text-[11px] font-bold uppercase tracking-wider text-body dark:text-bodydark block mb-2">
                  Periode Kartu Stok
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <CommonInput
                    type="date"
                    input={startDate}
                    onInputChange={(val) => setStartDate(val)}
                  />
                  <CommonInput
                    type="date"
                    input={endDate}
                    onInputChange={(val) => setEndDate(val)}
                  />
                </div>
              </div>

              {/* Stock Movement Feed */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-black dark:text-white block px-1">
                  Mutasi & Riwayat Kartu Stok
                </span>
                {stockData.length === 0 ? (
                  <div className="rounded-2xl border border-stroke bg-white p-8 text-center text-xs text-body dark:border-strokedark dark:bg-boxdark dark:text-bodydark">
                    Tidak ada catatan pergerakan stok pada periode ini.
                  </div>
                ) : (
                  stockData.map((item, idx) => {
                    const isBefore = idx === stockData.length - 1;
                    const qtyIn = Number(item.in || 0);
                    const qtyOut = Number(item.out || 0);

                    return (
                      <div
                        key={idx}
                        className={`rounded-2xl border p-3 shadow-sm ${
                          isBefore
                            ? "border-primary/30 bg-primary/5 dark:bg-primary/10"
                            : "border-stroke bg-white dark:border-strokedark dark:bg-boxdark"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-semibold text-black dark:text-white">
                            {isBefore ? "Saldo Awal Periode" : formatDateLocal(item.date)}
                          </span>
                          <span className="font-mono font-bold text-primary">
                            Saldo: {item.balance}
                          </span>
                        </div>

                        {!isBefore && (
                          <div className="flex items-center justify-between border-t border-stroke/50 pt-2 text-xs dark:border-strokedark/50">
                            <div className="flex items-center gap-2">
                              {qtyIn > 0 && (
                                <span className="inline-flex items-center gap-1 font-semibold text-success">
                                  <HiOutlineArrowDownTray /> +{qtyIn} Masuk
                                </span>
                              )}
                              {qtyOut > 0 && (
                                <span className="inline-flex items-center gap-1 font-semibold text-warning">
                                  <HiOutlineArrowUpTray /> -{qtyOut} Keluar
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-body dark:text-bodydark text-right">
                              <span>{item.subject || item.asset || item.request || "-"}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
          /* ================= DESKTOP VIEW ================= */
          <DefaultLayout>
            {loader ? (
              <DetailSkeleton />
            ) : (
              <div className="mx-auto max-w-7xl space-y-6">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => router.push("/parts")}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-stroke bg-white text-black hover:bg-gray-50 dark:border-strokedark dark:bg-boxdark dark:text-white dark:hover:bg-meta-4/20 transition-all shadow-sm"
                  >
                    <HiArrowLeft className="text-xl" />
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-primary">
                        {detailData["vendor_code"] || "PART"}
                      </span>
                    </div>
                    <h1 className="text-xl font-bold text-black dark:text-white">
                      {detailData["description"] || "Detail Suku Cadang"}
                    </h1>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      availableStock > 0
                        ? "bg-success/15 text-success"
                        : "bg-danger/15 text-danger"
                    }`}
                  >
                    Stok Saat Ini: {availableStock} {detailData["unit"] || "pcs"}
                  </span>
                </div>
              </div>

              {/* Part Spec Card */}
              <PageCard>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-stroke pb-3 dark:border-strokedark">
                    <h2 className="text-base font-bold text-black dark:text-white">
                      Spesifikasi Suku Cadang
                    </h2>

                    {deleteConfirm ? (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-body dark:text-bodydark">Yakin ingin menghapus?</span>
                        <button
                          type="button"
                          disabled={deleteOnload}
                          onClick={delete_part}
                          className="rounded-lg bg-danger px-3 py-1.5 font-bold text-white shadow hover:bg-opacity-90"
                        >
                          {deleteOnload ? "Menghapus..." : "Ya, Hapus Part"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(false)}
                          className="rounded-lg border border-stroke px-3 py-1.5 font-medium text-black dark:border-strokedark dark:text-white"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteConfirm(true)}
                        className="flex items-center gap-1.5 text-xs text-danger hover:underline"
                      >
                        <HiOutlineTrash className="text-sm" />
                        <span>Hapus Suku Cadang</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div className="rounded-xl bg-gray-50 p-3 dark:bg-meta-4/20">
                      <span className="block text-[10px] text-body dark:text-bodydark">Deskripsi</span>
                      <span className="font-semibold text-black dark:text-white truncate block">
                        {detailData["description"]}
                      </span>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-3 dark:bg-meta-4/20">
                      <span className="block text-[10px] text-body dark:text-bodydark">Part Number / Vendor</span>
                      <span className="font-mono font-bold text-black dark:text-white">
                        {detailData["vendor_code"] || "-"}
                      </span>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-3 dark:bg-meta-4/20">
                      <span className="block text-[10px] text-body dark:text-bodydark">Lokasi Gudang / Rak</span>
                      <span className="font-semibold text-black dark:text-white">
                        {detailData["location"] || "-"}
                      </span>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-3 dark:bg-meta-4/20">
                      <span className="block text-[10px] text-body dark:text-bodydark">Satuan Ukur</span>
                      <span className="font-semibold text-black dark:text-white">
                        {detailData["unit"] || "pcs"}
                      </span>
                    </div>
                  </div>

                  {detailData["remark"] && (
                    <div className="rounded-xl bg-gray-50 p-3 text-xs text-body dark:bg-meta-4/20 dark:text-bodydark">
                      <span className="font-semibold text-black dark:text-white">Catatan: </span>
                      {detailData["remark"]}
                    </div>
                  )}
                </div>
              </PageCard>

              {/* Stock Card (Kartu Stok) Table Card */}
              <PageCard>
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stroke pb-4 dark:border-strokedark">
                    <div>
                      <h3 className="text-base font-bold text-black dark:text-white">
                        Kartu Stok Barang
                      </h3>
                      <p className="text-xs text-body dark:text-bodydark">
                        Catatan kronologis penerimaan, pengeluaran, dan sisa saldo barang
                      </p>
                    </div>

                    {/* Date Pickers */}
                    <div className="flex items-center gap-2">
                      <div className="w-36">
                        <CommonInput
                          type="date"
                          input={startDate}
                          onInputChange={(val) => setStartDate(val)}
                        />
                      </div>
                      <span className="text-xs text-body dark:text-bodydark">s/d</span>
                      <div className="w-36">
                        <CommonInput
                          type="date"
                          input={endDate}
                          onInputChange={(val) => setEndDate(val)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto text-left text-xs">
                      <thead>
                        <tr className="border-b border-stroke bg-gray-50 text-body dark:border-strokedark dark:bg-meta-4/20 dark:text-bodydark">
                          <th className="py-3 px-4 font-semibold">Tanggal</th>
                          <th className="py-3 px-4 font-semibold text-center text-success">Masuk (+)</th>
                          <th className="py-3 px-4 font-semibold text-center text-warning">Keluar (-)</th>
                          <th className="py-3 px-4 font-semibold text-center text-primary">Saldo Akhir</th>
                          <th className="py-3 px-4 font-semibold">Keterangan / Tujuan</th>
                          <th className="py-3 px-4 font-semibold">Aset Terkait</th>
                          <th className="py-3 px-4 font-semibold">No. Request</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stroke dark:divide-strokedark">
                        {stockData.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-body dark:text-bodydark">
                              Tidak ada riwayat pergerakan stok pada periode terpilih.
                            </td>
                          </tr>
                        ) : (
                          stockData.map((item, index) => {
                            const isBefore = index === stockData.length - 1;
                            const qtyIn = Number(item["in"] || 0);
                            const qtyOut = Number(item["out"] || 0);

                            return (
                              <tr
                                key={index}
                                className={`transition-colors ${
                                  isBefore
                                    ? "bg-primary/5 dark:bg-primary/10 font-bold"
                                    : "hover:bg-gray-50 dark:hover:bg-meta-4/10"
                                }`}
                              >
                                <td className="py-3 px-4 whitespace-nowrap text-black dark:text-white">
                                  {isBefore ? "Saldo Awal Periode" : formatDateLocal(item["date"])}
                                </td>
                                <td className="py-3 px-4 text-center font-bold text-success">
                                  {isBefore ? "" : qtyIn > 0 ? `+${qtyIn}` : "-"}
                                </td>
                                <td className="py-3 px-4 text-center font-bold text-warning">
                                  {isBefore ? "" : qtyOut > 0 ? `-${qtyOut}` : "-"}
                                </td>
                                <td className="py-3 px-4 text-center font-mono font-bold text-primary">
                                  {item["balance"]}
                                </td>
                                <td className="py-3 px-4 text-body dark:text-bodydark">
                                  {item["subject"] || "-"}
                                </td>
                                <td className="py-3 px-4 font-mono text-body dark:text-bodydark">
                                  {item["asset"] || "-"}
                                </td>
                                <td className="py-3 px-4 font-mono text-body dark:text-bodydark">
                                  {item["request"] || "-"}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </PageCard>
            </div>
          )}
          </DefaultLayout>
        )}
      </div>
    </UserAuth>
  );
}
