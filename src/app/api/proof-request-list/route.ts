import { NextResponse } from "next/server";
import axios, { AxiosRequestConfig } from "axios";
import { getAuthData } from "@/app/lib/auth_utils";
import { CONFIG } from "@/app/lib/constants";
import { handleApiError } from "@/app/lib/errorHandler";

export async function GET(req: Request) {
  try {
    const sessionId = req.headers.get("x-session-id");
    if (!sessionId) {
      return NextResponse.json({ error: "No sessionId" }, { status: 400 });
    }

    const url = new URL(req.url);
    const tenantId = url.searchParams.get("tenantId");
    const status = url.searchParams.get("status");
    const take = url.searchParams.get("take");
    const skip = url.searchParams.get("skip");

    if (!tenantId || !status || !take || !skip) {
      return NextResponse.json(
        { error: "Missing query parameters" },
        { status: 400 }
      );
    }

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

    const queryParams = new URLSearchParams({
      tenantId,
      status,
      take,
      skip,
      order: "desc",
    }).toString();

    const config: AxiosRequestConfig = {
      method: "get",
      url: `${CONFIG.BASE_API_URL}/cloud-wallet/v1/user/proof-requests?${queryParams}`,
      headers,
    };

    const response = await axios(config);

    return NextResponse.json(response.data.data || []);
  } catch (error) {
    handleApiError(error);
  }
}
