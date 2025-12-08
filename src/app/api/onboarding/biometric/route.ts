import { NextResponse } from "next/server";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { getAuthData } from "../../../lib/auth_utils";
import { CONFIG } from "../../../lib/constants";
import {
  decryptPayload,
  encryptPayload,
} from "../../../lib/cryptography/dataCrypt";
import { handleApiError } from "@/app/lib/errorHandler";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const sessionId = req.headers.get("x-session-id");

    if (!sessionId) {
      return NextResponse.json({ error: "No sessionId" }, { status: 400 });
    }

    // Get auth tokens from server session
    const { accessToken, secretKey } = await getAuthData(sessionId);

    if (!accessToken || !secretKey) {
      return NextResponse.json({ error: "Auth data missing" }, { status: 401 });
    }

    // Create a unique device ID
    const deviceId = uuidv4();

    const transformedData = {
      "ID Number": body.idNumber,
      "ID Type": body.idType,
      onboardingUniqueId: body.onboardingUniqueId || "",
      deviceId: deviceId,
      Image: body.image || "",
    };

    // Encrypt payload
    const encryptedData = await encryptPayload(
      secretKey,
      JSON.stringify(transformedData)
    );

    // Call external API
    const response = await axios.post(
      `${CONFIG.BASE_API_URL}/cloud-wallet/v1/user/onboarding/validate-biometric`,
      { data: encryptedData },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Decrypt API response
    const decryptedResponse = await decryptPayload(
      secretKey,
      response.data.data
    );
    const decryptedData = JSON.parse(decryptedResponse);

    return NextResponse.json(decryptedData);
  } catch (err) {
    return handleApiError(err);
  }
}
