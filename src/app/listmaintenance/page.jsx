"use client";
import { Appbar } from "@/components/appbar";
import { API_URL, IMAGE_ASSET } from "@/utils/constant";
import { formatDateTime } from "@/utils/dateformat";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AiTwotonePicture } from "react-icons/ai";
import { FaRegCalendarAlt, FaRegUser } from "react-icons/fa";
import { useMediaQuery } from "react-responsive";
import { DataProvider, useProvider } from "@/app/appcontext";

const JobCard = ({ data, router }) => {
  const desc = data["Description"];
  const mfg = data["Manufacture"];
  const model = data["Model"] == null ? "adfd" : data["Model"];
  const no = data["No"];
  const type = data["Type"];
  let description = "";
  if (type == "K") {
    description = `${mfg} ${model} ${no}`;
  } else {
    description = `${desc} ${mfg} ${model}`;
  }

  const image =
    data["Image"] == null ? "empty" : `${IMAGE_ASSET}/${data["Image"]}`;

  return (
    <div
      className="cursor-default px-2 pt-2"
      onClick={() => {
        router.push(`/asset/${data["ID_Asset"]}`);
      }}
    >
      <div className="rounded-md border p-2">
        <div className="flex flex-row items-start">
          <div className="mr-2">
            <div className=" h-auto w-20 rounded-lg  shadow-md">
              {image == "empty" ? (
                <AiTwotonePicture className="h-8 w-8" />
              ) : (
                <img src={image} className="object-cover" />
              )}
            </div>
          </div>
          <div className="w-2/3 ">
            <div className="flex flex-row items-center text-primary">
              <div className="mr-2">
                <FaRegUser />
              </div>
              <div className="">{data["Name"]}</div>
            </div>
            <div className="flex flex-row items-center text-primary">
              <div className="mr-2">
                <FaRegCalendarAlt />
              </div>
              <div>{formatDateTime(data["Time_Request"])}</div>
            </div>
            <div>{`${data["ID_Asset"]} / ${data["ID_Request"]}`}</div>
            <div className="overflow-hidden truncate whitespace-nowrap">
              {description}
            </div>

            <div className="overflow-hidden truncate whitespace-nowrap text-white">
              {data["Problem"]}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Page() {
  const [isClient, setIsClient] = useState(false);
  const isSmallScreen = useMediaQuery({ query: "(max-width: 640px)" });
  const router = useRouter();

  const {
    mainIssued,
    setMainIssued,
    mainProgress,
    setMainProgress,
    mainCompleted,
    setMainCompleted,
    mainLoading,
    setMainLoading,
  } = useProvider();

  const fetch_list_outstanding = async () => {
    const apiUrl = `${API_URL}/listmaintenance`;
    const response = await axios.get(apiUrl);

    if (response.status == 200) {
      const dataissued = response.data["issued"];
      const dataonprogress = response.data["onprogress"];
      const datacompleted = response.data["completed"];

      setMainIssued(dataissued);
      setMainProgress(dataonprogress);
      setMainCompleted(datacompleted);
      console.log(datacompleted);
      setMainLoading(false);
    }
  };

  useEffect(() => {
    if (mainLoading) {
      fetch_list_outstanding();
    }
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen  bg-boxdark-2">
      {isSmallScreen ? (
        <>
          <div className="min-h-screen  justify-center bg-boxdark-2">
            <Appbar></Appbar>

            {mainIssued.length > 0 ? (
              <>
                <div className="bg-gray p-2">Issued</div>
                {mainIssued.map((item, index) => {
                  return <JobCard data={item} key={index} router={router} />;
                })}
                <div className="mb-2"></div>
              </>
            ) : (
              <></>
            )}

            {mainProgress.length > 0 ? (
              <>
                <div className="bg-gray p-2">On Progress</div>
                {mainProgress.map((item, index) => {
                  return <JobCard data={item} key={index} router={router} />;
                })}
                <div className="mb-2"></div>
              </>
            ) : (
              <></>
            )}

            {mainCompleted.length > 0 ? (
              <>
                <div className="bg-gray p-2">Completed</div>
                {mainCompleted.map((item, index) => {
                  return <JobCard data={item} key={index} router={router} />;
                })}
                <div className="mb-2"></div>
              </>
            ) : (
              <></>
            )}
          </div>
        </>
      ) : (
        <></>
      )}
    </div>
  );
}
