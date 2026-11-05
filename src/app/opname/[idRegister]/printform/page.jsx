"use client";
import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import "@/css/print.css";
import { formatDateLocal } from "@/utils/dateformat";

export default function Page() {
  const params = useParams();

  const [dataOpname, setDataOpname] = useState([]);
  const [startPeriod, setStartPeriod] = useState("");
  const [endPeriod, setEndPeriod] = useState("");

  const fetch_data = async () => {
    try {
      const response = await axios.post("/api/getopnameprint", {
        idRegister: params.idRegister,
      });

      if (response.status === 200 && response.data?.response?.[0]) {
        const array = response.data["response"][0];
        const listOpname = array.result;
        const parsedList = typeof listOpname === "string" ? JSON.parse(listOpname) : (listOpname || []);
        setDataOpname(parsedList);
        setStartPeriod(array.start_date || "");
        setEndPeriod(array.end_date || "");
      }
    } catch (err) {
      console.error("Gagal memuat form print opname:", err);
    }
  };

  useEffect(() => {
    fetch_data();
  }, [params.idRegister]);

  // Otomatis membuka dialog print preview setelah data berhasil dimuat
  useEffect(() => {
    if (dataOpname.length > 0) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [dataOpname]);

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
