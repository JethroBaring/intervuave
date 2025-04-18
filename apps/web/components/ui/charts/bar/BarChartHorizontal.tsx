"use client";
import React from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

// Dynamically import the ReactApexChart component with SSR disabled
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function BarChartHorizontal({categories, data, height}: {categories: string[], data: number[], height: number}) {
  const options: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 180,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: "70%", // Set a fixed percentage of the available space
        borderRadius: 5,
        borderRadiusApplication: "end",
        distributed: false,
      },
    },
    dataLabels: { 
      enabled: true, 
      formatter: (val: number) => `${val}%`,
      offsetX: 0,
      style: {
        fontSize: '12px',
        colors: ['#fff']
      }
    },
    stroke: {
      show: false,
    },
    yaxis: {
      axisBorder: { show: false },
      axisTicks: { show: false },
      max: 100,
      labels: {
        style: {
          fontSize: '12px',
        },
      },
    },
    xaxis: {
      categories: categories,
      labels: {
        style: {
          fontSize: '12px',
        },
      },
    },
    legend: {
      show: false,
    },
    grid: {
      yaxis: { 
        lines: { show: true },
      },
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      }
    },
    fill: { opacity: 1 },
    tooltip: {
      x: { show: false },
      y: {
        formatter: (val: number) => `${val}%`,
      },
    },
  };

  const series = [
    {
      name: "Score",
      data,
    },
  ];

  return (
    <div className="max-w-full overflow-x-auto custom-scrollbar">
      <div id="chartOne" className="max-w-full">
        <ReactApexChart 
          options={options} 
          series={series} 
          type="bar" 
          height={height} 
        />
      </div>
    </div>
  );
}
