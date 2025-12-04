import { getAuthData, getValidCloudAccessToken } from "../auth/auth";
import { CONFIG, CONNECTION_TYPES } from "../constants";
import { encryptPayload, decryptPayload } from "../cryptography/dataCrypt.js";
import axios, { AxiosRequestConfig } from "axios";
import { v4 as uuidv4 } from "uuid";
import { secureGet } from "../storage/storage";
import "./axiosInterceptor"; // Adjust path as needed

export const onboardingValidateAPI = async (jsonData: Record<string, any>) => {
  try {
    const sessionId = sessionStorage.getItem("sessionId"); // tab-specific

    if (!sessionId) {
      throw new Error("No sessionId found for this tab");
    }

    const response = await fetch("/api/onboarding/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-session-id": sessionId, // pass session ID to server
      },
      body: JSON.stringify(jsonData),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API call failed:", error);
    throw new Error("Unable to call onboarding API");
  }
};

export const onboardingBiometricAPI = async (jsonData: Record<string, any>) => {
  try {
    const sessionId = sessionStorage.getItem("sessionId");
    if (!sessionId) {
      throw new Error("No session ID found for this tab");
    }

    const response = await fetch("/api/onboarding/biometric", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-session-id": sessionId, // pass per-tab session ID
      },
      body: JSON.stringify(jsonData),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(errorBody.error || "Server-side API failed");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Client API call failed:", error);
    throw new Error("Unable to call server-side onboarding API");
  }
};

export const onboardingRegisterAPI = async (jsonData: Record<string, any>) => {
  try {
    const sessionId = sessionStorage.getItem("sessionId");
    if (!sessionId) {
      throw new Error("No session ID found for this tab");
    }

    const response = await fetch("/api/onboarding/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-session-id": sessionId,
      },
      body: JSON.stringify(jsonData),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(errorBody.error || "Server-side API failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Client API call failed:", error);
    throw new Error("Unable to call server-side register API");
  }
};

// CLOUD APIs
export const onboardingWalletCreationAPI = async (
  jsonData: Record<string, any>
) => {
  try {
    const sessionId = sessionStorage.getItem("sessionId");
    if (!sessionId) {
      throw new Error("No session ID found for this tab");
    }

    const response = await fetch("/api/onboarding/wallet-creation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-session-id": sessionId,
      },
      body: JSON.stringify(jsonData),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(errorBody.error || "Server-side API failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Client API call failed:", error);
    throw new Error("Unable to call server-side create-wallet API");
  }
};

export const onboardingDIDAPI = async () => {
  try {
    const sessionId = sessionStorage.getItem("sessionId");
    if (!sessionId) throw new Error("No session ID found for this tab");

    const response = await fetch("/api/onboarding/did", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-session-id": sessionId,
      },
    });

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(errorBody.error || "Server-side API failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Client DID API call failed:", error);
    throw new Error("Unable to call server-side DID API");
  }
};

export const onboardingGetDIDAPI = async () => {
  try {
    const sessionId = sessionStorage.getItem("sessionId");
    if (!sessionId) throw new Error("No session ID found for this tab");

    const response = await fetch("/api/get-did", {
      method: "GET",
      headers: {
        "x-session-id": sessionId,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(errorBody.error || "Server-side API failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Client Get DID API call failed:", error);
    throw new Error("Unable to call server-side Get DID API");
  }
};

export const onboardingInitialCredentialsAPI = async (
  jsonData: Record<string, any>
) => {
  try {
    const sessionId = sessionStorage.getItem("sessionId");
    if (!sessionId) throw new Error("No session ID found for this tab");

    const response = await fetch("/api/onboarding/initial-credentials", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-session-id": sessionId,
      },
      body: JSON.stringify(jsonData),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Server returned ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error("Client onboardingInitialCredentialsAPI failed:", err);
    throw err;
  }
};

export const acceptCredentialAPI = async (
  jsonData: Record<string, any>,
  isRevocation?: boolean
) => {
  try {
    const sessionId = sessionStorage.getItem("sessionId");
    if (!sessionId) throw new Error("No session ID found for this tab");

    const response = await fetch("/api/receive-invitation-url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-session-id": sessionId,
      },
      body: JSON.stringify({ jsonData, isRevocation }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Server returned ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error("Client acceptCredentialAPI failed:", err);
    throw err;
  }
};

export const loginAPI = async (jsonData: Record<string, any>) => {
  try {
    const sessionId = sessionStorage.getItem("sessionId");
    if (!sessionId) throw new Error("No session ID found for this tab");

    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-session-id": sessionId,
      },
      body: JSON.stringify(jsonData),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Server returned ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error("Client loginAPI failed:", err);
    throw err;
  }
};

export const getCredentialListAPI = async (params: {
  tenantId: string;
  status?: string;
  take: number;
  skip: number;
}) => {
  try {
    const sessionId = sessionStorage.getItem("sessionId");
    if (!sessionId) throw new Error("No session ID found for this tab");

    const response = await fetch("/api/get-credential-list", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-session-id": sessionId,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Server returned ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error("Client getCredentialListAPI failed:", err);
    throw err;
  }
};

export const getCredentialDetailsAPI = async (
  credentialRecordId: string,
  selfAttested?: boolean
) => {
  const sessionId = sessionStorage.getItem("sessionId");
  if (!sessionId) throw new Error("No session ID found for this tab");

  const query = new URLSearchParams({ credentialRecordId });
  if (selfAttested !== undefined)
    query.append("selfAttested", String(selfAttested));

  const res = await fetch(`/api/credential-details?${query.toString()}`, {
    method: "GET",
    headers: {
      "x-session-id": sessionId || "",
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Server returned ${res.status}`);
  }

  return res.json();
};

export const getRevocationCredentialAPI = async (params: {
  holderDID: string;
  revocationId: string;
}) => {
  try {
    const sessionId = sessionStorage.getItem("sessionId");
    if (!sessionId) throw new Error("No session ID found for this tab");

    const response = await fetch("/api/get-revocation-credential", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-session-id": sessionId,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Server returned ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error("Client getRevocationCredentialAPI failed:", err);
    throw err;
  }
};

export const refreshToken = async (refreshToken: string) => {
  try {
    const sessionId = sessionStorage.getItem("sessionId");
    if (!sessionId) throw new Error("No sessionId found");

    const response = await fetch("/api/refresh-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-session-id": sessionId,
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || "Failed to refresh token");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Client refresh token failed:", error);
    throw error;
  }
};

export const getProofRequestListAPI = async (params: {
  tenantId: string;
  status: string;
  take: number;
  skip: number;
}) => {
  try {
    const sessionId = sessionStorage.getItem("sessionId");
    if (!sessionId) throw new Error("No sessionId found");

    const queryParams = new URLSearchParams({
      tenantId: params.tenantId,
      status: params.status,
      take: params.take.toString(),
      skip: params.skip.toString(),
    });

    const response = await fetch(
      `/api/proof-request-list?${queryParams.toString()}`,
      {
        method: "GET",
        headers: { "x-session-id": sessionId },
      }
    );

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || "Failed to fetch proof requests");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("getProofRequestListAPI failed:", error);
    throw error;
  }
};

export const getProofPresentationAPI = async (proofRecordId: string) => {
  try {
    const sessionId = sessionStorage.getItem("sessionId");
    if (!sessionId) throw new Error("No sessionId found");

    const queryParams = new URLSearchParams({ proofRecordId });

    const response = await fetch(
      `/api/proof-presentation?${queryParams.toString()}`,
      {
        method: "GET",
        headers: { "x-session-id": sessionId },
      }
    );

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(
        errData.error || "Failed to fetch proof presentation details"
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("getProofPresentationAPI failed:", error);
    throw error;
  }
};

export const getCredentialsForRequestAPI = async (proofRecordId: string) => {
  try {
    const sessionId = sessionStorage.getItem("sessionId");
    if (!sessionId) throw new Error("No sessionId found");

    const response = await fetch(
      `/api/credentials-for-request/${proofRecordId}`,
      {
        method: "GET",
        headers: { "x-session-id": sessionId },
      }
    );

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(
        errData.error || "Failed to fetch credentials for request"
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("getCredentialsForRequestAPI failed:", error);
    throw error;
  }
};

export const acceptProofRequestAPI = async (payload: Record<string, any>) => {
  try {
    const sessionId = sessionStorage.getItem("sessionId");
    if (!sessionId) {
      throw new Error("No sessionId found");
    }

    const response = await fetch("/api/accept-proof-request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-session-id": sessionId,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Unable to accept proof request");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Client acceptProofRequestAPI failed:", error);
    throw error;
  }
};

export const declineProofRequestAPI = async (proofRecordId: string) => {
  try {
    const sessionId = sessionStorage.getItem("sessionId");
    if (!sessionId) {
      throw new Error("No sessionId found");
    }

    const response = await fetch("/api/decline-proof-request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-session-id": sessionId,
      },
      body: JSON.stringify({ proofRecordId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Unable to reject proof request");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Client declineProofRequestAPI failed:", error);
    throw error;
  }
};

export const getConnectionsAPI = async () => {
  try {
    const sessionId = sessionStorage.getItem("sessionId");
    if (!sessionId) {
      throw new Error("No sessionId found");
    }

    const response = await fetch("/api/get-connections", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-session-id": sessionId,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Unable to get connections");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Client getConnectionsAPI failed:", error);
    throw error;
  }
};

export const getPermanentAddressAPI = async () => {
  try {
    const sessionId = sessionStorage.getItem("sessionId"); // Add sessionId
    if (!sessionId) {
      throw new Error("No sessionId found");
    }
    const response = await fetch("/api/get-permanent-address", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-session-id": sessionId,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Unable to issue permanent address");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Client getPermanentAddressAPI failed:", error);
    throw error;
  }
};

export const addSelfAttestedAPI = async (
  payload: Record<string, any>,
  credentialType: string
) => {
  try {
    const sessionId = sessionStorage.getItem("sessionId");
    if (!sessionId) {
      throw new Error("No sessionId found");
    }
    const response = await fetch("/api/add-self-attested", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-session-id": sessionId,
      },
      body: JSON.stringify({ payload, credentialType }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Unable to add credential");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Client addSelfAttestedAPI failed:", error);
    throw error;
  }
};

export const deleteCredential = async (
  credentialRecordId: string,
  isSelfAttested: boolean
) => {
  try {
    const sessionId = sessionStorage.getItem("sessionId");
    if (!sessionId) {
      throw new Error("No sessionId found");
    }
    const response = await fetch("/api/delete-credential", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-session-id": sessionId,
      },
      body: JSON.stringify({ credentialRecordId, isSelfAttested }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Unable to delete credential");
    }

    return await response.json();
  } catch (error) {
    console.error("Client deleteCredential failed:", error);
    throw error;
  }
};

export const getCloudWalletStatus = async () => {
  try {
    const sessionId = sessionStorage.getItem("sessionId");
    if (!sessionId) throw new Error("No session ID found for this tab");

    const res = await fetch("/api/wallet-status", {
      method: "GET",
      headers: {
        "x-session-id": sessionId,
      },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Server returned ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error("Client getCloudWalletStatusAPI failed:", err);
    throw err;
  }
};

export const isUserAuthenticated = async () => {
  const sessionId = sessionStorage.getItem("sessionId");
  if (!sessionId) throw new Error("No session ID found for this tab");

  const res = await fetch("/api/auth/check-session", {
    method: "GET",
    headers: {
      "x-session-id": sessionId,
    },
    cache: "no-store",
  });

  if (!res.ok) return false;

  const json = await res.json();
  return json.authenticated === true;
};
