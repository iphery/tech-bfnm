"use client";
import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../appcontext";
import axios from "axios";
import { useMediaQuery } from "react-responsive";
import { IMAGE_ASSET } from "@/utils/constant";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import UserAuth from "@/components/auth";
import { Appbar } from "@/components/appbar";
import { CommonInput } from "@/components/input";
import { HiOutlineSearch } from "react-icons/hi";
import { useRouter } from "next/navigation";

export default function ListAsset() {
  const router = useRouter();
  const isSmallScreen = useMediaQuery({ query: "(max-width: 640px)" });

  const [detailData, setDetailData] = useState([]);
  const [countData, setCountData] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [keywordError, setKeywordError] = useState(false);
  const [filteredList, setFilteredList] = useState([]);

  const fetch_data = async () => {
    const menu = localStorage.getItem("menu");

    const apiUrl = `/api/detail`;
    const response = await axios.post(apiUrl, {
      category: menu,
    });

    if (response.status == 200) {
      const array = response.data["response"];

      setDetailData(array.dataDetail);
      setFilteredList(array.dataDetail);
      setCountData(array.exist);
      console.log(array);
    }
  };

  const search_data = () => {
    //filteredList = [];
    const data = detailData.filter((item) => {
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

    setFilteredList(data);
  };

  useEffect(() => {
    fetch_data();
  }, []);
  return (
    <UserAuth>
      {isSmallScreen ? (
        <>
          <div className="min-h-screen  justify-center bg-boxdark-2">
            <Appbar></Appbar>
            <div className="p-5">
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

            <div className="p-5">
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
                      className="cursor-default"
                    >
                      <div className="flex flex-row py-3">
                        <div>
                          <img
                            className="h-20 w-20 rounded-lg object-cover"
                            src={image}
                          />
                        </div>
                        <div className="flex flex-col">
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
        <DefaultLayout>
          <div onClick={() => {}}>bbb</div>
          <div onClick={() => {}}>ccc</div>
        </DefaultLayout>
      )}
    </UserAuth>
  );
}
