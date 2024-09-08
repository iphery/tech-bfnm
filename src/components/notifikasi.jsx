import { API_URL } from "@/utils/constant";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Loader from "./common/Loader";

export default function Notifikasi() {
  const [level, setLevel] = useState("");
  const [uid, setUid] = useState("");
  const [tempUid, setTempUid] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [loaderClose, setLoaderClose] = useState(false);

  const fetch_data = async () => {
    console.log("wow");
    console.log(uid);
    const apiUrl = `${API_URL}/checkpending`;
    const response = await axios.post(apiUrl, {
      uid: uid,
    });

    if (response.status == 200) {
      console.log(response.data);
      const count = response.data["response"];
      setPendingCount(count);
    }
  };

  const close_pending = async () => {
    setLoaderClose(true);

    const apiUrl = `${API_URL}/closepending`;
    const response = await axios.post(apiUrl, {
      uid: uid,
    });

    if (response.status == 200) {
      setLoaderClose(false);
      console.log(response.data);
    }
  };

  useEffect(() => {
    const user = localStorage.getItem("info");
    const parseUser = JSON.parse(user);
    setUid(parseUser[0]["Uid"]);
    setLevel(parseUser[0]["Level"]);

    setTempUid(true);
  }, []);

  useEffect(() => {
    if (tempUid) {
      fetch_data();
    }
  }, [tempUid, loaderClose]);
  return (
    <div>
      {level == "4" && pendingCount > 0 ? (
        <div className="p-5">
          <div className="bg-white">
            <div className="px-2">
              {`Kamu punya ${pendingCount} request yang belum di tutup.`}
            </div>
            <div className="group flex cursor-default justify-end p-2">
              <div
                onClick={close_pending}
                className=" rounded bg-danger px-2 text-sm text-white shadow-md"
              >
                {loaderClose ? <>Please wait...</> : <>Tutup sekarang</>}
              </div>
            </div>
          </div>
        </div>
      ) : parseInt(level) <= 2 && pendingCount > 0 ? (
        <div className="p-5">
          <div className="bg-white">
            <div className="px-2">
              {`Kamu punya ${pendingCount} request yang masih pending.`}
            </div>
            <div className="flex justify-end p-2">
              <div className=" rounded bg-danger px-2 text-sm text-white shadow-md">
                Check di bawah
              </div>
            </div>
          </div>
        </div>
      ) : level == "3" && pendingCount > 0 ? (
        <div className="p-5">
          <div className="bg-white">
            <div className="px-2">
              Kamu punya xx request yang belum di tutup.
            </div>
            <div className="flex justify-end p-2">
              <div className=" rounded bg-danger px-2 text-sm text-white shadow-md">
                Tutup sekarang
              </div>
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
