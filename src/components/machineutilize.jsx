import React, { useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

const MachineUtilizeModal = ({ isOpen, onClose, data }) => {
  if (!data) return null;

  const summary = data?.Summary || {};
  const detail = data?.result2 || [];

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-999999" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="border-b pb-2 text-center text-lg font-semibold"
                >
                  Laporan Pemanfaatan Mesin Produksi
                </Dialog.Title>

                {/* Header */}
                <div className="mt-2 flex justify-between px-2 text-sm">
                  <span>No. {data?.ID_Report}</span>
                  <span>
                    Periode: {data?.Bulan}/{data?.Tahun}
                  </span>
                </div>

                {/* Info */}
                <div className="text-gray-600 mt-1 flex justify-between px-2 text-sm">
                  <span>Divisi: {data?.Division}</span>
                  <span>Status: {data?.Status}</span>
                </div>

                {/* Tabel */}
                <div className="mt-3 max-h-96 overflow-x-auto overflow-y-auto rounded-lg border">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        <th className="p-2 text-left">No</th>
                        <th className="p-2 text-left">ID</th>
                        <th className="p-2 text-left">Description</th>
                        <th className="p-2 text-left">Class</th>
                        <th className="p-2 text-left">Status</th>
                        <th className="p-2 text-left">Downtime</th>
                        <th className="p-2 text-left">Last Maintenance</th>
                        <th className="p-2 text-left">Step</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.length > 0 ? (
                        detail.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 border-t">
                            <td className="p-2">{idx + 1}</td>
                            <td className="font-mono p-2 text-xs">
                              {item?.ID_Asset}
                            </td>
                            <td className="p-2">{item?.Description}</td>
                            <td className="p-2">{item?.Class}</td>
                            <td className="p-2">
                              <span
                                className={`rounded px-2 py-0.5 text-xs ${
                                  item?.Status === "OK"
                                    ? "bg-success/20 text-success"
                                    : "bg-danger/20 text-danger"
                                }`}
                              >
                                {item?.Status}
                              </span>
                            </td>
                            <td className="p-2">{item?.Downtime} jam</td>
                            <td className="p-2 text-xs">
                              {item?.Last_Maintenance || "-"}
                            </td>
                            <td className="p-2 text-center">
                              {item?.Step || 0}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="8"
                            className="text-gray-500 p-4 text-center"
                          >
                            Tidak ada data
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Summary */}
                <div className="bg-gray-50 mt-4 grid grid-cols-5 gap-2 rounded-lg p-3 text-sm">
                  <div>
                    <span className="text-gray-500">Total Asset</span>
                    <p className="font-semibold">{summary?.total_asset || 0}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">OK</span>
                    <p className="font-semibold text-success">
                      {summary?.ok || 0}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">NOK</span>
                    <p className="font-semibold text-danger">
                      {summary?.nok || 0}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Total Downtime</span>
                    <p className="font-semibold">
                      {summary?.total_downtime || 0} jam
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Jam Kerja</span>
                    <p className="font-semibold">
                      {detail[0]?.Jam_Kerja || 176} jam
                    </p>
                  </div>
                </div>

                {/* Footer - Creator & Approver */}
                <div className="mt-4 flex justify-between border-t pt-3 text-sm">
                  <div>
                    <p className="text-gray-500">Dibuat oleh</p>
                    <p className="font-semibold">{data?.Creator_Name || "-"}</p>
                    <p className="text-gray-400 text-xs">
                      {data?.Time_Create || "-"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500">Mengetahui</p>
                    <p className="font-semibold">
                      {data?.Approver_Name || "-"}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {data?.Time_Approve || "-"}
                    </p>
                  </div>
                </div>

                {/* Close Button */}
                <div className="mt-4 text-right">
                  <button
                    onClick={onClose}
                    className="bg-gray-200 hover:bg-gray-300 rounded-lg px-4 py-2 text-sm"
                  >
                    Tutup
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default MachineUtilizeModal;
