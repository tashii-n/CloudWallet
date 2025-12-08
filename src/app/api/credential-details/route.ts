// app/api/credential/details/route.ts
import { NextResponse } from "next/server";
import axios, { AxiosRequestConfig } from "axios";
import { getValidCloudAccessToken } from "@/app/lib/auth_utils";
import { CONFIG } from "@/app/lib/constants";
import { handleApiError } from "@/app/lib/errorHandler";

export async function GET(req: Request) {
  try {
    const sessionId = req.headers.get("x-session-id");
    if (!sessionId) {
      return NextResponse.json(
        { error: "No sessionId provided" },
        { status: 400 }
      );
    }
    const urlParams = new URL(req.url).searchParams;

    const credentialRecordId = urlParams.get("credentialRecordId");
    const selfAttestedParam = urlParams.get("selfAttested");

    if (!credentialRecordId) {
      return NextResponse.json(
        { error: "credentialRecordId is required" },
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

    // Construct URL
    let apiUrl = `${CONFIG.BASE_API_URL}/cloud-wallet/v1/credential?credentialRecordId=${credentialRecordId}`;
    if (selfAttestedParam) {
      apiUrl += `&selfAttested=${selfAttestedParam}`;
    }

    const config: AxiosRequestConfig = {
      method: "get",
      url: apiUrl,
      headers,
    };

    const response = await axios(config);
    const responsePayload = response?.data?.data;

    return NextResponse.json(responsePayload);
  } catch (err) {
    handleApiError(err);
  }
}
