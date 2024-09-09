"use client";
import { Appbar } from "@/components/appbar";
import {
  API_URL,
  IMAGE_ASSET,
  IMAGE_GALLERY,
  IMAGE_PROFILE,
  IMAGE_USER,
} from "@/utils/constant";
import { formatDateTime } from "@/utils/dateformat";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AiTwotonePicture } from "react-icons/ai";
import { FaRegCalendarAlt, FaRegUser } from "react-icons/fa";
import { useMediaQuery } from "react-responsive";
import { DataProvider, useProvider } from "@/app/appcontext";
import UserAuth from "@/components/auth";
import { CommonInput, CommonInputFile } from "@/components/input";
import { HiOutlineSearch } from "react-icons/hi";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { IoAdd } from "react-icons/io5";
import { CustomModal } from "@/components/modal";
import { CommonButton, CommonButtonFull } from "@/components/button";
import { CustomSelect } from "@/components/select";
import { NotifySuccess } from "@/utils/notify";

export default function ListAsset() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const isSmallScreen = useMediaQuery({ query: "(max-width: 640px)" });

  const [detailData, setDetailData] = useState([]);
  const [countData, setCountData] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [keywordError, setKeywordError] = useState(false);
  const [filteredList, setFilteredList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const {
    listUtility,
    setListUtility,
    loadUtility,
    setLoadUtility,
    searchUtility,
    setSearchUtility,
    imageUtility,
    setImageUtility,
  } = useProvider();

  const [modalRequest, setModalRequest] = useState(false);

  const groupType = [
    { label: "Telepon", value: "Telepon" },
    { label: "Lampu / Fan", value: "Lampu / Fan" },
    { label: "Instalasi / Panel", value: "Instalasi / Panel" },
    { label: "Pompa", value: "Pompa" },
    { label: "Lainnya", value: "Lainnya" },
  ];

  const [typeError, setTypeError] = useState(false);
  const [data, setData] = useState({
    Type: "",
    Location: "",
    Problem: "",
  });
  const [dataImage, setDataImage] = useState(null);
  const [dataError, setDataError] = useState([false, false, false, false]);
  const [dataImageError, setDataImageError] = useState("");
  const [loader, setLoader] = useState(false);
  const [loaderComplete, setLoaderComplete] = useState(false);

  const [modalSolution, setModalSolution] = useState(false);
  const [dataSolution, setDataSolution] = useState("");
  const [dataSolutionError, setDataSolutionError] = useState(false);
  const [loaderSolution, setLoaderSolution] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState("");
  const [loaderDelete, setLoaderDelete] = useState(false);

  const fetch_data = async () => {
    const apiUrl = `${API_URL}/listutility`;
    const response = await axios.get(apiUrl);

    if (response.status == 200) {
      const data = response.data["response"];

      setDetailData(data);
      setImageUtility(response.data["image"]);
    }
  };

  useEffect(() => {
    fetch_data();
  }, []);

  useEffect(() => {
    const filterData = detailData.filter((item) => {
      const description =
        item["Description"] &&
        item["Description"].toLowerCase().includes(searchUtility.toLowerCase());
      const requestor =
        item["requestor"] &&
        item["requestor"].toLowerCase().includes(searchUtility.toLowerCase());

      return description || requestor;
    });
    console.log(filterData);

    setListUtility(filterData);
  }, [detailData, searchUtility]);

  const update_selected_request = (id_request) => {
    setSelectedRequest(id_request);
  };
  useEffect(() => {}, [selectedRequest]);

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
          {isSmallScreen ? (
            <>
              <div className="min-h-screen  justify-center bg-boxdark-2">
                <Appbar></Appbar>

                <div className="p-2">
                  <div className="flex flex-row">
                    <div className="flex-grow">
                      <CommonInput
                        input={searchUtility}
                        type={"text"}
                        onInputChange={(val) => {
                          setSearchUtility(val);
                          //  search_data();
                        }}
                        placeholder={"Search"}
                      >
                        <HiOutlineSearch />
                      </CommonInput>
                    </div>
                    <div
                      className="group flex cursor-default flex-row items-center px-2 text-white"
                      onClick={() => {
                        setModalRequest(true);
                      }}
                    >
                      <IoAdd /> Add
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  {listUtility.map((item, index) => {
                    return (
                      <div key={index} className="mb-2 rounded border p-2">
                        <div className="mb-3 flex flex-row items-center">
                          <img
                            src={`${IMAGE_PROFILE}/${item["requestor_image"]}`}
                            className="h-10 w-10 rounded-full border border-white object-cover"
                          />
                          <div className="ml-3 flex flex-col">
                            <div className="text-primary">
                              {item["requestor"]}
                            </div>
                            <div className="text-sm">
                              {formatDateTime(item["Time_Request"])}
                            </div>
                          </div>
                        </div>
                        <div className=" text-white">Lokasi</div>
                        <div className=" ">{item["Location"]}</div>
                        <div className=" text-white">Keluhan</div>
                        <div className=" ">{item["Description"]}</div>
                        {parseInt(item["Step"]) >= 5 ? (
                          <>
                            <div className=" text-white">Solusi</div>
                            <div className=" ">{item["Solution"]}</div>
                            <div className="text-warning ">{`Diselesaikan oleh ${item["technician"]} pada ${formatDateTime(item["Time_Complete"])}`}</div>
                          </>
                        ) : (
                          <></>
                        )}
                        <div className="mb-3"></div>
                        <div className=" flex w-full space-x-4 overflow-x-auto">
                          {imageUtility[index].map((image, ind) => {
                            return (
                              <img
                                key={ind}
                                src={`${IMAGE_GALLERY}/${image}`}
                                className="h-60 w-full object-cover"
                              />
                            );
                          })}
                        </div>
                        <div className="mb-3"></div>

                        <div>
                          {item["Step"] != "5" ? (
                            <div className="flex justify-end">
                              <CommonButton
                                label={"Delete"}
                                disabled={loaderDelete}
                                onload={loaderDelete}
                                onClick={async () => {
                                  setLoaderDelete(true);
                                  const apiUrl = `${API_URL}/deleteutility`;
                                  const response = await axios.post(apiUrl, {
                                    id_request: item["ID_Request"],
                                  });

                                  if (response.status == 200) {
                                    const message = response.data["response"];
                                    NotifySuccess(message);
                                    window.location.reload();
                                  }
                                  setLoaderDelete(false);
                                }}
                              />
                              <div className="mr-3"></div>
                              <CommonButton
                                label={"Selesai"}
                                disabled={loaderComplete}
                                onload={loaderComplete}
                                onClick={() => {
                                  update_selected_request(item["ID_Request"]);
                                  setModalSolution(true);
                                }}
                              />
                            </div>
                          ) : (
                            <></>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="min-h-screen  bg-boxdark-2">
              <DefaultLayout>
                <div className="flex min-h-[calc(100vh-115px)] flex-col">
                  <div className="mb-3 flex items-center justify-start">
                    <div className="text-lg text-white">Utility</div>
                  </div>
                </div>
              </DefaultLayout>
            </div>
          )}
        </div>
        <CustomModal
          isVisible={modalRequest}
          onClose={() => {
            setModalRequest(false);
          }}
        >
          <CustomSelect
            optionData={groupType}
            placeholder={"Jenis Permasalahan"}
            error={dataError[0]}
            errorMessage="Required"
            mode={0}
            onSelected={(option) => {
              setData((prev) => ({ ...prev, Type: option.value }));
              const error = [...dataError];
              error[0] = false;
              setDataError(error);
            }}
          />
          <div className="mb-2"></div>
          <CommonInput
            placeholder={"Lokasi"}
            input={data.Location}
            onInputChange={(val) => {
              setData((prev) => ({ ...prev, Location: val }));
            }}
            onKeyChange={() => {
              const error = [...dataError];
              error[1] = false;
              setDataError(error);
            }}
            error={dataError[1]}
            errorMessage={"Required"}
          />
          <div className="mb-2" />
          <CommonInput
            placeholder={"Jelaskan masalahmu"}
            input={data.Problem}
            onInputChange={(val) => {
              setData((prev) => ({ ...prev, Problem: val }));
            }}
            onKeyChange={() => {
              const error = [...dataError];
              error[2] = false;
              setDataError(error);
            }}
            errorMessage={"Required"}
            error={dataError[2]}
          />
          <div className="mb-2" />
          <CommonInputFile
            errorMessage={dataImageError}
            error={dataError[3]}
            onInputChange={(val) => {
              setDataImage(val);
              const error = [...dataError];
              error[3] = false;
              setDataError(error);
            }}
          />
          <div className="mb-5"></div>
          <CommonButtonFull
            onload={loader}
            disabled={loader}
            label={"Kirim"}
            onClick={async () => {
              setLoader(true);
              const errordata = [...dataError];

              if (data.Type == "") {
                errordata[0] = true;

                setDataError(errordata);
              } else {
                errordata[0] = false;
                setDataError(errordata);
              }

              if (data.Location == "") {
                errordata[1] = true;
                setDataError(errordata);
              } else {
                errordata[1] = false;
                setDataError(errordata);
              }

              if (data.Problem == "") {
                errordata[2] = true;
                setDataError(errordata);
              } else {
                errordata[2] = false;
                setDataError(errordata);
              }

              if (dataImage == null) {
                errordata[3] = true;
                setDataError(errordata);
                setDataImageError("Required");
              } else if (dataImage && dataImage.size > 100 * 1024) {
                errordata[3] = true;
                setDataError(errordata);
                setDataImageError("Ukuran max 100 kb");
              } else {
                errordata[3] = false;
                setDataError(errordata);
                setDataImageError("");
              }

              const sumError = dataError.every((element) => element === false);
              if (sumError) {
                const user = localStorage.getItem("info");
                const parseUser = JSON.parse(user);

                const payload = new FormData();
                payload.append("file", dataImage);
                payload.append("data", JSON.stringify(data));
                payload.append("uid", parseUser[0]["Uid"]);

                const apiUrl = `${API_URL}/addnewutility`;
                const response = await axios.post(apiUrl, payload, {
                  headers: {
                    "Content-Type": "multipart/form-data",
                  },
                });

                if (response.status == 200) {
                  const data = response.data["response"];
                  setModalRequest(false);

                  setData({
                    Type: "",
                    Location: "",
                    Problem: "",
                  });

                  NotifySuccess(data);
                  window.location.reload();
                }
              }
              setLoader(false);
            }}
          />
        </CustomModal>
        <CustomModal
          isVisible={modalSolution}
          onClose={() => {
            setModalSolution(false);
          }}
        >
          <CommonInput
            input={dataSolution}
            errorMessage={"Required"}
            error={dataSolutionError}
            onInputChange={(val) => {
              setDataSolution(val);
            }}
            onKeyChange={() => {
              setDataSolutionError(false);
            }}
            placeholder={"Tuliskan tindakan yang sudah dilakukan"}
          />
          <div className="mb-3"></div>
          <CommonButtonFull
            label={"Selesai"}
            onClick={async () => {
              setLoaderSolution(true);
              if (dataSolution == "") {
                setDataSolutionError(true);
              } else {
                setDataSolutionError(false);
                const user = localStorage.getItem("info");
                const parseUser = JSON.parse(user);
                const apiUrl = `${API_URL}/closeutility`;
                const response = await axios.post(apiUrl, {
                  id_request: selectedRequest,
                  uid: parseUser[0]["Uid"],
                  solution: dataSolution,
                });

                if (response.status == 200) {
                  const message = response.data["response"];
                  NotifySuccess(message);
                }
              }
              console.log(dataSolution);
              setModalSolution(false);
              setDataSolution("");
              setLoaderSolution(false);
              fetch_data();
            }}
            disabled={loaderSolution}
            onload={loaderSolution}
          />
        </CustomModal>
      </div>
    </UserAuth>
  );
}
