"use client";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "react-responsive";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import UserAuth from "@/components/auth";
import { CommonInput, CommonTextArea } from "@/components/input";
import { CommonButtonFull } from "@/components/button";
import { PageCard } from "@/components/card";
import { PageLoader } from "@/components/loader";
import { NotifyError, NotifySuccess } from "@/utils/notify";

// Icons
import {
  HiArrowLeft,
  HiOutlineSearch,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineCube,
} from "react-icons/hi";
import { BsBoxSeam } from "react-icons/bs";
import { IoWarningSharp } from "react-icons/io5";

export default function PartsIn() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const isSmallScreen = useMediaQuery({ query: "(max-width: 640px)" });

  const [detailData, setDetailData] = useState([]);
  const [pendingService, setPendingService] = useState([]);
  const [loading, setLoading] = useState(true);

  // General Order Fields
  const [inputDate, setInputDate] = useState(new Date().toISOString().substring(0, 10));
  const [inputDateError, setInputDateError] = useState(false);
  const [inputDPM, setInputDPM] = useState("");
  const [inputDPMError, setInputDPMError] = useState(false);

  // Tab: Stock vs Non-Stock
  const [activeTab, setActiveTab] = useState("stock"); // 'stock' | 'nonstock'

  // Stock item inputs
  const [keyword, setKeyword] = useState("");
  const [filteredList, setFilteredList] = useState([]);
  const [searchNotFound, setSearchNotFound] = useState(false);
  const [tempItem, setTempItem] = useState("");
  const [tempIdPart, setTempIdPart] = useState("");
  const [tempQuantity, setTempQuantity] = useState("");
  const [tempUnit, setTempUnit] = useState("");
  const [tempAvailableQuantity, setTempAvailableQuantity] = useState(0);

  // Non-stock inputs
  const [nonStockDescription, setNonStockDescription] = useState("");
  const [nonStockDescriptionError, setNonStockDescriptionError] = useState(false);
  const [nonStockQuantity, setNonStockQuantity] = useState("");
  const [nonStockQuantityError, setNonStockQuantityError] = useState(false);
  const [nonStockUnit, setNonStockUnit] = useState("pcs");
  const [nonStockUnitError, setNonStockUnitError] = useState(false);
  const [nonStockIdService, setNonStockIdService] = useState("");
  const [inputNote, setInputNote] = useState("");

  const [listOrder, setListOrder] = useState([]);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [emptyListAlert, setEmptyListAlert] = useState(false);

  const focusKeyword = useRef(null);
  const focusTempQuantity = useRef(null);

  const fetch_data = async () => {
    try {
      const response = await axios.post("/api/stocklist");
      if (response.status === 200) {
        setDetailData(response.data.response || []);
        setPendingService(response.data.pending || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch_data();
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!keyword.trim()) {
      setFilteredList([]);
      setSearchNotFound(false);
      return;
    }
    const q = keyword.toLowerCase();
    const filtered = detailData.filter((item) => {
      const desc = (item.description || "").toLowerCase();
      const code = (item.vendor_code || "").toLowerCase();
      const rem = (item.remark || "").toLowerCase();
      return desc.includes(q) || code.includes(q) || rem.includes(q);
    });
    setFilteredList(filtered);
    setSearchNotFound(filtered.length === 0);
  }, [keyword, detailData]);

  const addStockItem = () => {
    if (!tempIdPart) {
      NotifyError("Pilih suku cadang katalog terlebih dahulu");
      return;
    }
    const qty = parseInt(tempQuantity);
    if (isNaN(qty) || qty <= 0) {
      NotifyError("Masukkan jumlah yang valid");
      return;
    }

    const newList = [...listOrder];
    const findIndex = newList.findIndex((v) => v.id_part === tempIdPart && v.stock === "Stock");

    if (findIndex !== -1) {
      newList[findIndex].quantity = parseInt(newList[findIndex].quantity) + qty;
    } else {
      newList.push({
        id_part: tempIdPart,
        description: tempItem,
        quantity: qty,
        unit: tempUnit || "pcs",
        stock: "Stock",
        id_service: "",
        note: "",
      });
      setEmptyListAlert(false);
    }

    setListOrder(newList);
    setTempItem("");
    setTempIdPart("");
    setTempQuantity("");
    setTempUnit("");
    setKeyword("");
    if (focusKeyword.current) focusKeyword.current.focus();
  };

  const addNonStockItem = () => {
    let hasErr = false;
    if (!nonStockDescription.trim()) {
      setNonStockDescriptionError(true);
      hasErr = true;
    }
    const qty = parseInt(nonStockQuantity);
    if (isNaN(qty) || qty <= 0) {
      setNonStockQuantityError(true);
      hasErr = true;
    }
    if (!nonStockUnit.trim()) {
      setNonStockUnitError(true);
      hasErr = true;
    }
    if (hasErr) return;

    const newList = [...listOrder];
    newList.push({
      id_part: "",
      description: nonStockDescription,
      quantity: qty,
      unit: nonStockUnit,
      stock: "Non Stock",
      id_service: nonStockIdService,
      note: inputNote,
    });

    setListOrder(newList);
    setEmptyListAlert(false);
    setNonStockDescription("");
    setNonStockQuantity("");
    setNonStockUnit("pcs");
    setNonStockIdService("");
    setInputNote("");
    NotifySuccess("Item Non-Stock ditambahkan ke daftar");
  };

  const removeOrderItem = (index) => {
    setListOrder((prev) => prev.filter((_, idx) => idx !== index));
  };

  const save_item = async () => {
    let hasErr = false;
    if (!inputDate) {
      setInputDateError(true);
      hasErr = true;
    }
    if (!inputDPM.trim()) {
      setInputDPMError(true);
      hasErr = true;
    }
    if (listOrder.length === 0) {
      setEmptyListAlert(true);
      hasErr = true;
    }

    if (hasErr) return;

    setLoadingSubmit(true);
    try {
      const user = localStorage.getItem("info");
      const parseUser = user ? JSON.parse(user) : [{}];

      const res = await axios.post("/api/transorder", {
        date: inputDate,
        dpm: inputDPM,
        order: listOrder,
        uid: parseUser[0]?.Uid || "",
      });

      if (res.status === 200) {
        NotifySuccess(res.data.response || "Order pengadaan suku cadang berhasil disimpan");
        router.push("/partsorder");
      }
    } catch (e) {
      NotifyError("Gagal menyimpan order pengadaan");
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (!isClient) return null;

  const contentForm = (
    <div className="space-y-4">
      {/* Information Header Block */}
      <div className="rounded-2xl border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark">
        <h2 className="text-sm font-bold uppercase tracking-wider text-black dark:text-white mb-3">
          Informasi Pengadaan & DPM
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-black dark:text-white mb-1">
              Tanggal Pengajuan
            </label>
            <CommonInput
              type="date"
              input={inputDate}
              error={inputDateError}
              errorMessage="Tanggal wajib diisi"
              onInputChange={(val) => setInputDate(val)}
              onChg={() => setInputDateError(false)}
            />
          </div>

          <div>
            <label className="block font-semibold text-black dark:text-white mb-1">
              Nomor DPM / Referensi
            </label>
            <CommonInput
              type="text"
              placeholder="Contoh: DPM-2024-001"
              input={inputDPM}
              error={inputDPMError}
              errorMessage="Nomor DPM wajib diisi"
              onInputChange={(val) => setInputDPM(val)}
              onKeyChange={() => setInputDPMError(false)}
            />
          </div>
        </div>
      </div>

      {/* Item Type Selector Tab */}
      <div className="rounded-2xl border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark">
        <div className="flex border-b border-stroke pb-3 dark:border-strokedark gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("stock")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === "stock"
                ? "bg-primary text-white shadow-sm"
                : "bg-gray-100 text-body hover:bg-gray-200 dark:bg-meta-4 dark:text-bodydark"
            }`}
          >
            Katalog Stock
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("nonstock")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === "nonstock"
                ? "bg-primary text-white shadow-sm"
                : "bg-gray-100 text-body hover:bg-gray-200 dark:bg-meta-4 dark:text-bodydark"
            }`}
          >
            Non-Stock / Khusus
          </button>
        </div>

        {activeTab === "stock" ? (
          /* ============= STOCK ITEM FORM ============= */
          <div className="pt-4 space-y-3">
            <div className="relative">
              <label className="block text-xs font-semibold text-black dark:text-white mb-1">
                Cari Part Katalog
              </label>
              <CommonInput
                input={keyword}
                reference={focusKeyword}
                onInputChange={(val) => setKeyword(val)}
                placeholder="Ketik nama part, kode vendor, atau catatan..."
              >
                <HiOutlineSearch className="text-body dark:text-bodydark" />
              </CommonInput>

              {/* Autocomplete Dropdown */}
              {keyword.length >= 2 && (
                <div className="absolute z-30 left-0 right-0 mt-1 max-h-56 overflow-y-auto rounded-xl border border-stroke bg-white p-2 shadow-xl dark:border-strokedark dark:bg-boxdark">
                  {searchNotFound ? (
                    <div className="p-3 text-center text-xs text-body dark:text-bodydark">
                      Part tidak ditemukan
                    </div>
                  ) : (
                    filteredList.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setTempIdPart(item.id_part);
                          setTempItem(item.description);
                          setTempUnit(item.unit || "pcs");
                          setTempAvailableQuantity(Number(item.available_quantity || 0));
                          setKeyword("");
                          if (focusTempQuantity.current) {
                            focusTempQuantity.current.focus();
                          }
                        }}
                        className="cursor-pointer rounded-lg p-2.5 text-xs hover:bg-gray-100 dark:hover:bg-meta-4/30 transition-colors flex items-center justify-between"
                      >
                        <div>
                          <span className="font-semibold text-black dark:text-white block">
                            {item.description}
                          </span>
                          <span className="font-mono text-[10px] text-body dark:text-bodydark">
                            {item.vendor_code} • Lokasi: {item.location || "-"}
                          </span>
                        </div>
                        <span className="text-[10px] text-body dark:text-bodydark">
                          Stok: {item.available_quantity || 0} {item.unit}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {tempIdPart && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 dark:bg-primary/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-black dark:text-white">{tempItem}</span>
                  <span className="text-primary font-semibold text-[11px]">
                    Satuan: {tempUnit}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32">
                    <CommonInput
                      placeholder="Jumlah order..."
                      type="number"
                      input={tempQuantity}
                      reference={focusTempQuantity}
                      onInputChange={(val) => setTempQuantity(val)}
                      onKeyChange={(e) => {
                        if (e.key === "Enter") addStockItem();
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addStockItem}
                    className="rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white shadow hover:bg-opacity-90 active:scale-[0.99] transition-all"
                  >
                    + Masukkan List
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ============= NON-STOCK ITEM FORM ============= */
          <div className="pt-4 space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-black dark:text-white mb-1">
                Deskripsi Barang / Jasa
              </label>
              <CommonInput
                placeholder="Contoh: Bearing Custom 6204 khusus..."
                input={nonStockDescription}
                error={nonStockDescriptionError}
                errorMessage="Deskripsi barang wajib diisi"
                onInputChange={(val) => setNonStockDescription(val)}
                onKeyChange={() => setNonStockDescriptionError(false)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-black dark:text-white mb-1">
                  Jumlah (Quantity)
                </label>
                <CommonInput
                  placeholder="Jumlah..."
                  type="number"
                  input={nonStockQuantity}
                  error={nonStockQuantityError}
                  errorMessage="Jumlah wajib diisi"
                  onInputChange={(val) => setNonStockQuantity(val)}
                  onKeyChange={() => setNonStockQuantityError(false)}
                />
              </div>

              <div>
                <label className="block font-semibold text-black dark:text-white mb-1">
                  Satuan Ukur
                </label>
                <CommonInput
                  placeholder="Pcs, Set, Batang..."
                  input={nonStockUnit}
                  error={nonStockUnitError}
                  errorMessage="Satuan wajib diisi"
                  onInputChange={(val) => setNonStockUnit(val)}
                  onKeyChange={() => setNonStockUnitError(false)}
                />
              </div>
            </div>

            {/* Link to Pending Ticket */}
            <div>
              <label className="block font-semibold text-black dark:text-white mb-1">
                Kaitkan dengan Tiket Servis (Opsional)
              </label>
              <select
                value={nonStockIdService}
                onChange={(e) => setNonStockIdService(e.target.value)}
                className="w-full rounded-xl border border-stroke bg-transparent px-3 py-2 text-xs outline-none dark:border-strokedark dark:bg-boxdark-2 text-black dark:text-white"
              >
                <option value="">-- Tidak dikaitkan dengan tiket tertentu --</option>
                {pendingService.map((s, idx) => (
                  <option key={idx} value={s.ID_Request}>
                    {s.ID_Request} - {s.ID_Asset} ({s.Description || s.Problem || "-"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-black dark:text-white mb-1">
                Catatan Pengadaan
              </label>
              <CommonInput
                placeholder="Spesifikasi teknis, merek rekomendasi..."
                input={inputNote}
                onInputChange={(val) => setInputNote(val)}
              />
            </div>

            <button
              type="button"
              onClick={addNonStockItem}
              className="rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white shadow hover:bg-opacity-90 active:scale-[0.99] transition-all"
            >
              + Tambahkan Item Non-Stock
            </button>
          </div>
        )}
      </div>

      {/* Order List Review */}
      <div className="rounded-2xl border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark">
        <h2 className="text-sm font-bold uppercase tracking-wider text-black dark:text-white mb-2">
          Daftar Rincian Pengadaan ({listOrder.length} item)
        </h2>

        {emptyListAlert && (
          <div className="rounded-xl border border-warning/50 bg-warning/10 p-2.5 text-xs text-warning mb-2 flex items-center gap-2">
            <IoWarningSharp className="text-base shrink-0" />
            <span>Daftar item pengadaan tidak boleh kosong.</span>
          </div>
        )}

        {listOrder.length === 0 ? (
          <div className="rounded-xl border border-dashed border-stroke p-6 text-center text-xs text-body dark:border-strokedark dark:text-bodydark">
            Belum ada item yang dimasukkan ke dalam daftar pengadaan.
          </div>
        ) : (
          <div className="divide-y divide-stroke dark:divide-strokedark rounded-xl border border-stroke dark:border-strokedark overflow-hidden">
            {listOrder.map((item, idx) => (
              <div key={idx} className="p-3 flex items-center justify-between text-xs bg-white dark:bg-boxdark">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-black dark:text-white">
                      {item.description}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                        item.stock === "Stock"
                          ? "bg-primary/10 text-primary"
                          : "bg-meta-5/10 text-meta-5"
                      }`}
                    >
                      {item.stock}
                    </span>
                  </div>
                  {item.id_service && (
                    <span className="text-[10px] text-body dark:text-bodydark block">
                      Tiket: #{item.id_service}
                    </span>
                  )}
                  {item.note && (
                    <span className="text-[10px] italic text-body dark:text-bodydark block">
                      Catatan: {item.note}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-primary text-sm">
                    {item.quantity} {item.unit}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeOrderItem(idx)}
                    className="text-danger hover:opacity-75 transition-opacity p-1"
                  >
                    <HiOutlineTrash className="text-base" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 mt-4 border-t border-stroke dark:border-strokedark">
          <CommonButtonFull
            label="Simpan Pengajuan DPM"
            disabled={loadingSubmit}
            onload={loadingSubmit}
            onClick={save_item}
          />
        </div>
      </div>
    </div>
  );

  return (
    <UserAuth>
      <div className="min-h-screen bg-whiten text-body dark:bg-boxdark-2 dark:text-bodydark">
        {loading ? (
          <PageLoader />
        ) : isSmallScreen ? (
          /* Mobile View */
          <div className="flex flex-col min-h-screen pb-16">
            <div className="sticky top-0 z-40 flex items-center justify-between border-b border-stroke/60 bg-white/80 px-4 py-3 backdrop-blur-md dark:border-strokedark/60 dark:bg-boxdark/80">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-black hover:bg-gray-200 dark:bg-meta-4 dark:text-white"
              >
                <HiArrowLeft className="text-lg" />
              </button>
              <h1 className="text-sm font-bold text-black dark:text-white">
                Pengadaan Part (Stock In)
              </h1>
              <div className="w-9" />
            </div>

            <div className="p-4">{contentForm}</div>
          </div>
        ) : (
          /* Desktop View */
          <DefaultLayout>
            <div className="mx-auto max-w-4xl space-y-6">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-stroke bg-white text-black hover:bg-gray-50 dark:border-strokedark dark:bg-boxdark dark:text-white transition-all shadow-sm"
                >
                  <HiArrowLeft className="text-xl" />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-black dark:text-white">
                    Formulir Pengadaan Suku Cadang (Stock In)
                  </h1>
                  <p className="text-xs text-body dark:text-bodydark">
                    Pendaftaran Daftar Permohonan Material (DPM) untuk penambahan stok atau kebutuhan perbaikan
                  </p>
                </div>
              </div>

              {contentForm}
            </div>
          </DefaultLayout>
        )}
      </div>
    </UserAuth>
  );
}
