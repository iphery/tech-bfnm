"use client";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "react-responsive";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import UserAuth from "@/components/auth";
import { CommonInput } from "@/components/input";
import { CommonButtonFull } from "@/components/button";
import { PageCard } from "@/components/card";
import { PageLoader } from "@/components/loader";
import { NotifyError, NotifySuccess, AlertMessage } from "@/utils/notify";

// Icons
import {
  HiArrowLeft,
  HiOutlineSearch,
  HiOutlineTrash,
  HiOutlineCube,
  HiOutlineCheck,
} from "react-icons/hi";
import { TbArrowsExchange2 } from "react-icons/tb";
import { IoWarningSharp } from "react-icons/io5";
import { BsCartPlus, BsBoxSeam } from "react-icons/bs";

export default function PartsOut() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const isSmallScreen = useMediaQuery({ query: "(max-width: 640px)" });

  const [loader, setLoader] = useState(true);
  const [detailData, setDetailData] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [filteredList, setFilteredList] = useState([]);
  const [keywordAsset, setKeywordAsset] = useState("");

  const [tempItem, setTempItem] = useState("");
  const [tempIdPart, setTempIdPart] = useState("");
  const [tempQuantity, setTempQuantity] = useState("");
  const [tempAvailableQuantity, setTempAvailableQuantity] = useState(0);
  const [tempUnit, setTempUnit] = useState("");
  const [tempTypePart, setTempTypePart] = useState("");
  const focusTempQuantity = useRef(null);
  const focusKeyword = useRef(null);

  const [searchNotFound, setSearchNotFound] = useState(false);
  const [searchAssetNotFound, setSearchAssetNotFound] = useState(false);
  const [idService, setIdService] = useState("");
  const [dataAsset, setDataAsset] = useState({
    id_asset: "",
    description: "",
    manufacture: "",
    model: "",
    no: "",
    type: "",
    user: "",
  });

  const [categoryTrans, setCategoryTrans] = useState("Umum");
  const [inputReceiver, setInputReceiver] = useState("");
  const [inputReceiverError, setInputReceiverError] = useState(false);
  const [inputDate, setInputDate] = useState(new Date().toISOString().substring(0, 10));
  const [inputDateError, setInputDateError] = useState(false);

  const [listOrder, setListOrder] = useState([]);
  const [listAsset, setListAsset] = useState([]);
  const [filteredAsset, setFilteredAsset] = useState([]);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [emptyListAlert, setEmptyListAlert] = useState(false);

  const fetch_data = async () => {
    try {
      const response = await axios.post("/api/stocklist");
      if (response.status === 200) {
        setDetailData(response.data.response || []);
        setListAsset(response.data.asset || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    fetch_data();
    const data_asset = localStorage.getItem("data_asset");
    const id_service = localStorage.getItem("id_service");
    setIdService(id_service || "");

    if (data_asset) {
      try {
        const parseData = JSON.parse(data_asset);
        setDataAsset({
          id_asset: parseData.ID_Asset || "",
          description: parseData.Description || "",
          manufacture: parseData.Manufacture || "",
          model: parseData.Model || "",
          no: parseData.No || "",
          type: parseData.Type || "",
          user: parseData.User || "",
        });
        setCategoryTrans("Service");
      } catch (err) {
        console.error(err);
      }
    } else {
      setCategoryTrans("Umum");
    }
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
      return desc.includes(q) || code.includes(q);
    });
    setFilteredList(filtered);
    setSearchNotFound(filtered.length === 0);
  }, [keyword, detailData]);

  useEffect(() => {
    if (!keywordAsset.trim()) {
      setFilteredAsset([]);
      setSearchAssetNotFound(false);
      return;
    }
    const q = keywordAsset.toLowerCase();
    const filtered = listAsset.filter((item) => {
      const desc = (item.description || "").toLowerCase();
      const man = (item.manufacture || "").toLowerCase();
      const mod = (item.model || "").toLowerCase();
      const id = (item.id_asset || "").toLowerCase();
      return desc.includes(q) || man.includes(q) || mod.includes(q) || id.includes(q);
    });
    setFilteredAsset(filtered);
    setSearchAssetNotFound(filtered.length === 0);
  }, [keywordAsset, listAsset]);

  const addOrderItem = () => {
    if (!tempIdPart) {
      NotifyError("Pilih suku cadang terlebih dahulu");
      return;
    }
    const qty = parseInt(tempQuantity);
    if (isNaN(qty) || qty <= 0) {
      NotifyError("Masukkan jumlah yang valid");
      return;
    }
    if (qty > tempAvailableQuantity) {
      AlertMessage("Stok tidak mencukupi");
      return;
    }

    const newList = [...listOrder];
    const findIndex = newList.findIndex((v) => v.id_part === tempIdPart);

    if (findIndex !== -1) {
      const newTotal = parseInt(newList[findIndex].quantity) + qty;
      if (newTotal > tempAvailableQuantity) {
        AlertMessage("Total item melebihi stok yang tersedia");
        return;
      }
      newList[findIndex].quantity = newTotal;
    } else {
      newList.push({
        id_part: tempIdPart,
        description: tempItem,
        type: tempTypePart,
        quantity: qty,
        unit: tempUnit,
      });
      setEmptyListAlert(false);
    }

    setListOrder(newList);
    setTempItem("");
    setTempIdPart("");
    setTempQuantity("");
    setTempUnit("");
    setTempTypePart("");
    setTempAvailableQuantity(0);
    setKeyword("");
    if (focusKeyword.current) {
      focusKeyword.current.focus();
    }
  };

  const removeOrderItem = (index) => {
    setListOrder((prev) => prev.filter((_, idx) => idx !== index));
  };

  const save_data = async () => {
    let hasError = false;
    if (!inputDate) {
      setInputDateError(true);
      hasError = true;
    }
    if (!inputReceiver.trim()) {
      setInputReceiverError(true);
      hasError = true;
    }
    if (listOrder.length === 0) {
      setEmptyListAlert(true);
      hasError = true;
    }

    if (hasError) return;

    setLoadingSubmit(true);
    try {
      const user = localStorage.getItem("info");
      const parseUser = user ? JSON.parse(user) : [{}];

      const res = await axios.post("/api/transout", {
        date: inputDate,
        receiver: inputReceiver,
        serviceId: idService,
        category: categoryTrans,
        assetId: dataAsset.id_asset,
        order: listOrder,
        uid: parseUser[0]?.Uid || "",
      });

      if (res.status === 200) {
        NotifySuccess(res.data.response || "Pengeluaran stok berhasil disimpan");
        localStorage.setItem("id_service", "");
        localStorage.setItem("data_asset", "");
        router.back();
      }
    } catch (e) {
      NotifyError("Gagal menyimpan pengeluaran stok");
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
          Informasi Pengeluaran
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-black dark:text-white mb-1">
              Tanggal Transaksi
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
              Nama Penerima
            </label>
            <CommonInput
              type="text"
              placeholder="Nama personil penerima suku cadang..."
              input={inputReceiver}
              error={inputReceiverError}
              errorMessage="Nama penerima wajib diisi"
              onInputChange={(val) => setInputReceiver(val)}
              onKeyChange={() => setInputReceiverError(false)}
            />
          </div>
        </div>

        {/* Category & Asset Target */}
        <div className="mt-4 pt-4 border-t border-stroke/60 dark:border-strokedark/60 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-black dark:text-white">
                Kategori Pengeluaran
              </label>
              {categoryTrans === "Service" && (
                <button
                  type="button"
                  onClick={() => {
                    setCategoryTrans("Umum");
                    setIdService("");
                    localStorage.setItem("id_service", "");
                    localStorage.setItem("data_asset", "");
                    setDataAsset({ id_asset: "", description: "", manufacture: "", model: "" });
                  }}
                  className="flex items-center gap-1 text-[11px] text-primary hover:underline"
                >
                  <TbArrowsExchange2 />
                  <span>Ubah ke Umum</span>
                </button>
              )}
            </div>
            <div className="rounded-xl border border-stroke bg-gray-50 px-3 py-2 font-medium text-black dark:border-strokedark dark:bg-meta-4/20 dark:text-white">
              {categoryTrans === "Service" ? `Servis Tiket #${idService}` : "Pengeluaran Umum (Aset / Non-Tiket)"}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-black dark:text-white mb-1">
              Aset Target
            </label>
            {categoryTrans === "Service" ? (
              <div className="rounded-xl border border-stroke bg-gray-50 px-3 py-2 font-medium text-black dark:border-strokedark dark:bg-meta-4/20 dark:text-white truncate">
                {dataAsset.id_asset ? `${dataAsset.id_asset} - ${dataAsset.description}` : "Aset tidak terikat"}
              </div>
            ) : (
              <div className="relative">
                <CommonInput
                  placeholder="Cari kode atau nama aset..."
                  input={keywordAsset}
                  onInputChange={(val) => setKeywordAsset(val)}
                >
                  <HiOutlineSearch className="text-body dark:text-bodydark" />
                </CommonInput>

                {dataAsset.id_asset && !keywordAsset && (
                  <div className="mt-1 text-[11px] text-success font-semibold">
                    Terpilih: {dataAsset.id_asset} - {dataAsset.description}
                  </div>
                )}

                {/* Dropdown search asset */}
                {keywordAsset.length >= 2 && (
                  <div className="absolute z-30 left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-xl border border-stroke bg-white p-2 shadow-xl dark:border-strokedark dark:bg-boxdark">
                    {searchAssetNotFound ? (
                      <div className="p-2 text-center text-xs text-body dark:text-bodydark">
                        Aset tidak ditemukan
                      </div>
                    ) : (
                      filteredAsset.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setDataAsset({
                              id_asset: item.id_asset,
                              description: item.description,
                              manufacture: item.manufacture,
                              model: item.model,
                            });
                            setKeywordAsset("");
                          }}
                          className="cursor-pointer rounded-lg p-2 text-xs hover:bg-gray-100 dark:hover:bg-meta-4/30 transition-colors"
                        >
                          <span className="font-mono font-bold text-primary mr-2">{item.id_asset}</span>
                          <span className="text-black dark:text-white">{item.description}</span>
                          <span className="text-body dark:text-bodydark text-[11px] block">{item.manufacture}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Part Selection & Add to List */}
      <div className="rounded-2xl border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark">
        <h2 className="text-sm font-bold uppercase tracking-wider text-black dark:text-white mb-3">
          Pilih Suku Cadang
        </h2>

        <div className="relative mb-3">
          <CommonInput
            input={keyword}
            reference={focusKeyword}
            onInputChange={(val) => setKeyword(val)}
            placeholder="Cari suku cadang di gudang..."
          >
            <HiOutlineSearch className="text-body dark:text-bodydark" />
          </CommonInput>

          {/* Autocomplete Dropdown */}
          {keyword.length >= 2 && (
            <div className="absolute z-30 left-0 right-0 mt-1 max-h-56 overflow-y-auto rounded-xl border border-stroke bg-white p-2 shadow-xl dark:border-strokedark dark:bg-boxdark">
              {searchNotFound ? (
                <div className="p-3 text-center text-xs text-body dark:text-bodydark">
                  Suku cadang tidak ditemukan
                </div>
              ) : (
                filteredList.map((item, idx) => {
                  const avail = Number(item.available_quantity || 0);
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setTempIdPart(item.id_part);
                        setTempItem(item.description);
                        setTempTypePart(item.vendor_code || "");
                        setTempUnit(item.unit || "pcs");
                        setTempAvailableQuantity(avail);
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
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          avail > 0 ? "bg-success/15 text-success" : "bg-danger/15 text-danger"
                        }`}
                      >
                        Sisa: {avail} {item.unit}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Selected Part & Quantity Row */}
        {tempIdPart && (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 dark:bg-primary/10 mb-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-black dark:text-white truncate">
                {tempItem} {tempTypePart ? `(${tempTypePart})` : ""}
              </span>
              <span className="text-[11px] text-primary font-semibold">
                Tersedia: {tempAvailableQuantity} {tempUnit}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-32">
                <CommonInput
                  placeholder="Jumlah..."
                  type="number"
                  input={tempQuantity}
                  reference={focusTempQuantity}
                  onInputChange={(val) => setTempQuantity(val)}
                  onKeyChange={(e) => {
                    if (e.key === "Enter") addOrderItem();
                  }}
                />
              </div>
              <button
                type="button"
                onClick={addOrderItem}
                className="rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white shadow hover:bg-opacity-90 active:scale-[0.99] transition-all"
              >
                + Tambahkan
              </button>
            </div>
          </div>
        )}

        {/* Selected Items List */}
        <div>
          <span className="text-xs font-semibold text-body dark:text-bodydark block mb-2">
            Daftar Suku Cadang yang Dikeluarkan ({listOrder.length} item)
          </span>

          {emptyListAlert && (
            <div className="rounded-xl border border-warning/50 bg-warning/10 p-2.5 text-xs text-warning mb-2 flex items-center gap-2">
              <IoWarningSharp className="text-base shrink-0" />
              <span>Daftar pengeluaran suku cadang tidak boleh kosong.</span>
            </div>
          )}

          {listOrder.length === 0 ? (
            <div className="rounded-xl border border-dashed border-stroke p-6 text-center text-xs text-body dark:border-strokedark dark:text-bodydark">
              Belum ada suku cadang yang dimasukkan. Silakan cari part di atas.
            </div>
          ) : (
            <div className="divide-y divide-stroke dark:divide-strokedark rounded-xl border border-stroke dark:border-strokedark overflow-hidden">
              {listOrder.map((item, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between text-xs bg-white dark:bg-boxdark">
                  <div>
                    <span className="font-semibold text-black dark:text-white block">
                      {item.description}
                    </span>
                    <span className="font-mono text-[10px] text-body dark:text-bodydark">
                      {item.type || ""}
                    </span>
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
        </div>

        {/* Submit Button */}
        <div className="pt-4 mt-4 border-t border-stroke dark:border-strokedark">
          <CommonButtonFull
            label="Simpan Pengeluaran Stok"
            disabled={loadingSubmit}
            onload={loadingSubmit}
            onClick={save_data}
          />
        </div>
      </div>
    </div>
  );

  return (
    <UserAuth>
      <div className="min-h-screen bg-whiten text-body dark:bg-boxdark-2 dark:text-bodydark">
        {loader ? (
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
                Pengeluaran Suku Cadang (Stock Out)
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
                    Formulir Pengeluaran Suku Cadang (Stock Out)
                  </h1>
                  <p className="text-xs text-body dark:text-bodydark">
                    Pencatatan suku cadang yang dikeluarkan dari gudang untuk keperluan perbaikan atau operasional
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
