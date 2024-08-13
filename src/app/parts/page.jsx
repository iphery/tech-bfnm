"use client";
import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../appcontext";
import axios from "axios";
import { useMediaQuery } from "react-responsive";
import { IMAGE_ASSET, API_URL } from "@/utils/constant";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import UserAuth from "@/components/auth";
import { Appbar } from "@/components/appbar";
import { CommonInput } from "@/components/input";
import { HiOutlineSearch } from "react-icons/hi";
import { useRouter } from "next/navigation";
import { TableContent, TableHeader } from "@/components/table";
import { GoChevronRight } from "react-icons/go";
import paginateData from "@/utils/pagination";
import { BsCartPlus } from "react-icons/bs";
import { PageLoader } from "@/components/loader";
import { PageCardLimited } from "@/components/card";
import { useProvider } from "@/app/appcontext";
import { MdAdd, MdAddToPhotos } from "react-icons/md";
import { CustomModal } from "@/components/modal";
import { FaBullseye } from "react-icons/fa";
import { CommonButtonFull } from "@/components/button";
import { NotifySuccess } from "@/utils/notify";

export default function ListPart() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  const isSmallScreen = useMediaQuery({ query: "(max-width: 640px)" });

  const [detailData, setDetailData] = useState([]);
  const [countData, setCountData] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [keywordError, setKeywordError] = useState(false);
  const [filteredList, setFilteredList] = useState([]);
  const [loader, setLoader] = useState(true);

  const { filteredPartList, setFilteredPartList } = useProvider();
  const { partKeyword, setPartKeyword } = useProvider();

  //const [lastPage, setLastPage] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalNewPart, setModalNewPart] = useState(false);

  const [inputNewData, setInputNewData] = useState({
    description: "",
    vendor_code: "",
    unit: "",
    location: "",
    remark: "",
  });

  const [inputNewDataError, setInputNewDataError] = useState({
    descriptionError: false,
    codeError: false,
    unitError: false,
    locationError: false,
    remarkError: false,
  });

  const [onloadNew, setOnloadNew] = useState(false);

  const fetch_data = async () => {
    const apiUrl = `${API_URL}/stocklist?page=${currentPage}`;
    const response = await axios.post(apiUrl, { keyword: keyword });

    if (response.status == 200) {
      const array = response.data["response"];
      // const current_page = response.data["response"]["current_page"];
      //const last_page = response.data["response"]["last_page"];
      setDetailData(array);
      //setFilteredList(array);
      // setLastPage(last_page);

      // console.log(array);
    }
    setLoading(false);
    setLoader(false);
  };

  const next_page = () => {
    if (currentPage < lastPage) {
      let nextPage = currentPage + 1;
      setCurrentPage(nextPage);
    }
    console.log(currentPage);
  };

  const prev_page = () => {
    if (currentPage > 1) {
      let nextPage = currentPage - 1;
      setCurrentPage(nextPage);
    }
  };

  const onPageChange = () => {
    let nextPage = currentPage + 1;
    console.log("ini" + nextPage);
    setCurrentPage(nextPage);
  };

  const onKeywordChange = (event) => {
    setKeyword(event.target.value);
    setCurrentPage(1); // Reset to the first page on keyword change
  };

  useEffect(() => {
    fetch_data();
  }, []);

  useEffect(() => {
    //if (!loading) {
    const filterData = detailData.filter((item) =>
      item["description"].toLowerCase().includes(partKeyword.toLowerCase()),
    );
    const { data, pageCurrent, start, end } = paginateData(
      filterData,
      //keyword,
      currentPage,
      15,
    );

    setFilteredPartList(filterData);

    //}
  }, [detailData, partKeyword, currentPage]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <UserAuth>
      <div className="min-h-screen  bg-boxdark-2">
        {isSmallScreen ? (
          <>
            <div>in progerss</div>
          </>
        ) : (
          <div className="relative">
            <div className="absolute z-0 h-full w-full">
              <DefaultLayout>
                <div className="flex min-h-[calc(100vh-115px)] flex-col">
                  <div className="mb-3 flex items-center justify-center">
                    <div className="text-lg text-white">Inventory</div>

                    <div className="w-full">
                      <div className="flex justify-end text-warning">
                        <div className="flex flex-row">
                          <div
                            className="flex cursor-default items-center justify-center px-5  hover:text-white"
                            onClick={() => {
                              setModalNewPart(true);
                            }}
                          >
                            <MdAddToPhotos />
                            <div className="ml-1 ">New Part</div>
                          </div>
                          <div
                            className="flex cursor-default items-center justify-center px-5  hover:text-white"
                            onClick={() => {
                              router.push("/partsout");
                            }}
                          >
                            <BsCartPlus />
                            <div className="ml-1 ">Stock Out</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <PageCardLimited>
                    <div className="p-5">
                      <div className="flex flex-row items-center">
                        <div className="w-1/2">
                          <CommonInput
                            input={partKeyword}
                            type={"text"}
                            onInputChange={(val) => {
                              //setKeyword(val);
                              //  fetch_data();
                              setPartKeyword(val);
                              setCurrentPage(1);
                            }}
                            onKeyChange={() => {
                              setKeywordError(false);
                            }}
                            placeholder={"Search"}
                          >
                            <HiOutlineSearch />
                          </CommonInput>
                        </div>
                      </div>

                      <div className="mb-5"></div>

                      <div className="h-[calc(100vh-280px)] overflow-y-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="sticky top-0 bg-black text-white">
                              <th>Deskripsi</th>
                              <th>Part No</th>
                              <th>Remark</th>
                              <th>Quantity</th>
                              <th>Unit</th>

                              <th>Lokasi Simpan</th>
                            </tr>
                          </thead>
                          <tbody className=" ">
                            {!loading ? (
                              filteredPartList.map((item, index) => {
                                return (
                                  <tr
                                    key={index}
                                    className={`cursor-default text-white    hover:bg-secondary hover:text-black`}
                                    onClick={() => {
                                      router.push(`/parts/${item["id_part"]}`);
                                    }}
                                  >
                                    <td className="p-2 align-top">
                                      {item["description"]}
                                    </td>
                                    <td className=" p-2 align-top">
                                      {item["vendor_code"]}
                                    </td>
                                    <td className="p-2 align-top">
                                      {item["remark"]}
                                    </td>
                                    <td className="p-2 align-top">
                                      {item["available_quantity"]}
                                    </td>
                                    <td className="p-2 align-top">
                                      {item["unit"]}
                                    </td>
                                    <td className="p-2 align-top">
                                      {item["location"]}
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              <></>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </PageCardLimited>
                </div>
              </DefaultLayout>
            </div>
            <CustomModal
              isVisible={modalNewPart}
              isSmallWidth="sm"
              onClose={() => {
                setModalNewPart(false);
              }}
            >
              <div className="mb-2"></div>
              <CommonInput
                placeholder={"Enter description"}
                input={inputNewData.description}
                onInputChange={(val) => {
                  setInputNewData((prevState) => ({
                    ...prevState,
                    description: val,
                  }));
                }}
                error={inputNewDataError.descriptionError}
                errorMessage={"Required"}
                onChg={() => {
                  setInputNewDataError((prevState) => ({
                    ...prevState,
                    descriptionError: false,
                  }));
                }}
              ></CommonInput>
              <div className="mb-2"></div>
              <CommonInput
                placeholder={"Enter detail"}
                input={inputNewData.vendor_code}
                onInputChange={(val) => {
                  setInputNewData((prevState) => ({
                    ...prevState,
                    vendor_code: val,
                  }));
                }}
                error={inputNewDataError.codeError}
                errorMessage={"Required"}
                onChg={() => {
                  setInputNewDataError((prevState) => ({
                    ...prevState,
                    codeError: false,
                  }));
                }}
              ></CommonInput>
              <div className="mb-2"></div>
              <CommonInput
                placeholder={"Enter unit"}
                input={inputNewData.unit}
                onInputChange={(val) => {
                  setInputNewData((prevState) => ({
                    ...prevState,
                    unit: val,
                  }));
                }}
                error={inputNewDataError.unitError}
                errorMessage={"Required"}
                onChg={() => {
                  setInputNewDataError((prevState) => ({
                    ...prevState,
                    unitError: false,
                  }));
                }}
              ></CommonInput>
              <div className="mb-2"></div>
              <CommonInput
                placeholder={"Enter remark"}
                input={inputNewData.remark}
                onInputChange={(val) => {
                  setInputNewData((prevState) => ({
                    ...prevState,
                    remark: val,
                  }));
                }}
                error={inputNewDataError.remarkError}
                errorMessage={"Required"}
                onChg={() => {
                  setInputNewDataError((prevState) => ({
                    ...prevState,
                    remarkError: false,
                  }));
                }}
              ></CommonInput>
              <div className="mb-2"></div>

              <CommonInput
                placeholder={"Enter location"}
                input={inputNewData.location}
                onInputChange={(val) => {
                  setInputNewData((prevState) => ({
                    ...prevState,
                    location: val,
                  }));
                }}
                error={inputNewDataError.locationError}
                errorMessage={"Required"}
                onChg={() => {
                  setInputNewDataError((prevState) => ({
                    ...prevState,
                    locationError: false,
                  }));
                }}
              ></CommonInput>

              <div className="mb-5"></div>
              <CommonButtonFull
                label={"Create New"}
                onload={onloadNew}
                disabled={onloadNew}
                onClick={async () => {
                  setOnloadNew(true);
                  const error = [0, 0, 0, 0, 0];
                  if (inputNewData.description == "") {
                    setInputNewDataError((prevState) => ({
                      ...prevState,
                      descriptionError: true,
                    }));
                    error[0] = 1;
                  } else {
                    setInputNewDataError((prevState) => ({
                      ...prevState,
                      descriptionError: false,
                    }));
                    error[0] = 0;
                  }

                  if (inputNewData.vendor_code == "") {
                    setInputNewDataError((prevState) => ({
                      ...prevState,
                      codeError: true,
                    }));
                    error[1] = 1;
                  } else {
                    setInputNewDataError((prevState) => ({
                      ...prevState,
                      codeError: false,
                    }));
                    error[1] = 0;
                  }

                  if (inputNewData.unit == "") {
                    setInputNewDataError((prevState) => ({
                      ...prevState,
                      unitError: true,
                    }));
                    error[2] = 1;
                  } else {
                    setInputNewDataError((prevState) => ({
                      ...prevState,
                      unitError: false,
                    }));
                    error[2] = 0;
                  }

                  if (inputNewData.remark == "") {
                    setInputNewDataError((prevState) => ({
                      ...prevState,
                      remarkError: true,
                    }));
                    error[3] = 1;
                  } else {
                    setInputNewDataError((prevState) => ({
                      ...prevState,
                      remarkError: false,
                    }));
                    error[3] = 0;
                  }

                  if (inputNewData.location == "") {
                    setInputNewDataError((prevState) => ({
                      ...prevState,
                      locationError: true,
                    }));
                    error[4] = 1;
                  } else {
                    setInputNewDataError((prevState) => ({
                      ...prevState,
                      locationError: false,
                    }));
                    error[4] = 0;
                  }

                  const sum_error = error.reduce(
                    (accum, current) => accum + current,
                    0,
                  );
                  if (sum_error == 0) {
                    console.log(inputNewData);

                    const apiUrl = `${API_URL}/newpart`;
                    const response = await axios.post(apiUrl, {
                      data: inputNewData,
                    });

                    if (response.status == 200) {
                      const result = response.data["response"];
                      NotifySuccess(result);
                      setModalNewPart(false);
                    }
                  }
                  setOnloadNew(false);
                }}
              ></CommonButtonFull>
            </CustomModal>
          </div>
        )}
      </div>
    </UserAuth>
  );
}
