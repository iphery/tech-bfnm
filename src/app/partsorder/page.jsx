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
import { formatDate } from "@/utils/dateformat";
import { AiOutlineDelete } from "react-icons/ai";

export default function PartOrder() {
  const router = useRouter();
  const isSmallScreen = useMediaQuery({ query: "(max-width: 640px)" });
  const [orderData, setOrderData] = useState([]);
  const [loader, setLoader] = useState(true);
  const [keyword, setKeyword] = useState("");

  const fetch_data = async () => {
    const apiUrl = `${API_URL}/getorder`;
    const response = await axios.post(apiUrl, {});

    if (response.status == 200) {
      // console.log(response.data["detail"][0].ID_Asset);
      const list = response.data["response"];
      console.log(list);
      setOrderData(list);
      setLoader(false);
    }
  };

  useEffect(() => {
    fetch_data();
  }, []);

  return (
    <UserAuth>
      <div className="min-h-screen  bg-boxdark-2">
        {isSmallScreen ? (
          <>
            <div>in progerss</div>
          </>
        ) : (
          <DefaultLayout>
            <div className="mb-3 flex items-center justify-center">
              <div className="text-lg text-white">Order</div>

              <div className="w-full">
                <div className="flex justify-end">
                  <div
                    className="flex cursor-default items-center justify-center px-5  hover:text-white"
                    onClick={() => {
                      router.push("/partsin");
                    }}
                  >
                    <BsCartPlus />
                    <div className="ml-1">New Order</div>
                  </div>
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
                <div className="h-100">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-black">
                        <th className="w-1/5">Date</th>
                        <th className="w-1/5">No Register</th>
                        <th className="w-1/5">No DPM</th>
                        <th className="w-1/5">Status</th>
                        <th className="w-1/5">Dibuat oleh</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderData.map((item, index) => {
                        return (
                          <tr
                            key={index}
                            className="cursor-default hover:bg-meta-10"
                            onClick={() => {
                              router.push(`/partsorder/${item["id_register"]}`);
                            }}
                          >
                            <td>{formatDate(item["date"])}</td>
                            <td>{item["id_register"]}</td>
                            <td>{item["dpm"]}</td>
                            <td
                              className={`${item["status"] == 0 ? "text-red" : "text-success"} text-center`}
                            >
                              {item["status"] == 0 ? "Open" : "Close"}
                            </td>
                            <td>{item["requestor"]}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </DefaultLayout>
        )}
      </div>
    </UserAuth>
  );
}
