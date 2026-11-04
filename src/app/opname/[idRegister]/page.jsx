"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "react-responsive";
import UserAuth from "@/components/auth";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { CommonInput } from "@/components/input";
import { CommonButtonFull } from "@/components/button";
import { PageCard } from "@/components/card";
import { PageLoader } from "@/components/loader";
import { CustomModal } from "@/components/modal";
import { formatDateTime, getDateTime, shortDate } from "@/utils/dateformat";
import { NotifySuccess, NotifyError } from "@/utils/notify";
import { useProvider } from "@/app/appcontext";

// Icons
import {
  HiArrowLeft,
  HiOutlineMagnifyingGlass as HiOutlineSearch,
  HiOutlinePrinter,
  HiOutlinePencilSquare,
  HiOutlineCheckCircle,
  HiOutlineCalendar,
  HiOutlineUser,
} from "react-icons/hi2";
import { TiInputChecked } from "react-icons/ti";
import { BsBoxSeam } from "react-icons/bs";

export default function DetailOpname({ params }) {
  const router = useRouter();
  const isSmallScreen = useMediaQuery({ query: "(max-width: 640px)" });
  const idRegister = params?.idRegister || "";

  const [loader, setLoader] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [opnameData, setOpnameData] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [modalActual, setModalActual] = useState(false);
  const [selectedPart, setSelectedPart] = useState("");
  const [inputActual, setInputActual] = useState("");
  const [savingActual, setSavingActual] = useState(false);
  const { setOpnameIdRegister } = useProvider();
  const [onloadChecked, setOnloadChecked] = useState(false);

  const [info, setInfo] = useState({
    name: "",
    id_report: "",
    startDate: "",
    endDate: "",
    created: "",
  });

  const [uid, setUid] = useState("");
  const [userName, setUserName] = useState("");
  const [keyword, setKeyword] = useState("");

  const fetch_data = async () => {
    try {
      const response = await axios.post("/api/opnamedetail", {
        idRegister: idRegister,
      });

      if (response.status === 200 && response.data?.response?.length > 0) {
        const item = response.data.response[0];
        let result = [];
        try {
          result = typeof item.result === "string" ? JSON.parse(item.result) : item.result;
        } catch (e) {
          result = [];
        }

        setInfo({
          name: item.Name || "-",
          id_report: item.id_report,
          startDate: item.start_date,
          endDate: item.end_date,
          created: item.created_at,
        });

        setOpnameData(result);
        setFilteredList(result);

        const user = localStorage.getItem("info");
        if (user) {
          try {
            const parseUser = JSON.parse(user);
            setUid(parseUser[0]?.Uid || "");
            setUserName(parseUser[0]?.Name || "Staff");
          } catch (err) {
            console.error(err);
          }
        }
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

  useEffect(() => {
    if (!keyword.trim()) {
      setFilteredList(opnameData);
      return;
    }
    const q = keyword.toLowerCase();
    const filtered = opnameData.filter((item) => {
      const desc = (item.description || "").toLowerCase();
      const code = (item.vendor_code || "").toLowerCase();
      const loc = (item.location || "").toLowerCase();
      return desc.includes(q) || code.includes(q) || loc.includes(q);
    });
    setFilteredList(filtered);
  }, [opnameData, keyword]);

  const checkAllItems = async () => {
    setOnloadChecked(true);
    try {
      const lists = [...opnameData];
      lists.forEach((item) => {
        if (!item.checked_by) {
          item.actual = item.balance;
          item.diff = 0;
          item.checked_at = getDateTime();
          item.checked_by = userName;
          item.checked_id = uid;
        }
      });

      const res = await axios.post("/api/opnamecheckedall", {
        idRegister: idRegister,
        uid: uid,
        data: lists,
      });

      if (res.status === 200) {
        NotifySuccess("Semua item berhasil diverifikasi sesuai saldo sistem");
        setOpnameData(lists);
      }
    } catch (e) {
      NotifyError("Gagal verifikasi semua item");
    } finally {
      setOnloadChecked(false);
    }
  };

  const saveActualQuantity = async () => {
    const act = parseInt(inputActual);
    if (isNaN(act) || act < 0) {
      NotifyError("Masukkan angka stok fisik yang valid");
      return;
    }

    setSavingActual(true);
    try {
      const lists = [...opnameData];
      lists.forEach((item) => {
        if (item.id_part === selectedPart) {
          item.actual = act;
          item.diff = act - Number(item.balance || 0);
          item.checked_at = getDateTime();
          item.checked_by = userName;
          item.checked_id = uid;
        }
      });

      const res = await axios.post("/api/opnameupdateactual", {
        idRegister: idRegister,
        data: lists,
      });

      if (res.status === 200) {
        setOpnameData(lists);
        setModalActual(false);
        setInputActual("");
        NotifySuccess("Stok fisik berhasil diperbarui");
      }
    } catch (e) {
      NotifyError("Gagal memperbarui stok fisik");
    } finally {
      setSavingActual(false);
    }
  };

  if (!isClient) return null;

  const renderContent = (
    <div className="space-y-4">
      {/* Header Info Card */}
      <div className="rounded-2xl border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-stroke pb-3 dark:border-strokedark">
          <div>
            <span className="font-mono text-xs font-bold text-primary block mb-1">
              {info.id_report}
            </span>
            <h2 className="text-base font-bold text-black dark:text-white leading-tight">
              Audit Stock Opname Gudang
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setOpnameIdRegister(idRegister);
                router.push(`/opname/${idRegister}/printout`);
              }}
              className="flex items-center gap-1 rounded-xl border border-stroke px-3 py-1.5 text-xs font-medium text-black hover:bg-gray-50 dark:border-strokedark dark:text-white dark:hover:bg-meta-4/20 transition-colors"
            >
              <HiOutlinePrinter className="text-sm" />
              <span>Print Laporan</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setOpnameIdRegister(idRegister);
                router.push(`/opname/${idRegister}/printform`);
              }}
              className="flex items-center gap-1 rounded-xl border border-stroke px-3 py-1.5 text-xs font-medium text-black hover:bg-gray-50 dark:border-strokedark dark:text-white dark:hover:bg-meta-4/20 transition-colors"
            >
              <HiOutlinePrinter className="text-sm" />
              <span>Form Cetak</span>
            </button>

            <button
              type="button"
              disabled={onloadChecked}
              onClick={checkAllItems}
              className="flex items-center gap-1.5 rounded-xl bg-success px-3.5 py-1.5 text-xs font-semibold text-white shadow hover:bg-opacity-90 active:scale-[0.99] transition-all"
            >
              <TiInputChecked className="text-base" />
              <span>{onloadChecked ? "Menyimpan..." : "Checked All (Sesuai Saldo)"}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-3">
          <div className="rounded-xl bg-gray-50 p-2.5 dark:bg-meta-4/20">
            <span className="block text-[10px] text-body dark:text-bodydark">Periode Audit</span>
            <span className="font-semibold text-black dark:text-white">
              {shortDate(info.startDate)} s/d {shortDate(info.endDate)}
            </span>
          </div>

          <div className="rounded-xl bg-gray-50 p-2.5 dark:bg-meta-4/20">
            <span className="block text-[10px] text-body dark:text-bodydark">Auditor / Pembuat</span>
            <span className="font-semibold text-black dark:text-white">
              {info.name}
            </span>
          </div>

          <div className="rounded-xl bg-gray-50 p-2.5 dark:bg-meta-4/20">
            <span className="block text-[10px] text-body dark:text-bodydark">Waktu Pembuatan</span>
            <span className="font-semibold text-black dark:text-white">
              {formatDateTime(info.created)}
            </span>
          </div>

          <div className="rounded-xl bg-gray-50 p-2.5 dark:bg-meta-4/20">
            <span className="block text-[10px] text-body dark:text-bodydark">Progres Verifikasi</span>
            <span className="font-bold text-primary">
              {opnameData.filter((i) => i.checked_by).length} / {opnameData.length} item
            </span>
          </div>
        </div>
      </div>

      {/* Part List & Actual Input */}
      <div className="rounded-2xl border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stroke pb-3 dark:border-strokedark">
          <div className="w-full sm:w-80">
            <CommonInput
              input={keyword}
              type="text"
              onInputChange={(val) => setKeyword(val)}
              placeholder="Cari part, vendor code, lokasi..."
            >
              <HiOutlineSearch className="text-body dark:text-bodydark" />
            </CommonInput>
          </div>

          <span className="text-xs text-body dark:text-bodydark">
            Menampilkan {filteredList.length} item suku cadang
          </span>
        </div>

        {isSmallScreen ? (
          /* Mobile Card Feed */
          <div className="space-y-2.5 pt-3">
            {filteredList.map((item, index) => {
              const diff = Number(item.diff || 0);
              const isChecked = Boolean(item.checked_by);

              return (
                <div
                  key={index}
                  className="rounded-xl border border-stroke p-3 dark:border-strokedark bg-white dark:bg-boxdark text-xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-black dark:text-white text-xs block truncate">
                        {item.description}
                      </span>
                      <span className="font-mono text-[10px] text-body dark:text-bodydark">
                        {item.vendor_code} • Lokasi: {item.location || "-"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPart(item.id_part);
                        setInputActual(item.actual !== undefined ? String(item.actual) : "");
                        setModalActual(true);
                      }}
                      className="flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition-colors shrink-0"
                    >
                      <HiOutlinePencilSquare />
                      <span>Fisik: {item.actual}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-1 text-center border-t border-stroke/60 pt-2 text-[10px] text-body dark:border-strokedark/60 dark:text-bodydark">
                    <div>
                      <span className="block opacity-75">Saldo</span>
                      <span className="font-bold text-black dark:text-white">{item.balance}</span>
                    </div>
                    <div>
                      <span className="block opacity-75">Fisik</span>
                      <span className="font-bold text-black dark:text-white">{item.actual}</span>
                    </div>
                    <div>
                      <span className="block opacity-75">Selisih</span>
                      <span
                        className={`font-bold ${
                          diff === 0
                            ? "text-success"
                            : diff > 0
                            ? "text-primary"
                            : "text-danger"
                        }`}
                      >
                        {diff > 0 ? `+${diff}` : diff}
                      </span>
                    </div>
                    <div>
                      <span className="block opacity-75">Status</span>
                      <span className={`font-semibold ${isChecked ? "text-success" : "text-warning"}`}>
                        {isChecked ? "Checked" : "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Desktop Table View */
          <div className="overflow-x-auto pt-3">
            <table className="w-full table-auto text-left text-xs">
              <thead>
                <tr className="border-b border-stroke bg-gray-50 text-body dark:border-strokedark dark:bg-meta-4/20 dark:text-bodydark">
                  <th className="py-2.5 px-3 font-semibold">Deskripsi Suku Cadang</th>
                  <th className="py-2.5 px-3 font-semibold">Part No</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Saldo Awal</th>
                  <th className="py-2.5 px-3 font-semibold text-center text-success">Masuk (+)</th>
                  <th className="py-2.5 px-3 font-semibold text-center text-warning">Keluar (-)</th>
                  <th className="py-2.5 px-3 font-semibold text-center text-primary">Saldo Sistem</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Fisik Aktual</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Selisih</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Auditor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke dark:divide-strokedark">
                {filteredList.map((item, index) => {
                  const diff = Number(item.diff || 0);
                  const isChecked = Boolean(item.checked_by);

                  return (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 dark:hover:bg-meta-4/10 transition-colors"
                    >
                      <td className="py-2 px-3 font-semibold text-black dark:text-white">
                        {item.description}
                      </td>
                      <td className="py-2 px-3 font-mono text-body dark:text-bodydark">
                        {item.vendor_code || "-"}
                      </td>
                      <td className="py-2 px-3 text-center text-body dark:text-bodydark">
                        {item.initial}
                      </td>
                      <td className="py-2 px-3 text-center text-success font-semibold">
                        {item.in > 0 ? `+${item.in}` : "-"}
                      </td>
                      <td className="py-2 px-3 text-center text-warning font-semibold">
                        {item.out > 0 ? `-${item.out}` : "-"}
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-bold text-primary">
                        {item.balance}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPart(item.id_part);
                            setInputActual(item.actual !== undefined ? String(item.actual) : "");
                            setModalActual(true);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-stroke px-2 py-0.5 font-bold hover:border-primary hover:text-primary transition-colors dark:border-strokedark"
                        >
                          <span>{item.actual}</span>
                          <HiOutlinePencilSquare className="text-xs text-primary" />
                        </button>
                      </td>
                      <td className="py-2 px-3 text-center font-bold">
                        <span
                          className={`${
                            diff === 0
                              ? "text-success"
                              : diff > 0
                              ? "text-primary"
                              : "text-danger"
                          }`}
                        >
                          {diff > 0 ? `+${diff}` : diff}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center text-[11px] text-body dark:text-bodydark">
                        {item.checked_by ? (
                          <span className="inline-flex items-center gap-1 text-success">
                            <HiOutlineCheckCircle />
                            <span>{item.checked_by}</span>
                          </span>
                        ) : (
                          <span className="text-body opacity-50">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Input Actual Stock */}
      <CustomModal
        isVisible={modalActual}
        isSmallWidth="sm"
        onClose={() => setModalActual(false)}
      >
        <div className="space-y-4">
          <div>
            <h4 className="text-base font-bold text-black dark:text-white">
              Hitungan Fisik Aktual Gudang
            </h4>
            <p className="text-xs text-body dark:text-bodydark">
              Masukkan jumlah fisik hasil penghitungan di rak/lokasi penyimpanan.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-black dark:text-white mb-1">
              Jumlah Fisik (Actual Qty)
            </label>
            <CommonInput
              type="number"
              placeholder="0"
              input={inputActual}
              onInputChange={(val) => setInputActual(val)}
              onKeyChange={(e) => {
                if (e.key === "Enter") saveActualQuantity();
              }}
            />
          </div>

          <CommonButtonFull
            label="Simpan Hasil Cek Fisik"
            disabled={savingActual}
            onload={savingActual}
            onClick={saveActualQuantity}
          />
        </div>
      </CustomModal>
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
                Stock Opname #{idRegister}
              </h1>
              <div className="w-9" />
            </div>

            <div className="p-4">{renderContent}</div>
          </div>
        ) : (
          /* Desktop View */
          <DefaultLayout>
            <div className="mx-auto max-w-7xl space-y-6">
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
                    Audit Stock Opname Barang Gudang
                  </h1>
                  <p className="text-xs text-body dark:text-bodydark">
                    Formulir entri hasil pencocokan fisik barang dan verifikasi saldo sistem
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
