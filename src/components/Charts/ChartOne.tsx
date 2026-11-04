"use client";

import { ApexOptions } from "apexcharts";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { API_URL } from "@/utils/constant";
import axios from "axios";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

type ChartOneProps = {
  series: any; // Replace `any` with a more specific type if possible
  inYear: number;
  inMonth: number;
};

const options: ApexOptions = {
  legend: {
    show: false,
    position: "top",
    horizontalAlign: "left",
  },
  colors: ["#3C50E0", "#80CAEE"],
  chart: {
    fontFamily: "Satoshi, sans-serif",
    height: 335,
    type: "area",
    dropShadow: {
      enabled: true,
      color: "#623CEA14",
      top: 10,
      blur: 4,
      left: 0,
      opacity: 0.1,
    },

    toolbar: {
      show: false,
    },
  },
  responsive: [
    {
      breakpoint: 1024,
      options: {
        chart: {
          height: 300,
        },
      },
    },
    {
      breakpoint: 1366,
      options: {
        chart: {
          height: 350,
        },
      },
    },
  ],
  stroke: {
    width: [2, 2],
    curve: "straight",
  },
  // labels: {
  //   show: false,
  //   position: "top",
  // },
  grid: {
    xaxis: {
      lines: {
        show: true,
      },
    },
    yaxis: {
      lines: {
        show: true,
      },
    },
  },
  dataLabels: {
    enabled: false,
  },
  markers: {
    size: 4,
    colors: "#fff",
    strokeColors: ["#3056D3", "#80CAEE"],
    strokeWidth: 3,
    strokeOpacity: 0.9,
    strokeDashArray: 0,
    fillOpacity: 1,
    discrete: [],
    hover: {
      size: undefined,
      sizeOffset: 5,
    },
  },
  xaxis: {
    type: "category",
    categories: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nop",
      "Dec",
    ],
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  yaxis: {
    title: {
      style: {
        fontSize: "0px",
      },
    },
    min: 0,
    max: 150,
  },
};

interface ChartOneState {
  series: {
    name: string;
    data: number[];
  }[];
}

const ChartOne: React.FC<ChartOneProps> = ({
  series,
  inYear,
  inMonth,
}: {
  series: any;
  inYear: number;
  inMonth: number;
}) => {
  /*
  const series = [
    {
      name: "Mesin Produksi",
      data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30, 145],
    },

    {
      name: "Kendaraan",
      data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39, 51],
    },
  ];
  */

  return (
    <div className="w-full rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-boxdark/90">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            Grafik Kecepatan Perbaikan Aset (Tahun Ini)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Rata-rata durasi penanganan kerusakan (Jam Kerja) per bulan
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-primary"></span>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Mesin Produksi
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-secondary"></span>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Kendaraan
            </span>
          </div>
        </div>
      </div>

      <div className="-ml-3">
        <ReactApexChart
          options={options}
          series={series && series.length > 0 ? series : []}
          type="area"
          height={320}
          width={"100%"}
        />
      </div>
    </div>
  );
};

export default ChartOne;
