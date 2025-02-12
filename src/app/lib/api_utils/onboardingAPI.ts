import { getAuthData } from "../auth/auth";
import { CONFIG } from "../constants";
import { encryptPayload, decryptPayload } from "../cryptography/dataCrypt.js";
import axios, { AxiosRequestConfig } from "axios";
import { v4 as uuidv4 } from "uuid";
import { secureStore } from "../storage/storage";

export const onboardingValidateAPI = async (jsonData: Record<string, any>) => {
  try {
    const apiUrl = CONFIG.BASE_API_URL;
    if (!apiUrl) {
      throw new Error("API URL is missing in environment variables");
    }

    // Get authentication data
    const authData = await getAuthData();
    const { accessToken, secretKey } = authData;

    // Ensure secretKey is valid
    if (!secretKey) {
      throw new Error("Secret key is missing");
    }

    const transformedData = {
      fullName: jsonData.fullName,
      gender: jsonData.gender,
      bloodType: "A+",
      isBhutanese: jsonData.citizenship === "Bhutanese",
      gewogName: jsonData.gewogName,
      dzongkhagName: jsonData.dzongkhagName,
      villageName: "",
      idType: jsonData.idType,
      idNumber: jsonData.idNumber,
      biometric: false,
    };

    // Encrypt JSON data using the secret key
    const data = await encryptPayload(
      secretKey,
      JSON.stringify(transformedData)
    );

    // Construct headers with bearer token
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    // Prepare API request configuration
    const config: AxiosRequestConfig = {
      method: "post",
      url: `${apiUrl}/cloud-wallet/v1/user/onboarding/validate`,
      headers: headers,
      data: { data: data },
    };

    // console.log(config);

    // Make the API call
    const response = await axios(config);

    const responsePayload = response?.data.data;
    const decryptedResponse = await decryptPayload(secretKey, responsePayload);
    const decryptedData = JSON.parse(decryptedResponse);
    // console.log(decryptedData);
    return decryptedData;
  } catch (error) {
    console.error("API call failed:", error);
    throw new Error("Unable to make API call");
  }
};

export const onboardingBiometricAPI = async (jsonData: Record<string, any>) => {
  try {
    const apiUrl = CONFIG.BASE_API_URL;
    if (!apiUrl) {
      throw new Error("API URL is missing in environment variables");
    }

    // Get authentication data
    const authData = await getAuthData();
    const { accessToken, secretKey } = authData;

    // Ensure secretKey is valid
    if (!secretKey) {
      throw new Error("Secret key is missing");
    }

    const deviceId = uuidv4();

    // Construct the required JSON structure
    const transformedData = {
      "ID Number": jsonData.idNumber,
      "ID Type": jsonData.idType,
      onboardingUniqueId: jsonData.onboardingUniqueId || "",
      deviceId: deviceId,
      Image: jsonData.image || "",
    };

    // Encrypt JSON data using the secret key
    const encryptedData = await encryptPayload(
      secretKey,
      JSON.stringify(transformedData)
    );

    // Construct headers with bearer token
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    // Prepare API request configuration
    const config: AxiosRequestConfig = {
      method: "post",
      url: `${apiUrl}/cloud-wallet/v1/user/onboarding/validate-biometric`,
      headers: headers,
      data: { data: encryptedData },
    };

    console.log("Sending API Request:", config);

    // Make the API call
    const response = await axios(config);

    // Decrypt the API response
    const responsePayload = response?.data.data;
    const decryptedResponse = await decryptPayload(secretKey, responsePayload);
    const decryptedData = JSON.parse(decryptedResponse);

    return decryptedData;
  } catch (error) {
    console.error("API call failed:", error);
    throw new Error("Unable to make API call");
  }
};

export const onboardingRegisterAPI = async (jsonData: Record<string, any>) => {
  try {
    const apiUrl = CONFIG.BASE_API_URL;
    if (!apiUrl) {
      throw new Error("API URL is missing in environment variables");
    }

    // Get authentication data
    const authData = await getAuthData();
    const { accessToken, secretKey } = authData;

    // Ensure secretKey is valid
    if (!secretKey) {
      throw new Error("Secret key is missing");
    }

    // Construct the required JSON structure
    const transformedData = {
      onboardingUniqueId: jsonData.onboardingUniqueId || "",
    };

    // Construct headers with bearer token
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    // Prepare API request configuration
    const config: AxiosRequestConfig = {
      method: "post",
      url: `${apiUrl}/cloud-wallet/v1/user/register`,
      headers: headers,
      data: transformedData,
    };

    console.log("Sending API Request:", config);

    // Make the API call
    const response = await axios(config);

    // Decrypt the API response
    const responsePayload = response?.data.data;
    const decryptedResponse = await decryptPayload(secretKey, responsePayload);
    const decryptedData = JSON.parse(decryptedResponse);

    return decryptedData;
  } catch (error) {
    console.error("API call failed:", error);
    throw new Error("Unable to make API call");
  }
};

