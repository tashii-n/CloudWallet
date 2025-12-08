import { NextResponse } from "next/server";
import axios from "axios";
import { getValidCloudAccessToken } from "../../../lib/auth_utils";
import { CONFIG } from "../../../lib/constants";
import { handleApiError } from "@/app/lib/errorHandler";
import { getSessionStats } from "@/app/lib/session";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const sessionId = req.headers.get("x-session-id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "No sessionId provided" },
        { status: 400 }
      );
    }
    // Add this before getValidCloudAccessToken
    // console.log("🔍 All active sessions:", getSessionStats());

    // Retrieve valid cloud access token from server session
    const cloudAccessToken = getValidCloudAccessToken(sessionId);

    const transformedData = {
      label: body.label ?? "Credential Wallet",
      connectionImageUrl:
        body.connectionImageUrl ?? "https://picsum.photos/200",
    };

    const response = await axios.post(
      `${CONFIG.BASE_API_URL}/cloud-wallet/v1/create-wallet`,
      transformedData,
      {
        headers: {
          Authorization: `Bearer ${cloudAccessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Return response payload
    const responsePayload = response.data.data;
    return NextResponse.json(responsePayload);
  } catch (err) {
    return handleApiError(err);
  }
}
