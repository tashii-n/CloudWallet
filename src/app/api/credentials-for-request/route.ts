import { NextResponse } from "next/server";
import axios, { AxiosRequestConfig } from "axios";
import { getAuthData, getValidCloudAccessToken } from "@/app/lib/auth_utils";
import { CONFIG } from "@/app/lib/constants";
import { handleApiError } from "@/app/lib/errorHandler";

export async function GET(req: Request) {
  try {
    const sessionId = req.headers.get("x-session-id");
    if (!sessionId) {
      return NextResponse.json({ error: "No sessionId" }, { status: 400 });
    }

    const url = new URL(req.url);
    const proofRecordId = url.pathname.split("/").pop();
    if (!proofRecordId) {
      return NextResponse.json(
        { error: "Missing proofRecordId" },
        { status: 400 }
      );
    }

    // Get cloud access token from server session
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

    const config: AxiosRequestConfig = {
      method: "get",
      url: `${CONFIG.BASE_API_URL}/cloud-wallet/v1/credentialsForRequest/${proofRecordId}`,
      headers,
    };

    const response = await axios(config);
    return NextResponse.json(response.data.data);
  } catch (error) {
    handleApiError(error);
  }
}
