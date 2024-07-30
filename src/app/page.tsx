"use client";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

import { auth } from "@/app/firebase-config";
import { signOut } from "firebase/auth";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "./appcontext";
import { useMediaQuery } from "react-responsive";
import { API_URL, ICON, IMAGE_ASSET, OLD_API_URL } from "@/utils/constant";
import axios from "axios";
import {
  MdCalendarMonth,
  MdOutlineAccessTime,
  MdOutlineAddBox,
  MdOutlineCalendarMonth,
  MdOutlineDocumentScanner,
  MdOutlineVerifiedUser,
} from "react-icons/md";
import { LiaUser } from "react-icons/lia";
import { Menu } from "@/components/menu";
import { useRouter } from "next/navigation";
import UserAuth from "@/components/auth";
import { HiUserAdd } from "react-icons/hi";

export default function Home() {
  const isSmallScreen = useMediaQuery({ query: "(max-width: 640px)" });
  const { accountInfo, setMenu } = useContext(AppContext);
  const router = useRouter();

  const sign_out = async () => {
    await signOut(auth);
  };

  const [servisMachine, setServiceMachine] = useState([]);
  const [maintenanceMachine, setMaintenanceMachine] = useState([]);

  const items = [
    { id: "1" },
    { id: "2" },
    { id: "3" },
    { id: "4" },
    { id: "5" },
  ];

  const fetch_data = async () => {
    const apiUrl = `/api/outstanding`;
    const response = await axios.post(apiUrl, { data: "data" });

    if (response.status == 200) {
      const array = response.data["response"]["data"];
      console.log(array);
      if (array[0]["dataDetail"] != "") {
        setServiceMachine(array[0]["dataDetail"]);
      }

      setMaintenanceMachine(array[1]["dataDetail"]);
    }
  };

  useEffect(() => {
    fetch_data();
  }, []);

  const fetch_data_2 = async () => {
    const apiUrl = `/api/outstanding`;
    const response = await axios.post(apiUrl, { data: "data" });

    if (response.status == 200) {
      const array = response.data["response"]["data"];
      console.log(array);
      setServiceMachine(array[0]["dataDetail"]);
      setMaintenanceMachine(array[1]["dataDetail"]);
    }
  };

  return (
    <UserAuth>
      {isSmallScreen ? (
        <>
          <div className="min-h-screen  justify-center bg-boxdark-2">
            <div className="relative">
              <div className="absolute w-full p-2 ">
                <div className="h-12   ">
                  <div className="flex justify-center">
                    <div className="flex  items-center justify-center rounded-lg bg-white shadow-lg">
                      <div
                        onClick={() => {
                          router.push("/new_asset");
                        }}
                        className="px-3 py-2"
                      >
                        <MdOutlineAddBox className="h-6 w-6" />
                      </div>
                      <div
                        onClick={() => {
                          router.push("/scanner");
                        }}
                        className="px-3 py-2"
                      >
                        <MdOutlineDocumentScanner className="h-6 w-6" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-5 h-[190px]">
                <img
                  src="https://mita.balifoam.com/mobile/flutter/image_carousel/image_picker_crop_6885ee38-a228-4c21-bfc8-16549c41a76d.jpg"
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <div className="grid grid-cols-4 gap-4">
                  <div
                    onClick={() => {
                      localStorage.setItem("menu", "K");
                      router.push("/asset");
                    }}
                  >
                    <Menu url={"bmw.png"}>Kendaraan</Menu>
                  </div>
                  <div
                    onClick={() => {
                      localStorage.setItem("menu", "MP");
                      router.push("/asset");
                    }}
                  >
                    {" "}
                    <Menu url={"mesin.png"}>Mesin</Menu>
                  </div>

                  <Menu url={"ac.png"}>AC</Menu>
                  <Menu url={"pc.png"}>Komputer</Menu>
                  <Menu url={"apar.png"}>Fire Safety</Menu>
                  <Menu url={"genset.png"}>Power</Menu>
                  <Menu url={"lainnya.png"}>Utility</Menu>
                  <Menu url={"other_menu.png"}>Lainnya</Menu>
                </div>
              </div>

              <div className="p-5">
                <div className="">
                  {servisMachine.length > 0 ? (
                    <div className="mb-5 flex flex-row justify-between">
                      <div
                        onClick={() => {
                          console.log(servisMachine);
                        }}
                      >
                        Outstanding
                      </div>
                      <div>{`Lihat semua (${servisMachine.length})`} </div>
                    </div>
                  ) : (
                    <></>
                  )}

                  <div className=" flex space-x-4 overflow-x-auto">
                    {servisMachine.map((item, index) => {
                      const title =
                        item["Type"] == "K"
                          ? item["Class"]
                          : item["Description"];
                      const image = `${IMAGE_ASSET}/${item["Image"]}`;
                      console.log(image);
                      return (
                        <div key={index}>
                          <div>
                            <img
                              className="h-40 w-[175px] rounded-t-lg object-cover"
                              src={image}
                            />
                          </div>
                          <div className="col  w-[175px] rounded-b-lg bg-white p-2">
                            <div className=" overflow-hidden truncate whitespace-nowrap text-sm">
                              {title}
                            </div>
                            <div className="flex flex-row items-center justify-start">
                              <LiaUser className="mr-2" />
                              <div className="text-sm">{item["Requestor"]}</div>
                            </div>
                            <div className="flex flex-row items-center justify-start">
                              <MdOutlineCalendarMonth className="mr-2" />
                              <div className="text-sm">
                                {item["Date_Request"]}
                              </div>
                            </div>
                            <div className="flex flex-row items-center justify-start">
                              <MdOutlineAccessTime className="mr-2" />
                              <div className="text-sm">
                                {item["Time_Request"]}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="">
                  <div className=" mb-5 flex flex-row justify-between">
                    <div>Maintenance</div>
                    <div>{`Lihat semua (${maintenanceMachine.length})`} </div>
                  </div>
                  <div className=" flex space-x-4 overflow-x-auto">
                    {maintenanceMachine.map((item, index) => {
                      const title =
                        item["Type"] == "K"
                          ? item["Class"]
                          : item["Description"];
                      const image = `${IMAGE_ASSET}/${item["Image"]}`;

                      return (
                        <div key={index}>
                          <div>
                            <img
                              className="h-30 w-[140px] rounded-t-lg object-cover"
                              src={image}
                            />
                          </div>
                          <div className="col  w-[140px] rounded-b-lg bg-white p-2">
                            <div className=" overflow-hidden truncate whitespace-nowrap text-sm">
                              {title}
                            </div>
                            <div className="flex flex-row items-center justify-start">
                              <LiaUser className="mr-2" />
                              <div className="text-sm">{item["Requestor"]}</div>
                            </div>
                            <div className="flex flex-row items-center justify-start">
                              <MdOutlineCalendarMonth className="mr-2" />
                              <div className="mr-2 text-sm">
                                {item["Date_Request"]}
                              </div>
                            </div>
                            <div className="flex flex-row items-center justify-start">
                              <MdOutlineAccessTime className="mr-2" />
                              <div className="text-sm">
                                {item["Time_Request"]}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <DefaultLayout>
          <div onClick={sign_out}>aaa</div>
          <div
            onClick={() => {
              // setLanguage('fuck up')
              const a = localStorage.getItem("info")!;

              console.log(JSON.parse(a));
            }}
          >
            bbb
          </div>
          <div onClick={() => {}}>ccc</div>
        </DefaultLayout>
      )}
    </UserAuth>
  );

  /*
  return (
    <div className="relative">
    
      <div className="absolute left-0 top-0 z-10 ">
      
        <p className="flex justify-center">
          <div className="h-8 w-8 bg-red">abc</div>
          <div className="h-8 w-8">cde</div>
        </p>
      </div>

      <div className="absolute left-0 top-100 z-20 ">
      
        <p className="flex justify-end">
          <div className="h-10 w-10 bg-red">abc</div>
          <div className="h-8 w-8">cde</div>
        </p>
      </div>

    
      <div className=" w-full bg-blue-500">
       
        <div className="bg-green h-[120px] w-full">
          <p className="text-center">Sub-container 1</p>
        </div>

       
        <div className="h-[100px] w-full bg-black">
          <p className="text-center">Sub-container 2</p>
        </div>
      </div>
    </div>
  );
  */
}
