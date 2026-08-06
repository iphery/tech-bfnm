"use client";
import UserAuth from "@/components/auth";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { API_URL } from "@/utils/constant";
import axios from "axios";
import { useEffect, useState } from "react";
import { PageCard } from "@/components/card";
import MachineUtilizeModal from "@/components/machineutilize";

export default function Page() {
  const [dataReport, setDataReport] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(20);

  // Filter state
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [monthYear, setMonthYear] = useState("");

  // Filter yang aktif (baru dipakai saat klik Tampilkan)
  const [activeMonth, setActiveMonth] = useState("");
  const [activeYear, setActiveYear] = useState("");

  const [loading, setLoading] = useState(false);

  // Handle month/year input (tanpa fetch)
  const handleChange = (e) => {
    const value = e.target.value; // 'YYYY-MM'
    const [selectedYear, selectedMonth] = value.split("-");
    setMonth(selectedMonth);
    setYear(selectedYear);
    setMonthYear(value);
  };

  // Handle tombol Tampilkan
  const handleApplyFilter = () => {
    if (month && year) {
      setActiveMonth(month);
      setActiveYear(year);
      setCurrentPage(1);
      fetchData(1);
    }
  };

  // Fetch data dengan filter aktif
  const fetchData = async (page = 1) => {
    if (!activeMonth || !activeYear) return;

    setLoading(true);
    try {
      const apiUrl = `${API_URL}/machineutilize?bulan=${activeMonth}&tahun=${activeYear}&per_page=${perPage}&page=${page}`;
      const response = await axios.get(apiUrl);
      if (response.status === 200) {
        setDataReport(response.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial: set month & year ke sekarang
  useEffect(() => {
    const today = new Date();
    const currentMonthYear = today.toISOString().slice(0, 7);
    setMonthYear(currentMonthYear);
    setMonth(currentMonthYear.split("-")[1]);
    setYear(currentMonthYear.split("-")[0]);
    setActiveMonth(currentMonthYear.split("-")[1]);
    setActiveYear(currentMonthYear.split("-")[0]);
  }, []);

  // Fetch awal saat component mount
  useEffect(() => {
    if (activeMonth && activeYear) {
      fetchData(1);
    }
  }, []);

  // Pagination handler
  const onPageChange = (page) => {
    setCurrentPage(page);
    fetchData(page);
  };

  // Detail modal
  const handleDetail = (item) => {
    setSelectedReport(item);
    setIsModalOpen(true);
  };

  // Hitung maximum downtime
  const getMaxDowntime = (assets) => {
    if (!assets || assets.length === 0) return 0;
    let max = 0;
    assets.forEach((item) => {
      if (item.Downtime > max) max = item.Downtime;
    });
    return max;
  };

  return (
    <UserAuth>
      <div className="relative min-h-screen bg-boxdark-2">
        <DefaultLayout>
          <div className="mb-3 flex items-center justify-start">
            <div className="text-lg text-white">Machine Utilization Report</div>
          </div>

          <PageCard>
            {/* Filter */}
            <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-start">
              <input
                type="month"
                id="monthYear"
                value={monthYear}
                onChange={handleChange}
                className="bg-gray-700 rounded border px-3 py-2 text-white"
              />

              <div className="mx-3"></div>

              <button
                onClick={handleApplyFilter}
                className="rounded bg-primary px-4 py-2 text-white hover:bg-opacity-90"
              >
                Tampilkan
              </button>

              <div className="text-gray-400 mx-3 text-sm">
                {activeMonth && activeYear && (
                  <span>
                    Menampilkan: {activeMonth}/{activeYear}
                  </span>
                )}
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="py-4 text-center text-white">Loading...</div>
            )}

            {/* Tabel */}
            {!loading && dataReport?.data?.assets?.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border text-info">
                        <th className="p-1 text-center">No</th>
                        <th className="p-1">ID Asset</th>
                        <th className="p-1">Description</th>
                        <th className="p-1">Class</th>
                        <th className="p-1">User</th>
                        <th className="p-1 text-center">Downtime (jam)</th>
                        <th className="p-1 text-center">Status</th>
                        <th className="p-1">Last Maintenance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dataReport?.data?.assets?.map((item, index) => {
                        return (
                          <tr
                            key={index}
                            className="cursor-pointer border text-info hover:bg-meta-4"
                            onClick={() => handleDetail(item)}
                          >
                            <td className="p-1 text-center">
                              {((dataReport?.data?.pagination?.current_page ||
                                1) -
                                1) *
                                (dataReport?.data?.pagination?.per_page || 20) +
                                index +
                                1}
                            </td>
                            <td className="font-mono p-1 text-xs">
                              {item?.ID_Asset}
                            </td>
                            <td className="p-1">{item?.Description}</td>
                            <td className="p-1">{item?.Class}</td>
                            <td className="p-1">{item?.User}</td>
                            <td className="p-1 text-center">
                              {item?.Downtime}
                            </td>
                            <td className="p-1 text-center">
                              <span
                                className={`rounded px-2 py-1 text-xs ${
                                  item?.Status === "OK"
                                    ? "bg-success/20 text-success"
                                    : "bg-danger/20 text-danger"
                                }`}
                              >
                                {item?.Status}
                              </span>
                            </td>
                            <td className="p-1 text-center">
                              {item?.Last_Maintenance || "-"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {dataReport?.data?.pagination?.total > 0 && (
                  <div className="flex items-center justify-between border-t px-4 py-3">
                    <div className="text-gray-500 text-sm">
                      Menampilkan {dataReport?.data?.pagination?.from || 0} -{" "}
                      {dataReport?.data?.pagination?.to || 0} dari{" "}
                      {dataReport?.data?.pagination?.total || 0} data
                    </div>
                    <div className="flex gap-1">
                      <button
                        className={`rounded px-3 py-1 text-sm ${
                          dataReport?.data?.pagination?.current_page === 1
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-gray-200 hover:bg-gray-300"
                        }`}
                        onClick={() =>
                          onPageChange(
                            (dataReport?.data?.pagination?.current_page || 1) -
                              1,
                          )
                        }
                        disabled={
                          dataReport?.data?.pagination?.current_page === 1
                        }
                      >
                        Prev
                      </button>

                      {Array.from(
                        {
                          length: dataReport?.data?.pagination?.last_page || 1,
                        },
                        (_, i) => i + 1,
                      ).map((page) => (
                        <button
                          key={page}
                          className={`rounded px-3 py-1 text-sm ${
                            dataReport?.data?.pagination?.current_page === page
                              ? "bg-primary text-white"
                              : "bg-gray-200 hover:bg-gray-300"
                          }`}
                          onClick={() => onPageChange(page)}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        className={`rounded px-3 py-1 text-sm ${
                          dataReport?.data?.pagination?.current_page ===
                          dataReport?.data?.pagination?.last_page
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-gray-200 hover:bg-gray-300"
                        }`}
                        onClick={() =>
                          onPageChange(
                            (dataReport?.data?.pagination?.current_page || 1) +
                              1,
                          )
                        }
                        disabled={
                          dataReport?.data?.pagination?.current_page ===
                          dataReport?.data?.pagination?.last_page
                        }
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}

                {/* Summary */}
                {dataReport?.data?.summary && (
                  <div className="bg-gray-50 mt-4 grid grid-cols-5 gap-2 rounded-lg p-3 text-sm">
                    <div>
                      <span className="text-gray-500">Total Asset</span>
                      <p className="font-semibold">
                        {dataReport?.data?.summary?.total_asset || 0}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">OK</span>
                      <p className="font-semibold text-success">
                        {dataReport?.data?.summary?.ok || 0}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">NOK</span>
                      <p className="font-semibold text-danger">
                        {dataReport?.data?.summary?.nok || 0}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Maximum Downtime</span>
                      <p className="font-semibold">
                        {getMaxDowntime(dataReport?.data?.assets)} jam
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Jam Kerja</span>
                      <p className="font-semibold">
                        {dataReport?.data?.periode?.jam_kerja || 0} jam
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              !loading && (
                <div className="text-gray-400 py-8 text-center">
                  Tidak ada data untuk periode yang dipilih
                </div>
              )
            )}
          </PageCard>
        </DefaultLayout>
      </div>

      <MachineUtilizeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={selectedReport}
      />
    </UserAuth>
  );
}
