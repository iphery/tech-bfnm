"use client";
import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../appcontext";
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
import { formatDate } from "@/utils/dateformat";

export default function PageTransaction() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const isSmallScreen = useMediaQuery({ query: "(max-width: 640px)" });

  const [detailData, setDetailData] = useState([]);
  const [countData, setCountData] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [keywordError, setKeywordError] = useState(false);
  const [filteredList, setFilteredList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const fetch_data = async () => {
    const apiUrl = `${API_URL}/gettransaction`;
    const response = await axios.post(apiUrl, {});

    if (response.status == 200) {
      const array = response.data["response"];
      setDetailData(array);
      setFilteredList(array);
      console.log(array);
    }
  };

  useEffect(() => {
    fetch_data();
  }, []);

  useEffect(() => {
    //if (!loading) {
    const filterData = detailData.filter((item) => {
      const description =
        item["description"] &&
        item["description"].toLowerCase().includes(keyword.toLowerCase());

      const manufacture =
        item["vendor_code"] &&
        item["vendor_code"].toLowerCase().includes(keyword.toLowerCase());

      return description || manufacture;
    });
    console.log(filterData);

    setFilteredList(filterData);

    //}
  }, [detailData, keyword]);

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
                <div className="text-lg text-white">Transaction</div>
              </div>

              <PageCardLimited>
                <div className="flex flex-row items-center">
                  <div className="w-1/2">
                    <CommonInput
                      input={keyword}
                      type={"text"}
                      onInputChange={(val) => {
                        //setKeyword(val);
                        //  fetch_data();
                        setKeyword(val);
                        setCurrentPage(1);
                      }}
                      onKeyChange={() => {
                        setKeywordError(false);
                      }}
                      placeholder={"Search"}
                    >
                      <HiOutlineSearch />
                    </CommonInput>
                  </div>
                </div>
                <div className="mb-3"></div>
                <div className="h-[calc(100vh-235px)] overflow-y-auto">
                  <table className="w-full ">
                    <thead className="sticky top-0 bg-black">
                      <tr>
                        <th className="w-1/5">Date</th>
                        <th className="w-1/5">Deskripsi</th>
                        <th className="w-1/5">Detail</th>
                        <th className="w-1/5">Type</th>
                        <th className="w-1/5">Quantity</th>
                        <th className="w-1/5">Unit</th>
                        <th className="w-1/5">From/To</th>
                        <th className="w-1/5">Asset</th>
                        <th className="w-1/5">Request</th>
                      </tr>
                    </thead>
                    <tbody className="">
                      {filteredList.map((item, index) => {
                        return (
                          <tr
                            key={index}
                            className={`cursor-default   hover:bg-secondary hover:text-white`}
                            onClick={() => {
                              router.push(`parts/${item["id_part"]}`);
                            }}
                          >
                            <td className="p-2 align-top">
                              {formatDate(item["date"])}
                            </td>
                            <td className="p-2 align-top">
                              {item["description"]}
                            </td>
                            <td className="p-2 align-top">
                              {item["vendor_code"]}
                            </td>
                            <td className="p-2 text-center align-top">
                              <div
                                className={`rounded-lg text-sm ${item["type"] == "in" ? "bg-green" : "bg-red"} text-white`}
                              >
                                {item["type"].toUpperCase()}
                              </div>
                            </td>
                            <td className="p-2 text-center align-top">
                              {item["quantity"]}
                            </td>
                            <td className="p-2 text-center align-top">
                              {item["unit"]}
                            </td>
                            <td className="p-2 align-top">{item["subject"]}</td>
                            <td className="p-2 align-top">
                              {item["id_asset"]}
                            </td>
                            <td className="p-2 align-top">{item["id_for"]}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </PageCardLimited>
            </div>
          </DefaultLayout>
        </div>
      )}
    </UserAuth>
  );
}
