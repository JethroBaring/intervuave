"use client";
import React from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

// Dynamically import the ReactApexChart component with SSR disabled
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function DonutChartWithCenter({
  labels,
  series,
  centerLabel,
  height,
}: {
  labels: string[];
  series: number[];
  centerLabel: string;
  height: number;
}) {
  const options: ApexOptions = {
    chart: {
      type: "donut",
      height,
      fontFamily: "Outfit, sans-serif",
    },
    labels: labels,
    colors: ["#4F46E5", "#9333EA"], // Customize colors: Blue and Purple
    legend: {
      show: true,
      position: "bottom",
      fontFamily: "Outfit",
    },
    dataLabels: {
      enabled: false,
      formatter: (val: number) => `${val.toFixed(0)}%`,
      style: {
        fontSize: '14px',
      },
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val.toFixed(0)}%`,
      },
    },
    stroke: {
      show: false,
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%', // Thickness of the donut
          labels: {
            show: false,
            name: {
              show: false,
            },
            value: {
              show: false,
              fontSize: '24px',
              fontFamily: "Outfit, sans-serif",
              fontWeight: 600,
              color: '#333',
              offsetY: 0,
              formatter: () => centerLabel, // 🎯 Set the big center text here
            },
            total: {
              show: false,
            },
          },
        },
      },
    },
  };

  return (
    <div className="max-w-full overflow-hidden custom-scrollbar">
      <div id="donutChart" className="max-w-full">
        <ReactApexChart options={options} series={series} type="donut" height={height} />
      </div>
    </div>
  );
}
