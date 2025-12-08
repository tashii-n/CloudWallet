import { NextResponse } from "next/server";
import axios from "axios";
import { getValidCloudAccessToken } from "../../../lib/auth_utils";
import { CONFIG } from "../../../lib/constants";
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

    // Retrieve cloud token from server session
    const cloudAccessToken = getValidCloudAccessToken(sessionId);

    const response = await axios.post(
      `${CONFIG.BASE_API_URL}/cloud-wallet/v1/did`,
      {},
      {
        headers: {
          Authorization: `Bearer ${cloudAccessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json(response.data.data);
  } catch (err) {
    return handleApiError(err);
  }
}
