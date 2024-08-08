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
import { CommonButton } from "@/components/button";

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

  const [inputItem, setInputItem] = useState([]);
  const [inputUnit, setInputUnit] = useState([]);
  const [inputQuantity, setInputQuantity] = useState([]);
  const [inputDate, setInputDate] = useState([]);
  const [inputRemark, setInputRemark] = useState([]);

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

  const [inputData, setInputData] = useState([]);

  const add_item = () => {
    setInputData((prev) => [...prev, { index: index, item: "", quantity: 0 }]);
  };

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
                <div
                  className="text-lg text-white"
                  onClick={() => {
                    console.log(inputItem);
                    console.log(inputQuantity);
                  }}
                >
                  Service
                </div>
              </div>

              <PageCardLimited>
                {inputData.map((item, index) => {
                  return (
                    <div className="flex flex-row" key={index}>
                      <CommonInput
                        input={item[index].item}
                        onInputChange={(val) => {
                          const foundIndex = inputData.findIndex(
                            (value) => value.index == index,
                          );
                          const input = [...inputData];
                          input[foundIndex].item = val;
                          setInputData(input);
                        }}
                      ></CommonInput>
                      <CommonInput
                        input={item[index].item}
                        onInputChange={(val) => {}}
                      ></CommonInput>
                    </div>
                  );
                })}

                <CommonButton
                  label="Tambah"
                  onClick={() => {
                    add_item();
                  }}
                ></CommonButton>
              </PageCardLimited>
            </div>
          </DefaultLayout>
        </div>
      )}
    </UserAuth>
  );
}
