"use client";
import React, { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useMediaQuery } from "react-responsive";
import { IMAGE_ASSET, API_URL } from "@/utils/constant";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import UserAuth from "@/components/auth";
import { CommonInput } from "@/components/input";
import { HiOutlineSearch } from "react-icons/hi";
import { useRouter } from "next/navigation";
import { GoAlert, GoChevronRight } from "react-icons/go";
import { CommonButton } from "@/components/button";
import { toast } from "react-toastify";
import { AlertMessage, NotifyError, NotifySuccess } from "@/utils/notify";
import Loader from "@/components/common/Loader";
import { CommonLoader, PageLoader } from "@/components/loader";
import { PageCard } from "@/components/card";
import { TbArrowsExchange2 } from "react-icons/tb";
import { IoWarningSharp } from "react-icons/io5";
import { IoMdRemoveCircle } from "react-icons/io";

export default function PartsOut() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const isSmallScreen = useMediaQuery({ query: "(max-width: 640px)" });
  const [loader, setLoader] = useState(true);
  const [detailData, setDetailData] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [filteredList, setFilteredList] = useState([]);

  const [keywordAsset, setKeywordAsset] = useState("");

  const [tempItem, setTempItem] = useState("");
  const [tempIdPart, setTempIdPart] = useState("");
  const [tempQuantity, setTempQuantity] = useState("");
  const [tempAvailableQuantity, setTempAvailableQuantity] = useState(0);
  const [tempUnit, setTempUnit] = useState("");
  const [tempTypePart, setTempTypePart] = useState("");
  const focusTempQuantity = useRef();
  const focusKeyword = useRef();

  const [searchNotFound, setSearchNotFound] = useState(false);
  const [searchAssetNotFound, setSearchAssetNotFound] = useState(false);
  const [idService, setIdService] = useState("");
  const [dataAsset, setDataAsset] = useState({
    id_asset: "",
    deskripsi: "",
    manufacture: "",
    model: "",
    no: "",
    type: "",
    user: "",
  });

  ///dari sini
  //input, error, error message

  const [categoryTrans, setCategoryTrans] = useState("Umum");

  const [inputReceiver, setInputReceiver] = useState("");
  const [inputReceiverError, setInputReceiverError] = useState(false);
  const [inputReceiverMessage, setInputReceiverMessage] = useState("");

  const [inputDate, setInputDate] = useState("");
  const [inputDateError, setInputDateError] = useState(false);
  const [inputDateMessage, setInputDateMessage] = useState("");

  const [listOrder, setListOrder] = useState([]);

  const [listAsset, setListAsset] = useState([]);
  const [filteredAsset, setFilteredAsset] = useState([]);

  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const [emptyListAlert, setEmptyListAlert] = useState(false);

  ///

  //const [lastPage, setLastPage] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetch_data = async () => {
    const apiUrl = `${API_URL}/stocklist`;
    const response = await axios.post(apiUrl, { keyword: keyword });

    if (response.status == 200) {
      const array = response.data["response"];
      const asset = response.data["asset"];
      console.log(asset);
      setDetailData(array);
      setListAsset(asset);
    }
    setLoading(false);
    setLoader(false);
  };

  useEffect(() => {
    fetch_data();
    const data_asset = localStorage.getItem("data_asset");
    const id_service = localStorage.getItem("id_service");
    setIdService(id_service);
    console.log(data_asset);
    if (data_asset !== "" && data_asset != null) {
      const parseData = JSON.parse(data_asset);

      setDataAsset({
        id_asset: parseData.ID_Asset,
        description: parseData.Description,
        manufacture: parseData.Manufacture,
        model: parseData.Model,
        no: parseData.No,
        type: parseData.Type,
        user: parseData.User,
      });
      setCategoryTrans("Service");
    } else {
      setCategoryTrans("Umum");
    }
  }, []);

  const search_list = () => {
    const filterData = detailData.filter((item) => {
      const arr_description =
        item["description"] &&
        item["description"].toLowerCase().includes(keyword.toLowerCase());

      const arr_vendor_code =
        item["vendor_code"] &&
        item["vendor_code"].toLowerCase().includes(keyword.toLowerCase());
      return arr_description || arr_vendor_code;
    });

    console.log(filterData);

    if (filterData.length == 0) {
      setSearchNotFound(true);
    } else {
      setSearchNotFound(false);
    }
    setFilteredList(filterData);
  };

  const search_asset = () => {
    const filterDataAsset = listAsset.filter((item) => {
      const arr_description =
        item["description"] &&
        item["description"].toLowerCase().includes(keywordAsset.toLowerCase());
      const arr_manufacture =
        item["manufacture"] &&
        item["manufacture"].toLowerCase().includes(keywordAsset.toLowerCase());
      const arr_model =
        item["model"] &&
        item["model"].toLowerCase().includes(keywordAsset.toLowerCase());
      const arr_no =
        item["no"] &&
        item["no"].toLowerCase().includes(keywordAsset.toLowerCase());
      /*
      const arr_vendor_code =
        item["vendor_code"] &&
        item["vendor_code"].toLowerCase().includes(keywordAsset.toLowerCase());*/
      return arr_description || arr_manufacture || arr_model || arr_no;
    });

    if (filterDataAsset.length == 0) {
      setSearchAssetNotFound(true);
    } else {
      setSearchAssetNotFound(false);
    }

    setFilteredAsset(filterDataAsset);
  };

  useEffect(() => {
    search_list();
  }, [keyword]);

  useEffect(() => {
    search_asset();
  }, [keywordAsset]);

  const save_data = async () => {
    setLoadingSubmit(true);
    console.log(inputDate); //harus input validasi
    console.log(inputReceiver); //harus input validasi
    console.log(idService); //jika kategory "Service"
    console.log(categoryTrans);
    console.log(dataAsset["id_asset"]);

    console.log(listOrder); //validasi kalo length = 0

    let error = [0, 0, 0];
    if (inputDate == null || inputDate == "") {
      setInputDateError(true);
      setInputDateMessage("Tidak boleh kosong");
      error[0] = 1;
    } else {
      setInputDateError(false);
      setInputDateMessage("");
      error[0] = 0;
    }

    if (inputReceiver == null || inputReceiver == "") {
      setInputReceiverError(true);
      setInputReceiverMessage("Tidak boleh kosong");
      error[1] = 1;
    } else {
      setInputReceiverError(false);
      setInputReceiverMessage("");
      error[1] = 0;
    }

    if (listOrder.length == 0) {
      setEmptyListAlert(true);
      error[2] = 1;
    } else {
      setEmptyListAlert(false);
      error[2] = 0;
    }

    const errorSum = error.reduce((accum, current) => accum + current, 0);
    if (errorSum == 0) {
      const user = localStorage.getItem("info");
      const parseUser = JSON.parse(user);

      const apiUrl = `${API_URL}/transout`;
      const response = await axios.post(apiUrl, {
        date: inputDate,
        receiver: inputReceiver,
        serviceId: idService,
        category: categoryTrans,
        assetId: dataAsset["id_asset"],
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
            {loader ? (
              <div className="flex items-center justify-center"></div>
            ) : (
              <>
                <div className="mb-3 flex items-center justify-start">
                  <div className="text-lg text-white">Stock Out</div>
                </div>

                <PageCard>
                  <div className="flex flex-row justify-evenly">
                    <div className="w-full">
                      <div className="mb-2 flex justify-between">
                        <div
                          onClick={() => {
                            console.log(detailData);
                          }}
                        >
                          Tanggal
                        </div>
                        <div className="w-1/2">
                          <CommonInput
                            type={"date"}
                            input={inputDate}
                            error={inputDateError}
                            errorMessage={inputDateMessage}
                            onInputChange={(val) => {
                              setInputDate(val);
                            }}
                            onChg={() => {
                              setInputDateError(false);
                            }}
                          ></CommonInput>
                        </div>
                      </div>
                      <div className="mb-2 flex justify-between">
                        <div>Penerima</div>
                        <div className="w-1/2">
                          <CommonInput
                            type={"text"}
                            input={inputReceiver}
                            error={inputReceiverError}
                            errorMessage={inputReceiverMessage}
                            onInputChange={(val) => {
                              setInputReceiver(val);
                            }}
                            onKeyChange={() => {
                              setInputReceiverError(false);
                            }}
                          ></CommonInput>
                        </div>
                      </div>
                      <div className="mb-2 flex justify-between">
                        <div>Nomer Service</div>
                        <div className="w-1/2">
                          <CommonInput isDisabled={true}>
                            {idService}
                          </CommonInput>
                        </div>
                      </div>
                      <div className="mb-2 flex justify-between">
                        <div className="flex justify-center">
                          <div>Category</div>
                          {categoryTrans == "Service" ? (
                            <div
                              className=" bg-grey ml-2 flex h-7 w-7 items-center justify-center rounded-full border border-black text-sm hover:bg-black"
                              onClick={() => {
                                setCategoryTrans("Umum");
                                setIdService("");
                                localStorage.setItem("id_service", "");
                                localStorage.setItem("data_asset", "");
                                setDataAsset({
                                  id_asset: "",
                                  deskripsi: "",
                                  manufacture: "",
                                  model: "",
                                  no: "",
                                  type: "",
                                  user: "",
                                });
                              }}
                            >
                              <TbArrowsExchange2 className="hover:text-white" />
                            </div>
                          ) : (
                            <></>
                          )}
                        </div>
                        <div className="w-1/2">
                          <CommonInput
                            isDisabled={true}
                            input={categoryTrans}
                          ></CommonInput>
                        </div>
                      </div>
                      {categoryTrans == "Umum" ? (
                        <div>
                          <div className="w-full">
                            <CommonInput
                              placeholder={"Search asset..."}
                              input={keywordAsset}
                              onInputChange={(val) => {
                                setKeywordAsset(val);
                                console.log(val);
                              }}
                            >
                              <HiOutlineSearch />
                            </CommonInput>
                          </div>
                        </div>
                      ) : (
                        <></>
                      )}
                    </div>

                    <div className="px-3" />
                    <div className="w-full">
                      <div className="mb-2 flex justify-between">
                        <div>Nomer Asset</div>
                        <div className="w-1/2">
                          <CommonInput
                            isDisabled={true}
                            input={dataAsset["id_asset"] || ""}
                          ></CommonInput>
                        </div>
                      </div>
                      <div className="mb-2 flex justify-between">
                        <div>Deskripsi</div>
                        <div className="w-1/2">
                          <CommonInput
                            isDisabled={true}
                            input={dataAsset["description"] || ""}
                          ></CommonInput>
                        </div>
                      </div>
                      <div className="mb-2 flex justify-between">
                        <div>Manufacture</div>
                        <div className="w-1/2">
                          <CommonInput
                            isDisabled={true}
                            input={dataAsset["manufacture"] || ""}
                          ></CommonInput>
                        </div>
                      </div>
                      <div className="mb-2 flex justify-between">
                        <div>Model</div>
                        <div className="w-1/2">
                          <CommonInput
                            isDisabled={true}
                            input={dataAsset["model"] || ""}
                          ></CommonInput>
                        </div>
                      </div>
                      <div className="mb-2 flex justify-between">
                        <div>User</div>
                        <div className="w-1/2">
                          <CommonInput
                            isDisabled={true}
                            input={dataAsset["user"] || ""}
                          ></CommonInput>
                        </div>
                      </div>
                    </div>
                  </div>
                  {keywordAsset.length >= 3 ? (
                    searchAssetNotFound ? (
                      <div className="flex flex-row items-center">
                        <IoWarningSharp />
                        <div className="ml-2">Not found</div>
                      </div>
                    ) : (
                      <div className="h-20 overflow-y-auto bg-white">
                        <table>
                          <tbody>
                            {filteredAsset.map((item, index) => {
                              return (
                                <tr
                                  key={index}
                                  className={`cursor-default hover:text-red`}
                                  onClick={() => {
                                    setKeywordAsset("");
                                    setDataAsset({
                                      id_asset: item["id_asset"],
                                      description: item["description"],
                                      manufacture: item["manufacture"],
                                      model: item["model"],
                                      no: item["no"],
                                      user: item["user"],
                                      unit: item["unit"],
                                    });
                                  }}
                                >
                                  <td className="w-1/5">{item["id_asset"]}</td>
                                  <td className="w-1/5">
                                    {item["type"] == "K"
                                      ? item["no"]
                                      : item["description"]}
                                  </td>
                                  <td className="w-1/5">
                                    {item["manufacture"]}
                                  </td>
                                  <td className="w-1/5">{item["model"]}</td>
                                  <td className="w-1/5">{item["user"]}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )
                  ) : (
                    <></>
                  )}
                </PageCard>
                <div className="mb-5"></div>
                <PageCard>
                  <div className="flex flex-row justify-evenly ">
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
                        placeholder={"Description"}
                        input={tempItem}
                        isDisabled={true}
                      ></CommonInput>
                    </div>
                    <div className="ml-3"></div>
                    <div className="w-1/2">
                      <CommonInput
                        placeholder={"Enter quantity"}
                        input={tempQuantity}
                        type="number"
                        reference={focusTempQuantity}
                        onInputChange={(val) => {
                          setTempQuantity(val);
                        }}
                        onKeyChange={(event) => {
                          if (event.key == "Enter") {
                            console.log(tempAvailableQuantity);
                            console.log(tempQuantity);

                            if (
                              parseInt(tempQuantity) >
                              parseInt(tempAvailableQuantity)
                            ) {
                              AlertMessage("Stock tidak cukup");
                            } else {
                              //cek jika exist
                              const newList = [...listOrder];
                              const findIndex = newList.findIndex(
                                (value) => value.id_part == tempIdPart,
                              );

                              if (findIndex != -1) {
                                const qty =
                                  parseInt(newList[findIndex].quantity) +
                                  parseInt(tempQuantity);

                                if (qty > tempAvailableQuantity) {
                                  AlertMessage("Stock tidak cukup");
                                } else {
                                  newList[findIndex].quantity = qty;
                                }

                                //exist
                              } else {
                                //not exist
                                const order = {
                                  id_part: tempIdPart,
                                  description: tempItem,
                                  type: tempTypePart,
                                  quantity: tempQuantity,
                                  unit: tempUnit,
                                };
                                newList.push(order);
                                setEmptyListAlert(false);
                              }

                              //setListOrder();
                              setListOrder(newList);
                            }
                            setTempItem("");
                            setTempQuantity("");
                            setTempUnit("");
                            setTempTypePart("");
                            focusKeyword.current.focus();
                            // console.log(listOrder);
                          }
                        }}
                      />
                    </div>
                  </div>

                  {emptyListAlert ? (
                    <div className="mt-5">
                      <div className="mb-5 flex flex-row items-center rounded-lg border p-2">
                        <GoAlert className="text-warning"></GoAlert>

                        <div className="ml-2 text-warning">
                          List ini tidak boleh kosong
                        </div>
                      </div>
                    </div>
                  ) : (
                    <></>
                  )}

                  <div>
                    {keyword.length >= 3 ? (
                      searchNotFound ? (
                        <div className="flex flex-row items-center">
                          <IoWarningSharp />
                          <div className="ml-2">Not found</div>
                        </div>
                      ) : (
                        <div className=" py-2">
                          <div className="h-40 overflow-y-auto bg-white">
                            <table className="w-full">
                              <tbody className="">
                                {filteredList.map((item, index) => {
                                  return (
                                    <tr
                                      className={`cursor-default hover:bg-secondary hover:text-white ${index % 2 === 0 ? "bg-gray" : "bg-white"}`}
                                      key={index}
                                      onClick={() => {
                                        console.log(item.description);
                                        setTempIdPart(item.id_part);
                                        setTempItem(
                                          item.description +
                                            " " +
                                            item.vendor_code,
                                        );
                                        setTempUnit(item.unit);
                                        setTempAvailableQuantity(
                                          item.available_quantity,
                                        );
                                        setTempTypePart(item.vendor_code);

                                        setKeyword("");
                                        if (focusTempQuantity.current) {
                                          focusTempQuantity.current.focus();
                                        }
                                      }}
                                    >
                                      <td className="w-1/5 ">
                                        {item["description"]}
                                      </td>
                                      <td className="w-1/5">
                                        {item["vendor_code"]}
                                      </td>

                                      <td className="w-1/5">
                                        {item["remark"]}
                                      </td>
                                      <td className="w-1/5 text-center">
                                        {item["available_quantity"]}
                                      </td>
                                      <td className="w-1/5 text-center">
                                        {item["unit"]}
                                      </td>
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

                  <div className="mb-5"></div>
                  <table className="w-full">
                    <thead>
                      <tr className="bg-black">
                        <th className="text-center">No</th>
                        <th className="text-center">Item</th>
                        <th className="text-center">Detail</th>

                        <th className="text-center">Quantity</th>
                        <th className="text-center">Unit</th>
                        <th className="text-center">Opsi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listOrder.map((item, index) => {
                        return (
                          <tr key={index}>
                            <td className="text-center">{index + 1}</td>
                            <td>{item.description}</td>
                            <td>{item.type}</td>
                            <td className="text-center">{item.quantity}</td>
                            <td className="text-center">{item.unit}</td>

                            <td>
                              <div
                                className="flex justify-center"
                                onClick={() => {
                                  const foundIndex = listOrder.findIndex(
                                    (value) => value.id_part == item.id_part,
                                  );

                                  const list = [...listOrder];
                                  list.splice(foundIndex, 1);
                                  setListOrder(list);
                                }}
                              >
                                <div className="h-5 w-5">
                                  <IoMdRemoveCircle className="hover:text-white" />
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="mb-20"></div>

                  <div className="flex justify-end">
                    <CommonButton
                      label={"Submit"}
                      onload={loadingSubmit}
                      disabled={loadingSubmit}
                      onClick={() => {
                        save_data();
                        //router.back();
                      }}
                    />
                  </div>
                </PageCard>
              </>
            )}
          </DefaultLayout>
        )}
      </div>
    </UserAuth>
  );
}
