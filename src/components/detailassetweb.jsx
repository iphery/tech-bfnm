"use client";
import { API_URL, IMAGE_ASSET, IMAGE_USER } from "@/utils/constant";
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
import {
  formatDate,
  formatDateLocal,
  formatDateTime1,
} from "@/utils/dateformat";
import { useInView } from "@/utils/inview";
import { IoIosCheckbox } from "react-icons/io";
import { MdCheckBox, MdCheckBoxOutlineBlank } from "react-icons/md";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css"; // Import default styles
import { Tooltip as ReactTooltip } from "react-tooltip";

export default function DetailAssetWeb({ idAsset }) {
  const router = useRouter();

  const [dataAsset, setDataAsset] = useState({});
  const [dataService, setDataService] = useState([]);
  const [loader, setLoader] = useState(true);

  const [keyword, setKeyword] = useState("");
  const [keywordError, setKeywordError] = useState(false);
  const [switchPage, setSwitchPage] = useState(false);
  const [selectedCase, setSelectedCase] = useState("");

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

  const [isBottom, setIsBottom] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState([]);
  const [openImage, setOpenImage] = useState(false);
  const [openImageUser, setOpenImageUser] = useState(false);

  //order part
  const [transactionStock, setTransactionStock] = useState([]);

  const [ref, isInView, hasBeenSeen] = useInView({
    threshold: 0.1, // Trigger when 10% of the element is visible
  });

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
      //setFilteredDataService(array);
      setDataService(array);
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

  const fetch_data_service2 = () => {
    const filterService = dataService.filter((item) =>
      item["Problem"].toLowerCase().includes(keyword.toLowerCase()),
    );

    console.log(filterService);
    const { data, pageCurrent, pageLast } = paginateData(
      filterService,

      currentPage,
      itemPerPage,
    );

    setFilteredDataService(data);
    setLastPage(pageLast);
    //setItemPerPage(5);
    if (pageCurrent < pageLast) {
      //setShowLoadMore(true);
      if (isBottom) {
        setItemPerPage(itemPerPage + 5);
        setIsBottom(false);
      }
    } else {
      setShowLoadMore(false);
    }
    console.log(data);
    console.log(pageLast);
  };

  useEffect(() => {
    fetch_data_service2();
  }, [keyword, dataService, isBottom]);

  /*
  useEffect(() => {
    const filterData = listStock.filter((item) =>
      item["description"].toLowerCase().includes(keywordStock.toLowerCase()),
    );
    // console.log(filterData);
    setFilteredStock(filterData);
  }, [keywordStock]);
  */

  const [userLevel, setUserLevel] = useState("");

  useEffect(() => {
    const user = localStorage.getItem("info");
    if (user != null) {
      const parseUser = JSON.parse(user);
      const userlevel = parseUser[0]["Level"];
      setUserLevel(userlevel);
    }
  }, []);

  /*
  useEffect(() => {
    if (hasBeenSeen) {
      console.log("keliaan");
      setItemPerPage(itemPerPage + 5);
    }
    console.log("refresh");
  }, [hasBeenSeen]);
  */

  useEffect(() => {
    fetch_data_service2();
  }, [itemPerPage]);

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
                          <div className="flex justify-between px-5 py-2">
                            <div>Kategory PM</div>
                            <div>{dataAsset.PM_Category}</div>
                          </div>
                          <div className="flex justify-center px-5 py-2">
                            <div className="">
                              {dataAsset.Image == null ||
                              dataAsset.Image == "" ? (
                                <div className="flex h-100 items-center justify-center">
                                  No Image
                                </div>
                              ) : (
                                <>
                                  <div>
                                    <img
                                      data-tooltip-id="my-tooltip-2"
                                      onClick={() => setOpenImage(true)}
                                      className="h-[100px] w-[100px] rounded-full object-cover"
                                      src={`${IMAGE_ASSET}/${dataAsset.Image}`}
                                    />
                                    <Lightbox
                                      open={openImage}
                                      close={() => setOpenImage(false)}
                                      slides={[
                                        {
                                          src: `${IMAGE_ASSET}/${dataAsset.Image}`,
                                        },
                                        {
                                          src: `${IMAGE_USER}/${dataAsset.Profile_Image}`,
                                        },
                                      ]} // Pass the single image as a slide
                                    />
                                  </div>
                                  <ReactTooltip
                                    id="my-tooltip-2"
                                    place="bottom"
                                    content="Click to preview image."
                                  />
                                </>
                              )}
                            </div>

                            <div className="ml-10">
                              {dataAsset.Profile_Image == null ||
                              dataAsset.Profile_Image == "" ? (
                                <div className="flex h-100 items-center justify-center">
                                  No Image
                                </div>
                              ) : (
                                <>
                                  <div>
                                    <img
                                      data-tooltip-id="my-tooltip-1"
                                      onClick={() => setOpenImageUser(true)}
                                      className="h-[100px] w-[100px] rounded-full object-cover"
                                      src={`${IMAGE_USER}/${dataAsset.Profile_Image}`}
                                    />
                                    <Lightbox
                                      open={openImageUser}
                                      close={() => setOpenImageUser(false)}
                                      slides={[
                                        {
                                          src: `${IMAGE_USER}/${dataAsset.Profile_Image}`,
                                        },
                                        {
                                          src: `${IMAGE_ASSET}/${dataAsset.Image}`,
                                        },
                                      ]} // Pass the single image as a slide
                                    />
                                  </div>
                                  <ReactTooltip
                                    id="my-tooltip-1"
                                    place="bottom"
                                    content="Click to preview image."
                                  />
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </PageCard>
                  <div className="mb-5"></div>
                  <PageCardLimited>
                    <div className="flex items-center justify-between p-5">
                      <div>PT Balifoam Nusamegah</div>
                      <div className="border px-2">F.BFNM.026/0</div>
                    </div>
                    <div className="my-1 text-center font-bold">
                      Kartu Identitas Riwayat
                    </div>
                    <div className="text-center text-sm">
                      Perawatan / Perbaikan
                    </div>
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

                        <div className="">
                          <table className="w-full">
                            <thead className=" h-10 bg-black">
                              <tr>
                                <th
                                  onClick={() => {
                                    console.log(selectedCase);
                                  }}
                                >
                                  ID Request
                                </th>
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
                                    <td
                                      index={index}
                                      className="p-2 text-center"
                                    >
                                      <div
                                        className={` ${item["ID_Request"] === selectedCase.ID_Request ? "bg-white text-strokedark shadow-md" : ""}`}
                                        onClick={() => {
                                          setSelectedCase(item);
                                          if (
                                            item["Maintenance_Type"] == "PM" &&
                                            item["new_checklist"] != ""
                                          ) {
                                            const checklist = JSON.parse(
                                              item["new_checklist"],
                                            );
                                            setSelectedChecklist(checklist);
                                            console.log("ni checklist");
                                            console.log(checklist);
                                          } else {
                                            setSelectedChecklist([]);
                                          }

                                          console.log(item);
                                        }}
                                      >
                                        {item["ID_Request"]}
                                      </div>
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
                          {currentPage == lastPage ? (
                            <></>
                          ) : (
                            <div
                              className="mt-20"
                              onClick={() => {
                                if (currentPage < lastPage) {
                                  setItemPerPage(itemPerPage + 5);
                                }

                                console.log(currentPage);
                                console.log(lastPage);
                              }}
                            >
                              Load more...
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </PageCardLimited>
                  <div className="mb-5"></div>
                  {selectedCase != "" ? (
                    <PageCard>
                      <div className="p-5">
                        <div className="flex items-center justify-between">
                          <div>PT Balifoam Nusamegah</div>
                          <div className="border px-2">F.BFNM.025/0</div>
                        </div>
                        <div className="my-5 text-center font-bold">
                          Surat Permohonan Perbaikan / Perawatan
                        </div>
                        <div className="flex justify-evenly">
                          <div className="w-full">
                            <div className="flex items-center justify-between">
                              <div className="">ID Asset</div>

                              <div>{dataAsset.ID_Asset}</div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="">Deskripsi</div>

                              <div>{dataAsset.Description}</div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="">Model</div>

                              <div>{dataAsset.Manufacture}</div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="">User</div>

                              <div>{dataAsset.User}</div>
                            </div>
                          </div>
                          <div className="w-1/4"></div>
                          <div className="w-full">
                            <div className="flex items-center justify-between">
                              <div className="">No. Registrasi</div>

                              <div>{selectedCase.ID_Request}</div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="">Tanggal</div>

                              <div>
                                {formatDateLocal(selectedCase.Time_Request)}
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="">Pemohon</div>

                              <div>{selectedCase.Requestor}</div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-10 flex justify-evenly">
                          <div className="w-full border text-center">
                            Keluhan
                          </div>
                          <div className="w-full border text-center">
                            Tindakan
                          </div>
                        </div>
                        <div className="flex min-h-40 justify-evenly">
                          <div className="w-full border p-1">
                            {selectedCase.Problem}
                          </div>
                          <div className="w-full border p-1">
                            {selectedCase.Solution}
                          </div>
                        </div>

                        <div className="justify-evenlty mt-10 flex">
                          <div className="w-full text-center">
                            <div className="mb-10">Teknisi</div>

                            <div>{selectedCase.Technician}</div>
                            <div className="text-sm">
                              {formatDateTime1(selectedCase.Time_Response)}
                            </div>
                          </div>
                          <div className="w-full text-center">
                            <div className="mb-10">SPV Teknisi</div>

                            <div>{selectedCase.Tech_SPV_Name}</div>
                            <div className="text-sm">
                              {formatDateTime1(selectedCase.Tech_SPV)}
                            </div>
                          </div>
                          <div className="w-full text-center">
                            <div className="mb-10">Mengetahui</div>

                            <div>
                              {selectedCase.Prod_SPV_Name == "" &&
                              selectedCase.Step == 7
                                ? selectedCase.Requestor
                                : selectedCase.Prod_SPV_Name}
                            </div>
                            <div className="text-sm">
                              {formatDateTime1(selectedCase.Prod_SPV)}
                            </div>
                          </div>
                        </div>
                      </div>
                      {selectedChecklist ? (
                        <div className="mt-10">
                          <hr />
                          <div className=" p-5">
                            <div>Checklist</div>
                            {selectedCase.new_checklist != null ? (
                              <div>
                                {selectedChecklist.map((item, index) => {
                                  return (
                                    <div
                                      key={index}
                                      className="flex items-center justify-between"
                                    >
                                      <li>{item.description}</li>
                                      <div>
                                        {item.widget == "C" ? (
                                          item.checked ? (
                                            <MdCheckBox />
                                          ) : (
                                            <MdCheckBoxOutlineBlank />
                                          )
                                        ) : (
                                          <div className="">{item.value}</div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <></>
                            )}
                          </div>
                        </div>
                      ) : (
                        <></>
                      )}
                    </PageCard>
                  ) : (
                    <></>
                  )}
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
