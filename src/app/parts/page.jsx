"use client";
import React, { useContext, useEffect, useState } from "react";
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
import { GoChevronRight } from "react-icons/go";
import paginateData from "@/utils/pagination";
import { BsCartPlus } from "react-icons/bs";
import { PageLoader } from "@/components/loader";
import { PageCardLimited } from "@/components/card";

export default function ListPart() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  const isSmallScreen = useMediaQuery({ query: "(max-width: 640px)" });

  const [detailData, setDetailData] = useState([]);
  const [countData, setCountData] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [keywordError, setKeywordError] = useState(false);
  const [filteredList, setFilteredList] = useState([]);
  const [loader, setLoader] = useState(true);

  //const [lastPage, setLastPage] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const fetch_data = async () => {
    const apiUrl = `${API_URL}/stocklist?page=${currentPage}`;
    const response = await axios.post(apiUrl, { keyword: keyword });

    if (response.status == 200) {
      const array = response.data["response"];
      // const current_page = response.data["response"]["current_page"];
      //const last_page = response.data["response"]["last_page"];
      setDetailData(array);
      //setFilteredList(array);
      // setLastPage(last_page);

      // console.log(array);
    }
    setLoading(false);
    setLoader(false);
  };

  const next_page = () => {
    if (currentPage < lastPage) {
      let nextPage = currentPage + 1;
      setCurrentPage(nextPage);
    }
    console.log(currentPage);
  };

  const prev_page = () => {
    if (currentPage > 1) {
      let nextPage = currentPage - 1;
      setCurrentPage(nextPage);
    }
  };

  const onPageChange = () => {
    let nextPage = currentPage + 1;
    console.log("ini" + nextPage);
    setCurrentPage(nextPage);
  };

  const onKeywordChange = (event) => {
    setKeyword(event.target.value);
    setCurrentPage(1); // Reset to the first page on keyword change
  };

  useEffect(() => {
    fetch_data();
  }, []);

  useEffect(() => {
    //if (!loading) {
    const filterData = detailData.filter((item) =>
      item["description"].toLowerCase().includes(keyword.toLowerCase()),
    );
    const { data, pageCurrent, start, end } = paginateData(
      filterData,
      //keyword,
      currentPage,
      15,
    );
    setFilteredList(filterData);

    //}
  }, [detailData, keyword, currentPage]);

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
            <div className="flex min-h-[calc(100vh-115px)] flex-col">
              <div className="mb-3 flex items-center justify-center">
                <div className="text-lg text-white">Inventory</div>

                <div className="w-full">
                  <div className="flex justify-end">
                    <div
                      className="flex cursor-default items-center justify-center px-5  hover:text-white"
                      onClick={() => {
                        router.push("/partsout");
                      }}
                    >
                      <BsCartPlus />
                      <div className="ml-1">Stock Out</div>
                    </div>
                  </div>
                </div>
              </div>
              <PageCardLimited>
                <div className="p-5">
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

                  <div className="mb-5"></div>

                  <div className="h-[calc(100vh-280px)] overflow-y-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-black">
                          <th>Deskripsi</th>
                          <th>Part No</th>
                          <th>Remark</th>
                          <th>Quantity</th>
                          <th>Unit</th>

                          <th>Lokasi Simpan</th>
                        </tr>
                      </thead>
                      <tbody className=" ">
                        {!loading ? (
                          filteredList.map((item, index) => {
                            return (
                              <tr
                                key={index}
                                className={`cursor-default   hover:bg-secondary hover:text-white`}
                                onClick={() => {
                                  router.push(`/parts/${item["id_part"]}`);
                                }}
                              >
                                <td className="p-2 align-top">
                                  {item["description"]}
                                </td>
                                <td className=" p-2 align-top">
                                  {item["vendor_code"]}
                                </td>
                                <td className="p-2 align-top">
                                  {item["remark"]}
                                </td>
                                <td className="p-2 align-top">
                                  {item["available_quantity"]}
                                </td>
                                <td className="p-2 align-top">
                                  {item["unit"]}
                                </td>
                                <td className="p-2 align-top">
                                  {item["location"]}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <></>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </PageCardLimited>
            </div>
          </DefaultLayout>
        )}
      </div>
    </UserAuth>
  );
}
