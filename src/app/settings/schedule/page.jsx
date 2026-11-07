"use client";

import React, { useState, useEffect } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import UserAuth from "@/components/auth";
import KmScheduleMatrix from "@/components/Schedule/KmScheduleMatrix";

export default function SettingsSchedulePage() {
  const [userLevel, setUserLevel] = useState("");

  useEffect(() => {
    const user = localStorage.getItem("info");
    if (user != null) {
      try {
        const parseUser = JSON.parse(user);
        const level = Array.isArray(parseUser)
          ? parseUser[0]?.Level
          : parseUser?.Level;
        setUserLevel(String(level));
      } catch (err) {
        console.error("Parse user level error:", err);
      }
    }
  }, []);

  // Route guard: Hanya role level 0, 1, 2
  if (userLevel !== "" && parseInt(userLevel) > 2) {
    return (
      <UserAuth>
        <DefaultLayout>
          <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-danger/10 text-danger">
              <span className="text-2xl font-bold">!</span>
            </div>
            <h2 className="text-lg font-bold text-black dark:text-white">
              Akses Terbatas
            </h2>
            <p className="mt-1 max-w-md text-xs text-slate-500 dark:text-slate-400">
              Halaman Matrix Jadwal KM ini hanya dapat diakses oleh Engineering dan Administrator.
            </p>
          </div>
        </DefaultLayout>
      </UserAuth>
    );
  }

  return (
    <UserAuth>
      <DefaultLayout>
        <div className="space-y-4 pb-10">
          <KmScheduleMatrix />
        </div>
      </DefaultLayout>
    </UserAuth>
  );
}
