// app/api/onboarding/validate/route.ts
import { NextResponse } from "next/server";
import axios from "axios";
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

    const { accessToken, secretKey } = await getAuthData(sessionId);

    const transformedData = {
      fullName: body.fullName,
      gender: body.gender,
      isBhutanese: body.citizenship === "Bhutanese",
      gewogName: body.gewogName,
      dzongkhagName: body.dzongkhagName,
      villageName: "",
      idType: body.idType,
      idNumber: body.idNumber,
      biometric: false,
    };

    const encryptedData = await encryptPayload(
      secretKey,
      JSON.stringify(transformedData)
    );

    const response = await axios.post(
      `${CONFIG.BASE_API_URL}/cloud-wallet/v1/user/onboarding/validate`,
      { data: encryptedData },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const decrypted = await decryptPayload(secretKey, response.data.data);

    return NextResponse.json(JSON.parse(decrypted));
  } catch (err) {
    return handleApiError(err);
  }
}
