"use client";
import UserAuth from "@/components/auth";
import { PageCard } from "@/components/card";
import { CommonInput } from "@/components/input";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { PageLoader } from "@/components/loader";
import { API_URL } from "@/utils/constant";
import axios from "axios";
import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";

export default function DetailPart({ params }) {
  const [loader, setLoader] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const isSmallScreen = useMediaQuery({ query: "(max-width: 640px)" });
  const [detailData, setDetailData] = useState({});
  const [stockData, setStockData] = useState([]);

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
    const response = await axios.post(apiUrl, { idPart: params.idPart });

    if (response.status == 200) {
      const array = response.data["response"];
      const reverseArray = [...array].reverse();
      setStockData(reverseArray);
    }
  };

  useEffect(() => {
    fetch_data();
  }, []);

  useEffect(() => {
    fetch_stock_data();
  }, []);

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
                    <div className="flex justify-evenly">
                      <div className="w-full">Description</div>
                      <div className="w-full">{detailData["description"]}</div>
                    </div>
                    <div className="flex justify-evenly">
                      <div className="w-full">Part No</div>
                      <div className="w-full">{detailData["vendor_code"]}</div>
                    </div>
                    <div className="flex justify-evenly">
                      <div className="w-full">Location</div>
                      <div className="w-full">{detailData["location"]}</div>
                    </div>
                    <div className="flex justify-evenly">
                      <div className="w-full">Remark </div>
                      <div className="w-full">{detailData["remark"]}</div>
                    </div>
                  </div>
                  <div className="px-5"></div>

                  <div className="w-full">
                    <div className="flex justify-evenly">
                      <div className="w-full">Status</div>
                    </div>
                  </div>
                </div>
              </PageCard>
              <div className="mb-5"></div>
              <PageCard>
                <div className="flex flex-row">
                  <div>
                    <div className="mb-2 text-sm text-white">From</div>
                    <CommonInput type={"date"}></CommonInput>
                  </div>
                  <div className="ml-2"></div>
                  <div>
                    <div className="mb-2 text-sm text-white">To</div>
                    <CommonInput type={"date"}></CommonInput>
                  </div>
                </div>
                <div className="mb-5"></div>
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="w-1/6">Date</th>
                      <th className="w-1/6">In</th>
                      <th className="w-1/6">Out</th>
                      <th className="w-1/6">Balance</th>
                      <th className="w-1/6">From/To</th>
                      <th className="w-1/6">Reference</th>
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
                          <td>{item["reference"]}</td>
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
