import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { data } = await req.json();
  const apiUrl = `https://balifoam.com/mita/mobile/flutter/load_preview_data_outstanding.php`;
  const response = await axios.post(apiUrl);

  return NextResponse.json({
    response: response.data,
  });
}
