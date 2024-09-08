import { useEffect } from "react";
import DefaultLayout from "./Layouts/DefaultLayout";
import { DataProvider, useProvider } from "@/app/appcontext";
import { API_URL } from "@/utils/constant";
import axios from "axios";

export default function WebDashboard() {
  const {
    webOutstandingRequest,
    setWebOutstandingRequest,
    webMaintenanceRequest,
    setWebMaintenanceRequest,
    webITRequest,
    setWebITRequest,
    loadWebDashboard,
    setLoadWebDashboard,
  } = useProvider();

  const fetch_data = async () => {
    const apiUrl = `${API_URL}/webdashboardoutstanding`;
    const response = await axios.get(apiUrl);
    const outstanding = response.data["outstanding"];
    const maintenance = response.data["maintenance"];
    const it = response.data["it"];

    if (response.status == 200) {
      setWebOutstandingRequest(outstanding);
    }
  };

  useEffect(() => {
    fetch_data();
  }, []);

  return (
    <div className="min-h-screen  bg-boxdark-2">
      <DefaultLayout>
        <table className="w-full">
          <thead>
            <tr>
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
                <tr key={index}>
                  <td>{item["ID_Request"]}</td>
                  <td>{title}</td>
                  <td>{item["Problem"]}</td>
                  <td>
                    {step == 1 ? (
                      <div className="rounded-lg bg-danger py-1 text-center text-sm text-white">
                        Issued
                      </div>
                    ) : step == "5" ? (
                      <div>Completed</div>
                    ) : step == "3" ? (
                      <div className="rounded-lg bg-white py-1 text-center text-sm">
                        Parts
                      </div>
                    ) : step == "6" ? (
                      <div className="rounded-lg bg-success py-1 text-center text-sm text-white">
                        Checked
                      </div>
                    ) : (
                      <div className="rounded-lg bg-warning py-1 text-center text-sm text-white">
                        Repairing
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </DefaultLayout>
    </div>
  );
}
