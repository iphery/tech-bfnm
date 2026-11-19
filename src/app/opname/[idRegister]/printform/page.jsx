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
      console.error("Gagal memuat form print opname:", err);
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
    <div className="min-h-screen bg-white p-2 text-black print:p-0">
      <table className="border-gray-400 w-full border-collapse border">
        <thead>
          {/* Header Judul & Periode di dalam thead agar diulang di setiap halaman cetak */}
          <tr className="border-none">
            <th colSpan={5} className="border-none pb-3 text-left font-normal">
              <div className="flex items-center justify-between">
                <b className="text-base font-bold text-black">
                  Laporan Stok Opname Spare Part Bengkel (Form Fisik)
                </b>
                <i className="text-sm font-normal text-gray-700">PT Balifoam Nusamegah</i>
              </div>
              <div className="mt-1 text-sm font-medium text-black">
                {`Periode : ${formatDateLocal(startPeriod)} ~ ${formatDateLocal(endPeriod)}`}
              </div>
            </th>
          </tr>

          <tr className="bg-gray-100 text-xs">
            <th className="border-gray-400 w-10 border p-1.5 text-center">
              No
            </th>
            <th className="border-gray-400 w-[250px] border p-1.5 text-left">
              Nama
            </th>
            <th className="border-gray-400 border p-1.5 text-left">Detail</th>
            <th className="border-gray-400 border p-1.5 text-left">Lokasi</th>
            <th className="border-gray-400 w-24 border p-1.5 text-center">
              Stok Fisik
            </th>
          </tr>
        </thead>
        <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-xs">
                  Memuat data opname...
                </td>
              </tr>
            ) : dataOpname.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-xs">
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
                    <td className="border-gray-400 border p-1 text-center text-xs"></td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
    </div>
  );
}
