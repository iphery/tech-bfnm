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
  const { filteredAssetList, setFilteredAssetList } = useProvider();
  const { assetKeyword, setAssetKeyword } = useProvider();

  const fetch_data = async () => {
    const menu = localStorage.getItem("menu");

    const apiUrl = `${API_URL}/getallasset`;
    const response = await axios.post(apiUrl, {
      type: menu,
      isAll: isSmallScreen ? 0 : 1,
    });

    if (response.status == 200) {
      const array = response.data["response"];
      console.log(array);
      setDetailData(array);
      // setFilteredList(array);
      setFilteredAssetList(array);
      setCountData(array.length);
    }
  };

  useEffect(() => {
    fetch_data();
  }, []);

  useEffect(() => {
    const filterData = detailData.filter((item) => {
      const description =
        item["Description"] &&
        item["Description"].toLowerCase().includes(assetKeyword.toLowerCase());
      const manufacture =
        item["Manufacture"] &&
        item["Manufacture"].toLowerCase().includes(assetKeyword.toLowerCase());
      const user =
        item["User"] &&
        item["User"].toLowerCase().includes(assetKeyword.toLowerCase());
      return description || manufacture || user;
    });

    setFilteredAssetList(filterData);
  }, [detailData, assetKeyword]);

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
                input={assetKeyword}
                type={"text"}
                onInputChange={(val) => {
                  setAssetKeyword(val);
                  //  search_data();
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
                {filteredAssetList.map((item, index) => {
                  const manufacture =
                    item["Manufacture"] == null
                      ? ""
                      : " " + item["Manufacture"];
                  const model =
                    item["Model"] == null ? "" : " " + item["Model"];
                  const title =
                    item["Type"] == "K"
                      ? item["Model"]
                      : item["Description"] + manufacture + model;
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
                      <div className="py-1">
                        {/*<div>
                          {image == "" || image == null ? (
                            <div className="h-20 w-20 rounded-lg"></div>
                          ) : (
                            <img
                              className="h-20 w-20  rounded-full object-cover"
                              src={image}
                            />
                          )}
                        </div>*/}

                        <div className="flex  flex-col rounded-lg border p-1 text-white">
                          <div>{item["ID_Asset"]}</div>
                          {item["Type"] == "K" ? (
                            <div className="flex flex-row items-center">
                              <div>{item["Model"]}</div>
                              <div className="ml-4 flex items-center rounded-md bg-white p-1 text-black">
                                {item["No"]}
                              </div>
                            </div>
                          ) : (
                            <div>{title}</div>
                          )}

                          <div>{item["User"]}</div>
                          <div>{item["Class"]}</div>
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
                    <thead className="sticky top-0 bg-black text-white">
                      <tr>
                        <th className="w-1/5">ID</th>
                        <th className="w-1/5">Deskripsi</th>
                        <th className="w-1/5">Manufacture</th>
                        <th className="w-1/5">Model</th>
                        <th className="w-1/5">User</th>
                      </tr>
                    </thead>
                    <tbody className="">
                      {filteredAssetList.map((item, index) => {
                        const desc =
                          item["Type"] == "K"
                            ? item["No"]
                            : item["Description"];
                        return (
                          <tr
                            key={index}
                            className={`cursor-default text-white   hover:bg-secondary hover:text-black`}
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
