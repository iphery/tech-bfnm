"use client";
import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../appcontext";
import axios from "axios";
import { useMediaQuery } from "react-responsive";
import { API_URL, IMAGE_ASSET } from "@/utils/constant";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import UserAuth from "@/components/auth";
import { Appbar } from "@/components/appbar";
import { CommonInput, CommonTextArea } from "@/components/input";
import { HiOutlineSearch } from "react-icons/hi";
import { useRouter } from "next/navigation";
import { PageCard, PageCardLimited } from "@/components/card";
import paginateData from "@/utils/pagination";
import { formatDate } from "@/utils/dateformat";
import { CommonButton } from "@/components/button";
import { GetUniqueId } from "@/utils/uniqid";
import { AiOutlineDelete } from "react-icons/ai";
import { FaPlus } from "react-icons/fa";
import { GoPlus } from "react-icons/go";
import { NotifySuccess } from "@/utils/notify";
import { IoIosAddCircle } from "react-icons/io";

export default function PageTransaction() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const isSmallScreen = useMediaQuery({ query: "(max-width: 640px)" });

  const [inputItemError, setInputItemError] = useState([]);
  const [inputUnitError, setInputUnitError] = useState([]);
  const [inputQuantityError, setInputQuantityError] = useState([]);
  const [inputDateError, setInputDateError] = useState([]);
  const [inputRemarkError, setInputRemarkError] = useState([]);

  const [inputData, setInputData] = useState([]);
  const [onloadSubmit, setOnloadSubmit] = useState(false);
  const [serviceDate, setServiceDate] = useState("");
  const [serviceDateError, setServiceDateError] = useState(false);

  const [filterRequest, setFilterRequest] = useState([]);
  const [keywordRequest, setKeywordRequest] = useState("");
  const [pendingService, setPendingService] = useState([]);
  const [showRepairList, setRepairList] = useState(false);

  const add_item = () => {
    const item = [...inputData];

    const id = GetUniqueId();
    item.push({
      index: id,
      item: "",
      unit: "",
      quantity: "",
      date: "",
      remark: "",
    });
    setInputData(item);
    setInputItemError((prev) => [...prev, false]);
    setInputUnitError((prev) => [...prev, false]);
    setInputQuantityError((prev) => [...prev, false]);
    setInputDateError((prev) => [...prev, false]);
    setInputRemarkError((prev) => [...prev, false]);
  };

  const fetch_data = async () => {
    const apiUrl = `${API_URL}/stocklist`;
    const response = await axios.post(apiUrl, {});

    if (response.status == 200) {
      const array = response.data["response"];
      const array2 = response.data["pending"];
      // const current_page = response.data["response"]["current_page"];
      //const last_page = response.data["response"]["last_page"];
      // setDetailData(array);
      setPendingService(array2);
      //setFilteredList(array);
      // setLastPage(last_page);

      console.log(array2);
    }
  };

  useEffect(() => {
    fetch_data();
  }, []);

  useEffect(() => {
    const filterRequest = pendingService.filter((item) =>
      item["ID_Request"].toLowerCase().includes(keywordRequest.toLowerCase()),
    );

    setFilterRequest(filterRequest);
  }, [keywordRequest]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }
  return (
    <UserAuth>
      {isSmallScreen ? (
        <>In progress</>
      ) : (
        <div className="min-h-screen  bg-boxdark-2">
          <DefaultLayout>
            <div className="flex min-h-[calc(100vh-115px)] flex-col">
              <div className="mb-3 flex items-center justify-start">
                <div
                  className="text-lg text-white"
                  onClick={() => {
                    console.log(inputItemError);
                    //console.log(inputQuantity);
                  }}
                >
                  New Service
                </div>
              </div>

              <PageCardLimited>
                <div className="w-1/2">
                  <div className="flex w-full flex-row">
                    <div className="w-full">Date</div>
                    <div className="w-full">
                      <CommonInput
                        input={serviceDate}
                        type={"date"}
                        onInputChange={(val) => {
                          setServiceDate(val);
                        }}
                        error={serviceDateError}
                        errorMessage={"Required"}
                        onChg={() => {
                          setServiceDateError(false);
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="mb-10"></div>
                <table className="w-full">
                  <thead>
                    <tr className="text-white">
                      <th className="w-1/3">Jenis Material</th>
                      <th>Satuan</th>
                      <th>Jumlah</th>
                      <th>Tgl. Dibutuhkan</th>
                      <th className="w-1/4">Ket.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inputData.map((item, index) => {
                      return (
                        <tr key={index}>
                          <td className="align-top">
                            <CommonInput
                              input={item.item}
                              onInputChange={(val) => {
                                setInputData((prev) =>
                                  prev.map((data) =>
                                    data.index == item.index
                                      ? { ...data, item: val }
                                      : data,
                                  ),
                                );
                              }}
                              errorMessage={"Required"}
                              error={inputItemError[index]}
                              onKeyChange={() => {
                                const error = [...inputItemError];
                                error[index] = false;
                                setInputItemError(error);
                              }}
                            />
                          </td>
                          <td className="align-top">
                            <CommonInput
                              input={item.unit}
                              onInputChange={(val) => {
                                setInputData((prev) =>
                                  prev.map((data) =>
                                    data.index == item.index
                                      ? { ...data, unit: val }
                                      : data,
                                  ),
                                );
                              }}
                              errorMessage={"Required"}
                              error={inputUnitError[index]}
                              onKeyChange={() => {
                                const error = [...inputUnitError];
                                error[index] = false;
                                setInputUnitError(error);
                              }}
                            />
                          </td>
                          <td className="align-top">
                            <CommonInput
                              input={item.quantity}
                              type={"number"}
                              onInputChange={(val) => {
                                setInputData((prev) =>
                                  prev.map((data) =>
                                    data.index == item.index
                                      ? { ...data, quantity: val }
                                      : data,
                                  ),
                                );
                              }}
                              errorMessage={"Required"}
                              error={inputQuantityError[index]}
                              onKeyChange={() => {
                                const error = [...inputQuantityError];
                                error[index] = false;
                                setInputQuantityError(error);
                              }}
                            />
                          </td>
                          <td className="align-top">
                            <CommonInput
                              input={item.date}
                              type={"date"}
                              onInputChange={(val) => {
                                setInputData((prev) =>
                                  prev.map((data) =>
                                    data.index == item.index
                                      ? { ...data, date: val }
                                      : data,
                                  ),
                                );
                              }}
                              errorMessage={"Required"}
                              error={inputDateError[index]}
                              onChg={() => {
                                const error = [...inputDateError];
                                error[index] = false;
                                setInputDateError(error);
                              }}
                            />
                          </td>
                          <td className="align-top">
                            <CommonInput
                              input={item.remark}
                              onInputChange={(val) => {
                                setInputData((prev) =>
                                  prev.map((data) =>
                                    data.index == item.index
                                      ? { ...data, remark: val }
                                      : data,
                                  ),
                                );
                              }}
                              errorMessage={"Required"}
                              error={inputRemarkError[index]}
                              onChg={() => {
                                const error = [...inputRemarkError];
                                error[index] = false;
                                setInputRemarkError(error);
                              }}
                            >
                              <div
                                className="cursor-default hover:text-black"
                                onClick={() => {
                                  setRepairList(true);
                                }}
                              >
                                <IoIosAddCircle />
                              </div>
                            </CommonInput>
                          </td>
                          <td className="align-top">
                            <div
                              onClick={() => {
                                const foundIndex = inputData.findIndex(
                                  (value) => value.index == item.index,
                                );

                                const list = [...inputData];
                                list.splice(foundIndex, 1);
                                setInputData(list);
                              }}
                            >
                              <AiOutlineDelete />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {showRepairList ? (
                  <div className="border p-2">
                    <div></div>
                    <div>
                      <CommonInput
                        input={keywordRequest}
                        onInputChange={(val) => {
                          setKeywordRequest(val);
                        }}
                      ></CommonInput>
                    </div>
                    {keywordRequest.length > 3 ? (
                      <div className="mt-2 h-30 overflow-y-auto bg-white">
                        <table className="w-full">
                          <tbody>
                            {filterRequest.map((item, index) => {
                              return (
                                <tr
                                  key={index}
                                  className={`cursor-default hover:bg-secondary hover:text-white ${index % 2 === 0 ? "bg-gray" : "bg-white"}`}
                                  onClick={() => {
                                    setInputIdService(item["ID_Request"]);
                                    setKeywordRequest("");
                                  }}
                                >
                                  <td>{item["ID_Request"]}</td>
                                  <td>{item["ID_Asset"]}</td>
                                  <td>{item["Description"]}</td>
                                  <td>{item["Manufacture"]}</td>
                                  <td>{item["Model"]}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                ) : (
                  <></>
                )}

                <div className="flex justify-start">
                  <div
                    onClick={() => {
                      add_item();
                    }}
                    className="mt-3 flex cursor-default flex-row items-center hover:text-red"
                  >
                    <GoPlus />

                    <div className="ml-1">Tambah</div>
                  </div>
                </div>

                {inputData.length > 0 ? (
                  <div className="mt-10 flex justify-end">
                    <CommonButton
                      label={"Submit"}
                      onload={onloadSubmit}
                      disabled={onloadSubmit}
                      onClick={async () => {
                        setOnloadSubmit(true);
                        const errorItem = [...inputItemError];
                        const errorUnit = [...inputUnitError];
                        const errorQuantity = [...inputQuantityError];
                        const errorDate = [...inputDateError];
                        const errorRemark = [...inputRemarkError];
                        let eItemCount = [];
                        let eUnitCount = [];
                        let eQtyCount = [];
                        let eDateCount = [];
                        let eRemarkCount = [];
                        inputData.map((item, index) => {
                          if (item.item == "") {
                            errorItem[index] = true;
                            eItemCount[index] = 1;
                          } else {
                            errorItem[index] = false;
                            eItemCount[index] = 0;
                          }

                          if (item.unit == "") {
                            errorUnit[index] = true;
                            eUnitCount[index] = 1;
                          } else {
                            errorUnit[index] = false;
                            eUnitCount[index] = 0;
                          }

                          if (item.quantity == "") {
                            errorQuantity[index] = true;
                            eQtyCount[index] = 1;
                          } else {
                            errorQuantity[index] = false;
                            eQtyCount[index] = 0;
                          }

                          if (item.date == "") {
                            errorDate[index] = true;
                            eDateCount[index] = 1;
                          } else {
                            errorDate[index] = false;
                            eDateCount[index] = 0;
                          }

                          if (item.remark == "") {
                            errorRemark[index] = true;
                            eRemarkCount[index] = 1;
                          } else {
                            errorRemark[index] = false;
                            eRemarkCount[index] = 0;
                          }
                        });

                        setInputItemError(errorItem);
                        setInputUnitError(errorUnit);
                        setInputQuantityError(errorQuantity);
                        setInputDateError(errorDate);
                        setInputRemarkError(errorRemark);

                        const itemSum = eItemCount.reduce(
                          (accum, current) => accum + current,
                          0,
                        );
                        const unitSum = eUnitCount.reduce(
                          (accum, current) => accum + current,
                          0,
                        );
                        const quantitySum = eQtyCount.reduce(
                          (accum, current) => accum + current,
                          0,
                        );
                        const dateSum = eDateCount.reduce(
                          (accum, current) => accum + current,
                          0,
                        );
                        const remarkSum = eRemarkCount.reduce(
                          (accum, current) => accum + current,
                          0,
                        );

                        let errorCreated = false;
                        if (serviceDate == "") {
                          setServiceDateError(true);
                          errorCreated = true;
                        } else {
                          setServiceDateError(false);
                          errorCreated = false;
                        }

                        const allError =
                          itemSum + unitSum + quantitySum + dateSum + remarkSum;

                        if (allError == 0 && !errorCreated) {
                          const user = localStorage.getItem("info");
                          const parseUser = JSON.parse(user);

                          const apiUrl = `${API_URL}/newservice`;
                          const response = await axios.post(apiUrl, {
                            date: serviceDate,
                            list: inputData,
                            uid: parseUser[0]["Uid"],
                          });
                          console.log(response);
                          if (response.status == 200) {
                            const result = response.data["response"];
                            NotifySuccess(result);
                            //router.back();
                          }
                          console.log(inputData);
                        }
                        setOnloadSubmit(false);
                      }}
                    ></CommonButton>
                  </div>
                ) : (
                  <></>
                )}
              </PageCardLimited>
            </div>
          </DefaultLayout>
        </div>
      )}
    </UserAuth>
  );
}
