"use client";
import { createContext, useContext, useState } from "react";
const DataContext = createContext();

export function DataProvider({ children }) {
  const [cachedData, setCachedData] = useState({});
  const [myVariable, setMyVariable] = useState("abc");
  const [filteredAssetList, setFilteredAssetList] = useState([]);
  const [assetKeyword, setAssetKeyword] = useState("");

  const [filteredPartList, setFilteredPartList] = useState([]);
  const [partKeyword, setPartKeyword] = useState("");

  const [opnameIdRegister, setOpnameIdRegister] = useState("");

  const updateCache = (key, data) => {
    setCachedData((prev) => ({ ...prev, [key]: data }));
  };

  return (
    <DataContext.Provider
      value={{
        cachedData,
        updateCache,
        myVariable,
        setMyVariable,
        filteredAssetList,
        setFilteredAssetList,
        assetKeyword,
        setAssetKeyword,
        filteredPartList,
        setFilteredPartList,
        partKeyword,
        setPartKeyword,
        opnameIdRegister,
        setOpnameIdRegister,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useProvider() {
  return useContext(DataContext);
}
