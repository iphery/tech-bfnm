"use client";
import UserAuth from "@/components/auth";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { API_URL } from "@/utils/constant";
import axios from "axios";
import { useEffect, useState } from "react";
import { PageCard } from "@/components/card";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const [dataService, setDataService] = useState([]);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 101 }, (_, i) => currentYear - i); // Last 100 years
  const [year, setYear] = useState(currentYear);
  const [dataAverage, setDataAverage] = useState([]);

  const fetch_data = async () => {
    const apiUrl = `${API_URL}/reportqo`;
    const response = await axios.post(apiUrl, {
      year: year,
    });
    if (response.status === 200) {
      console.log(response.data);
      setDataService(response.data);

      //average penururann

      const data = response.data;
      let down = 0;
      let avg = 0;
      let overhault = 0;
      data.map((item) => {
        down += item["down"];
        avg += item["average"];
        overhault += item["overhault"];
      });
      //  const total_down = down.reduce((sum, num) => sum + num, 0);
      //const avg_down = total_down / down.length;
      const avg_down = down / data.length;
      const avg_avg = avg / data.length;
      const avg_overhault = overhault / data.length;
      setDataAverage([
        avg_down.toFixed(2),
        avg_avg.toFixed(2),
        avg_overhault.toFixed(2),
      ]);
    }
  };

  useEffect(() => {
    fetch_data();
  }, [year]);
  return (
    <UserAuth>
      <div className="min-h-screen  bg-boxdark-2">
        <DefaultLayout>
          <div className="mb-3 flex items-center justify-start">
            <div className="text-lg text-white">Quality Objective</div>
          </div>
          <PageCard>
            <div className="mb-5 flex flex-col items-center sm:flex-row sm:justify-start ">
              <div className="mr-3 text-info"> Select year :</div>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="rounded border p-2"
              >
                {years.map((y, index) => (
                  <option key={index} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <div
                onClick={() => {
                  const dataqo = JSON.stringify(dataService);
                  const dataavg = JSON.stringify(dataAverage);
                  localStorage.setItem("qoyear", year);
                  localStorage.setItem("dataqo", dataqo);
                  localStorage.setItem("dataavg", dataavg);
                  router.push("/qualityobjective/print");
                }}
              >
                print
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border bg-strokedark text-info">
                  <tr>
                    <th>Periode</th>
                    <th>
                      <div className="flex-col justify-between">
                        <p>
                          Peningkatan pemanfaatan mesin-mesin / alat produksi
                          sesuai dengan kapasitas dan fungsinya
                        </p>
                        <p>(Max. 100%)</p>
                      </div>
                    </th>
                    <th>
                      <div className="flex-col justify-between">
                        <p>Penurunan jumlah kendaraan yang tidak layak jalan</p>
                        <p>(Max. 0%)</p>
                      </div>
                    </th>
                    <th>
                      <div className="flex-col justify-between">
                        <p>
                          Kecepatan dalam perbaikan mesin yang rusak (diluar
                          overhault)
                        </p>
                        <p>(Max. 1.476 Jam)</p>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dataService.map((item, index) => {
                    return (
                      <tr key={index} className="border text-info">
                        <td className="p-1 text-center">{item["monthname"]}</td>
                        <td className="p-1 text-center">
                          {item["down"].toFixed(2)}
                        </td>
                        <td className="p-1 text-center">
                          {item["overhault"].toFixed(2)}
                        </td>
                        <td className="p-1 text-center">
                          {item["average"].toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="border text-info">
                    <td className="p-1 text-center font-bold">Average</td>
                    <td className="p-1 text-center font-bold">
                      {dataAverage[0]}
                    </td>
                    <td className="p-1 text-center font-bold">
                      {dataAverage[2]}
                    </td>
                    <td className="p-1 text-center font-bold">
                      {dataAverage[1]}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </PageCard>
        </DefaultLayout>
      </div>
    </UserAuth>
  );
}
