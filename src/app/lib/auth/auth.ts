// authApi.ts
import axios from "axios";
import { retrieveAuthData, storeAuthData } from "../storage/storage"; 
import { CONFIG } from "../constants";

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

export { getAuthData };
