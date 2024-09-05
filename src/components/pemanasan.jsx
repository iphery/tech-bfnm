import { API_URL } from "@/utils/constant";
import { formatTime, shortDate } from "@/utils/dateformat";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaRegUser } from "react-icons/fa";
import { MdOutlineDocumentScanner } from "react-icons/md";
import { DataProvider, useProvider } from "@/app/appcontext";

export default function Pemanasan() {
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(2);
  const [dataPemanasan, setDataPemanasan] = useState([]);
  const router = useRouter();
  const { scanGenset, setScanGenset, gensetSelectedId, setGensetSelectedId } =
    useProvider();

  const [loadMore, setLoadMore] = useState(false);

  const fetch_data = async () => {
    console.log("aaaas");
    const apiUrl = `${API_URL}/listpemanasan?page=${page}`;
    const response = await axios.get(apiUrl);

    if (response.status == 200) {
      const lastpage = response.data["data"]["last_page"];
      const data = response.data["data"]["data"];
      if (loadMore) {
        setDataPemanasan((prev) => [...prev, ...data]);
        setLoadMore(false);
      } else {
        setDataPemanasan(data);
      }

      setLastPage(lastPage);
      console.log(data);
    }
  };

  const saving_data = async () => {
    //const id = localStorage.getItem("gensetselectedid");
    //console.log(id);
    //const apiUrl = `${API_URL}/listpemanasan?page=${page}`;
    //const response = await axios.post(apiUrl,{
    //});
  };

  const scan = (id) => {
    setGensetSelectedId(id);
    router.push("/scannergenset");
  };

  useEffect(() => {
    fetch_data();
  }, [page]);

  return (
    <div className="p-2">
      {dataPemanasan.map((item, index) => {
        const start = formatTime(item["Time_Start"]);

        const stop = formatTime(item["Time_Stop"]);
        return (
          <div key={index}>
            <div className="flex justify-between">
              <div className="flex flex-row items-center text-primary">
                <div className="mr-2">
                  <FaRegUser />
                </div>
                <div className="">{item["Name"]}</div>
              </div>
              {item["Step"] == 0 ? (
                <div
                  onClick={() => {
                    //setGensetSelectedId(item["ID_Asset"]);
                    scan(item["ID_Request"]);
                  }}
                  className="flex items-center rounded bg-primary px-1 text-center text-xs text-white"
                >
                  Issued
                </div>
              ) : item["Step"] == 1 ? (
                <div
                  onClick={() => {
                    // setGensetSelectedId(item["ID_Request"]);
                    // scan();
                  }}
                  className="flex items-center rounded bg-warning px-1 text-center text-xs text-white"
                >
                  Starting
                </div>
              ) : item["Step"] == 2 ? (
                <div className="flex items-center rounded bg-success px-1 text-center text-xs text-white">
                  Completed
                </div>
              ) : (
                <div className="flex items-center rounded bg-danger px-1 text-center text-xs text-white">
                  Missed
                </div>
              )}
            </div>
            <div className="flex justify-between">
              <div>{shortDate(item["Time_Request"])}</div>
              <div>{`${start} - ${stop}`}</div>
            </div>
          </div>
        );
      })}
      <div
        className="mt-4 flex justify-center text-sm"
        onClick={() => {
          console.log("dfkdsjfjsdlf");

          const pg = parseInt(page) + 1;
          setPage(pg);
          setLoadMore(true);
        }}
      >
        Load more...
      </div>
    </div>
  );
}
