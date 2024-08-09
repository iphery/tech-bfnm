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
                  Service
                </div>
              </div>

              <PageCardLimited>
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
                            />
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

                <div className="mt-10 flex justify-end">
                  <CommonButton
                    label={"Submit"}
                    onClick={() => {
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
                          error[index] = 1;
                        } else {
                          errorItem[index] = false;
                          error[index] = 0;
                        }

                        if (item.unit == "") {
                          errorUnit[index] = true;
                          error[index] = 1;
                        } else {
                          errorUnit[index] = false;
                        }

                        if (item.quantity == "") {
                          errorQuantity[index] = true;
                        } else {
                          errorQuantity[index] = false;
                        }

                        if (item.date == "") {
                          errorDate[index] = true;
                        } else {
                          errorDate[index] = false;
                        }

                        if (item.remark == "") {
                          errorRemark[index] = true;
                        } else {
                          errorRemark[index] = false;
                        }
                      });

                      setInputItemError(errorItem);
                      setInputUnitError(errorUnit);
                      setInputQuantityError(errorQuantity);
                      setInputDateError(errorDate);
                      setInputRemarkError(errorRemark);
                    }}
                  ></CommonButton>
                </div>
              </PageCardLimited>
            </div>
          </DefaultLayout>
        </div>
      )}
    </UserAuth>
  );
}
