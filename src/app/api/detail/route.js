import axios from "axios";
import { NextResponse } from "next/server";
import { OLD_API_URL } from "@/utils/constant";

export async function POST(req) {
  const { category } = await req.json();
  const apiUrl = `${OLD_API_URL}/load_data_asset_category.php`;
  const response = await axios.post(
    apiUrl,
    {
      password: "BFNMAdmin2015",
      category: category,
    },
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );

  return NextResponse.json({
    response: response.data,
  });
}
