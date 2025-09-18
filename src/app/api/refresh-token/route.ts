import { NextResponse } from "next/server";
import axios, { AxiosRequestConfig } from "axios";
import { getAuthData } from "@/app/lib/auth_utils";
import { CONFIG } from "@/app/lib/constants";
import { handleApiError } from "@/app/lib/errorHandler";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const sessionId = req.headers.get("x-session-id");

    if (!sessionId) {
      return NextResponse.json({ error: "No sessionId" }, { status: 400 });
    }

    const { refreshToken: refreshTokenData } = body;

    if (!refreshTokenData) {
      return NextResponse.json(
        { error: "Refresh token is missing" },
        { status: 400 }
      );
    }

    // Get accessToken from session
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

    const config: AxiosRequestConfig = {
      method: "post",
      url: `${CONFIG.BASE_API_URL}/cloud-wallet/v1/user/refresh-token`,
      headers,
      data: { refreshToken: refreshTokenData },
    };

    const response = await axios(config);

    return NextResponse.json(response.data.data);
  } catch (error) {
    handleApiError(error);
  }
}
