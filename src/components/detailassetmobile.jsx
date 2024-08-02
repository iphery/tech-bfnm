"use client";
import { Appbar } from "@/components/appbar";
import UserAuth from "@/components/auth";
import Loader from "@/components/common/Loader";
import { CommonInput } from "@/components/input";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { API_URL, IMAGE_ASSET, IMAGE_USER } from "@/utils/constant";
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
import { MdOutlineClose } from "react-icons/md";
import { useMediaQuery } from "react-responsive";
import { formatDateTime } from "@/utils/dateformat";
import paginateData from "@/utils/pagination";
import { IoTime, IoTimeOutline } from "react-icons/io5";
import DetailAssetWeb from "@/components/detailassetweb";
import { ProgressCard, ProgressSummary } from "@/components/card";

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
      keyword: keyword,
    });

    if (response.status == 200) {
      const array = response.data["service"];
      // console.log(array["data"]);
      setDataService(array);
    }
    setSecondLoading(false);
  };

  const fetch_detail_service = async (id) => {
    //console.log(id);
    const apiUrl = `${API_URL}/fetchdetailservice`;
    const response = await axios.post(apiUrl, {
      idRequest: id,
    });

    if (response.status == 200) {
      const array = response.data["response"][0];
      const parts = response.data["parts"];
      const galleries = response.data["galleries"];
      setSelectedCase(array);
      setPartList(parts);
      setGalleryList(galleries);
      console.log(array);
    }
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
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <UserAuth>
      {!firstLoading ? (
        <div className="min-h-screen  justify-center bg-boxdark-2">
          <div className="relative">
            <div className="absolute  z-10 h-[300] w-full bg-black opacity-50 "></div>
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

            <div className="absolute left-2 top-75 z-30">
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
                  <div className="mb-10"></div>
                  <div className="m-2 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg">
                    <HiCamera className="h-6 w-6"></HiCamera>
                  </div>
                  <div className="m-2 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg">
                    <HiCamera className="h-6 w-6"></HiCamera>
                  </div>
                  <div className="m-2 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg">
                    <HiCamera className="h-6 w-6"></HiCamera>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-[200] w-full ">
              {dataAsset.Image == null || dataAsset.Image == "" ? (
                <div className="flex h-100 items-center justify-center">
                  No Image
                </div>
              ) : (
                <img
                  className="h-100 w-full object-cover"
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
                  return (
                    <div
                      onClick={() => {
                        setSwitchPage(true);

                        fetch_detail_service(item["ID_Request"]);
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
                    className="mt-5 flex cursor-default justify-center text-white"
                  >
                    Load more..
                  </div>
                ) : (
                  <></>
                )}
              </>
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

                <div>Deskripsi</div>
                <div className="p-2">
                  <div className="bg-form-strokedark p-1">
                    {selectedCase.Problem}
                  </div>
                </div>

                <div>Tindakan</div>
                <div className="p-2">
                  <div className="bg-form-strokedark p-1">
                    {selectedCase.Solution}
                  </div>
                </div>

                <div>Progress</div>
                <div className="p-2">
                  <div className="bg-form-strokedark p-2">
                    <ProgressCard
                      title={"Issued"}
                      name={selectedCase.Requestor}
                      dateString={formatDateTime(selectedCase.Time_Request)}
                    />
                    <ProgressCard
                      title={"Response"}
                      name={selectedCase.Technician}
                      dateString={formatDateTime(selectedCase.Time_Response)}
                    />

                    <div className="flex flex-row justify-between">
                      <div>Spare Part / Service</div>
                      <div>{formatDateTime(selectedCase.Time_POS)}</div>
                    </div>

                    <ProgressCard
                      title={"Completed"}
                      name={selectedCase.Technician}
                      dateString={formatDateTime(
                        selectedCase.Time_Repair_Complete,
                      )}
                    />
                    <ProgressCard
                      title={"Checked"}
                      name={selectedCase.Tech_SPV_Name}
                      dateString={formatDateTime(selectedCase.Tech_SPV)}
                    />

                    <ProgressCard
                      title={"Accepted"}
                      name={selectedCase.Approver_Name}
                      dateString={formatDateTime(selectedCase.Prod_SPV)}
                    />
                  </div>
                </div>
                <div>Summary</div>
                <div className="p-2">
                  <div className="bg-form-strokedark p-1">
                    <ProgressSummary title={"Response Time"} hour={1} />
                    <ProgressSummary title={"Spare Part (jika ada)"} hour={1} />
                    <ProgressSummary title={"Repair Time"} hour={1} />
                  </div>
                </div>
                <div>Spare Part</div>
                <div className="p-2">
                  <div className="bg-form-strokedark p-1">
                    {partList.map((item, index) => {
                      return (
                        <div key={index} className="flex justify-between">
                          <div>{item["description"]}</div>
                          <div>{item["quantity"]}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div>Gallery</div>
                <div className="p-2">
                  <div className="bg-form-strokedark p-1">
                    <div className=" flex space-x-4 overflow-x-auto">
                      <div className="mr-2 h-10 w-30 bg-red"></div>
                      <div className="mr-2 h-10 w-30 bg-red"></div>
                      <div className="mr-2 h-10 w-30 bg-red"></div>
                      <div className="mr-2 h-10 w-30 bg-red"></div>
                      <div className="mr-2 h-10 w-30 bg-red"></div>
                      <div className="mr-2 h-10 w-30 bg-red"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <Loader />
      )}
    </UserAuth>
  );
}
