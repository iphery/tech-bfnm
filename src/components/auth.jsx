"use client";

import React, { useState, useEffect, ReactNode } from "react";

import { API_URL } from "@/utils/constant";
import axios from "axios";
import SignIn from "@/app/(auth)/signin/page";
import { auth } from "@/app/firebase-config";
import { onAuthStateChanged } from "firebase/auth";

export default function UserAuth({ children }) {
  const [isLogin, setLogin] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user == null) {
        setLogin(false);
      }
    });

    //return () => unsubscribe();
  }, []);

  if (!isLogin) {
    return <SignIn></SignIn>;
  } else {
    return <div>{children}</div>;
  }
}
