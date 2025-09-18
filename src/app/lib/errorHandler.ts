import { NextResponse } from "next/server";
import axios from "axios";

export function handleApiError(err: unknown) {
  console.error("API call failed:", err);

  let status = 500;
  let payload: any = { error: "Unable to make API call" };

  if (axios.isAxiosError(err)) {
    status = err.response?.status || 500;

    if (err.response?.data) {
      payload = err.response.data; // forward API error JSON directly
    }
  }

  return NextResponse.json(payload, { status });
}
