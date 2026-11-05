//import "jsvectormap/dist/jsvectormap.css";
//import "flatpickr/dist/flatpickr.min.css";
import "@/css/satoshi.css";
import "@/css/style.css";
import "react-toastify/dist/ReactToastify.css";
import { DataProvider } from "@/app/appcontext";

import { Metadata, Viewport } from "next";
import { ReactNode } from "react";
import { ToastContainer } from "react-toastify";
//import Main from "./main";

export const viewport: Viewport = {
  themeColor: "#1A222C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "MITA BFNM",
  description: "Maintenance Apps",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MITA BFNM",
  },
  icons: {
    icon: "/icon-192x192.png",
    shortcut: "/icon-192x192.png",
    apple: "/icon-192x192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <DataProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  try {
                    var theme = localStorage.getItem('color-theme');
                    if (theme) {
                      try { theme = JSON.parse(theme); } catch(e) {}
                    }
                    if (theme === 'dark') {
                      document.documentElement.classList.add('dark');
                    } else if (theme === 'light') {
                      document.documentElement.classList.remove('dark');
                    }
                  } catch (e) {}
                })();
              `,
            }}
          />
        </head>
        <body suppressHydrationWarning={true} className="bg-whiten text-body dark:bg-boxdark-2 dark:text-bodydark transition-colors duration-200">
          <ToastContainer
            position="top-center"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
          <div className="min-h-screen">{children}</div>
        </body>
      </html>
    </DataProvider>
  );
}

/*
"use client";
import "jsvectormap/dist/jsvectormap.css";
import "flatpickr/dist/flatpickr.min.css";
import "@/css/satoshi.css";
import "@/css/style.css";
import React, { useEffect, useState } from "react";
import Loader from "@/components/common/Loader";

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

*/
