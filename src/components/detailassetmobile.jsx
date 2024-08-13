"use client";
import { Appbar } from "@/components/appbar";
import UserAuth from "@/components/auth";
import Loader from "@/components/common/Loader";
import { CommonInput, CommonTextArea } from "@/components/input";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import {
  API_URL,
  IMAGE_ASSET,
  IMAGE_USER,
  IMAGE_GALLERY,
} from "@/utils/constant";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { HiAcademicCap, HiLocationMarker, HiSearch } from "react-icons/hi";
import {
  HiArrowLeft,
  HiCalendar,
  HiCamera,
  HiOutlineUser,
  HiUser,
} from "react-icons/hi2";
import {
  MdMedicalServices,
  MdOutlineClose,
  MdOutlineMiscellaneousServices,
} from "react-icons/md";
import { useMediaQuery } from "react-responsive";
import { formatDateTime } from "@/utils/dateformat";
import paginateData from "@/utils/pagination";
import { IoTime, IoTimeOutline } from "react-icons/io5";
import DetailAssetWeb from "@/components/detailassetweb";
import { ProgressCard, ProgressSummary } from "@/components/card";
import Image from "next/image";
import { CommonLoader, PageLoader } from "./loader";
import { CommonButton, CommonButtonFull } from "./button";
import { NotifyError, NotifySuccess } from "@/utils/notify";
import { RepairStatus } from "@/utils/repairstatus";
import { CiEdit } from "react-icons/ci";
import { FaCheckSquare } from "react-icons/fa";
import { CustomModal } from "./modal";
import { RiCalendarScheduleFill } from "react-icons/ri";

export default function DetailAssetMobile({ idAsset }) {
  //params.idAsset
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  const [dataAsset, setDataAsset] = useState({});
  const [dataService, setDataService] = useState([]);
  const [firstLoading, setFirstLoading] = useState(true);
  const [secondLoading, setSecondLoading] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [keywordError, setKeywordError] = useState(false);
  const [switchPage, setSwitchPage] = useState(false);
  const [selectedCase, setSelectedCase] = useState([]);

  const [itemPerPage, setItemPerPage] = useState(5);
  const [filteredDataService, setFilteredDataService] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(0);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [partList, setPartList] = useState([]);
  const [galleryList, setGalleryList] = useState([]);
  const [caseLoaderReceived, setCaseLoaderReceived] = useState(false);
  const [caseLoaderOrder, setCaseLoaderOrder] = useState(false);
  const [caseLoaderCompleted, setCaseLoaderCompleted] = useState(false);
  const [caseLoaderPart, setCaseLoaderPart] = useState(false);
  const [caseLoaderChecked, setCaseLoaderChecked] = useState(false);
  const [caseLoaderAccepted, setCaseLoaderAccepted] = useState(false);
  const [pmList, setpmList] = useState([]);
  const [pmTempList, setpmTempList] = useState([]);
  const [pmEditMode, setpmEditMode] = useState(false);

  const [caseSolution, setCaseSolution] = useState("");
  const [showSolution, setShowSolution] = useState("");
  const [caseSolutionError, setCaseSolutionError] = useState(false);

  const [requestId, setRequestId] = useState("");
  const [updatedStep, setUpdatedStep] = useState("");
  const [onloadPM, setOnloadPM] = useState(false);

  const [responseTime, setResponseTime] = useState("");
  const [repairTime, setRepairTime] = useState("");
  const [onloadRequestService, setOnloadRequestService] = useState(false);

  const [loadDetailService, setLoadDetailService] = useState(false);
  const [modalPerbaikan, setModalPerbaikan] = useState(false);
  const [modalPerawatan, setModalPerawatan] = useState(false);

  const [inputRequestPerbaikan, setInputRequestPerbaikan] = useState("");
  const [inputRequestPerbaikanError, setInputRequestPerbaikanError] =
    useState(false);
  const [onloadRequestPerbaikan, setOnloadRequestPerbaikan] = useState(false);

  const [inputKM, setInputKM] = useState("");
  const [inputKMError, setInputKMError] = useState(false);
  const [onloadRequestPerawatan, setOnloadRequestPerawatan] = useState(false);

  const [test] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);

  const fetch_data = async () => {
    const apiUrl = `${API_URL}/fetchassetdetail`;
    const response = await axios.post(apiUrl, {
      idAsset: idAsset,
    });

    if (response.status == 200) {
      // console.log(response.data["detail"][0].ID_Asset);
      const detail = response.data["detail"][0];
      console.log(detail);
      setDataAsset(detail);
    }
    setFirstLoading(false);
    setSecondLoading(true);
  };

  const fetch_data_service = async () => {
    const apiUrl = `${API_URL}/fetchassetservice`;
    const response = await axios.post(apiUrl, {
      idAsset: idAsset,
      // keyword: keyword,
    });

    if (response.status == 200) {
      const array = response.data["service"];
      console.log(array);

      setDataService(array);
    }
    setSecondLoading(false);
  };

  const fetch_detail_service = async (id) => {
    setLoadDetailService(true);
    //console.log(id);
    const apiUrl = `${API_URL}/fetchdetailservice`;
    const response = await axios.post(apiUrl, {
      idRequest: id,
    });

    if (response.status == 200) {
      const array = response.data["response"][0];
      const parts = response.data["parts"];
      const galleries = response.data["galleries"];
      const respTime = response.data["response_time"];
      const reprTime = response.data["repair_time"];
      setSelectedCase(array);
      setPartList(parts);
      setGalleryList(galleries);
      //console.log(array);
      const checkList = array["new_checklist"];
      setpmList([]);
      setpmTempList([]);
      console.log(response);
      if (checkList != "" && checkList != null) {
        const pmparsed = JSON.parse(checkList);
        setpmList(pmparsed);
        setpmTempList(pmparsed);
      }

      console.log(respTime);
      console.log(reprTime);

      setResponseTime(respTime);
      setRepairTime(reprTime);
    }
    setLoadDetailService(false);
  };

  useEffect(() => {
    fetch_data();
  }, [keyword]);

  useEffect(() => {
    fetch_data_service();
  }, [dataAsset]);

  useEffect(() => {
    const filterService = dataService.filter((item) =>
      item["Problem"].toLowerCase().includes(keyword.toLowerCase()),
    );
    const { data, pageCurrent, pageLast } = paginateData(
      filterService,

      currentPage,
      itemPerPage,
    );
    setFilteredDataService(data);
    setLastPage(pageLast);
    //setItemPerPage(5);
    if (pageCurrent < pageLast) {
      setShowLoadMore(true);
    } else {
      setShowLoadMore(false);
    }
    console.log(data);
    console.log(pageLast);
  }, [keyword, dataService, itemPerPage]);

  useEffect(() => {
    const idRequest = localStorage.getItem("selected_idRequest");
    if (updatedStep != "") {
      do_action(updatedStep, idRequest);
    }
  }, [updatedStep]);

  const do_action = async (step, id_request) => {
    const user = localStorage.getItem("info");
    const parseUser = JSON.parse(user);
    const apiUrl = `${API_URL}/updatecase`;
    const response = await axios.post(apiUrl, {
      idRequest: id_request,
      status: step,
      solution: caseSolution,
      uid: parseUser[0]["Uid"],
    });

    if (response.status == 200) {
      // console.log(response.data["detail"][0].ID_Asset);
      const detail = response.data["response"];
      console.log(detail);
      NotifySuccess(detail);
    }
    fetch_detail_service(id_request);

    setCaseLoaderOrder(false);
    setCaseLoaderCompleted(false);
  };

  useEffect(() => {
    const qr = localStorage.getItem("qrcode_case");
    if (qr != "") {
      localStorage.setItem("qrcode_case", "");
      if (qr != idAsset) {
        NotifyError("Invalid QRCode");
      } else {
        setUpdatedStep("received");
      }
    }
  }, [router]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <UserAuth>
      <div className="relative">
        <div className="absolute z-0 h-full w-full">
          {!firstLoading ? (
            <div className="min-h-screen  justify-center bg-boxdark-2">
              <div className="relative">
                <div className="absolute left-5 top-5 z-30">
                  <div
                    className="rounded-full bg-white p-2"
                    onClick={() => {
                      router.back();
                    }}
                  >
                    <HiArrowLeft className="text-black" />
                  </div>
                </div>

                <div className="absolute left-2 top-40 z-30">
                  <div className="text-lg text-white">{dataAsset.ID_Asset}</div>
                  <div className=" text-white">{`${dataAsset.Description} `}</div>
                  <div className="text-white">{`${dataAsset.Manufacture} `}</div>
                </div>
                <div className="absolute  z-20 w-full p-2">
                  <div className="flex justify-end">
                    <div className="flex flex-col items-center">
                      <div className="m-2 flex h-16 w-16 items-center justify-center rounded-full bg-white">
                        {dataAsset.Profile_Image == null ||
                        dataAsset.Profile_Image == "" ? (
                          <div className="">
                            <HiOutlineUser />
                          </div>
                        ) : (
                          <img
                            className=" h-16 w-16 rounded-full border border-white  object-cover shadow-lg"
                            src={`${IMAGE_USER}/${dataAsset.Profile_Image}`}
                          />
                        )}
                      </div>
                      <div className="mb-2"></div>
                      <div className="m-2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg">
                        <HiCamera className="h-6 w-6"></HiCamera>
                      </div>
                      <div className="m-2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg">
                        <HiCamera className="h-6 w-6"></HiCamera>
                      </div>
                      <div className="m-2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg">
                        <HiCamera className="h-6 w-6"></HiCamera>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="h-[250px] w-full ">
                  {dataAsset.Image == null || dataAsset.Image == "" ? (
                    <div className="flex h-100 items-center justify-center">
                      No Image
                    </div>
                  ) : (
                    <img
                      className="h-[250px] w-full object-cover"
                      src={`${IMAGE_ASSET}/${dataAsset.Image}`}
                    />
                  )}
                </div>
                <div className="bg-form-strokedark">
                  <div className="p-2 text-white">Detail Info</div>
                </div>
                <div className="mb-2"></div>
                <div className="flex flex-row items-center px-2 py-1">
                  <HiUser />
                  <div className="ml-2">{dataAsset.User}</div>
                </div>
                <div className="flex flex-row items-center px-2 py-1">
                  <HiLocationMarker />
                  <div className="ml-2">{dataAsset.Location}</div>
                </div>

                <div className="flex justify-end">
                  <div
                    className="rounded-full bg-white  p-1  text-danger"
                    onClick={() => {
                      setModalPerbaikan(true);
                    }}
                  >
                    <MdMedicalServices className="h-6 w-6" />
                  </div>
                  <div className="mr-5"></div>

                  <div
                    className="rounded-full bg-white p-1 text-warning"
                    onClick={async () => {
                      if (!onloadRequestPerawatan) {
                        if (dataAsset.Type == "K") {
                          //untuk mobil
                          setModalPerawatan(true);
                        } else {
                          setOnloadRequestPerawatan(true);
                          //kirim ke server
                        }
                      }
                    }}
                  >
                    {onloadRequestPerawatan ? (
                      <div
                        className={`h-6 w-6 animate-spin rounded-full border-2 border-solid border-warning border-t-transparent`}
                      ></div>
                    ) : (
                      <RiCalendarScheduleFill className="h-6 w-6" />
                    )}
                  </div>

                  <div className="mr-5"></div>
                </div>

                <div className="mt-2 bg-form-strokedark">
                  <div className="p-2 text-white">Riwayat Perbaikan</div>
                </div>
                {!switchPage ? (
                  <>
                    {
                      <div className="p-2">
                        <CommonInput
                          placeholder={"Search"}
                          input={keyword}
                          onInputChange={(val) => {
                            setKeyword(val);
                          }}
                          onKeyChange={() => {
                            setKeywordError(false);
                          }}
                          error={keywordError}
                          type={"text"}
                        >
                          <HiSearch />
                        </CommonInput>
                      </div>
                    }

                    {filteredDataService.map((item, index) => {
                      const cardStatus = RepairStatus(item["Step"]);
                      const checklist = item["new_checklist"];
                      return (
                        <div
                          onClick={() => {
                            setSwitchPage(true);

                            fetch_detail_service(item["ID_Request"]);
                            localStorage.setItem(
                              "selected_idRequest",
                              item["ID_Request"],
                            );
                          }}
                          className="p-2"
                          key={index}
                        >
                          <div className="flex justify-start">
                            <div>{item["ID_Request"]}</div>
                            {item["Maintenance_Type"] == "PM" ? (
                              <div className="ml-2 flex items-center rounded-lg bg-white px-2 text-xs">
                                Rutin
                              </div>
                            ) : (
                              <></>
                            )}

                            <div
                              className={`ml-2 flex items-center rounded-lg ${cardStatus.color} px-2 text-xs text-white`}
                            >
                              {cardStatus.status}
                            </div>
                          </div>

                          <div className="bg-grey flex flex-row">
                            <div className="flex items-center justify-start">
                              <HiOutlineUser className="mr-2" />
                              <div>{item["Requestor"]}</div>
                            </div>

                            <div className="mr-10"></div>
                            <div className="flex items-center justify-start">
                              <IoTimeOutline className="mr-2" />
                              <div>{formatDateTime(item["Time_Request"])}</div>
                            </div>
                          </div>
                          <div>{item["Problem"]}</div>
                        </div>
                      );
                    })}

                    {showLoadMore ? (
                      <div
                        onClick={() => {
                          const nextItem = itemPerPage + 5;
                          setItemPerPage(nextItem);
                        }}
                        className="flex  cursor-default justify-center py-5 text-white"
                      >
                        Load more..
                      </div>
                    ) : (
                      <></>
                    )}
                  </>
                ) : loadDetailService ? (
                  <div className="mt-10 flex justify-center text-white">
                    Please wait.. fetching data
                  </div>
                ) : (
                  <div>
                    <div
                      className="flex  items-center justify-end p-2 "
                      onClick={() => {
                        setSwitchPage(false);
                      }}
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white">
                        <MdOutlineClose></MdOutlineClose>
                      </div>
                    </div>
                    <div className="mb-2 p-2">
                      {(() => {
                        switch (selectedCase.Step) {
                          case "1":
                            return (
                              <div className=" border p-2">
                                <CommonButtonFull
                                  label={"Terima"}
                                  onClick={() => {
                                    localStorage.setItem("scanner_mode", 1);
                                    router.push("/scanner");
                                  }}
                                  disabled={caseLoaderReceived}
                                  onload={caseLoaderReceived}
                                />
                              </div>
                            );
                          case "2":
                            return (
                              <div className="border p-2">
                                <CommonTextArea
                                  placeholder="Tuliskan solusi untuk permasalahan di bawah"
                                  error={caseSolutionError}
                                  onInputChange={(val) => {
                                    setCaseSolution(val);
                                  }}
                                  onChg={() => {
                                    setCaseSolutionError(false);
                                  }}
                                  errorMessage={"Required"}
                                ></CommonTextArea>

                                <div className=" flex justify-evenly">
                                  <div className="w-full">
                                    <CommonButtonFull
                                      label={"Spare Part"}
                                      onClick={() => {
                                        setCaseLoaderOrder(true);
                                        setUpdatedStep("order_part");
                                      }}
                                      disabled={caseLoaderOrder}
                                      onload={caseLoaderOrder}
                                    ></CommonButtonFull>
                                  </div>
                                  <div className="ml-2"></div>
                                  <div className="w-full">
                                    <CommonButtonFull
                                      label={"Selesai"}
                                      onClick={() => {
                                        if (caseSolution == "") {
                                          setCaseSolutionError(true);
                                        } else {
                                          setCaseLoaderCompleted(true);
                                          setUpdatedStep("completed");
                                        }
                                      }}
                                      disabled={caseLoaderCompleted}
                                      onload={caseLoaderCompleted}
                                    ></CommonButtonFull>
                                  </div>
                                </div>
                              </div>
                            );
                          case "3":
                            return (
                              <div className=" border p-2">
                                <div>
                                  <CommonTextArea
                                    placeholder="Tuliskan solusi untuk permasalahan di bawah"
                                    error={caseSolutionError}
                                    onInputChange={(val) => {
                                      setCaseSolution(val);
                                    }}
                                    onChg={() => {
                                      setCaseSolutionError(false);
                                    }}
                                    errorMessage={"Required"}
                                  ></CommonTextArea>
                                  <div className="mb-1"></div>
                                  <CommonButtonFull
                                    label={"Selesai"}
                                    onClick={() => {
                                      if (caseSolution == "") {
                                        setCaseSolutionError(true);
                                      } else {
                                        setCaseLoaderCompleted(true);
                                        setUpdatedStep("completed");
                                      }
                                    }}
                                    disabled={caseLoaderCompleted}
                                    onload={caseLoaderCompleted}
                                  />
                                </div>
                              </div>
                            );
                          default:
                            return <></>;
                        }
                      })()}
                    </div>

                    <div
                      className="px-2 text-white"
                      onClick={() => {
                        console.log(requestId);
                      }}
                    >
                      Deskripsi
                    </div>
                    <div className="p-2">
                      <div className="bg-form-strokedark p-1 text-white">
                        {selectedCase.Problem}
                      </div>
                    </div>
                    {selectedCase.Solution == "" ? (
                      <></>
                    ) : (
                      <>
                        <div className="p-2 text-white">Tindakan</div>
                        <div className="p-2">
                          <div className="bg-form-strokedark p-1 text-white">
                            {selectedCase.Solution}
                          </div>
                        </div>
                      </>
                    )}

                    <div className="p-2 text-white">Progress</div>
                    <div className="p-2">
                      <div className="rounded-lg border p-1">
                        <ProgressCard
                          title={"Issued"}
                          name={selectedCase.Requestor}
                          dateString={formatDateTime(selectedCase.Time_Request)}
                          isActive={true}
                        />
                        <ProgressCard
                          title={"Response"}
                          name={selectedCase.Technician}
                          dateString={formatDateTime(
                            selectedCase.Time_Response,
                          )}
                          isActive={
                            parseInt(selectedCase.Step) >= 2 ? true : false
                          }
                        />

                        <ProgressCard
                          title={"Completed"}
                          name={selectedCase.Technician}
                          dateString={formatDateTime(
                            selectedCase.Time_Repair_Complete,
                          )}
                          isActive={
                            parseInt(selectedCase.Step) >= 5 ? true : false
                          }
                        />
                        <ProgressCard
                          title={"Checked"}
                          name={selectedCase.Tech_SPV_Name}
                          dateString={formatDateTime(selectedCase.Tech_SPV)}
                          isActive={
                            parseInt(selectedCase.Step) >= 6 ? true : false
                          }
                        />

                        <ProgressCard
                          title={"Accepted"}
                          name={selectedCase.Approver_Name}
                          dateString={formatDateTime(selectedCase.Prod_SPV)}
                          isActive={
                            parseInt(selectedCase.Step) >= 7 ? true : false
                          }
                        />
                      </div>
                    </div>
                    <div className="p-2 text-white">Summary</div>
                    <div className="p-2 ">
                      <div className="rounded-lg border p-1">
                        <ProgressSummary
                          title={"Response Time"}
                          hour={responseTime}
                          isActive={
                            parseInt(selectedCase.Step) >= 2 ? true : false
                          }
                        />

                        <ProgressSummary
                          title={"Repair Time"}
                          hour={repairTime}
                          isActive={
                            parseInt(selectedCase.Step) >= 5 ? true : false
                          }
                        />
                      </div>
                    </div>
                    {partList.length > 0 ? (
                      <div>
                        <div className="p-2 text-white">Spare Part</div>
                        <div className="p-2">
                          <div className="rounded-lg border border p-1">
                            {partList.map((item, index) => {
                              return (
                                <div className="p-2 " key={index}>
                                  <div className="flex justify-between">
                                    <div className="text-white">
                                      {item["description"]}
                                    </div>
                                    <div className="text-white">
                                      {item["quantity"]}
                                    </div>
                                  </div>
                                  <div className="text-xs text-white">
                                    {item["dpm"]}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <></>
                    )}
                    {pmList.length > 0 ? (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="p-2 text-white">Checklist</div>

                          {pmEditMode ? (
                            <div className="w-[150px] px-2">
                              <CommonButtonFull
                                onClick={async () => {
                                  setOnloadPM(true);
                                  const idRequest =
                                    localStorage.getItem("selected_idRequest");
                                  console.log(pmTempList);
                                  const apiUrl = `${API_URL}/updatepmlist`;
                                  const response = await axios.post(apiUrl, {
                                    idRequest: idRequest,
                                    pmList: JSON.stringify(pmTempList),
                                  });

                                  if (response.status == 200) {
                                    fetch_detail_service(idRequest);
                                    setpmEditMode(false);
                                  }
                                  setOnloadPM(false);
                                }}
                                label={"Save"}
                                disabled={onloadPM}
                                onload={onloadPM}
                              ></CommonButtonFull>
                            </div>
                          ) : (
                            <div className=" p-1">
                              <div
                                onClick={() => {
                                  setpmEditMode(true);
                                }}
                                className=" justify center flex h-8 w-8 cursor-default items-center  rounded-full p-2 text-xl text-white hover:bg-white hover:bg-opacity-20"
                              >
                                <CiEdit />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="p-2">
                          <div className="rounded-lg border p-1 shadow-md">
                            <table>
                              {pmEditMode ? (
                                <tbody>
                                  {pmTempList.map((item, index) => {
                                    return (
                                      <tr className="" key={index}>
                                        <td className=" p-2 align-top text-white">
                                          {item["code"]}
                                        </td>
                                        <td className="p-2 text-left align-top text-white">
                                          <div>{item["description"]}</div>

                                          {item["widget"] == "T" ? (
                                            <div
                                              className="mt-2 w-[100px]
                                      "
                                            >
                                              <CommonInput
                                                input={item["value"]}
                                                onInputChange={(val) => {
                                                  const updatedPmList =
                                                    pmTempList.map(
                                                      (element) => {
                                                        if (
                                                          element.code ===
                                                          item["code"]
                                                        ) {
                                                          return {
                                                            ...element,
                                                            value: val,
                                                          }; // Toggle the checked value
                                                        }
                                                        return element;
                                                      },
                                                    );

                                                  setpmTempList(updatedPmList);
                                                }}
                                              />
                                            </div>
                                          ) : (
                                            <></>
                                          )}
                                        </td>
                                        <td className="flex-1 p-2">
                                          {item["widget"] == "C" ? (
                                            <input
                                              type="checkbox"
                                              checked={item["checked"]}
                                              onChange={() => {
                                                const updatedPmList =
                                                  pmTempList.map((element) => {
                                                    if (
                                                      element.code ===
                                                      item["code"]
                                                    ) {
                                                      return {
                                                        ...element,
                                                        checked:
                                                          !element.checked,
                                                      }; // Toggle the checked value
                                                    }
                                                    return element;
                                                  });

                                                setpmTempList(updatedPmList);
                                              }}
                                              className="form-checkbox bg-gray-100 border-gray-300 h-5 w-5 rounded text-blue-600 focus:ring-blue-500"
                                            />
                                          ) : (
                                            <></>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              ) : (
                                <tbody>
                                  {pmList.map((item, index) => {
                                    return (
                                      <tr className="" key={index}>
                                        <td className="p-2 align-top text-white">
                                          {item["code"]}
                                        </td>
                                        <td className="p-2 text-left text-white">
                                          {item["description"]}
                                        </td>
                                        <td className="flex-1 p-2 align-top">
                                          {item["checked"] ? (
                                            <FaCheckSquare className="text-success" />
                                          ) : (
                                            <div className="align-top text-white">
                                              {item["value"]}
                                            </div>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              )}
                            </table>
                          </div>
                        </div>
                      </>
                    ) : (
                      <></>
                    )}
                    {galleryList.length > 0 ? (
                      <div>
                        <div className="ml-2">Gallery</div>
                        <div className="p-2">
                          <div className="">
                            <div className=" flex w-full space-x-2 overflow-x-auto">
                              {galleryList.map((item, index) => {
                                return (
                                  <div
                                    className="relative h-40 w-60"
                                    key={index}
                                  >
                                    <img
                                      className="object-cover"
                                      src={`${IMAGE_GALLERY}/${item["Image_Name"]}`} // Replace with your image path
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <PageLoader />
          )}
        </div>
        <CustomModal
          isVisible={modalPerbaikan}
          isSmallWidth="sm"
          onClose={() => {
            setModalPerbaikan(false);
          }}
        >
          <CommonTextArea
            placeholder={"Deskripsi permasalahan"}
            input={inputRequestPerbaikan}
            type={"text"}
            error={inputRequestPerbaikanError}
            errorMessage={"Required"}
            onInputChange={(val) => {
              setInputRequestPerbaikan(val);
            }}
            onChg={() => {
              setInputRequestPerbaikanError(false);
            }}
          ></CommonTextArea>
          <div className="mb-2"></div>
          <CommonButtonFull
            label={"Kirim"}
            disabled={onloadRequestPerbaikan}
            onload={onloadRequestPerbaikan}
            onClick={async () => {
              setOnloadRequestPerbaikan(true);
              if (inputRequestPerbaikan == "") {
                setInputRequestPerbaikanError(true);
              } else {
                setInputRequestPerbaikanError(false);
              }
              setOnloadRequestPerbaikan(false);
            }}
          />
        </CustomModal>

        <CustomModal
          isVisible={modalPerawatan}
          isSmallWidth="sm"
          onClose={() => {
            setModalPerawatan(false);
          }}
        >
          <CommonInput
            placeholder={"Tuliskan KM saat ini"}
            input={inputKM}
            type={"number"}
            error={inputKMError}
            errorMessage={"Required"}
            onInputChange={(val) => {
              setInputKM(val);
            }}
            onChg={() => {
              setInputKMError(false);
            }}
          ></CommonInput>
          <div className="mb-2"></div>
          <CommonButtonFull
            label={"Kirim"}
            disabled={onloadRequestPerbaikan}
            onload={onloadRequestPerbaikan}
            onClick={async () => {
              setOnloadRequestPerawatan(true);
              if (inputKM == "") {
                setInputKMError(true);
              } else {
                setInputKMError(false);

                //kirim ke server
              }
              setOnloadRequestPerawatan(false);
            }}
          />
        </CustomModal>
      </div>
    </UserAuth>
  );
}
