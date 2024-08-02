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
import { CommonButton } from "@/components/button";

export default function PartsIn() {
  const router = useRouter();
  const isSmallScreen = useMediaQuery({ query: "(max-width: 640px)" });

  const [detailData, setDetailData] = useState([]);
  const [countData, setCountData] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [keywordError, setKeywordError] = useState(false);
  const [filteredList, setFilteredList] = useState([]);

  ///dari sini
  //input, error, error message

  const [inputItem, setInputItem] = useState([""]);
  const [inputItemError, setInputItemError] = useState([false]);
  const [inputItemMessage, setInputItemMessage] = useState([""]);

  const [inputQuantity, setInputQuantity] = useState([0]);
  const [inputQuantityError, setInputQuantityError] = useState([false]);
  const [inputQuantityMessage, setInputQuantityMessage] = useState([""]);

  ///

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
      10,
    );
    setFilteredList(data);

    //}
  }, [detailData, keyword, currentPage]);

  return (
    <UserAuth>
      {isSmallScreen ? (
        <>
          <div>in progerss</div>
        </>
      ) : (
        <DefaultLayout>
          <div className="fkex-row flex justify-evenly">
            <div className="w-full">
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
            <div className="w-full">
              <div className="flex flex-row">
                <div>Out</div>
              </div>
            </div>
          </div>

          <div className="mb-5"></div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {inputItem.map((item, index) => {
                return (
                  <tr key={index}>
                    <td>
                      <CommonInput
                        placeholder={"search item"}
                        input={inputItem[index]}
                        error={false}
                        errorMessage={""}
                        onInputChange={(val) => {
                          //copy input
                          const inputs = [...inputItem];
                          //update input index
                          inputs[index] = val;
                          setInputItem(inputs);
                          console.log(index);
                          console.log(val);
                        }}
                        onKeyChange={() => {}}
                      ></CommonInput>
                    </td>
                    <td>
                      <CommonInput
                        placeholder={"search item"}
                        input={inputQuantity[index]}
                        error={false}
                        errorMessage={""}
                        onInputChange={(val) => {
                          //copy input
                          const inputs = [...inputQuantity];
                          //update input index
                          inputs[index] = val;
                          setInputQuantity(inputs);
                        }}
                        onKeyChange={() => {}}
                      ></CommonInput>
                    </td>
                    <td>
                      <div
                        onClick={() => {
                          console.log(index);
                          const inputs = [...inputItem];
                          const quantities = [...inputQuantity];
                          inputs.splice(index, 1);

                          quantities.splice(index, 1);

                          setInputItem(inputs);
                          setInputQuantity(quantities);
                          //const updated = inputItem.splice(index, 1);
                          //setInputItem(updated);
                        }}
                      >
                        Delete
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <CommonButton
            label={"Add"}
            onClick={() => {
              //const nextRow = inputItem.length;
              setInputItem((prev) => [...prev, ""]);
              setInputQuantity((prev) => [...prev, 0]);
            }}
          />
          <CommonButton
            label={"print"}
            onClick={() => {
              console.log(inputItem);
              console.log(inputQuantity);
            }}
          />
        </DefaultLayout>
      )}
    </UserAuth>
  );
}
