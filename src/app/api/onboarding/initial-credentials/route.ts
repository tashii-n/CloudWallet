import { NextResponse } from "next/server";
import axios, { AxiosRequestConfig } from "axios";
import { getAuthData } from "../../../lib/auth_utils";
import { CONFIG } from "../../../lib/constants";
import { encryptPayload } from "../../../lib/cryptography/dataCrypt";
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

    const jsonData = await req.json();

    // Get session-scoped auth (server-side)
    const { accessToken, secretKey } = await getAuthData(sessionId);
    if (!accessToken || !secretKey) {
      return NextResponse.json(
        { error: "Auth data missing for session" },
        { status: 401 }
      );
    }

    const transformedData = {
      "Blood Type": jsonData["Blood Type"],
      Citizenship: jsonData["Citizenship"],
      "Date of Birth": jsonData["Date of Birth"],
      "Dzongkhag Name": jsonData["Dzongkhag Name"],
      "Full Name": jsonData["Full Name"],
      Gender: jsonData["Gender"],
      "Gewog Name": jsonData["Gewog Name"],
      "ID Number": jsonData["ID Number"],
      "ID Type": jsonData["ID Type"],
      isBhutanese: jsonData["isBhutanese"],
      onboardingUniqueId: jsonData["onboardingUniqueId"],
      "Permanent Household Number": jsonData["Permanent Household Number"],
      "Thram No": jsonData["Thram No"],
      "Village Name": jsonData["Village Name"],
      credentialType: "jsonld",
      holderDID: jsonData["holderDID"],
    };

    // Encrypt payload server-side with session secretKey
    const encryptedData = await encryptPayload(
      secretKey,
      JSON.stringify(transformedData)
    );

    const config: AxiosRequestConfig = {
      method: "post",
      url: `${CONFIG.BASE_API_URL}/cloud-wallet/v1/user/onboarding-credentials`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      data: { data: encryptedData },
    };

    const { data: responseData } = await axios(config);

    // Return the backend's response data to the client (decrypted if needed server-side)
    return NextResponse.json(responseData?.data ?? null);
  } catch (err) {
    return handleApiError(err);
  }
}
