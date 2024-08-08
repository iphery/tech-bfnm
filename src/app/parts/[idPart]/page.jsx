"use client";
import UserAuth from "@/components/auth";
import { CommonButtonColor } from "@/components/button";
import { PageCard } from "@/components/card";
import { CommonInput } from "@/components/input";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { PageLoader } from "@/components/loader";
import { API_URL } from "@/utils/constant";
import { NotifyError, NotifySuccess } from "@/utils/notify";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";

export default function DetailPart({ params }) {
  const [loader, setLoader] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const isSmallScreen = useMediaQuery({ query: "(max-width: 640px)" });
  const [detailData, setDetailData] = useState({});
  const [stockData, setStockData] = useState([]);
  const [startDate, setStartDate] = useState(
    get_first_date().toISOString().substring(0, 10),
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().substring(0, 10),
  );

  const [deleteOnload, setDeleteOnload] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const fetch_data = async () => {
    const apiUrl = `${API_URL}/getpartdetail`;
    const response = await axios.post(apiUrl, { idPart: params.idPart });

    if (response.status == 200) {
      const array = response.data["response"][0];

      setDetailData(array);

      //console.log(array["description"]);
    }
    setLoader(false);
  };

  const fetch_stock_data = async () => {
    const apiUrl = `${API_URL}/getstockcard`;
    const response = await axios.post(apiUrl, {
      idPart: params.idPart,
      startDate: startDate,
      endDate: endDate,
    });

    if (response.status == 200) {
      const array = response.data["response"];
      const reverseArray = [...array].reverse();
      setStockData(reverseArray);
    }
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

  const delete_part = async () => {
    setDeleteOnload(true);
    const apiUrl = `${API_URL}/deletepart`;
    const response = await axios.post(apiUrl, {
      idPart: params.idPart,
    });

    if (response.status == 200) {
      const error = response.data["error"];
      const message = response.data["message"];
      if (error == 0) {
        NotifySuccess(message);
        router.back();
      } else {
        NotifyError(message);
      }
    }

    setDeleteOnload(false);
  };

  function get_first_date() {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  }

  useEffect(() => {
    fetch_data();
  }, []);

  useEffect(() => {
    fetch_stock_data();
  }, [startDate, endDate]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }
  return (
    <UserAuth>
      {loader ? (
        <PageLoader />
      ) : (
        <div className="min-h-screen  bg-boxdark-2">
          {isSmallScreen ? (
            <>Inprogrress</>
          ) : (
            <DefaultLayout>
              <div className="mb-3 flex items-center justify-start">
                <div
                  className="text-lg text-white"
                  onClick={() => {
                    console.log(detailData);
                  }}
                >
                  Part Detail
                </div>
              </div>
              <PageCard>
                <div className="flex flex-row">
                  <div className="w-full">
                    <div className="flex justify-evenly py-1">
                      <div className="w-full">Description</div>
                      <div className="w-full">{detailData["description"]}</div>
                    </div>
                    <div className="flex justify-evenly py-1">
                      <div className="w-full">Part No</div>
                      <div className="w-full">{detailData["vendor_code"]}</div>
                    </div>
                    <div className="flex justify-evenly py-1">
                      <div className="w-full">Location</div>
                      <div className="w-full">{detailData["location"]}</div>
                    </div>
                    <div className="flex justify-evenly py-1">
                      <div className="w-full">Remark </div>
                      <div className="w-full">{detailData["remark"]}</div>
                    </div>
                  </div>
                  <div className="px-5"></div>

                  <div className="w-full">
                    <div className="flex justify-evenly py-1">
                      <div className="w-full">Unit</div>
                      <div className="w-full">{detailData["unit"]}</div>
                    </div>
                    <div className="flex justify-evenly py-1">
                      <div className="w-full">Status</div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-end">
                  {deleteConfirm ? (
                    <div className="flex flex-row">
                      <div className="pt-1">Are you sure ?</div>
                      <div className="mr-2"></div>
                      <CommonButtonColor
                        label={"Yes"}
                        color1={"bg-red"}
                        color2={"bg-black"}
                        onClick={() => {
                          setDeleteConfirm(false);
                          delete_part();
                        }}
                      ></CommonButtonColor>
                      <div className="mr-2"></div>
                      <CommonButtonColor
                        color2={"bg-black"}
                        label={"Cancel"}
                        onClick={() => {
                          setDeleteConfirm(false);
                        }}
                      ></CommonButtonColor>
                    </div>
                  ) : (
                    <CommonButtonColor
                      onload={deleteOnload}
                      disabled={deleteOnload}
                      onClick={() => {
                        setDeleteConfirm(true);
                      }}
                      color1={"bg-red"}
                      color2={"bg-black"}
                      label={"Delete Part"}
                    />
                  )}
                </div>
              </PageCard>
              <div className="mb-5"></div>
              <PageCard>
                <div className="flex flex-row">
                  <div>
                    <div className="mb-2 text-sm text-white">From</div>
                    <CommonInput
                      type={"date"}
                      input={startDate}
                      onInputChange={(val) => {
                        setStartDate(val);
                      }}
                    ></CommonInput>
                  </div>
                  <div className="ml-2"></div>
                  <div>
                    <div className="mb-2 text-sm text-white">To</div>
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
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="w-1/7">Date</th>
                      <th className="w-1/7">In</th>
                      <th className="w-1/7">Out</th>
                      <th className="w-1/7">Balance</th>
                      <th className="w-1/7">From/To</th>
                      <th className="w-1/7">Asset</th>
                      <th className="w-1/7">Request</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockData.map((item, index) => {
                      return (
                        <tr key={index}>
                          <td className="">
                            {index == stockData.length - 1
                              ? "Before date"
                              : item["date"]}
                          </td>
                          <td className="text-center">
                            {index == stockData.length - 1 ? "" : item["in"]}
                          </td>
                          <td className="text-center">
                            {index == stockData.length - 1 ? "" : item["out"]}
                          </td>
                          <td className="text-center">{item["balance"]}</td>
                          <td>{item["subject"]}</td>
                          <td>{item["asset"]}</td>
                          <td>{item["request"]}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </PageCard>
            </DefaultLayout>
          )}
        </div>
      )}
    </UserAuth>
  );
}
