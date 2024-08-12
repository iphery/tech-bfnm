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
import {
  formatDate,
  formatDateLocal,
  formatDateTime,
  getDateTime,
  shortDate,
} from "@/utils/dateformat";
import { NotifyError, NotifySuccess } from "@/utils/notify";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CiEdit } from "react-icons/ci";
import { useMediaQuery } from "react-responsive";

export default function DetailOpname({ params }) {
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

  const [info, setInfo] = useState({});

  const fetch_data = async () => {
    console.log(1);
    const apiUrl = `${API_URL}/opnamedetail`;
    const response = await axios.post(apiUrl, {
      idRegister: params.idRegister,
    });

    if (response.status == 200) {
      const array = response.data["response"];

      const result = JSON.parse(array[0]["result"]);
      setInfo({
        name: array[0]["Name"],
        id_report: array[0]["id_report"],
        startDate: array[0]["start_date"],
        endDate: array[0]["end_date"],
        created: array[0]["created_at"],
      });

      setOpnameData(result);
    }
    setLoader(false);
  };

  function get_first_date() {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  }

  useEffect(() => {
    fetch_data();

    function refresh() {
      fetch_data();
    }
    const interval = setInterval(refresh, 10000);

    return () => clearInterval(interval);
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
                        Stock Opname Detail
                      </div>
                    </div>
                    <PageCard>
                      <div className="flex w-1/2 flex-row">
                        <div className="w-full">
                          <div className="mb-1 flex justify-evenly">
                            <div className="w-full">ID Report</div>
                            <div className="w-full">{info.id_report}</div>
                          </div>
                          <div className="mb-1 flex justify-evenly">
                            <div className="w-full">Periode</div>
                            <div className="w-full">
                              {`${shortDate(info.startDate)} ~ ${shortDate(info.endDate)}`}
                            </div>
                          </div>
                          <div className="mb-1 flex justify-evenly">
                            <div className="w-full">Created by</div>
                            <div className="w-full">{info.name}</div>
                          </div>
                          <div className="mb-1 flex justify-evenly">
                            <div className="w-full">Created at</div>
                            <div className="w-full">
                              {formatDateTime(info.created)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </PageCard>
                    <div className="mb-5"></div>
                    <PageCard>
                      <div className="h-[calc(100vh-340px)] overflow-y-auto">
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
                              <th className="">Checked</th>
                            </tr>
                          </thead>
                          <tbody>
                            {opnameData.map((item, index) => {
                              return (
                                <tr key={index}>
                                  <td className="p-1">{item["description"]}</td>
                                  <td className="p-1">{item["vendor_code"]}</td>
                                  <td className="p-1 text-center">
                                    {item["initial"]}
                                  </td>
                                  <td className="p-1 text-center">
                                    {item["in"]}
                                  </td>
                                  <td className="p-1 text-center">
                                    {item["out"]}
                                  </td>
                                  <td className="p-1 text-center">
                                    {item["balance"]}
                                  </td>

                                  <td className="p-1">
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
                                  <td className="p-1 text-center">
                                    {item["diff"]}
                                  </td>
                                  <td className="w-[150px] p-1 text-center">
                                    {item["checked_by"]}
                                  </td>
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
                      const user = localStorage.getItem("info");
                      const parseUser = JSON.parse(user);
                      const lists = [...opnameData];
                      lists.map((item, index) => {
                        if (item["id_part"] == selectedPart) {
                          item["actual"] = inputActual;
                          item["diff"] = item["balance"] - inputActual;
                          item["checked_at"] = getDateTime();
                          item["checked_by"] = parseUser[0]["Name"];
                          item["checked_id"] = parseUser[0]["Uid"];

                          return;
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