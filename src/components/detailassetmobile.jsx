"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import Webcam from "react-webcam";
import UserAuth from "@/components/auth";
import { CommonInput, CommonTextArea } from "@/components/input";
import { CommonButtonFull } from "./button";
import { PageLoader } from "./loader";
import { CustomModal } from "./modal";
import { ProgressCard, ProgressSummary } from "@/components/card";
import { useProvider } from "@/app/appcontext";
import { formatDateTime, formatDateLocal, getCurrentDate, getCurrentTime } from "@/utils/dateformat";
import paginateData from "@/utils/pagination";
import { NotifyError, NotifySuccess } from "@/utils/notify";
import { RepairStatus } from "@/utils/repairstatus";
import { IMAGE_ASSET, IMAGE_USER, IMAGE_GALLERY } from "@/utils/constant";
import Pemanasan from "@/components/pemanasan";
import AssetMaintenanceCostChart from "@/components/Charts/AssetMaintenanceCostChart";

// Icons
import {
  HiArrowLeft,
  HiOutlineUser,
  HiUser,
  HiLocationMarker,
  HiSearch,
} from "react-icons/hi";
import {
  HiCalendar,
  HiOutlineClock,
  HiOutlineWrenchScrewdriver,
  HiSparkles,
  HiOutlineChartBar,
  HiOutlineCalendar,
  HiOutlinePencilSquare,
  HiOutlineCamera,
  HiOutlinePhoto,
  HiOutlineArrowPath,
} from "react-icons/hi2";
import {
  MdOutlineClose,
  MdOutlineMiscellaneousServices,
  MdOutlinePhotoCamera,
  MdOutlinePhotoCameraFront,
  MdMedicalServices,
  MdAdd,
} from "react-icons/md";
import { FaCalendarAlt, FaCheckSquare } from "react-icons/fa";
import { BsFillFuelPumpFill, BsFire, BsBoxSeam } from "react-icons/bs";
import { RiCalendarScheduleFill, RiDeleteBin2Line } from "react-icons/ri";
import { LuRefreshCw } from "react-icons/lu";
import { CiEdit } from "react-icons/ci";
import { TfiSave } from "react-icons/tfi";

export default function DetailAssetMobile({ idAsset }) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  const [dataAsset, setDataAsset] = useState({});
  const [dataService, setDataService] = useState([]);
  const [firstLoading, setFirstLoading] = useState(true);
  const [secondLoading, setSecondLoading] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [keywordError, setKeywordError] = useState(false);
  const [switchPage, setSwitchPage] = useState(false);
  const [selectedCase, setSelectedCase] = useState({});

  const [itemPerPage, setItemPerPage] = useState(5);
  const [filteredDataService, setFilteredDataService] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(0);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [partList, setPartList] = useState([]);
  const [galleryList, setGalleryList] = useState([]);
  const [caseLoaderReceived, setCaseLoaderReceived] = useState(false);
  const [servisList, setServisList] = useState([]);
  const [caseLoaderOrder, setCaseLoaderOrder] = useState(false);
  const [caseLoaderCompleted, setCaseLoaderCompleted] = useState(false);
  const [pmList, setpmList] = useState([]);
  const [pmTempList, setpmTempList] = useState([]);
  const [pmEditMode, setpmEditMode] = useState(false);
  const [solutionEditMode, setSolutionEditMode] = useState(false);
  const [onloadSolution, setOnloadSolution] = useState(false);
  const [uid, setUid] = useState("");
  const [userLevel, setUserLevel] = useState("");

  const [caseSolution, setCaseSolution] = useState("");
  const [caseSolutionError, setCaseSolutionError] = useState(false);

  const [updatedStep, setUpdatedStep] = useState("");
  const [onloadPM, setOnloadPM] = useState(false);

  const [responseTime, setResponseTime] = useState("");
  const [repairTime, setRepairTime] = useState("");

  const [loadDetailService, setLoadDetailService] = useState(false);
  const [modalPerbaikan, setModalPerbaikan] = useState(false);
  const [modalPerawatan, setModalPerawatan] = useState(false);

  const [inputRequestPerbaikan, setInputRequestPerbaikan] = useState("");
  const [inputRequestPerbaikanError, setInputRequestPerbaikanError] = useState(false);
  const [onloadRequestPerbaikan, setOnloadRequestPerbaikan] = useState(false);

  const [inputKM, setInputKM] = useState("");
  const [inputKMError, setInputKMError] = useState(false);
  const [onloadRequestPerawatan, setOnloadRequestPerawatan] = useState(false);

  const [onloadAddChecklist, setOnloadAddChecklist] = useState(false);
  const [openService, setOpenService] = useState(0);
  const [openMaintenance, setOpenMaintenance] = useState(0);
  const [switchDelete, setSwitchDelete] = useState(false);
  const [onloadDelete, setOnloadDelete] = useState(false);
  const [resetAsset, setResetAsset] = useState(false);
  const { setCameraResult, setGlobalIdAsset } = useProvider();

  const [lastSeen, setLastSeen] = useState("");
  const [ratio, setRatio] = useState("");
  const [nextService, setNextService] = useState("");

  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [receiveDateTime, setReceiveDateTime] = useState("");
  const [currentDateError, setCurrentDateError] = useState(false);
  const [currentTimeError, setCurrentTimeError] = useState(false);
  const [modalReceivePart, setModalReceivePart] = useState(false);

  const [partsUsage, setPartsUsage] = useState({
    monthly_breakdown: [],
    routine_needs: [],
    summary: {},
  });
  const [loadingPartsUsage, setLoadingPartsUsage] = useState(true);
  const [selectedUsageMonth, setSelectedUsageMonth] = useState("ALL");
  const [routinePage, setRoutinePage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);

  // Edit Asset States Mobile
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

  const [editImage, setEditImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editUserImage, setEditUserImage] = useState(null);
  const [userImagePreview, setUserImagePreview] = useState(null);

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
          NotifySuccess("Foto aset berhasil diambil");
        } else {
          setEditUserImage(screenshot);
          setUserImagePreview(screenshot);
          NotifySuccess("Foto pemegang berhasil diambil");
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
        const detail = response.data["detail"][0];
        setDataAsset(detail);
        setOpenService(response.data["open_service"]);
        setOpenMaintenance(response.data["open_maintenance"]);
        setLastSeen(response.data["last_seen"]);
        setRatio(response.data["ratio"]);
        setNextService(response.data["next_service"]);

        const user = localStorage.getItem("info");
        if (user) {
          const parseUser = JSON.parse(user);
          setUid(parseUser[0]?.["Uid"] || "");
          setUserLevel(parseUser[0]?.["Level"] || "");
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFirstLoading(false);
      setSecondLoading(true);
    }
  };

  const fetch_data_service = async () => {
    try {
      const response = await axios.post("/api/fetchassetservice", {
        idAsset: idAsset,
      });

      if (response.status === 200) {
        setDataService(response.data["service"] || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSecondLoading(false);
    }
  };

  const fetch_detail_service = async (id) => {
    setLoadDetailService(true);
    try {
      const response = await axios.post("/api/fetchdetailservice", {
        idRequest: id,
      });

      if (response.status === 200) {
        const detail = response.data["response"]?.[0] || {};
        setSelectedCase(detail);
        setPartList(response.data["parts"] || []);
        setGalleryList(response.data["galleries"] || []);
        setServisList(response.data["servis"] || []);
        setResponseTime(response.data["response_time"] || "-");
        setRepairTime(response.data["repair_time"] || "-");

        const checkList = detail["new_checklist"];
        setpmList([]);
        setpmTempList([]);
        if (checkList && checkList !== "") {
          try {
            const pmparsed = typeof checkList === "string" ? JSON.parse(checkList) : checkList;
            setpmList(pmparsed);
            setpmTempList(pmparsed);
          } catch (err) {
            console.error("Checklist parse error:", err);
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadDetailService(false);
    }
  };

  useEffect(() => {
    fetch_data();
  }, [idAsset, keyword]);

  useEffect(() => {
    if (dataAsset?.ID_Asset) {
      fetch_data_service();
      fetch_parts_usage();
    }
  }, [dataAsset]);

  useEffect(() => {
    const filterService = dataService.filter((item) =>
      (item["Problem"] || "").toLowerCase().includes(keyword.toLowerCase())
    );
    const { data, pageCurrent, pageLast } = paginateData(
      filterService,
      currentPage,
      itemPerPage
    );
    setFilteredDataService(data);
    setLastPage(pageLast);
    setShowLoadMore(pageCurrent < pageLast);
  }, [keyword, dataService, itemPerPage, currentPage]);

  const do_action = async (step, id_request) => {
    try {
      const user = localStorage.getItem("info");
      const parseUser = user ? JSON.parse(user) : [{}];
      const response = await axios.post("/api/updatecase", {
        idRequest: id_request,
        status: step,
        solution: caseSolution,
        uid: parseUser[0]?.["Uid"],
        receivePart: receiveDateTime,
      });

      if (response.status === 200) {
        const detail = response.data["response"];
        const error = response.data["error"];
        if (error === 1) {
          NotifyError(detail);
        } else {
          NotifySuccess(detail);
        }
      }
      fetch_detail_service(id_request);
    } catch (e) {
      NotifyError("Gagal memperbarui status");
    } finally {
      setCaseLoaderOrder(false);
      setCaseLoaderCompleted(false);
    }
  };

  useEffect(() => {
    const idRequest = localStorage.getItem("selected_idRequest");
    if (updatedStep !== "") {
      do_action(updatedStep, idRequest);
      setUpdatedStep("");
    }
  }, [updatedStep]);

  const create_maintenance = async (idasset) => {
    try {
      const user = localStorage.getItem("info");
      const parseUser = user ? JSON.parse(user) : [{}];
      const userUid = parseUser[0]?.["Uid"];

      setOnloadRequestPerawatan(true);
      const response = await axios.post("/api/createmaintenance", {
        idAsset: idasset,
        uid: userUid,
      });

      if (response.status === 200) {
        NotifySuccess(response.data["message"] || "Permintaan perawatan dibuat");
        fetch_data();
        fetch_data_service();
      }
    } catch (e) {
      NotifyError("Gagal membuat perawatan");
    } finally {
      setOnloadRequestPerawatan(false);
    }
  };

  useEffect(() => {
    const qr = localStorage.getItem("qrcode_case");
    if (qr && qr !== "") {
      localStorage.setItem("qrcode_case", "");
      if (qr !== idAsset) {
        NotifyError("Invalid QRCode");
      } else {
        setUpdatedStep("received");
      }
    }
  }, [router, idAsset]);

  useEffect(() => {
    setCurrentDate(getCurrentDate());
    setCurrentTime(getCurrentTime());
    setIsClient(true);
  }, []);

  // Pagination & Filter calculations for Parts Usage (Mobile)
  const routineItems = partsUsage.routine_needs || [];
  const routineTotalPages = Math.max(1, Math.ceil(routineItems.length / 10));
  const displayedRoutineItems = routineItems.slice((routinePage - 1) * 10, routinePage * 10);

  const allHistoryItems = (partsUsage.monthly_breakdown || []).flatMap((m) =>
    (m.parts || []).map((p) => ({ ...p, month_label: m.month_label }))
  );

  const currentFilteredHistory = selectedUsageMonth === "ALL"
    ? allHistoryItems
    : (partsUsage.monthly_breakdown?.find((m) => m.month_key === selectedUsageMonth)?.parts || []).map((p) => ({
        ...p,
        month_label: partsUsage.monthly_breakdown?.find((m) => m.month_key === selectedUsageMonth)?.month_label,
      }));

  const historyTotalPages = Math.max(1, Math.ceil(currentFilteredHistory.length / 10));
  const displayedHistoryItems = currentFilteredHistory.slice((historyPage - 1) * 10, historyPage * 10);

  if (!isClient) return null;

  return (
    <UserAuth>
      <div className="min-h-screen bg-whiten text-body dark:bg-boxdark-2 dark:text-bodydark pb-16">
        {firstLoading ? (
          <PageLoader />
        ) : (
          <div className="mx-auto max-w-lg">
            {/* Top Navigation Bar */}
            <div className="sticky top-0 z-40 flex items-center justify-between border-b border-stroke/60 bg-white/80 px-4 py-3 backdrop-blur-md dark:border-strokedark/60 dark:bg-boxdark/80">
              <button
                type="button"
                onClick={() => {
                  if (switchPage) {
                    setSwitchPage(false);
                  } else {
                    router.back();
                  }
                }}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-black hover:bg-gray-200 dark:bg-meta-4 dark:text-white transition-colors"
              >
                <HiArrowLeft className="text-lg" />
              </button>
              <div className="flex flex-col items-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {switchPage ? "Detail Servis" : "Detail Aset"}
                </span>
                <span className="text-sm font-bold text-black dark:text-white">
                  {switchPage ? selectedCase?.ID_Request : dataAsset.ID_Asset}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {/* Edit Asset Button */}
                {!switchPage && (
                  <button
                    type="button"
                    title="Edit Data & Foto Aset"
                    onClick={openEditAssetModal}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 transition-colors"
                  >
                    <HiOutlinePencilSquare className="text-base" />
                  </button>
                )}
                {/* Reset Asset Button for Admin */}
                {parseInt(userLevel) === 0 && !switchPage && (
                  <button
                    type="button"
                    title="Reset Status Aset"
                    onClick={async () => {
                      setResetAsset(true);
                      try {
                        const response = await axios.post("/api/resetasset", {
                          idAsset: dataAsset.ID_Asset,
                        });
                        if (response.status === 200) {
                          NotifySuccess(response.data["message"] || "Status di-reset");
                          fetch_data();
                        }
                      } catch (e) {
                        NotifyError("Gagal reset status aset");
                      } finally {
                        setResetAsset(false);
                      }
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 transition-colors"
                  >
                    <LuRefreshCw className={`text-base ${resetAsset ? "animate-spin" : ""}`} />
                  </button>
                )}
                {/* Pemanasan Quick Trigger */}
                {dataAsset.ID_Asset === "BFNMF0402" && (
                  <button
                    type="button"
                    onClick={() => router.push("/pemanasan")}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-danger/10 text-danger hover:bg-danger/20 transition-colors"
                  >
                    <BsFire className="text-base" />
                  </button>
                )}
              </div>
            </div>

            {/* MAIN CONTENT: Either Detail Case Screen or Asset Overview */}
            {switchPage ? (
              /* ================= DETAIL SERVIS CASE VIEW ================= */
              <div className="p-4 space-y-4">
                {loadDetailService ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="text-sm text-body dark:text-bodydark">Memuat detail pengerjaan...</span>
                  </div>
                ) : (
                  <>
                    {/* Header Case Status Banner */}
                    <div className="rounded-2xl border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-black dark:text-white">
                              {selectedCase.ID_Request}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                selectedCase.Maintenance_Type === "PM"
                                  ? "bg-meta-3/15 text-meta-3"
                                  : "bg-danger/15 text-danger"
                              }`}
                            >
                              {selectedCase.Maintenance_Type === "PM" ? "PM Rutin" : "Perbaikan"}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-black dark:text-white leading-tight">
                            {selectedCase.Problem}
                          </h3>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold text-white ${
                              RepairStatus(selectedCase.Step)?.color || "bg-primary"
                            }`}
                          >
                            {RepairStatus(selectedCase.Step)?.status}
                          </span>
                          {/* Delete Request if Step 1 */}
                          {String(selectedCase.Step) === "1" && (
                            <div className="mt-1">
                              {switchDelete ? (
                                <div className="flex items-center gap-1.5 text-xs">
                                  <button
                                    type="button"
                                    disabled={onloadDelete}
                                    onClick={async () => {
                                      setOnloadDelete(true);
                                      try {
                                        const res = await axios.post("/api/deleterequest", {
                                          idRequest: selectedCase.ID_Request,
                                          idAsset: selectedCase.ID_Asset,
                                        });
                                        if (res.status === 200) {
                                          NotifySuccess(res.data.message || "Tiket dihapus");
                                          fetch_data();
                                          fetch_data_service();
                                          setSwitchPage(false);
                                        }
                                      } catch (e) {
                                        NotifyError("Gagal menghapus tiket");
                                      } finally {
                                        setOnloadDelete(false);
                                        setSwitchDelete(false);
                                      }
                                    }}
                                    className="font-bold text-danger hover:underline"
                                  >
                                    {onloadDelete ? "..." : "Hapus"}
                                  </button>
                                  <span className="text-stroke dark:text-strokedark">|</span>
                                  <button
                                    type="button"
                                    onClick={() => setSwitchDelete(false)}
                                    className="font-medium text-body dark:text-bodydark hover:underline"
                                  >
                                    Batal
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setSwitchDelete(true)}
                                  className="flex items-center gap-1 text-[11px] text-danger hover:underline"
                                >
                                  <RiDeleteBin2Line className="text-xs" />
                                  <span>Hapus Tiket</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Requestor Info */}
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-stroke/60 pt-3 text-xs text-body dark:border-strokedark/60 dark:text-bodydark">
                        <div className="flex items-center gap-1.5">
                          <HiOutlineUser className="text-sm" />
                          <span>{selectedCase.Requestor || "-"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <HiOutlineClock className="text-sm" />
                          <span>{formatDateTime(selectedCase.Time_Request)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Step Action Buttons */}
                    <div className="rounded-2xl border border-stroke bg-white p-3 shadow-sm dark:border-strokedark dark:bg-boxdark">
                      {(() => {
                        switch (String(selectedCase.Step)) {
                          case "1":
                            return (
                              <button
                                type="button"
                                onClick={() => {
                                  localStorage.setItem("scanner_mode", 1);
                                  router.push("/scanner");
                                }}
                                disabled={caseLoaderReceived}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 px-4 font-semibold text-white shadow-md hover:bg-opacity-90 active:scale-[0.99] transition-all"
                              >
                                <HiOutlineWrenchScrewdriver className="text-lg" />
                                <span>Terima & Mulai Pengerjaan</span>
                              </button>
                            );
                          case "2":
                            return uid === selectedCase.ID_Tech ? (
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCaseLoaderOrder(true);
                                    setUpdatedStep("order_part");
                                  }}
                                  disabled={caseLoaderOrder}
                                  className="rounded-xl border border-warning bg-warning/10 py-2.5 px-3 text-xs font-semibold text-warning hover:bg-warning/20 transition-all"
                                >
                                  {caseLoaderOrder ? "Menyimpan..." : "Order Spare Part"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCaseLoaderCompleted(true);
                                    setUpdatedStep("completed");
                                  }}
                                  disabled={caseLoaderCompleted}
                                  className="rounded-xl bg-success py-2.5 px-3 text-xs font-semibold text-white shadow hover:bg-opacity-90 transition-all"
                                >
                                  {caseLoaderCompleted ? "Menyimpan..." : "Selesai Pengerjaan"}
                                </button>
                              </div>
                            ) : null;
                          case "3":
                            return parseInt(userLevel) <= 2 ? (
                              <button
                                type="button"
                                onClick={() => setModalReceivePart(true)}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-meta-5 py-3 px-4 font-semibold text-white shadow hover:bg-opacity-90 transition-all"
                              >
                                <span>Konfirmasi Spare Part Tiba</span>
                              </button>
                            ) : null;
                          case "4":
                            return uid === selectedCase.ID_Tech ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setCaseLoaderCompleted(true);
                                  setUpdatedStep("completed");
                                }}
                                disabled={caseLoaderCompleted}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-success py-3 px-4 font-semibold text-white shadow hover:bg-opacity-90 transition-all"
                              >
                                <span>{caseLoaderCompleted ? "Menyimpan..." : "Selesaikan Pengerjaan"}</span>
                              </button>
                            ) : null;
                          case "5":
                            return parseInt(userLevel) <= 1 ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setCaseLoaderCompleted(true);
                                  setUpdatedStep("checked");
                                }}
                                disabled={caseLoaderCompleted}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 px-4 font-semibold text-white shadow hover:bg-opacity-90 transition-all"
                              >
                                <span>{caseLoaderCompleted ? "Menyimpan..." : "Verifikasi / Checked"}</span>
                              </button>
                            ) : null;
                          case "6":
                            return uid === selectedCase.ID_Requestor ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setCaseLoaderCompleted(true);
                                  setUpdatedStep("accepted");
                                }}
                                disabled={caseLoaderCompleted}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-success py-3 px-4 font-semibold text-white shadow hover:bg-opacity-90 transition-all"
                              >
                                <span>{caseLoaderCompleted ? "Menyimpan..." : "Terima Unit / Accepted"}</span>
                              </button>
                            ) : null;
                          default:
                            return (
                              <div className="text-center py-1 text-xs text-body dark:text-bodydark">
                                Status pengerjaan: {RepairStatus(selectedCase.Step)?.status || "Selesai"}
                              </div>
                            );
                        }
                      })()}
                    </div>

                    {/* Tindakan / Solusi Card */}
                    <div className="rounded-2xl border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                          Tindakan & Solusi
                        </span>
                        {parseInt(selectedCase.Step) >= 2 && parseInt(selectedCase.Step) <= 6 && (
                          solutionEditMode ? (
                            <button
                              type="button"
                              onClick={async () => {
                                setOnloadSolution(true);
                                if (!caseSolution.trim()) {
                                  setCaseSolutionError(true);
                                  setOnloadSolution(false);
                                  return;
                                }
                                try {
                                  await axios.post("/api/updatesolution", {
                                    idRequest: selectedCase.ID_Request,
                                    solution: caseSolution,
                                  });
                                  fetch_detail_service(selectedCase.ID_Request);
                                  setSolutionEditMode(false);
                                  NotifySuccess("Solusi berhasil disimpan");
                                } catch (e) {
                                  NotifyError("Gagal menyimpan solusi");
                                } finally {
                                  setOnloadSolution(false);
                                }
                              }}
                              className="flex items-center gap-1 rounded-lg bg-success px-2.5 py-1 text-xs font-semibold text-white shadow hover:bg-opacity-90 transition-all"
                            >
                              <TfiSave className="text-xs" />
                              <span>Simpan</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setCaseSolution(selectedCase.Solution || "");
                                setSolutionEditMode(true);
                              }}
                              className="flex items-center gap-1 rounded-lg bg-gray-100 dark:bg-meta-4 px-2.5 py-1 text-xs font-medium text-black dark:text-white hover:bg-gray-200 transition-colors"
                            >
                              <CiEdit className="text-sm" />
                              <span>Edit</span>
                            </button>
                          )
                        )}
                      </div>

                      {solutionEditMode ? (
                        <div className="mt-2">
                          <CommonTextArea
                            input={caseSolution}
                            placeholder="Tuliskan tindakan dan solusi permasalahan..."
                            error={caseSolutionError}
                            isDisabled={onloadSolution}
                            onInputChange={(val) => setCaseSolution(val)}
                            onChg={() => setCaseSolutionError(false)}
                          />
                        </div>
                      ) : (
                        <div className="rounded-xl bg-gray-50 dark:bg-meta-4/20 p-3 text-xs leading-relaxed text-black dark:text-white min-h-[48px]">
                          {selectedCase.Solution || (
                            <span className="italic text-body dark:text-bodydark opacity-60">
                              Belum ada catatan solusi atau tindakan...
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Progress Workflow Timeline */}
                    <div className="rounded-2xl border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                          Timeline Pengerjaan
                        </span>
                        {parseInt(userLevel) <= 1 && (
                          <button
                            type="button"
                            onClick={() => router.push(`/asset/${idAsset}/${selectedCase.ID_Request}`)}
                            className="text-xs font-medium text-primary hover:underline"
                          >
                            Ubah Waktu
                          </button>
                        )}
                      </div>
                      <div className="space-y-1">
                        <ProgressCard
                          title="Issued"
                          name={selectedCase.Requestor}
                          dateString={formatDateTime(selectedCase.Time_Request)}
                          isActive={true}
                        />
                        <ProgressCard
                          title="Response"
                          name={selectedCase.Technician}
                          dateString={formatDateTime(selectedCase.Time_Response)}
                          isActive={parseInt(selectedCase.Step) >= 2}
                        />
                        <ProgressCard
                          title="Completed"
                          name={selectedCase.Technician}
                          dateString={formatDateTime(selectedCase.Time_Repair_Complete)}
                          isActive={parseInt(selectedCase.Step) >= 5}
                        />
                        <ProgressCard
                          title="Checked"
                          name={selectedCase.Tech_SPV_Name}
                          dateString={formatDateTime(selectedCase.Tech_SPV)}
                          isActive={parseInt(selectedCase.Step) >= 6}
                        />
                        <ProgressCard
                          title="Accepted"
                          name={selectedCase.Approver_Name}
                          dateString={formatDateTime(selectedCase.Prod_SPV)}
                          isActive={parseInt(selectedCase.Step) >= 7}
                        />
                      </div>
                    </div>

                    {/* Summary Durations */}
                    <div className="rounded-2xl border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark">
                      <span className="text-xs font-bold uppercase tracking-wider text-black dark:text-white block mb-2">
                        Durasi Penanganan
                      </span>
                      <div className="space-y-1">
                        <ProgressSummary
                          title="Response Time"
                          hour={responseTime}
                          isActive={parseInt(selectedCase.Step) >= 2}
                        />
                        <ProgressSummary
                          title="Repair Time"
                          hour={repairTime}
                          isActive={parseInt(selectedCase.Step) >= 5}
                        />
                      </div>
                    </div>

                    {/* Checklist if PM */}
                    {selectedCase.Maintenance_Type === "PM" && (
                      <div className="rounded-2xl border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                            Checklist Perawatan Rutin
                          </span>
                          {parseInt(selectedCase.Step) >= 2 && parseInt(selectedCase.Step) <= 6 && (
                            pmList.length === 0 ? (
                              <button
                                type="button"
                                disabled={onloadAddChecklist}
                                onClick={async () => {
                                  setOnloadAddChecklist(true);
                                  try {
                                    const res = await axios.post("/api/addchecklist", {
                                      idRequest: selectedCase.ID_Request,
                                      idAsset: selectedCase.ID_Asset,
                                    });
                                    if (res.status === 200) {
                                      NotifySuccess(res.data.response || "Checklist ditambahkan");
                                      fetch_detail_service(selectedCase.ID_Request);
                                    }
                                  } catch (e) {
                                    NotifyError("Gagal menambahkan checklist");
                                  } finally {
                                    setOnloadAddChecklist(false);
                                  }
                                }}
                                className="flex items-center gap-1 rounded-lg bg-meta-3 px-2.5 py-1 text-xs font-semibold text-white shadow hover:bg-opacity-90"
                              >
                                <MdAdd className="text-sm" />
                                <span>{onloadAddChecklist ? "..." : "Tambah Checklist"}</span>
                              </button>
                            ) : pmEditMode ? (
                              <button
                                type="button"
                                disabled={onloadPM}
                                onClick={async () => {
                                  setOnloadPM(true);
                                  try {
                                    await axios.post("/api/updatepmlist", {
                                      idRequest: selectedCase.ID_Request,
                                      pmList: JSON.stringify(pmTempList),
                                    });
                                    fetch_detail_service(selectedCase.ID_Request);
                                    setpmEditMode(false);
                                    NotifySuccess("Checklist disimpan");
                                  } catch (e) {
                                    NotifyError("Gagal menyimpan checklist");
                                  } finally {
                                    setOnloadPM(false);
                                  }
                                }}
                                className="flex items-center gap-1 rounded-lg bg-success px-2.5 py-1 text-xs font-semibold text-white shadow hover:bg-opacity-90"
                              >
                                <TfiSave className="text-xs" />
                                <span>Simpan</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setpmEditMode(true)}
                                className="flex items-center gap-1 rounded-lg bg-gray-100 dark:bg-meta-4 px-2.5 py-1 text-xs font-medium text-black dark:text-white hover:bg-gray-200"
                              >
                                <CiEdit className="text-sm" />
                                <span>Edit Checklist</span>
                              </button>
                            )
                          )}
                        </div>

                        {pmList.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead>
                                <tr className="border-b border-stroke/60 text-body dark:border-strokedark/60 dark:text-bodydark">
                                  <th className="py-2 px-1 font-semibold">Kode</th>
                                  <th className="py-2 px-2 font-semibold">Uraian</th>
                                  <th className="py-2 px-1 text-center font-semibold">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-stroke/40 dark:divide-strokedark/40">
                                {pmEditMode
                                  ? pmTempList.map((item, idx) => (
                                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-meta-4/20">
                                        <td className="py-2 px-1 font-mono text-black dark:text-white align-top">
                                          {item["code"]}
                                        </td>
                                        <td className="py-2 px-2 text-black dark:text-white">
                                          <div>{item["description"]}</div>
                                          {item["widget"] === "T" && (
                                            <input
                                              type="text"
                                              value={item["value"] || ""}
                                              onChange={(e) => {
                                                const val = e.target.value;
                                                setpmTempList((prev) =>
                                                  prev.map((el) =>
                                                    el.code === item["code"] ? { ...el, value: val } : el
                                                  )
                                                );
                                              }}
                                              className="mt-1.5 w-full rounded-lg border border-stroke px-2 py-1 text-xs dark:border-strokedark dark:bg-boxdark-2 text-black dark:text-white"
                                            />
                                          )}
                                        </td>
                                        <td className="py-2 px-1 text-center align-top">
                                          {item["widget"] === "C" && (
                                            <input
                                              type="checkbox"
                                              checked={!!item["checked"]}
                                              onChange={() => {
                                                setpmTempList((prev) =>
                                                  prev.map((el) =>
                                                    el.code === item["code"] ? { ...el, checked: !el.checked } : el
                                                  )
                                                );
                                              }}
                                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                          )}
                                        </td>
                                      </tr>
                                    ))
                                  : pmList.map((item, idx) => (
                                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-meta-4/20">
                                        <td className="py-2 px-1 font-mono text-black dark:text-white align-top">
                                          {item["code"]}
                                        </td>
                                        <td className="py-2 px-2 text-black dark:text-white">
                                          {item["description"]}
                                        </td>
                                        <td className="py-2 px-1 text-center align-top">
                                          {item["checked"] ? (
                                            <FaCheckSquare className="inline text-success text-sm" />
                                          ) : (
                                            <span className="font-mono text-black dark:text-white">
                                              {item["value"] || "-"}
                                            </span>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="py-4 text-center text-xs text-body dark:text-bodydark italic">
                            Belum ada checklist perawatan untuk tiket ini.
                          </div>
                        )}
                      </div>
                    )}

                    {/* Spare Parts List */}
                    {partList.length > 0 && (
                      <div className="rounded-2xl border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark">
                        <span className="text-xs font-bold uppercase tracking-wider text-black dark:text-white block mb-2">
                          Spare Part Digunakan
                        </span>
                        <div className="divide-y divide-stroke/40 dark:divide-strokedark/40">
                          {partList.map((item, idx) => (
                            <div key={idx} className="py-2 flex items-center justify-between text-xs">
                              <div>
                                <span className="font-medium text-black dark:text-white block">
                                  {item["description"]}
                                </span>
                                <span className="text-[10px] text-body dark:text-bodydark">
                                  {item["dpm"] || "Internal"}
                                </span>
                              </div>
                              <span className="rounded-md bg-gray-100 dark:bg-meta-4 px-2 py-0.5 font-bold text-black dark:text-white">
                                {item["quantity"]} pcs
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* External Service List */}
                    {servisList.length > 0 && (
                      <div className="rounded-2xl border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark">
                        <span className="text-xs font-bold uppercase tracking-wider text-black dark:text-white block mb-2">
                          Servis Pihak Luar
                        </span>
                        <div className="divide-y divide-stroke/40 dark:divide-strokedark/40">
                          {servisList.map((item, idx) => (
                            <div key={idx} className="py-2 flex items-center justify-between text-xs">
                              <div>
                                <span className="font-medium text-black dark:text-white block">
                                  {item["item"]}
                                </span>
                                <span className="text-[10px] text-body dark:text-bodydark">
                                  {item["id_register"]}
                                </span>
                              </div>
                              <span className="rounded-md bg-gray-100 dark:bg-meta-4 px-2 py-0.5 font-bold text-black dark:text-white">
                                {item["quantity"]}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Gallery Images */}
                    {galleryList.length > 0 && (
                      <div className="rounded-2xl border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark">
                        <span className="text-xs font-bold uppercase tracking-wider text-black dark:text-white block mb-2">
                          Foto Dokumentasi
                        </span>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                          {galleryList.map((item, idx) => (
                            <div
                              key={idx}
                              className="relative h-28 w-36 shrink-0 overflow-hidden rounded-xl border border-stroke dark:border-strokedark"
                            >
                              <img
                                alt="Gallery"
                                className="h-full w-full object-cover"
                                src={`${IMAGE_GALLERY}/${item["Image_Name"]}`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              /* ================= ASSET OVERVIEW & HISTORY VIEW ================= */
              <div className="space-y-4 p-4">
                {/* Hero Asset Card */}
                <div className="overflow-hidden rounded-2xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark">
                  {/* Asset Photo Banner */}
                  <div className="relative h-52 w-full bg-gray-100 dark:bg-meta-4">
                    {dataAsset.Image ? (
                      <img
                        alt="Asset"
                        className="h-full w-full object-cover"
                        src={`${IMAGE_ASSET}/${dataAsset.Image}`}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-body dark:text-bodydark">
                        <HiSparkles className="text-3xl opacity-30" />
                        <span className="ml-2 text-sm opacity-50">Belum ada foto aset</span>
                      </div>
                    )}

                    {/* Camera Trigger Buttons (Overlay Top Right) */}
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <button
                        type="button"
                        title="Foto Aset"
                        onClick={() => {
                          setCameraResult("asset_image");
                          setGlobalIdAsset(dataAsset.ID_Asset);
                          router.push("/camera");
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/70 shadow transition-colors"
                      >
                        <MdOutlinePhotoCamera className="text-lg" />
                      </button>
                      <button
                        type="button"
                        title="Foto User"
                        onClick={() => {
                          setCameraResult("asset_user");
                          setGlobalIdAsset(dataAsset.ID_Asset);
                          router.push("/camera");
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/70 shadow transition-colors"
                      >
                        <MdOutlinePhotoCameraFront className="text-lg" />
                      </button>
                    </div>

                    {/* Gradient Overlay for Readable Text */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Asset Title Bottom Overlay */}
                    <div className="absolute bottom-3 left-3 right-20 text-white">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-primary px-2 py-0.5 font-mono text-xs font-bold">
                          {dataAsset.ID_Asset}
                        </span>
                        <span className="rounded-md bg-white/20 px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm">
                          {dataAsset.Type}
                        </span>
                      </div>
                      <h2 className="mt-1 text-base font-bold leading-tight drop-shadow">
                        {dataAsset.Description || "Tanpa Deskripsi"}
                      </h2>
                      <p className="text-xs text-white/80">
                        {dataAsset.Manufacture} {dataAsset.Model ? `• ${dataAsset.Model}` : ""}
                      </p>
                    </div>

                    {/* User Avatar Badge (Bottom Right) */}
                    <div className="absolute bottom-3 right-3">
                      <div className="h-13 w-13 rounded-full border-2 border-white shadow-lg overflow-hidden bg-white dark:bg-boxdark flex items-center justify-center">
                        {dataAsset.Profile_Image ? (
                          <img
                            alt="User"
                            className="h-full w-full object-cover"
                            src={`${IMAGE_USER}/${dataAsset.Profile_Image}`}
                          />
                        ) : (
                          <HiOutlineUser className="text-2xl text-body dark:text-bodydark" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Asset Key Attributes & Status */}
                  <div className="p-4 space-y-3">
                    {/* Status Pill */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-body dark:text-bodydark">Status Kesiapan</span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
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
                          : "Siap Digunakan (Ready)"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-2 rounded-xl bg-gray-50 dark:bg-meta-4/20 p-2.5">
                        <HiUser className="text-base text-primary shrink-0" />
                        <div className="min-w-0">
                          <span className="block text-[10px] text-body dark:text-bodydark">Penanggung Jawab</span>
                          <span className="font-semibold text-black dark:text-white truncate block">
                            {dataAsset.User || "-"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 rounded-xl bg-gray-50 dark:bg-meta-4/20 p-2.5">
                        <HiLocationMarker className="text-base text-meta-5 shrink-0" />
                        <div className="min-w-0">
                          <span className="block text-[10px] text-body dark:text-bodydark">Lokasi Unit</span>
                          <span className="font-semibold text-black dark:text-white truncate block">
                            {dataAsset.Location || "-"}
                          </span>
                        </div>
                      </div>

                      {dataAsset.Type === "K" && dataAsset.Based === "KM" && (
                        <div className="flex items-center gap-2 rounded-xl bg-gray-50 dark:bg-meta-4/20 p-2.5">
                          <BsFillFuelPumpFill className="text-base text-warning shrink-0" />
                          <div className="min-w-0">
                            <span className="block text-[10px] text-body dark:text-bodydark">Bahan Bakar</span>
                            <span className="font-semibold text-black dark:text-white truncate block">
                              {lastSeen || "-"} ({ratio || "-"})
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 rounded-xl bg-gray-50 dark:bg-meta-4/20 p-2.5">
                        <FaCalendarAlt className="text-base text-meta-3 shrink-0" />
                        <div className="min-w-0">
                          <span className="block text-[10px] text-body dark:text-bodydark">Jadwal Servis Berikut</span>
                          <span className="font-semibold text-black dark:text-white truncate block">
                            {nextService || "-"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Triggers: Request Perbaikan & Request Perawatan */}
                    <div className="flex items-center gap-2 pt-2 border-t border-stroke/60 dark:border-strokedark/60">
                      {/* Request Perbaikan (Corrective) */}
                      {openService !== 1 && parseInt(userLevel) === 4 && (
                        <button
                          type="button"
                          onClick={() => setModalPerbaikan(true)}
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-danger py-2.5 px-3 text-xs font-semibold text-white shadow-sm hover:bg-opacity-90 active:scale-[0.99] transition-all"
                        >
                          <MdMedicalServices className="text-base" />
                          <span>Lapor Kerusakan</span>
                        </button>
                      )}

                      {/* Request Perawatan (Preventive) */}
                      {openMaintenance !== 1 &&
                        (parseInt(userLevel) <= 2 ||
                          (dataAsset.Type === "K" && dataAsset.Based === "KM" && parseInt(userLevel) === 4)) && (
                          <button
                            type="button"
                            disabled={onloadRequestPerawatan}
                            onClick={() => {
                              if (dataAsset.Type === "K") {
                                setModalPerawatan(true);
                              } else {
                                create_maintenance(dataAsset.ID_Asset);
                              }
                            }}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-meta-3 py-2.5 px-3 text-xs font-semibold text-white shadow-sm hover:bg-opacity-90 active:scale-[0.99] transition-all"
                          >
                            <RiCalendarScheduleFill className="text-base" />
                            <span>
                              {onloadRequestPerawatan ? "Mengirim..." : "Jadwalkan Perawatan"}
                            </span>
                          </button>
                        )}
                    </div>
                  </div>
                </div>

                {/* 1. DATA PERBAIKAN: Riwayat Pengerjaan & Perbaikan (F.BFNM.026/0) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-black dark:text-white">
                        Riwayat Perbaikan & Servis
                      </h3>
                      <span className="text-[11px] text-body dark:text-bodydark">
                        Total {dataService.length} catatan pengerjaan (F.BFNM.026/0)
                      </span>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <CommonInput
                      placeholder="Cari keluhan atau nomor tiket..."
                      input={keyword}
                      onInputChange={(val) => setKeyword(val)}
                      onKeyChange={() => setKeywordError(false)}
                      error={keywordError}
                      type="text"
                    >
                      <HiSearch className="text-body dark:text-bodydark" />
                    </CommonInput>
                  </div>

                  {/* List of Tickets */}
                  <div className="space-y-2.5">
                    {secondLoading ? (
                      <div className="flex justify-center py-10">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      </div>
                    ) : filteredDataService.length === 0 ? (
                      <div className="rounded-2xl border border-stroke bg-white p-8 text-center dark:border-strokedark dark:bg-boxdark">
                        <span className="text-xs text-body dark:text-bodydark">
                          Tidak ada riwayat perbaikan yang ditemukan.
                        </span>
                      </div>
                    ) : (
                      filteredDataService.map((item, index) => {
                        const cardStatus = RepairStatus(item["Step"]);
                        return (
                          <div
                            key={index}
                            onClick={() => {
                              setSwitchPage(true);
                              fetch_detail_service(item["ID_Request"]);
                              localStorage.setItem("selected_idRequest", item["ID_Request"]);
                            }}
                            className="group cursor-pointer rounded-2xl border border-stroke bg-white p-3.5 shadow-sm hover:border-primary hover:shadow dark:border-strokedark dark:bg-boxdark dark:hover:border-primary transition-all active:scale-[0.99]"
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-xs font-bold text-black dark:text-white">
                                  {item["ID_Request"]}
                                </span>
                                {item["Maintenance_Type"] === "PM" && (
                                  <span className="rounded-md bg-meta-3/15 px-1.5 py-0.5 text-[10px] font-semibold text-meta-3">
                                    PM Rutin
                                  </span>
                                )}
                              </div>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold text-white ${
                                  cardStatus.color || "bg-primary"
                                }`}
                              >
                                {cardStatus.status}
                              </span>
                            </div>

                            <p className="text-xs font-medium text-black dark:text-white line-clamp-2 mb-2">
                              {item["Problem"]}
                            </p>

                            <div className="flex items-center justify-between border-t border-stroke/50 pt-2 text-[11px] text-body dark:border-strokedark/50 dark:text-bodydark">
                              <div className="flex items-center gap-1">
                                <HiOutlineUser className="text-xs" />
                                <span>{item["Requestor"]}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <HiOutlineClock className="text-xs" />
                                <span>{formatDateTime(item["Time_Request"])}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}

                    {showLoadMore && (
                      <button
                        type="button"
                        onClick={() => setItemPerPage((prev) => prev + 5)}
                        className="w-full rounded-xl border border-stroke bg-white py-2.5 text-center text-xs font-semibold text-primary shadow-sm hover:bg-gray-50 dark:border-strokedark dark:bg-boxdark dark:hover:bg-meta-4/30 transition-colors"
                      >
                        Muat Lebih Banyak...
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. PEMAKAIAN SUKU CADANG & PERKIRAAN KEBUTUHAN MESIN (Mobile) */}
                <div className="space-y-3">
                  {/* Card 0: Tren Biaya Maintenance & Analisis Cost */}
                  <div className="rounded-2xl border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark">
                    <div className="flex items-center justify-between border-b border-stroke/60 pb-2.5 dark:border-strokedark/60 mb-3">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white flex items-center gap-1.5">
                          <HiOutlineChartBar className="text-primary text-base" />
                          Tren Biaya Pemeliharaan (Cost)
                        </h3>
                        <p className="text-[10px] text-body dark:text-bodydark">
                          Biaya suku cadang & servis mesin ini per bulan
                        </p>
                      </div>
                      <span className="font-mono text-xs font-bold text-primary">
                        Rp{" "}
                        {Number(
                          partsUsage.summary?.grand_total_cost || 0,
                        ).toLocaleString("id-ID")}
                      </span>
                    </div>

                    <AssetMaintenanceCostChart
                      costTrend={partsUsage.cost_trend || []}
                      summary={partsUsage.summary || {}}
                    />
                  </div>

                  {/* Card 1: Perkiraan Kebutuhan Suku Cadang Rutin Mesin (Tabel & Paginasi 10/hal) */}
                  <div className="rounded-2xl border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark">
                    <div className="flex items-center justify-between border-b border-stroke/60 pb-2.5 dark:border-strokedark/60 mb-3">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white flex items-center gap-1.5">
                          <HiOutlineWrenchScrewdriver className="text-primary text-base" />
                          Kebutuhan Part Rutin Mesin
                        </h3>
                        <p className="text-[10px] text-body dark:text-bodydark">
                          Estimasi kebutuhan part rutin mesin ini
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                          {routineItems.length} part
                        </span>
                      </div>
                    </div>

                    {routineItems.length === 0 ? (
                      <div className="py-4 text-center text-xs text-body dark:text-bodydark">
                        Belum ada riwayat pemakaian suku cadang pada unit ini.
                      </div>
                    ) : (
                      <>
                        <div className="overflow-x-auto">
                          <table className="w-full table-auto text-left text-xs">
                            <thead>
                              <tr className="border-b border-stroke bg-gray-50 text-body dark:border-strokedark dark:bg-meta-4/20 dark:text-bodydark">
                                <th className="py-2 px-2.5 font-semibold text-center w-8">No</th>
                                <th className="py-2 px-2.5 font-semibold">Part / Kode</th>
                                <th className="py-2 px-2.5 font-semibold text-center">Total</th>
                                <th className="py-2 px-2.5 font-semibold text-center">Laju/Bln</th>
                                <th className="py-2 px-2.5 font-semibold text-center">Est/Bln</th>
                                <th className="py-2 px-2.5 font-semibold text-center">Stok</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stroke dark:divide-strokedark">
                              {displayedRoutineItems.map((part, pIdx) => {
                                const isWarehouseReady = Number(part.available || 0) >= Number(part.recommended_monthly_stock || 1);
                                const rowNumber = (routinePage - 1) * 10 + pIdx + 1;
                                return (
                                  <tr
                                    key={part.id_part || pIdx}
                                    onClick={() => router.push(`/parts/${part.id_part}`)}
                                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-meta-4/10 transition-colors"
                                  >
                                    <td className="py-2 px-2.5 text-center text-body dark:text-bodydark font-mono text-[11px]">
                                      {rowNumber}
                                    </td>
                                    <td className="py-2 px-2.5">
                                      <span className="font-mono text-[10px] font-bold text-primary block truncate max-w-[120px]">
                                        {part.vendor_code || part.id_part}
                                      </span>
                                      <span className="font-semibold text-[11px] text-black dark:text-white truncate block max-w-[120px]">
                                        {part.description}
                                      </span>
                                    </td>
                                    <td className="py-2 px-2.5 text-center whitespace-nowrap font-mono font-bold text-[11px] text-black dark:text-white">
                                      {part.total_qty} {part.unit}
                                    </td>
                                    <td className="py-2 px-2.5 text-center whitespace-nowrap font-mono font-bold text-[11px] text-meta-5">
                                      ~{part.monthly_rate}
                                    </td>
                                    <td className="py-2 px-2.5 text-center whitespace-nowrap font-mono font-bold text-[11px] text-primary">
                                      {part.recommended_monthly_stock} {part.unit}
                                    </td>
                                    <td className="py-2 px-2.5 text-center whitespace-nowrap">
                                      <span className={`inline-block rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                                        isWarehouseReady ? "bg-success/15 text-success" : "bg-danger/15 text-danger"
                                      }`}>
                                        {part.available}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Pagination Part Rutin Mobile */}
                        {routineTotalPages > 1 && (
                          <div className="flex items-center justify-between pt-2.5 border-t border-stroke/60 dark:border-strokedark/60 text-[11px] mt-2">
                            <span className="text-body dark:text-bodydark">
                              Hal {routinePage} / {routineTotalPages}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                disabled={routinePage === 1}
                                onClick={() => setRoutinePage((prev) => Math.max(1, prev - 1))}
                                className="rounded-lg border border-stroke px-2 py-1 text-[11px] font-semibold disabled:opacity-40 dark:border-strokedark"
                              >
                                Prev
                              </button>
                              <button
                                type="button"
                                disabled={routinePage === routineTotalPages}
                                onClick={() => setRoutinePage((prev) => Math.min(routineTotalPages, prev + 1))}
                                className="rounded-lg border border-stroke px-2 py-1 text-[11px] font-semibold disabled:opacity-40 dark:border-strokedark"
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Card 2: Riwayat Pemakaian Part per Bulan (Dropdown Bulan & Paginasi 10/hal) */}
                  <div className="rounded-2xl border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark">
                    <div className="flex flex-col gap-2 border-b border-stroke/60 pb-2.5 dark:border-strokedark/60 mb-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white flex items-center gap-1.5">
                          <HiOutlineCalendar className="text-meta-5 text-base" />
                          Riwayat Pemakaian Part
                        </h3>
                        <span className="text-[10px] text-body dark:text-bodydark">
                          {currentFilteredHistory.length} transaksi
                        </span>
                      </div>

                      {/* Dropdown Bulan */}
                      <select
                        value={selectedUsageMonth}
                        onChange={(e) => {
                          setSelectedUsageMonth(e.target.value);
                          setHistoryPage(1);
                        }}
                        className="w-full rounded-xl border border-stroke bg-gray-50 px-3 py-1.5 text-xs font-semibold text-black outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4/20 dark:text-white transition-colors cursor-pointer"
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

                    {/* Table of Monthly Parts Consumed Mobile */}
                    {displayedHistoryItems.length === 0 ? (
                      <div className="py-4 text-center text-xs text-body dark:text-bodydark">
                        Tidak ada riwayat pemakaian pada bulan ini.
                      </div>
                    ) : (
                      <>
                        <div className="overflow-x-auto">
                          <table className="w-full table-auto text-left text-xs">
                            <thead>
                              <tr className="border-b border-stroke bg-gray-50 text-body dark:border-strokedark dark:bg-meta-4/20 dark:text-bodydark">
                                <th className="py-2 px-2.5 font-semibold text-center w-8">No</th>
                                <th className="py-2 px-2.5 font-semibold">Tanggal / Part</th>
                                <th className="py-2 px-2.5 font-semibold text-center">Jumlah</th>
                                <th className="py-2 px-2.5 font-semibold text-right">Biaya</th>
                                <th className="py-2 px-2.5 font-semibold">Tiket</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stroke dark:divide-strokedark">
                              {displayedHistoryItems.map((item, idx) => {
                                const rowNumber = (historyPage - 1) * 10 + idx + 1;
                                return (
                                  <tr
                                    key={idx}
                                    onClick={() => router.push(`/parts/${item.id_part}`)}
                                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-meta-4/10 transition-colors"
                                  >
                                    <td className="py-2 px-2.5 text-center text-body dark:text-bodydark font-mono text-[11px]">
                                      {rowNumber}
                                    </td>
                                    <td className="py-2 px-2.5">
                                      <span className="text-[10px] text-body dark:text-bodydark block">
                                        {formatDateLocal(item.date)}
                                      </span>
                                      <span className="font-semibold text-xs text-black dark:text-white block truncate max-w-[140px]">
                                        {item.description}
                                      </span>
                                      <span className="font-mono text-[10px] text-primary block truncate max-w-[140px]">
                                        {item.vendor_code || item.id_part}
                                      </span>
                                    </td>
                                    <td className="py-2 px-2.5 text-center font-bold text-warning whitespace-nowrap text-xs font-mono">
                                      -{item.qty} {item.unit || "pcs"}
                                    </td>
                                    <td className="py-2 px-2.5 text-right font-bold text-black dark:text-white whitespace-nowrap text-xs font-mono">
                                      {item.total_cost > 0
                                        ? `Rp ${Number(item.total_cost).toLocaleString("id-ID")}`
                                        : "-"}
                                    </td>
                                    <td className="py-2 px-2.5 font-mono text-[10px] text-body dark:text-bodydark whitespace-nowrap">
                                      #{item.id_for}
                                    </td>
                                  </tr>
                                );
                              })}

                              {selectedUsageMonth !== "ALL" && (
                                <tr className="bg-primary/5 font-bold dark:bg-primary/10 border-t-2 border-primary/20">
                                  <td
                                    colSpan={2}
                                    className="py-2 px-2.5 text-right font-bold text-black dark:text-white text-[11px]"
                                  >
                                    Total Bulan Ini:
                                  </td>
                                  <td className="py-2 px-2.5 text-center font-mono text-warning font-bold text-xs">
                                    -
                                    {currentFilteredHistory.reduce(
                                      (acc, it) => acc + (Number(it.qty) || 0),
                                      0,
                                    )}
                                  </td>
                                  <td className="py-2 px-2.5 text-right font-mono text-primary font-bold text-xs whitespace-nowrap">
                                    Rp{" "}
                                    {currentFilteredHistory
                                      .reduce(
                                        (acc, it) => acc + (Number(it.total_cost) || 0),
                                        0,
                                      )
                                      .toLocaleString("id-ID")}
                                  </td>
                                  <td></td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* Pagination Riwayat Pemakaian Mobile */}
                        {historyTotalPages > 1 && (
                          <div className="flex items-center justify-between pt-2.5 border-t border-stroke/60 dark:border-strokedark/60 text-[11px] mt-2">
                            <span className="text-body dark:text-bodydark">
                              Hal {historyPage} / {historyTotalPages}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                disabled={historyPage === 1}
                                onClick={() => setHistoryPage((prev) => Math.max(1, prev - 1))}
                                className="rounded-lg border border-stroke px-2 py-1 text-[11px] font-semibold disabled:opacity-40 dark:border-strokedark"
                              >
                                Prev
                              </button>
                              <button
                                type="button"
                                disabled={historyPage === historyTotalPages}
                                onClick={() => setHistoryPage((prev) => Math.min(historyTotalPages, prev + 1))}
                                className="rounded-lg border border-stroke px-2 py-1 text-[11px] font-semibold disabled:opacity-40 dark:border-strokedark"
                              >
                                Next
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
          </div>
        )}

        {/* Modal Perbaikan (Corrective Request) */}
        <CustomModal
          isVisible={modalPerbaikan}
          isSmallWidth="sm"
          onClose={() => setModalPerbaikan(false)}
        >
          <div className="space-y-4">
            <div>
              <h4 className="text-base font-bold text-black dark:text-white">
                Permohonan Perbaikan
              </h4>
              <p className="text-xs text-body dark:text-bodydark">
                Uraikan masalah atau gejala kerusakan yang terjadi pada aset.
              </p>
            </div>
            <CommonTextArea
              placeholder="Deskripsi kerusakan/gejala..."
              input={inputRequestPerbaikan}
              error={inputRequestPerbaikanError}
              errorMessage="Deskripsi wajib diisi"
              onInputChange={(val) => setInputRequestPerbaikan(val)}
              onChg={() => setInputRequestPerbaikanError(false)}
            />
            <CommonButtonFull
              label="Kirim Laporan Kerusakan"
              disabled={onloadRequestPerbaikan}
              onload={onloadRequestPerbaikan}
              onClick={async () => {
                if (!inputRequestPerbaikan.trim()) {
                  setInputRequestPerbaikanError(true);
                  return;
                }
                setInputRequestPerbaikanError(false);
                setOnloadRequestPerbaikan(true);
                try {
                  const res = await axios.post("/api/createservice", {
                    idAsset: idAsset,
                    problem: inputRequestPerbaikan,
                    uid: uid,
                  });
                  if (res.data?.error === 1) {
                    NotifyError(res.data.message);
                  } else {
                    NotifySuccess(res.data.message || "Laporan terkirim");
                    setModalPerbaikan(false);
                    setInputRequestPerbaikan("");
                    fetch_data();
                    fetch_data_service();
                  }
                } catch (e) {
                  NotifyError("Gagal mengirim laporan kerusakan");
                } finally {
                  setOnloadRequestPerbaikan(false);
                }
              }}
            />
          </div>
        </CustomModal>

        {/* Modal Perawatan KM Kendaraan */}
        <CustomModal
          isVisible={modalPerawatan}
          isSmallWidth="sm"
          onClose={() => setModalPerawatan(false)}
        >
          <div className="space-y-4">
            <div>
              <h4 className="text-base font-bold text-black dark:text-white">
                Jadwalkan Perawatan Kendaraan
              </h4>
              <p className="text-xs text-body dark:text-bodydark">
                Masukkan angka odometer (KM) kendaraan saat ini.
              </p>
            </div>
            <CommonInput
              placeholder="Contoh: 45000"
              input={inputKM}
              type="number"
              error={inputKMError}
              errorMessage="KM saat ini wajib diisi"
              onInputChange={(val) => setInputKM(val)}
              onChg={() => setInputKMError(false)}
            />
            <CommonButtonFull
              label="Kirim Pengajuan Perawatan"
              disabled={onloadRequestPerawatan}
              onload={onloadRequestPerawatan}
              onClick={async () => {
                if (!inputKM.trim()) {
                  setInputKMError(true);
                  return;
                }
                setInputKMError(false);
                setOnloadRequestPerawatan(true);
                try {
                  const res = await axios.post("/api/createvehiclemaintenance", {
                    idAsset: idAsset,
                    km: inputKM,
                    uid: uid,
                  });
                  if (res.data?.error === 1) {
                    NotifyError(res.data.message);
                  } else {
                    NotifySuccess(res.data.message || "Perawatan dijadwalkan");
                    setModalPerawatan(false);
                    setInputKM("");
                    fetch_data();
                    fetch_data_service();
                  }
                } catch (e) {
                  NotifyError("Gagal mengirim pengajuan perawatan");
                } finally {
                  setOnloadRequestPerawatan(false);
                }
              }}
            />
          </div>
        </CustomModal>

        {/* Modal Terima Spare Part */}
        <CustomModal
          isVisible={modalReceivePart}
          isSmallWidth="sm"
          onClose={() => setModalReceivePart(false)}
        >
          <div className="space-y-4">
            <div>
              <h4 className="text-base font-bold text-black dark:text-white">
                Konfirmasi Kedatangan Spare Part
              </h4>
              <p className="text-xs text-body dark:text-bodydark">
                Tentukan tanggal dan jam penerimaan suku cadang.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <CommonInput
                type="date"
                input={currentDate}
                onInputChange={(val) => setCurrentDate(val)}
                error={currentDateError}
                errorMessage="Wajib"
                onChg={() => setCurrentDateError(false)}
              />
              <CommonInput
                type="time"
                input={currentTime}
                onInputChange={(val) => setCurrentTime(val)}
                error={currentTimeError}
                errorMessage="Wajib"
                onChg={() => setCurrentTimeError(false)}
              />
            </div>
            <CommonButtonFull
              label="Simpan Konfirmasi"
              onClick={() => {
                let hasErr = false;
                if (!currentDate) {
                  setCurrentDateError(true);
                  hasErr = true;
                }
                if (!currentTime) {
                  setCurrentTimeError(true);
                  hasErr = true;
                }
                if (!hasErr) {
                  setReceiveDateTime(`${currentDate} ${currentTime}`);
                  setModalReceivePart(false);
                  setCaseLoaderCompleted(true);
                  setUpdatedStep("receive_part");
                }
              }}
            />
          </div>
        </CustomModal>

        {/* Edit Asset Modal Mobile */}
        <CustomModal
          isVisible={openEditAssetModalState}
          isSmallWidth="lg"
          onClose={() => setOpenEditAssetModalState(false)}
        >
          <div className="flex items-center justify-between border-b border-stroke px-4 py-3 dark:border-strokedark">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-black dark:text-white flex items-center gap-1.5">
                <HiOutlinePencilSquare className="text-primary text-base" />
                Edit Data & Foto #{dataAsset.ID_Asset}
              </h3>
              <span className="text-[11px] text-body dark:text-bodydark">
                Perbarui data unit atau ambil foto aset & foto user
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOpenEditAssetModalState(false)}
              className="text-body hover:text-black dark:text-bodydark dark:hover:text-white p-1"
            >
              <MdOutlineClose className="text-lg" />
            </button>
          </div>

          <div className="p-4 space-y-4 overflow-y-auto max-h-[75vh] text-xs">
            {/* 1. JIKA KAMERA SEDANG AKTIF: TAMPILKAN LIVE WEBCAM VIEWFINDER */}
            {isCameraActive ? (
              <div className="relative overflow-hidden rounded-2xl border-2 border-primary/60 bg-black shadow-lg p-2 space-y-2">
                <div className="flex items-center justify-between text-white text-xs px-2 py-1">
                  <span className="font-bold flex items-center gap-1.5">
                    <HiOutlineCamera className="text-primary text-base" />
                    Kamera: {cameraTarget === "asset" ? "Foto Aset" : "Foto Pemegang"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCameraActive(false)}
                    className="rounded-lg bg-white/20 hover:bg-white/30 px-2 py-1 text-[11px] transition-colors"
                  >
                    Tutup
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
                      NotifyError("Izin kamera ditolak. Silakan pilih berkas.");
                      setIsCameraActive(false);
                    }}
                    className="w-full h-56 sm:h-64 object-cover"
                  />

                  {/* Framing Guide */}
                  <div className="absolute inset-3 pointer-events-none rounded-xl border border-white/30 border-dashed flex items-center justify-center">
                    <span className="text-[10px] font-medium text-white/80 bg-black/50 px-2.5 py-1 rounded-full backdrop-blur-sm">
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
                    <span>Putar</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCapturePhoto}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-md transition-all active:scale-95"
                  >
                    <div className="h-3 w-3 rounded-full border-2 border-white bg-white/30" />
                    <span>Jepret Foto</span>
                  </button>
                </div>
              </div>
            ) : (
              /* 2. DUA KARTU FOTO: FOTO ASET DAN FOTO PEMEGANG / USER */
              <div className="grid grid-cols-1 gap-3">
                {/* Foto Aset */}
                <div className="rounded-xl border border-stroke p-3 dark:border-strokedark bg-gray-50/50 dark:bg-meta-4/10">
                  <span className="block text-[11px] font-bold text-black dark:text-white mb-2">
                    Foto Unit Aset
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="relative h-18 w-18 rounded-xl border border-stroke dark:border-strokedark overflow-hidden bg-white dark:bg-boxdark flex items-center justify-center shrink-0 shadow-sm">
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

                    <div className="flex-1 space-y-1.5">
                      <button
                        type="button"
                        onClick={() => handleStartCamera("asset")}
                        className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors"
                      >
                        <HiOutlineCamera className="text-sm" />
                        <span>Ambil dari Kamera</span>
                      </button>

                      <label className="w-full inline-flex items-center justify-center gap-1.5 cursor-pointer rounded-xl border border-stroke bg-white px-2.5 py-1.5 text-xs font-semibold text-body hover:bg-gray-100 dark:border-strokedark dark:bg-boxdark dark:text-bodydark dark:hover:bg-meta-4 transition-colors">
                        <HiOutlinePhoto className="text-sm" />
                        <span>Pilih Berkas Galeri</span>
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
                <div className="rounded-xl border border-stroke p-3 dark:border-strokedark bg-gray-50/50 dark:bg-meta-4/10">
                  <span className="block text-[11px] font-bold text-black dark:text-white mb-2">
                    Foto Pemegang / User
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="relative h-18 w-18 rounded-full border border-stroke dark:border-strokedark overflow-hidden bg-white dark:bg-boxdark flex items-center justify-center shrink-0 shadow-sm">
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

                    <div className="flex-1 space-y-1.5">
                      <button
                        type="button"
                        onClick={() => handleStartCamera("user")}
                        className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-meta-5 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-meta-5/90 transition-colors"
                      >
                        <HiOutlineCamera className="text-sm" />
                        <span>Ambil dari Kamera</span>
                      </button>

                      <label className="w-full inline-flex items-center justify-center gap-1.5 cursor-pointer rounded-xl border border-stroke bg-white px-2.5 py-1.5 text-xs font-semibold text-body hover:bg-gray-100 dark:border-strokedark dark:bg-boxdark dark:text-bodydark dark:hover:bg-meta-4 transition-colors">
                        <HiOutlinePhoto className="text-sm" />
                        <span>Pilih Berkas Galeri</span>
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
            <div className="space-y-3">
              <div>
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

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-body dark:text-bodydark mb-1">
                    Manufaktur / Brand
                  </label>
                  <CommonInput
                    input={editManufacture}
                    type="text"
                    placeholder="Brand..."
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
                    placeholder="Model..."
                    onInputChange={(val) => setEditModel(val)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-body dark:text-bodydark mb-1">
                    No. Polisi / No. Unit
                  </label>
                  <CommonInput
                    input={editNo}
                    type="text"
                    placeholder="No. Polisi..."
                    onInputChange={(val) => setEditNo(val)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-body dark:text-bodydark mb-1">
                    Lokasi / Area
                  </label>
                  <CommonInput
                    input={editLocation}
                    type="text"
                    placeholder="Lokasi..."
                    onInputChange={(val) => setEditLocation(val)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-body dark:text-bodydark mb-1">
                    Penanggung Jawab / User
                  </label>
                  <CommonInput
                    input={editUser}
                    type="text"
                    placeholder="User..."
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
                    placeholder="Kategori..."
                    onInputChange={(val) => setEditPMCategory(val)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-body dark:text-bodydark mb-1">
                    Kapasitas
                  </label>
                  <CommonInput
                    input={editCapacity}
                    type="text"
                    placeholder="Kapasitas..."
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
                    placeholder="Power..."
                    onInputChange={(val) => setEditPower(val)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-body dark:text-bodydark mb-1">
                    Tegangan (Voltage)
                  </label>
                  <CommonInput
                    input={editVoltage}
                    type="text"
                    placeholder="Voltage..."
                    onInputChange={(val) => setEditVoltage(val)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-body dark:text-bodydark mb-1">
                    Tahun Pembuatan
                  </label>
                  <CommonInput
                    input={editYear}
                    type="text"
                    placeholder="Tahun..."
                    onInputChange={(val) => setEditYear(val)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-body dark:text-bodydark mb-1">
                  Nomor Seri (Serial No)
                </label>
                <CommonInput
                  input={editSerial}
                  type="text"
                  placeholder="Serial number pabrik..."
                  onInputChange={(val) => setEditSerial(val)}
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 border-t border-stroke px-4 py-3 dark:border-strokedark bg-gray-50/50 dark:bg-meta-4/20">
            <button
              type="button"
              disabled={savingAsset}
              onClick={() => setOpenEditAssetModalState(false)}
              className="rounded-xl border border-stroke px-3 py-2 text-xs font-semibold text-body hover:bg-gray-100 dark:border-strokedark dark:text-bodydark dark:hover:bg-meta-4 transition-all"
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
      </div>
    </UserAuth>
  );
}
