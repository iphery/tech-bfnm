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

  const fetch_data = async () => {
    const menu = localStorage.getItem("menu");

    const apiUrl = `${API_URL}/getallasset`;
    const response = await axios.post(apiUrl, {});

    if (response.status == 200) {
      const array = response.data["response"];
      console.log(array);
      setDetailData(array);
      setFilteredList(array);
      setCountData(array.length);
    }
  };

  useEffect(() => {
    fetch_data();
  }, []);

  useEffect(() => {
    //if (!loading) {
    const filterData = detailData.filter((item) => {
      const description =
        item["Description"] &&
        item["Description"].toLowerCase().includes(keyword.toLowerCase());
      const manufacture =
        item["Manufacture"] &&
        item["Manufacture"].toLowerCase().includes(keyword.toLowerCase());
      const user =
        item["User"] &&
        item["User"].toLowerCase().includes(keyword.toLowerCase());
      return description || manufacture || user;
    });
    console.log(filterData);
    const { data, pageCurrent, start, end } = paginateData(
      filterData,
      //keyword,
      currentPage,
      10,
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
      {isSmallScreen ? (
        <>
          <div className="min-h-screen  justify-center bg-boxdark-2">
            <Appbar></Appbar>
            <div className="p-2">
              <CommonInput
                input={keyword}
                type={"text"}
                onInputChange={(val) => {
                  setKeyword(val);
                  search_data();
                }}
                onKeyChange={() => {
                  setKeywordError(false);
                }}
                placeholder={"Search"}
              >
                <HiOutlineSearch />
              </CommonInput>
            </div>

            <div className="p-2">
              <div className="">
                {filteredList.map((item, index) => {
                  const title =
                    item["Type"] == "K" ? "mobil" : item["Description"];
                  const image = `${IMAGE_ASSET}/${item["Image"]}`;
                  const idAsset = item["ID_Asset"];

                  return (
                    <div
                      key={index}
                      onClick={() => {
                        router.push(`/asset/${idAsset}`);
                      }}
                      className="cursor-default hover:bg-form-strokedark"
                    >
                      <div className="flex flex-row py-3">
                        <div>
                          {image == "" || image == null ? (
                            <div className="h-20 w-20 rounded-lg"></div>
                          ) : (
                            <img
                              className="h-20 w-20  rounded-full object-cover"
                              src={image}
                            />
                          )}
                        </div>
                        <div className="ml-5 flex flex-col">
                          <div>{item["ID_Asset"]}</div>
                          <div>{title}</div>
                          <div>{item["User"]}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="min-h-screen  bg-boxdark-2">
          <DefaultLayout>
            <div className="flex min-h-[calc(100vh-115px)] flex-col">
              <div className="mb-3 flex items-center justify-start">
                <div className="text-lg text-white">Asset</div>
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
                        <th className="w-1/5">ID</th>
                        <th className="w-1/5">Deskripsi</th>
                        <th className="w-1/5">Manufacture</th>
                        <th className="w-1/5">Model</th>
                        <th className="w-1/5">User</th>
                      </tr>
                    </thead>
                    <tbody className="">
                      {filteredList.map((item, index) => {
                        const desc =
                          item["Type"] == "K"
                            ? item["No"]
                            : item["Description"];
                        return (
                          <tr
                            key={index}
                            className={`cursor-default   hover:bg-secondary hover:text-white`}
                            onClick={() => {
                              router.push(`asset/${item["ID_Asset"]}`);
                            }}
                          >
                            <td className="p-2 align-top">
                              {item["ID_Asset"]}
                            </td>
                            <td className="p-2 align-top">{desc}</td>
                            <td className="p-2 align-top">
                              {item["Manufacture"]}
                            </td>
                            <td className="p-2 align-top">{item["Model"]}</td>
                            <td className="p-2 align-top">{item["User"]}</td>
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
