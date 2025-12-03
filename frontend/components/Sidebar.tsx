"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  ChartBarIcon,
  UsersIcon,
  TagIcon,
  UserGroupIcon,
  ClockIcon,
  CubeIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/outline";

const Sidebar = () => {
  const pathname = usePathname();
  const [openSales, setOpenSales] = useState(true);
  const [openPurchase, setOpenPurchase] = useState(true);
  const [openMondrian, setOpenMondrian] = useState(true);


  const salesItems = [
    {
      name: "Sales Performance",
      href: "/sales/performance",
      icon: ChartBarIcon,
    },
    { name: "Customer Analysis", href: "/sales/customers", icon: UsersIcon },
    { name: "Product Sales", href: "/sales/products", icon: CubeIcon },
    {
      name: "Employees Performance",
      href: "/sales/employees",
      icon: UserGroupIcon,
    },
    { name: "Time Series", href: "/sales/trends", icon: ClockIcon },
  ];

  const purchaseItems = [
    {
      name: "Purchase Performance",
      href: "/purchase/performance",
      icon: ChartBarIcon,
    },
    {
      name: "Supplier Insights",
      href: "/purchase/suppliers",
      icon: BuildingStorefrontIcon,
    },
    {
      name: "Procurement Products",
      href: "/purchase/products",
      icon: CubeIcon,
    },
    { name: "Time Series", href: "/purchase/trends", icon: ClockIcon },
  ];

  const mondrianItems = [
  {
    name: "Sales Cube",
    href: "/olap/sales",
    icon: CubeIcon,
  },
  {
    name: "Purchasing Cube",
    href: "/olap/purchasing",
    icon: CubeIcon,
  },
];

  return (
    <div className="w-70 bg-indigo-800 text-white fixed top-0 left-0 h-screen p-5 overflow-y-auto">
      <h2 className="text-xl font-bold mb-6 mt-3 text-center">
        Adventure Work
      </h2>

      {/* SALES ACCORDION */}
      <div className="mb-6">
        <button
          className="flex justify-between items-center w-full text-left px-3 py-2 font-medium rounded hover:bg-indigo-700"
          onClick={() => setOpenSales(!openSales)}
        >
          <span className="flex items-center gap-2">Sales</span>
          <svg
            className={`w-4 h-4 transform transition-transform ${
              openSales ? "rotate-180" : ""
            }`}
            viewBox="0 0 24 24"
            fill="none"
          >
            <path stroke="currentColor" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {openSales && (
          <nav className="mt-1 space-y-1">
            {salesItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 pl-10 pr-3 py-1.5 rounded hover:bg-indigo-700 transition ${
                    pathname === item.href ? "bg-indigo-600" : ""
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        )}
      </div>

      {/* PURCHASE ACCORDION */}
      <div className="mb-6">
        <button
          className="flex justify-between items-center w-full text-left px-3 py-2 font-medium rounded hover:bg-indigo-700"
          onClick={() => setOpenPurchase(!openPurchase)}
        >
          <span className="flex items-center gap-2">Purchase</span>
          <svg
            className={`w-4 h-4 transform transition-transform ${
              openPurchase ? "rotate-180" : ""
            }`}
            viewBox="0 0 24 24"
            fill="none"
          >
            <path stroke="currentColor" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {openPurchase && (
          <nav className="mt-1 space-y-1">
            {purchaseItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 pl-10 pr-3 py-1.5 rounded hover:bg-indigo-700 transition ${
                    pathname === item.href ? "bg-blue-600" : ""
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        )}
      </div>

      {/* MONDRIAN ACCORDION */}
      <div className="mb-6">
        <button
          className="flex justify-between items-center w-full text-left px-3 py-2 font-medium rounded hover:bg-indigo-700"
          onClick={() => setOpenMondrian(!openMondrian)}
        >
          <span className="flex items-center gap-2">Mondrian Cube</span>
          <svg
            className={`w-4 h-4 transform transition-transform ${
              openMondrian ? "rotate-180" : ""
            }`}
            viewBox="0 0 24 24"
            fill="none"
          >
            <path stroke="currentColor" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {openMondrian && (
          <nav className="mt-1 space-y-1">
            {mondrianItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 pl-10 pr-3 py-1.5 rounded hover:bg-indigo-700 transition ${
                    pathname === item.href ? "bg-indigo-600" : ""
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
