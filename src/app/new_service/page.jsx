"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useMediaQuery } from "react-responsive";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import UserAuth from "@/components/auth";
import { Appbar } from "@/components/appbar";
import { useRouter } from "next/navigation";
import { PageCard } from "@/components/card";
import { GetUniqueId } from "@/utils/uniqid";
import { NotifySuccess, NotifyError } from "@/utils/notify";
import {
  FiPlus,
  FiTrash2,
  FiSearch,
  FiX,
  FiCheckCircle,
  FiCalendar,
  FiTool,
} from "react-icons/fi";

export default function NewServicePage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const isSmallScreen = useMediaQuery({ query: "(max-width: 640px)" });

  const [serviceDate, setServiceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [inputData, setInputData] = useState([]);
  const [onloadSubmit, setOnloadSubmit] = useState(false);
  const [errors, setErrors] = useState({});

  const [pendingRequests, setPendingRequests] = useState([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [activeItemIndex, setActiveItemIndex] = useState(null);
  const [keywordRequest, setKeywordRequest] = useState("");

  const addItem = () => {
    const id = GetUniqueId();
    setInputData((prev) => [
      ...prev,
      {
        index: id,
        item: "",
        unit: "Pcs",
        quantity: "1",
        date: new Date().toISOString().split("T")[0],
        remark: "",
        idRequest: "",
      },
    ]);
  };

  const removeItem = (indexId) => {
    setInputData((prev) => prev.filter((item) => item.index !== indexId));
  };

  const updateItem = (indexId, field, value) => {
    setInputData((prev) =>
      prev.map((item) =>
        item.index === indexId ? { ...item, [field]: value } : item
      )
    );
  };

  const fetchData = async () => {
    try {
      const response = await axios.post("/api/stocklist", {});
      if (response.status === 200 && response.data?.pending) {
        setPendingRequests(response.data.pending);
      }
    } catch (err) {
      console.error("Gagal load pending ticket:", err);
    }
  };

  useEffect(() => {
    setIsClient(true);
    fetchData();
    addItem();
  }, []);

  const filteredRequests = pendingRequests.filter((item) => {
    const q = keywordRequest.toLowerCase();
    return (
      (item.ID_Request || "").toLowerCase().includes(q) ||
      (item.Description || "").toLowerCase().includes(q) ||
      (item.ID_Asset || "").toLowerCase().includes(q)
    );
  });

  const handleSubmit = async () => {
    if (inputData.length === 0) {
      NotifyError("Mohon tambahkan minimal 1 item pekerjaan/jasa.");
      return;
    }

    let hasError = false;
    const newErrors = {};

    if (!serviceDate) {
      newErrors.serviceDate = true;
      hasError = true;
    }

    inputData.forEach((item) => {
      if (!item.item || !item.item.trim()) {
        newErrors[`item_${item.index}`] = true;
        hasError = true;
      }
      if (!item.quantity || Number(item.quantity) <= 0) {
        newErrors[`qty_${item.index}`] = true;
        hasError = true;
      }
      if (!item.unit || !item.unit.trim()) {
        newErrors[`unit_${item.index}`] = true;
        hasError = true;
      }
    });

    setErrors(newErrors);

    if (hasError) {
      NotifyError("Mohon lengkapi seluruh field yang wajib diisi.");
      return;
    }

    setOnloadSubmit(true);
    try {
      let uid = "SYSTEM";
      try {
        const user = localStorage.getItem("info");
        if (user) {
          const parsed = JSON.parse(user);
          uid = parsed[0]?.Uid || "SYSTEM";
        }
      } catch (e) {
        console.error(e);
      }

      const response = await axios.post("/api/newservice", {
        date: serviceDate,
        list: inputData,
        uid: uid,
      });

      if (response.status === 200) {
        NotifySuccess(
          response.data?.response || "Order service berhasil dibuat!"
        );
        router.push("/partsservice");
      }
    } catch (err) {
      console.error("Submit error:", err);
      NotifyError("Gagal menyimpan order service. Silakan coba lagi.");
    } finally {
      setOnloadSubmit(false);
    }
  };

  if (!isClient) return null;

  return (
    <UserAuth>
      {isSmallScreen ? (
        /* ================= MOBILE VIEW ================= */
        <div className="min-h-screen bg-slate-50 dark:bg-boxdark-2 text-slate-800 dark:text-slate-100 pb-28">
          <Appbar
            title="Pengajuan Jasa Luar"
            backAction={() => router.back()}
          />

          <div className="p-4 space-y-4">
            {/* Header info */}
            <div className="bg-white dark:bg-boxdark rounded-2xl p-4 shadow-sm border border-slate-200/80 dark:border-strokedark space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <FiCalendar className="text-primary" /> Tanggal Pengajuan
              </label>
              <input
                type="date"
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-strokedark bg-slate-50 dark:bg-meta-4 px-3.5 py-2.5 text-sm font-medium focus:border-primary focus:outline-none dark:text-white"
              />
            </div>

            {/* Service Items List */}
            <div className="flex items-center justify-between pt-1">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <FiTool className="text-primary" /> Daftar Pekerjaan ({inputData.length})
              </h3>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold transition-colors"
              >
                <FiPlus /> Tambah Item
              </button>
            </div>

            <div className="space-y-3">
              {inputData.map((item, idx) => (
                <div
                  key={item.index}
                  className="bg-white dark:bg-boxdark rounded-2xl p-4 shadow-sm border border-slate-200/80 dark:border-strokedark space-y-3 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black px-2 py-0.5 rounded-md bg-slate-100 dark:bg-meta-4 text-slate-600 dark:text-slate-300">
                      Item #{idx + 1}
                    </span>
                    {inputData.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(item.index)}
                        className="text-danger hover:text-red-600 p-1"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      Deskripsi Pekerjaan / Jasa *
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Bubut shaft roll, Rewinding motor 5HP"
                      value={item.item}
                      onChange={(e) => updateItem(item.index, "item", e.target.value)}
                      className={`w-full mt-1 rounded-xl border ${
                        errors[`item_${item.index}`]
                          ? "border-danger"
                          : "border-slate-200 dark:border-strokedark"
                      } bg-slate-50 dark:bg-meta-4 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:text-white`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        Jumlah *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(item.index, "quantity", e.target.value)
                        }
                        className={`w-full mt-1 rounded-xl border ${
                          errors[`qty_${item.index}`]
                            ? "border-danger"
                            : "border-slate-200 dark:border-strokedark"
                        } bg-slate-50 dark:bg-meta-4 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:text-white`}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        Satuan *
                      </label>
                      <input
                        type="text"
                        placeholder="Pcs/Lot/Set"
                        value={item.unit}
                        onChange={(e) => updateItem(item.index, "unit", e.target.value)}
                        className={`w-full mt-1 rounded-xl border ${
                          errors[`unit_${item.index}`]
                            ? "border-danger"
                            : "border-slate-200 dark:border-strokedark"
                        } bg-slate-50 dark:bg-meta-4 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:text-white`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        Tgl Dibutuhkan
                      </label>
                      <input
                        type="date"
                        value={item.date}
                        onChange={(e) => updateItem(item.index, "date", e.target.value)}
                        className="w-full mt-1 rounded-xl border border-slate-200 dark:border-strokedark bg-slate-50 dark:bg-meta-4 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        Tiket Terkait
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveItemIndex(item.index);
                          setShowRequestModal(true);
                        }}
                        className="w-full mt-1 flex items-center justify-between rounded-xl border border-dashed border-slate-300 dark:border-strokedark bg-slate-50 dark:bg-meta-4 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-primary"
                      >
                        <span className="truncate">
                          {item.idRequest || "Pilih Tiket"}
                        </span>
                        <FiSearch className="text-primary ml-1 shrink-0" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      Keterangan / Catatan
                    </label>
                    <input
                      type="text"
                      placeholder="Catatan pengerjaan khusus..."
                      value={item.remark}
                      onChange={(e) => updateItem(item.index, "remark", e.target.value)}
                      className="w-full mt-1 rounded-xl border border-slate-200 dark:border-strokedark bg-slate-50 dark:bg-meta-4 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Floating Submit */}
          <div className="fixed bottom-0 inset-x-0 bg-white/90 dark:bg-boxdark/90 backdrop-blur-md border-t border-slate-200 dark:border-strokedark p-4 z-20">
            <button
              type="button"
              disabled={onloadSubmit}
              onClick={handleSubmit}
              className="w-full py-3.5 px-4 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/25 hover:bg-primary/90 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
            >
              {onloadSubmit ? "Memproses..." : "Kirim Pengajuan Jasa Luar"}
            </button>
          </div>
        </div>
      ) : (
        /* ================= DESKTOP VIEW ================= */
        <DefaultLayout>
          <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Form Pengajuan Order Jasa Luar (DPS)
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Buat permintaan pekerjaan bubut, rewinding, fabrikasi, atau service luar
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-strokedark text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-meta-4 transition-colors"
              >
                Kembali
              </button>
            </div>

            <PageCard>
              <div className="p-6 space-y-6">
                {/* Date header */}
                <div className="w-full max-w-xs space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <FiCalendar className="text-primary" /> Tanggal Pengajuan *
                  </label>
                  <input
                    type="date"
                    value={serviceDate}
                    onChange={(e) => setServiceDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-strokedark bg-slate-50 dark:bg-meta-4 px-3.5 py-2 text-sm font-semibold focus:border-primary focus:outline-none dark:text-white"
                  />
                </div>

                {/* Table */}
                <div className="border border-slate-200 dark:border-strokedark rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-meta-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-strokedark">
                      <tr>
                        <th className="py-3 px-4 w-12 text-center">No</th>
                        <th className="py-3 px-4 min-w-[240px]">Deskripsi Pekerjaan / Jasa *</th>
                        <th className="py-3 px-4 w-28">Jumlah *</th>
                        <th className="py-3 px-4 w-28">Satuan *</th>
                        <th className="py-3 px-4 w-40">Tgl Dibutuhkan</th>
                        <th className="py-3 px-4 min-w-[200px]">Keterangan</th>
                        <th className="py-3 px-4 w-44">ID Tiket Terkait</th>
                        <th className="py-3 px-4 w-16 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-strokedark bg-white dark:bg-boxdark">
                      {inputData.map((item, index) => (
                        <tr key={item.index} className="hover:bg-slate-50/50 dark:hover:bg-meta-4/20 transition-colors">
                          <td className="py-3 px-4 text-center font-bold text-xs text-slate-400">
                            {index + 1}
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              placeholder="Deskripsi pekerjaan..."
                              value={item.item}
                              onChange={(e) => updateItem(item.index, "item", e.target.value)}
                              className={`w-full rounded-lg border ${
                                errors[`item_${item.index}`]
                                  ? "border-danger"
                                  : "border-slate-200 dark:border-strokedark"
                              } bg-slate-50 dark:bg-meta-4 px-3 py-1.5 text-sm focus:border-primary focus:outline-none dark:text-white`}
                            />
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.index, "quantity", e.target.value)}
                              className={`w-full rounded-lg border ${
                                errors[`qty_${item.index}`]
                                  ? "border-danger"
                                  : "border-slate-200 dark:border-strokedark"
                              } bg-slate-50 dark:bg-meta-4 px-3 py-1.5 text-sm focus:border-primary focus:outline-none dark:text-white`}
                            />
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              placeholder="Pcs/Lot"
                              value={item.unit}
                              onChange={(e) => updateItem(item.index, "unit", e.target.value)}
                              className={`w-full rounded-lg border ${
                                errors[`unit_${item.index}`]
                                  ? "border-danger"
                                  : "border-slate-200 dark:border-strokedark"
                              } bg-slate-50 dark:bg-meta-4 px-3 py-1.5 text-sm focus:border-primary focus:outline-none dark:text-white`}
                            />
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="date"
                              value={item.date}
                              onChange={(e) => updateItem(item.index, "date", e.target.value)}
                              className="w-full rounded-lg border border-slate-200 dark:border-strokedark bg-slate-50 dark:bg-meta-4 px-2.5 py-1.5 text-sm focus:border-primary focus:outline-none dark:text-white"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              placeholder="Catatan..."
                              value={item.remark}
                              onChange={(e) => updateItem(item.index, "remark", e.target.value)}
                              className="w-full rounded-lg border border-slate-200 dark:border-strokedark bg-slate-50 dark:bg-meta-4 px-3 py-1.5 text-sm focus:border-primary focus:outline-none dark:text-white"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveItemIndex(item.index);
                                setShowRequestModal(true);
                              }}
                              className="w-full flex items-center justify-between rounded-lg border border-dashed border-slate-300 dark:border-strokedark bg-slate-50 dark:bg-meta-4 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-primary"
                            >
                              <span className="truncate">
                                {item.idRequest || "Pilih Tiket"}
                              </span>
                              <FiSearch className="text-primary ml-1 shrink-0" />
                            </button>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {inputData.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeItem(item.index)}
                                className="text-slate-400 hover:text-danger p-1 transition-colors"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={addItem}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-meta-4 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold transition-colors"
                  >
                    <FiPlus /> Tambah Baris
                  </button>

                  <button
                    type="button"
                    disabled={onloadSubmit}
                    onClick={handleSubmit}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-md shadow-primary/25 disabled:opacity-50 transition-all"
                  >
                    <FiCheckCircle /> {onloadSubmit ? "Menyimpan..." : "Simpan Pengajuan Jasa"}
                  </button>
                </div>
              </div>
            </PageCard>
          </div>
        </DefaultLayout>
      )}

      {/* MODAL PICKER TIKET / ID REQUEST */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-boxdark rounded-2xl w-full max-w-xl shadow-2xl border border-slate-200 dark:border-strokedark overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-slate-200 dark:border-strokedark flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white text-base">
                  Pilih Tiket Kerusakan / Request
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Hubungkan jasa luar ini dengan tiket perbaikan mesin
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowRequestModal(false);
                  setKeywordRequest("");
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="p-4 border-b border-slate-200 dark:border-strokedark">
              <div className="relative">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari ID tiket, nama mesin..."
                  value={keywordRequest}
                  onChange={(e) => setKeywordRequest(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-strokedark bg-slate-50 dark:bg-meta-4 text-sm focus:border-primary focus:outline-none dark:text-white"
                />
              </div>
            </div>

            <div className="overflow-y-auto p-4 space-y-2 flex-1">
              <button
                type="button"
                onClick={() => {
                  updateItem(activeItemIndex, "idRequest", "");
                  setShowRequestModal(false);
                  setKeywordRequest("");
                }}
                className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-strokedark hover:bg-slate-50 dark:hover:bg-meta-4 transition-colors text-xs font-semibold text-slate-500"
              >
                (Tanpa Tiket / Service Umum)
              </button>

              {filteredRequests.map((req, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    updateItem(activeItemIndex, "idRequest", req.ID_Request);
                    setShowRequestModal(false);
                    setKeywordRequest("");
                  }}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-strokedark hover:border-primary bg-white dark:bg-meta-4/40 cursor-pointer transition-all hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary">
                      {req.ID_Request}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {req.ID_Asset}
                    </span>
                  </div>
                  <div className="font-semibold text-sm text-slate-800 dark:text-white mt-1">
                    {req.Description || "Tanpa deskripsi"}
                  </div>
                  {(req.Manufacture || req.Model) && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {req.Manufacture} {req.Model}
                    </div>
                  )}
                </div>
              ))}

              {filteredRequests.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-400">
                  Tidak ditemukan tiket yang cocok
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </UserAuth>
  );
}
