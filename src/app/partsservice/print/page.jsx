"use client";
import { useEffect, useState } from "react";
import { formatDate } from "@/utils/dateformat";
import { FaBedPulse } from "react-icons/fa6";

export default function Page() {
  const [dataService, setDataService] = useState();
  const [dataDetail, setDataDetail] = useState([]);
  const [onload, setOnload] = useState(true);

  const fetch_data = () => {
    const service = localStorage.getItem("service");
    const serviceDetail = localStorage.getItem("servicedetail");
    console.log(service);

    if (service != "") {
      setDataService(JSON.parse(service));
    }
    if (serviceDetail != "") {
      setDataDetail(JSON.parse(serviceDetail));
    }
    setOnload(false);
  };

  useEffect(() => {
    fetch_data();
  }, []);

  return (
    <div>
      {onload ? (
        <></>
      ) : (
        <div>
          <div className="flex justify-end">
            <div className="border p-1">F.LOG.007</div>
          </div>
          <div className="flex justify-center">Surat Permintaan Service</div>
          <div className="flex justify-end">
            <div>Tanggal :</div>
            <div>{formatDate(dataService["date_issued"])}</div>
          </div>
          <table className="w-full">
            <thead>
              <tr>
                <th className="border">No</th>
                <th className="border">Deskripsi</th>
                <th className="border">Satuan</th>
                <th className="border">Jumlah</th>
                <th className="border">Tanggal diperlukan</th>
                <th className="border">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {dataDetail.map((item, index) => {
                return (
                  <tr key={index}>
                    <td className="border p-1 text-center">{index + 1}</td>
                    <td className="border p-1">{item.item}</td>
                    <td className="border p-1 text-center ">{item.unit}</td>
                    <td className="border p-1 text-center">{item.quantity}</td>
                    <td className="border p-1">
                      {formatDate(item.required_date)}
                    </td>
                    <td className="border p-1">{item.remark}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="mb-40"></div>
          <div className="px-10">
            <table className="w-full border">
              <tbody>
                <tr>
                  <td className="text-center">
                    <div>Mengetahi</div>
                  </td>
                  <td className="text-center">
                    <div>Pembelian</div>
                  </td>
                  <td className="text-center">
                    <div>Mengetahi</div>
                  </td>
                  <td className="text-center">
                    <div>Dibuat oleh</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
