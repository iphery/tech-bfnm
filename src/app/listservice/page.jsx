"use client";
import { useEffect } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

import { DataProvider, useProvider } from "@/app/appcontext";
import { API_URL } from "@/utils/constant";
import axios from "axios";
import { IoAdd } from "react-icons/io5";
import { MdClear } from "react-icons/md";
import { PageCard } from "@/components/card";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const {
    webOutstandingRequest,
    setWebOutstandingRequest,
    loadWebOutstanding,
    setLoadWebOutstanding,
  } = useProvider();

  const fetch_data = async () => {
    const apiUrl = `${API_URL}/weboutstanding`;
    const response = await axios.get(apiUrl);
    const outstanding = response.data["outstanding"];

    if (response.status == 200) {
      setWebOutstandingRequest(outstanding);
      setLoadWebOutstanding(false);
    }
  };

  useEffect(() => {
    if (loadWebOutstanding) {
      fetch_data();
    }
  }, []);

  return (
    <div className="min-h-screen  bg-boxdark-2">
      <DefaultLayout>
        <div className="mb-3 flex items-center justify-start">
          <div className="text-lg text-white">Service</div>
        </div>
        <PageCard>
          <table className="w-full">
            <thead>
              <tr className="border text-info">
                <th>No</th>
                <th>Mesin</th>
                <th>Keluhan</th>
                <th>Status</th>
                <th>PIC</th>
              </tr>
            </thead>
            <tbody>
              {webOutstandingRequest.map((item, index) => {
                const desc = item["Description"];
                const mfg = item["Manufacture"];
                const model = item["Model"];
                const no = item["No"];
                const title =
                  item["Type"] == "K"
                    ? `${mfg} ${model} - ${no}`
                    : `${desc} ${mfg} ${model}`;

                const step = item["Step"];

                return (
                  <tr
                    key={index}
                    className="border text-info hover:bg-meta-4"
                    onClick={() => {
                      router.push(`/asset/${item["ID_Asset"]}`);
                    }}
                  >
                    <td className="p-1 align-top">
                      <div>{item["ID_Request"]}</div>
                    </td>
                    <td className="p-1 align-top">{title}</td>
                    <td className="p-1 align-top">{item["Problem"]}</td>
                    <td className="p-1 align-top">
                      {step == 1 ? (
                        <div className="rounded-lg bg-danger p-1 text-center text-sm text-white">
                          Issued
                        </div>
                      ) : step == "5" ? (
                        <div className="rounded-lg bg-primary p-1 text-center text-sm">
                          Completed
                        </div>
                      ) : step == "3" ? (
                        <div className="rounded-lg bg-white p-1 text-center text-sm">
                          Parts
                        </div>
                      ) : step == "6" ? (
                        <div className="rounded-lg bg-success p-1 text-center text-sm text-white">
                          Checked
                        </div>
                      ) : (
                        <div className="rounded-lg bg-warning p-1 text-center text-sm text-white">
                          Repairing
                        </div>
                      )}
                    </td>
                    <td className="p-1 align-top">{item["Technician"]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </PageCard>
      </DefaultLayout>
    </div>
  );
}
