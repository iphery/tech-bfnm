"use client";
import { Appbar } from "@/components/appbar";
import UserAuth from "@/components/auth";
import Loader from "@/components/common/Loader";
import { CommonInput } from "@/components/input";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { API_URL, IMAGE_ASSET, IMAGE_USER } from "@/utils/constant";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { HiAcademicCap, HiLocationMarker, HiSearch } from "react-icons/hi";
import {
  HiArrowLeft,
  HiCalendar,
  HiCamera,
  HiOutlineUser,
  HiUser,
} from "react-icons/hi2";
import { MdOutlineClose } from "react-icons/md";
import { useMediaQuery } from "react-responsive";
import { formatDateTime } from "@/utils/dateformat";
import paginateData from "@/utils/pagination";
import { IoTime, IoTimeOutline } from "react-icons/io5";
import DetailAssetWeb from "@/components/detailassetweb";
import DetailAssetMobile from "@/components/detailassetmobile";

export default function DetailAsset({ params }) {
  //params.idAsset
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  const isSmallScreen = useMediaQuery({ query: "(max-width: 640px)" });
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }
  return (
    <UserAuth>
      {isSmallScreen ? (
        <DetailAssetMobile idAsset={params.idAsset} />
      ) : (
        <DetailAssetWeb idAsset={params.idAsset} />
      )}
    </UserAuth>
  );
}
