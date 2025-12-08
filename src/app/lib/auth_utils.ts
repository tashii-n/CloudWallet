// lib/auth-utils.ts
import axios from "axios";
import { getSession, setSession } from "./session";
import { CONFIG } from "./constants";

export const getAuthData = async (sessionId: string) => {
  const session = getSession(sessionId);

  if (session.auth && session.auth.expiresAt > Date.now()) {
    return session.auth;
  }

  const response = await axios.get(
    `${CONFIG.AUTH_BASE_API_URL}?env=${CONFIG.ENV}&identifier=${CONFIG.IDENTIFIER}`,
    { headers: { "Content-Type": "application/json" } }
  );

  const { accessToken, secretKey, expiresIn } = response.data;

  setSession(sessionId, {
    auth: {
      accessToken,
      secretKey,
      expiresAt: Date.now() + expiresIn * 1000,
    },
  });

  return { accessToken, secretKey };
};

export const getValidCloudAccessToken = (sessionId: string): string => {
  const session = getSession(sessionId);
//   console.log("🚀 ~ getValidCloudAccessToken ~ session:", session)
  const cloudAuth = session.cloudAuth;

  if (!cloudAuth) throw new Error("No cloudAuth data found for this session");

  if (Date.now() > cloudAuth.cloudAccessTokenExpirationTime) {
    throw new Error("Cloud access token expired");
  }

  return cloudAuth.cloudAccessToken;
};

