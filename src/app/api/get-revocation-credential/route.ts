// app/api/onboarding/get-revocation-credential/route.ts
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

    // Build query params
    const queryParams = new URLSearchParams({
      holderDID: params.holderDID,
      revocationId: params.revocationId,
    }).toString();

    const config: AxiosRequestConfig = {
      method: "post",
      url: `${CONFIG.BASE_API_URL}/cloud-wallet/v1/user/issue_revocation_cred?${queryParams}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    };

    const { data } = await axios(config);
    return NextResponse.json(data);
  } catch (err) {
    return handleApiError(err);
  }
}
