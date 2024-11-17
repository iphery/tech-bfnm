"use client";
import { useEffect, useState } from "react";
import "@/css/print.css";
import { formatDateLocal } from "@/utils/dateformat";

export default function Page() {
  const [dataQO, setDataQO] = useState([]);
  const [dataAvg, setDataAvg] = useState([]);
  const [year, setYear] = useState("");

  useEffect(() => {
    const dataqo = JSON.parse(localStorage.getItem("dataqo"));
    const dataavg = JSON.parse(localStorage.getItem("dataavg"));
    const qoyear = localStorage.getItem("qoyear");

    setDataQO(dataqo);
    setDataAvg(dataavg);
    setYear(qoyear);

    console.log(dataavg);
    console.log(dataqo);
  }, []);
  return (
    <div>
      <h1 className="mb-5 text-xl font-bold text-info">{`Laporan Quality Objective  ${year}`}</h1>
      <table className="w-full">
        <thead className="border bg-strokedark text-info">
          <tr>
            <th className="w-20 p-1">Periode</th>
            <th className="p-1">
              <div className="flex-col justify-between">
                <p>
                  Peningkatan pemanfaatan mesin-mesin / alat produksi sesuai
                  dengan kapasitas dan fungsinya
                </p>
                <p>(Max. 100%)</p>
              </div>
            </th>
            <th className="p-1">
              <div className="flex-col justify-between">
                <p>Penurunan jumlah kendaraan yang tidak layak jalan</p>
                <p>(Max. 0%)</p>
              </div>
            </th>
            <th className="p-1">
              <div className="flex-col justify-between">
                <p>
                  Kecepatan dalam perbaikan mesin yang rusak (diluar overhault)
                </p>
                <p>(Max. 1.476 Jam)</p>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {dataQO.map((item, index) => {
            return (
              <tr key={index} className="border text-info">
                <td className="p-1 text-center">{item["monthname"]}</td>
                <td className="p-1 text-center">{item["down"].toFixed(2)}</td>
                <td className="p-1 text-center">
                  {item["overhault"].toFixed(2)}
                </td>
                <td className="p-1 text-center">
                  {item["average"].toFixed(2)}
                </td>
              </tr>
            );
          })}
          <tr
            className="border text-info"
            onClick={() => {
              console.log(dataAvg);
            }}
          >
            <td className="p-1 text-center font-bold">Average</td>
            <td className="p-1 text-center font-bold">{dataAvg[0]}</td>
            <td className="p-1 text-center font-bold">{dataAvg[2]}</td>
            <td className="p-1 text-center font-bold">{dataAvg[1]}</td>
          </tr>
        </tbody>
      </table>

      <p className="p-2 text-info">Rumusan:</p>
      <div className="flex items-center justify-start p-2 text-info">
        <div className="px-5">1.</div>
        <div className="flex flex-col">
          <div>Jumlah Mesin Sesuai kapasitas & Fungsinya</div>
          <div>
            <hr />
          </div>
          <div className="text-center">Jumlah Mesin yang Ada</div>
        </div>
        <div className="px-5">x 100</div>
      </div>
      <div className="flex items-center justify-start p-2 text-info">
        <div className="px-5">2.</div>
        <div className="flex flex-col">
          <div>Jumlah kendaraan yang rusak berat (turun mesin)</div>
          <div>
            <hr />
          </div>
          <div className="text-center">Jumlah Kendaraan yang Ada</div>
        </div>
        <div className="px-5">x 100</div>
      </div>
      <div className="flex items-center justify-start p-2 text-info">
        <div className="px-5">3.</div>

        <div>
          Rata-rata Kecepatan Perbaikan Kendaraan + Rata-rata Kecepatan
          Perbaikan Mesin Produksi
        </div>
      </div>
      <div className="py-5 text-info">
        <hr />
      </div>
      <div className="w-1/2 text-center text-info">
        {`Denpasar, ${formatDateLocal(new Date())}`}
      </div>
      <div className="flex justify-evenly text-info">
        <div className="w-full text-center">
          <p>Dibuat oleh,</p>
          <p className="mt-20">Putu Hery</p>
          <p>Ka Bag ME</p>
        </div>
        <div className="w-full text-center">
          <p> </p>
          <p>Menyetujui,</p>
          <p className="mt-20">Soelinah</p>
          <p>Direksi</p>
        </div>
      </div>
    </div>
  );
}
