"use client";
import { useEffect, useState } from "react";
import { formatDate, formatDateLocal } from "@/utils/dateformat";
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
            <div className="border p-1 text-sm">F.LOG.007/0</div>
          </div>
          <div className="flex justify-center">
            <b className="border-b">DAFTAR PERMINTAAN SERVICE</b>
          </div>
          <div className="mb-2 flex justify-end">
            <div className="text-sm">Tgl :</div>
            <div className="ml-2 text-sm">
              {formatDateLocal(dataService["date_issued"])}
            </div>
          </div>
          <table className="w-full">
            <thead>
              <tr>
                <th className="border text-sm">No</th>
                <th className="border text-sm">Jenis Material</th>
                <th className="border text-sm">Satuan</th>
                <th className="border text-sm">Jumlah</th>
                <th className="border text-sm">Tg. Dibutuhkan</th>
                <th className="border text-sm">Ket.</th>
              </tr>
            </thead>
            <tbody>
              {dataDetail.map((item, index) => {
                return (
                  <tr key={index}>
                    <td className="border p-1 text-center text-sm">
                      {index + 1}
                    </td>
                    <td className="border p-1 text-sm">{item.item}</td>
                    <td className="border p-1 text-center text-sm ">
                      {item.unit}
                    </td>
                    <td className="border p-1 text-center text-sm">
                      {item.quantity}
                    </td>
                    <td className="border p-1 text-center text-sm">
                      {formatDateLocal(item.required_date)}
                    </td>
                    <td className="border p-1">{item.remark}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="mb-30"></div>
          <div className="px-10">
            <div className="flex justify-evenly">
              <div>
                <div className="mb-15 flex justify-center text-sm">
                  Menyetujui,
                </div>
                <div className="flex w-[130px] justify-center border-b"></div>
                <div className="flex justify-center text-sm">Direksi</div>
              </div>
              <div>
                <div className="mb-15 flex justify-center text-sm">
                  Penanggung Jawab,
                </div>
                <div className="flex w-[130px] justify-center border-b"></div>
                <div className="flex justify-center text-sm">
                  Bagian Pembelian
                </div>
              </div>
              <div>
                <div className="mb-15 flex justify-center text-sm">
                  Menyetujui,
                </div>
                <div className="flex w-[130px] justify-center border-b"></div>
                <div></div>
              </div>
              <div>
                <div className="mb-15 flex justify-center text-sm">Dibuat,</div>
                <div className="flex w-[130px] justify-center border-b"></div>
                <div></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
