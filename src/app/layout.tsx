"use client";
import "jsvectormap/dist/jsvectormap.css";
import "flatpickr/dist/flatpickr.min.css";
import "@/css/satoshi.css";
import "@/css/style.css";
import React, { useEffect, useState } from "react";
import Loader from "@/components/common/Loader";
import { AppContext } from "./appcontext";
import { Metadata } from "next";

/*
export const metadata: Metadata = {
  title: "MITA BFNM",
  description: "Maintenance Apps",
  manifest: "/manifest.json",
};
*/

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);

  const [menu, setMenu] = useState("");
  const [employeePage, setEmployeePage] = useState(1);
  const [accountInfo, setAccountInfo] = useState([]);
  const [easyMessage, setEasyMessage] = useState("");
  const [easyStatusMessage, setEasyStatusMessage] = useState(false);

  const value = {
    menu,
    setMenu,
    employeePage,
    setEmployeePage,
    accountInfo,
    setAccountInfo,
    easyMessage,
    setEasyMessage,
    easyStatusMessage,
    setEasyStatusMessage,
  };

  // const pathname = usePathname();

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <div className="dark:bg-boxdark-2 dark:text-bodydark">
          {loading ? <Loader /> : children}
        </div>
      </body>
    </html>
  );
}
