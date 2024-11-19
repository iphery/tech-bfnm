"use client";
import UserAuth from "@/components/auth";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { API_URL } from "@/utils/constant";
import axios from "axios";
import { useEffect, useState } from "react";
import { PageCard } from "@/components/card";
import { useRouter } from "next/navigation";

export default function Page() {
  const [dataService, setDataService] = useState([]);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [monthYear, setMonthYear] = useState();
  const router = useRouter();

  const handleChange = (e) => {
    const value = e.target.value; // This will be in 'YYYY-MM' format
    const [selectedYear, selectedMonth] = value.split("-"); // Split the 'YYYY-MM' into year and month
    setYear(selectedYear); // Set year
    setMonth(selectedMonth); // Set month
    setMonthYear(value);
    console.log(selectedMonth);
    console.log(selectedYear);
  };

  const [selectedOption, setSelectedOption] = useState("mp");

  const handleChangeOption = (e) => {
    const value = e.target.value;
    if (value == "Kendaraan") {
      setSelectedOption("k"); // Set the selected radio button value
    } else {
      setSelectedOption("mp"); // Set the selected radio button value
    }
  };

  const fetch_data = async () => {
    const apiUrl = `${API_URL}/reportservice`;
    const response = await axios.post(apiUrl, {
      month: month,
      year: year,
      type: selectedOption,
    });
    if (response.status === 200) {
      console.log(response.data);
      setDataService(response.data["service"]);
    }
  };

  useEffect(() => {
    const today = new Date();
    const currentMonthYear = today.toISOString().slice(0, 7);
    setMonthYear(currentMonthYear);
    setMonth(currentMonthYear.split("-")[1]);
    setYear(currentMonthYear.split("-")[0]);
  }, []);
  useEffect(() => {
    fetch_data();
  }, [month, year, selectedOption]);
  return (
    <UserAuth>
      <div className="min-h-screen  bg-boxdark-2">
        <DefaultLayout>
          <div className="mb-3 flex items-center justify-start">
            <div className="text-lg text-white">Service Report</div>
          </div>
          <PageCard>
            <div className="mb-5 flex flex-col sm:flex-row sm:justify-start">
              <input
                type="month"
                id="monthYear"
                value={monthYear}
                onChange={handleChange}
              />
              <div className="mr-10"></div>
              <div className="mt-5 flex justify-center text-info sm:mt-0">
                <div>
                  <label>
                    <input
                      type="radio"
                      name="category"
                      value="Mesin Produksi"
                      checked={selectedOption === "mp"}
                      onChange={handleChangeOption}
                    />
                    Mesin Produksi
                  </label>
                </div>
                <div className="mr-5"></div>
                <div>
                  <label>
                    <input
                      type="radio"
                      name="category"
                      value="Kendaraan"
                      checked={selectedOption === "k"}
                      onChange={handleChangeOption}
                    />
                    Kendaraan
                  </label>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border text-info">
                    <th className="p-1 text-center">No</th>
                    <th className="p-1">Tanggal</th>
                    <th className="p-1">Deskripsi</th>
                    <th className="p-1">Kategori</th>
                    <th className="p-1">Keluhan</th>
                    <th className="p-1">Solusi</th>
                    <th className="p-1">Waktu Perbaikan</th>
                    <th className="p-1">User</th>
                  </tr>
                </thead>
                <tbody>
                  {dataService.map((item, index) => {
                    return (
                      <tr
                        key={index}
                        className="border text-info hover:bg-meta-4"
                        onClick={() => {
                          router.push(`/asset/${item["id_asset"]}`);
                        }}
                      >
                        <td className="p-1 text-center">{index + 1}</td>
                        <td className="p-1 text-center">
                          {item["time_request"]}
                        </td>
                        <td className="p-1">{item["description"]}</td>
                        <td className="p-1">{item["category"]}</td>
                        <td className="p-1">{item["problem"]}</td>
                        <td className="p-1">{item["solution"]}</td>
                        <td className="p-1 text-center">
                          {item["repair_time"]}
                        </td>
                        <td className="p-1">{item["user"]}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </PageCard>
        </DefaultLayout>
      </div>
    </UserAuth>
  );
}
