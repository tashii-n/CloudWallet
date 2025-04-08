import { getAuthData, getValidCloudAccessToken } from "../auth/auth";
import { CONFIG } from "../constants";
import { encryptPayload, decryptPayload } from "../cryptography/dataCrypt.js";
import axios, { AxiosRequestConfig } from "axios";
import { v4 as uuidv4 } from "uuid";
import { secureGet } from "../storage/storage";

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

    console.log("🚀 ~ loginAPI ~ transformedData:", transformedData);

    // Encrypt the transformed data
    const encryptedData = await encryptPayload(
      secretKey,
      JSON.stringify(transformedData)
    );
    console.log("🚀 ~ loginAPI ~ encryptedData:", encryptedData);

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

    const responsePayload = response?.data.data;
    console.log("🚀 ~ loginAPI ~ responsePayload:", responsePayload);

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

export const getCredentialDetailsAPI = async (credentialRecordId: string) => {
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
    const url = `${apiUrl}/cloud-wallet/v1/credential?credentialRecordId=${credentialRecordId}`; // Assuming this is the correct endpoint

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

export const refreshToken = async () => {
  try {
    const apiUrl = CONFIG.BASE_API_URL;
    if (!apiUrl) {
      throw new Error("API URL is missing in environment variables");
    }

    // Get accessToken and refreshToken from secure storage
    const accessToken = secureGet("accessToken");
    const refreshToken = secureGet("refreshToken");

    if (!accessToken) {
      throw new Error("Access token is missing");
    }
    if (!refreshToken) {
      throw new Error("Refresh token is missing");
    }

    // Construct headers with access token
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    // Prepare request body
    const requestData = {
      refreshToken: refreshToken,
    };

    // Prepare API request configuration
    const config: AxiosRequestConfig = {
      method: "post",
      url: `${apiUrl}/cloud-wallet/v1/user/refresh-token`,
      headers: headers,
      data: requestData,
    };

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
                            "did:polygon:testnet:0xC3294C6b77b4FA859aFF744DFb8AE572a1ed3E80",
                          proofTypes: ["EcdsaSecp256k1Signature2019"],
                          subjectIds: [
                            "did:key:z6Mkq35NoZK4a5cc31T7MwZf1V3VCe7tcB7R3wMdc3frgBJj",
                          ],
                          types: ["Foundational ID", "VerifiableCredential"],
                        },
                        metadata: {},
                        id: "b52a5b97-c08b-4bce-b6a0-input_00",
                        createdAt: "2025-01-30T06:56:16.067Z",
                        credential: {
                          "@context": [
                            "https://www.w3.org/2018/credentials/v1",
                            "https://dev-schema.ngotag.com/schemas/c7952a0a-e9b5-4a4b-a714-1e5d0a1ae076",
                          ],
                          type: ["VerifiableCredential", "Foundational ID"],
                          issuer: {
                            id: "did:polygon:testnet:0xC3294C6b77b4FA859aFF744DFb8AE572a1ed3E80",
                          },
                          issuanceDate: "2025-01-30T06:53:19.457Z",
                          credentialSubject: {
                            "Full Name": "Sagar Khole",
                            "Blood Type": "AB-",
                            "Date of Birth": "19/07/1998",
                            Gender: "Male",
                            "ID Type": "Citizenship",
                            "ID Number": "0223",
                            Citizenship: "Bhutanese",
                            revocation_id:
                              "889fcdcb-0da9-4095-b93a-bca24526058b",
                            id: "did:key:z6Mkq35NoZK4a5cc31T7MwZf1V3VCe7tcB7R3wMdc3frgBJj",
                          },
                          proof: {
                            verificationMethod:
                              "did:polygon:testnet:0xC3294C6b77b4FA859aFF744DFb8AE572a1ed3E80#key-1",
                            type: "EcdsaSecp256k1Signature2019",
                            created: "2025-01-30T06:56:13Z",
                            proofPurpose: "assertionMethod",
                            jws: "eyJhbGciOiJFY0RTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..6yuqJ95UbdqRSFshG6AhbxtCRmi08MLoX-ntLOkZfUdyzexEGy9YpLOSeuJGCm3cDLwBPWoHRDxC6Tm43WH6Pg",
                          },
                        },
                        updatedAt: "2025-01-30T06:56:16.067Z",
                      },
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
                            "did:polygon:testnet:0xC3294C6b77b4FA859aFF744DFb8AE572a1ed3E80",
                          proofTypes: ["EcdsaSecp256k1Signature2019"],
                          subjectIds: [
                            "did:key:z6Mkq35NoZK4a5cc31T7MwZf1V3VCe7tcB7R3wMdc3frgBJj",
                          ],
                          types: ["Foundational ID", "VerifiableCredential"],
                        },
                        metadata: {},
                        id: "b52a5b97-c08b-4bce-b6a0-soso",
                        createdAt: "2025-01-30T06:56:16.067Z",
                        credential: {
                          "@context": [
                            "https://www.w3.org/2018/credentials/v1",
                            "https://dev-schema.ngotag.com/schemas/c7952a0a-e9b5-4a4b-a714-1e5d0a1ae076",
                          ],
                          type: ["VerifiableCredential", "Foundational ID"],
                          issuer: {
                            id: "did:polygon:testnet:0xC3294C6b77b4FA859aFF744DFb8AE572a1ed3E80",
                          },
                          issuanceDate: "2025-01-30T06:53:19.457Z",
                          credentialSubject: {
                            "Full Name": "Sagar Khole",
                            "Blood Type": "AB-",
                            "Date of Birth": "19/07/1998",
                            Gender: "Male",
                            "ID Type": "soso",
                            "ID Number": "0223",
                            Citizenship: "Bhutanese",
                            revocation_id:
                              "889fcdcb-0da9-4095-b93a-bca24526058b",
                            id: "did:key:z6Mkq35NoZK4a5cc31T7MwZf1V3VCe7tcB7R3wMdc3frgBJj",
                          },
                          proof: {
                            verificationMethod:
                              "did:polygon:testnet:0xC3294C6b77b4FA859aFF744DFb8AE572a1ed3E80#key-1",
                            type: "EcdsaSecp256k1Signature2019",
                            created: "2025-01-30T06:56:13Z",
                            proofPurpose: "assertionMethod",
                            jws: "eyJhbGciOiJFY0RTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..6yuqJ95UbdqRSFshG6AhbxtCRmi08MLoX-ntLOkZfUdyzexEGy9YpLOSeuJGCm3cDLwBPWoHRDxC6Tm43WH6Pg",
                          },
                        },
                        updatedAt: "2025-01-30T06:56:16.067Z",
                      },
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
                            "did:polygon:testnet:0xC3294C6b77b4FA859aFF744DFb8AE572a1ed3E80",
                          proofTypes: ["EcdsaSecp256k1Signature2019"],
                          subjectIds: [
                            "did:key:z6Mkq35NoZK4a5cc31T7MwZf1V3VCe7tcB7R3wMdc3frgBJj",
                          ],
                          types: ["Foundational ID", "VerifiableCredential"],
                        },
                        metadata: {},
                        id: "9a048b77-c909-468f-8f67-f5e099ad5f98",
                        createdAt: "2025-01-30T11:47:19.818Z",
                        credential: {
                          "@context": [
                            "https://www.w3.org/2018/credentials/v1",
                            "https://dev-schema.ngotag.com/schemas/c7952a0a-e9b5-4a4b-a714-1e5d0a1ae076",
                          ],
                          type: ["VerifiableCredential", "Foundational ID"],
                          issuer: {
                            id: "did:polygon:testnet:0xC3294C6b77b4FA859aFF744DFb8AE572a1ed3E80",
                          },
                          issuanceDate: "2025-01-30T11:46:48.042Z",
                          credentialSubject: {
                            "Full Name": "Sagar Khole",
                            "Blood Type": "AB-",
                            "Date of Birth": "19/07/1998",
                            Gender: "Male",
                            "ID Type": "Citizenship",
                            "ID Number": "0223",
                            Citizenship: "Bhutanese",
                            revocation_id:
                              "18323f50-897f-42fa-8336-925d58439745",
                            id: "did:key:z6Mkq35NoZK4a5cc31T7MwZf1V3VCe7tcB7R3wMdc3frgBJj",
                          },
                          proof: {
                            verificationMethod:
                              "did:polygon:testnet:0xC3294C6b77b4FA859aFF744DFb8AE572a1ed3E80#key-1",
                            type: "EcdsaSecp256k1Signature2019",
                            created: "2025-01-30T11:47:17Z",
                            proofPurpose: "assertionMethod",
                            jws: "eyJhbGciOiJFY0RTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19.._ifGjy4co4y8Kf4lcq5sRND68bnvvm32jmokJgi7bW4ngeVcg2YOwFzfa5fIZr6IjolLKOEUCg5d4U6Hw76tfQ",
                          },
                        },
                        updatedAt: "2025-01-30T11:47:19.818Z",
                      },
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
                            "did:polygon:testnet:0xC3294C6b77b4FA859aFF744DFb8AE572a1ed3E80",
                          proofTypes: ["EcdsaSecp256k1Signature2019"],
                          subjectIds: [
                            "did:key:z6Mkq35NoZK4a5cc31T7MwZf1V3VCe7tcB7R3wMdc3frgBJj",
                          ],
                          types: ["Foundational ID", "VerifiableCredential"],
                        },
                        metadata: {},
                        id: "9a048b77-c909-468f-8f67-lsdkjfsldkj",
                        createdAt: "2025-01-30T11:47:19.818Z",
                        credential: {
                          "@context": [
                            "https://www.w3.org/2018/credentials/v1",
                            "https://dev-schema.ngotag.com/schemas/c7952a0a-e9b5-4a4b-a714-1e5d0a1ae076",
                          ],
                          type: ["VerifiableCredential", "Foundational ID"],
                          issuer: {
                            id: "did:polygon:testnet:0xC3294C6b77b4FA859aFF744DFb8AE572a1ed3E80",
                          },
                          issuanceDate: "2025-01-30T11:46:48.042Z",
                          credentialSubject: {
                            "Full Name": "Sagar Khole",
                            "Blood Type": "AB-",
                            "Date of Birth": "19/07/1998",
                            Gender: "Male",
                            "ID Type": "ldskfjslkdfj",
                            "ID Number": "lfdksjflskfs",
                            Citizenship: "Bhutanese",
                            revocation_id:
                              "18323f50-897f-42fa-8336-925d58439745",
                            id: "did:key:z6Mkq35NoZK4a5cc31T7MwZf1V3VCe7tcB7R3wMdc3frgBJj",
                          },
                          proof: {
                            verificationMethod:
                              "did:polygon:testnet:0xC3294C6b77b4FA859aFF744DFb8AE572a1ed3E80#key-1",
                            type: "EcdsaSecp256k1Signature2019",
                            created: "2025-01-30T11:47:17Z",
                            proofPurpose: "assertionMethod",
                            jws: "eyJhbGciOiJFY0RTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19.._ifGjy4co4y8Kf4lcq5sRND68bnvvm32jmokJgi7bW4ngeVcg2YOwFzfa5fIZr6IjolLKOEUCg5d4U6Hw76tfQ",
                          },
                        },
                        updatedAt: "2025-01-30T11:47:19.818Z",
                      },
                    },
                  ],
                },
              ],
              isRequirementSatisfied: true,
            },
          ],
          areRequirementsSatisfied: true,
          name: "PERMANENT_ADDRESS",
          purpose: "auth_standard",
        },
      },
    };
  } catch (error) {
    console.error("Mock response error:", error);
    throw new Error("Unable to generate mock credential match data");
  }
};
