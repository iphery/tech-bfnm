"use client";
import { API_URL } from "@/utils/constant";
import paginateData from "@/utils/pagination";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import UserAuth from "./auth";
import DefaultLayout from "./Layouts/DefaultLayout";
import { TableContent, TableHeader } from "./table";
import { FaPlus } from "react-icons/fa";
import { CustomModal } from "./modal";
import { CommonInput } from "@/components/input";
import { CommonButton } from "./button";
import { useAsync } from "react-select/async";
import { HiArrowRight, HiMinus, HiOutlineSearch, HiPlus } from "react-icons/hi";
import { PageLoader } from "./loader";
import { PageCard, PageCardLimited } from "@/components/card";
import { formatDate } from "@/utils/dateformat";

export default function DetailAssetWeb({ idAsset }) {
  const router = useRouter();

  const [dataAsset, setDataAsset] = useState({});
  const [dataService, setDataService] = useState([]);
  const [loader, setLoader] = useState(true);

  const [keyword, setKeyword] = useState("");
  const [keywordError, setKeywordError] = useState(false);
  const [switchPage, setSwitchPage] = useState(false);
  const [selectedCase, setSelectedCase] = useState([]);

  const [itemPerPage, setItemPerPage] = useState(5);
  const [filteredDataService, setFilteredDataService] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(0);
  const [showLoadMore, setShowLoadMore] = useState(false);

  const [modalStocks, setModalStocks] = useState(false);
  const [listStock, setListStock] = useState([]);
  const [filteredStock, setFilteredStock] = useState([]);
  const [keywordStock, setKeywordStock] = useState("");
  const [enabledAddButton, setEnabledAddButton] = useState([]);

  //order part
  const [transactionStock, setTransactionStock] = useState([]);

  const fetch_data = async () => {
    const apiUrl = `${API_URL}/fetchassetdetail`;
    const response = await axios.post(apiUrl, {
      idAsset: idAsset,
    });

    if (response.status == 200) {
      // console.log(response.data["detail"][0].ID_Asset);
      const detail = response.data["detail"][0];

      setDataAsset(detail);
    }

    setLoader(false);
  };

  const fetch_data_service = async () => {
    const apiUrl = `${API_URL}/fetchassetservice`;
    const response = await axios.post(apiUrl, {
      idAsset: idAsset,
      keyword: keyword,
    });

    if (response.status == 200) {
      const array = response.data["service"];
      console.log("dfd");
      console.log(array);
      setFilteredDataService(array);
      //setDataService(array);
    }
  };

  /*
  const fetch_detail_service = async (id) => {
    //console.log(id);
    const apiUrl = `${API_URL}/fetchdetailservice`;
    const response = await axios.post(apiUrl, {
      idRequest: id,
    });

    if (response.status == 200) {
      const array = response.data["response"][0];
      setSelectedCase(array);
    }
  };
*/
  const fetch_stock = async () => {
    const apiUrl = `${API_URL}/stocklist`;
    const response = await axios.post(apiUrl);
    const data = response.data["response"];
    setListStock(data);
    setEnabledAddButton([]);
    let enAddButton = [];
    data.map((item) => {
      enAddButton.push(item["id_part"]);
    });
    setEnabledAddButton(enAddButton);
  };

  useEffect(() => {
    fetch_data();
  }, [keyword]);

  useEffect(() => {
    fetch_data_service();
  }, [dataAsset]);

  useEffect(() => {
    if (modalStocks) {
      fetch_stock();
    }
  }, [modalStocks]);

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
  }, [keyword, dataAsset, itemPerPage]);

  useEffect(() => {
    const filterData = listStock.filter((item) =>
      item["description"].toLowerCase().includes(keywordStock.toLowerCase()),
    );
    // console.log(filterData);
    setFilteredStock(filterData);
  }, [keywordStock]);

  const [userLevel, setUserLevel] = useState("");

  useEffect(() => {
    const user = localStorage.getItem("info");
    if (user != null) {
      const parseUser = JSON.parse(user);
      const userlevel = parseUser[0]["Level"];
      setUserLevel(userlevel);
    }
  }, []);

  return (
    <UserAuth>
      {loader ? (
        <PageLoader />
      ) : (
        <div className="relative">
          <div className="absolute z-0 h-full w-full">
            <div className="min-h-screen  bg-boxdark-2">
              <DefaultLayout>
                <div className="flex min-h-[calc(100vh-115px)] flex-col text-info">
                  <div className="mb-3 flex items-center justify-start">
                    <div className="text-lg text-white">Asset Detail</div>
                  </div>
                  <PageCard>
                    <div className="flex  flex-col">
                      <div className="flex=row flex justify-evenly">
                        <div className="w-full">
                          <div>
                            <div className="flex justify-between px-5 py-2">
                              <div>Kode</div>
                              <div>{dataAsset.ID_Asset}</div>
                            </div>
                            <div className="flex justify-between px-5 py-2">
                              <div>Deskripsi</div>
                              <div>{dataAsset.Description}</div>
                            </div>
                          </div>
                          <div className="flex justify-between px-5 py-2">
                            <div>Manufacture</div>
                            <div>{dataAsset.Manufacture}</div>
                          </div>
                          <div className="flex justify-between px-5 py-2">
                            <div>Model</div>
                            <div>{dataAsset.Model}</div>
                          </div>
                          <div className="flex justify-between px-5 py-2">
                            <div>User</div>
                            <div>{dataAsset.User}</div>
                          </div>
                        </div>
                        <div className="w-full">
                          <div>
                            <div className="flex justify-between px-5 py-2">
                              <div>Kategory PM</div>
                              <div>{dataAsset.PM_Category}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </PageCard>
                  <div className="mb-5"></div>
                  <PageCardLimited>
                    <div className="flex  flex-col">
                      <div className="p-5">
                        <div className="flex flex-row items-center">
                          <div className="mb-5 w-1/2">
                            <CommonInput
                              input={keyword}
                              type={"text"}
                              onInputChange={(val) => {
                                //setKeyword(val);
                                //  fetch_data();
                                setKeyword(val);
                              }}
                              placeholder={"Search"}
                            >
                              <HiOutlineSearch />
                            </CommonInput>
                          </div>
                        </div>
                        <div className="h-[calc(100vh-520px)] overflow-y-auto">
                          <table className="w-full">
                            <thead className="sticky top-0 h-10 bg-black">
                              <tr>
                                <th>ID Request</th>
                                <th>Date</th>
                                <th>Requestor</th>
                                <th>Kendala</th>
                                <th>Status</th>
                                <th>Part</th>
                                <th>Service</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredDataService.map((item, index) => {
                                let status = "Issued";
                                let cardColor = "bg-red";
                                switch (item["Step"]) {
                                  case "2":
                                    status = "Responsed";
                                    cardColor = "bg-warning";
                                    break;
                                  case "3":
                                    status = "Waiting part";
                                    cardColor = "bg-warning";
                                    break;
                                  case "4":
                                    status = "Repairing";
                                    cardColor = "bg-warning";
                                    break;
                                  case "5":
                                    status = "Completed";
                                    cardColor = "bg-meta-10";
                                    break;
                                  case "6":
                                    status = "Checked";
                                    cardColor = "bg-meta-10";
                                    break;
                                  case "7":
                                    status = "Accepted";
                                    cardColor = "bg-success";
                                    break;

                                  default:
                                    "";
                                }

                                return (
                                  <tr key={index} className={`cursor-default`}>
                                    <td index={index} className="p-2">
                                      {item["ID_Request"]}
                                    </td>
                                    <td>{formatDate(item["Time_Request"])}</td>
                                    <td index={index}>{item["Requestor"]}</td>
                                    <td index={index}>{item["Problem"]}</td>
                                    <td>
                                      <div
                                        className={`flex items-center justify-center rounded-md p-1 ${cardColor} text-sm text-white`}
                                      >
                                        {status}
                                      </div>
                                    </td>
                                    <td className="text-center" index={index}>
                                      {parseInt(userLevel) <= 2 ? (
                                        <div className="">
                                          {parseInt(item["Step"]) >= 3 &&
                                          parseInt(item["Step"]) <= 5 ? (
                                            <div
                                              onClick={() => {
                                                //setModalStocks(true);
                                                const assetInfo =
                                                  JSON.stringify(dataAsset);
                                                localStorage.setItem(
                                                  "data_asset",
                                                  assetInfo,
                                                );
                                                localStorage.setItem(
                                                  "id_service",
                                                  item["ID_Request"],
                                                );
                                                router.push("/partsout");
                                              }}
                                              className="flex h-6 w-6 cursor-default items-center justify-center rounded-full  p-2 hover:bg-black"
                                            >
                                              <FaPlus />
                                            </div>
                                          ) : (
                                            <></>
                                          )}
                                        </div>
                                      ) : (
                                        <></>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </PageCardLimited>
                </div>
              </DefaultLayout>
            </div>
          </div>

          <CustomModal
            isVisible={modalStocks}
            onClose={() => {
              setModalStocks(false);
            }}
          >
            <div className="flex w-full justify-evenly">
              <div className="w-full">
                <div>
                  <CommonInput
                    input={keywordStock}
                    onInputChange={(val) => {
                      setKeywordStock(val);
                    }}
                    error={false}
                    type={"text"}
                    placeholder={"Search stock"}
                  ></CommonInput>
                  <div className="">
                    <table className="w-full border">
                      <div className="h-30 overflow-y-auto">
                        <thead>
                          <tr>
                            <th className="text-center">Deskripsi</th>
                            <th className="bg-red text-center">Quantity</th>
                            <th className="text-center">Unit</th>
                            <th>Opsi</th>
                          </tr>
                        </thead>

                        <tbody>
                          {filteredStock.map((item, index) => {
                            return (
                              <tr key={index}>
                                <td>{item["description"]}</td>
                                <td className="bg-red text-center">
                                  {item["quantity"]}
                                </td>
                                <td className="text-center">{item["unit"]}</td>
                                <td>
                                  {enabledAddButton.includes(
                                    item["id_part"],
                                  ) ? (
                                    <div className="flex justify-center">
                                      <div
                                        className="cursor-detail flex h-5 w-5 items-center justify-center rounded-full bg-red hover:bg-black"
                                        onClick={() => {
                                          const updateStock = [
                                            ...transactionStock,
                                          ];
                                          setTransactionStock([]);

                                          let foundIndex =
                                            updateStock.findIndex(
                                              (value) =>
                                                value.id_part ==
                                                item["id_part"],
                                            );

                                          if (foundIndex == -1) {
                                            updateStock.push({
                                              id_part: item["id_part"],
                                              quantity: 1,
                                              description: item["description"],
                                            });
                                          } else {
                                            const qty =
                                              updateStock[foundIndex].quantity +
                                              1;
                                            updateStock[foundIndex] = {
                                              id_part: item["id_part"],
                                              quantity: qty,
                                              description: item["description"],
                                            };
                                          }
                                          setEnabledAddButton(
                                            enabledAddButton.filter(
                                              (val) => val !== item["id_part"],
                                            ),
                                          );
                                          setTransactionStock(updateStock);
                                          console.log(transactionStock);
                                        }}
                                      >
                                        <HiArrowRight />
                                      </div>
                                    </div>
                                  ) : (
                                    <></>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </div>
                    </table>
                  </div>

                  <div className="mb-5"></div>
                  <div>
                    <div>Not find in stock ? You can import the data</div>
                    <div className="h-30">
                      <CommonInput type={"file"}></CommonInput>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <CommonButton label={"Import"} />
                  </div>
                </div>
              </div>
              <div className="px-2"></div>
              <div className="w-full">
                <div>
                  <div
                    onClick={() => {
                      console.log(enabledAddButton);
                    }}
                  >
                    Stock
                  </div>
                  <div className="h-30">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th>Deskripsi</th>
                          <th>Quantity</th>
                          <th>Uni</th>
                          <th>Opsi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactionStock.map((item, index) => {
                          return (
                            <tr key={index}>
                              <td>{item["description"]}</td>
                              <td>{item["quantity"]}</td>
                              <td>pcs</td>
                              <td>
                                <div className="flex justify-center">
                                  <div
                                    className="cursor-detail flex h-5 w-5 items-center justify-center rounded-full bg-red hover:bg-black"
                                    onClick={() => {
                                      const updateStock = [...transactionStock];
                                      setTransactionStock([]);

                                      let foundIndex = updateStock.findIndex(
                                        (value) =>
                                          value.id_part == item["id_part"],
                                      );

                                      if (foundIndex == -1) {
                                        updateStock.push({
                                          id_part: item["id_part"],
                                          quantity: 1,
                                          description: item["description"],
                                        });
                                      } else {
                                        const qty =
                                          updateStock[foundIndex].quantity + 1;
                                        updateStock[foundIndex] = {
                                          id_part: item["id_part"],
                                          quantity: qty,
                                          description: item["description"],
                                        };
                                      }
                                      setEnabledAddButton(
                                        enabledAddButton.filter(
                                          (val) => val !== item["id_part"],
                                        ),
                                      );
                                      setTransactionStock(updateStock);
                                      console.log(transactionStock);
                                    }}
                                  >
                                    <HiPlus></HiPlus>
                                  </div>
                                  <div className="mr-2"></div>
                                  <div
                                    className="cursor-detail flex h-5 w-5 items-center justify-center rounded-full bg-red hover:bg-black"
                                    onClick={() => {
                                      const updateStock = [...transactionStock];
                                      setTransactionStock([]);

                                      let foundIndex = updateStock.findIndex(
                                        (value) =>
                                          value.id_part == item["id_part"],
                                      );

                                      const qty =
                                        updateStock[foundIndex].quantity - 1;
                                      const id_part =
                                        updateStock[foundIndex].id_part;
                                      if (qty < 1) {
                                        console.log(foundIndex);
                                        updateStock.splice(foundIndex, 1);
                                        setEnabledAddButton((prev) => {
                                          // Check if id is already in the array
                                          if (prev.includes(id_part)) {
                                            // Optionally remove id if it exists
                                            return prev.filter(
                                              (item) => item !== id_part,
                                            );
                                          } else {
                                            // Add id to the array if it does not exist
                                            return [...prev, id_part];
                                          }
                                        });
                                      } else {
                                        updateStock[foundIndex] = {
                                          id_part: item["id_part"],
                                          quantity: qty,
                                          description: item["description"],
                                        };
                                      }
                                      console.log(updateStock);
                                      setTransactionStock(updateStock);
                                    }}
                                  >
                                    <HiMinus />
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </CustomModal>
        </div>
      )}
    </UserAuth>
  );
}
