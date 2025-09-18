import { NextResponse } from "next/server";
import axios, { AxiosRequestConfig } from "axios";
import { CONFIG } from "@/app/lib/constants";
import { getValidCloudAccessToken } from "@/app/lib/auth_utils";
import { handleApiError } from "@/app/lib/errorHandler";

export async function POST(req: Request) {
  try {
    const apiUrl = CONFIG.BASE_API_URL;
    if (!apiUrl) {
      return NextResponse.json(
        { error: "API URL is missing in environment variables" },
        { status: 500 }
      );
    }

    const sessionId = req.headers.get("x-session-id");
    if (!sessionId) {
      return NextResponse.json(
        { error: "No sessionId provided" },
        { status: 400 }
      );
    }

    const { credentialRecordId, isSelfAttested } = await req.json();

    const cloudAccessToken = await getValidCloudAccessToken(sessionId);
    if (!cloudAccessToken) {
      return NextResponse.json(
        { error: "Access token is missing" },
        { status: 400 }
      );
    }

    const headers = {
      Authorization: `Bearer ${cloudAccessToken}`,
      "Content-Type": "application/json",
    };

    const endpoint = isSelfAttested
      ? `/cloud-wallet/v1/credential/${credentialRecordId}?credentialRecordId=${credentialRecordId}&selfAttested=${isSelfAttested}`
      : `/cloud-wallet/v1/credential/${credentialRecordId}?credentialRecordId=${credentialRecordId}`;

    const url = `${apiUrl}${endpoint}`;

    const config: AxiosRequestConfig = {
      method: "delete",
      url,
      headers,
    };

    const response = await axios(config);

    return NextResponse.json(response.data);
  } catch (error) {
    handleApiError(error);
  }
}
