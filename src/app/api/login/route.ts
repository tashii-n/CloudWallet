// app/api/login/route.ts
import { NextResponse } from "next/server";
import axios, { AxiosRequestConfig } from "axios";
import { getAuthData } from "@/app/lib/auth_utils";
import { encryptPayload } from "@/app/lib/cryptography/dataCrypt";
import { CONFIG } from "@/app/lib/constants";
import { handleApiError } from "@/app/lib/errorHandler";
import { setSession } from "@/app/lib/session";

export async function POST(req: Request) {
  try {
    const sessionId = req.headers.get("x-session-id");
    if (!sessionId) {
      return NextResponse.json(
        { error: "No sessionId provided" },
        { status: 400 }
      );
    }

    const jsonData = await req.json();

    // Get session-scoped auth (server-side)
    const { accessToken, secretKey } = await getAuthData(sessionId);
    if (!accessToken || !secretKey) {
      return NextResponse.json(
        { error: "Auth data missing for session" },
        { status: 401 }
      );
    }

    // Transform incoming data
    const transformedData = {
      "ID Number": jsonData.idNumber,
      "ID Type": "Citizenship",
      Image: jsonData.image, // base64 image
    };

    // Encrypt payload with session secretKey
    const encryptedData = await encryptPayload(
      secretKey,
      JSON.stringify(transformedData)
    );

    const config: AxiosRequestConfig = {
      method: "post",
      url: `${CONFIG.BASE_API_URL}/cloud-wallet/v1/user/login`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      data: { data: encryptedData },
    };

    const response = await axios(config);
    const responsePayload = response?.data?.data;

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

    // If the backend returns encrypted response that must be decrypted server-side,
    // uncomment the following lines and return the parsed object:
    // const decrypted = await decryptPayload(secretKey, responsePayload);
    // return NextResponse.json(JSON.parse(decrypted));

    // Otherwise return the payload as your original client did:
    // return NextResponse.json(responsePayload);
    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
