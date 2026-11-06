import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { syncAllFifoData } from "@/lib/fifo";

export async function GET() {
  return handleFifoSync();
}

export async function POST() {
  return handleFifoSync();
}

async function handleFifoSync() {
  const startTime = Date.now();
  try {
    const result = await syncAllFifoData(pool);
    const durationMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      message: `Sinkronisasi sistem FIFO berhasil diselesaikan dalam ${durationMs}ms`,
      duration_ms: durationMs,
      summary: result,
    });
  } catch (err) {
    console.error("FIFO sync error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message,
      },
      { status: 500 }
    );
  }
}

