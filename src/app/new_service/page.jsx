"use client";
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useMediaQuery } from "react-responsive";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import UserAuth from "@/components/auth";
import { Appbar } from "@/components/appbar";
import { useRouter, useSearchParams } from "next/navigation";
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
  FiBox,
  FiLayers,
  FiCpu,
} from "react-icons/fi";

export default function NewServicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams ? searchParams.get("edit") : null;

  const [isClient, setIsClient] = useState(false);
  const isSmallScreen = useMediaQuery({ query: "(max-width: 640px)" });

  const [serviceDate, setServiceDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [inputData, setInputData] = useState([]);
  const [onloadSubmit, setOnloadSubmit] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [errors, setErrors] = useState({});

  // Reference lists
  const [pendingRequests, setPendingRequests] = useState([]);
  const [assetsList, setAssetsList] = useState([]);
  const [warehouseParts, setWarehouseParts] = useState([]);

  // Allocation Picker Modal State
  const [showPickerModal, setShowPickerModal] = useState(false);
  const [activeItemIndex, setActiveItemIndex] = useState(null);
  const [pickerTab, setPickerTab] = useState("stock"); // 'stock' | 'request' | 'asset'
  const [pickerSearch, setPickerSearch] = useState("");
  const [assetPage, setAssetPage] = useState(1);
  const [partPage, setPartPage] = useState(1);
  const assetPerPage = 10;
  const partPerPage = 10;

  const addItem = (initialProps = {}) => {
    const id = GetUniqueId();
    setInputData((prev) => [
      ...prev,
      {
        index: id,
        ids: initialProps.ids || null,
        item: initialProps.item || "",
        unit: initialProps.unit || "Pcs",
        quantity: initialProps.quantity ? String(initialProps.quantity) : "1",
        date: initialProps.date || new Date().toISOString().split("T")[0],
        remark: initialProps.remark || "",
        idRequest: initialProps.idRequest || "",
        idAsset: initialProps.idAsset || "",
        idPart: initialProps.idPart || "",
        partName: initialProps.partName || "",
        amount: initialProps.amount || 0,
        budget_pos: initialProps.budget_pos || "",
        supplier: initialProps.supplier || "",
      },
    ]);
  };

  const removeItem = (indexId) => {
    setInputData((prev) => prev.filter((item) => item.index !== indexId));
  };

  const updateItem = (indexId, field, value) => {
    setInputData((prev) =>
      prev.map((item) =>
        item.index === indexId ? { ...item, [field]: value } : item,
      ),
    );
  };

  // Mutually exclusive allocation setters
  const setAllocation = (indexId, type, data = {}) => {
    setInputData((prev) =>
      prev.map((item) => {
        if (item.index !== indexId) return item;

        if (type === "stock") {
          return {
            ...item,
            idPart: data.id_part || "",
            partName: data.description || "",
            idRequest: "",
            idAsset: "",
            item: item.item ? item.item : data.description || "",
            unit: item.unit === "Pcs" && data.unit ? data.unit : item.unit,
          };
        } else if (type === "request") {
          return {
            ...item,
            idRequest: data.ID_Request || "",
            idAsset: "",
            idPart: "",
            partName: "",
          };
        } else if (type === "asset") {
          return {
            ...item,
            idAsset: data.ID_Asset || data.id_asset || "",
            assetName: data.Description || data.description || "",
            idRequest: "",
            idPart: "",
            partName: "",
          };
        } else {
          // General / Facility (both empty)
          return {
            ...item,
            idPart: "",
            partName: "",
            idRequest: "",
            idAsset: "",
          };
        }
      }),
    );
  };

  // Fetch reference lists & existing data if in Edit mode
  const fetchInitialData = async () => {
    setLoadingData(true);
    try {
      const stockRes = await axios.post("/api/stocklist", {});
      if (stockRes.status === 200) {
        setPendingRequests(stockRes.data?.pending || []);
        const rawAssets = stockRes.data?.asset || [];
        const normalized = rawAssets.map((a) => ({
          ID_Asset: a.ID_Asset || a.id_asset || "",
          id_asset: a.id_asset || a.ID_Asset || "",
          Description: a.Description || a.description || "",
          description: a.description || a.Description || "",
          Manufacture: a.Manufacture || a.manufacture || "",
          manufacture: a.manufacture || a.Manufacture || "",
          Model: a.Model || a.model || "",
          model: a.model || a.Model || "",
          Type: a.Type || a.type || "",
          type: a.type || a.Type || "",
          Location: a.Location || a.location || "",
          location: a.location || a.Location || "",
        }));
        setAssetsList(normalized);
        setWarehouseParts(stockRes.data?.response || []);
      }

      if (editId) {
        const detailRes = await axios.post("/api/getservicedetail", {
          idRegister: editId,
        });

        if (detailRes.status === 200) {
          const order = detailRes.data?.order?.[0] || {};
          const details = detailRes.data?.detail || [];

          if (order.date_issued) {
            setServiceDate(order.date_issued.split("T")[0]);
          }

          if (details.length > 0) {
            const mapped = details.map((d) => ({
              index: d.ids || GetUniqueId(),
              ids: d.ids,
              item: d.item || "",
              unit: d.unit || "Pcs",
              quantity: String(d.quantity || 1),
              date: d.required_date ? d.required_date.split("T")[0] : "",
              remark: d.remark || "",
              idRequest: d.id_request || "",
              idAsset: d.id_asset || "",
              assetName: d.asset_name || "",
              idPart: d.id_part || "",
              partName: d.part_name || "",
              amount: d.amount || 0,
              budget_pos: d.budget_pos || "",
              supplier: d.supplier || "",
            }));
            setInputData(mapped);
          } else {
            addItem();
          }
        }
      } else {
        addItem();
      }
    } catch (err) {
      console.error("Gagal load initial data:", err);
      NotifyError("Gagal memuat data pendukung.");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
    fetchInitialData();
  }, [editId]);

  // Reset modal pagination on search query or tab change
  useEffect(() => {
    setAssetPage(1);
    setPartPage(1);
  }, [pickerSearch, pickerTab]);

  // Filtered queries & pagination for picker modal
  const allFilteredParts = useMemo(() => {
    const q = pickerSearch.toLowerCase().trim();
    if (!q) return warehouseParts;
    return warehouseParts.filter(
      (p) =>
        (p.description || "").toLowerCase().includes(q) ||
        (p.id_part || "").toLowerCase().includes(q) ||
        (p.vendor_code || "").toLowerCase().includes(q),
    );
  }, [warehouseParts, pickerSearch]);

  const totalPartPages = Math.max(1, Math.ceil(allFilteredParts.length / partPerPage));

  const paginatedParts = useMemo(() => {
    const start = (partPage - 1) * partPerPage;
    return allFilteredParts.slice(start, start + partPerPage);
  }, [allFilteredParts, partPage, partPerPage]);

  const filteredRequests = useMemo(() => {
    const q = pickerSearch.toLowerCase().trim();
    if (!q) return pendingRequests;
    return pendingRequests.filter(
      (r) =>
        (r.ID_Request || "").toLowerCase().includes(q) ||
        (r.Description || "").toLowerCase().includes(q) ||
        (r.ID_Asset || "").toLowerCase().includes(q),
    );
  }, [pendingRequests, pickerSearch]);

  const allFilteredAssets = useMemo(() => {
    const q = pickerSearch.toLowerCase().trim();
    if (!q) return assetsList;
    return assetsList.filter((a) => {
      const id = (a.ID_Asset || a.id_asset || "").toLowerCase();
      const desc = (a.Description || a.description || "").toLowerCase();
      const loc = (a.Location || a.location || "").toLowerCase();
      const mfg = (a.Manufacture || a.manufacture || "").toLowerCase();
      const mdl = (a.Model || a.model || "").toLowerCase();
      return (
        id.includes(q) ||
        desc.includes(q) ||
        loc.includes(q) ||
        mfg.includes(q) ||
        mdl.includes(q)
      );
    });
  }, [assetsList, pickerSearch]);

  const totalAssetPages = Math.max(1, Math.ceil(allFilteredAssets.length / assetPerPage));

  const paginatedAssets = useMemo(() => {
    const start = (assetPage - 1) * assetPerPage;
    return allFilteredAssets.slice(start, start + assetPerPage);
  }, [allFilteredAssets, assetPage, assetPerPage]);

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
      NotifyError("Mohon lengkapi seluruh field yang wajib diisi (*).");
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

      if (editId) {
        // Edit existing DPS
        const response = await axios.post("/api/updateservice", {
          idRegister: editId,
          date: serviceDate,
          list: inputData,
        });

        if (response.status === 200) {
          NotifySuccess(
            response.data?.response || "Form DPS berhasil diperbarui!",
          );
          router.push(`/partsservice/${editId}`);
        }
      } else {
        // Create new DPS
        const response = await axios.post("/api/newservice", {
          date: serviceDate,
          list: inputData,
          uid: uid,
        });

        if (response.status === 200) {
          NotifySuccess(
            response.data?.response ||
              "Pengajuan Jasa Luar (DPS) berhasil dibuat!",
          );
          router.push("/partsservice");
        }
      }
    } catch (err) {
      console.error("Submit error:", err);
      NotifyError("Gagal menyimpan form DPS. Silakan coba lagi.");
    } finally {
      setOnloadSubmit(false);
    }
  };

  if (!isClient) return null;

  return (
    <UserAuth>
      {isSmallScreen ? (
        /* ================= MOBILE VIEW ================= */
        <div className="min-h-screen bg-slate-50 pb-28 text-slate-800 dark:bg-boxdark-2 dark:text-slate-100">
          <Appbar
            title={
              editId ? `Edit DPS (${editId})` : "Pengajuan Jasa Luar (DPS)"
            }
            backAction={() => router.back()}
          />

          <div className="space-y-4 p-4">
            {/* Header info */}
            <div className="space-y-2 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark">
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <FiCalendar className="text-primary" /> Tanggal Pengajuan *
              </label>
              <input
                type="date"
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
              />
            </div>

            {/* Service Items List */}
            <div className="flex items-center justify-between pt-1">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-white">
                <FiTool className="text-primary" /> Rincian Pekerjaan (
                {inputData.length})
              </h3>
              <button
                type="button"
                onClick={() => addItem()}
                className="flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary/20"
              >
                <FiPlus /> Tambah Item
              </button>
            </div>

            <div className="space-y-3">
              {inputData.map((item, idx) => (
                <div
                  key={item.index}
                  className="relative space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-strokedark/50">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-black text-slate-600 dark:bg-meta-4 dark:text-slate-300">
                      Item #{idx + 1}
                    </span>
                    {inputData.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(item.index)}
                        className="hover:text-red-600 p-1 text-danger"
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
                      placeholder="Contoh: Rewinding motor 5HP, Bubut shaft roll..."
                      value={item.item}
                      onChange={(e) =>
                        updateItem(item.index, "item", e.target.value)
                      }
                      className={`mt-1 w-full rounded-xl border ${
                        errors[`item_${item.index}`]
                          ? "border-danger"
                          : "border-slate-200 dark:border-strokedark"
                      } bg-slate-50 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:bg-meta-4 dark:text-white`}
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
                        className={`mt-1 w-full rounded-xl border ${
                          errors[`qty_${item.index}`]
                            ? "border-danger"
                            : "border-slate-200 dark:border-strokedark"
                        } bg-slate-50 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:bg-meta-4 dark:text-white`}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        Satuan *
                      </label>
                      <input
                        type="text"
                        placeholder="Pcs/Unit/Lot"
                        value={item.unit}
                        onChange={(e) =>
                          updateItem(item.index, "unit", e.target.value)
                        }
                        className={`mt-1 w-full rounded-xl border ${
                          errors[`unit_${item.index}`]
                            ? "border-danger"
                            : "border-slate-200 dark:border-strokedark"
                        } bg-slate-50 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:bg-meta-4 dark:text-white`}
                      />
                    </div>
                  </div>

                  {/* Target Alokasi Picker Mobile */}
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      Alokasi / Target Hasil Servis
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveItemIndex(item.index);
                        setPickerSearch("");
                        if (item.idPart) setPickerTab("stock");
                        else if (item.idRequest) setPickerTab("request");
                        else if (item.idAsset) setPickerTab("asset");
                        else setPickerTab("stock");
                        setShowPickerModal(true);
                      }}
                      className="flex w-full items-center justify-between rounded-xl border border-dashed border-slate-300 bg-slate-50 p-2.5 text-left text-xs transition-colors hover:border-primary dark:border-strokedark dark:bg-meta-4"
                    >
                      <div className="truncate pr-2">
                        {item.idPart ? (
                          <div className="flex items-center gap-1.5">
                            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                              Stok Gudang
                            </span>
                            <span className="truncate font-semibold text-black dark:text-white">
                              {item.partName || item.idPart}
                            </span>
                          </div>
                        ) : item.idRequest ? (
                          <div className="flex items-center gap-1.5">
                            <span className="rounded bg-meta-3/15 px-1.5 py-0.5 text-[10px] font-bold text-meta-3">
                              Tiket Kerusakan
                            </span>
                            <span className="font-semibold text-black dark:text-white">
                              #{item.idRequest}
                            </span>
                          </div>
                        ) : item.idAsset ? (
                          <div className="flex items-center gap-1.5">
                            <span className="rounded bg-warning/15 px-1.5 py-0.5 text-[10px] font-bold text-warning">
                              Aset Mesin
                            </span>
                            <span className="font-semibold text-black dark:text-white truncate">
                              {item.idAsset} {item.assetName ? `• ${item.assetName}` : ""}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">
                            (Umum / Fasilitas Pabrik)
                          </span>
                        )}
                      </div>
                      <FiSearch className="shrink-0 text-primary" />
                    </button>
                    {item.idPart && (
                      <span className="mt-1 block text-[10px] text-primary">
                        *Barang akan otomatis masuk ke stok gudang saat
                        konfirmasi terima
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        Tgl Dibutuhkan
                      </label>
                      <input
                        type="date"
                        value={item.date}
                        onChange={(e) =>
                          updateItem(item.index, "date", e.target.value)
                        }
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        Keterangan
                      </label>
                      <input
                        type="text"
                        placeholder="Catatan pengerjaan..."
                        value={item.remark}
                        onChange={(e) =>
                          updateItem(item.index, "remark", e.target.value)
                        }
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Floating Submit */}
          <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/90 p-4 backdrop-blur-md dark:border-strokedark dark:bg-boxdark/90">
            <button
              type="button"
              disabled={onloadSubmit}
              onClick={handleSubmit}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 disabled:opacity-50"
            >
              <FiCheckCircle />
              {onloadSubmit
                ? "Menyimpan..."
                : editId
                  ? "Simpan Perubahan Form DPS"
                  : "Kirim Pengajuan Jasa Luar (DPS)"}
            </button>
          </div>
        </div>
      ) : (
        /* ================= DESKTOP VIEW ================= */
        <DefaultLayout>
          <div className="mx-auto max-w-7xl space-y-6 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
                  <FiTool className="text-primary" />
                  {editId
                    ? `Edit Form Pengajuan Order Jasa Luar (DPS: ${editId})`
                    : "Form Pengajuan Order Jasa Luar (DPS)"}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Buat atau perbarui pengajuan pekerjaan bubut, rewinding,
                  fabrikasi, overhaul, atau servis luar
                </p>
              </div>

              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:border-strokedark dark:text-slate-300 dark:hover:bg-meta-4"
              >
                Kembali
              </button>
            </div>

            <PageCard>
              <div className="space-y-6 p-6">
                {/* Date header */}
                <div className="w-full max-w-xs space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <FiCalendar className="text-primary" /> Tanggal Pengajuan *
                  </label>
                  <input
                    type="date"
                    value={serviceDate}
                    onChange={(e) => setServiceDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-semibold focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                  />
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm dark:border-strokedark">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 dark:border-strokedark dark:bg-meta-4 dark:text-slate-400">
                      <tr>
                        <th className="w-10 px-3 py-3 text-center">No</th>
                        <th className="min-w-[220px] px-3 py-3">
                          Deskripsi Pekerjaan / Jasa *
                        </th>
                        <th className="w-24 px-3 py-3">Jumlah *</th>
                        <th className="w-24 px-3 py-3">Satuan *</th>
                        <th className="min-w-[210px] px-3 py-3">
                          Target Alokasi (Stok/Kerusakan/Aset)
                        </th>
                        <th className="w-36 px-3 py-3">Tgl Butuh</th>
                        <th className="min-w-[150px] px-3 py-3">Keterangan</th>
                        <th className="w-12 px-3 py-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white dark:divide-strokedark dark:bg-boxdark">
                      {inputData.map((item, index) => (
                        <tr
                          key={item.index}
                          className="transition-colors hover:bg-slate-50/50 dark:hover:bg-meta-4/20"
                        >
                          <td className="px-3 py-3 text-center text-xs font-bold text-slate-400">
                            {index + 1}
                          </td>
                          <td className="px-3 py-3">
                            <input
                              type="text"
                              placeholder="Deskripsi pekerjaan..."
                              value={item.item}
                              onChange={(e) =>
                                updateItem(item.index, "item", e.target.value)
                              }
                              className={`w-full rounded-lg border ${
                                errors[`item_${item.index}`]
                                  ? "border-danger"
                                  : "border-slate-200 dark:border-strokedark"
                              } bg-slate-50 px-3 py-1.5 text-sm focus:border-primary focus:outline-none dark:bg-meta-4 dark:text-white`}
                            />
                          </td>
                          <td className="px-3 py-3">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                updateItem(
                                  item.index,
                                  "quantity",
                                  e.target.value,
                                )
                              }
                              className={`w-full rounded-lg border ${
                                errors[`qty_${item.index}`]
                                  ? "border-danger"
                                  : "border-slate-200 dark:border-strokedark"
                              } bg-slate-50 px-3 py-1.5 text-sm focus:border-primary focus:outline-none dark:bg-meta-4 dark:text-white`}
                            />
                          </td>
                          <td className="px-3 py-3">
                            <input
                              type="text"
                              placeholder="Pcs/Unit"
                              value={item.unit}
                              onChange={(e) =>
                                updateItem(item.index, "unit", e.target.value)
                              }
                              className={`w-full rounded-lg border ${
                                errors[`unit_${item.index}`]
                                  ? "border-danger"
                                  : "border-slate-200 dark:border-strokedark"
                              } bg-slate-50 px-3 py-1.5 text-sm focus:border-primary focus:outline-none dark:bg-meta-4 dark:text-white`}
                            />
                          </td>
                          <td className="px-3 py-3">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveItemIndex(item.index);
                                setPickerSearch("");
                                if (item.idPart) setPickerTab("stock");
                                else if (item.idRequest)
                                  setPickerTab("request");
                                else if (item.idAsset) setPickerTab("asset");
                                else setPickerTab("stock");
                                setShowPickerModal(true);
                              }}
                              className="flex w-full items-center justify-between rounded-lg border border-dashed border-slate-300 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold transition-colors hover:border-primary dark:border-strokedark dark:bg-meta-4"
                            >
                              <div className="truncate pr-1 text-left">
                                {item.idPart ? (
                                  <span className="font-bold text-primary">
                                    [Stok] {item.partName || item.idPart}
                                  </span>
                                ) : item.idRequest ? (
                                  <span className="font-bold text-meta-3">
                                    [Tiket] #{item.idRequest}
                                  </span>
                                ) : item.idAsset ? (
                                  <span className="font-bold text-warning truncate block">
                                    [Aset] {item.idAsset} {item.assetName ? `• ${item.assetName}` : ""}
                                  </span>
                                ) : (
                                  <span className="font-normal text-slate-400">
                                    Umum / Beban Pabrik
                                  </span>
                                )}
                              </div>
                              <FiSearch className="ml-1 shrink-0 text-xs text-primary" />
                            </button>
                          </td>
                          <td className="px-3 py-3">
                            <input
                              type="date"
                              value={item.date}
                              onChange={(e) =>
                                updateItem(item.index, "date", e.target.value)
                              }
                              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                            />
                          </td>
                          <td className="px-3 py-3">
                            <input
                              type="text"
                              placeholder="Catatan..."
                              value={item.remark}
                              onChange={(e) =>
                                updateItem(item.index, "remark", e.target.value)
                              }
                              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                            />
                          </td>
                          <td className="px-3 py-3 text-center">
                            {inputData.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeItem(item.index)}
                                className="p-1 text-slate-400 transition-colors hover:text-danger"
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
                    onClick={() => addItem()}
                    className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-meta-4 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    <FiPlus /> Tambah Baris
                  </button>

                  <button
                    type="button"
                    disabled={onloadSubmit}
                    onClick={handleSubmit}
                    className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-primary/25 transition-all hover:bg-primary/90 disabled:opacity-50"
                  >
                    <FiCheckCircle />
                    {onloadSubmit
                      ? "Menyimpan..."
                      : editId
                        ? "Simpan Perubahan Form DPS"
                        : "Simpan Pengajuan Jasa (DPS)"}
                  </button>
                </div>
              </div>
            </PageCard>
          </div>
        </DefaultLayout>
      )}

      {/* ALLOCATION PICKER MODAL (STOCK / TIKET KERUSAKAN / ASET LANGSUNG / UMUM) */}
      {showPickerModal && (
        <div className="fixed inset-0 z-999999 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-strokedark dark:bg-boxdark">
            <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-strokedark">
              <div>
                <h3 className="flex items-center gap-2 text-base font-bold text-slate-800 dark:text-white">
                  <FiLayers className="text-primary" />
                  Pilih Alokasi Target Servis
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tentukan apakah jasa ini untuk stok gudang, tiket kerusakan,
                  aset langsung, atau beban umum
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowPickerModal(false);
                  setPickerSearch("");
                }}
                className="rounded-xl p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-meta-4 dark:hover:text-white"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Tab Selector */}
            <div className="flex gap-1.5 border-b border-slate-200 bg-slate-50 p-1.5 text-xs font-bold dark:border-strokedark dark:bg-meta-4/30">
              <button
                type="button"
                onClick={() => {
                  setPickerTab("stock");
                  setPickerSearch("");
                }}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 transition-all ${
                  pickerTab === "stock"
                    ? "bg-primary text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-meta-4"
                }`}
              >
                <FiBox />
                <span>Masuk Stok Gudang</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPickerTab("request");
                  setPickerSearch("");
                }}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 transition-all ${
                  pickerTab === "request"
                    ? "bg-meta-3 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-meta-4"
                }`}
              >
                <FiTool />
                <span>Tiket Kerusakan</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPickerTab("asset");
                  setPickerSearch("");
                }}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 transition-all ${
                  pickerTab === "asset"
                    ? "bg-warning text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-meta-4"
                }`}
              >
                <FiCpu />
                <span>Aset Langsung</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="border-b border-slate-200 p-3 dark:border-strokedark">
              <div className="relative">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={
                    pickerTab === "stock"
                      ? "Cari nama part, kode vendor, atau ID part..."
                      : pickerTab === "request"
                        ? "Cari ID tiket, kendala, atau ID aset..."
                        : "Cari kode aset, nama mesin, lokasi..."
                  }
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-xs font-medium focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                />
              </div>
            </div>

            {/* List Content */}
            <div className="flex-1 space-y-2 overflow-y-auto p-3">
              {/* Option 0: Reset to General / Facility */}
              <button
                type="button"
                onClick={() => {
                  setAllocation(activeItemIndex, "general");
                  setShowPickerModal(false);
                  setPickerSearch("");
                }}
                className="flex w-full items-center justify-between rounded-xl border border-dashed border-slate-300 p-2.5 text-left text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-strokedark dark:text-slate-300 dark:hover:bg-meta-4"
              >
                <span>(Tanpa Tiket / Servis Umum / Beban Pabrik)</span>
                <span className="text-[10px] text-slate-400">
                  Pilih ini jika beban umum
                </span>
              </button>

              {/* TAB 1: STOK GUDANG */}
              {pickerTab === "stock" && (
                <>
                  <div className="flex items-center justify-between px-1 pt-1 text-[11px] font-semibold text-primary">
                    <span>Pilih suku cadang dari database gudang (otomatis masuk stok saat diterima):</span>
                    <span className="text-[10px] text-slate-400">
                      Total {allFilteredParts.length} item
                    </span>
                  </div>
                  {paginatedParts.map((part) => (
                    <div
                      key={part.id_part}
                      onClick={() => {
                        setAllocation(activeItemIndex, "stock", part);
                        setShowPickerModal(false);
                        setPickerSearch("");
                      }}
                      className="cursor-pointer rounded-xl border border-slate-200 bg-white p-3 transition-all hover:border-primary hover:shadow-sm dark:border-strokedark dark:bg-meta-4/40"
                    >
                      <div className="flex items-center justify-between">
                        {/* <span className="text-xs font-bold text-primary font-mono">
                          {part.id_part}
                        </span> */}
                        <span className="font-mono text-[11px] text-slate-500">
                          Stok: {part.available ?? part.stock ?? 0}{" "}
                          {part.unit || "pcs"}
                        </span>
                      </div>
                      <div className="mt-0.5 text-sm font-semibold text-slate-800 dark:text-white">
                        {part.description}
                      </div>
                      {part.vendor_code && (
                        <div className="text-[11px] text-slate-400">
                          Kode: {part.vendor_code}{" "}
                          {part.location ? `• Lokasi: ${part.location}` : ""}
                        </div>
                      )}
                    </div>
                  ))}
                  {allFilteredParts.length === 0 && (
                    <div className="py-8 text-center text-xs text-slate-400">
                      Tidak ditemukan suku cadang yang sesuai
                    </div>
                  )}

                  {/* Pagination Tab 1 */}
                  {totalPartPages > 1 && (
                    <div className="sticky bottom-0 mt-3 flex items-center justify-between rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-sm backdrop-blur-sm dark:border-strokedark dark:bg-meta-4/95">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Hal <strong className="text-primary">{partPage}</strong>/{totalPartPages} (
                        {Math.min((partPage - 1) * partPerPage + 1, allFilteredParts.length)} -{" "}
                        {Math.min(partPage * partPerPage, allFilteredParts.length)} dari{" "}
                        {allFilteredParts.length})
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={partPage <= 1}
                          onClick={() => setPartPage((p) => Math.max(1, p - 1))}
                          className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-strokedark dark:text-slate-300 dark:hover:bg-meta-4"
                        >
                          ← Sebelumnya
                        </button>
                        <button
                          type="button"
                          disabled={partPage >= totalPartPages}
                          onClick={() => setPartPage((p) => Math.min(totalPartPages, p + 1))}
                          className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-strokedark dark:text-slate-300 dark:hover:bg-meta-4"
                        >
                          Selanjutnya →
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* TAB 2: TIKET KERUSAKAN */}
              {pickerTab === "request" && (
                <>
                  <div className="px-1 pt-1 text-[11px] font-semibold text-meta-3">
                    Pilih tiket perbaikan mesin yang sedang berjalan:
                  </div>
                  {filteredRequests.map((req) => (
                    <div
                      key={req.ID_Request}
                      onClick={() => {
                        setAllocation(activeItemIndex, "request", req);
                        setShowPickerModal(false);
                        setPickerSearch("");
                      }}
                      className="cursor-pointer rounded-xl border border-slate-200 bg-white p-3 transition-all hover:border-meta-3 hover:shadow-sm dark:border-strokedark dark:bg-meta-4/40"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-meta-3">
                          #{req.ID_Request}
                        </span>
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                          {req.ID_Asset}
                        </span>
                      </div>
                      <div className="mt-0.5 text-sm font-semibold text-slate-800 dark:text-white">
                        {req.Problem || req.Description || "Tanpa keluhan"}
                      </div>
                      {req.Manufacture && (
                        <div className="text-[11px] text-slate-400">
                          {req.Manufacture} {req.Model || ""}
                        </div>
                      )}
                    </div>
                  ))}
                  {filteredRequests.length === 0 && (
                    <div className="py-8 text-center text-xs text-slate-400">
                      Tidak ditemukan tiket kerusakan terbuka
                    </div>
                  )}
                </>
              )}

              {/* TAB 3: ASET LANGSUNG */}
              {pickerTab === "asset" && (
                <>
                  <div className="flex items-center justify-between px-1 pt-1 text-[11px] font-semibold text-warning">
                    <span>Pilih aset mesin produksi / kendaraan langsung:</span>
                    <span className="text-[10px] text-slate-400">
                      Total {allFilteredAssets.length} aset
                    </span>
                  </div>
                  {paginatedAssets.map((ast) => {
                    const assetId = ast.ID_Asset || ast.id_asset;
                    const desc = ast.Description || ast.description;
                    const mfg = ast.Manufacture || ast.manufacture || "-";
                    const mdl = ast.Model || ast.model || "";
                    const loc = ast.Location || ast.location || "";
                    const type = ast.Type || ast.type || "ASET";

                    return (
                      <div
                        key={assetId}
                        onClick={() => {
                          setAllocation(activeItemIndex, "asset", ast);
                          setShowPickerModal(false);
                          setPickerSearch("");
                        }}
                        className="cursor-pointer rounded-xl border border-slate-200 bg-white p-3 transition-all hover:border-warning hover:shadow-sm dark:border-strokedark dark:bg-meta-4/40"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-warning">
                            {assetId}
                          </span>
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-meta-4 dark:text-slate-300">
                            {type}
                          </span>
                        </div>
                        <div className="mt-0.5 text-sm font-semibold text-slate-800 dark:text-white">
                          {desc || "Tanpa deskripsi"}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {mfg} {mdl ? `• ${mdl}` : ""} {loc ? `• ${loc}` : ""}
                        </div>
                      </div>
                    );
                  })}
                  {allFilteredAssets.length === 0 && (
                    <div className="py-8 text-center text-xs text-slate-400">
                      Tidak ditemukan aset mesin yang sesuai
                    </div>
                  )}

                  {/* Pagination Tab 3 */}
                  {totalAssetPages > 1 && (
                    <div className="sticky bottom-0 mt-3 flex items-center justify-between rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-sm backdrop-blur-sm dark:border-strokedark dark:bg-meta-4/95">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Hal <strong className="text-warning">{assetPage}</strong>/{totalAssetPages} (
                        {Math.min((assetPage - 1) * assetPerPage + 1, allFilteredAssets.length)} -{" "}
                        {Math.min(assetPage * assetPerPage, allFilteredAssets.length)} dari{" "}
                        {allFilteredAssets.length} aset)
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={assetPage <= 1}
                          onClick={() => setAssetPage((p) => Math.max(1, p - 1))}
                          className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-strokedark dark:text-slate-300 dark:hover:bg-meta-4"
                        >
                          ← Sebelumnya
                        </button>
                        <button
                          type="button"
                          disabled={assetPage >= totalAssetPages}
                          onClick={() => setAssetPage((p) => Math.min(totalAssetPages, p + 1))}
                          className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-strokedark dark:text-slate-300 dark:hover:bg-meta-4"
                        >
                          Selanjutnya →
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </UserAuth>
  );
}
