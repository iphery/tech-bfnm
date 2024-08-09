"use client";
import UserAuth from "@/components/auth";
import { CommonInput, CurrencyInput } from "@/components/input";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { API_URL } from "@/utils/constant";
import axios from "axios";
import { useEffect, useState } from "react";
import { CustomSelect } from "@/components/select";
import { CommonButton, CommonButtonColor } from "@/components/button";
import { NotifySuccess } from "@/utils/notify";
import { useRouter } from "next/navigation";
import { PageCard } from "@/components/card";
import { formatDate, formatDateTime } from "@/utils/dateformat";
import { PageLoader } from "@/components/loader";

export default function ServiceDetail({ params }) {
  const router = useRouter();
  const [dataOrder, setDataOrder] = useState({});
  const [isClient, setIsClient] = useState(false);
  const [dataOrderDetail, setDataOrderDetail] = useState([]);

  const groupBudget = [
    { label: "ME01", value: "ME01", title: "Pelumasan" },
    { label: "ME02", value: "ME02", title: "Servis Kendaraan" },
    { label: "ME03", value: "ME03", title: "Servis Mesin Produksi" },
    { label: "ME04", value: "ME04", title: "Spare Part Kendaraan" },
    { label: "ME05", value: "ME05", title: "Spare Part Mesin Produksi" },
  ];

  const [inputAmount, setInputAmount] = useState([]);
  const [ids, setIds] = useState([]);
  const [listData, setListData] = useState([]);
  const [amountError, setAmountError] = useState([]);
  const [budgetError, setBudgetError] = useState([]);
  const [sellerError, setSellerError] = useState([]);
  const [dateReceive, setDateReceive] = useState("");
  const [dateReceiveError, setDateReceiveError] = useState(false);
  const [onSubmit, setOnSubmit] = useState(false);
  const [loader, setLoader] = useState(true);
  const [loaderDelete, setLoaderDelete] = useState(false);

  const fetch_data = async () => {
    const apiUrl = `${API_URL}/getservicedetail`;
    const response = await axios.post(apiUrl, {
      idRegister: params,
    });

    if (response.status == 200) {
      console.log(response);
      // console.log(response.data["detail"][0].ID_Asset);
      const order = response.data["order"][0];
      const detail = response.data["detail"];
      setDataOrder(order);
      setDataOrderDetail(detail);

      setLoader(false);

      const list = [];
      const amountErrorData = [];
      const budgetErrorData = [];
      const sellerErrorData = [];

      detail.map((item) => {
        // console.log(item);
        list.push({
          id: item["ids"],
          amount: "",
          budget: "",
          seller: "",
        });
        amountErrorData.push(false);
        budgetErrorData.push(false);
        sellerErrorData.push(false);
      });
      setListData(list);
      setAmountError(amountErrorData);
      setBudgetError(budgetErrorData);
      setSellerError(sellerErrorData);
      //console.log(order);
      //console.log(detail);
      // setOrderData(list);
    }
  };

  useEffect(() => {
    console.log(params);
    fetch_data();
  }, []);

  const receive_parts = async () => {
    setOnSubmit(true);
    let errorReceive = 0;
    if (dateReceive == "") {
      setDateReceiveError(true);
      errorReceive = 1;
    } else {
      setDateReceiveError(false);
      errorReceive = 0;
    }
    const amount = [...amountError];
    const budget = [...budgetError];
    const seller = [...sellerError];
    let amountCount = [];
    let budgetCount = [];
    let sellerCount = [];
    listData.map((item, index) => {
      if (item.amount == 0) {
        amount[index] = true;
        amountCount.push(1);
      } else {
        amount[index] = false;
        amountCount.push(0);
      }

      if (item.budget == "") {
        budget[index] = true;
        budgetCount.push(1);
      } else {
        budget[index] = false;
        budgetCount.push(0);
      }

      if (item.seller == "") {
        seller[index] = true;
        sellerCount.push(1);
      } else {
        seller[index] = false;
        sellerCount.push(0);
      }
    });
    setAmountError(amount);
    setBudgetError(budget);
    setSellerError(seller);

    const amountSum = amountCount.reduce(
      (accum, current) => accum + current,
      0,
    );
    const budgetSum = budgetCount.reduce(
      (accum, current) => accum + current,
      0,
    );
    const sellerSum = sellerCount.reduce(
      (accum, current) => accum + current,
      0,
    );

    const allError = errorReceive + amountSum + budgetSum + sellerSum;

    if (allError == 0) {
      const user = localStorage.getItem("info");
      const parseUser = JSON.parse(user);
      const apiUrl = `${API_URL}/getservicereceived`;
      const response = await axios.post(apiUrl, {
        idRegister: params.idRegister,
        date: dateReceive,
        list: listData,
        uid: parseUser[0]["Uid"],
      });

      if (response.status == 200) {
        const result = response.data["response"];
        NotifySuccess(result);
        router.back();
      }
    }
    setOnSubmit(false);
  };

  const delete_order = async () => {
    setLoaderDelete(true);
    const apiUrl = `${API_URL}/deleteservice`;
    const response = await axios.post(apiUrl, {
      idOrder: params,
    });

    if (response.status == 200) {
      const result = response.data["response"];
      NotifySuccess(result);

      router.back();
    }
    setLoaderDelete(false);
  };

  const open_in_new_tab = (url) => {
    const newWindow = window.open(url, "_blank", "noopener,noreferrer");
    if (newWindow) newWindow.opener = null;
  };

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
          <DefaultLayout>
            <div className="mb-3 flex items-center justify-start">
              <div className="text-lg text-white">Order Detail</div>
            </div>

            <PageCard>
              <div className="flex flex-row">
                <div className="w-full">
                  <div className="flex justify-evenly">
                    <div className="w-full">No Register</div>
                    <div className="w-full">{dataOrder["id_register"]}</div>
                  </div>
                  <div className="flex justify-evenly">
                    <div className="w-full">Date</div>
                    <div className="w-full">
                      {formatDate(dataOrder["date_issued"])}
                    </div>
                  </div>

                  <div className="flex justify-evenly">
                    <div className="w-full">Issued </div>
                    <div className="w-full">{dataOrder["Name"]}</div>
                  </div>
                </div>
                <div className="px-5"></div>

                <div className="w-full">
                  <div className="flex justify-evenly">
                    <div className="w-full">Status</div>
                    <div
                      className={`w-full ${dataOrder["status"] == 0 ? "text-red" : "text-success"}`}
                    >
                      {dataOrder["status"] == 0 ? "Open" : "Close"}
                    </div>
                  </div>
                  <div className="flex justify-evenly">
                    <div className="w-full">Date Receive</div>

                    {dataOrder["status"] == 1 ? (
                      <div className="w-full">
                        {formatDate(dataOrder["date_received"])}
                      </div>
                    ) : (
                      <div className="w-full">
                        <CommonInput
                          type={"date"}
                          input={dateReceive}
                          errorMessage="Required"
                          error={dateReceiveError}
                          onInputChange={(val) => {
                            setDateReceive(val);
                          }}
                          onChg={() => {
                            setDateReceiveError(false);
                          }}
                        ></CommonInput>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-5 flex justify-end">
                <CommonButton
                  onClick={() => {
                    const service = JSON.stringify(dataOrder);
                    const service_detail = JSON.stringify(dataOrderDetail);
                    console.log(service);
                    localStorage.setItem("service", service);
                    localStorage.setItem("servicedetail", service_detail);
                    const url = `/partsservice/print`;
                    router.push(url);
                    //open_in_new_tab(url);
                  }}
                  label={"Print"}
                />
              </div>
            </PageCard>
            <div className="mb-3" />
            <PageCard>
              <div className=" w-full">
                <table className="w-full">
                  <thead className="sticky top-0">
                    <tr>
                      <th>No</th>
                      <th>Item</th>
                      <th>Unit</th>
                      <th>Quantity</th>
                      <th>Required</th>
                      <th>Remark</th>
                      <th>ID Service</th>

                      {dataOrder["status"] == 0 ? (
                        <th>Input Data</th>
                      ) : (
                        <>
                          <th>Amount</th>
                          <th>Budget Pos</th>
                          <th>Supplier</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {dataOrderDetail.map((item, index) => {
                      return (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{item["item"]}</td>
                          <td>{item["unit"]}</td>
                          <td>{item["quantity"]}</td>
                          <td>{item["required_date"]}</td>
                          <td>{item["remark"]}</td>
                          <td>
                            <div
                              className="cursor-default hover:text-red"
                              onClick={() => {
                                router.push(`/asset/${item["ID_Asset"]}`);
                              }}
                            >
                              {item["id_request"]}
                            </div>
                          </td>

                          {dataOrder["status"] == 0 ? (
                            <td>
                              <CurrencyInput
                                placeholder={"Amount"}
                                type={"text"}
                                input={listData[index].amount}
                                error={amountError[index]}
                                errorMessage="Required"
                                onInputChange={(val) => {
                                  const input = [...listData];
                                  input[index].amount = val;
                                  setListData(input);
                                }}
                                onKeyChange={() => {
                                  const input = [...amountError];
                                  input[index] = false;
                                  setAmountError(input);
                                }}
                              >
                                Rp.
                              </CurrencyInput>
                              <CustomSelect
                                optionData={groupBudget}
                                placeholder={"Select budget"}
                                error={budgetError[index]}
                                errorMessage="Required"
                                mode={1}
                                onSelected={(option) => {
                                  const input = [...listData];
                                  input[index].budget = option.value;
                                  setListData(input);

                                  const input1 = [...budgetError];
                                  input1[index] = false;
                                  setBudgetError(input1);
                                }}
                              />
                              <CommonInput
                                placeholder={"Enter supplier"}
                                error={sellerError[index]}
                                errorMessage="Required"
                                onInputChange={(val) => {
                                  const input = [...listData];
                                  input[index].seller = val;
                                  setListData(input);
                                }}
                                onKeyChange={() => {
                                  const input = [...sellerError];
                                  input[index] = false;
                                  setSellerError(input);
                                }}
                              ></CommonInput>
                            </td>
                          ) : (
                            <>
                              <td>{item["amount"]}</td>
                              <td>{item["budget_pos"]}</td>
                              <td>{item["supplier"]}</td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {dataOrder["status"] == 0 ? (
                <>
                  <hr className="my-5"></hr>
                  <div className="flex justify-end">
                    {!onSubmit ? (
                      <CommonButtonColor
                        label={"Delete"}
                        color1={"bg-red"}
                        color2={"bg-meta-1"}
                        onload={loaderDelete}
                        disabled={loaderDelete}
                        onClick={delete_order}
                      ></CommonButtonColor>
                    ) : (
                      <></>
                    )}

                    <div className="mr-3"></div>
                    {!loaderDelete ? (
                      <CommonButton
                        label={"Receive"}
                        onClick={() => {
                          receive_parts();
                        }}
                        onload={onSubmit}
                        disabled={onsubmit}
                      ></CommonButton>
                    ) : (
                      <></>
                    )}
                  </div>
                </>
              ) : (
                <></>
              )}
            </PageCard>
          </DefaultLayout>
        </div>
      )}
    </UserAuth>
  );
}
