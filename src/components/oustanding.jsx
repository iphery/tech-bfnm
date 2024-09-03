"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useRouter } from "next/navigation";
import { DataProvider, useProvider } from "@/app/appcontext";
import { API_URL, IMAGE_ASSET } from "@/utils/constant";
import axios from "axios";
import {
  LiaAccessibleIcon,
  LiaChessBishopSolid,
  LiaSafari,
  LiaUser,
} from "react-icons/lia";
import {
  MdIosShare,
  MdOutlineAccessTime,
  MdOutlineCalendarMonth,
} from "react-icons/md";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import { HiArrowLeft, HiArrowRight } from "react-icons/hi";

const ProductCard = ({ product, router }) => (
  <div
    className=" group rounded-lg shadow-md"
    onClick={() => {
      //const desc = generateProductDesc(product.name);
      //router.push(`/p/iduser/${desc}`);
    }}
  >
    <img className="bg-muted h-48 w-full rounded-t-md object-cover" />
    <div className="mb-3 p-1"></div>
  </div>
);

const ProductSkeleton = () => (
  <div className=" rounded-lg  shadow-md">
    <Skeleton height={192} className="mb-2" />
    <div className="p-2">
      <Skeleton width={150} />
      <Skeleton width={100} />
    </div>
  </div>
);

export const ListOutstanding = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const { dataOutstanding, setDataOutstanding } = useProvider();
  const maxLimit = 3;
  const [currentLimit, setCurrentLimit] = useState(1);
  const [isBegining1, setBegining1] = useState(true);
  const [isEnd1, setEnd1] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Replace this with your actual API endpoint
      const response = await axios(`${API_URL}/listoutstanding?page=${page}`);
      const newDataOutstanding = response.data["data"]["data"]; //await response.json();
      //console.log(newProduct.data["data"]);
      setDataOutstanding((prevData) => [...prevData, ...newDataOutstanding]);
      console.log(response.data["data"]["last_page"]);
      setLastPage(response.data["data"]["last_page"]);
      //setHasMore(newProducts.length === 10);

      //setCurrentLimit((prev) => prev + 1);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page]); // Only run on initial mount

  /*
  useEffect(() => {
    if (reachedBottom && currentLimit <= maxLimit) {
      fetchProducts();
      setCurrentLimit((prev) => prev + 1);
      console.log("refresh");
    }
  }, [reachedBottom]);
*/
  return (
    <div>
      {loading ? (
        <div className="grid grid-cols-2 gap-x-2 py-2">
          {[...Array(2)].map((_, index) => (
            <ProductSkeleton key={`skeleton-${index}`} />
          ))}
        </div>
      ) : (
        <div className="group relative flex h-auto w-full  items-center justify-evenly rounded-lg">
          <Swiper
            slidesPerView={2}
            spaceBetween={6}
            //loop={true}

            onReachEnd={() => {
              if (page < lastPage) {
                setPage((prevPage) => prevPage + 1);
              }
            }}
          >
            {dataOutstanding.map((item, index) => {
              const title =
                item["Type"] == "K" ? item["Class"] : item["Description"];
              const image = `${IMAGE_ASSET}/${item["Image"]}`;
              return (
                <SwiperSlide key={index} className="my-4">
                  <div
                    className="cursor-default"
                    onClick={() => {
                      router.push(`/asset/${item["ID_Asset"]}`);
                    }}
                    key={index}
                  >
                    <div>
                      {item["Image"] == null ? (
                        <div className="border-strokedard flex h-30 w-[140px] items-center justify-center rounded-t-lg border">
                          <AiTwotonePicture className="h-8 w-8" />
                        </div>
                      ) : (
                        <img
                          className="h-30 w-[140px] rounded-t-lg object-cover"
                          src={image}
                        />
                      )}
                    </div>
                    <div className="col  w-[140px] rounded-b-lg bg-white p-2">
                      <div className=" overflow-hidden truncate whitespace-nowrap text-sm">
                        {title}
                      </div>
                      <div className="flex flex-row items-center justify-start">
                        <LiaUser className="mr-2"></LiaUser>
                        <div className="text-sm">{item["Requestor"]}</div>
                      </div>
                      <div className="flex flex-row items-center justify-start">
                        <MdOutlineCalendarMonth className="mr-2"></MdOutlineCalendarMonth>
                        <div className="text-sm">{item["Date_Request"]}</div>
                      </div>
                      <div className="flex flex-row items-center justify-start">
                        <MdOutlineAccessTime className="mr-2"></MdOutlineAccessTime>
                        <div className="text-sm">{item["Time_Request"]}</div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>

          <div className="swiper-pagination1 absolute text-black"></div>
          <style jsx global>{`
            .swiper-button-next1::after,
            .swiper-button-prev1::after {
              display: none;
            }
          `}</style>
        </div>
      )}
    </div>
  );
};
