// authApi.ts
import axios from "axios";
import {
  retrieveAuthData,
  secureGet,
  secureStore,
  storeAuthData,
} from "../storage/storage";
import { CONFIG } from "../constants";
import { refreshToken } from "../api_utils/onboardingAPI";

interface AuthResponse {
  accessToken: string;
  expiresIn: number;
  tokenType: string;
  secretKey: string;
}

const getAuthData = async () => {
  const storedAuthData = await retrieveAuthData();

  if (storedAuthData) {
    return storedAuthData;
  }

  try {
    const response = await axios.get<AuthResponse>(
      `${CONFIG.AUTH_BASE_API_URL}?env=${CONFIG.ENV}&identifier=${CONFIG.IDENTIFIER}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log(
      `${CONFIG.AUTH_BASE_API_URL}?env=${CONFIG.ENV}&identifier=${CONFIG.IDENTIFIER}`
    );

    const { accessToken, secretKey, expiresIn } = response.data;
    await storeAuthData(accessToken, secretKey, expiresIn);
    return response.data;
  } catch (error) {
    console.error("Authentication failed:", error);
    throw new Error("Unable to fetch auth data");
  }
};

export const storeCloudAuth = async (
  accessToken: string,
  expiresIn: number,
  refreshToken: string,
  refreshExpiresIn: number
): Promise<void> => {
  try {
    // Calculate expiration timestamps
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    const cloudAccessTokenExpirationTime = currentTime + expiresIn;
    const refreshTokenExpirationTime = currentTime + refreshExpiresIn;

    // Create the cloudAuth object
    const cloudAuth = {
      cloudAccessToken: accessToken,
      cloudAccessTokenExpirationTime,
      refreshToken,
      refreshTokenExpirationTime,
    };

    // Store the cloudAuth object in secureStore
    await secureStore("cloudAuth", JSON.stringify(cloudAuth));
  } catch (error) {
    console.error("Failed to store cloudAuth data:", error);
    throw new Error("Unable to store cloudAuth data");
  }
};

export const getValidCloudAccessToken = async (): Promise<string> => {
  // Retrieve the cloudAuth data from secureStore
  const storedCloudAuth = await secureGet("cloudAuth");

  if (!storedCloudAuth) {
    throw new Error("No cloudAuth data found in secureStore.");
  }

  // Parse the cloudAuth data
  const cloudAuth = JSON.parse(storedCloudAuth);
  const {
    cloudAccessToken,
    cloudAccessTokenExpirationTime,
    refreshToken: currentRefreshToken,
  } = cloudAuth;

  // Check if the cloudAccessToken has expired
  const isTokenExpired = (expirationTime: number): boolean => {
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    return currentTime > expirationTime;
  };

  if (!isTokenExpired(cloudAccessTokenExpirationTime)) {
    // Token is still valid, return it
    return cloudAccessToken;
  }

  // Token has expired, refresh it
  console.log("Cloud Access Token has expired. Refreshing...");

  try {
    // Call the refreshToken function to get new tokens
    const newTokens = await refreshToken();

    // Calculate expiration timestamps
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    const newCloudAccessTokenExpirationTime =
      currentTime + newTokens.expires_in;
    const newRefreshTokenExpirationTime =
      currentTime + newTokens.refresh_expires_in;

    // Update the cloudAuth data with the new tokens and expiration timestamps
    const updatedCloudAuth = {
      cloudAccessToken: newTokens.access_token,
      cloudAccessTokenExpirationTime: newCloudAccessTokenExpirationTime,
      refreshToken: newTokens.refresh_token,
      refreshTokenExpirationTime: newRefreshTokenExpirationTime,
    };

    // Save the updated cloudAuth data to secureStore
    await secureStore("cloudAuth", JSON.stringify(updatedCloudAuth));

    console.log("Cloud Access Token refreshed successfully.");

    // Return the new cloudAccessToken
    return newTokens.access_token;
  } catch (error) {
    console.error("Failed to refresh Cloud Access Token:", error);
    throw new Error("Unable to refresh Cloud Access Token");
  }
};

export { getAuthData };
