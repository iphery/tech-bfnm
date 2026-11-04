"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "react-responsive";
import UserAuth from "@/components/auth";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { CommonInput, CurrencyInput } from "@/components/input";
import { CommonButtonFull } from "@/components/button";
import { CustomSelect } from "@/components/select";
import { PageCard } from "@/components/card";
import { PageLoader } from "@/components/loader";
import { formatDate } from "@/utils/dateformat";
import { NotifyError, NotifySuccess } from "@/utils/notify";

// Icons
import {
  HiArrowLeft,
  HiOutlineTrash,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineDocumentText,
} from "react-icons/hi";

export default function PartOrderDetail({ params }) {
  const router = useRouter();
  const isSmallScreen = useMediaQuery({ query: "(max-width: 640px)" });
  const idRegister = params?.idRegister || "";

  const [dataOrder, setDataOrder] = useState({});
  const [dataOrderDetail, setDataOrderDetail] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const [loader, setLoader] = useState(true);
  const [onSubmit, setOnSubmit] = useState(false);
  const [loaderDelete, setLoaderDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const groupBudget = [
    { label: "ME01", value: "ME01", title: "Pelumasan" },
    { label: "ME02", value: "ME02", title: "Servis Kendaraan" },
    { label: "ME03", value: "ME03", title: "Servis Mesin Produksi" },
    { label: "ME04", value: "ME04", title: "Spare Part Kendaraan" },
    { label: "ME05", value: "ME05", title: "Spare Part Mesin Produksi" },
  ];

  const [listData, setListData] = useState([]);
  const [amountError, setAmountError] = useState([]);
  const [budgetError, setBudgetError] = useState([]);
  const [sellerError, setSellerError] = useState([]);
  const [dateReceive, setDateReceive] = useState(new Date().toISOString().substring(0, 10));
  const [dateReceiveError, setDateReceiveError] = useState(false);

  const fetch_data = async () => {
    try {
      const response = await axios.post("/api/getorderdetail", {
        idRegister: idRegister,
      });

      if (response.status === 200) {
        const order = response.data?.order?.[0] || {};
        const detail = response.data?.detail || [];
        setDataOrder(order);
        setDataOrderDetail(detail);

        const list = [];
        const aErr = [];
        const bErr = [];
        const sErr = [];

        detail.forEach((item) => {
          list.push({
            id: item.ids,
            amount: item.amount || "",
            budget: item.budget_pos || "",
            seller: item.seller || "",
            stock: item.stock,
          });
          aErr.push(false);
          bErr.push(false);
          sErr.push(false);
        });

        setListData(list);
        setAmountError(aErr);
        setBudgetError(bErr);
        setSellerError(sErr);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    if (idRegister) {
      fetch_data();
    }
    setIsClient(true);
  }, [idRegister]);

  const receive_parts = async () => {
    setOnSubmit(true);
    let hasErr = false;

    if (!dateReceive) {
      setDateReceiveError(true);
      hasErr = true;
    } else {
      setDateReceiveError(false);
    }

    const nextAmountErr = [...amountError];
    const nextBudgetErr = [...budgetError];
    const nextSellerErr = [...sellerError];

    listData.forEach((item, idx) => {
      const amt = Number(item.amount || 0);
      if (amt <= 0) {
        nextAmountErr[idx] = true;
        hasErr = true;
      } else {
        nextAmountErr[idx] = false;
      }

      if (!item.budget) {
        nextBudgetErr[idx] = true;
        hasErr = true;
      } else {
        nextBudgetErr[idx] = false;
      }

      if (!item.seller?.trim()) {
        nextSellerErr[idx] = true;
        hasErr = true;
      } else {
        nextSellerErr[idx] = false;
      }
    });

    setAmountError(nextAmountErr);
    setBudgetError(nextBudgetErr);
    setSellerError(nextSellerErr);

    if (hasErr) {
      NotifyError("Harap lengkapi harga, pos anggaran, dan supplier untuk semua item");
      setOnSubmit(false);
      return;
    }

    try {
      const user = localStorage.getItem("info");
      const parseUser = user ? JSON.parse(user) : [{}];

      const res = await axios.post("/api/getorderreceived", {
        idRegister: idRegister,
        date: dateReceive,
        list: listData,
        uid: parseUser[0]?.Uid || "",
      });

      if (res.status === 200) {
        NotifySuccess(res.data.response || "Penerimaan barang berhasil disimpan");
        fetch_data();
      }
    } catch (e) {
      NotifyError("Gagal menyimpan penerimaan barang");
    } finally {
      setOnSubmit(false);
    }
  };

  const delete_order = async () => {
    setLoaderDelete(true);
    try {
      const res = await axios.post("/api/deleteorder", {
        idOrder: idRegister,
      });

      if (res.status === 200) {
        NotifySuccess(res.data.response || "Order berhasil dihapus");
        router.push("/partsorder");
      }
    } catch (e) {
      NotifyError("Gagal menghapus order");
    } finally {
      setLoaderDelete(false);
      setDeleteConfirm(false);
    }
  };

  if (!isClient) return null;

  const isClosed = dataOrder.status === 1 || dataOrder.status_def === "CLOSE";

  const renderContent = (
    <div className="space-y-4">
      {/* Order Info Banner */}
      <div className="rounded-2xl border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark">
        <div className="flex items-start justify-between gap-2 border-b border-stroke pb-3 dark:border-strokedark">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-black dark:text-white">
                {dataOrder.id_register}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  isClosed ? "bg-success/15 text-success" : "bg-warning/15 text-warning"
                }`}
              >
                {isClosed ? "Diterima / Closed" : "Menunggu Penerimaan / Open"}
              </span>
            </div>
            <h2 className="text-base font-bold text-black dark:text-white">
              DPM: {dataOrder.dpm}
            </h2>
          </div>

          {!isClosed && (
            deleteConfirm ? (
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  type="button"
                  disabled={loaderDelete}
                  onClick={delete_order}
                  className="font-bold text-danger hover:underline"
                >
                  {loaderDelete ? "..." : "Hapus"}
                </button>
                <span className="text-stroke dark:text-strokedark">|</span>
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(false)}
                  className="text-body dark:text-bodydark hover:underline"
                >
                  Batal
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setDeleteConfirm(true)}
                className="flex items-center gap-1 text-xs text-danger hover:underline"
              >
                <HiOutlineTrash className="text-sm" />
                <span>Hapus Order</span>
              </button>
            )
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-3">
          <div className="rounded-xl bg-gray-50 p-2.5 dark:bg-meta-4/20">
            <span className="block text-[10px] text-body dark:text-bodydark">Tanggal Pengajuan</span>
            <span className="font-semibold text-black dark:text-white">
              {formatDate(dataOrder.date)}
            </span>
          </div>

          <div className="rounded-xl bg-gray-50 p-2.5 dark:bg-meta-4/20">
            <span className="block text-[10px] text-body dark:text-bodydark">Pemohon (Issued)</span>
            <span className="font-semibold text-black dark:text-white">
              {dataOrder.Name || "-"}
            </span>
          </div>

          <div className="rounded-xl bg-gray-50 p-2.5 dark:bg-meta-4/20">
            <span className="block text-[10px] text-body dark:text-bodydark">Tanggal Diterima</span>
            <span className="font-semibold text-black dark:text-white">
              {dataOrder.receive_date ? formatDate(dataOrder.receive_date) : "-"}
            </span>
          </div>

          <div className="rounded-xl bg-gray-50 p-2.5 dark:bg-meta-4/20">
            <span className="block text-[10px] text-body dark:text-bodydark">Penerima Gudang</span>
            <span className="font-semibold text-black dark:text-white">
              {dataOrder.receiver || "-"}
            </span>
          </div>
        </div>

        {/* Receive Date Input (if still open) */}
        {!isClosed && (
          <div className="mt-4 pt-4 border-t border-stroke dark:border-strokedark max-w-xs text-xs">
            <label className="block font-semibold text-black dark:text-white mb-1">
              Tanggal Penerimaan Fisik Barang
            </label>
            <CommonInput
              type="date"
              input={dateReceive}
              error={dateReceiveError}
              errorMessage="Wajib diisi"
              onInputChange={(val) => setDateReceive(val)}
              onChg={() => setDateReceiveError(false)}
            />
          </div>
        )}
      </div>

      {/* Items List & Receive Form */}
      <div className="rounded-2xl border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark">
        <h3 className="text-sm font-bold uppercase tracking-wider text-black dark:text-white mb-3">
          Rincian Barang yang Dipesan ({dataOrderDetail.length} item)
        </h3>

        <div className="space-y-3">
          {dataOrderDetail.map((item, index) => {
            const currentItem = listData[index] || {};

            return (
              <div
                key={index}
                className="rounded-xl border border-stroke p-3 dark:border-strokedark bg-gray-50/50 dark:bg-meta-4/10 text-xs space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-semibold text-black dark:text-white text-sm block">
                      {item.description}
                    </span>
                    <span className="text-[11px] text-body dark:text-bodydark font-mono">
                      {item.stock} {item.id_service ? `• Tiket #${item.id_service}` : ""}
                    </span>
                    {item.note && (
                      <span className="text-[11px] italic text-body dark:text-bodydark block">
                        Catatan: {item.note}
                      </span>
                    )}
                  </div>
                  <span className="rounded-lg bg-primary/10 px-2.5 py-1 font-mono font-bold text-primary shrink-0">
                    {item.quantity} {item.unit}
                  </span>
                </div>

                {/* Form fields to receive the item */}
                {!isClosed ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 border-t border-stroke/60 pt-2.5 dark:border-strokedark/60">
                    <div>
                      <label className="block text-[10px] text-body dark:text-bodydark mb-0.5 font-semibold">
                        Harga Total (Amount)
                      </label>
                      <CurrencyInput
                        placeholder="Rp 0"
                        input={currentItem.amount}
                        error={amountError[index]}
                        errorMessage="Wajib"
                        onInputChange={(val) => {
                          const updated = [...listData];
                          updated[index] = { ...updated[index], amount: val };
                          setListData(updated);
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-body dark:text-bodydark mb-0.5 font-semibold">
                        Pos Anggaran (Budget)
                      </label>
                      <CustomSelect
                        options={groupBudget}
                        selectedOption={currentItem.budget}
                        error={budgetError[index]}
                        errorMessage="Wajib"
                        onChange={(e) => {
                          const updated = [...listData];
                          updated[index] = { ...updated[index], budget: e.target.value };
                          setListData(updated);
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-body dark:text-bodydark mb-0.5 font-semibold">
                        Supplier / Penjual
                      </label>
                      <CommonInput
                        placeholder="Nama Toko / Vendor..."
                        input={currentItem.seller}
                        error={sellerError[index]}
                        errorMessage="Wajib"
                        onInputChange={(val) => {
                          const updated = [...listData];
                          updated[index] = { ...updated[index], seller: val };
                          setListData(updated);
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 border-t border-stroke/60 pt-2 text-[11px] text-body dark:border-strokedark/60 dark:text-bodydark">
                    <div>
                      <span className="block text-[10px] opacity-75">Harga</span>
                      <span className="font-semibold text-black dark:text-white">
                        Rp {Number(item.amount || 0).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] opacity-75">Pos Anggaran</span>
                      <span className="font-semibold text-black dark:text-white">
                        {item.budget_pos || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] opacity-75">Supplier</span>
                      <span className="font-semibold text-black dark:text-white">
                        {item.seller || "-"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Submit Receive Action */}
        {!isClosed && (
          <div className="pt-4 mt-4 border-t border-stroke dark:border-strokedark">
            <CommonButtonFull
              label="Konfirmasi Penerimaan Barang (Masuk Gudang)"
              disabled={onSubmit}
              onload={onSubmit}
              onClick={receive_parts}
            />
          </div>
        )}
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
              <h1 className="text-sm font-bold text-black dark:text-white truncate max-w-[200px]">
                Rincian Order #{idRegister}
              </h1>
              <div className="w-9" />
            </div>

            <div className="p-4">{renderContent}</div>
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
                    Rincian Order Pengadaan Barang (DPM)
                  </h1>
                  <p className="text-xs text-body dark:text-bodydark">
                    Formulir verifikasi kedatangan suku cadang dan pemutakhiran stok gudang
                  </p>
                </div>
              </div>

              {renderContent}
            </div>
          </DefaultLayout>
        )}
      </div>
    </UserAuth>
  );
}
