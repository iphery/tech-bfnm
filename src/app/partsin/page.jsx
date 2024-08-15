"use client";
import React, { useContext, useEffect, useRef, useState } from "react";
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
import { GoAlert, GoChevronRight } from "react-icons/go";
import paginateData from "@/utils/pagination";
import { CommonButton } from "@/components/button";
import { NotifySuccess } from "@/utils/notify";
import { PageCard } from "@/components/card";

export default function PartsIn() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  const isSmallScreen = useMediaQuery({ query: "(max-width: 640px)" });

  const [detailData, setDetailData] = useState([]);
  const [countData, setCountData] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [keywordError, setKeywordError] = useState(false);
  const [filteredList, setFilteredList] = useState([]);

  ///dari sini
  //input, error, error message

  const focusTempQuantity = useRef();
  const focusKeyword = useRef();

  const [tempItem, setTempItem] = useState("");
  const [tempIdPart, setTempIdPart] = useState("");
  const [tempQuantity, setTempQuantity] = useState("");
  const [tempUnit, setTempUnit] = useState("");
  const [tempAvailableQuantity, setTempAvailableQuantity] = useState(0);
  const [searchNotFound, setSearchNotFound] = useState(false);
  const [listOrder, setListOrder] = useState([]);
  const [emptyListAlert, setEmptyListAlert] = useState(false);
  const [pendingService, setPendingService] = useState([]);
  const [inputIdService, setInputIdService] = useState("");
  const [filterRequest, setFilterRequest] = useState([]);
  const [keywordRequest, setKeywordRequest] = useState("");

  const [nonStockDescription, setNonStockDescription] = useState("");
  const [nonStockDescriptionError, setNonStockDescriptionError] =
    useState(false);
  const [nonStockQuantity, setNonStockQuantity] = useState("");
  const [nonStockQuantityError, setNonStockQuantityError] = useState(false);
  const [nonStockIdService, setNonStockIdService] = useState("");
  const [inputNote, setInputNote] = useState("");
  const [inputNoteError, setInputNoteError] = useState(false);
  const [inputUnit, setInputUnit] = useState("");
  const [inputUnitError, setInputUnitError] = useState(false);

  const [inputDate, setInputDate] = useState("");
  const [inputDateError, setInputDateError] = useState(false);
  const [inputDPM, setInputDPM] = useState("");
  const [inputDPMError, setInputDPMError] = useState(false);

  const [loadingSubmit, setLoadingSubmit] = useState(false);

  ///

  //const [lastPage, setLastPage] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetch_data = async () => {
    const apiUrl = `${API_URL}/stocklist`;
    const response = await axios.post(apiUrl, {});

    if (response.status == 200) {
      const array = response.data["response"];
      const array2 = response.data["pending"];
      // const current_page = response.data["response"]["current_page"];
      //const last_page = response.data["response"]["last_page"];
      setDetailData(array);
      setPendingService(array2);
      //setFilteredList(array);
      // setLastPage(last_page);

      console.log(array2);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetch_data();
  }, []);

  useEffect(() => {
    //if (!loading) {
    const filterData = detailData.filter((item) =>
      item["description"].toLowerCase().includes(keyword.toLowerCase()),
    );
    /*
    const { data, pageCurrent, start, end } = paginateData(
      filterData,
      //keyword,
      currentPage,
      10,
    );
    */
    setFilteredList(filterData);

    //}
  }, [detailData, keyword]);

  useEffect(() => {
    const filterRequest = pendingService.filter((item) =>
      item["ID_Request"].toLowerCase().includes(keywordRequest.toLowerCase()),
    );

    /*
    if (filterDataAsset.length == 0) {
      setSearchAssetNotFound(true);
    } else {
      setSearchAssetNotFound(false);
    }
      */

    setFilterRequest(filterRequest);
  }, [keywordRequest]);

  const save_item = async () => {
    setLoadingSubmit(true);
    console.log(inputDate);
    console.log(inputDPM);
    console.log(listOrder);
    const error = [0, 0, 0];
    if (inputDate == "") {
      setInputDateError(true);
      error[0] = 1;
    } else {
      setInputDateError(false);
      error[0] = 0;
    }

    if (inputDate == "") {
      setInputDPMError(true);
      error[1] = 1;
    } else {
      setInputDPMError(false);
      error[1] = 0;
    }

    if (listOrder.length == 0) {
      error[2] = 1;
    } else {
      error[2] = 0;
    }

    const sum_error = error.reduce((accum, current) => accum + current, 0);
    if (sum_error == 0) {
      const user = localStorage.getItem("info");
      const parseUser = JSON.parse(user);

      const apiUrl = `${API_URL}/transorder`;
      const response = await axios.post(apiUrl, {
        date: inputDate,
        dpm: inputDPM,
        order: listOrder,
        uid: parseUser[0]["Uid"],
      });

      if (response.status == 200) {
        const result = response.data["response"];
        NotifySuccess(result);
        router.back();
      }
    }
    setLoadingSubmit(false);
  };

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
          <DefaultLayout>
            <div className="text-white">
              <div className="mb-3 flex items-center justify-start">
                <div className="text-lg text-white">Stock In</div>
              </div>
              <PageCard>
                <div className=" w-1/2">
                  <div className="w-full">
                    <div className="mb-2 flex flex-row">
                      <div className="w-full">Date</div>
                      <div className="w-full">
                        <CommonInput
                          type={"date"}
                          input={inputDate}
                          onInputChange={(val) => {
                            setInputDate(val);
                          }}
                          errorMessage={"Required"}
                          error={inputDateError}
                          onChg={() => {
                            setInputDateError(false);
                          }}
                        ></CommonInput>
                      </div>
                    </div>
                  </div>
                  <div className="w-full">
                    <div className="flex flex-row">
                      <div className="w-full">No DPM</div>
                      <div className="w-full">
                        <CommonInput
                          type={"text"}
                          input={inputDPM}
                          onInputChange={(val) => {
                            setInputDPM(val);
                          }}
                          errorMessage={"Required"}
                          error={inputDPMError}
                          onKeyChange={() => {
                            setInputDPMError(false);
                          }}
                        ></CommonInput>
                      </div>
                    </div>
                  </div>
                </div>
              </PageCard>

              <div className="p-3"></div>

              <PageCard>
                <div className="mb-3 text-red">Stock Only </div>
                <div className="flex flex-row justify-evenly">
                  <div className="w-full">
                    <CommonInput
                      input={keyword}
                      type={"text"}
                      reference={focusKeyword}
                      onInputChange={(val) => {
                        //setKeyword(val);
                        //  fetch_data();
                        setKeyword(val);
                        setCurrentPage(1);
                      }}
                      placeholder={"Search"}
                    >
                      <HiOutlineSearch />
                    </CommonInput>
                  </div>
                  <div className="ml-3"></div>
                  <div className="w-full">
                    <CommonInput
                      input={tempItem}
                      isDisabled={true}
                    ></CommonInput>
                  </div>
                  <div className="ml-3"></div>
                  <div className="w-2/3">
                    <CommonInput
                      input={tempQuantity}
                      type="number"
                      reference={focusTempQuantity}
                      placeholder="Enter to insert"
                      onInputChange={(val) => {
                        setTempQuantity(val);
                      }}
                      onKeyChange={(event) => {
                        if (event.key == "Enter") {
                          //cek jika exist
                          const newList = [...listOrder];
                          const findIndex = newList.findIndex(
                            (value) => value.id_part == tempIdPart,
                          );

                          if (findIndex != -1) {
                            const qty =
                              parseInt(newList[findIndex].quantity) +
                              parseInt(tempQuantity);

                            newList[findIndex].quantity = qty;

                            //exist
                          } else {
                            //not exist
                            const order = {
                              id_part: tempIdPart,
                              description: tempItem,
                              quantity: tempQuantity,
                              unit: tempUnit,
                              stock: "Stock",
                              id_service: "",
                              note: "",
                            };
                            newList.push(order);
                            setEmptyListAlert(false);
                          }

                          //setListOrder();
                          setListOrder(newList);
                          setTempItem("");
                          setTempQuantity("");
                          setTempUnit("");
                          focusKeyword.current.focus();
                          console.log(listOrder);
                        }
                      }}
                    />
                  </div>
                  <div className="ml-3"></div>
                  <div className="w-1/2">
                    <CommonInput
                      input={tempUnit}
                      isDisabled={true}
                    ></CommonInput>
                  </div>
                </div>
                <div>
                  {keyword.length >= 3 ? (
                    searchNotFound ? (
                      <div>ga ketemu</div>
                    ) : (
                      <div className="mt-2">
                        <div className="h-40 overflow-y-auto bg-white">
                          <table className="w-full">
                            <tbody>
                              {filteredList.map((item, index) => {
                                return (
                                  <tr
                                    className={`cursor-default hover:bg-secondary hover:text-white ${index % 2 === 0 ? "bg-gray" : "bg-white"}`}
                                    key={index}
                                    onClick={() => {
                                      console.log(item.description);
                                      setTempIdPart(item.id_part);
                                      setTempItem(item.description);
                                      setTempAvailableQuantity(
                                        item.available_quantity,
                                      );
                                      setTempUnit(item.unit);
                                      setKeyword("");
                                      if (focusTempQuantity.current) {
                                        focusTempQuantity.current.focus();
                                      }
                                    }}
                                  >
                                    <td>{item["description"]}</td>
                                    <td>{item["vendor_code"]}</td>
                                    <td>{item["remark"]}</td>
                                    <td>{item["available_quantity"]}</td>
                                    <td>{item["unit"]}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )
                  ) : (
                    <></>
                  )}
                </div>
              </PageCard>

              <div className="p-3"></div>
              <PageCard>
                <div className="">
                  <div className="mb-3 text-success">Non Stock </div>

                  <div className="flex flex-row justify-evenly">
                    <div className="w-full">
                      <div className="mb-2  flex flex-row justify-evenly">
                        <div className="w-full ">Deskripsi</div>
                        <div className="w-full ">
                          <CommonInput
                            input={nonStockDescription}
                            onInputChange={(val) => {
                              setNonStockDescription(val);
                            }}
                            errorMessage={"Required"}
                            error={nonStockDescriptionError}
                            onKeyChange={() => {
                              setNonStockDescriptionError(false);
                            }}
                          ></CommonInput>
                        </div>
                      </div>
                      <div className="mb-2  flex flex-row justify-evenly">
                        <div className="w-full ">Quantity</div>
                        <div className="w-full ">
                          <CommonInput
                            type={"number"}
                            input={nonStockQuantity}
                            onInputChange={(val) => {
                              setNonStockQuantity(val);
                            }}
                            errorMessage="Required"
                            error={nonStockQuantityError}
                            onKeyChange={() => {
                              setNonStockQuantityError(false);
                            }}
                          ></CommonInput>
                        </div>
                      </div>

                      <div className="mb-2  flex flex-row justify-evenly">
                        <div className="w-full ">Unit</div>
                        <div className="w-full ">
                          <CommonInput
                            input={inputUnit}
                            onInputChange={(val) => {
                              setInputUnit(val);
                            }}
                            errorMessage="Required"
                            error={inputUnitError}
                            onKeyChange={() => {
                              setInputUnitError(false);
                            }}
                          ></CommonInput>
                        </div>
                      </div>

                      <div className="flex  flex-row justify-evenly">
                        <div className="w-full ">
                          <CommonInput
                            input={keywordRequest}
                            onInputChange={(val) => {
                              setKeywordRequest(val);
                            }}
                          >
                            <HiOutlineSearch />
                          </CommonInput>
                        </div>
                      </div>
                    </div>
                    <div className="px-3" />
                    <div className="w-full">
                      <div className="mb-2  flex flex-row justify-evenly">
                        <div className="w-full ">ID Service</div>
                        <div className="w-full ">
                          <CommonInput
                            input={inputIdService}
                            isDisabled={true}
                          ></CommonInput>
                        </div>
                      </div>
                      <div className="flex  flex-row justify-evenly">
                        <div className="w-full ">Note</div>
                        <div className="w-full ">
                          <CommonInput
                            input={inputNote}
                            onInputChange={(val) => {
                              setInputNote(val);
                            }}
                            errorMessage={"Required"}
                            error={inputNoteError}
                            onKeyChange={() => {
                              setInputNoteError(false);
                            }}
                          ></CommonInput>
                        </div>
                      </div>
                    </div>
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

                  <div className="mt-2 flex justify-end">
                    <CommonButton
                      label="Insert"
                      onClick={() => {
                        //validasi
                        const error = [0, 0, 0, 0];
                        if (nonStockDescription == "") {
                          setNonStockDescriptionError(true);
                          error[0] = 1;
                        } else {
                          setNonStockDescriptionError(false);
                          error[0] = 0;
                        }

                        if (nonStockQuantity == "") {
                          setNonStockQuantityError(true);
                          error[1] = 1;
                        } else {
                          setNonStockQuantityError(false);
                          error[1] = 0;
                        }

                        if (inputNote == "") {
                          setInputUnitError(true);
                          error[2] = 1;
                        } else {
                          setInputUnitError(false);
                          error[2] = 0;
                        }

                        if (inputNote == "") {
                          setInputNoteError(true);
                          error[2] = 1;
                        } else {
                          setInputNoteError(false);
                          error[2] = 0;
                        }

                        const errorSum = error.reduce(
                          (accum, current) => accum + current,
                          0,
                        );
                        if (errorSum == 0) {
                          const newList = [...listOrder];
                          const order = {
                            id_part: listOrder.length,
                            description: nonStockDescription,
                            quantity: nonStockQuantity,
                            unit: inputUnit,
                            stock: "Non Stock",
                            id_service: inputIdService,
                            note: inputNote,
                          };
                          newList.push(order);
                          setListOrder(newList);
                          setEmptyListAlert(false);

                          //kosongkan data
                          setNonStockDescription("");
                          setNonStockQuantity("");
                          setNonStockIdService("");
                          setInputIdService("");
                          setInputNote("");
                        }
                      }}
                    ></CommonButton>
                  </div>
                </div>
              </PageCard>

              <div className="p-3"></div>
              <PageCard>
                {emptyListAlert ? (
                  <div className="mb-5 flex flex-row items-center rounded-lg border p-2">
                    <GoAlert className="text-warning"></GoAlert>

                    <div className="ml-2 text-warning">
                      List ini tidak boleh kosong
                    </div>
                  </div>
                ) : (
                  <></>
                )}
                <div className="min-h-40">
                  <table className="w-full">
                    <thead className="bg-black">
                      <tr>
                        <th>No</th>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Unit</th>
                        <th>ID Service</th>
                        <th>Stock</th>
                        <th>Note</th>

                        <th>Opsi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listOrder.map((item, index) => {
                        return (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{item.description}</td>
                            <td>{item.quantity}</td>
                            <td>{item.unit}</td>
                            <td>{item.id_service}</td>
                            <td>{item.stock}</td>
                            <td>{item.note}</td>
                            <td>
                              <div
                                onClick={() => {
                                  const foundIndex = listOrder.findIndex(
                                    (value) => value.id_part == item.id_part,
                                  );

                                  const list = [...listOrder];
                                  list.splice(foundIndex, 1);
                                  setListOrder(list);
                                }}
                              >
                                delete
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="mb-3"></div>
                <div className="flex justify-end">
                  <CommonButton
                    label={"Save"}
                    onClick={save_item}
                    onload={loadingSubmit}
                    disabled={loadingSubmit}
                  />
                </div>
              </PageCard>
            </div>
          </DefaultLayout>
        )}
      </div>
    </UserAuth>
  );
}
