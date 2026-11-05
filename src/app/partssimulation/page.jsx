"use client";
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import UserAuth from "@/components/auth";
import { PageLoader } from "@/components/loader";
import { CustomModal } from "@/components/modal";
import { NotifySuccess, NotifyError } from "@/utils/notify";

// Icons
import {
  HiOutlineCalculator,
  HiOutlineMagnifyingGlass,
  HiOutlinePrinter,
  HiOutlineClipboardDocumentCheck,
  HiOutlineClock,
  HiOutlineCube,
  HiOutlineArrowPath,
  HiOutlineInformationCircle,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineXMark,
  HiOutlinePencilSquare,
} from "react-icons/hi2";
import { BsBoxSeam, BsCartPlus, BsShieldCheck } from "react-icons/bs";

export default function PartsSimulationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [catalog, setCatalog] = useState([]);
  const [globalLeadTime, setGlobalLeadTime] = useState(14);

  // Simulation Parameters
  const [targetMonths, setTargetMonths] = useState(6);
  const [safetyBufferPct, setSafetyBufferPct] = useState(10); // 0%, 10%, 20%
  const [searchSelected, setSearchSelected] = useState("");
  const [selectedPartIds, setSelectedPartIds] = useState(new Set());
  const [customOverrides, setCustomOverrides] = useState({}); // { [idPart]: { monthly_rate?: number, lead_time_days?: number } }

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerFilter, setPickerFilter] = useState("all"); // 'all' | 'low_stock' | 'active_usage'
  const [pickerTempSelected, setPickerTempSelected] = useState(new Set());
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Fetch simulation data from API
  const fetchSimulationData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/partssimulation");
      if (res.status === 200 && res.data?.parts) {
        setCatalog(res.data.parts);
        if (res.data.global_avg_lead_time) {
          setGlobalLeadTime(res.data.global_avg_lead_time);
        }
      }
    } catch (err) {
      console.error("fetchSimulationData error:", err);
      NotifyError("Gagal memuat data suku cadang untuk simulasi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSimulationData();
  }, []);

  // Compute calculated metrics for catalog items
  const enrichedCatalog = useMemo(() => {
    return catalog.map((item) => {
      const partId = String(item.id_part).trim();
      const override = customOverrides[partId] || {};

      const effectiveMonthlyRate =
        override.monthly_rate !== undefined
          ? Math.max(0, Number(override.monthly_rate))
          : Number(item.monthly_rate || 0);

      const effectiveLeadTime =
        override.lead_time_days !== undefined
          ? Math.max(1, Number(override.lead_time_days))
          : Math.max(1, Number(item.lead_time_days || globalLeadTime || 14));

      // Formula:
      // 1. Period Demand = Monthly Rate * Target Months
      const periodDemand = Math.round(effectiveMonthlyRate * targetMonths);

      // 2. Lead Time Demand = (Monthly Rate / 30) * Lead Time Days
      const leadTimeDemand = Math.round(
        (effectiveMonthlyRate / 30) * effectiveLeadTime,
      );

      // 3. Safety Buffer = (Period Demand + Lead Time Demand) * (Safety % / 100)
      const safetyBuffer = Math.round(
        (periodDemand + leadTimeDemand) * (safetyBufferPct / 100),
      );

      // 4. Gross Demand = Period + Lead Time + Buffer
      const grossDemand = periodDemand + leadTimeDemand + safetyBuffer;

      // 5. Net Order Recommendation = Gross Demand - Current Stock - On Order Stock
      const availableStock = Number(item.available_stock || 0);
      const onOrderQty = Number(item.on_order_qty || 0);
      const netOrderQty = Math.max(
        0,
        Math.ceil(grossDemand - availableStock - onOrderQty),
      );

      // 6. Estimated Cost
      const unitPrice = Number(item.unit_price || 0);
      const totalEstimatedCost = netOrderQty * unitPrice;

      const isSelected = selectedPartIds.has(partId);

      return {
        ...item,
        effective_monthly_rate: effectiveMonthlyRate,
        effective_lead_time: effectiveLeadTime,
        period_demand: periodDemand,
        lead_time_demand: leadTimeDemand,
        safety_buffer: safetyBuffer,
        gross_demand: grossDemand,
        net_order_qty: netOrderQty,
        total_estimated_cost: totalEstimatedCost,
        is_selected: isSelected,
        is_overridden:
          override.monthly_rate !== undefined ||
          override.lead_time_days !== undefined,
      };
    });
  }, [
    catalog,
    customOverrides,
    targetMonths,
    safetyBufferPct,
    globalLeadTime,
    selectedPartIds,
  ]);

  // Selected items array ONLY
  const selectedItems = useMemo(() => {
    let list = enrichedCatalog.filter((p) =>
      selectedPartIds.has(String(p.id_part).trim()),
    );

    if (searchSelected.trim()) {
      const q = searchSelected.toLowerCase();
      list = list.filter(
        (p) =>
          (p.description || "").toLowerCase().includes(q) ||
          (p.vendor_code || "").toLowerCase().includes(q) ||
          (p.id_part || "").toLowerCase().includes(q) ||
          (p.location || "").toLowerCase().includes(q) ||
          (p.seller || "").toLowerCase().includes(q),
      );
    }

    return list;
  }, [enrichedCatalog, selectedPartIds, searchSelected]);

  // Summary aggregates for selected items
  const summary = useMemo(() => {
    const count = selectedItems.length;
    const totalOrderQty = selectedItems.reduce(
      (acc, it) => acc + it.net_order_qty,
      0,
    );
    const totalCost = selectedItems.reduce(
      (acc, it) => acc + it.total_estimated_cost,
      0,
    );
    const avgLT =
      count > 0
        ? Math.round(
            selectedItems.reduce((acc, it) => acc + it.effective_lead_time, 0) /
              count,
          )
        : 0;
    const totalCurrentStock = selectedItems.reduce(
      (acc, it) => acc + it.available_stock,
      0,
    );

    return {
      selected_count: count,
      total_order_qty: totalOrderQty,
      total_cost: totalCost,
      avg_lead_time: avgLT,
      total_current_stock: totalCurrentStock,
    };
  }, [selectedItems]);

  // Catalog items filtered inside the Add Product Modal
  const pickerCatalog = useMemo(() => {
    let list = enrichedCatalog;

    if (pickerFilter === "low_stock") {
      list = list.filter((p) => p.available_stock <= 0 || p.net_order_qty > 0);
    } else if (pickerFilter === "active_usage") {
      list = list.filter((p) => p.effective_monthly_rate > 0);
    }

    if (pickerSearch.trim()) {
      const q = pickerSearch.toLowerCase();
      list = list.filter(
        (p) =>
          (p.description || "").toLowerCase().includes(q) ||
          (p.vendor_code || "").toLowerCase().includes(q) ||
          (p.id_part || "").toLowerCase().includes(q) ||
          (p.location || "").toLowerCase().includes(q),
      );
    }

    return list;
  }, [enrichedCatalog, pickerFilter, pickerSearch]);

  // Open modal handler
  const handleOpenAddModal = () => {
    setPickerTempSelected(new Set(selectedPartIds));
    setPickerSearch("");
    setPickerFilter("all");
    setIsAddModalOpen(true);
  };

  // Toggle item in modal picker
  const togglePickerItem = (idPart) => {
    setPickerTempSelected((prev) => {
      const next = new Set(prev);
      if (next.has(idPart)) {
        next.delete(idPart);
      } else {
        next.add(idPart);
      }
      return next;
    });
  };

  // Confirm selection from modal
  const handleConfirmAddProducts = () => {
    setSelectedPartIds(new Set(pickerTempSelected));
    setIsAddModalOpen(false);
    NotifySuccess(
      `Berhasil memuat ${pickerTempSelected.size} suku cadang ke simulasi.`,
    );
  };

  // Remove single item from simulation list
  const handleRemoveItem = (idPart) => {
    setSelectedPartIds((prev) => {
      const next = new Set(prev);
      next.delete(idPart);
      return next;
    });
  };

  // Clear all items from simulation
  const handleClearAll = () => {
    if (confirm("Kosongkan semua suku cadang dari daftar simulasi?")) {
      setSelectedPartIds(new Set());
      setCustomOverrides({});
      NotifySuccess("Daftar simulasi dikosongkan.");
    }
  };

  // Inline Override Handlers
  const handleUpdateOverride = (idPart, field, val) => {
    const partId = String(idPart).trim();
    const num = parseFloat(val);
    if (isNaN(num)) return;

    setCustomOverrides((prev) => ({
      ...prev,
      [partId]: {
        ...(prev[partId] || {}),
        [field]: num,
      },
    }));
  };

  // Copy Summary text to Clipboard
  const handleCopySummary = () => {
    if (selectedItems.length === 0) {
      NotifyError("Belum ada suku cadang yang dipilih untuk disalin.");
      return;
    }

    let text = `*SIMULASI KEBUTUHAN PENGADAAN SUKU CADANG*\n`;
    text += `Target Kebutuhan: ${targetMonths} Bulan ke Depan\n`;
    text += `Buffer Keamanan: ${safetyBufferPct}%\n`;
    text += `Tanggal Simulasi: ${new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}\n`;
    text += `Total Produk: ${selectedItems.length} item\n`;
    text += `Total Rekomendasi Order: ${selectedItems.reduce((acc, it) => acc + it.net_order_qty, 0)} unit\n`;
    text += `Estimasi Total Anggaran: Rp ${selectedItems.reduce((acc, it) => acc + it.total_estimated_cost, 0).toLocaleString("id-ID")}\n\n`;
    text += `*Rincian Kebutuhan Suku Cadang:*\n`;

    selectedItems.forEach((item, idx) => {
      text += `${idx + 1}. *${item.description}* (${item.vendor_code || item.id_part})\n`;
      text += `   • Stok Gudang: ${item.available_stock} ${item.unit}\n`;
      text += `   • Konsumsi: ${item.effective_monthly_rate} ${item.unit}/bln | Lead Time: ${item.effective_lead_time} hari\n`;
      text += `   • REKOMENDASI ORDER: *${item.net_order_qty} ${item.unit}*\n`;
      if (item.unit_price > 0) {
        text += `   • Est. Biaya: Rp ${item.total_estimated_cost.toLocaleString("id-ID")} (@Rp ${item.unit_price.toLocaleString("id-ID")})\n`;
      }
      text += `\n`;
    });

    navigator.clipboard.writeText(text);
    NotifySuccess("Rangkuman kebutuhan berhasil disalin ke clipboard!");
  };

  // Create DPM Draft in /partsin
  const handleProceedToDPM = () => {
    const itemsToOrder = selectedItems.filter((p) => p.net_order_qty > 0);
    if (itemsToOrder.length === 0) {
      NotifyError(
        "Tidak ada produk terpilih yang memiliki rekomendasi order > 0.",
      );
      return;
    }

    const payload = itemsToOrder.map((item) => ({
      id_part: item.id_part,
      description: item.description,
      quantity: item.net_order_qty,
      unit: item.unit || "pcs",
      stock: "Stock",
      id_service: "",
      note: `Simulasi kebutuhan ${targetMonths} bulan (Lead time: ${item.effective_lead_time} hari)`,
    }));

    try {
      sessionStorage.setItem("simulation_order_items", JSON.stringify(payload));
      NotifySuccess(
        `Meneruskan ${payload.length} item ke Form Pengadaan DPM...`,
      );
      setTimeout(() => {
        router.push("/partsin");
      }, 300);
    } catch (e) {
      console.error(e);
      NotifyError("Gagal menyimpan draf pengadaan.");
    }
  };

  return (
    <UserAuth>
      <DefaultLayout>
        {loading ? (
          <PageLoader />
        ) : (
          <div className="space-y-6">
            {/* 1. Header Page Title & Top Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stroke pb-4 dark:border-strokedark">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <HiOutlineCalculator className="text-2xl" />
                  </div>
                  <div>
                    <h2 className="flex items-center gap-2 text-xl font-bold text-black dark:text-white">
                      Simulation
                    </h2>
                    <p className="text-xs text-body dark:text-bodydark">
                      Pilih suku cadang yang ingin dibeli, lalu tentukan target
                      periode bulan untuk menghitung kuantitas order optimal
                      sesuai konsumsi riil dan waktu tunggu (lead time).
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={fetchSimulationData}
                  title="Muat Ulang Data"
                  className="hover:bg-gray-100 flex items-center gap-1.5 rounded-xl border border-stroke bg-white px-3 py-2 text-xs font-semibold text-black transition-colors dark:border-strokedark dark:bg-boxdark dark:text-white dark:hover:bg-meta-4/30"
                >
                  <HiOutlineArrowPath className="text-sm" />
                  <span>Refresh</span>
                </button>

                {selectedItems.length > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={handleCopySummary}
                      title="Salin Rangkuman Teks untuk WhatsApp/Email"
                      className="hover:bg-gray-100 flex items-center gap-1.5 rounded-xl border border-stroke bg-white px-3 py-2 text-xs font-semibold text-black transition-colors dark:border-strokedark dark:bg-boxdark dark:text-white dark:hover:bg-meta-4/30"
                    >
                      <HiOutlineClipboardDocumentCheck className="text-base text-primary" />
                      <span>Salin Ringkasan</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPrintModal(true)}
                      title="Cetak Laporan / Print Preview"
                      className="hover:bg-gray-100 flex items-center gap-1.5 rounded-xl border border-stroke bg-white px-3.5 py-2 text-xs font-semibold text-black transition-colors dark:border-strokedark dark:bg-boxdark dark:text-white dark:hover:bg-meta-4/30"
                    >
                      <HiOutlinePrinter className="text-base text-meta-5" />
                      <span>Cetak / PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleProceedToDPM}
                      className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-md transition-all hover:bg-primary/90 active:scale-95"
                    >
                      <BsCartPlus className="text-base" />
                      <span>
                        Buat Pengadaan (
                        {
                          selectedItems.filter((p) => p.net_order_qty > 0)
                            .length
                        }{" "}
                        Part)
                      </span>
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-xs font-bold text-white shadow transition-all hover:bg-primary dark:bg-white dark:text-black dark:hover:bg-primary dark:hover:text-white"
                >
                  <HiOutlinePlus className="text-base" />
                  <span>+ Tambah Produk</span>
                </button>
              </div>
            </div>

            {/* 2. Simulation Control Bar (Target Months, Safety Stock, Lead Time basis) */}
            <div className="rounded-2xl border border-stroke bg-white p-5 shadow-sm dark:border-strokedark dark:bg-boxdark">
              <div className="grid grid-cols-1 items-center gap-5 lg:grid-cols-12">
                {/* Input Target Durasi Bulan */}
                <div className="space-y-2 lg:col-span-5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                    1. Rencana Kebutuhan untuk Berapa Bulan ke Depan?
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="1"
                        max="36"
                        step="1"
                        value={targetMonths}
                        onChange={(e) =>
                          setTargetMonths(
                            Math.max(1, parseInt(e.target.value) || 1),
                          )
                        }
                        className="bg-gray-50 w-full rounded-xl border border-stroke px-4 py-2.5 text-sm font-bold text-black outline-none transition focus:border-primary focus:bg-white dark:border-strokedark dark:bg-meta-4/20 dark:text-white"
                      />
                      <span className="absolute right-4 top-2.5 text-xs font-bold text-body dark:text-bodydark">
                        Bulan
                      </span>
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="flex items-center gap-1">
                      {[1, 3, 6, 12].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setTargetMonths(m)}
                          className={`rounded-xl px-2.5 py-2 text-xs font-bold transition-all ${
                            targetMonths === m
                              ? "bg-primary text-white shadow-sm"
                              : "bg-gray-100 hover:bg-gray-200 text-body dark:bg-meta-4/30 dark:text-bodydark dark:hover:bg-meta-4/50"
                          }`}
                        >
                          {m} Bln
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-body dark:text-bodydark">
                    Estimasi kebutuhan:{" "}
                    <span className="font-semibold text-black dark:text-white">
                      Rata-rata Konsumsi/Bln × {targetMonths} Bulan
                    </span>
                    .
                  </p>
                </div>

                {/* Input Buffer Keamanan (Safety Stock) */}
                <div className="space-y-2 lg:col-span-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                    2. Cadangan Keamanan (Safety Buffer)
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[
                      { val: 0, label: "0% (Normal)" },
                      { val: 10, label: "10% (Standar)" },
                      { val: 20, label: "20% (Aman)" },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setSafetyBufferPct(opt.val)}
                        className={`flex-1 rounded-xl px-2 py-2 text-center text-xs font-bold transition-all ${
                          safetyBufferPct === opt.val
                            ? "bg-meta-3 text-white shadow-sm"
                            : "bg-gray-100 hover:bg-gray-200 text-body dark:bg-meta-4/30 dark:text-bodydark dark:hover:bg-meta-4/50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-body dark:text-bodydark">
                    Antisipasi lonjakan kerusakan mesin atau keterlambatan
                    pengiriman vendor.
                  </p>
                </div>

                {/* Lead Time Info Basis */}
                <div className="bg-gray-50 rounded-xl border border-stroke/70 p-3 dark:border-strokedark/70 dark:bg-meta-4/10 lg:col-span-3">
                  <div className="mb-1 flex items-center gap-2">
                    <HiOutlineClock className="text-base text-warning" />
                    <span className="text-xs font-bold text-black dark:text-white">
                      Basis Lead Time
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-body dark:text-bodydark">
                    Dihitung dari selisih{" "}
                    <code className="font-mono font-bold text-primary">
                      tanggal terima
                    </code>{" "}
                    dan{" "}
                    <code className="font-mono font-bold text-primary">
                      tanggal order
                    </code>
                    . Rata-rata:{" "}
                    <strong className="text-black dark:text-white">
                      {globalLeadTime} hari
                    </strong>
                    .
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Summary KPI Badges for Selected Items */}
            {selectedItems.length > 0 && (
              <div className="animate-fade-in grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark">
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-body dark:text-bodydark">
                    Produk dalam Simulasi
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="font-mono text-2xl font-bold text-black dark:text-white">
                      {summary.selected_count}
                    </span>
                    <span className="text-xs text-body dark:text-bodydark">
                      suku cadang
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark">
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-body dark:text-bodydark">
                    Total Rekomendasi Order
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="font-mono text-2xl font-bold text-primary">
                      +{summary.total_order_qty.toLocaleString("id-ID")}
                    </span>
                    <span className="text-xs text-body dark:text-bodydark">
                      unit
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark">
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-body dark:text-bodydark">
                    Estimasi Total Anggaran
                  </span>
                  <div className="mt-1">
                    <span className="font-mono text-xl font-bold text-meta-3 sm:text-2xl">
                      Rp {summary.total_cost.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark">
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-body dark:text-bodydark">
                    Rata-rata Waktu Tunggu
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="font-mono text-2xl font-bold text-warning">
                      ~{summary.avg_lead_time || globalLeadTime}
                    </span>
                    <span className="text-xs text-body dark:text-bodydark">
                      hari pengiriman
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Main Simulation Table / Empty State */}
            {selectedItems.length === 0 ? (
              /* EMPTY STATE: When no products have been added yet */
              <div className="space-y-4 rounded-2xl border-2 border-dashed border-stroke bg-white p-12 text-center dark:border-strokedark dark:bg-boxdark">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <BsBoxSeam className="text-3xl" />
                </div>
                <div className="mx-auto max-w-md space-y-1">
                  <h3 className="text-base font-bold text-black dark:text-white">
                    Daftar Simulasi Masih Kosong
                  </h3>
                  <p className="text-xs text-body dark:text-bodydark">
                    Silakan pilih suku cadang yang ingin Anda beli. Sistem akan
                    menghitung kebutuhan order otomatis untuk{" "}
                    <span className="font-bold text-black dark:text-white">
                      {targetMonths} bulan ke depan
                    </span>{" "}
                    dengan memperhitungkan stok gudang saat ini dan lead time
                    pengiriman.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95"
                >
                  <HiOutlinePlus className="text-base" />
                  <span>+ Tambah Produk ke Simulasi</span>
                </button>
              </div>
            ) : (
              /* ACTIVE TABLE: Only displays selected products */
              <div className="overflow-hidden rounded-2xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark">
                {/* Table Top Toolbar */}
                <div className="bg-gray-50/60 flex flex-wrap items-center justify-between gap-3 border-b border-stroke p-4 dark:border-strokedark dark:bg-meta-4/10">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                      Daftar Produk yang Dikalkulasi ({selectedItems.length}{" "}
                      Part)
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Search inside selected items */}
                    <div className="relative w-56">
                      <HiOutlineMagnifyingGlass className="absolute left-3 top-2 text-sm text-body dark:text-bodydark" />
                      <input
                        type="text"
                        value={searchSelected}
                        onChange={(e) => setSearchSelected(e.target.value)}
                        placeholder="Saring suku cadang terpilih..."
                        className="w-full rounded-xl border border-stroke bg-white py-1 pl-8 pr-3 text-xs text-black outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleOpenAddModal}
                      className="flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary/20"
                    >
                      <HiOutlinePlus />
                      <span>Tambah Produk Lagi</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="flex items-center gap-1 rounded-xl border border-danger/30 bg-danger/10 px-2.5 py-1.5 text-xs font-semibold text-danger transition-colors hover:bg-danger/20"
                    >
                      <HiOutlineTrash />
                      <span>Kosongkan</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full table-auto text-left text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-stroke text-body dark:border-strokedark dark:bg-meta-4/20 dark:text-bodydark">
                        <th className="w-10 px-3 py-3 text-center font-bold">
                          No
                        </th>
                        <th className="px-3 py-3 font-bold uppercase tracking-wider">
                          Suku Cadang & Kode
                        </th>
                        <th className="px-3 py-3 text-center font-bold uppercase tracking-wider">
                          Stok Gudang
                        </th>
                        <th className="px-3 py-3 text-center font-bold uppercase tracking-wider">
                          Sedang Dipesan
                        </th>
                        <th
                          className="px-3 py-3 text-center font-bold uppercase tracking-wider"
                          title="Average Monthly Consumption (bisa diedit langsung)"
                        >
                          <div className="flex cursor-help items-center justify-center gap-1">
                            <span>Pemakaian / Bln</span>
                            <HiOutlinePencilSquare className="text-[11px] text-primary" />
                          </div>
                        </th>
                        <th
                          className="px-3 py-3 text-center font-bold uppercase tracking-wider"
                          title="Lead Time dari histori order_main (bisa diedit langsung)"
                        >
                          <div className="flex cursor-help items-center justify-center gap-1">
                            <span>Lead Time</span>
                            <HiOutlineClock className="text-[11px] text-warning" />
                          </div>
                        </th>
                        <th
                          className="px-3 py-3 text-center font-bold uppercase tracking-wider"
                          title="Kebutuhan selama durasi target bulan"
                        >
                          Kebutuhan ({targetMonths} Bln)
                        </th>
                        <th
                          className="px-3 py-3 text-center font-bold uppercase tracking-wider"
                          title="Cadangan suku cadang selama masa tunggu pengiriman"
                        >
                          Cadangan LT
                        </th>
                        <th className="bg-primary/10 px-3 py-3 text-center font-bold uppercase tracking-wider text-primary">
                          Rekomendasi Order
                        </th>
                        <th className="px-3 py-3 text-right font-bold uppercase tracking-wider">
                          Harga Satuan
                        </th>
                        <th className="px-3 py-3 text-right font-bold uppercase tracking-wider">
                          Estimasi Biaya
                        </th>
                        <th className="w-12 px-3 py-3 text-center font-bold uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stroke dark:divide-strokedark">
                      {selectedItems.map((item, idx) => {
                        const isStockLow = item.available_stock <= 0;
                        const needsOrder = item.net_order_qty > 0;

                        return (
                          <tr
                            key={item.id_part}
                            className="hover:bg-gray-50/70 transition-colors dark:hover:bg-meta-4/10"
                          >
                            {/* Numbering */}
                            <td className="font-mono px-3 py-3 text-center text-body dark:text-bodydark">
                              {idx + 1}
                            </td>

                            {/* Part Description & Code */}
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-1.5 font-semibold text-black dark:text-white">
                                <span
                                  onClick={() =>
                                    router.push(`/parts/${item.id_part}`)
                                  }
                                  className="cursor-pointer hover:text-primary hover:underline"
                                >
                                  {item.description}
                                </span>
                              </div>
                              <div className="mt-0.5 flex items-center gap-2 text-[10px] text-body dark:text-bodydark">
                                <span className="font-mono font-bold text-primary">
                                  {item.vendor_code || item.id_part}
                                </span>
                                <span>•</span>
                                <span>Rak: {item.location || "-"}</span>
                                <span>•</span>
                                <span>Satuan: {item.unit || "pcs"}</span>
                              </div>
                            </td>

                            {/* Current Available Stock */}
                            <td className="whitespace-nowrap px-3 py-3 text-center">
                              <span
                                className={`font-mono inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${
                                  isStockLow
                                    ? "bg-danger/15 text-danger"
                                    : item.available_stock < 5
                                      ? "bg-warning/15 text-warning"
                                      : "bg-success/15 text-success"
                                }`}
                              >
                                {item.available_stock} {item.unit}
                              </span>
                            </td>

                            {/* Pending On-Order Stock */}
                            <td className="font-mono whitespace-nowrap px-3 py-3 text-center text-body dark:text-bodydark">
                              {item.on_order_qty > 0 ? (
                                <span className="inline-block rounded-md bg-meta-5/10 px-2 py-0.5 text-[11px] font-bold text-meta-5">
                                  +{item.on_order_qty} {item.unit}
                                </span>
                              ) : (
                                <span className="text-gray-400 dark:text-gray-600">
                                  -
                                </span>
                              )}
                            </td>

                            {/* Monthly Rate (Inline Editable) */}
                            <td className="px-3 py-3 text-center">
                              <div className="inline-flex items-center gap-1">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.5"
                                  value={item.effective_monthly_rate}
                                  onChange={(e) =>
                                    handleUpdateOverride(
                                      item.id_part,
                                      "monthly_rate",
                                      e.target.value,
                                    )
                                  }
                                  className={`font-mono w-16 rounded-lg border px-1.5 py-1 text-center text-xs font-bold outline-none transition focus:border-primary ${
                                    customOverrides[item.id_part]
                                      ?.monthly_rate !== undefined
                                      ? "border-primary bg-primary/10 text-primary"
                                      : "bg-gray-50 border-stroke text-black dark:border-strokedark dark:bg-meta-4/20 dark:text-white"
                                  }`}
                                  title="Klik untuk ubah perkiraan pemakaian bulanan"
                                />
                                <span className="text-[10px] text-body dark:text-bodydark">
                                  /bln
                                </span>
                              </div>
                            </td>

                            {/* Lead Time (Inline Editable) */}
                            <td className="px-3 py-3 text-center">
                              <div className="inline-flex items-center gap-1">
                                <input
                                  type="number"
                                  min="1"
                                  max="120"
                                  step="1"
                                  value={item.effective_lead_time}
                                  onChange={(e) =>
                                    handleUpdateOverride(
                                      item.id_part,
                                      "lead_time_days",
                                      e.target.value,
                                    )
                                  }
                                  className={`font-mono w-14 rounded-lg border px-1.5 py-1 text-center text-xs font-bold outline-none transition focus:border-primary ${
                                    customOverrides[item.id_part]
                                      ?.lead_time_days !== undefined
                                      ? "border-warning bg-warning/10 text-warning"
                                      : "bg-gray-50 border-stroke text-black dark:border-strokedark dark:bg-meta-4/20 dark:text-white"
                                  }`}
                                  title={
                                    item.is_historical_lead_time
                                      ? `Berdasarkan ${item.lead_time_orders_count} riwayat order`
                                      : "Rata-rata global"
                                  }
                                />
                                <span className="text-[10px] text-body dark:text-bodydark">
                                  hr
                                </span>
                              </div>
                            </td>

                            {/* Period Demand (Target Months) */}
                            <td className="font-mono px-3 py-3 text-center font-semibold text-black dark:text-white">
                              {item.period_demand} {item.unit}
                            </td>

                            {/* Lead Time Demand */}
                            <td className="font-mono px-3 py-3 text-center text-body dark:text-bodydark">
                              +{item.lead_time_demand}
                            </td>

                            {/* RECOMMENDED NET ORDER QUANTITY */}
                            <td className="whitespace-nowrap bg-primary/5 px-3 py-3 text-center dark:bg-primary/10">
                              {needsOrder ? (
                                <span className="font-mono animate-fade-in inline-block rounded-xl bg-primary px-3 py-1 text-xs font-bold text-white shadow-sm">
                                  +{item.net_order_qty} {item.unit}
                                </span>
                              ) : (
                                <span className="font-mono inline-block rounded-xl bg-success/15 px-2.5 py-1 text-[11px] font-bold text-success">
                                  Stok Cukup (0)
                                </span>
                              )}
                            </td>

                            {/* Last Unit Price */}
                            <td className="font-mono whitespace-nowrap px-3 py-3 text-right text-xs">
                              {item.unit_price > 0 ? (
                                <div>
                                  <span className="font-semibold text-black dark:text-white">
                                    Rp {item.unit_price.toLocaleString("id-ID")}
                                  </span>
                                  {item.seller && item.seller !== "-" && (
                                    <span
                                      className="block max-w-[110px] truncate text-[9px] text-body dark:text-bodydark"
                                      title={item.seller}
                                    >
                                      {item.seller}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400 dark:text-gray-600">
                                  -
                                </span>
                              )}
                            </td>

                            {/* Total Estimated Cost */}
                            <td className="font-mono whitespace-nowrap px-3 py-3 text-right text-xs font-bold">
                              {item.total_estimated_cost > 0 ? (
                                <span className="text-meta-3">
                                  Rp{" "}
                                  {item.total_estimated_cost.toLocaleString(
                                    "id-ID",
                                  )}
                                </span>
                              ) : (
                                <span className="text-body dark:text-bodydark">
                                  Rp 0
                                </span>
                              )}
                            </td>

                            {/* Action: Remove from Simulation */}
                            <td className="px-3 py-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(item.id_part)}
                                className="mx-auto flex h-7 w-7 items-center justify-center rounded-lg text-body transition-colors hover:bg-danger/10 hover:text-danger"
                                title="Hapus dari simulasi"
                              >
                                <HiOutlineTrash className="text-sm" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer Summary */}
                <div className="bg-gray-50/50 flex flex-wrap items-center justify-between gap-3 border-t border-stroke p-4 text-xs text-body dark:border-strokedark dark:bg-meta-4/10 dark:text-bodydark">
                  <div className="flex items-center gap-2">
                    <HiOutlineInformationCircle className="text-base text-primary" />
                    <span>
                      Total <strong>{selectedItems.length}</strong> produk
                      sedang disimulasikan. Angka{" "}
                      <strong>Rekomendasi Order</strong> otomatis mengurangi
                      stok gudang saat ini dan PO berjalan dari kebutuhan
                      periode + masa lead time.
                    </span>
                  </div>
                  {Object.keys(customOverrides).length > 0 && (
                    <button
                      type="button"
                      onClick={() => setCustomOverrides({})}
                      className="text-[11px] font-semibold text-primary hover:underline"
                    >
                      Reset Semua Penyesuaian Manual (
                      {Object.keys(customOverrides).length})
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 5. Formula & Methodology Explanation Card */}
            <div className="space-y-3 rounded-2xl border border-stroke bg-white p-5 text-xs text-body shadow-sm dark:border-strokedark dark:bg-boxdark dark:text-bodydark">
              <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                <BsShieldCheck className="text-base text-primary" />
                Cara Kerja & Rumus Perhitungan Simulasi Pengadaan
              </h4>
              <div className="grid grid-cols-1 gap-4 pt-1 md:grid-cols-3">
                <div className="bg-gray-50 space-y-1 rounded-xl border border-stroke p-3.5 dark:border-strokedark dark:bg-meta-4/20">
                  <span className="block font-bold text-black dark:text-white">
                    1. Kebutuhan Periode Target ({targetMonths} Bulan)
                  </span>
                  <p className="text-[11px] leading-relaxed">
                    Dihitung dari konsumsi rata-rata bulanan (
                    <code className="font-mono font-bold text-primary">
                      AMC
                    </code>
                    ) dikalikan durasi bulan yang diinputkan:
                    <br />
                    <code className="font-mono font-bold text-black dark:text-white">
                      AMC × {targetMonths} Bulan
                    </code>
                  </p>
                </div>

                <div className="bg-gray-50 space-y-1 rounded-xl border border-stroke p-3.5 dark:border-strokedark dark:bg-meta-4/20">
                  <span className="block font-bold text-black dark:text-white">
                    2. Cadangan Lead Time Pengiriman
                  </span>
                  <p className="text-[11px] leading-relaxed">
                    Jumlah barang yang akan tetap terpakai oleh teknisi selama
                    menunggu barang dikirim (selisih{" "}
                    <code className="font-mono font-bold text-primary">
                      tanggal order
                    </code>{" "}
                    &{" "}
                    <code className="font-mono font-bold text-primary">
                      tanggal terima
                    </code>{" "}
                    .):
                    <br />
                    <code className="font-mono font-bold text-black dark:text-white">
                      (AMC / 30 hari) × Lead Time
                    </code>
                  </p>
                </div>

                <div className="bg-gray-50 space-y-1 rounded-xl border border-stroke p-3.5 dark:border-strokedark dark:bg-meta-4/20">
                  <span className="block font-bold text-black dark:text-white">
                    3. Rekomendasi Qty Order Bersih
                  </span>
                  <p className="text-[11px] leading-relaxed">
                    Total kebutuhan kotor dikurangi stok fisik gudang saat ini
                    dan order yang sedang berjalan:
                    <br />
                    <code className="font-mono font-bold text-primary">
                      (Kebutuhan + Cadangan LT + Buffer) - Stok - PO
                    </code>
                  </p>
                </div>
              </div>
            </div>

            {/* 6. MODAL: ADD PRODUCT / PICKER */}
            <CustomModal
              isVisible={isAddModalOpen}
              isSmallWidth="xl"
              onClose={() => setIsAddModalOpen(false)}
            >
              <div className="flex items-center justify-between border-b border-stroke px-5 py-4 dark:border-strokedark">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-black dark:text-white">
                    <HiOutlineCube className="text-base text-primary" />
                    Pilih Suku Cadang untuk Simulasi
                  </h3>
                  <span className="text-xs text-body dark:text-bodydark">
                    Centang produk yang ingin Anda masukkan ke dalam perhitungan
                    simulasi kebutuhan
                  </span>
                </div>
              </div>

              {/* Modal Filter Toolbar */}
              <div className="bg-gray-50 flex flex-wrap items-center justify-between gap-3 border-b border-stroke p-4 dark:border-strokedark dark:bg-meta-4/10">
                <div className="relative min-w-[240px] flex-1">
                  <HiOutlineMagnifyingGlass className="absolute left-3 top-2.5 text-sm text-body dark:text-bodydark" />
                  <input
                    type="text"
                    value={pickerSearch}
                    onChange={(e) => setPickerSearch(e.target.value)}
                    placeholder="Cari nama part, kode vendor, lokasi rak..."
                    autoFocus
                    className="w-full rounded-xl border border-stroke bg-white py-2 pl-9 pr-3 text-xs text-black outline-none transition focus:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white"
                  />
                  {pickerSearch && (
                    <button
                      type="button"
                      onClick={() => setPickerSearch("")}
                      className="absolute right-3 top-2.5 text-xs text-body hover:text-black dark:hover:text-white"
                    >
                      <HiOutlineXMark />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setPickerFilter("all")}
                    className={`rounded-lg px-2.5 py-1.5 font-bold transition-all ${
                      pickerFilter === "all"
                        ? "bg-black text-white dark:bg-white dark:text-black"
                        : "bg-gray-100 hover:bg-gray-200 text-body dark:bg-meta-4/30 dark:text-bodydark"
                    }`}
                  >
                    Semua ({catalog.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPickerFilter("low_stock")}
                    className={`rounded-lg px-2.5 py-1.5 font-bold transition-all ${
                      pickerFilter === "low_stock"
                        ? "bg-danger text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-body dark:bg-meta-4/30 dark:text-bodydark"
                    }`}
                  >
                    Stok Menipis
                  </button>
                  <button
                    type="button"
                    onClick={() => setPickerFilter("active_usage")}
                    className={`rounded-lg px-2.5 py-1.5 font-bold transition-all ${
                      pickerFilter === "active_usage"
                        ? "bg-meta-5 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-body dark:bg-meta-4/30 dark:text-bodydark"
                    }`}
                  >
                    Pemakaian Rutin
                  </button>
                </div>
              </div>

              {/* Modal Products List Table */}
              <div className="max-h-[55vh] overflow-y-auto p-4">
                <table className="w-full table-auto text-left text-xs">
                  <thead>
                    <tr className="border-b border-stroke font-bold text-body dark:border-strokedark">
                      <th className="w-10 px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={
                            pickerCatalog.length > 0 &&
                            pickerCatalog.every((p) =>
                              pickerTempSelected.has(String(p.id_part).trim()),
                            )
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPickerTempSelected((prev) => {
                                const next = new Set(prev);
                                pickerCatalog.forEach((p) =>
                                  next.add(String(p.id_part).trim()),
                                );
                                return next;
                              });
                            } else {
                              setPickerTempSelected((prev) => {
                                const next = new Set(prev);
                                pickerCatalog.forEach((p) =>
                                  next.delete(String(p.id_part).trim()),
                                );
                                return next;
                              });
                            }
                          }}
                          className="h-4 w-4 cursor-pointer rounded border-stroke text-primary focus:ring-primary"
                        />
                      </th>
                      <th className="px-3 py-2">Suku Cadang & Kode</th>
                      <th className="px-3 py-2 text-center">Stok Gudang</th>
                      <th className="px-3 py-2 text-center">Konsumsi/Bln</th>
                      <th className="px-3 py-2 text-center">Lead Time</th>
                      <th className="px-3 py-2 text-right">Harga Satuan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stroke dark:divide-strokedark">
                    {pickerCatalog.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-8 text-center text-body dark:text-bodydark"
                        >
                          Tidak ada produk yang cocok dengan pencarian.
                        </td>
                      </tr>
                    ) : (
                      pickerCatalog.map((item) => {
                        const partId = String(item.id_part).trim();
                        const isChecked = pickerTempSelected.has(partId);
                        const isAlreadyInSimulation =
                          selectedPartIds.has(partId);

                        return (
                          <tr
                            key={item.id_part}
                            onClick={() => togglePickerItem(partId)}
                            className={`cursor-pointer transition-colors ${
                              isChecked
                                ? "bg-primary/5 dark:bg-primary/10"
                                : "hover:bg-gray-50 dark:hover:bg-meta-4/10"
                            }`}
                          >
                            <td
                              className="px-3 py-2.5 text-center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => togglePickerItem(partId)}
                                className="h-4 w-4 cursor-pointer rounded border-stroke text-primary focus:ring-primary"
                              />
                            </td>
                            <td className="px-3 py-2.5">
                              <div className="flex items-center gap-1.5 font-semibold text-black dark:text-white">
                                <span>{item.description}</span>
                                {isAlreadyInSimulation && (
                                  <span className="bg-gray-100 py-0.2 rounded-md px-1.5 text-[9px] font-bold text-body dark:bg-meta-4/30 dark:text-bodydark">
                                    Sudah di Simulasi
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-body dark:text-bodydark">
                                <span className="font-mono font-bold text-primary">
                                  {item.vendor_code || item.id_part}
                                </span>
                                <span>•</span>
                                <span>Rak: {item.location || "-"}</span>
                              </div>
                            </td>
                            <td className="font-mono whitespace-nowrap px-3 py-2.5 text-center font-bold">
                              <span
                                className={`inline-block rounded-full px-2 py-0.5 text-[10px] ${
                                  item.available_stock <= 0
                                    ? "bg-danger/15 text-danger"
                                    : item.available_stock < 5
                                      ? "bg-warning/15 text-warning"
                                      : "bg-success/15 text-success"
                                }`}
                              >
                                {item.available_stock} {item.unit}
                              </span>
                            </td>
                            <td className="font-mono px-3 py-2.5 text-center text-body dark:text-bodydark">
                              {item.monthly_rate > 0
                                ? `${item.monthly_rate} ${item.unit}`
                                : "-"}
                            </td>
                            <td className="font-mono px-3 py-2.5 text-center text-body dark:text-bodydark">
                              ~{item.lead_time_days} hr
                            </td>
                            <td className="font-mono whitespace-nowrap px-3 py-2.5 text-right font-semibold text-black dark:text-white">
                              {item.unit_price > 0
                                ? `Rp ${item.unit_price.toLocaleString("id-ID")}`
                                : "-"}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 flex items-center justify-between border-t border-stroke px-5 py-4 dark:border-strokedark dark:bg-meta-4/10">
                <span className="text-xs font-semibold text-black dark:text-white">
                  <strong>{pickerTempSelected.size}</strong> suku cadang dipilih
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="hover:bg-gray-100 rounded-xl border border-stroke px-4 py-2 text-xs font-bold text-body dark:border-strokedark dark:hover:bg-meta-4/30"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmAddProducts}
                    className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white shadow-md transition-all hover:bg-primary/90 active:scale-95"
                  >
                    Tampilkan di Simulasi ({pickerTempSelected.size} Produk)
                  </button>
                </div>
              </div>
            </CustomModal>

            {/* 7. PRINT MODAL PREVIEW */}
            {showPrintModal && (
              <div className="animate-fade-in fixed inset-0 z-999999 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white text-black shadow-2xl">
                  {/* Modal Header */}
                  <div className="bg-gray-50 flex items-center justify-between border-b border-stroke px-6 py-4">
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-black">
                        <HiOutlinePrinter className="text-base text-primary" />
                        Preview Cetak Simulasi Pengadaan Suku Cadang
                      </h3>
                      <span className="text-xs text-body">
                        Format siap print dokumen pengajuan order material ke
                        bagian Purchasing / Management
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="rounded-xl bg-primary px-4 py-1.5 text-xs font-bold text-white shadow hover:bg-primary/90"
                      >
                        Print Sekarang
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPrintModal(false)}
                        className="bg-gray-200 hover:bg-gray-300 rounded-xl px-3 py-1.5 text-xs font-bold text-body"
                      >
                        Tutup
                      </button>
                    </div>
                  </div>

                  {/* Printable Document Body */}
                  <div className="space-y-5 overflow-y-auto p-6 text-xs text-black">
                    <div className="flex items-center justify-between border-b border-black/30 pb-4">
                      <div>
                        <h2 className="text-base font-bold uppercase tracking-wider">
                          PT BALIFOAM NUSAMEGAH
                        </h2>
                        <p className="text-gray-600 text-xs">
                          Departemen Maintenance & Engineering • Workshop
                          Inventory
                        </p>
                        <h1 className="mt-2 text-sm font-bold text-primary">
                          LAPORAN SIMULASI & PERENCANAAN ORDER SUKU CADANG
                        </h1>
                      </div>
                      <div className="text-gray-700 space-y-0.5 text-right text-[11px]">
                        <p>
                          <strong>Tanggal Cetak:</strong>{" "}
                          {new Date().toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                        <p>
                          <strong>Target Kebutuhan:</strong> {targetMonths}{" "}
                          Bulan ke Depan
                        </p>
                        <p>
                          <strong>Cadangan Buffer:</strong> {safetyBufferPct}%
                        </p>
                        <p>
                          <strong>Total Item:</strong> {selectedItems.length}{" "}
                          Part
                        </p>
                      </div>
                    </div>

                    {/* Table in Print */}
                    <table className="border-gray-400 w-full table-auto border-collapse border text-left text-[11px]">
                      <thead>
                        <tr className="bg-gray-100 border-gray-400 border-b font-bold">
                          <th className="border-gray-400 w-8 border px-2 py-1.5 text-center">
                            No
                          </th>
                          <th className="border-gray-400 border px-2 py-1.5">
                            Kode Part
                          </th>
                          <th className="border-gray-400 border px-2 py-1.5">
                            Deskripsi Suku Cadang
                          </th>
                          <th className="border-gray-400 border px-2 py-1.5 text-center">
                            Stok
                          </th>
                          <th className="border-gray-400 border px-2 py-1.5 text-center">
                            Laju / Bln
                          </th>
                          <th className="border-gray-400 border px-2 py-1.5 text-center">
                            Lead Time
                          </th>
                          <th className="border-gray-400 bg-gray-200 border px-2 py-1.5 text-center">
                            Qty Order
                          </th>
                          <th className="border-gray-400 border px-2 py-1.5 text-right">
                            Harga Satuan
                          </th>
                          <th className="border-gray-400 border px-2 py-1.5 text-right">
                            Total Biaya (Rp)
                          </th>
                          <th className="border-gray-400 border px-2 py-1.5">
                            Supplier
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedItems.map((item, idx) => (
                          <tr key={idx} className="border-gray-300 border-b">
                            <td className="border-gray-300 font-mono border px-2 py-1 text-center">
                              {idx + 1}
                            </td>
                            <td className="border-gray-300 font-mono border px-2 py-1">
                              {item.vendor_code || item.id_part}
                            </td>
                            <td className="border-gray-300 border px-2 py-1 font-semibold">
                              {item.description}
                            </td>
                            <td className="border-gray-300 font-mono border px-2 py-1 text-center">
                              {item.available_stock} {item.unit}
                            </td>
                            <td className="border-gray-300 font-mono border px-2 py-1 text-center">
                              {item.effective_monthly_rate}
                            </td>
                            <td className="border-gray-300 font-mono border px-2 py-1 text-center">
                              {item.effective_lead_time} hr
                            </td>
                            <td className="border-gray-300 font-mono bg-gray-100 border px-2 py-1 text-center font-bold">
                              {item.net_order_qty} {item.unit}
                            </td>
                            <td className="border-gray-300 font-mono border px-2 py-1 text-right">
                              Rp {item.unit_price.toLocaleString("id-ID")}
                            </td>
                            <td className="border-gray-300 font-mono border px-2 py-1 text-right font-bold">
                              Rp{" "}
                              {item.total_estimated_cost.toLocaleString(
                                "id-ID",
                              )}
                            </td>
                            <td className="border-gray-300 max-w-[100px] truncate border px-2 py-1">
                              {item.seller || "-"}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-gray-100 border-gray-500 border-t-2 font-bold">
                          <td
                            colSpan={6}
                            className="border-gray-400 border px-2 py-1.5 text-right uppercase"
                          >
                            Total Estimasi Anggaran Pengadaan:
                          </td>
                          <td className="border-gray-400 font-mono border px-2 py-1.5 text-center">
                            {selectedItems.reduce(
                              (acc, it) => acc + it.net_order_qty,
                              0,
                            )}{" "}
                            unit
                          </td>
                          <td className="border-gray-400 border px-2 py-1.5"></td>
                          <td className="border-gray-400 font-mono border px-2 py-1.5 text-right text-primary">
                            Rp{" "}
                            {selectedItems
                              .reduce(
                                (acc, it) => acc + it.total_estimated_cost,
                                0,
                              )
                              .toLocaleString("id-ID")}
                          </td>
                          <td className="border-gray-400 border px-2 py-1.5"></td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Signature Spot */}
                    <div className="grid grid-cols-3 pt-8 text-center text-xs">
                      <div>
                        <p className="text-gray-700 font-semibold">
                          Dibuat Oleh,
                        </p>
                        <div className="h-16"></div>
                        <p className="font-bold underline">Staff Maintenance</p>
                      </div>
                      <div>
                        <p className="text-gray-700 font-semibold">
                          Diperiksa Oleh,
                        </p>
                        <div className="h-16"></div>
                        <p className="font-bold underline">
                          Kepala Bengkel / Workshop
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-700 font-semibold">
                          Disetujui Oleh,
                        </p>
                        <div className="h-16"></div>
                        <p className="font-bold underline">
                          Manager Operasional / Purchasing
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </DefaultLayout>
    </UserAuth>
  );
}
