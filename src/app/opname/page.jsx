"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { API_URL } from "@/utils/constant";
import UserAuth from "@/components/auth";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useRouter } from "next/navigation";
import { BsCartPlus } from "react-icons/bs";
import { useMediaQuery } from "react-responsive";
import Loader from "@/components/common/Loader";
import { PageLoader } from "@/components/loader";
import { HiOutlineSearch } from "react-icons/hi";
import { CommonInput } from "@/components/input";
import { formatDate, formatDateTime, shortDate } from "@/utils/dateformat";
import { AiOutlineDelete } from "react-icons/ai";
import paginateData from "@/utils/pagination";
import { CustomModal } from "@/components/modal";
import { CommonButtonFull } from "@/components/button";
import { NotifySuccess } from "@/utils/notify";

export default function Page() {
  const router = useRouter();
  const isSmallScreen = useMediaQuery({ query: "(max-width: 640px)" });
  const [orderData, setOrderData] = useState([]);
  const [loader, setLoader] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [filteredList, setFilteredList] = useState([]);
  const [modalNew, setModalNew] = useState(false);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().substring(0, 10),
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().substring(0, 10),
  );

  const [ongenerate, setOngenerate] = useState(false);

  const fetch_data = async () => {
    const apiUrl = `${API_URL}/stockopname`;
    const response = await axios.post(apiUrl, {});

    if (response.status == 200) {
      // console.log(response.data["detail"][0].ID_Asset);
      const list = response.data["response"];

      setOrderData(list);
      setLoader(false);
    }
  };

  const create_new = async () => {
    setOngenerate(true);
    const user = localStorage.getItem("info");
    const parseUser = JSON.parse(user);
    const apiUrl = `${API_URL}/generateopname`;
    const response = await axios.post(apiUrl, {
      start: startDate,
      end: endDate,
      uid: parseUser[0]["Uid"],
    });

    if (response.status == 200) {
      // console.log(response.data["detail"][0].ID_Asset);
      const message = response.data["response"];
      setModalNew(false);
      NotifySuccess(message);
      fetch_data();
    }
    setOngenerate(false);
  };

  useEffect(() => {
    const start = new Date(startDate).toISOString().substring(0, 10);
    const end = new Date(endDate).toISOString().substring(0, 10);
    if (start > end) {
      setEndDate(start);
    }
  }, [startDate]);

  useEffect(() => {
    const start = new Date(startDate).toISOString().substring(0, 10);
    const end = new Date(endDate).toISOString().substring(0, 10);
    if (end < start) {
      setStartDate(end);
    }
  }, [endDate]);

  useEffect(() => {
    fetch_data();
  }, []);

  useEffect(() => {
    //if (!loading) {
    const filterData = orderData.filter((item) => {
      const register =
        item["id_report"] &&
        item["id_report"].toLowerCase().includes(keyword.toLowerCase());

      return register;
    });
    const { data, pageCurrent, start, end } = paginateData(
      filterData,
      //keyword,
      //currentPage,
      15,
    );
    setFilteredList(filterData);

    //}
  }, [orderData, keyword]);

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
                <div className="min-h-[calc(100vh-115px)] ">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-lg text-white">Stock Opname</div>

                    <div className="flex justify-end">
                      <div
                        onClick={() => {
                          setModalNew(true);
                        }}
                        className="flex cursor-default items-center justify-center px-5  hover:text-white"
                      >
                        <BsCartPlus />
                        <div className="ml-1">New Data</div>
                      </div>
                    </div>
                  </div>
                  <div className=" w-full rounded-sm border border-strokedark bg-boxdark shadow-default">
                    <div className="p-3">
                      <div className="flex flex-row items-center">
                        <div className="w-1/2">
                          <CommonInput
                            input={keyword}
                            type={"text"}
                            onInputChange={(val) => {
                              setKeyword(val);
                            }}
                            placeholder={"Search"}
                          >
                            <HiOutlineSearch />
                          </CommonInput>
                        </div>
                      </div>

                      <div className="mb-5"></div>
                      <div className="h-[calc(100vh-235px)] overflow-y-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="sticky top-0 bg-black">
                              <th className="">No Report</th>
                              <th className="">Period</th>
                              <th className="">Status</th>
                              <th className="">Created by</th>
                              <th className="">Created at</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredList.map((item, index) => {
                              return (
                                <tr
                                  key={index}
                                  className="cursor-default hover:bg-meta-10"
                                  onClick={() => {
                                    router.push(`/opname/${item["id_report"]}`);
                                  }}
                                >
                                  <td className="p-1">{item["id_report"]}</td>
                                  <td className="p-1 text-center">
                                    {`${shortDate(item["start_date"])} ~ ${shortDate(item["end_date"])}`}
                                  </td>
                                  <td
                                    className={`${item["status"] == 0 ? "text-red" : "text-success"} p-1 text-center`}
                                  >
                                    {item["status"] == 0 ? "Open" : "Close"}
                                  </td>
                                  <td>{item["Name"]}</td>
                                  <td className="text-center">
                                    {formatDateTime(item["created_at"])}
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
              </DefaultLayout>
            </div>
            <CustomModal
              isVisible={modalNew}
              isSmallWidth={"sm"}
              onClose={() => {
                setModalNew(false);
              }}
            >
              <div className="flex flex-row">
                <div className="w-full">
                  <div className="mb-2 text-sm">From</div>
                  <CommonInput
                    type={"date"}
                    input={startDate}
                    onInputChange={(val) => {
                      setStartDate(val);
                    }}
                  ></CommonInput>
                </div>
                <div className="ml-2"></div>
                <div className="w-full">
                  <div className="mb-2 text-sm">To</div>
                  <CommonInput
                    type={"date"}
                    input={endDate}
                    onInputChange={(val) => {
                      setEndDate(val);
                    }}
                  ></CommonInput>
                </div>
              </div>
              <div className="mb-5"></div>
              <CommonButtonFull
                onClick={create_new}
                onload={ongenerate}
                disabled={ongenerate}
                label={"Generate"}
              ></CommonButtonFull>
            </CustomModal>
          </div>
        )}
      </div>
    </UserAuth>
  );
}
