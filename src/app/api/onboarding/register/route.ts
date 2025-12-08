import { NextResponse } from "next/server";
import axios from "axios";
import { getAuthData } from "../../../lib/auth_utils";
import { CONFIG } from "../../../lib/constants";
import { getSession, setSession } from "@/app/lib/session";
import { handleApiError } from "@/app/lib/errorHandler";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const sessionId = req.headers.get("x-session-id");

    if (!sessionId) {
      return NextResponse.json({ error: "No sessionId" }, { status: 400 });
    }

    // Get auth tokens from server session
    const { accessToken } = await getAuthData(sessionId);

    if (!accessToken) {
      return NextResponse.json({ error: "Auth data missing" }, { status: 401 });
    }

    const transformedData = {
      onboardingUniqueId: body.onboardingUniqueId || "",
    };
    console.log("🚀 ~ POST ~ transformedData:", transformedData);

    // Call external API
    const response = await axios.post(
      `${CONFIG.BASE_API_URL}/cloud-wallet/v1/user/register`,
      transformedData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Return the API response (no decryption needed here)
    const responsePayload = response.data.data;

    // In your server-side register API route
    const cloudAuthData = {
      cloudAccessToken: response.data.data.access_token,
      cloudAccessTokenExpirationTime:
        Date.now() + response.data.data.expires_in * 1000, // store expiration in ms
      refreshToken: response.data.data.refresh_token,
      refreshTokenExpirationTime:
        Date.now() + response.data.data.refresh_expires_in * 1000, // store expiration in ms
    };

    // Store in session
    setSession(sessionId, { cloudAuth: cloudAuthData });

    // const verification = getSession(sessionId);
    // console.log("🔍 VERIFY: Session after setting cloudAuth:", verification);

    return NextResponse.json(responsePayload);
  } catch (err) {
    return handleApiError(err);
  }
}
