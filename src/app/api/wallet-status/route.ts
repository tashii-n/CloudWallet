// app/api/cloud-wallet/status/route.ts
import { NextResponse } from "next/server";
import axios, { AxiosRequestConfig } from "axios";
import { getValidCloudAccessToken } from "@/app/lib/auth_utils";
import { CONFIG } from "@/app/lib/constants";
import { handleApiError } from "@/app/lib/errorHandler";

export async function GET(req: Request) {
  try {
    // Optional: get sessionId if you want to tie this to a specific session
    const sessionId = req.headers.get("x-session-id");
    if (!sessionId) {
      return NextResponse.json(
        { error: "No sessionId provided" },
        { status: 400 }
      );
    }
    // Get valid cloud access token (server-side)
    const cloudAccessToken = await getValidCloudAccessToken(sessionId);
    if (!cloudAccessToken) {
      return NextResponse.json(
        { error: "Access token is missing" },
        { status: 401 }
      );
    }

    const headers = {
      Authorization: `Bearer ${cloudAccessToken}`,
      "Content-Type": "application/json",
    };

    const config: AxiosRequestConfig = {
      method: "get",
      url: `${CONFIG.BASE_API_URL}/cloud-wallet/v1/check-cloud-wallet-status`,
      headers,
    };

    const response = await axios(config);

    // Return the full response JSON
    return NextResponse.json(response.data);
  } catch (err) {
    handleApiError(err);
  }
}
