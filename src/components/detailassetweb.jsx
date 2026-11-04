"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import UserAuth from "./auth";
import DefaultLayout from "./Layouts/DefaultLayout";
import { PageCard, PageCardLimited } from "@/components/card";
import { CommonInput } from "@/components/input";
import { PageLoader } from "./loader";
import { CustomModal } from "./modal";
import { IMAGE_ASSET, IMAGE_USER } from "@/utils/constant";
import paginateData from "@/utils/pagination";
import { formatDate, formatDateLocal, formatDateTime1 } from "@/utils/dateformat";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { Tooltip as ReactTooltip } from "react-tooltip";

// Icons
import {
  HiOutlineSearch,
  HiOutlineUser,
  HiOutlineClock,
  HiPlus,
  HiMinus,
  HiArrowRight,
  HiArrowLeft,
  HiSparkles,
} from "react-icons/hi";
import { FaPlus, FaCheckSquare } from "react-icons/fa";
import { MdCheckBox, MdCheckBoxOutlineBlank } from "react-icons/md";
import { RepairStatus } from "@/utils/repairstatus";

export default function DetailAssetWeb({ idAsset }) {
  const router = useRouter();

  const [dataAsset, setDataAsset] = useState({});
  const [dataService, setDataService] = useState([]);
  const [loader, setLoader] = useState(true);

  const [keyword, setKeyword] = useState("");
  const [selectedCase, setSelectedCase] = useState(null);

  const [itemPerPage, setItemPerPage] = useState(10);
  const [filteredDataService, setFilteredDataService] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(0);

  const [modalStocks, setModalStocks] = useState(false);
  const [listStock, setListStock] = useState([]);
  const [filteredStock, setFilteredStock] = useState([]);
  const [keywordStock, setKeywordStock] = useState("");
  const [enabledAddButton, setEnabledAddButton] = useState([]);

  const [selectedChecklist, setSelectedChecklist] = useState([]);
  const [openImage, setOpenImage] = useState(false);
  const [openImageUser, setOpenImageUser] = useState(false);
  const [partList, setPartList] = useState([]);
  const [transactionStock, setTransactionStock] = useState([]);
  const [userLevel, setUserLevel] = useState("");

  const fetch_data = async () => {
    try {
      const response = await axios.post("/api/fetchassetdetail", {
        idAsset: idAsset,
      });
      if (response.status === 200 && response.data?.detail?.length > 0) {
        setDataAsset(response.data.detail[0]);
      }
    } catch (e) {
      console.error("fetch_data error:", e);
    } finally {
      setLoader(false);
    }
  };

  const fetch_data_service = async () => {
    try {
      const response = await axios.post("/api/fetchassetservice", {
        idAsset: idAsset,
        keyword: keyword,
      });
      if (response.status === 200) {
        setDataService(response.data.service || []);
      }
    } catch (e) {
      console.error("fetch_data_service error:", e);
    }
  };

  const fetch_detail_service = async (id) => {
    try {
      const response = await axios.post("/api/fetchdetailservice", {
        idRequest: id,
      });
      if (response.status === 200) {
        setPartList(response.data.parts || []);
      }
    } catch (e) {
      console.error("fetch_detail_service error:", e);
    }
  };

  const fetch_stock = async () => {
    try {
      const response = await axios.post("/api/stocklist");
      const data = response.data.response || [];
      setListStock(data);
      setFilteredStock(data);
      setEnabledAddButton(data.map((item) => item.id_part));
    } catch (e) {
      console.error("fetch_stock error:", e);
    }
  };

  useEffect(() => {
    fetch_data();
  }, [idAsset]);

  useEffect(() => {
    if (dataAsset?.ID_Asset) {
      fetch_data_service();
    }
  }, [dataAsset]);

  useEffect(() => {
    if (modalStocks) {
      fetch_stock();
    }
  }, [modalStocks]);

  useEffect(() => {
    const filterService = dataService.filter((item) =>
      (item.Problem || "").toLowerCase().includes(keyword.toLowerCase()) ||
      (item.ID_Request || "").toLowerCase().includes(keyword.toLowerCase()) ||
      (item.Requestor || "").toLowerCase().includes(keyword.toLowerCase())
    );

    const { data, pageCurrent, pageLast } = paginateData(
      filterService,
      currentPage,
      itemPerPage
    );
    setFilteredDataService(data);
    setLastPage(pageLast);
  }, [keyword, dataService, currentPage, itemPerPage]);

  useEffect(() => {
    if (keywordStock.trim() === "") {
      setFilteredStock(listStock);
    } else {
      setFilteredStock(
        listStock.filter((item) =>
          (item.description || "").toLowerCase().includes(keywordStock.toLowerCase()) ||
          (item.id_part || "").toLowerCase().includes(keywordStock.toLowerCase())
        )
      );
    }
  }, [keywordStock, listStock]);

  useEffect(() => {
    const user = localStorage.getItem("info");
    if (user) {
      try {
        const parseUser = JSON.parse(user);
        setUserLevel(parseUser[0]?.Level || "");
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  return (
    <UserAuth>
      {loader ? (
        <PageLoader />
      ) : (
        <DefaultLayout>
          <div className="mx-auto max-w-7xl space-y-6">
            {/* Header / Breadcrumb */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/asset")}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-stroke bg-white text-black hover:bg-gray-50 dark:border-strokedark dark:bg-boxdark dark:text-white dark:hover:bg-meta-4/30 transition-all shadow-sm"
                >
                  <HiArrowLeft className="text-xl" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary">
                      {dataAsset.ID_Asset}
                    </span>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                      {dataAsset.Type}
                    </span>
                  </div>
                  <h1 className="text-xl font-bold text-black dark:text-white">
                    {dataAsset.Description || "Detail Aset"}
                  </h1>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    dataAsset.Available === 1 && dataAsset.Reserve === 1
                      ? "bg-warning/15 text-warning"
                      : dataAsset.Available === 0 && dataAsset.Reserve === 1
                      ? "bg-danger/15 text-danger"
                      : "bg-success/15 text-success"
                  }`}
                >
                  {dataAsset.Available === 1 && dataAsset.Reserve === 1
                    ? "Reserved for service"
                    : dataAsset.Available === 0 && dataAsset.Reserve === 1
                    ? "Dalam Pengerjaan"
                    : "Siap Operasi (Ready)"}
                </span>
              </div>
            </div>

            {/* Asset Identity Card */}
            <PageCard>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Information Specs */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="border-b border-stroke pb-3 dark:border-strokedark">
                    <h2 className="text-base font-bold text-black dark:text-white">
                      Informasi Spesifikasi Aset
                    </h2>
                    <p className="text-xs text-body dark:text-bodydark">
                      Data identitas dan riwayat pendaftaran unit dalam sistem
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="rounded-xl bg-gray-50 p-3 dark:bg-meta-4/20">
                      <span className="block text-[10px] text-body dark:text-bodydark">Kode Aset</span>
                      <span className="font-mono font-bold text-black dark:text-white">
                        {dataAsset.ID_Asset}
                      </span>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-3 dark:bg-meta-4/20">
                      <span className="block text-[10px] text-body dark:text-bodydark">Deskripsi</span>
                      <span className="font-semibold text-black dark:text-white truncate block">
                        {dataAsset.Description}
                      </span>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-3 dark:bg-meta-4/20">
                      <span className="block text-[10px] text-body dark:text-bodydark">Manufaktur / Brand</span>
                      <span className="font-semibold text-black dark:text-white">
                        {dataAsset.Manufacture || "-"}
                      </span>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-3 dark:bg-meta-4/20">
                      <span className="block text-[10px] text-body dark:text-bodydark">Model / Seri</span>
                      <span className="font-semibold text-black dark:text-white">
                        {dataAsset.Model || "-"}
                      </span>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-3 dark:bg-meta-4/20">
                      <span className="block text-[10px] text-body dark:text-bodydark">Penanggung Jawab</span>
                      <span className="font-semibold text-black dark:text-white">
                        {dataAsset.User || "-"}
                      </span>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-3 dark:bg-meta-4/20">
                      <span className="block text-[10px] text-body dark:text-bodydark">Kategori PM</span>
                      <span className="font-semibold text-black dark:text-white">
                        {dataAsset.PM_Category || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Photos Box */}
                <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-stroke/60 bg-gray-50/50 p-4 dark:border-strokedark/60 dark:bg-meta-4/10">
                  <div className="flex items-center gap-6">
                    {/* Asset Image */}
                    <div className="flex flex-col items-center gap-1.5">
                      <div
                        onClick={() => {
                          if (dataAsset.Image) setOpenImage(true);
                        }}
                        className={`group relative h-24 w-24 overflow-hidden rounded-2xl border-2 border-white shadow-md dark:border-strokedark ${
                          dataAsset.Image ? "cursor-pointer" : ""
                        }`}
                      >
                        {dataAsset.Image ? (
                          <img
                            alt="Asset"
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                            src={`${IMAGE_ASSET}/${dataAsset.Image}`}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gray-200 dark:bg-meta-4 text-body dark:text-bodydark">
                            <HiSparkles className="text-xl opacity-40" />
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] font-medium text-body dark:text-bodydark">
                        Foto Aset
                      </span>
                    </div>

                    {/* User Profile Image */}
                    <div className="flex flex-col items-center gap-1.5">
                      <div
                        onClick={() => {
                          if (dataAsset.Profile_Image) setOpenImageUser(true);
                        }}
                        className={`group relative h-24 w-24 overflow-hidden rounded-full border-2 border-white shadow-md dark:border-strokedark ${
                          dataAsset.Profile_Image ? "cursor-pointer" : ""
                        }`}
                      >
                        {dataAsset.Profile_Image ? (
                          <img
                            alt="User"
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                            src={`${IMAGE_USER}/${dataAsset.Profile_Image}`}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gray-200 dark:bg-meta-4 text-body dark:text-bodydark">
                            <HiOutlineUser className="text-2xl opacity-40" />
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] font-medium text-body dark:text-bodydark">
                        Foto Pemegang
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-body dark:text-bodydark text-center">
                    Klik gambar untuk memperbesar pratinjau foto resolusi penuh.
                  </span>
                </div>
              </div>
            </PageCard>

            {/* Lightbox Modals */}
            {dataAsset.Image && (
              <Lightbox
                open={openImage}
                close={() => setOpenImage(false)}
                slides={[{ src: `${IMAGE_ASSET}/${dataAsset.Image}` }]}
              />
            )}
            {dataAsset.Profile_Image && (
              <Lightbox
                open={openImageUser}
                close={() => setOpenImageUser(false)}
                slides={[{ src: `${IMAGE_USER}/${dataAsset.Profile_Image}` }]}
              />
            )}

            {/* Service History Table Card */}
            <PageCardLimited>
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stroke pb-4 dark:border-strokedark">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-black dark:text-white">
                        Kartu Riwayat Perawatan & Perbaikan
                      </h3>
                      <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-primary">
                        F.BFNM.026/0
                      </span>
                    </div>
                    <p className="text-xs text-body dark:text-bodydark">
                      Daftar seluruh tiket permintaan perbaikan (CM) dan perawatan rutin (PM)
                    </p>
                  </div>

                  {/* Search Bar */}
                  <div className="w-full sm:w-72">
                    <CommonInput
                      input={keyword}
                      type="text"
                      onInputChange={(val) => setKeyword(val)}
                      placeholder="Cari tiket, kendala, atau pemohon..."
                    >
                      <HiOutlineSearch className="text-body dark:text-bodydark" />
                    </CommonInput>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full table-auto text-left text-xs">
                    <thead>
                      <tr className="border-b border-stroke bg-gray-50 text-body dark:border-strokedark dark:bg-meta-4/20 dark:text-bodydark">
                        <th className="py-3 px-4 font-semibold">ID Request</th>
                        <th className="py-3 px-4 font-semibold">Tanggal</th>
                        <th className="py-3 px-4 font-semibold">Pemohon</th>
                        <th className="py-3 px-4 font-semibold">Kendala / Uraian</th>
                        <th className="py-3 px-4 font-semibold">Tipe</th>
                        <th className="py-3 px-4 font-semibold text-center">Status</th>
                        <th className="py-3 px-4 font-semibold text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stroke dark:divide-strokedark">
                      {filteredDataService.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-body dark:text-bodydark">
                            Tidak ada riwayat perbaikan yang sesuai kriteria.
                          </td>
                        </tr>
                      ) : (
                        filteredDataService.map((item, index) => {
                          const cardStatus = RepairStatus(item.Step);
                          const isSelected = selectedCase?.ID_Request === item.ID_Request;
                          return (
                            <tr
                              key={index}
                              onClick={() => {
                                setSelectedCase(item);
                                if (item.Maintenance_Type === "PM" && item.new_checklist) {
                                  try {
                                    const parsed = typeof item.new_checklist === "string"
                                      ? JSON.parse(item.new_checklist)
                                      : item.new_checklist;
                                    setSelectedChecklist(parsed);
                                  } catch (err) {
                                    setSelectedChecklist([]);
                                  }
                                } else {
                                  setSelectedChecklist([]);
                                }
                                fetch_detail_service(item.ID_Request);
                              }}
                              className={`cursor-pointer transition-colors ${
                                isSelected
                                  ? "bg-primary/5 dark:bg-primary/10"
                                  : "hover:bg-gray-50 dark:hover:bg-meta-4/10"
                              }`}
                            >
                              <td className="py-3 px-4 font-mono font-bold text-black dark:text-white">
                                {item.ID_Request}
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap text-body dark:text-bodydark">
                                {formatDate(item.Time_Request)}
                              </td>
                              <td className="py-3 px-4 font-medium text-black dark:text-white">
                                {item.Requestor}
                              </td>
                              <td className="py-3 px-4 text-body dark:text-bodydark max-w-xs truncate">
                                {item.Problem}
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                    item.Maintenance_Type === "PM"
                                      ? "bg-meta-3/15 text-meta-3"
                                      : "bg-danger/15 text-danger"
                                  }`}
                                >
                                  {item.Maintenance_Type === "PM" ? "PM Rutin" : "Perbaikan"}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span
                                  className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white ${
                                    cardStatus.color || "bg-primary"
                                  }`}
                                >
                                  {cardStatus.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                {parseInt(userLevel) <= 2 &&
                                  parseInt(item.Step) >= 3 &&
                                  parseInt(item.Step) <= 5 && (
                                    <button
                                      type="button"
                                      title="Tambah Suku Cadang (Part Out)"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        localStorage.setItem("data_asset", JSON.stringify(dataAsset));
                                        localStorage.setItem("id_service", item.ID_Request);
                                        router.push("/partsout");
                                      }}
                                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
                                    >
                                      <FaPlus className="text-xs" />
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

                {/* Pagination Controls */}
                {lastPage > 1 && (
                  <div className="flex items-center justify-between border-t border-stroke pt-4 dark:border-strokedark">
                    <span className="text-xs text-body dark:text-bodydark">
                      Halaman {currentPage} dari {lastPage}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={currentPage <= 1}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        className="rounded-lg border border-stroke px-3 py-1.5 text-xs font-semibold text-black hover:bg-gray-50 disabled:opacity-40 dark:border-strokedark dark:text-white dark:hover:bg-meta-4/20"
                      >
                        Sebelumnya
                      </button>
                      <button
                        type="button"
                        disabled={currentPage >= lastPage}
                        onClick={() => setCurrentPage((p) => Math.min(lastPage, p + 1))}
                        className="rounded-lg border border-stroke px-3 py-1.5 text-xs font-semibold text-black hover:bg-gray-50 disabled:opacity-40 dark:border-strokedark dark:text-white dark:hover:bg-meta-4/20"
                      >
                        Berikutnya
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </PageCardLimited>

            {/* Selected Case Document Preview (F.BFNM.025/0) */}
            {selectedCase && (
              <PageCard>
                <div className="space-y-6">
                  {/* Document Header */}
                  <div className="flex items-start justify-between border-b border-stroke pb-4 dark:border-strokedark">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-primary">
                        PT Balifoam Nusamegah
                      </span>
                      <h3 className="text-lg font-bold text-black dark:text-white">
                        Surat Permohonan Perbaikan / Perawatan
                      </h3>
                      <span className="text-xs text-body dark:text-bodydark">
                        Formulir Registrasi: #{selectedCase.ID_Request}
                      </span>
                    </div>
                    <span className="rounded-lg border border-stroke px-2.5 py-1 font-mono text-xs font-semibold dark:border-strokedark text-black dark:text-white">
                      F.BFNM.025/0
                    </span>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    <div className="space-y-2 rounded-xl bg-gray-50 p-4 dark:bg-meta-4/20">
                      <div className="flex justify-between">
                        <span className="text-body dark:text-bodydark">ID Asset:</span>
                        <span className="font-mono font-bold text-black dark:text-white">{dataAsset.ID_Asset}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-body dark:text-bodydark">Deskripsi:</span>
                        <span className="font-semibold text-black dark:text-white">{dataAsset.Description}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-body dark:text-bodydark">Model / Seri:</span>
                        <span className="font-semibold text-black dark:text-white">{dataAsset.Manufacture}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-body dark:text-bodydark">Pemegang Unit:</span>
                        <span className="font-semibold text-black dark:text-white">{dataAsset.User}</span>
                      </div>
                    </div>

                    <div className="space-y-2 rounded-xl bg-gray-50 p-4 dark:bg-meta-4/20">
                      <div className="flex justify-between">
                        <span className="text-body dark:text-bodydark">No. Registrasi:</span>
                        <span className="font-mono font-bold text-black dark:text-white">{selectedCase.ID_Request}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-body dark:text-bodydark">Tanggal Pengajuan:</span>
                        <span className="font-semibold text-black dark:text-white">{formatDateLocal(selectedCase.Time_Request)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-body dark:text-bodydark">Pemohon (Requestor):</span>
                        <span className="font-semibold text-black dark:text-white">{selectedCase.Requestor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-body dark:text-bodydark">Status Pengerjaan:</span>
                        <span className="font-bold text-primary">{RepairStatus(selectedCase.Step)?.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Problem & Solution Blocks */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-stroke p-4 dark:border-strokedark bg-white dark:bg-boxdark">
                      <span className="block text-xs font-bold uppercase tracking-wider text-black dark:text-white mb-2">
                        Keluhan / Gejala Kerusakan
                      </span>
                      <p className="text-xs text-body dark:text-bodydark whitespace-pre-wrap leading-relaxed">
                        {selectedCase.Problem || "-"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-stroke p-4 dark:border-strokedark bg-white dark:bg-boxdark">
                      <span className="block text-xs font-bold uppercase tracking-wider text-black dark:text-white mb-2">
                        Tindakan Perbaikan / Solusi
                      </span>
                      <p className="text-xs text-body dark:text-bodydark whitespace-pre-wrap leading-relaxed">
                        {selectedCase.Solution || "Belum ada catatan solusi."}
                      </p>
                    </div>
                  </div>

                  {/* Signatures Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-stroke dark:border-strokedark text-center text-xs">
                    <div className="rounded-xl bg-gray-50 dark:bg-meta-4/20 p-4">
                      <span className="block text-[11px] text-body dark:text-bodydark mb-8">Teknisi Pelaksana</span>
                      <span className="block font-bold text-black dark:text-white">{selectedCase.Technician || "-"}</span>
                      <span className="text-[10px] text-body dark:text-bodydark">
                        {selectedCase.Time_Response ? formatDateTime1(selectedCase.Time_Response) : ""}
                      </span>
                    </div>

                    <div className="rounded-xl bg-gray-50 dark:bg-meta-4/20 p-4">
                      <span className="block text-[11px] text-body dark:text-bodydark mb-8">SPV Teknisi (Pemeriksa)</span>
                      <span className="block font-bold text-black dark:text-white">{selectedCase.Tech_SPV_Name || "-"}</span>
                      <span className="text-[10px] text-body dark:text-bodydark">
                        {selectedCase.Tech_SPV ? formatDateTime1(selectedCase.Tech_SPV) : ""}
                      </span>
                    </div>

                    <div className="rounded-xl bg-gray-50 dark:bg-meta-4/20 p-4">
                      <span className="block text-[11px] text-body dark:text-bodydark mb-8">Mengetahui (Penerima)</span>
                      <span className="block font-bold text-black dark:text-white">
                        {selectedCase.Prod_SPV_Name || (String(selectedCase.Step) === "7" ? selectedCase.Requestor : "-")}
                      </span>
                      <span className="text-[10px] text-body dark:text-bodydark">
                        {selectedCase.Prod_SPV ? formatDateTime1(selectedCase.Prod_SPV) : ""}
                      </span>
                    </div>
                  </div>

                  {/* Spare Parts List */}
                  {partList.length > 0 && (
                    <div className="rounded-xl border border-stroke p-4 dark:border-strokedark">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white mb-3">
                        Suku Cadang & Jasa Terpakai
                      </h4>
                      <div className="divide-y divide-stroke dark:divide-strokedark">
                        {partList.map((item, index) => (
                          <div
                            key={index}
                            onClick={() => {
                              if (item.dpm?.includes("SO")) {
                                router.push(`/parts/${item.id_part}`);
                              } else if (item.id_register) {
                                router.push(`/partsorder/${item.id_register}`);
                              }
                            }}
                            className="cursor-pointer py-2 flex items-center justify-between text-xs hover:bg-gray-50 dark:hover:bg-meta-4/20 px-2 rounded-lg transition-colors"
                          >
                            <div>
                              <span className="font-semibold text-black dark:text-white block">
                                {item.description}
                              </span>
                              <span className="text-[10px] text-body dark:text-bodydark">
                                Ref: {item.dpm}
                              </span>
                            </div>
                            <span className="rounded-md bg-primary/10 px-2.5 py-1 font-mono font-bold text-primary">
                              {item.quantity} pcs
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Checklist if PM */}
                  {selectedChecklist.length > 0 && (
                    <div className="rounded-xl border border-stroke p-4 dark:border-strokedark">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white mb-3">
                        Daftar Checklist Pemeliharaan
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {selectedChecklist.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-meta-4/20"
                          >
                            <span className="text-black dark:text-white pr-2">
                              {item.description}
                            </span>
                            <div className="shrink-0">
                              {item.widget === "C" ? (
                                item.checked ? (
                                  <FaCheckSquare className="text-success text-base" />
                                ) : (
                                  <MdCheckBoxOutlineBlank className="text-body dark:text-bodydark text-base opacity-40" />
                                )
                              ) : (
                                <span className="font-mono text-primary font-bold">{item.value || "-"}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </PageCard>
            )}
          </div>
        </DefaultLayout>
      )}
    </UserAuth>
  );
}
