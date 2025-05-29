"use server"

import axios, { AxiosRequestConfig } from "axios";
import { v4 as uuidv4 } from "uuid";
import { decryptPayload, encryptPayload } from "../../cryptography/dataCrypt";
import { CONFIG } from "../../constants";
import { getAuthData, getValidCloudAccessToken } from "../../auth/auth";

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
    // console.log("🚀 ~ onboardingValidateAPI ~ data:", data);

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
    // console.log("🚀 ~ onboardingValidateAPI ~ decryptedData:", decryptedData);

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
    const { accessToken } = authData;

    // Ensure secretKey is valid

    // Construct the required JSON structure
    const transformedData = {
      onboardingUniqueId: jsonData.onboardingUniqueId || "",
    };
    console.log(
      "🚀 ~ onboardingRegisterAPI ~ transformedData:",
      transformedData
    );

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

    // Make the API call
    const response = await axios(config);

    // Decrypt the API response
    const responsePayload = response?.data.data;

    return responsePayload;
  } catch (error) {
    console.error("API call failed:", error);
    throw new Error("Unable to make API call");
  }
};

// CLOUD APIs
export const onboardingWalletCreationAPI = async (
  jsonData: Record<string, any>
) => {
  try {
    const apiUrl = CONFIG.BASE_API_URL;
    if (!apiUrl) {
      throw new Error("API URL is missing in environment variables");
    }

    const cloudAccessToken = await getValidCloudAccessToken();

    // Construct the required JSON structure
    const transformedData = {
      label: jsonData.label ?? "Credential Wallet",
      connectionImageUrl:
        jsonData.connectionImageUrl ?? "https://picsum.photos/200",
    };

    // Construct headers with bearer token
    const headers = {
      Authorization: `Bearer ${cloudAccessToken}`,
      "Content-Type": "application/json",
    };

    // Prepare API request configuration
    const config: AxiosRequestConfig = {
      method: "post",
      url: `${apiUrl}/cloud-wallet/v1/create-wallet`,
      headers: headers,
      data: transformedData,
    };

    // Make the API call
    const response = await axios(config);

    // Decrypt the API response
    const responsePayload = response?.data.data;

    return responsePayload;
  } catch (error) {
    console.error("API call failed:", error);
    throw new Error("Unable to make API call");
  }
};

export const onboardingDIDAPI = async () => {
  try {
    const apiUrl = CONFIG.BASE_API_URL;
    if (!apiUrl) throw new Error("API URL is missing in environment variables");

    const cloudAccessToken = await getValidCloudAccessToken();

    // Construct headers with bearer token
    const headers = {
      Authorization: `Bearer ${cloudAccessToken}`,
      "Content-Type": "application/json",
    };

    // API request configuration
    const config: AxiosRequestConfig = {
      method: "post",
      url: `${apiUrl}/cloud-wallet/v1/did`,
      headers,
    };

    // Make the API call
    const { data } = await axios(config);

    return data?.data;
  } catch (error) {
    console.error("API call failed:", error);
    throw new Error("Unable to make API call");
  }
};

export const onboardingGetDIDAPI = async () => {
  try {
    const apiUrl = CONFIG.BASE_API_URL;
    if (!apiUrl) throw new Error("API URL is missing in environment variables");

    const cloudAccessToken = await getValidCloudAccessToken();

    // Construct headers with bearer token
    const headers = {
      Authorization: `Bearer ${cloudAccessToken}`,
      "Content-Type": "application/json",
    };

    // API request configuration
    const config: AxiosRequestConfig = {
      method: "get",
      url: `${apiUrl}/cloud-wallet/v1/did`,
      headers,
    };

    // Make the API call
    const { data } = await axios(config);

    return data?.data;
  } catch (error) {
    console.error("API call failed:", error);
    throw new Error("Unable to make API call");
  }
};

export const onboardingInitialCredentialsAPI = async (
  jsonData: Record<string, any>
) => {
  try {
    const apiUrl = CONFIG.BASE_API_URL;
    if (!apiUrl) throw new Error("API URL is missing in environment variables");

    // Get authentication data
    const authData = await getAuthData();
    const { accessToken, secretKey } = authData;

    if (!accessToken) throw new Error("Access Token is missing!");
    if (!secretKey) throw new Error("Secret key is missing");

    // Transform the payload
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
    console.log(transformedData);

    // Encrypt the payload using the secret key
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
      url: `${apiUrl}/cloud-wallet/v1/user/onboarding-credentials`,
      headers,
      data: { data: encryptedData },
    };

    console.log("Sending API Request:", config);

    // Make the API call
    const { data } = await axios(config);
    console.log(data);
    return data?.data;
  } catch (error) {
    console.error("API call failed:", error);
    throw new Error("Unable to make API call");
  }
};

export const acceptCredentialAPI = async (jsonData: Record<string, any>) => {
  try {
    const apiUrl = CONFIG.BASE_API_URL;
    if (!apiUrl) {
      throw new Error("API URL is missing in environment variables");
    }

    // Get authentication data
    const cloudAccessToken = await getValidCloudAccessToken();

    // Construct the required JSON structure
    const transformedData = {
      autoAcceptConnection: true,
      autoAcceptInvitation: true,
      reuseConnection: true,
      invitationUrl: jsonData.invitationUrl || "",
      isShortenURL: jsonData.isShortenUrl || false,
    };

    // Construct headers with bearer token
    const headers = {
      Authorization: `Bearer ${cloudAccessToken}`,
      "Content-Type": "application/json",
    };

    // Prepare API request configuration
    const config: AxiosRequestConfig = {
      method: "post",
      url: `${apiUrl}/cloud-wallet/v1/receive-invitation-url`,
      headers: headers,
      data: transformedData,
    };

    console.log("Sending API Request:", config);

    // Make the API call
    const response = await axios(config);

    // Extract the API response data
    const responsePayload = response?.data?.data;

    return responsePayload;
  } catch (error) {
    console.error("API call failed:", error);
    throw new Error("Unable to make API call");
  }
};

export const loginAPI = async (jsonData: Record<string, any>) => {
  try {
    const apiUrl = CONFIG.BASE_API_URL;
    if (!apiUrl) throw new Error("API URL is missing in environment variables");

    const authData = await getAuthData();
    const { accessToken, secretKey } = authData;

    // Prepare data for encryption
    const transformedData = {
      "ID Number": jsonData.idNumber,
      "ID Type": "Citizenship",
      Image: jsonData.image, // Base64 encoded image
    };

    // Encrypt the transformed data
    const encryptedData = await encryptPayload(
      secretKey,
      JSON.stringify(transformedData)
    );
    
    // console.log("🚀 ~ loginAPI ~ encryptedData:", encryptedData)

    // Construct headers with bearer token
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    // Prepare API request configuration
    const config: AxiosRequestConfig = {
      method: "post",
      url: `${apiUrl}/cloud-wallet/v1/user/login`,
      headers,
      data: { data: encryptedData }, // Required format
    };

    // Make the API call
    const response = await axios(config);
    console.log("🚀 ~ loginAPI ~ response:", response)

    const responsePayload = response?.data.data;

    return responsePayload;
  } catch (error) {
    console.error("API call failed:", error);
    throw new Error("Unable to make API call");
  }
};

export const getCredentialListAPI = async (params: {
  tenantId: string;
  status?: string;
  take: number;
  skip: number;
}) => {
  try {
    const apiUrl = CONFIG.BASE_API_URL;
    if (!apiUrl) throw new Error("API URL is missing in environment variables");

    const authData = await getAuthData();
    const { accessToken } = authData;

    if (!accessToken) throw new Error("Access token is missing");

    // Construct headers
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    // Create URL query params
    const queryParams = new URLSearchParams({
      tenantId: params.tenantId,
      take: params.take.toString(),
      skip: params.skip.toString(),
    });

    if (params.status) {
      queryParams.append("status", params.status);
    }

    // API request configuration
    const config: AxiosRequestConfig = {
      method: "get",
      url: `${apiUrl}/cloud-wallet/v1/user/credential?${queryParams.toString()}`,
      headers,
    };

    console.log("API Request:", config);

    // Make API call
    const response = await axios(config);
    console.log("API Response:", response.data);

    // Return only the data array from response
    return response.data?.data || [];
  } catch (error) {
    console.error("API call failed:", error);
    throw new Error("Unable to fetch credential list");
  }
};

export const getCredentialDetailsAPI = async (
  credentialRecordId: string,
  selfAttested?: boolean
) => {
  try {
    const apiUrl = CONFIG.BASE_API_URL;
    if (!apiUrl) {
      throw new Error("API URL is missing in environment variables");
    }

    const cloudAccessToken = await getValidCloudAccessToken();

    const headers = {
      Authorization: `Bearer ${cloudAccessToken}`,
      "Content-Type": "application/json",
    };

    // Start constructing the URL
    let url = `${apiUrl}/cloud-wallet/v1/credential?credentialRecordId=${credentialRecordId}`;

    // Append selfAttested only if it is defined
    if (typeof selfAttested !== "undefined") {
      url += `&selfAttested=${selfAttested}`;
    }

    const config: AxiosRequestConfig = {
      method: "get",
      url,
      headers,
    };

    console.log("Sending API Request:", config);

    const response = await axios(config);
    const responsePayload = response?.data?.data;

    console.log("Credential Details Responseapi:", responsePayload);
    return responsePayload;
  } catch (error) {
    console.error("API call failed:", error);
    throw new Error("Unable to get credential details");
  }
};

export const getRevocationCredentialAPI = async (params: {
  holderDID: string;
  revocationId: string;
}) => {
  try {
    const apiUrl = CONFIG.BASE_API_URL;
    if (!apiUrl) throw new Error("API URL is missing in environment variables");

    const authData = await getAuthData();
    const { accessToken } = authData;

    if (!accessToken) throw new Error("Access Token is missing!");

    // Prepare request payload
    const queryParams = new URLSearchParams({
      holderDID: params.holderDID,
      revocationId: params.revocationId,
    }).toString();

    // Construct headers with bearer token
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    // Prepare API request configuration
    const config: AxiosRequestConfig = {
      method: "post",
      url: `${apiUrl}/cloud-wallet/v1/user/issue_revocation_cred?${queryParams}`,
      headers,
    };

    // Make the API call
    const response = await axios(config);
    console.log("✅ Revocation Credential Response:", response.data);

    return response.data;
  } catch (error) {
    console.error("API call failed:", error);
    throw new Error("Unable to fetch revocation credential");
  }
};

export const refreshToken = async (refreshToken: string | any) => {
  try {
    const apiUrl = CONFIG.BASE_API_URL;
    if (!apiUrl) {
      throw new Error("API URL is missing in environment variables");
    }

    // Get accessToken and refreshToken from secure storage
    const authData = await getAuthData();
    const { accessToken } = authData;
    const refreshTokenData = refreshToken;

    if (!accessToken) {
      throw new Error("Access token is missing");
    }
    if (!refreshTokenData) {
      throw new Error("Refresh token is missing");
    }

    // Construct headers with access token
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    // Prepare request body
    const requestData = {
      refreshToken: refreshTokenData,
    };

    // Prepare API request configuration
    const config: AxiosRequestConfig = {
      method: "post",
      url: `${apiUrl}/cloud-wallet/v1/user/refresh-token`,
      headers: headers,
      data: requestData,
    };
    console.log("🚀 ~ refreshToken ~ config:", config);

    // Make the API call
    const response = await axios(config);

    // Return the refreshed token data
    return response?.data.data;
  } catch (error) {
    console.error("Refresh token API call failed:", error);
    throw new Error("Unable to refresh token");
  }
};

export const getProofRequestListAPI = async (params: {
  tenantId: string;
  status: string;
  take: number;
  skip: number;
}) => {
  try {
    const apiUrl = CONFIG.BASE_API_URL;
    if (!apiUrl) throw new Error("API URL is missing in environment variables");

    const authData = await getAuthData();
    const { accessToken } = authData;

    if (!accessToken) throw new Error("Access token is missing");

    // Construct headers
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    // Create URL query params
    const queryParams = new URLSearchParams({
      tenantId: params.tenantId,
      status: params.status.toString(),
      take: params.take.toString(),
      skip: params.skip.toString(),
      order: "desc",
    });

    // API request configuration
    const config: AxiosRequestConfig = {
      method: "get",
      url: `${apiUrl}/cloud-wallet/v1/user/proof-requests?${queryParams.toString()}`,
      headers,
    };

    console.log("API Request:", config);

    // Make API call
    const response = await axios(config);
    console.log("API Response:", response.data);

    // Return only the data array from response
    return response.data?.data || [];
  } catch (error) {
    console.error("API call failed:", error);
    throw new Error("Unable to fetch proof request list");
  }
};

export const getProofPresentationAPI = async (proofRecordId: string) => {
  try {
    const apiUrl = CONFIG.BASE_API_URL;
    if (!apiUrl) {
      throw new Error("API URL is missing in environment variables");
    }

    // Get authentication data
    const cloudAccessToken = await getValidCloudAccessToken();

    // Construct headers with bearer token
    const headers = {
      Authorization: `Bearer ${cloudAccessToken}`,
      "Content-Type": "application/json",
    };

    // Prepare the API request URL
    const url = `${apiUrl}/cloud-wallet/v1/proof-presentation?proofRecordId=${proofRecordId}`;

    // Prepare API request configuration
    const config: AxiosRequestConfig = {
      method: "get",
      url: url,
      headers: headers,
    };

    console.log("Sending API Request:", config);

    // Make the API call
    const response = await axios(config);

    // Extract the API response data
    const responsePayload = response?.data?.data;

    console.log("Proof Presentation Response:", responsePayload);
    return responsePayload;
  } catch (error) {
    console.error("API call failed:", error);
    throw new Error("Unable to get proof presentation details");
  }
};

export const getCredentialsForRequestAPI = async (proofRecordId: string) => {
  try {
    const apiUrl = CONFIG.BASE_API_URL;
    if (!apiUrl) {
      throw new Error("API URL is missing in environment variables");
    }

    // Get authentication data
    const cloudAccessToken = await getValidCloudAccessToken();

    // Construct headers with bearer token
    const headers = {
      Authorization: `Bearer ${cloudAccessToken}`,
      "Content-Type": "application/json",
    };

    // Prepare the API request URL
    const url = `${apiUrl}/cloud-wallet/v1/credentialsForRequest/${proofRecordId}`;

    // Prepare API request configuration
    const config: AxiosRequestConfig = {
      method: "get",
      url: url,
      headers: headers,
    };

    console.log("Sending API Request:", config);

    // Make the API call
    const response = await axios(config);

    // Extract the API response data
    const responsePayload = response?.data?.data;

    console.log("Credentials For Request Response:", responsePayload);
    return responsePayload;
  } catch (error) {
    console.error("API call failed:", error);
    throw new Error("Unable to get credentials for request");
  }
};

export const acceptProofRequestAPI = async (payload: Record<string, any>) => {
  try {
    const apiUrl = CONFIG.BASE_API_URL;
    if (!apiUrl) {
      throw new Error("API URL is missing in environment variables");
    }

    const cloudAccessToken = await getValidCloudAccessToken();

    const headers = {
      Authorization: `Bearer ${cloudAccessToken}`,
      "Content-Type": "application/json",
    };

    const url = `${apiUrl}/cloud-wallet/v1/proofs/accept-request`;

    const config: AxiosRequestConfig = {
      method: "post",
      url,
      headers,
      data: payload,
    };

    console.log("Sending Accept Proof Request:", config);

    const response = await axios(config);

    const responsePayload = response?.data;

    console.log("Accept Proof Request Response:", responsePayload);
    return responsePayload;
  } catch (error) {
    console.error("Accept Proof Request API call failed:", error);
    throw new Error("Unable to accept proof request");
  }
};

export const declineProofRequestAPI = async (proofRecordId: string) => {
  try {
    const apiUrl = CONFIG.BASE_API_URL;
    if (!apiUrl) {
      throw new Error("API URL is missing in environment variables");
    }

    const cloudAccessToken = await getValidCloudAccessToken();

    const headers = {
      Authorization: `Bearer ${cloudAccessToken}`,
      "Content-Type": "application/json",
    };

    const url = `${apiUrl}/cloud-wallet/v1/proofs/decline-request`;

    const payload = {
      sendProblemReport: true,
      proofRecordId: proofRecordId,
    };

    const config: AxiosRequestConfig = {
      method: "post",
      url,
      headers,
      data: payload,
    };

    console.log("Sending Reject Proof Request:", config);

    const response = await axios(config);

    const responsePayload = response?.data;

    console.log("Reject Proof Request Response:", responsePayload);
    return responsePayload;
  } catch (error) {
    console.error("Reject Proof Request API call failed:", error);
    throw new Error("Unable to reject proof request");
  }
};

export const getConnectionsAPI = async () => {
  try {
    const apiUrl = CONFIG.BASE_API_URL;
    if (!apiUrl) {
      throw new Error("API URL is missing in environment variables");
    }

    const cloudAccessToken = await getValidCloudAccessToken();

    const headers = {
      Authorization: `Bearer ${cloudAccessToken}`,
      "Content-Type": "application/json",
    };

    const url = `${apiUrl}/cloud-wallet/v1/connections`;

    const config: AxiosRequestConfig = {
      method: "get",
      url,
      headers,
    };

    console.log("Connections API Request:", config);

    const response = await axios(config);

    const responsePayload = response?.data;

    console.log("Connections API Response:", responsePayload);
    return responsePayload;
  } catch (error) {
    console.error("Get Connections API call failed:", error);
    throw new Error("Unable to get connections");
  }
};

export const getPermanentAddressAPI = async () => {
  try {
    const apiUrl = CONFIG.BASE_API_URL;
    if (!apiUrl) throw new Error("API URL is missing in environment variables");

    const authData = await getAuthData();
    const { accessToken } = authData;

    if (!accessToken) throw new Error("Access token is missing");

    // Construct headers
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    // Create URL query params
    const queryParams = new URLSearchParams({
      requestType: "PERMANENT_ADDRESS",
    });

    // API request configuration
    const config: AxiosRequestConfig = {
      method: "get",
      url: `${apiUrl}/cloud-wallet/v1/user/proof-request?${queryParams.toString()}`,
      headers,
    };

    console.log("API Request (Permanent Address Reissuance):", config);

    // Make API call
    const response = await axios(config);
    console.log("API Response (Permanent Address Reissuance):", response.data);

    // Return only the data array from response
    return response.data;
  } catch (error) {
    console.error("API call failed:", error);
    throw new Error("Unable to issue permanent address");
  }
};

export const addSelfAttestedAPI = async (
  payload: Record<string, any>,
  credentialType: string
) => {
  try {
    const apiUrl = CONFIG.BASE_API_URL;
    if (!apiUrl) {
      throw new Error("API URL is missing in environment variables");
    }

    const cloudAccessToken = await getValidCloudAccessToken();

    const headers = {
      Authorization: `Bearer ${cloudAccessToken}`,
      "Content-Type": "application/json",
    };

    const encodedCredentialType = encodeURIComponent(credentialType);
    const url = `${apiUrl}/cloud-wallet/v1/self-attested-credential?credentialType=${encodedCredentialType}`;

    const config: AxiosRequestConfig = {
      method: "post",
      url,
      headers,
      data: payload,
    };

    console.log("Sending Self Attested Request:", config);

    const response = await axios(config);

    const responsePayload = response?.data;

    console.log("Self Attested Response:", responsePayload);
    return responsePayload;
  } catch (error) {
    console.error("Self Attested API call failed:", error);
    throw new Error("Unable to add credential");
  }
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// TEST API Functions
export const getProofPresentationTest = async () => {
  try {
    return {
      request: {
        presentationExchange: {
          presentation_definition: {
            id: "bd0190de-0569-4c36-acb6-684b51c5897e",
            name: "WALLET_BACKUP",
            purpose: "auth_standard",
            input_descriptors: [
              {
                id: "input_0",
                schema: [
                  {
                    uri: "https://dev-schema.ngotag.com/schemas/c7952a0a-e9b5-4a4b-a714-1e5d0a1ae076",
                  },
                ],
                constraints: {
                  fields: [
                    {
                      path: ["$.credentialSubject['ID Type']"],
                    },
                  ],
                },
              },
              {
                id: "input_1",
                schema: [
                  {
                    uri: "https://dev-schema.ngotag.com/schemas/c7952a0a-e9b5-4a4b-a714-1e5d0a1ae076",
                  },
                ],
                constraints: {
                  fields: [
                    {
                      path: ["$.credentialSubject['ID Number']"],
                    },
                  ],
                },
              },
            ],
          },
          options: {
            challenge: "400154574282395709577071",
          },
        },
      },
    };
  } catch (error) {
    console.error("API call failed:", error);
    throw new Error("Unable to fetch proof request list");
  }
};

export const getProofCredentialMatchTest = async () => {
  try {
    return {
      proofFormats: {
        presentationExchange: {
          requirements: [
            {
              rule: "pick",
              needsCount: 1,
              submissionEntry: [
                {
                  inputDescriptorId: "input_0",
                  verifiableCredentials: [
                    {
                      type: "ldp_vc",
                      credentialRecord: {
                        _tags: {
                          claimFormat: "ldp_vc",
                          contexts: [
                            "https://dev-schema.ngotag.com/schemas/c7952a0a-e9b5-4a4b-a714-1e5d0a1ae076",
                            "https://www.w3.org/2018/credentials/v1",
                          ],
                          expandedTypes: [
                            "Foundational ID",
                            "https://www.w3.org/2018/credentials#VerifiableCredential",
                          ],
                          issuerId:
                            "did:polygon:testnet:0xEc2141225C72193473DA7ca23223c2163828efC6",
                          proofTypes: ["EcdsaSecp256k1Signature2019"],
                          subjectIds: [
                            "did:key:z6MkfXrL2iiTweAvyqwY6Ri8a4vrbiHQVYnvdFbXDsdEHZ6e",
                          ],
                          types: ["Foundational ID", "VerifiableCredential"],
                        },
                        metadata: {},
                        id: "d848ad67-99f5-49bf-bf15-number1 dark",
                        createdAt: "2025-04-14T14:29:27.444Z",
                        credential: {
                          "@context": [
                            "https://www.w3.org/2018/credentials/v1",
                            "https://dev-schema.ngotag.com/schemas/c7952a0a-e9b5-4a4b-a714-1e5d0a1ae076",
                          ],
                          type: ["VerifiableCredential", "Foundational ID"],
                          issuer: {
                            id: "did:polygon:testnet:0xEc2141225C72193473DA7ca23223c2163828efC6",
                          },
                          issuanceDate: "2025-04-14T14:29:21.802Z",
                          credentialSubject: {
                            "Full Name": "Tashi  Namgay",
                            "Blood Type": "A+",
                            "Date of Birth": "05/06/2001",
                            Gender: "Male",
                            "ID Type": "Citizenship",
                            "ID Number": "Number 1 Dark",
                            Citizenship: "Bhutanese",
                            revocation_id:
                              "7221f4aa-a38b-4e8e-8613-f4ac6eec110e",
                            id: "did:key:z6MkfXrL2iiTweAvyqwY6Ri8a4vrbiHQVYnvdFbXDsdEHZ6e",
                          },
                          proof: {
                            verificationMethod:
                              "did:polygon:testnet:0xEc2141225C72193473DA7ca23223c2163828efC6#key-1",
                            type: "EcdsaSecp256k1Signature2019",
                            created: "2025-04-14T14:29:25Z",
                            proofPurpose: "assertionMethod",
                            jws: "eyJhbGciOiJFY0RTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..YmGIT31omCVeh_F2MYOvvwUAbQ0ujM5Pm-vg7yAxVa9ZlRBcDLLP0P1TigNqN9IIDe7xzmhITCjWGCImmNUP-w",
                          },
                        },
                        updatedAt: "2025-04-14T14:29:27.444Z",
                      },
                      orgLogo: "/images/ndilogodark.svg",
                      label: "CW Foundation Issuer",
                      revocationstatus: "NEW",
                    },
                    {
                      type: "ldp_vc",
                      credentialRecord: {
                        _tags: {
                          claimFormat: "ldp_vc",
                          contexts: [
                            "https://dev-schema.ngotag.com/schemas/c7952a0a-e9b5-4a4b-a714-1e5d0a1ae076",
                            "https://www.w3.org/2018/credentials/v1",
                          ],
                          expandedTypes: [
                            "Foundational ID",
                            "https://www.w3.org/2018/credentials#VerifiableCredential",
                          ],
                          issuerId:
                            "did:polygon:testnet:0xEc2141225C72193473DA7ca23223c2163828efC6",
                          proofTypes: ["EcdsaSecp256k1Signature2019"],
                          subjectIds: [
                            "did:key:z6MkfXrL2iiTweAvyqwY6Ri8a4vrbiHQVYnvdFbXDsdEHZ6e",
                          ],
                          types: ["Foundational ID", "VerifiableCredential"],
                        },
                        metadata: {},
                        id: "d848ad67-99f5-49bf-bf15-number2 light",
                        createdAt: "2025-04-14T14:29:27.444Z",
                        credential: {
                          "@context": [
                            "https://www.w3.org/2018/credentials/v1",
                            "https://dev-schema.ngotag.com/schemas/c7952a0a-e9b5-4a4b-a714-1e5d0a1ae076",
                          ],
                          type: ["VerifiableCredential", "Foundational ID"],
                          issuer: {
                            id: "did:polygon:testnet:0xEc2141225C72193473DA7ca23223c2163828efC6",
                          },
                          issuanceDate: "2025-04-14T14:29:21.802Z",
                          credentialSubject: {
                            "Full Name": "Tashi  Namgay",
                            "Blood Type": "A+",
                            "Date of Birth": "05/06/2001",
                            Gender: "Male",
                            "ID Type": "Citizenship",
                            "ID Number": "Number 2 Lightt",
                            Citizenship: "Bhutanese",
                            revocation_id:
                              "7221f4aa-a38b-4e8e-8613-f4ac6eec110e",
                            id: "did:key:z6MkfXrL2iiTweAvyqwY6Ri8a4vrbiHQVYnvdFbXDsdEHZ6e",
                          },
                          proof: {
                            verificationMethod:
                              "did:polygon:testnet:0xEc2141225C72193473DA7ca23223c2163828efC6#key-1",
                            type: "EcdsaSecp256k1Signature2019",
                            created: "2025-04-14T14:29:25Z",
                            proofPurpose: "assertionMethod",
                            jws: "eyJhbGciOiJFY0RTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..YmGIT31omCVeh_F2MYOvvwUAbQ0ujM5Pm-vg7yAxVa9ZlRBcDLLP0P1TigNqN9IIDe7xzmhITCjWGCImmNUP-w",
                          },
                        },
                        updatedAt: "2025-04-14T14:29:27.444Z",
                      },
                      orgLogo: "/images/ndilogo.svg",
                      label: "CW Foundation Issuer",
                      revocationstatus: "NEW",
                    },
                    {
                      type: "ldp_vc",
                      credentialRecord: {
                        _tags: {
                          claimFormat: "ldp_vc",
                          contexts: [
                            "https://dev-schema.ngotag.com/schemas/c7952a0a-e9b5-4a4b-a714-1e5d0a1ae076",
                            "https://www.w3.org/2018/credentials/v1",
                          ],
                          expandedTypes: [
                            "Foundational ID",
                            "https://www.w3.org/2018/credentials#VerifiableCredential",
                          ],
                          issuerId:
                            "did:polygon:testnet:0xEc2141225C72193473DA7ca23223c2163828efC6",
                          proofTypes: ["EcdsaSecp256k1Signature2019"],
                          subjectIds: [
                            "did:key:z6MkfXrL2iiTweAvyqwY6Ri8a4vrbiHQVYnvdFbXDsdEHZ6e",
                          ],
                          types: ["Foundational ID", "VerifiableCredential"],
                        },
                        metadata: {},
                        id: "d848ad67-99f5-49bf-bf15-efcbb2eb0ce1",
                        createdAt: "2025-04-14T14:29:27.444Z",
                        credential: {
                          "@context": [
                            "https://www.w3.org/2018/credentials/v1",
                            "https://dev-schema.ngotag.com/schemas/c7952a0a-e9b5-4a4b-a714-1e5d0a1ae076",
                          ],
                          type: ["VerifiableCredential", "Foundational ID"],
                          issuer: {
                            id: "did:polygon:testnet:number 3 default",
                          },
                          issuanceDate: "2025-04-14T14:29:21.802Z",
                          credentialSubject: {
                            "Full Name": "Tashi  Namgay",
                            "Blood Type": "A+",
                            "Date of Birth": "05/06/2001",
                            Gender: "Male",
                            "ID Type": "Citizenship",
                            "ID Number": "number 3 default",
                            Citizenship: "Bhutanese",
                            revocation_id:
                              "7221f4aa-a38b-4e8e-8613-f4ac6eec110e",
                            id: "did:key:z6MkfXrL2iiTweAvyqwY6Ri8a4vrbiHQVYnvdFbXDsdEHZ6e",
                          },
                          proof: {
                            verificationMethod:
                              "did:polygon:testnet:0xEc2141225C72193473DA7ca23223c2163828efC6#key-1",
                            type: "EcdsaSecp256k1Signature2019",
                            created: "2025-04-14T14:29:25Z",
                            proofPurpose: "assertionMethod",
                            jws: "eyJhbGciOiJFY0RTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..YmGIT31omCVeh_F2MYOvvwUAbQ0ujM5Pm-vg7yAxVa9ZlRBcDLLP0P1TigNqN9IIDe7xzmhITCjWGCImmNUP-w",
                          },
                        },
                        updatedAt: "2025-04-14T14:29:27.444Z",
                      },
                      orgLogo: null,
                      label: "CW Foundation Issuer",
                      revocationstatus: "NEW",
                    },
                  ],
                },
              ],
              isRequirementSatisfied: true,
            },
            {
              rule: "pick",
              needsCount: 1,
              submissionEntry: [
                {
                  inputDescriptorId: "input_1",
                  verifiableCredentials: [
                    {
                      type: "ldp_vc",
                      credentialRecord: {
                        _tags: {
                          claimFormat: "ldp_vc",
                          contexts: [
                            "https://dev-schema.ngotag.com/schemas/c7952a0a-e9b5-4a4b-a714-1e5d0a1ae076",
                            "https://www.w3.org/2018/credentials/v1",
                          ],
                          expandedTypes: [
                            "Foundational ID",
                            "https://www.w3.org/2018/credentials#VerifiableCredential",
                          ],
                          issuerId:
                            "did:polygon:testnet:0xEc2141225C72193473DA7ca23223c2163828efC6",
                          proofTypes: ["EcdsaSecp256k1Signature2019"],
                          subjectIds: [
                            "did:key:z6MkfXrL2iiTweAvyqwY6Ri8a4vrbiHQVYnvdFbXDsdEHZ6e",
                          ],
                          types: ["Foundational ID", "VerifiableCredential"],
                        },
                        metadata: {},
                        id: "d848ad67-99f5-49bf-bf15-efcbb2eb0ce1",
                        createdAt: "2025-04-14T14:29:27.444Z",
                        credential: {
                          "@context": [
                            "https://www.w3.org/2018/credentials/v1",
                            "https://dev-schema.ngotag.com/schemas/c7952a0a-e9b5-4a4b-a714-1e5d0a1ae076",
                          ],
                          type: ["VerifiableCredential", "Foundational ID"],
                          issuer: {
                            id: "did:polygon:testnet:0xEc2141225C72193473DA7ca23223c2163828efC6",
                          },
                          issuanceDate: "2025-04-14T14:29:21.802Z",
                          credentialSubject: {
                            "Full Name": "Tashi  Namgay",
                            "Blood Type": "A+",
                            "Date of Birth": "05/06/2001",
                            Gender: "Male",
                            "ID Type": "Citizenship",
                            "ID Number": "11503000205",
                            Citizenship: "Bhutanese",
                            revocation_id:
                              "7221f4aa-a38b-4e8e-8613-f4ac6eec110e",
                            id: "did:key:z6MkfXrL2iiTweAvyqwY6Ri8a4vrbiHQVYnvdFbXDsdEHZ6e",
                          },
                          proof: {
                            verificationMethod:
                              "did:polygon:testnet:0xEc2141225C72193473DA7ca23223c2163828efC6#key-1",
                            type: "EcdsaSecp256k1Signature2019",
                            created: "2025-04-14T14:29:25Z",
                            proofPurpose: "assertionMethod",
                            jws: "eyJhbGciOiJFY0RTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..YmGIT31omCVeh_F2MYOvvwUAbQ0ujM5Pm-vg7yAxVa9ZlRBcDLLP0P1TigNqN9IIDe7xzmhITCjWGCImmNUP-w",
                          },
                        },
                        updatedAt: "2025-04-14T14:29:27.444Z",
                      },
                      orgLogo: null,
                      label: "CW Foundation Issuer",
                      revocationstatus: "NEW",
                    },
                  ],
                },
              ],
              isRequirementSatisfied: true,
            },
          ],
          areRequirementsSatisfied: true,
          name: "Foundational ID",
          purpose: "auth_standard",
        },
      },
    };
  } catch (error) {
    console.error("Mock response error:", error);
    throw new Error("Unable to generate mock credential match data");
  }
};
