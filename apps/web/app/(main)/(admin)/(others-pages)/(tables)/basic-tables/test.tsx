"use client";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne from "@/components/tables/BasicTableOne";
import Pagination from "@/components/tables/Pagination";
import { Metadata } from "next";
import React, { useState } from "react";

// export const metadata: Metadata = {
//   title: "Next.js Basic Table | TailAdmin - Next.js Dashboard Template",
//   description:
//     "This is Next.js Basic Table  page for TailAdmin  Tailwind CSS Admin Dashboard Template",
//   // other metadata
// };

export default function BasicTables() {
  const [currentPage, setCurrentPage] = useState(0);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white pt-4 dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="flex flex-col gap-2 px-5 mb-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Candidates
          </h3>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <form>
            <div className="relative">
              <button className="absolute -translate-y-1/2 left-4 top-1/2">
                <svg
                  className="fill-gray-500 dark:fill-gray-400"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M3.04199 9.37381C3.04199 5.87712 5.87735 3.04218 9.37533 3.04218C12.8733 3.04218 15.7087 5.87712 15.7087 9.37381C15.7087 12.8705 12.8733 15.7055 9.37533 15.7055C5.87735 15.7055 3.04199 12.8705 3.04199 9.37381ZM9.37533 1.54218C5.04926 1.54218 1.54199 5.04835 1.54199 9.37381C1.54199 13.6993 5.04926 17.2055 9.37533 17.2055C11.2676 17.2055 13.0032 16.5346 14.3572 15.4178L17.1773 18.2381C17.4702 18.531 17.945 18.5311 18.2379 18.2382C18.5308 17.9453 18.5309 17.4704 18.238 17.1775L15.4182 14.3575C16.5367 13.0035 17.2087 11.2671 17.2087 9.37381C17.2087 5.04835 13.7014 1.54218 9.37533 1.54218Z"
                    fill=""
                  ></path>
                </svg>
              </button>
              <input
                placeholder="Search..."
                className="dark:bg-dark-900 h-[42px] w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-[42px] pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[300px]"
                type="text"
              />
            </div>
          </form>
        </div>
      </div>
      <div className="overflow-hidden">
        <div className="max-w-full px-5 overflow-x-auto sm:px-6">
          <table className="min-w-full undefined">
            <thead className="border-gray-100 border-y dark:border-white/[0.05]">
              <tr>
                <th className="py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  Name
                </th>
                <th className="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  Date
                </th>
                <th className="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  Price
                </th>
                <th className="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  Category
                </th>
                <th className="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              <tr>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8">
                      <img
                        alt="brand"
                        loading="lazy"
                        width="32"
                        height="32"
                        decoding="async"
                        data-nimg="1"
                        src="/images/brand/brand-08.svg"
                      />
                    </div>
                    <div>
                      <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
                        Bought PYPL
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-gray-700 whitespace-nowrap text-theme-sm dark:text-gray-400">
                  Nov 23, 01:00 PM
                </td>
                <td className="px-4 py-4 text-gray-700 text-theme-sm dark:text-gray-400">
                  $2,567.88
                </td>
                <td className="px-4 py-4 text-gray-700 text-theme-sm dark:text-gray-400">
                  Finance
                </td>
                <td className="px-4 py-4 text-gray-700 text-theme-sm dark:text-gray-400">
                  <span className="inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-theme-xs bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500">
                    Success
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8">
                      <img
                        alt="brand"
                        loading="lazy"
                        width="32"
                        height="32"
                        decoding="async"
                        data-nimg="1"
                        src="/images/brand/brand-07.svg"
                      />
                    </div>
                    <div>
                      <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
                        Bought AAPL
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-gray-700 whitespace-nowrap text-theme-sm dark:text-gray-400">
                  Nov 23, 01:00 PM
                </td>
                <td className="px-4 py-4 text-gray-700 text-theme-sm dark:text-gray-400">
                  $2,567.88
                </td>
                <td className="px-4 py-4 text-gray-700 text-theme-sm dark:text-gray-400">
                  Finance
                </td>
                <td className="px-4 py-4 text-gray-700 text-theme-sm dark:text-gray-400">
                  <span className="inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-theme-xs bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-400">
                    Pending
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8">
                      <img
                        alt="brand"
                        loading="lazy"
                        width="32"
                        height="32"
                        decoding="async"
                        data-nimg="1"
                        src="/images/brand/brand-15.svg"
                      />
                    </div>
                    <div>
                      <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
                        Sell KKST
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-gray-700 whitespace-nowrap text-theme-sm dark:text-gray-400">
                  Nov 23, 01:00 PM
                </td>
                <td className="px-4 py-4 text-gray-700 text-theme-sm dark:text-gray-400">
                  $2,567.88
                </td>
                <td className="px-4 py-4 text-gray-700 text-theme-sm dark:text-gray-400">
                  Finance
                </td>
                <td className="px-4 py-4 text-gray-700 text-theme-sm dark:text-gray-400">
                  <span className="inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-theme-xs bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500">
                    Success
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8">
                      <img
                        alt="brand"
                        loading="lazy"
                        width="32"
                        height="32"
                        decoding="async"
                        data-nimg="1"
                        src="/images/brand/brand-02.svg"
                      />
                    </div>
                    <div>
                      <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
                        Bought FB
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-gray-700 whitespace-nowrap text-theme-sm dark:text-gray-400">
                  Nov 23, 01:00 PM
                </td>
                <td className="px-4 py-4 text-gray-700 text-theme-sm dark:text-gray-400">
                  $2,567.88
                </td>
                <td className="px-4 py-4 text-gray-700 text-theme-sm dark:text-gray-400">
                  Finance
                </td>
                <td className="px-4 py-4 text-gray-700 text-theme-sm dark:text-gray-400">
                  <span className="inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-theme-xs bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500">
                    Success
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8">
                      <img
                        alt="brand"
                        loading="lazy"
                        width="32"
                        height="32"
                        decoding="async"
                        data-nimg="1"
                        src="/images/brand/brand-10.svg"
                      />
                    </div>
                    <div>
                      <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
                        Sell AMZN
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-gray-700 whitespace-nowrap text-theme-sm dark:text-gray-400">
                  Nov 23, 01:00 PM
                </td>
                <td className="px-4 py-4 text-gray-700 text-theme-sm dark:text-gray-400">
                  $2,567.88
                </td>
                <td className="px-4 py-4 text-gray-700 text-theme-sm dark:text-gray-400">
                  Finance
                </td>
                <td className="px-4 py-4 text-gray-700 text-theme-sm dark:text-gray-400">
                  <span className="inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-theme-xs bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500">
                    Failed
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="px-6 py-4 border-t border-gray-200 dark:border-white/[0.05]">
        <div className="flex items-center justify-end gap-5">
          <button className="inline-flex items-center justify-center font-medium gap-2 rounded-lg transition px-4 py-3 text-sm bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300 cursor-not-allowed opacity-50">
            <svg
              className="fill-current"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M2.58301 9.99868C2.58272 10.1909 2.65588 10.3833 2.80249 10.53L7.79915 15.5301C8.09194 15.8231 8.56682 15.8233 8.85981 15.5305C9.15281 15.2377 9.15297 14.7629 8.86018 14.4699L5.14009 10.7472L16.6675 10.7472C17.0817 10.7472 17.4175 10.4114 17.4175 9.99715C17.4175 9.58294 17.0817 9.24715 16.6675 9.24715L5.14554 9.24715L8.86017 5.53016C9.15297 5.23717 9.15282 4.7623 8.85983 4.4695C8.56684 4.1767 8.09197 4.17685 7.79917 4.46984L2.84167 9.43049C2.68321 9.568 2.58301 9.77087 2.58301 9.99715C2.58301 9.99766 2.58301 9.99817 2.58301 9.99868Z"
                fill=""
              ></path>
            </svg>
            <span className="hidden sm:inline">Previous</span>
          </button>
          <span className="block text-sm font-medium text-gray-700 dark:text-gray-400 sm:hidden">
            Page 1 of 3
          </span>
          <ul className="hidden items-center gap-0.5 sm:flex">
            <li>
              <button className="flex h-10 w-10 items-center justify-center rounded-lg text-theme-sm font-medium bg-brand-500 text-white">
                1
              </button>
            </li>
            <li>
              <button className="flex h-10 w-10 items-center justify-center rounded-lg text-theme-sm font-medium text-gray-700 hover:bg-brand-500/[0.08] dark:hover:bg-brand-500 dark:hover:text-white hover:text-brand-500 dark:text-gray-400">
                2
              </button>
            </li>
            <li>
              <button className="flex h-10 w-10 items-center justify-center rounded-lg text-theme-sm font-medium text-gray-700 hover:bg-brand-500/[0.08] dark:hover:bg-brand-500 dark:hover:text-white hover:text-brand-500 dark:text-gray-400">
                3
              </button>
            </li>
          </ul>
          <button className="inline-flex items-center justify-center font-medium gap-2 rounded-lg transition px-4 py-3 text-sm bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300">
            <span className="hidden sm:inline">Next</span>
            <svg
              className="fill-current"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M17.4175 9.9986C17.4178 10.1909 17.3446 10.3832 17.198 10.53L12.2013 15.5301C11.9085 15.8231 11.4337 15.8233 11.1407 15.5305C10.8477 15.2377 10.8475 14.7629 11.1403 14.4699L14.8604 10.7472L3.33301 10.7472C2.91879 10.7472 2.58301 10.4114 2.58301 9.99715C2.58301 9.58294 2.91879 9.24715 3.33301 9.24715L14.8549 9.24715L11.1403 5.53016C10.8475 5.23717 10.8477 4.7623 11.1407 4.4695C11.4336 4.1767 11.9085 4.17685 12.2013 4.46984L17.1588 9.43049C17.3173 9.568 17.4175 9.77087 17.4175 9.99715C17.4175 9.99763 17.4175 9.99812 17.4175 9.9986Z"
                fill=""
              ></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
