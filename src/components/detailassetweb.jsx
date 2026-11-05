"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Webcam from "react-webcam";
import UserAuth from "./auth";
import DefaultLayout from "./Layouts/DefaultLayout";
import { PageCard, PageCardLimited } from "@/components/card";
import { CommonInput } from "@/components/input";
import { PageLoader } from "./loader";
import { CustomModal } from "./modal";
import { IMAGE_ASSET, IMAGE_USER } from "@/utils/constant";
import paginateData from "@/utils/pagination";
import {
  formatDate,
  formatDateLocal,
  formatDateTime1,
} from "@/utils/dateformat";
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
import {
  HiOutlineWrenchScrewdriver,
  HiOutlineCube,
  HiOutlineCalendar,
  HiOutlineArrowTrendingUp,
  HiOutlineCheckCircle,
  HiOutlineChartBar,
  HiOutlinePencilSquare,
  HiOutlineCamera,
  HiOutlinePhoto,
  HiOutlineArrowPath,
  HiOutlineXMark,
} from "react-icons/hi2";
import { FaPlus, FaCheckSquare } from "react-icons/fa";
import { MdCheckBox, MdCheckBoxOutlineBlank } from "react-icons/md";
import { BsBoxSeam, BsGearWideConnected } from "react-icons/bs";
import { RepairStatus } from "@/utils/repairstatus";
import { NotifySuccess, NotifyError } from "@/utils/notify";
import AssetMaintenanceCostChart from "@/components/Charts/AssetMaintenanceCostChart";

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
  const [servisList, setServisList] = useState([]);
  const [transactionStock, setTransactionStock] = useState([]);
  const [userLevel, setUserLevel] = useState("");

  const [partsUsage, setPartsUsage] = useState({
    monthly_breakdown: [],
    routine_needs: [],
    summary: {},
  });
  const [loadingPartsUsage, setLoadingPartsUsage] = useState(true);
  const [selectedUsageMonth, setSelectedUsageMonth] = useState("ALL");
  const [routinePage, setRoutinePage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);

  // Edit Asset States
  const [openEditAssetModalState, setOpenEditAssetModalState] = useState(false);
  const [savingAsset, setSavingAsset] = useState(false);
  const [editDesc, setEditDesc] = useState("");
  const [editManufacture, setEditManufacture] = useState("");
  const [editModel, setEditModel] = useState("");
  const [editNo, setEditNo] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editUser, setEditUser] = useState("");
  const [editPMCategory, setEditPMCategory] = useState("");
  const [editCapacity, setEditCapacity] = useState("");
  const [editPower, setEditPower] = useState("");
  const [editVoltage, setEditVoltage] = useState("");
  const [editSerial, setEditSerial] = useState("");
  const [editYear, setEditYear] = useState("");

  // Foto Aset
  const [editImage, setEditImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Foto User / Pemegang
  const [editUserImage, setEditUserImage] = useState(null);
  const [userImagePreview, setUserImagePreview] = useState(null);

  // Camera States
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraTarget, setCameraTarget] = useState("asset"); // "asset" | "user"
  const [cameraFacing, setCameraFacing] = useState("environment");
  const webcamRef = useRef(null);

  const openEditAssetModal = () => {
    setEditDesc(dataAsset.Description || "");
    setEditManufacture(dataAsset.Manufacture || "");
    setEditModel(dataAsset.Model || "");
    setEditNo(dataAsset.No || "");
    setEditLocation(dataAsset.Location || "");
    setEditUser(dataAsset.User || "");
    setEditPMCategory(dataAsset.PM_Category || "");
    setEditCapacity(dataAsset.Capacity || "");
    setEditPower(dataAsset.Power || "");
    setEditVoltage(dataAsset.Voltage || "");
    setEditSerial(dataAsset.Serial_Number || "");
    setEditYear(dataAsset.Year_Manufacture || "");

    setEditImage(null);
    setImagePreview(dataAsset.Image ? `${IMAGE_ASSET}/${dataAsset.Image}` : null);

    setEditUserImage(null);
    setUserImagePreview(dataAsset.Profile_Image ? `${IMAGE_USER}/${dataAsset.Profile_Image}` : null);

    setIsCameraActive(false);
    setOpenEditAssetModalState(true);
  };

  const handleStartCamera = (target) => {
    setCameraTarget(target);
    setCameraFacing(target === "user" ? "user" : "environment");
    setIsCameraActive(true);
  };

  const handleCapturePhoto = () => {
    if (webcamRef.current) {
      const screenshot = webcamRef.current.getScreenshot();
      if (screenshot) {
        if (cameraTarget === "asset") {
          setEditImage(screenshot);
          setImagePreview(screenshot);
          NotifySuccess("Foto aset berhasil diambil dari kamera");
        } else {
          setEditUserImage(screenshot);
          setUserImagePreview(screenshot);
          NotifySuccess("Foto pemegang berhasil diambil dari kamera");
        }
        setIsCameraActive(false);
      } else {
        NotifyError("Gagal mengambil foto. Pastikan kamera diizinkan.");
      }
    }
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        NotifyError("Ukuran gambar maksimal 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImage(reader.result);
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUserImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        NotifyError("Ukuran gambar maksimal 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditUserImage(reader.result);
        setUserImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAsset = async () => {
    if (!editDesc.trim()) {
      NotifyError("Deskripsi aset wajib diisi");
      return;
    }

    setSavingAsset(true);
    try {
      const res = await axios.post("/api/updateasset", {
        idAsset: dataAsset.ID_Asset,
        Description: editDesc,
        Manufacture: editManufacture,
        Model: editModel,
        No: editNo,
        Location: editLocation,
        User: editUser,
        PM_Category: editPMCategory,
        Capacity: editCapacity,
        Power: editPower,
        Voltage: editVoltage,
        Serial_Number: editSerial,
        Year_Manufacture: editYear,
        image: editImage,
        user_image: editUserImage,
      });

      if (res.status === 200) {
        NotifySuccess("Data aset & foto berhasil diperbarui");
        setOpenEditAssetModalState(false);
        fetch_data();
      }
    } catch (err) {
      console.error(err);
      NotifyError("Gagal memperbarui data aset");
    } finally {
      setSavingAsset(false);
    }
  };

  const fetch_parts_usage = async () => {
    try {
      setLoadingPartsUsage(true);
      const response = await axios.post("/api/assetpartsusage", {
        idAsset: idAsset,
      });
      if (response.status === 200) {
        setPartsUsage(response.data);
      }
    } catch (e) {
      console.error("fetch_parts_usage error:", e);
    } finally {
      setLoadingPartsUsage(false);
    }
  };

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
        const services = response.data.service || [];
        setDataService(services);
        if (services.length > 0 && !selectedCase) {
          const first = services[0];
          setSelectedCase(first);
          if (first.Maintenance_Type === "PM" && first.new_checklist) {
            try {
              const parsed =
                typeof first.new_checklist === "string"
                  ? JSON.parse(first.new_checklist)
                  : first.new_checklist;
              setSelectedChecklist(parsed);
            } catch {
              setSelectedChecklist([]);
            }
          }
          fetch_detail_service(first.ID_Request);
        }
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
        setServisList(response.data.servis || []);
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
      fetch_parts_usage();
    }
  }, [dataAsset]);

  useEffect(() => {
    if (modalStocks) {
      fetch_stock();
    }
  }, [modalStocks]);

  useEffect(() => {
    const filterService = dataService.filter(
      (item) =>
        (item.Problem || "").toLowerCase().includes(keyword.toLowerCase()) ||
        (item.ID_Request || "").toLowerCase().includes(keyword.toLowerCase()) ||
        (item.Requestor || "").toLowerCase().includes(keyword.toLowerCase()),
    );

    const { data, pageCurrent, pageLast } = paginateData(
      filterService,
      currentPage,
      itemPerPage,
    );
    setFilteredDataService(data);
    setLastPage(pageLast);
  }, [keyword, dataService, currentPage, itemPerPage]);

  useEffect(() => {
    if (keywordStock.trim() === "") {
      setFilteredStock(listStock);
    } else {
      setFilteredStock(
        listStock.filter(
          (item) =>
            (item.description || "")
              .toLowerCase()
              .includes(keywordStock.toLowerCase()) ||
            (item.id_part || "")
              .toLowerCase()
              .includes(keywordStock.toLowerCase()),
        ),
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

  // Pagination & Filter calculations for Parts Usage
  const routineItems = partsUsage.routine_needs || [];
  const routineTotalPages = Math.max(1, Math.ceil(routineItems.length / 10));
  const displayedRoutineItems = routineItems.slice(
    (routinePage - 1) * 10,
    routinePage * 10,
  );

  const allHistoryItems = (partsUsage.monthly_breakdown || []).flatMap((m) =>
    (m.parts || []).map((p) => ({ ...p, month_label: m.month_label })),
  );

  const currentFilteredHistory =
    selectedUsageMonth === "ALL"
      ? allHistoryItems
      : (
          partsUsage.monthly_breakdown?.find(
            (m) => m.month_key === selectedUsageMonth,
          )?.parts || []
        ).map((p) => ({
          ...p,
          month_label: partsUsage.monthly_breakdown?.find(
            (m) => m.month_key === selectedUsageMonth,
          )?.month_label,
        }));

  const historyTotalPages = Math.max(
    1,
    Math.ceil(currentFilteredHistory.length / 10),
  );
  const displayedHistoryItems = currentFilteredHistory.slice(
    (historyPage - 1) * 10,
    historyPage * 10,
  );

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
                  className="hover:bg-gray-50 flex h-10 w-10 items-center justify-center rounded-xl border border-stroke bg-white text-black shadow-sm transition-all dark:border-strokedark dark:bg-boxdark dark:text-white dark:hover:bg-meta-4/30"
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
                <div className="space-y-4 lg:col-span-2">
                  <div className="flex items-center justify-between border-b border-stroke pb-3 dark:border-strokedark">
                    <div>
                      <h2 className="text-base font-bold text-black dark:text-white">
                        Informasi Spesifikasi Aset
                      </h2>
                      <p className="text-xs text-body dark:text-bodydark">
                        Data identitas dan riwayat pendaftaran unit dalam sistem
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={openEditAssetModal}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-all shadow-sm"
                    >
                      <HiOutlinePencilSquare className="text-sm" />
                      <span>Edit Data Aset</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="bg-gray-50 rounded-xl p-3 dark:bg-meta-4/20">
                      <span className="block text-[10px] text-body dark:text-bodydark">
                        Kode Aset
                      </span>
                      <span className="font-mono font-bold text-black dark:text-white">
                        {dataAsset.ID_Asset}
                      </span>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-3 dark:bg-meta-4/20">
                      <span className="block text-[10px] text-body dark:text-bodydark">
                        Deskripsi
                      </span>
                      <span className="block truncate font-semibold text-black dark:text-white">
                        {dataAsset.Description}
                      </span>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-3 dark:bg-meta-4/20">
                      <span className="block text-[10px] text-body dark:text-bodydark">
                        Manufaktur / Brand
                      </span>
                      <span className="font-semibold text-black dark:text-white">
                        {dataAsset.Manufacture || "-"}
                      </span>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-3 dark:bg-meta-4/20">
                      <span className="block text-[10px] text-body dark:text-bodydark">
                        Model / Seri
                      </span>
                      <span className="font-semibold text-black dark:text-white">
                        {dataAsset.Model || "-"}
                      </span>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-3 dark:bg-meta-4/20">
                      <span className="block text-[10px] text-body dark:text-bodydark">
                        Penanggung Jawab
                      </span>
                      <span className="font-semibold text-black dark:text-white">
                        {dataAsset.User || "-"}
                      </span>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-3 dark:bg-meta-4/20">
                      <span className="block text-[10px] text-body dark:text-bodydark">
                        Kategori PM
                      </span>
                      <span className="font-semibold text-black dark:text-white">
                        {dataAsset.PM_Category || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Photos Box */}
                <div className="bg-gray-50/50 flex flex-col items-center justify-center gap-4 rounded-xl border border-stroke/60 p-4 dark:border-strokedark/60 dark:bg-meta-4/10">
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
                          <div className="bg-gray-200 flex h-full w-full items-center justify-center text-body dark:bg-meta-4 dark:text-bodydark">
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
                          <div className="bg-gray-200 flex h-full w-full items-center justify-center text-body dark:bg-meta-4 dark:text-bodydark">
                            <HiOutlineUser className="text-2xl opacity-40" />
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] font-medium text-body dark:text-bodydark">
                        Foto Pemegang
                      </span>
                    </div>
                  </div>
                  <span className="text-center text-[10px] text-body dark:text-bodydark">
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

            {/* Modal Edit Data Aset */}
            <CustomModal
              isVisible={openEditAssetModalState}
              isSmallWidth="lg"
              onClose={() => setOpenEditAssetModalState(false)}
            >
              <div className="flex items-center justify-between border-b border-stroke px-5 py-4 dark:border-strokedark">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
                    <HiOutlinePencilSquare className="text-primary text-base" />
                    Edit Data & Foto Aset #{dataAsset.ID_Asset}
                  </h3>
                  <span className="text-xs text-body dark:text-bodydark">
                    Perbarui informasi spesifikasi atau foto unit mesin/kendaraan
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-4 overflow-y-auto max-h-[70vh] text-xs">
                {/* 1. JIKA KAMERA SEDANG AKTIF: TAMPILKAN LIVE WEBCAM VIEWFINDER */}
                {isCameraActive ? (
                  <div className="relative overflow-hidden rounded-2xl border-2 border-primary/60 bg-black shadow-lg p-2 space-y-2">
                    <div className="flex items-center justify-between text-white text-xs px-2 py-1">
                      <span className="font-bold flex items-center gap-1.5">
                        <HiOutlineCamera className="text-primary text-base" />
                        Kamera Aktif: {cameraTarget === "asset" ? "Foto Aset" : "Foto Pemegang / User"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsCameraActive(false)}
                        className="rounded-lg bg-white/20 hover:bg-white/30 px-2 py-1 text-[11px] transition-colors"
                      >
                        Tutup Kamera
                      </button>
                    </div>

                    <div className="relative rounded-xl overflow-hidden bg-black flex items-center justify-center">
                      <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        screenshotQuality={0.88}
                        videoConstraints={{
                          facingMode: cameraFacing,
                          width: { ideal: 1280 },
                          height: { ideal: 720 },
                        }}
                        onUserMediaError={(err) => {
                          console.error("Camera access error:", err);
                          NotifyError("Izin kamera ditolak. Silakan upload via berkas.");
                          setIsCameraActive(false);
                        }}
                        className="w-full h-60 sm:h-72 object-cover"
                      />

                      {/* Framing Guide */}
                      <div className="absolute inset-4 pointer-events-none rounded-xl border border-white/30 border-dashed flex items-center justify-center">
                        <span className="text-[10px] font-medium text-white/80 bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                          {cameraTarget === "asset" ? "Arahkan ke mesin / aset" : "Arahkan ke wajah pengguna"}
                        </span>
                      </div>
                    </div>

                    {/* Camera Action Buttons */}
                    <div className="flex items-center justify-between pt-1 px-1">
                      <button
                        type="button"
                        onClick={() =>
                          setCameraFacing((prev) => (prev === "environment" ? "user" : "environment"))
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold transition-colors"
                      >
                        <HiOutlineArrowPath className="text-sm" />
                        <span>Putar Kamera</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCapturePhoto}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-md transition-all active:scale-95"
                      >
                        <div className="h-3.5 w-3.5 rounded-full border-2 border-white bg-white/30" />
                        <span>Jepret Foto</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* 2. DUA KARTU FOTO: FOTO ASET DAN FOTO PEMEGANG / USER */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Foto Aset */}
                    <div className="rounded-xl border border-stroke p-3.5 dark:border-strokedark bg-gray-50/50 dark:bg-meta-4/10">
                      <span className="block text-[11px] font-bold text-black dark:text-white mb-2">
                        Foto Unit Aset
                      </span>
                      <div className="flex items-center gap-3">
                        <div className="relative h-20 w-20 rounded-xl border border-stroke dark:border-strokedark overflow-hidden bg-white dark:bg-boxdark flex items-center justify-center shrink-0 shadow-sm">
                          {imagePreview ? (
                            <img
                              src={imagePreview}
                              alt="Foto Aset"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <HiOutlinePhoto className="text-2xl text-body opacity-40 dark:text-bodydark" />
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <button
                            type="button"
                            onClick={() => handleStartCamera("asset")}
                            className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors"
                          >
                            <HiOutlineCamera className="text-sm" />
                            <span>Buka Kamera</span>
                          </button>

                          <label className="w-full inline-flex items-center justify-center gap-1.5 cursor-pointer rounded-xl border border-stroke bg-white px-2.5 py-1.5 text-xs font-semibold text-body hover:bg-gray-100 dark:border-strokedark dark:bg-boxdark dark:text-bodydark dark:hover:bg-meta-4 transition-colors">
                            <HiOutlinePhoto className="text-sm" />
                            <span>Pilih Berkas</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageFileChange}
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Foto Pemegang / User Profile */}
                    <div className="rounded-xl border border-stroke p-3.5 dark:border-strokedark bg-gray-50/50 dark:bg-meta-4/10">
                      <span className="block text-[11px] font-bold text-black dark:text-white mb-2">
                        Foto Pemegang / User
                      </span>
                      <div className="flex items-center gap-3">
                        <div className="relative h-20 w-20 rounded-full border border-stroke dark:border-strokedark overflow-hidden bg-white dark:bg-boxdark flex items-center justify-center shrink-0 shadow-sm">
                          {userImagePreview ? (
                            <img
                              src={userImagePreview}
                              alt="Foto User"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <HiOutlineUser className="text-2xl text-body opacity-40 dark:text-bodydark" />
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <button
                            type="button"
                            onClick={() => handleStartCamera("user")}
                            className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-meta-5 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-meta-5/90 transition-colors"
                          >
                            <HiOutlineCamera className="text-sm" />
                            <span>Buka Kamera</span>
                          </button>

                          <label className="w-full inline-flex items-center justify-center gap-1.5 cursor-pointer rounded-xl border border-stroke bg-white px-2.5 py-1.5 text-xs font-semibold text-body hover:bg-gray-100 dark:border-strokedark dark:bg-boxdark dark:text-bodydark dark:hover:bg-meta-4 transition-colors">
                            <HiOutlinePhoto className="text-sm" />
                            <span>Pilih Berkas</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleUserImageFileChange}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Grid Input Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-semibold text-body dark:text-bodydark mb-1">
                      Deskripsi / Nama Aset <span className="text-danger">*</span>
                    </label>
                    <CommonInput
                      input={editDesc}
                      type="text"
                      placeholder="Nama / Deskripsi unit..."
                      onInputChange={(val) => setEditDesc(val)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-body dark:text-bodydark mb-1">
                      Manufaktur / Brand
                    </label>
                    <CommonInput
                      input={editManufacture}
                      type="text"
                      placeholder="Contoh: Mitsubishi, Daikin, dll..."
                      onInputChange={(val) => setEditManufacture(val)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-body dark:text-bodydark mb-1">
                      Model / Seri
                    </label>
                    <CommonInput
                      input={editModel}
                      type="text"
                      placeholder="Nomor model / tipe..."
                      onInputChange={(val) => setEditModel(val)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-body dark:text-bodydark mb-1">
                      No. Polisi / No. Unit
                    </label>
                    <CommonInput
                      input={editNo}
                      type="text"
                      placeholder="Nomor plat atau kode fisik unit..."
                      onInputChange={(val) => setEditNo(val)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-body dark:text-bodydark mb-1">
                      Lokasi / Penempatan
                    </label>
                    <CommonInput
                      input={editLocation}
                      type="text"
                      placeholder="Gedung, lantai, area..."
                      onInputChange={(val) => setEditLocation(val)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-body dark:text-bodydark mb-1">
                      Penanggung Jawab / User
                    </label>
                    <CommonInput
                      input={editUser}
                      type="text"
                      placeholder="Nama pemegang unit..."
                      onInputChange={(val) => setEditUser(val)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-body dark:text-bodydark mb-1">
                      Kategori PM
                    </label>
                    <CommonInput
                      input={editPMCategory}
                      type="text"
                      placeholder="Kategori preventive maintenance..."
                      onInputChange={(val) => setEditPMCategory(val)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-body dark:text-bodydark mb-1">
                      Kapasitas
                    </label>
                    <CommonInput
                      input={editCapacity}
                      type="text"
                      placeholder="Contoh: 5 Ton, 3000 L, dll..."
                      onInputChange={(val) => setEditCapacity(val)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-body dark:text-bodydark mb-1">
                      Daya (Power)
                    </label>
                    <CommonInput
                      input={editPower}
                      type="text"
                      placeholder="Contoh: 15 kW, 20 HP..."
                      onInputChange={(val) => setEditPower(val)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-body dark:text-bodydark mb-1">
                      Tegangan (Voltage)
                    </label>
                    <CommonInput
                      input={editVoltage}
                      type="text"
                      placeholder="Contoh: 380V, 220V..."
                      onInputChange={(val) => setEditVoltage(val)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-body dark:text-bodydark mb-1">
                      Nomor Seri (Serial No)
                    </label>
                    <CommonInput
                      input={editSerial}
                      type="text"
                      placeholder="Nomor seri pabrik..."
                      onInputChange={(val) => setEditSerial(val)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-body dark:text-bodydark mb-1">
                      Tahun Pembuatan
                    </label>
                    <CommonInput
                      input={editYear}
                      type="text"
                      placeholder="Contoh: 2021..."
                      onInputChange={(val) => setEditYear(val)}
                    />
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-2 border-t border-stroke px-5 py-3 dark:border-strokedark bg-gray-50/50 dark:bg-meta-4/20">
                <button
                  type="button"
                  disabled={savingAsset}
                  onClick={() => setOpenEditAssetModalState(false)}
                  className="rounded-xl border border-stroke px-4 py-2 text-xs font-semibold text-body hover:bg-gray-100 dark:border-strokedark dark:text-bodydark dark:hover:bg-meta-4 transition-all"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={savingAsset}
                  onClick={handleSaveAsset}
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-50 transition-all"
                >
                  {savingAsset ? "Menyimpan..." : "Simpan Perubahan Aset"}
                </button>
              </div>
            </CustomModal>

            {/* 1. DATA PERBAIKAN: Kartu Riwayat Perawatan & Perbaikan (F.BFNM.026/0) */}
            <PageCardLimited>
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stroke pb-4 dark:border-strokedark">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-black dark:text-white">
                        Kartu Riwayat Perawatan & Perbaikan
                      </h3>
                      <span className="font-mono rounded bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                        F.BFNM.026/0
                      </span>
                    </div>
                    <p className="text-xs text-body dark:text-bodydark">
                      Daftar seluruh tiket permintaan perbaikan (CM) dan
                      perawatan rutin (PM)
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
                      <tr className="bg-gray-50 border-b border-stroke text-body dark:border-strokedark dark:bg-meta-4/20 dark:text-bodydark">
                        <th className="px-4 py-3 font-semibold">ID Request</th>
                        <th className="px-4 py-3 font-semibold">Tanggal</th>
                        <th className="px-4 py-3 font-semibold">Pemohon</th>
                        <th className="px-4 py-3 font-semibold">
                          Kendala / Uraian
                        </th>
                        <th className="px-4 py-3 font-semibold">Tipe</th>
                        <th className="px-4 py-3 text-center font-semibold">
                          Status
                        </th>
                        <th className="px-4 py-3 text-center font-semibold">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stroke dark:divide-strokedark">
                      {filteredDataService.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="py-8 text-center text-body dark:text-bodydark"
                          >
                            Tidak ada riwayat perbaikan yang sesuai kriteria.
                          </td>
                        </tr>
                      ) : (
                        filteredDataService.map((item, index) => {
                          const cardStatus = RepairStatus(item.Step);
                          const isSelected =
                            selectedCase?.ID_Request === item.ID_Request;
                          return (
                            <tr
                              key={index}
                              onClick={() => {
                                setSelectedCase(item);
                                if (
                                  item.Maintenance_Type === "PM" &&
                                  item.new_checklist
                                ) {
                                  try {
                                    const parsed =
                                      typeof item.new_checklist === "string"
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
                              <td className="font-mono px-4 py-3 font-bold text-black dark:text-white">
                                {item.ID_Request}
                              </td>
                              <td className="whitespace-nowrap px-4 py-3 text-body dark:text-bodydark">
                                {formatDate(item.Time_Request)}
                              </td>
                              <td className="px-4 py-3 font-medium text-black dark:text-white">
                                {item.Requestor}
                              </td>
                              <td className="max-w-xs truncate px-4 py-3 text-body dark:text-bodydark">
                                {item.Problem}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                    item.Maintenance_Type === "PM"
                                      ? "bg-meta-3/15 text-meta-3"
                                      : "bg-danger/15 text-danger"
                                  }`}
                                >
                                  {item.Maintenance_Type === "PM"
                                    ? "PM Rutin"
                                    : "Perbaikan"}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span
                                  className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white ${
                                    cardStatus.color || "bg-primary"
                                  }`}
                                >
                                  {cardStatus.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                {parseInt(userLevel) <= 2 &&
                                  parseInt(item.Step) >= 3 &&
                                  parseInt(item.Step) <= 5 && (
                                    <button
                                      type="button"
                                      title="Tambah Suku Cadang (Part Out)"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        localStorage.setItem(
                                          "data_asset",
                                          JSON.stringify(dataAsset),
                                        );
                                        localStorage.setItem(
                                          "id_service",
                                          item.ID_Request,
                                        );
                                        router.push("/partsout");
                                      }}
                                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-white"
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
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        className="hover:bg-gray-50 rounded-lg border border-stroke px-3 py-1.5 text-xs font-semibold text-black disabled:opacity-40 dark:border-strokedark dark:text-white dark:hover:bg-meta-4/20"
                      >
                        Sebelumnya
                      </button>
                      <button
                        type="button"
                        disabled={currentPage >= lastPage}
                        onClick={() =>
                          setCurrentPage((p) => Math.min(lastPage, p + 1))
                        }
                        className="hover:bg-gray-50 rounded-lg border border-stroke px-3 py-1.5 text-xs font-semibold text-black disabled:opacity-40 dark:border-strokedark dark:text-white dark:hover:bg-meta-4/20"
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
                    <span className="font-mono rounded-lg border border-stroke px-2.5 py-1 text-xs font-semibold text-black dark:border-strokedark dark:text-white">
                      F.BFNM.025/0
                    </span>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-1 gap-6 text-xs md:grid-cols-2">
                    <div className="bg-gray-50 space-y-2 rounded-xl p-4 dark:bg-meta-4/20">
                      <div className="flex justify-between">
                        <span className="text-body dark:text-bodydark">
                          ID Asset:
                        </span>
                        <span className="font-mono font-bold text-black dark:text-white">
                          {dataAsset.ID_Asset}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-body dark:text-bodydark">
                          Deskripsi:
                        </span>
                        <span className="font-semibold text-black dark:text-white">
                          {dataAsset.Description}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-body dark:text-bodydark">
                          Model / Seri:
                        </span>
                        <span className="font-semibold text-black dark:text-white">
                          {dataAsset.Manufacture}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-body dark:text-bodydark">
                          Pemegang Unit:
                        </span>
                        <span className="font-semibold text-black dark:text-white">
                          {dataAsset.User}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 space-y-2 rounded-xl p-4 dark:bg-meta-4/20">
                      <div className="flex justify-between">
                        <span className="text-body dark:text-bodydark">
                          No. Registrasi:
                        </span>
                        <span className="font-mono font-bold text-black dark:text-white">
                          {selectedCase.ID_Request}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-body dark:text-bodydark">
                          Tanggal Pengajuan:
                        </span>
                        <span className="font-semibold text-black dark:text-white">
                          {formatDateLocal(selectedCase.Time_Request)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-body dark:text-bodydark">
                          Pemohon (Requestor):
                        </span>
                        <span className="font-semibold text-black dark:text-white">
                          {selectedCase.Requestor}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-body dark:text-bodydark">
                          Status Pengerjaan:
                        </span>
                        <span className="font-bold text-primary">
                          {RepairStatus(selectedCase.Step)?.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Problem & Solution Blocks */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-stroke bg-white p-4 dark:border-strokedark dark:bg-boxdark">
                      <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                        Keluhan / Gejala Kerusakan
                      </span>
                      <p className="whitespace-pre-wrap text-xs leading-relaxed text-body dark:text-bodydark">
                        {selectedCase.Problem || "-"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-stroke bg-white p-4 dark:border-strokedark dark:bg-boxdark">
                      <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                        Tindakan Perbaikan / Solusi
                      </span>
                      <p className="whitespace-pre-wrap text-xs leading-relaxed text-body dark:text-bodydark">
                        {selectedCase.Solution || "Belum ada catatan solusi."}
                      </p>
                    </div>
                  </div>

                  {/* Signatures Row */}
                  <div className="grid grid-cols-1 gap-4 border-t border-stroke pt-4 text-center text-xs dark:border-strokedark sm:grid-cols-3">
                    <div className="bg-gray-50 rounded-xl p-4 dark:bg-meta-4/20">
                      <span className="mb-8 block text-[11px] text-body dark:text-bodydark">
                        Teknisi Pelaksana
                      </span>
                      <span className="block font-bold text-black dark:text-white">
                        {selectedCase.Technician || "-"}
                      </span>
                      <span className="text-[10px] text-body dark:text-bodydark">
                        {selectedCase.Time_Response
                          ? formatDateTime1(selectedCase.Time_Response)
                          : ""}
                      </span>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 dark:bg-meta-4/20">
                      <span className="mb-8 block text-[11px] text-body dark:text-bodydark">
                        SPV Teknisi (Pemeriksa)
                      </span>
                      <span className="block font-bold text-black dark:text-white">
                        {selectedCase.Tech_SPV_Name || "-"}
                      </span>
                      <span className="text-[10px] text-body dark:text-bodydark">
                        {selectedCase.Tech_SPV
                          ? formatDateTime1(selectedCase.Tech_SPV)
                          : ""}
                      </span>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 dark:bg-meta-4/20">
                      <span className="mb-8 block text-[11px] text-body dark:text-bodydark">
                        Mengetahui (Penerima)
                      </span>
                      <span className="block font-bold text-black dark:text-white">
                        {selectedCase.Prod_SPV_Name ||
                          (String(selectedCase.Step) === "7"
                            ? selectedCase.Requestor
                            : "-")}
                      </span>
                      <span className="text-[10px] text-body dark:text-bodydark">
                        {selectedCase.Prod_SPV
                          ? formatDateTime1(selectedCase.Prod_SPV)
                          : ""}
                      </span>
                    </div>
                  </div>

                  {/* Spare Parts List */}
                  {partList.length > 0 && (
                    <div className="rounded-xl border border-stroke p-4 dark:border-strokedark">
                      <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-black dark:text-white">
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
                            className="hover:bg-gray-50 flex cursor-pointer items-center justify-between rounded-lg px-2 py-2 text-xs transition-colors dark:hover:bg-meta-4/20"
                          >
                            <div>
                              <span className="block font-semibold text-black dark:text-white">
                                {item.description}
                              </span>
                              <span className="text-[10px] text-body dark:text-bodydark">
                                Ref: {item.dpm}
                              </span>
                            </div>
                            <span className="font-mono rounded-md bg-primary/10 px-2.5 py-1 font-bold text-primary">
                              {item.quantity} pcs
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* External Service List */}
                  {servisList.length > 0 && (
                    <div className="rounded-xl border border-stroke p-4 dark:border-strokedark">
                      <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                        Servis / Bengkel Luar Terkait
                      </h4>
                      <div className="divide-y divide-stroke dark:divide-strokedark">
                        {servisList.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-lg px-2 py-2 text-xs"
                          >
                            <div>
                              <span className="block font-semibold text-black dark:text-white">
                                {item.item || item.description || "Jasa Servis"}
                              </span>
                              <span className="text-[10px] text-body dark:text-bodydark">
                                Vendor: {item.supplier || "-"} • Ref: #{item.id_register}
                              </span>
                            </div>
                            <span className="font-mono rounded-md bg-warning/10 px-2.5 py-1 font-bold text-warning">
                              Rp {Number(item.amount || 0).toLocaleString("id-ID")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Checklist if PM */}
                  {selectedChecklist.length > 0 && (
                    <div className="rounded-xl border border-stroke p-4 dark:border-strokedark">
                      <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                        Daftar Checklist Pemeliharaan
                      </h4>
                      <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                        {selectedChecklist.map((item, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 flex items-center justify-between rounded-lg p-2 dark:bg-meta-4/20"
                          >
                            <span className="pr-2 text-black dark:text-white">
                              {item.description}
                            </span>
                            <div className="shrink-0">
                              {item.widget === "C" ? (
                                item.checked ? (
                                  <FaCheckSquare className="text-base text-success" />
                                ) : (
                                  <MdCheckBoxOutlineBlank className="text-base text-body opacity-40 dark:text-bodydark" />
                                )
                              ) : (
                                <span className="font-mono font-bold text-primary">
                                  {item.value || "-"}
                                </span>
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

            {/* 2. PEMAKAIAN SUKU CADANG & PERKIRAAN KEBUTUHAN MESIN */}
            <PageCard>
              <div className="space-y-6">
                {/* Section Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stroke pb-4 dark:border-strokedark">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-meta-5/10 text-meta-5">
                        <HiOutlineWrenchScrewdriver className="text-lg" />
                      </div>
                      <h3 className="text-base font-bold text-black dark:text-white">
                        Pemakaian Suku Cadang & Perkiraan Kebutuhan Mesin
                      </h3>
                    </div>
                    <p className="mt-1 text-xs text-body dark:text-bodydark">
                      Analisis konsumsi suku cadang per bulan dan estimasi
                      kebutuhan komponen rutin untuk mesin ini
                    </p>
                  </div>

                  {/* Quick Summary Badges */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <div className="bg-gray-50 rounded-xl border border-stroke/50 px-3 py-1.5 dark:border-strokedark/50 dark:bg-meta-4/20">
                      <span className="block text-[10px] text-body dark:text-bodydark">
                        Total Biaya Maintenance
                      </span>
                      <span className="font-bold font-mono text-primary">
                        Rp{" "}
                        {Number(
                          partsUsage.summary?.grand_total_cost || 0,
                        ).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-xl border border-stroke/50 px-3 py-1.5 dark:border-strokedark/50 dark:bg-meta-4/20">
                      <span className="block text-[10px] text-body dark:text-bodydark">
                        Total Terpasang
                      </span>
                      <span className="font-bold text-black dark:text-white">
                        {partsUsage.summary?.total_parts_replaced || 0} unit
                        part
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-xl border border-stroke/50 px-3 py-1.5 dark:border-strokedark/50 dark:bg-meta-4/20">
                      <span className="block text-[10px] text-body dark:text-bodydark">
                        Variasi Part
                      </span>
                      <span className="font-bold text-black dark:text-white">
                        {partsUsage.summary?.distinct_parts_count || 0} jenis
                        suku cadang
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sub-section 0: Grafik & Analisis Biaya Pemeliharaan Mesin */}
                <div className="rounded-2xl border border-stroke bg-white p-4 dark:border-strokedark dark:bg-boxdark/60">
                  <div className="mb-3 flex items-center justify-between border-b border-stroke pb-3 dark:border-strokedark">
                    <div>
                      <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                        <HiOutlineArrowTrendingUp className="text-sm text-primary" />
                        Tren Biaya Pemeliharaan Mesin per Bulan
                      </h4>
                      <span className="text-[11px] text-body dark:text-bodydark">
                        Statistik pengeluaran biaya suku cadang dan jasa perbaikan mesin ini dari bulan ke bulan
                      </span>
                    </div>
                  </div>

                  <AssetMaintenanceCostChart
                    costTrend={partsUsage.cost_trend || []}
                    summary={partsUsage.summary || {}}
                  />
                </div>

                {/* Sub-section 1: Perkiraan Kebutuhan Rutin Mesin Ini (Tabel & Paginasi 10/hal) */}
                <div>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                        <BsBoxSeam className="text-sm text-primary" />
                        Perkiraan Kebutuhan Suku Cadang Rutin Mesin Ini
                      </h4>
                      <span className="text-[11px] text-body dark:text-bodydark">
                        Dihitung otomatis dari siklus & frekuensi penggantian
                        suku cadang pada unit mesin ini
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-body dark:text-bodydark">
                      Total:{" "}
                      <span className="font-bold text-black dark:text-white">
                        {routineItems.length}
                      </span>{" "}
                      part
                    </span>
                  </div>

                  {routineItems.length === 0 ? (
                    <div className="bg-gray-50 rounded-xl border border-stroke p-6 text-center text-xs text-body dark:border-strokedark dark:bg-meta-4/10 dark:text-bodydark">
                      Belum ada riwayat penggantian suku cadang pada unit mesin
                      ini.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full table-auto text-left text-xs">
                        <thead>
                          <tr className="bg-gray-50 border-b border-stroke text-body dark:border-strokedark dark:bg-meta-4/20 dark:text-bodydark">
                            <th className="w-12 px-3 py-2.5 text-center font-semibold">
                              No
                            </th>
                            <th className="px-3 py-2.5 font-semibold">
                              Kode / Vendor
                            </th>
                            <th className="px-3 py-2.5 font-semibold">
                              Nama Suku Cadang
                            </th>
                            <th className="px-3 py-2.5 text-center font-semibold">
                              Frekuensi
                            </th>
                            <th className="px-3 py-2.5 text-center font-semibold">
                              Total Terpakai
                            </th>
                            <th className="px-3 py-2.5 text-center font-semibold">
                              Laju Konsumsi
                            </th>
                            <th className="px-3 py-2.5 text-center font-semibold">
                              Estimasi Kebutuhan / Bln
                            </th>
                            <th className="px-3 py-2.5 text-center font-semibold">
                              Stok Gudang
                            </th>
                            <th className="px-3 py-2.5 font-semibold">
                              Lokasi Rak
                            </th>
                            <th className="px-3 py-2.5 text-center font-semibold">
                              Aksi
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stroke dark:divide-strokedark">
                          {displayedRoutineItems.map((part, pIdx) => {
                            const isWarehouseReady =
                              Number(part.available || 0) >=
                              Number(part.recommended_monthly_stock || 1);
                            const rowNumber = (routinePage - 1) * 10 + pIdx + 1;
                            return (
                              <tr
                                key={part.id_part || pIdx}
                                className="hover:bg-gray-50 transition-colors dark:hover:bg-meta-4/10"
                              >
                                <td className="font-mono px-3 py-2.5 text-center text-body dark:text-bodydark">
                                  {rowNumber}
                                </td>
                                <td className="font-mono whitespace-nowrap px-3 py-2.5 font-bold text-primary">
                                  <span
                                    onClick={() =>
                                      router.push(`/parts/${part.id_part}`)
                                    }
                                    className="cursor-pointer hover:underline"
                                  >
                                    {part.vendor_code || "-"}
                                  </span>
                                </td>
                                <td className="min-w-[180px] px-3 py-2.5 font-semibold text-black dark:text-white">
                                  {part.description}
                                </td>
                                <td className="whitespace-nowrap px-3 py-2.5 text-center">
                                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                                    {part.frequency_label}
                                  </span>
                                </td>
                                <td className="whitespace-nowrap px-3 py-2.5 text-center">
                                  <span className="font-mono font-bold text-black dark:text-white">
                                    {part.total_qty} {part.unit}
                                  </span>
                                  <span className="block text-[10px] text-body dark:text-bodydark">
                                    ({part.times_used}x ganti)
                                  </span>
                                </td>
                                <td className="font-mono whitespace-nowrap px-3 py-2.5 text-center font-bold text-meta-5">
                                  ~{part.monthly_rate}{" "}
                                  <span className="text-[10px] font-normal text-body dark:text-bodydark">
                                    {part.unit}/bln
                                  </span>
                                </td>
                                <td className="whitespace-nowrap px-3 py-2.5 text-center">
                                  <span className="font-mono rounded-lg bg-primary/10 px-2.5 py-1 font-bold text-primary">
                                    {part.recommended_monthly_stock} {part.unit}
                                  </span>
                                </td>
                                <td className="whitespace-nowrap px-3 py-2.5 text-center">
                                  <span
                                    className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                      isWarehouseReady
                                        ? "bg-success/15 text-success"
                                        : "bg-danger/15 text-danger"
                                    }`}
                                  >
                                    {part.available} {part.unit}
                                  </span>
                                </td>
                                <td className="whitespace-nowrap px-3 py-2.5 text-body dark:text-bodydark">
                                  {part.location || "-"}
                                </td>
                                <td className="whitespace-nowrap px-3 py-2.5 text-center">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      router.push(`/parts/${part.id_part}`)
                                    }
                                    className="rounded-lg border border-stroke px-2.5 py-1 text-[11px] font-semibold text-primary transition-colors hover:bg-primary hover:text-white dark:border-strokedark"
                                  >
                                    Detail Part
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Pagination Kontrol Part Rutin (10 per page) */}
                  {routineTotalPages > 1 && (
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stroke/60 pt-3 text-xs dark:border-strokedark/60">
                      <span className="text-body dark:text-bodydark">
                        Menampilkan {(routinePage - 1) * 10 + 1} -{" "}
                        {Math.min(routinePage * 10, routineItems.length)} dari{" "}
                        {routineItems.length} suku cadang
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={routinePage === 1}
                          onClick={() =>
                            setRoutinePage((prev) => Math.max(1, prev - 1))
                          }
                          className="hover:bg-gray-100 rounded-lg border border-stroke px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-40 dark:border-strokedark dark:hover:bg-meta-4/30"
                        >
                          Sebelumnya
                        </button>
                        <span className="px-2 font-semibold text-black dark:text-white">
                          Hal {routinePage} / {routineTotalPages}
                        </span>
                        <button
                          type="button"
                          disabled={routinePage === routineTotalPages}
                          onClick={() =>
                            setRoutinePage((prev) =>
                              Math.min(routineTotalPages, prev + 1),
                            )
                          }
                          className="hover:bg-gray-100 rounded-lg border border-stroke px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-40 dark:border-strokedark dark:hover:bg-meta-4/30"
                        >
                          Berikutnya
                        </button>
                      </div>
                    </div>
                  )}

                  {/* External Service List */}
                  {servisList.length > 0 && (
                    <div className="rounded-xl border border-stroke p-4 dark:border-strokedark">
                      <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                        Servis / Bengkel Luar Terkait
                      </h4>
                      <div className="divide-y divide-stroke dark:divide-strokedark">
                        {servisList.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-lg px-2 py-2 text-xs"
                          >
                            <div>
                              <span className="block font-semibold text-black dark:text-white">
                                {item.item || item.description || "Jasa Servis"}
                              </span>
                              <span className="text-[10px] text-body dark:text-bodydark">
                                Vendor: {item.supplier || "-"} • Ref: #{item.id_register}
                              </span>
                            </div>
                            <span className="font-mono rounded-md bg-warning/10 px-2.5 py-1 font-bold text-warning">
                              Rp {Number(item.amount || 0).toLocaleString("id-ID")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sub-section 2: Riwayat Pemakaian Part per Bulan (Dropdown Bulan & Paginasi 10/hal) */}
                <div className="border-t border-stroke pt-4 dark:border-strokedark">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                        <HiOutlineCalendar className="text-sm text-meta-5" />
                        Riwayat Pemakaian Part per Bulan
                      </h4>
                      <span className="text-[11px] text-body dark:text-bodydark">
                        Rincian log penggantian komponen suku cadang pada unit
                        mesin ini
                      </span>
                    </div>

                    {/* Month Filter Dropdown */}
                    <div className="flex items-center gap-2">
                      <label className="whitespace-nowrap text-xs font-bold text-body dark:text-bodydark">
                        Pilih Bulan:
                      </label>
                      <select
                        value={selectedUsageMonth}
                        onChange={(e) => {
                          setSelectedUsageMonth(e.target.value);
                          setHistoryPage(1);
                        }}
                        className="shadow-xs cursor-pointer rounded-xl border border-stroke bg-white px-3 py-1.5 text-xs font-semibold text-black outline-none transition-colors focus:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white"
                      >
                        <option value="ALL">
                          Semua Bulan ({allHistoryItems.length} transaksi • Rp{" "}
                          {Number(
                            partsUsage.summary?.grand_total_cost || 0,
                          ).toLocaleString("id-ID")}
                          )
                        </option>
                        {partsUsage.monthly_breakdown?.map((m) => (
                          <option key={m.month_key} value={m.month_key}>
                            {m.month_label} (Rp{" "}
                            {Number(m.total_cost || 0).toLocaleString("id-ID")} •{" "}
                            {m.total_qty} part)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Table of Monthly Parts Consumed */}
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto text-left text-xs">
                      <thead>
                        <tr className="bg-gray-50 border-b border-stroke text-body dark:border-strokedark dark:bg-meta-4/20 dark:text-bodydark">
                          <th className="w-12 px-3 py-2.5 text-center font-semibold">
                            No
                          </th>
                          <th className="px-3 py-2.5 font-semibold">Tanggal</th>
                          <th className="px-3 py-2.5 font-semibold">Bulan</th>
                          <th className="px-3 py-2.5 font-semibold">
                            Part Number
                          </th>
                          <th className="px-3 py-2.5 font-semibold">
                            Nama Suku Cadang
                          </th>
                          <th className="px-3 py-2.5 text-center font-semibold">
                            Jumlah (Qty)
                          </th>
                          <th className="px-3 py-2.5 font-semibold text-right">
                            Harga Satuan
                          </th>
                          <th className="px-3 py-2.5 font-semibold text-right">
                            Total Biaya
                          </th>
                          <th className="px-3 py-2.5 font-semibold">
                            Lokasi Rak
                          </th>
                          <th className="px-3 py-2.5 font-semibold">
                            No. Tiket
                          </th>
                          <th className="px-3 py-2.5 font-semibold">
                            Keterangan Perbaikan
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stroke dark:divide-strokedark">
                        {displayedHistoryItems.length === 0 ? (
                          <tr>
                            <td
                              colSpan={11}
                              className="py-6 text-center text-body dark:text-bodydark"
                            >
                              Tidak ada data pemakaian part untuk periode ini.
                            </td>
                          </tr>
                        ) : (
                          <>
                            {displayedHistoryItems.map((item, idx) => {
                              const rowNumber = (historyPage - 1) * 10 + idx + 1;
                              return (
                                <tr
                                  key={idx}
                                  className="hover:bg-gray-50 transition-colors dark:hover:bg-meta-4/10"
                                >
                                  <td className="font-mono px-3 py-2.5 text-center text-body dark:text-bodydark">
                                    {rowNumber}
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-2.5 font-medium text-black dark:text-white">
                                    {formatDateLocal(item.date)}
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-2.5 font-semibold text-body dark:text-bodydark">
                                    {item.month_label}
                                  </td>
                                  <td className="font-mono px-3 py-2.5 font-bold text-primary">
                                    <span
                                      onClick={() =>
                                        router.push(`/parts/${item.id_part}`)
                                      }
                                      className="cursor-pointer hover:underline"
                                    >
                                      {item.vendor_code || "-"}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2.5 font-semibold text-black dark:text-white">
                                    {item.description}
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-2.5 text-center font-bold text-warning font-mono">
                                    -{item.qty} {item.unit || "pcs"}
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-2.5 text-right font-mono text-[11px] text-body dark:text-bodydark">
                                    {item.unit_price > 0
                                      ? `Rp ${Number(item.unit_price).toLocaleString("id-ID")}`
                                      : "-"}
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-2.5 text-right font-mono font-bold text-black dark:text-white">
                                    {item.total_cost > 0
                                      ? `Rp ${Number(item.total_cost).toLocaleString("id-ID")}`
                                      : "-"}
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-2.5 text-body dark:text-bodydark">
                                    {item.location || "-"}
                                  </td>
                                  <td className="font-mono px-3 py-2.5 text-body dark:text-bodydark">
                                    #{item.id_for}
                                  </td>
                                  <td className="max-w-xs truncate px-3 py-2.5 text-body dark:text-bodydark">
                                    {item.subject || "-"}
                                  </td>
                                </tr>
                              );
                            })}

                            {selectedUsageMonth !== "ALL" && (
                              <tr className="bg-primary/5 font-bold dark:bg-primary/10 border-t-2 border-primary/20">
                                <td
                                  colSpan={5}
                                  className="px-3 py-2.5 text-right font-bold text-black dark:text-white"
                                >
                                  Total Biaya Part Bulan Ini ({selectedUsageMonth}):
                                </td>
                                <td className="px-3 py-2.5 text-center font-mono text-warning font-bold">
                                  -
                                  {currentFilteredHistory.reduce(
                                    (acc, it) => acc + (Number(it.qty) || 0),
                                    0,
                                  )}{" "}
                                  unit
                                </td>
                                <td></td>
                                <td className="whitespace-nowrap px-3 py-2.5 text-right font-mono font-bold text-primary">
                                  Rp{" "}
                                  {currentFilteredHistory
                                    .reduce(
                                      (acc, it) => acc + (Number(it.total_cost) || 0),
                                      0,
                                    )
                                    .toLocaleString("id-ID")}
                                </td>
                                <td colSpan={3}></td>
                              </tr>
                            )}
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Kontrol Riwayat Pemakaian (10 per page) */}
                  {historyTotalPages > 1 && (
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stroke/60 pt-3 text-xs dark:border-strokedark/60">
                      <span className="text-body dark:text-bodydark">
                        Menampilkan {(historyPage - 1) * 10 + 1} -{" "}
                        {Math.min(
                          historyPage * 10,
                          currentFilteredHistory.length,
                        )}{" "}
                        dari {currentFilteredHistory.length} transaksi
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={historyPage === 1}
                          onClick={() =>
                            setHistoryPage((prev) => Math.max(1, prev - 1))
                          }
                          className="hover:bg-gray-100 rounded-lg border border-stroke px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-40 dark:border-strokedark dark:hover:bg-meta-4/30"
                        >
                          Sebelumnya
                        </button>
                        <span className="px-2 font-semibold text-black dark:text-white">
                          Hal {historyPage} / {historyTotalPages}
                        </span>
                        <button
                          type="button"
                          disabled={historyPage === historyTotalPages}
                          onClick={() =>
                            setHistoryPage((prev) =>
                              Math.min(historyTotalPages, prev + 1),
                            )
                          }
                          className="hover:bg-gray-100 rounded-lg border border-stroke px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-40 dark:border-strokedark dark:hover:bg-meta-4/30"
                        >
                          Berikutnya
                        </button>
                      </div>
                    </div>
                  )}

                  {/* External Service List */}
                  {servisList.length > 0 && (
                    <div className="rounded-xl border border-stroke p-4 dark:border-strokedark">
                      <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                        Servis / Bengkel Luar Terkait
                      </h4>
                      <div className="divide-y divide-stroke dark:divide-strokedark">
                        {servisList.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-lg px-2 py-2 text-xs"
                          >
                            <div>
                              <span className="block font-semibold text-black dark:text-white">
                                {item.item || item.description || "Jasa Servis"}
                              </span>
                              <span className="text-[10px] text-body dark:text-bodydark">
                                Vendor: {item.supplier || "-"} • Ref: #{item.id_register}
                              </span>
                            </div>
                            <span className="font-mono rounded-md bg-warning/10 px-2.5 py-1 font-bold text-warning">
                              Rp {Number(item.amount || 0).toLocaleString("id-ID")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </PageCard>
          </div>
        </DefaultLayout>
      )}
    </UserAuth>
  );
}
