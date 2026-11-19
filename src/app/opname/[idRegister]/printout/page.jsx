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
  const [loading, setLoading] = useState(true);

  const fetch_data = async () => {
    try {
      const response = await axios.post("/api/getopnameprint", {
        idRegister: params.idRegister,
      });

      if (response.status === 200 && response.data?.response?.[0]) {
        const array = response.data["response"][0];
        const listOpname = array.result;
        const parsedList =
          typeof listOpname === "string"
            ? JSON.parse(listOpname)
            : listOpname || [];
        setDataOpname(parsedList);
        setStartPeriod(array.start_date || "");
        setEndPeriod(array.end_date || "");
      }
    } catch (err) {
      console.error("Gagal memuat printout opname:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch_data();
  }, [params.idRegister]);

  // Beri sinyal siap cetak ke parent window saat data sudah dirender
  useEffect(() => {
    if (!loading && dataOpname.length > 0) {
      const timer = setTimeout(() => {
        if (window.self !== window.top) {
          window.parent.postMessage({ type: "DOC_READY_TO_PRINT" }, "*");
        } else {
          window.print();
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [loading, dataOpname]);

  return (
    <div className="min-h-screen bg-white p-4 text-black">
      <div className="page-header mb-3">
        <div className="flex items-center justify-between">
          <b className="text-base font-bold">
            Laporan Inventory Spare Part Bengkel
          </b>
          <i className="text-sm">PT Balifoam Nusamegah</i>
        </div>
        <div className="mt-1 text-sm">{`Period : ${formatDateLocal(startPeriod)} ~ ${formatDateLocal(endPeriod)}`}</div>
      </div>
      <div className="page-content">
        <table className="border-gray-400 w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100 text-xs">
              <th className="border-gray-400 w-10 border p-1.5 text-center">
                No
              </th>
              <th className="border-gray-400 w-[250px] border p-1.5 text-left">
                Nama
              </th>
              <th className="border-gray-400 border p-1.5 text-left">Detail</th>
              <th className="border-gray-400 border p-1.5 text-left">Lokasi</th>
              <th className="border-gray-400 border p-1.5 text-center">Stok</th>
              <th className="border-gray-400 border p-1.5 text-center">
                Masuk
              </th>
              <th className="border-gray-400 border p-1.5 text-center">
                Keluar
              </th>
              <th className="border-gray-400 border p-1.5 text-center">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="p-4 text-center text-xs">
                  Memuat data laporan opname...
                </td>
              </tr>
            ) : dataOpname.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-4 text-center text-xs">
                  Tidak ada data opname.
                </td>
              </tr>
            ) : (
              dataOpname.map((item, index) => {
                return (
                  <tr key={index}>
                    <td className="border-gray-400 border p-1 text-center text-xs">
                      {index + 1}
                    </td>
                    <td className="border-gray-400 border p-1 text-xs font-medium">
                      {item["description"].toUpperCase()}
                    </td>
                    <td className="border-gray-400 font-mono border p-1 text-xs">
                      {item["vendor_code"].toUpperCase() || "-"}
                    </td>
                    <td className="border-gray-400 border p-1 text-xs">
                      {item["location"].toUpperCase() || "-"}
                    </td>
                    <td className="border-gray-400 border p-1 text-center text-xs">
                      {item["initial"]}
                    </td>
                    <td className="border-gray-400 border p-1 text-center text-xs font-medium text-emerald-700">
                      {item["in"]}
                    </td>
                    <td className="border-gray-400 border p-1 text-center text-xs font-medium text-amber-700">
                      {item["out"]}
                    </td>
                    <td className="border-gray-400 border p-1 text-center text-xs font-bold">
                      {item["balance"]}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
