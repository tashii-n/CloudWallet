import { NextResponse } from "next/server";
import axios, { AxiosRequestConfig } from "axios";
import { CONFIG } from "@/app/lib/constants";
import { getValidCloudAccessToken } from "@/app/lib/auth_utils";
import { handleApiError } from "@/app/lib/errorHandler";

export async function GET(req: Request) {
  try {
    const sessionId = req.headers.get("x-session-id");
    if (!sessionId) {
      return NextResponse.json({ error: "No sessionId" }, { status: 400 });
    }

    const apiUrl = CONFIG.BASE_API_URL;
    if (!apiUrl) {
      return NextResponse.json(
        { error: "API URL is missing in environment variables" },
        { status: 500 }
      );
      ``;
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

    const url = `${apiUrl}/cloud-wallet/v1/connections`;

    const config: AxiosRequestConfig = {
      method: "get",
      url,
      headers,
    };

    const response = await axios(config);

    return NextResponse.json(response.data);
  } catch (error) {
    handleApiError(error);
  }
}
