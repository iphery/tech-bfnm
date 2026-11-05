"use client";
import React, { useEffect, useState } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useProvider } from "@/app/appcontext";
import axios from "axios";
import { PageCardLimited } from "@/components/card";
import { TableSkeleton } from "@/components/loader";
import { useRouter } from "next/navigation";
import { formatDateLocal } from "@/utils/dateformat";
import { RepairStatus } from "@/utils/repairstatus";
import { HiOutlineWrenchScrewdriver, HiOutlineMagnifyingGlass as HiOutlineSearch } from "react-icons/hi2";
import { CommonInput } from "@/components/input";

export default function Page() {
  const router = useRouter();
  const {
    webOutstandingRequest,
    setWebOutstandingRequest,
    setLoadWebOutstanding,
  } = useProvider();

  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");

  const fetch_data = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/weboutstanding");
      const outstanding = response.data["outstanding"] || [];

      if (response.status === 200) {
        setWebOutstandingRequest(outstanding);
        setLoadWebOutstanding(false);
      }
    } catch (err) {
      console.error("Gagal load weboutstanding:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch_data();
  }, []);

  const filteredData = (webOutstandingRequest || []).filter((item) => {
    if (!keyword.trim()) return true;
    const q = keyword.toLowerCase();
    const idReq = (item.ID_Request || "").toLowerCase();
    const problem = (item.Problem || "").toLowerCase();
    const desc = (item.Description || "").toLowerCase();
    const mfg = (item.Manufacture || "").toLowerCase();
    const tech = (item.TechName || item.Technician || "").toLowerCase();
    return idReq.includes(q) || problem.includes(q) || desc.includes(q) || mfg.includes(q) || tech.includes(q);
  });

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-7xl space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:bg-primary/20">
              <HiOutlineWrenchScrewdriver className="text-2xl" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-black dark:text-white">
                Daftar Permohonan Service (CM)
              </h1>
              <p className="text-xs text-body dark:text-bodydark">
                Monitoring pengerjaan perbaikan mesin dan aset yang sedang berlangsung
              </p>
            </div>
          </div>

          <div className="w-full sm:w-72">
            <CommonInput
              input={keyword}
              type="text"
              onInputChange={(val) => setKeyword(val)}
              placeholder="Cari tiket, mesin, PIC..."
            >
              <HiOutlineSearch className="text-body dark:text-bodydark" />
            </CommonInput>
          </div>
        </div>

        <PageCardLimited>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stroke pb-3 dark:border-strokedark text-xs">
              <span className="font-semibold text-body dark:text-bodydark">
                Total: <span className="font-bold text-black dark:text-white">{filteredData.length}</span> tiket service
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full table-auto text-left text-xs">
                <thead>
                  <tr className="border-b border-stroke bg-gray-50 text-body dark:border-strokedark dark:bg-meta-4/20 dark:text-bodydark">
                    <th className="py-3 px-4 font-semibold text-center w-12">No</th>
                    <th className="py-3 px-4 font-semibold">No. Tiket</th>
                    <th className="py-3 px-4 font-semibold">Tanggal</th>
                    <th className="py-3 px-4 font-semibold">Mesin / Aset</th>
                    <th className="py-3 px-4 font-semibold">Keluhan / Problem</th>
                    <th className="py-3 px-4 font-semibold text-center">Status</th>
                    <th className="py-3 px-4 font-semibold">Teknisi / PIC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stroke dark:divide-strokedark">
                  {loading && filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-0">
                        <TableSkeleton rows={6} cols={7} />
                      </td>
                    </tr>
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-xs text-body dark:text-bodydark">
                        Tidak ada permohonan service (CM) yang sedang berlangsung.
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item, index) => {
                      const desc = item.Description || "";
                      const mfg = item.Manufacture || "";
                      const model = item.Model || "";
                      const no = item.No || "";
                      const title =
                        item.Type === "K"
                          ? `${mfg} ${model} ${no ? `- ${no}` : ""}`.trim()
                          : `${desc} ${mfg} ${model}`.trim();

                      const step = item.Step;
                      const statusInfo = RepairStatus(step) || {
                        status: "Dalam Proses",
                        color: "bg-warning",
                      };

                      return (
                        <tr
                          key={item.ID_Request || index}
                          onClick={() => router.push(`/asset/${item.ID_Asset}`)}
                          className="cursor-pointer hover:bg-gray-50 dark:hover:bg-meta-4/10 transition-colors"
                        >
                          <td className="py-3 px-4 text-center font-mono text-body dark:text-bodydark">
                            {index + 1}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-primary whitespace-nowrap">
                            {item.ID_Request}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-body dark:text-bodydark">
                            {formatDateLocal(item.Time_Request)}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-black dark:text-white block">
                              {title || item.ID_Asset}
                            </span>
                            <span className="font-mono text-[10px] text-body dark:text-bodydark">
                              {item.ID_Asset} {item.Location ? `• ${item.Location}` : ""}
                            </span>
                          </td>
                          <td className="py-3 px-4 max-w-xs truncate text-black dark:text-white font-medium">
                            {item.Problem || "-"}
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <span
                              className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white ${statusInfo.color}`}
                            >
                              {statusInfo.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-body dark:text-bodydark">
                            {item.TechName || item.Technician || "-"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </PageCardLimited>
      </div>
    </DefaultLayout>
  );
}
