// app/api/onboarding/accept-credential/route.ts
import { NextResponse } from "next/server";
import axios, { AxiosRequestConfig } from "axios";
import { getValidCloudAccessToken } from "../../lib/auth_utils";
import { CONFIG, CONNECTION_TYPES } from "../../lib/constants";
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

    const { jsonData, isRevocation } = await req.json();

    // Get cloud token for this session
    const cloudAccessToken = await getValidCloudAccessToken(sessionId);
    if (!cloudAccessToken) {
      return NextResponse.json(
        { error: "Cloud access token missing" },
        { status: 401 }
      );
    }

    // Build payload
    const transformedData: Record<string, any> = {
      autoAcceptConnection: true,
      autoAcceptInvitation: true,
      reuseConnection: true,
      invitationUrl: jsonData?.invitationUrl || "",
      isShortenURL: jsonData?.isShortenUrl || false,
    };

    if (isRevocation === true) {
      transformedData.connectionType = CONNECTION_TYPES.REVOCATION_CREDENTIAL;
      console.log(
        "🚀 ~ acceptCredential (server) ~ Revocation Credential Flow"
      );
    }

    const config: AxiosRequestConfig = {
      method: "post",
      url: `${CONFIG.BASE_API_URL}/cloud-wallet/v1/receive-invitation-url`,
      headers: {
        Authorization: `Bearer ${cloudAccessToken}`,
        "Content-Type": "application/json",
      },
      data: transformedData,
    };

    const { data } = await axios(config);

    return NextResponse.json(data?.data ?? null);
  } catch (err) {
    return handleApiError(err);
  }
}
