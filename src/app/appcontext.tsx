"use client";
import { createContext } from "react";

export const AppContext = createContext({
  menu: "",
  setMenu: function (value: any) {
    return value;
  },
  employeePage: 0,
  setEmployeePage: function (value: any) {
    return value;
  },

  accountInfo: [],
  setAccountInfo: function (value: any) {
    return value;
  },

  easyMessage: "",
  setEasyMessage: function (value: any) {
    return value;
  },

  easyStatusMessage: false,
  setEasyStatusMessage: function (value: any) {
    return value;
  },
});
