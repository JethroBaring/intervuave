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
        horizontal: true, // Change this to true for horizontal orientation
        // For horizontal bars, use barHeight instead of columnWidth.
        barHeight: "100%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: true, formatter: (val: number) => `${val}%` },
    stroke: {
      // show: true,
      // width: 10,
      // colors: ["transparent"],
    },
    // In a horizontal bar chart, categories move to the y-axis.
    yaxis: {
      // x-axis now displays the numeric values.
      axisBorder: { show: false },
      axisTicks: { show: false },
      max: 100
    },
    xaxis: {
      // Use yaxis.categories for the labels.
      categories: categories,
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    grid: {
      yaxis: { lines: { show: true } },
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
        <ReactApexChart options={options} series={series} type="bar" height={height} />
      </div>
    </div>
  );
}
