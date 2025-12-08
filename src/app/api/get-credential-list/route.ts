// app/api/onboarding/get-credential-list/route.ts
import { NextResponse } from "next/server";
import axios, { AxiosRequestConfig } from "axios";
import { getAuthData } from "../../lib/auth_utils";
import { CONFIG } from "../../lib/constants";
import { handleApiError } from "@/app/lib/errorHandler";

export async function POST(req: Request) {
  try {
    const sessionId = req.headers.get("x-session-id");
    if (!sessionId) {
      return NextResponse.json(
        { error: "No sessionId provided" },
        { status: 400 }
      );
    }

    const params = await req.json();

    const authData = await getAuthData(sessionId);
    const { accessToken } = authData;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Access token missing" },
        { status: 401 }
      );
    }

    // Build query string
    const queryParams = new URLSearchParams({
      tenantId: params.tenantId,
      take: params.take.toString(),
      skip: params.skip.toString(),
    });

    if (params.status) {
      queryParams.append("status", params.status);
    }

    const config: AxiosRequestConfig = {
      method: "get",
      url: `${CONFIG.BASE_API_URL}/cloud-wallet/v1/user/credential?${queryParams.toString()}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    };

    const { data } = await axios(config);

    return NextResponse.json(data?.data || []);
  } catch (err) {
        return handleApiError(err);
    
  }
}
