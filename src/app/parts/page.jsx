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

export default function ListPart() {
  const router = useRouter();
  const isSmallScreen = useMediaQuery({ query: "(max-width: 640px)" });

  const [detailData, setDetailData] = useState([]);
  const [countData, setCountData] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [keywordError, setKeywordError] = useState(false);
  const [filteredList, setFilteredList] = useState([]);

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
          <div className="mb-5"></div>
          <table>
            <thead>
              <tr>
                <TableHeader>Kode</TableHeader>
                <TableHeader>Deskripsi</TableHeader>
                <TableHeader>Part No</TableHeader>
                <TableHeader>Kode Pabrik</TableHeader>
                <TableHeader>Kode </TableHeader>
                <TableHeader>Lokasi Simpan</TableHeader>
              </tr>
            </thead>
            <tbody>
              {!loading ? (
                filteredList.map((item, index) => {
                  return (
                    <tr key={index}>
                      <TableContent>{item["part_code"]}</TableContent>
                      <TableContent>{item["description"]}</TableContent>
                      <TableContent>{item["part_no"]}</TableContent>
                      <TableContent>{item["manufacture_code"]}</TableContent>
                      <TableContent>{item["location"]}</TableContent>
                    </tr>
                  );
                })
              ) : (
                <></>
              )}
            </tbody>
          </table>

          <div className="p-1">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full border shadow-md"
              onClick={onPageChange}
            >
              <GoChevronRight></GoChevronRight>
            </div>
          </div>
        </DefaultLayout>
      )}
    </UserAuth>
  );
}
