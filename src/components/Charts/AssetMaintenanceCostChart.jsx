"use client";
import React from "react";
import dynamic from "next/dynamic";
import { HiOutlineCurrencyDollar, HiOutlineArrowTrendingUp, HiOutlineWrenchScrewdriver } from "react-icons/hi2";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function AssetMaintenanceCostChart({ costTrend = [], summary = {} }) {
  if (!costTrend || costTrend.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-xs text-body dark:text-bodydark">
        <HiOutlineCurrencyDollar className="text-3xl text-stroke dark:text-strokedark mb-2" />
        <p>Belum ada riwayat biaya perawatan yang tercatat untuk mesin ini.</p>
      </div>
    );
  }

  const categories = costTrend.map((item) => {
    // e.g. "Nov 2026" or "2026-11"
    return item.month_label || item.month_key;
  });

  const series = [
    {
      name: "Biaya Suku Cadang",
      data: costTrend.map((item) => item.parts_cost || 0),
    },
    {
      name: "Biaya Servis / Jasa Luar",
      data: costTrend.map((item) => item.service_cost || 0),
    },
  ];

  const options = {
    colors: ["#3C50E0", "#FF7A00"],
    chart: {
      type: "bar",
      stacked: true,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
      fontFamily: "Satoshi, sans-serif",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 4,
        columnWidth: "40%",
        borderRadiusApplication: "end",
        borderRadiusWhenStacked: "last",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 1,
      colors: ["transparent"],
    },
    xaxis: {
      categories: categories,
      labels: {
        style: {
          fontSize: "11px",
          fontWeight: 500,
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        text: "Biaya (Rp)",
        style: {
          fontSize: "11px",
          fontWeight: 600,
        },
      },
      labels: {
        formatter: (val) => {
          if (val >= 1000000) {
            return `${(val / 1000000).toFixed(1)} jt`;
          }
          if (val >= 1000) {
            return `${(val / 1000).toFixed(0)} rb`;
          }
          return `Rp ${val}`;
        },
        style: {
          fontSize: "11px",
        },
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontFamily: "Satoshi",
      fontWeight: 600,
      fontSize: "12px",
      markers: {
        radius: 99,
      },
    },
    grid: {
      borderColor: "#E2E8F0",
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val) => `Rp ${Number(val || 0).toLocaleString("id-ID")}`,
      },
    },
    fill: {
      opacity: 1,
    },
  };

  return (
    <div className="space-y-4">
      {/* Metric Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-stroke bg-gray-50/70 p-3.5 dark:border-strokedark dark:bg-meta-4/20">
          <div className="flex items-center gap-2 mb-1 text-[11px] font-semibold text-body dark:text-bodydark">
            <HiOutlineCurrencyDollar className="text-base text-primary" />
            <span>Total Pengeluaran Mesin</span>
          </div>
          <div className="text-base font-bold font-mono text-black dark:text-white">
            Rp {Number(summary.grand_total_cost || 0).toLocaleString("id-ID")}
          </div>
          <span className="text-[10px] text-body dark:text-bodydark block mt-0.5">
            Akumulasi suku cadang & servis
          </span>
        </div>

        <div className="rounded-xl border border-stroke bg-gray-50/70 p-3.5 dark:border-strokedark dark:bg-meta-4/20">
          <div className="flex items-center gap-2 mb-1 text-[11px] font-semibold text-body dark:text-bodydark">
            <HiOutlineArrowTrendingUp className="text-base text-success" />
            <span>Rata-rata Cost / Bulan</span>
          </div>
          <div className="text-base font-bold font-mono text-black dark:text-white">
            Rp {Number(summary.average_monthly_cost || 0).toLocaleString("id-ID")}
          </div>
          <span className="text-[10px] text-body dark:text-bodydark block mt-0.5">
            Berdasarkan bulan aktif tercatat
          </span>
        </div>

        <div className="rounded-xl border border-stroke bg-gray-50/70 p-3.5 dark:border-strokedark dark:bg-meta-4/20">
          <div className="flex items-center gap-2 mb-1 text-[11px] font-semibold text-body dark:text-bodydark">
            <HiOutlineWrenchScrewdriver className="text-base text-warning" />
            <span>Porsi Biaya Suku Cadang</span>
          </div>
          <div className="text-base font-bold font-mono text-black dark:text-white">
            Rp {Number(summary.grand_parts_cost || 0).toLocaleString("id-ID")}
          </div>
          <span className="text-[10px] text-body dark:text-bodydark block mt-0.5">
            Jasa luar: Rp {Number(summary.grand_service_cost || 0).toLocaleString("id-ID")}
          </span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="pt-2">
        <ReactApexChart
          options={options}
          series={series}
          type="bar"
          height={290}
        />
      </div>
    </div>
  );
}
