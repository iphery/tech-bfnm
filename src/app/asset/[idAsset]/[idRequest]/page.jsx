"use client";
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useMediaQuery } from "react-responsive";
import { API_URL, IMAGE_ASSET } from "@/utils/constant";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import UserAuth from "@/components/auth";
import { Appbar } from "@/components/appbar";
import { CommonInput } from "@/components/input";
import { HiOutlineSearch } from "react-icons/hi";
import { useRouter } from "next/navigation";
import { PageCard, PageCardLimited } from "@/components/card";
import paginateData from "@/utils/pagination";
import { DataProvider, useProvider } from "@/app/appcontext";
import { IoWarning } from "react-icons/io5";
import { CiEdit } from "react-icons/ci";
import { CustomModal } from "@/components/modal";
import { CommonButtonFull } from "@/components/button";
import {
  getCurrentDate,
  getCurrentDateFromDatetime,
  getCurrentTime,
  getCurrentTimeFromDatetime,
} from "@/utils/dateformat";
import { NotifySuccess } from "@/utils/notify";

export default function Page({ params }) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const isSmallScreen = useMediaQuery({ query: "(max-width: 640px)" });
  const [data, setData] = useState({});
  const { assetKeyword, setAssetKeyword } = useProvider();

  const [modalEdit, setModalEdit] = useState(false);
  const [editItem, setEditItem] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [currentDateError, setCurrentDateError] = useState(false);
  const [currentTimeError, setCurrentTimeError] = useState(false);
  const [onload, setOnload] = useState(false);

  const fetch_data = async () => {
    const apiUrl = `${API_URL}/getdatetimerequest`;
    const response = await axios.post(apiUrl, {
      idRequest: params.idRequest,
    });

    if (response.status == 200) {
      const array = response.data["response"];
      setData(array[0]);
    }
  };

  const update_date = async (datetime) => {
    const apiUrl = `${API_URL}/updatealltime`;
    const response = await axios.post(apiUrl, {
      idRequest: params.idRequest,
      mode: editItem,
      datetime: datetime,
    });

    if (response.status == 200) {
      const resp = response.data["response"];
      console.log(resp);
      NotifySuccess("Updating success");
      setModalEdit(false);
    }
  };

  useEffect(() => {
    fetch_data();
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }
  return (
    <UserAuth>
      {isSmallScreen ? (
        <>
          <div className="relative">
            <div className="absolute z-0 h-full w-full">
              <div className="min-h-screen  justify-center bg-boxdark-2">
                <Appbar></Appbar>

                <div className="p-2 text-white">
                  <div className="mb-3 flex justify-between">
                    <div>ID_Request</div>
                    <div>{data.ID_Request}</div>
                  </div>
                  <div className="mb-3 flex justify-between">
                    <div>Time Request</div>
                    <div className="flex flex-row">
                      {data.Time_Request}

                      <span
                        className="ml-5"
                        onClick={() => {
                          setEditItem("request");
                          setCurrentDate(
                            getCurrentDateFromDatetime(data.Time_Request),
                          );
                          setCurrentTime(
                            getCurrentTimeFromDatetime(data.Time_Request),
                          );
                          setModalEdit(true);
                        }}
                      >
                        <CiEdit />
                      </span>
                    </div>
                  </div>
                  <div className="mb-3 flex justify-between">
                    <div>Time Response</div>
                    <div className="flex justify-between">
                      {data.Time_Response}

                      <span
                        className="ml-5"
                        onClick={() => {
                          setEditItem("response");
                          setCurrentDate(
                            getCurrentDateFromDatetime(data.Time_Request),
                          );
                          setCurrentTime(
                            getCurrentTimeFromDatetime(data.Time_Request),
                          );
                          setModalEdit(true);
                        }}
                      >
                        <CiEdit />
                      </span>
                    </div>
                  </div>
                  <div className="mb-3 flex justify-between">
                    <div>Spare Part Request</div>
                    <div className="flex justify-between">
                      {data.Time_POS}

                      <span
                        className="ml-5"
                        onClick={() => {
                          setEditItem("part_request");
                          setCurrentDate(
                            getCurrentDateFromDatetime(data.Time_Request),
                          );
                          setCurrentTime(
                            getCurrentTimeFromDatetime(data.Time_Request),
                          );
                          setModalEdit(true);
                        }}
                      >
                        <CiEdit />
                      </span>
                    </div>
                  </div>
                  <div className="mb-3 flex justify-between">
                    <div>Spare Part Receive</div>
                    <div className="flex justify-between">
                      {data.Time_POS_Complete}

                      <span
                        className="ml-5"
                        onClick={() => {
                          setEditItem("part_receive");
                          setCurrentDate(
                            getCurrentDateFromDatetime(data.Time_Request),
                          );
                          setCurrentTime(
                            getCurrentTimeFromDatetime(data.Time_Request),
                          );
                          setModalEdit(true);
                        }}
                      >
                        <CiEdit />
                      </span>
                    </div>
                  </div>
                  <div className="mb-3 flex justify-between">
                    <div>Time Completed</div>
                    <div className="flex justify-between">
                      {data.Time_Repair_Complete}
                      <span
                        className="ml-5"
                        onClick={() => {
                          setEditItem("completed");
                          setCurrentDate(
                            getCurrentDateFromDatetime(data.Time_Request),
                          );
                          setCurrentTime(
                            getCurrentTimeFromDatetime(data.Time_Request),
                          );
                          setModalEdit(true);
                        }}
                      >
                        <CiEdit />
                      </span>
                    </div>
                  </div>
                  <div className="mb-3 flex justify-between">
                    <div>Time Checked</div>
                    <div className="flex justify-between">
                      {data.Tech_SPV}
                      <span
                        className="ml-5"
                        onClick={() => {
                          setEditItem("checked");
                          setCurrentDate(
                            getCurrentDateFromDatetime(data.Time_Request),
                          );
                          setCurrentTime(
                            getCurrentTimeFromDatetime(data.Time_Request),
                          );
                          setModalEdit(true);
                        }}
                      >
                        <CiEdit />
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div>Step</div>
                    <div>{data.Step}</div>
                  </div>
                </div>
              </div>
            </div>

            <CustomModal
              isVisible={modalEdit}
              onClose={() => {
                setModalEdit(false);
              }}
            >
              <div className="mb-2">{`Edit Time "${editItem}"`}</div>
              <div className="flex flex-row justify-evenly">
                <div className="w-full">
                  <CommonInput
                    type={"date"}
                    input={currentDate}
                    onInputChange={(val) => {
                      setCurrentDate(val);
                    }}
                    error={currentDateError}
                    errorMessage={"Required"}
                    onChg={() => {
                      setCurrentDateError(false);
                    }}
                  />
                </div>
                <div className="mr-2"></div>
                <div className="w-full">
                  <CommonInput
                    type={"time"}
                    input={currentTime}
                    onInputChange={(val) => {
                      setCurrentTime(val);
                    }}
                    error={currentTimeError}
                    errorMessage={"Required"}
                    onChg={() => {
                      setCurrentTimeError(false);
                    }}
                  />
                </div>
              </div>
              <div className="mb-5"></div>
              <CommonButtonFull
                label={"Kirim"}
                onload={onload}
                disabled={onload}
                onClick={() => {
                  setOnload(true);
                  if (currentDate == "") {
                    setCurrentDateError(true);
                  } else {
                    setCurrentDateError(false);
                  }

                  if (currentTime == "") {
                    setCurrentTimeError(true);
                  } else {
                    setCurrentTimeError(false);
                  }

                  if (currentDate != "" && currentTime != "") {
                    const datetime = `${currentDate} ${currentTime}`;

                    update_date(datetime);
                  }
                  setOnload(false);
                }}
              />
            </CustomModal>
          </div>
        </>
      ) : (
        <div className="min-h-screen  bg-boxdark-2">
          <DefaultLayout>
            <div className="flex min-h-[calc(100vh-115px)] flex-col">
              <div className="mb-3 flex items-center justify-start">
                <div className="text-lg text-white">Editor</div>
              </div>
            </div>
          </DefaultLayout>
        </div>
      )}
    </UserAuth>
  );
}
