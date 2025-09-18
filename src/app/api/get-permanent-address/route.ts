import { NextResponse } from "next/server";
import axios, { AxiosRequestConfig } from "axios";
import { getAuthData } from "@/app/lib/auth_utils";
import { CONFIG } from "@/app/lib/constants";
import { handleApiError } from "@/app/lib/errorHandler";

export async function GET(req: Request) {
  try {
    const apiUrl = CONFIG.BASE_API_URL;
    if (!apiUrl) {
      return NextResponse.json(
        { error: "API URL is missing in environment variables" },
        { status: 500 }
      );
    }

    // Get sessionId from headers
    const sessionId = req.headers.get("x-session-id");
    if (!sessionId) {
      return NextResponse.json(
        { error: "No sessionId provided" },
        { status: 400 }
      );
    }

    // Get authData for this session
    const authData = await getAuthData(sessionId);
    const { accessToken } = authData;
    if (!accessToken) {
      return NextResponse.json(
        { error: "Access token is missing" },
        { status: 400 }
      );
    }

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    // Query parameters
    const queryParams = new URLSearchParams({
      requestType: "PERMANENT_ADDRESS",
    });

    const config: AxiosRequestConfig = {
      method: "get",
      url: `${apiUrl}/cloud-wallet/v1/user/proof-request?${queryParams.toString()}`,
      headers,
    };

    const response = await axios(config);

    return NextResponse.json(response.data);
  } catch (error) {
    handleApiError(error);
  }
}
