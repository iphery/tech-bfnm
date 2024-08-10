"use client";
import UserAuth from "@/components/auth";
import { CommonButtonColor } from "@/components/button";
import { PageCard } from "@/components/card";
import Loader from "@/components/common/Loader";
import { CommonInput } from "@/components/input";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { PageLoader } from "@/components/loader";
import { CustomModal } from "@/components/modal";
import { API_URL } from "@/utils/constant";
import { getDateTime } from "@/utils/dateformat";
import { NotifyError, NotifySuccess } from "@/utils/notify";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CiEdit } from "react-icons/ci";
import { useMediaQuery } from "react-responsive";

export default function DetailOpname({ params, interval = 5000 }) {
  const [loader, setLoader] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const isSmallScreen = useMediaQuery({ query: "(max-width: 640px)" });
  const [detailData, setDetailData] = useState({});
  const [stockData, setStockData] = useState([]);
  const [startDate, setStartDate] = useState(
    get_first_date().toISOString().substring(0, 10),
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().substring(0, 10),
  );

  const [deleteOnload, setDeleteOnload] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [opnameData, setOpnameData] = useState([]);
  const [modalActual, setModalActual] = useState(false);
  const [selectedPart, setSelectedPart] = useState("");
  const [inputActual, setInputActual] = useState("");
  const [inputActualError, setInputActualError] = useState(false);
  const [savingActual, setSavingActual] = useState(false);

  const fetch_data = async () => {
    const apiUrl = `${API_URL}/opnamedetail`;
    const response = await axios.post(apiUrl, {
      idRegister: params.idRegister,
    });

    if (response.status == 200) {
      const array = response.data["response"];

      // setDetailData(array);
      console.log(array[0]["result"]);

      const result = JSON.parse(array[0]["result"]);
      console.log(result);
      setOpnameData(result);

      //console.log(array["description"]);
    }
    setLoader(false);
  };

  function get_first_date() {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  }

  useEffect(() => {
    fetch_data();
    const timer = setInterval(fetch_data, interval);

    return () => clearInterval(timer);
  }, [interval]);

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
            <div className="relative">
              <div className="absolute z-0 h-full w-full">
                <DefaultLayout>
                  <div className="flex min-h-[calc(100vh-115px)] flex-col">
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
                          <div className="flex justify-evenly py-1">
                            <div className="w-full">Description</div>
                            <div className="w-full">dfdf</div>
                          </div>
                        </div>
                        <div className="px-5"></div>

                        <div className="w-full"></div>
                      </div>
                      <div className="mt-5 flex items-center justify-end">
                        aaa
                      </div>
                    </PageCard>
                    <div className="mb-5"></div>
                    <PageCard>
                      <div className="mb-5"></div>
                      <div className="h-[calc(100vh-325px)] overflow-y-auto">
                        <table className="w-full">
                          <thead className="sticky top-0 bg-black">
                            <tr>
                              <th className="">Description</th>
                              <th className="">Code</th>
                              <th className="">Initial</th>
                              <th className="">In</th>
                              <th className="">Out</th>
                              <th className="">Balance</th>
                              <th className="w-1/4">Actual</th>
                              <th className="">Diff</th>
                            </tr>
                          </thead>
                          <tbody>
                            {opnameData.map((item, index) => {
                              return (
                                <tr key={index}>
                                  <td>{item["description"]}</td>
                                  <td>{item["vendor_code"]}</td>
                                  <td className="text-center">
                                    {item["initial"]}
                                  </td>
                                  <td className="text-center">{item["in"]}</td>
                                  <td className="text-center">{item["out"]}</td>
                                  <td className="text-center">
                                    {item["balance"]}
                                  </td>

                                  <td className="">
                                    <div className="flex justify-center">
                                      <div className="mr-2">
                                        {item["actual"]}
                                      </div>
                                      <div
                                        className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-black hover:text-white"
                                        onClick={() => {
                                          setSelectedPart(item["id_part"]);
                                          setModalActual(true);
                                        }}
                                      >
                                        <CiEdit />
                                      </div>
                                    </div>
                                  </td>
                                  <td>{item["diff"]}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </PageCard>
                  </div>
                </DefaultLayout>
              </div>
              <CustomModal
                isVisible={modalActual}
                isSmallWidth={"sm"}
                onClose={() => {
                  setModalActual(false);
                }}
              >
                <CommonInput
                  placeholder={"Enter actual quantity"}
                  type={"number"}
                  isDisabled={savingActual}
                  errorMessage={"Required"}
                  error={inputActualError}
                  isAutoFocus={true}
                  onInputChange={(val) => {
                    setInputActual(val);
                  }}
                  onKeyChange={async (event) => {
                    if (event.key == "Enter") {
                      //disini save
                      setSavingActual(true);
                      const lists = [...opnameData];
                      lists.map((item, index) => {
                        if (item["id_part"] == selectedPart) {
                          item["actual"] = inputActual;
                          item["diff"] = item["balance"] - inputActual;
                          item["checked_at"] = getDateTime();
                          item["checked_by"] = "abc";
                        }
                      });

                      const apiUrl = `${API_URL}/opnameupdateactual`;
                      const response = await axios.post(apiUrl, {
                        idRegister: params.idRegister,
                        data: JSON.stringify(lists),
                      });

                      if (response.status == 200) {
                        //const array = response.data["response"];
                        setModalActual(false);
                        setSavingActual(false);
                      }

                      //set disini dan update database
                      setModalActual(false);
                    }
                  }}
                />
                {savingActual ? <div>Please wait</div> : <></>}
              </CustomModal>
            </div>
          )}
        </div>
      )}
    </UserAuth>
  );
}
