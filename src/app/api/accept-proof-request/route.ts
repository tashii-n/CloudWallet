import { NextResponse } from "next/server";
import axios, { AxiosRequestConfig } from "axios";
import { getValidCloudAccessToken } from "@/app/lib/auth_utils";
import { CONFIG } from "@/app/lib/constants";
import { handleApiError } from "@/app/lib/errorHandler";

export async function POST(req: Request) {
  try {
    const sessionId = req.headers.get("x-session-id");
    if (!sessionId) {
      return NextResponse.json({ error: "No sessionId" }, { status: 400 });
    }

    const payload = await req.json();

    const apiUrl = CONFIG.BASE_API_URL;
    if (!apiUrl) {
      return NextResponse.json(
        { error: "API URL is missing in environment variables" },
        { status: 500 }
      );
    }

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

    const url = `${apiUrl}/cloud-wallet/v1/proofs/accept-request`;

    const config: AxiosRequestConfig = {
      method: "post",
      url,
      headers,
      data: payload,
    };

    const response = await axios(config);

    return NextResponse.json(response.data);
  } catch (error) {
    handleApiError(error);
  }
}
