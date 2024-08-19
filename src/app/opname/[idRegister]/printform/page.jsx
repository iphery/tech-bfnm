"use client";
import { API_URL } from "@/utils/constant";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import "@/css/print.css";
import { formatDateLocal } from "@/utils/dateformat";

export default function Page() {
  const router = useRouter();
  const params = useParams();

  const [dataOpname, setDataOpname] = useState([]);
  const [startPeriod, setStartPeriod] = useState("");
  const [endPeriod, setEndPeriod] = useState("");

  const fetch_data = async () => {
    console.log(params.idRegister);
    const apiUrl = `${API_URL}/getopnameprint`;
    const response = await axios.post(apiUrl, {
      idRegister: params.idRegister,
    });

    if (response.status == 200) {
      const array = response.data["response"][0];

      const listOpname = array.result;
      const parsedList = JSON.parse(listOpname);
      const start = array.start_date;
      const end = array.end_date;
      setDataOpname(parsedList);
      setStartPeriod(start);
      setEndPeriod(end);
      console.log(array);
    }
  };

  useEffect(() => {
    fetch_data();
  }, []);

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center justify-between">
          <b>Laporan Inventory Spare Part Bengkel</b>
          <i className="text-sm">PT Balifoam Nusamegah</i>
        </div>
        <div className="text-sm">{`Period : ${formatDateLocal(startPeriod)} ~ ${formatDateLocal(endPeriod)}`}</div>
      </div>
      <div className="page-content">
        <table className="">
          <thead>
            <tr className="text-sm">
              <th>No</th>
              <th className="w-[250px]">Nama</th>
              <th>Detail</th>
              <th>Lokasi</th>
              <th className="w-[100px]">Stok</th>
            </tr>
          </thead>
          <tbody>
            {dataOpname.map((item, index) => {
              return (
                <tr key={index}>
                  <td className="text-center text-xs">{index + 1}</td>
                  <td className=" text-xs">{item["description"]}</td>
                  <td className=" text-xs">{item["vendor_code"]}</td>
                  <td className=" text-xs">{item["location"]}</td>
                  <td className="text-center text-xs"></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
