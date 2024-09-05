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

  const [cameraResult, setCameraResult] = useState("");
  const [globalIdAsset, setGlobalIdAsset] = useState("");
  const [dataOutstanding, setDataOutstanding] = useState([]);
  const [dataMaintenance, setDataMaintenance] = useState([]);
  const [dashboardFetching, setDashboardFetching] = useState(true);

  const [scannerResult, setScannerResult] = useState("");

  //list outstanding
  const [outIssued, setOutIssued] = useState([]);
  const [outProgress, setOutProgress] = useState([]);
  const [outCompleted, setOutCompleted] = useState([]);
  const [outLoading, setOutLoading] = useState(true);

  //list maintenance
  const [mainIssued, setMainIssued] = useState([]);
  const [mainProgress, setMainProgress] = useState([]);
  const [mainCompleted, setMainCompleted] = useState([]);
  const [mainLoading, setMainLoading] = useState(true);

  //scan genset
  const [scanGenset, setScanGenset] = useState("");
  const [gensetSelectedId, setGensetSelectedId] = useState("");

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
        cameraResult,
        setCameraResult,
        globalIdAsset,
        setGlobalIdAsset,
        dataOutstanding,
        setDataOutstanding,
        dataMaintenance,
        setDataMaintenance,
        dashboardFetching,
        setDashboardFetching,
        scannerResult,
        setScannerResult,
        outIssued,
        setOutIssued,
        outProgress,
        setOutProgress,
        outCompleted,
        setOutCompleted,
        outLoading,
        setOutLoading,
        mainIssued,
        setMainIssued,
        mainProgress,
        setMainProgress,
        mainCompleted,
        setMainCompleted,
        mainLoading,
        setMainLoading,
        scanGenset,
        setScanGenset,
        gensetSelectedId,
        setGensetSelectedId,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useProvider() {
  return useContext(DataContext);
}
