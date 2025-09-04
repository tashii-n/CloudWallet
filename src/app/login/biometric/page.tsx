"use client";

import Footer from "@/app/components/LandingPageMain/Footer/footer";
import Header from "@/app/components/LandingPageMain/Header/Header";
import { Backdrop, Box, Button, Grid2, Stack, Typography } from "@mui/material";
import Image from "next/image";
import React, { useState, useRef, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { secureClear, secureGet, secureStore } from "@/app/lib/storage/storage";
import {
  acceptCredentialAPI,
  getCloudWalletStatus,
  getCredentialListAPI,
  getRevocationCredentialAPI,
  loginAPI,
  onboardingBiometricAPI,
  onboardingDIDAPI,
  onboardingGetDIDAPI,
  onboardingInitialCredentialsAPI,
  onboardingWalletCreationAPI,
} from "@/app/lib/api_utils/onboardingAPI";
import { retryAPI } from "@/app/lib/api_utils/helperFunction";
import { storeCloudAuth } from "@/app/lib/auth/auth";
import Link from "next/link";
import OnboardingFormPopup from "@/app/components/LoginSignup/loginSignup";

const FaceLivenessDynamic = dynamic(
  () => import("@/app/components/Liveness/Liveness"),
  { ssr: false }
);

export default function BiometricPage() {
  const router = useRouter();
  const [showLiveness, setShowLiveness] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginFailed, setLoginFailed] = useState(false);
  const [showOnboardingForm, setShowOnboardingForm] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<
    "NONE" | "DID_FAIL" | "FOUNDATIONAL_ID_FAIL"
  >("NONE");

  // Use refs for cleanup and preventing race conditions
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);
  const apiInProgressRef = useRef(false);
  const maxRetries = 2;

  // Cleanup function
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    timeoutRefs.current.forEach((timeout) => clearTimeout(timeout));
    timeoutRefs.current = [];
    apiInProgressRef.current = false;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Safe session storage with error handling
  const safeSessionStorage = {
    getItem: (key: string): string | null => {
      try {
        return sessionStorage.getItem(key);
      } catch (error) {
        console.error(`Failed to get ${key} from session storage:`, error);
        return null;
      }
    },
    setItem: (key: string, value: string): boolean => {
      try {
        sessionStorage.setItem(key, value);
        return true;
      } catch (error) {
        console.error(`Failed to set ${key} in session storage:`, error);
        return false;
      }
    },
    removeItem: (key: string): void => {
      try {
        sessionStorage.removeItem(key);
      } catch (error) {
        console.error(`Failed to remove ${key} from session storage:`, error);
      }
    },
  };

  // Safe delay with cleanup
  const safeDelay = (ms: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(resolve, ms);
      timeoutRefs.current.push(timeout);

      if (abortControllerRef.current) {
        abortControllerRef.current.signal.addEventListener("abort", () => {
          clearTimeout(timeout);
          reject(new Error("Operation aborted"));
        });
      }
    });
  };

  /**
   * 🔹 Run biometric validation (with retries and proper error handling)
   */
  const fetchBiometricValidation = async (attempt = 1): Promise<any> => {
    if (apiInProgressRef.current) {
      throw new Error("Biometric validation already in progress");
    }

    try {
      apiInProgressRef.current = true;

      const onboardingDataString = await secureGet("onboardingData");
      const onboardingData = onboardingDataString
        ? JSON.parse(onboardingDataString)
        : null;

      if (!onboardingData) {
        throw new Error("No onboarding data found in secure storage");
      }

      const imageData = safeSessionStorage.getItem("imageData");
      if (!imageData) {
        throw new Error("No image data found in session storage");
      }

      const requestData = {
        idNumber: onboardingData["ID Number"],
        idType: onboardingData["ID Type"],
        onboardingUniqueId: onboardingData["onboardingUniqueId"],
        image: imageData,
      };

      console.log(
        "🔍 Onboarding Unique ID:",
        onboardingData["onboardingUniqueId"]
      );

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      const response = await onboardingBiometricAPI(requestData);
      console.log("✅ Biometric validation response:", response);

      return response;
    } catch (error) {
      console.error(`Error on attempt ${attempt}:`, error);

      if (attempt < maxRetries && !abortControllerRef.current?.signal.aborted) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`Retrying in ${delay / 1000} seconds...`);

        try {
          await safeDelay(delay);
          return fetchBiometricValidation(attempt + 1);
        } catch (delayError) {
          throw new Error("Operation was cancelled during retry delay");
        }
      } else {
        console.error("❌ Max retries reached or operation aborted.");
        throw error;
      }
    } finally {
      apiInProgressRef.current = false;
    }
  };

  /**
   * 🔹 Liveness Success Handler (improved error handling)
   */
  const handleLivenessSuccess = async (
    livenessResponse: any
  ): Promise<void> => {
    if (isLoading || apiInProgressRef.current) {
      console.warn("Operation already in progress, skipping...");
      return;
    }

    try {
      const imageData = livenessResponse?.images?.[0];
      if (!imageData) {
        throw new Error("No image data found in liveness response");
      }

      if (!safeSessionStorage.setItem("imageData", imageData)) {
        throw new Error("Failed to store image data in session storage");
      }

      const idNumber = await secureGet("idNumber");
      if (!idNumber) {
        throw new Error("ID Number missing from secure storage");
      }

      setIsLoading(true);
      setLoginFailed(false);

      const jsonData = { idNumber, image: imageData };
      const response = await loginAPI(jsonData);

      await storeCloudAuth(
        response.access_token,
        response.expires_in,
        response.refresh_token,
        response.refresh_expires_in
      );

      let responseTenantId, holderDID;

      try {
        // ✅ Try to get DID
        const getDidResponse = await retryAPI(onboardingGetDIDAPI, {});
        responseTenantId = getDidResponse.hashTenantID;
        holderDID = getDidResponse.did;

        await secureStore("tenantId", responseTenantId);
        await secureStore("holderDID", holderDID);
        console.log("✅ Existing wallet found - Tenant ID:", responseTenantId);

        try {
          // 🔍 Fetch credential list
          const credentialList = await getCredentialListForLogin();
          const hasFoundationalId = credentialList.some(
            (cred: any) => cred.name === "Foundational ID"
          );

          if (!hasFoundationalId) {
            console.log("❌ Foundational ID credential not found.");
            setOnboardingStep("FOUNDATIONAL_ID_FAIL");
            setIsLoading(false)
            setShowOnboardingForm(true);
            return;
          }

          console.log("✅ Foundational ID credential found.");
        } catch (err) {
          console.error("Error fetching credential list:", err);
          throw err;
        }
      } catch (didError) {
        // ❌ No DID found, check wallet status
        console.log("❌ No existing DID found, checking wallet status...");

        try {
          const walletStatusResponse = await retryAPI(getCloudWalletStatus, {});
          console.log(
            "🚀 ~ handleLivenessSuccess ~ walletStatusResponse:",
            walletStatusResponse
          );

          if (walletStatusResponse?.status === 404) {
            setOnboardingStep("DID_FAIL");
            setIsLoading(false)
            setShowOnboardingForm(true);
            return;
          } else {
            throw new Error("Wallet exists but DID retrieval failed");
          }
        } catch (walletError) {
          console.error("Failed to check wallet status:", walletError);
          throw new Error("Failed to verify wallet and DID status");
        }
      }

      // 🔀 Redirect after everything is validated
      const redirectUrl =
        safeSessionStorage.getItem("redirectUrl") || "/dashboard";
      safeSessionStorage.removeItem("redirectUrl");
      router.push(redirectUrl);
    } catch (error) {
      console.error("❌ Error in handleLivenessSuccess:", error);
      setShowLiveness(false);
      setLoginFailed(true);
      await secureClear("cloudAuth");
      setIsLoading(false);
    } 
  };

  /**
   * 🔹 Onboarding Success Handler (improved with proper error handling)
   */
  const handleOnboardingSuccess = async (): Promise<void> => {
    if (isLoading || apiInProgressRef.current) {
      console.warn("Onboarding already in progress, skipping...");
      return;
    }

    try {
      setShowOnboardingForm(false);
      setIsLoading(true);
      setLoginFailed(false);

      console.log("🔍 Starting biometric validation...");
      const biometricResult = await fetchBiometricValidation();

      console.log("🚀 ~ handleOnboardingSuccess ~ biometricResult?.scenario:", biometricResult?.scenario)
      if (biometricResult?.scenario === "ONBOARDING_SAME_DEVICE_CLOUD_WALLET") {
        console.log(
          "✅ Biometric validation successful, completing onboarding..."
        );
        await completeOnboardingProcess();
        console.log("🎉 Onboarding complete!");
        router.push("/dashboard");
      } else {
        throw new Error(
          `Biometric validation failed with scenario: ${biometricResult?.scenario || "unknown"}`
        );
      }
    } catch (error) {
      console.error("❌ Error after onboarding success:", error);
      setLoginFailed(true);
      setIsLoading(false);
    } 
  };

  /**
   * 🔹 Onboarding Process (wallet, DID, creds) - improved error handling
   */
  const completeOnboardingProcess = async (): Promise<void> => {
    try {
      if (onboardingStep === "DID_FAIL") {
        console.log("🔧 Creating wallet and DID...");
        await createWalletForLogin();
        await createDIDForLogin();
      }

      // Both flows continue from here
      console.log("🔧 Getting tenant ID and issuing credentials...");
      await getTenantIdForLogin();
      await issueCredentialsForLogin();
      await acceptRevocationCredentialsForLogin();

      console.log("✅ Onboarding process completed successfully");
    } catch (error) {
      console.error("❌ Error during onboarding process:", error);
      setLoginFailed(true);
      throw error; // Re-throw to be handled by caller
    }
  };

  // Helper function for creating wallet during login
  const createWalletForLogin = async (): Promise<any> => {
    try {
      const walletResponse = await retryAPI(onboardingWalletCreationAPI, {
        label: "Credential Wallet",
      });
      console.log("✅ Wallet Created during login:", walletResponse);
      return walletResponse;
    } catch (error) {
      console.error("❌ Failed to create wallet:", error);
      throw new Error("Failed to create wallet during login");
    }
  };

  // Helper function for creating DID during login
  const createDIDForLogin = async (): Promise<string> => {
    try {
      const didResponse = await retryAPI(onboardingDIDAPI, {});
      const holderDID = didResponse.did;

      if (!holderDID) {
        throw new Error("No DID returned from API");
      }

      console.log("✅ New Holder DID created during login:", holderDID);
      await secureStore("holderDID", holderDID);
      return holderDID;
    } catch (error) {
      console.error("❌ Failed to create DID:", error);
      throw new Error("Failed to create DID during login");
    }
  };

  // Helper function for getting tenant ID during login
  const getTenantIdForLogin = async (): Promise<string> => {
    try {
      const getDidResponse = await retryAPI(onboardingGetDIDAPI, {});
      const responseTenantId = getDidResponse.hashTenantID;

      if (!responseTenantId) {
        throw new Error("No tenant ID returned from API");
      }

      console.log("✅ Tenant ID retrieved during login:", responseTenantId);
      await secureStore("tenantId", responseTenantId);
      return responseTenantId;
    } catch (error) {
      console.error("❌ Failed to get tenant ID:", error);
      throw new Error("Failed to retrieve tenant ID during login");
    }
  };

  // Helper function for issuing credentials during login
  const issueCredentialsForLogin = async (): Promise<void> => {
    try {
      const holderDID = await secureGet("holderDID");
      if (!holderDID) {
        throw new Error("Missing holderDID for credential issuance");
      }

      const storedData = await secureGet("onboardingData");
      if (!storedData) {
        console.warn("No onboarding data found, skipping credential issuance");
        return;
      }

      const parsedData = JSON.parse(storedData);
      const payload = {
        ...parsedData,
        credentialType: "jsonld",
        holderDID,
      };

      const credentialsResponse = await retryAPI(
        onboardingInitialCredentialsAPI,
        payload
      );
      console.log("✅ Credentials Issued during login:", credentialsResponse);

      // Accept each issued credential
      if (credentialsResponse?.length) {
        const acceptPromises = credentialsResponse.map(
          async (credential: any) => {
            console.log(
              `Accepting credential during login: ${credential.name}`
            );
            try {
              const acceptResponse = await retryAPI(acceptCredentialAPI, {
                invitationUrl: credential.url,
              });
              console.log(
                `✅ Credential ${credential.name} accepted:`,
                acceptResponse
              );
              return acceptResponse;
            } catch (error) {
              console.error(`❌ Error accepting ${credential.name}:`, error);
              throw error;
            }
          }
        );

        await Promise.all(acceptPromises);
      }
    } catch (error) {
      console.error("❌ Failed to issue credentials:", error);
      throw new Error("Failed to issue credentials during login");
    }
  };

  // Helper function for getting credential list during login
  const getCredentialListForLogin = async (): Promise<any[]> => {
    const tenantId = await secureGet("tenantId");
    if (!tenantId) {
      throw new Error("Missing tenantId for credential list");
    }

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        console.log(
          `⏳ Fetching Credential List... Attempt ${attempts + 1}/${maxAttempts}`
        );

        const credentialListResponse = await getCredentialListAPI({
          tenantId,
          take: 10,
          skip: 0,
        });

        console.log(
          "🚀 ~ getCredentialListForLogin ~ credentialList:",
          credentialListResponse
        );

        if (
          Array.isArray(credentialListResponse) &&
          credentialListResponse.length > 0
        ) {
          console.log("✅ Credential List Found:", credentialListResponse);
          return credentialListResponse;
        }

        if (attempts === maxAttempts - 1) {
          console.warn("⚠️ Credential list empty after all retries");
          return [];
        }

        attempts++;
        await safeDelay(2000);
      } catch (error) {
        console.error(
          `❌ Error fetching credential list (attempt ${attempts + 1}):`,
          error
        );

        if (attempts === maxAttempts - 1) {
          throw new Error("Failed to fetch credential list after all retries");
        }

        attempts++;
        await safeDelay(2000);
      }
    }

    return [];
  };

  // Helper function for accepting revocation credentials during login
  const acceptRevocationCredentialsForLogin = async (): Promise<void> => {
    try {
      const tenantId = await secureGet("tenantId");
      const holderDID = await secureGet("holderDID");

      if (!tenantId || !holderDID) {
        throw new Error("Missing required data for revocation credentials");
      }

      // Wait for credentials to be processed
      await safeDelay(5000);

      const credentialList = await getCredentialListForLogin();

      if (credentialList?.length) {
        const revocationPromises = credentialList
          .filter((credential) => credential.revocationId)
          .map(async (credential) => {
            console.log(`Processing revocation for: ${credential.name}`);

            try {
              const revocationResponse = await retryAPI(
                getRevocationCredentialAPI,
                {
                  holderDID: holderDID,
                  revocationId: credential.revocationId,
                }
              );

              console.log(
                `✅ Revocation credential for ${credential.name}:`,
                revocationResponse
              );

              const invitationUrl = revocationResponse?.credInviteURL;
              if (invitationUrl) {
                const acceptResponse = await retryAPI(acceptCredentialAPI, {
                  invitationUrl,
                });
                console.log(
                  `✅ Revocation credential accepted: ${credential.name}`,
                  acceptResponse
                );
                return acceptResponse;
              } else {
                throw new Error(`Missing credInviteURL for ${credential.name}`);
              }
            } catch (error) {
              console.error(
                `❌ Error with revocation credential for ${credential.name}:`,
                error
              );
              throw error;
            }
          });

        if (revocationPromises.length > 0) {
          await Promise.all(revocationPromises);
        }
      }

      console.log("✅ Complete revocation credential process finished");
    } catch (error) {
      console.error("❌ Failed to accept revocation credentials:", error);
      throw new Error("Failed to accept revocation credentials during login");
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100vh" // Ensures the full height is utilized
    >
      <OnboardingFormPopup
        open={showOnboardingForm}
        onClose={() => setShowOnboardingForm(false)}
        onSuccess={handleOnboardingSuccess}
      />
      <Backdrop open={isLoading} sx={{ color: "#fff", zIndex: 1301 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            padding: 4,
            borderRadius: 2,
          }}
        >
          <Image
            src="/images/spinner.gif"
            width={150}
            height={150}
            alt="Loading..."
            unoptimized
          />
          {/* <Typography variant="h5" color="green" mt={2} textAlign={"center"}>
            Your biometric data is being validated. Please wait...
          </Typography> */}
        </Box>
      </Backdrop>
      <Header />
      <Box
        flex="1"
        display="flex"
        justifyContent="center"
        alignItems="center"
        mt={3}
      >
        <Grid2
          container
          spacing={10}
          justifyContent="center"
          alignItems="stretch" // Ensures children have the same height
          sx={{ width: "100%" }}
        >
          {/* Left Section */}
          <Grid2
            size={{ xs: 12, md: 5 }}
            textAlign="center"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Box
              bgcolor={"secondary.main"}
              color={"#ffffffb5"}
              paddingX={9}
              paddingY={6}
              borderRadius={5}
              width="100%"
            >
              <Typography
                variant="h5"
                color="primary.main"
                fontWeight={600}
                mb={3}
              >
                DIRECTIONS
              </Typography>
              <Typography variant="body2" component="p" mb={3}>
                Before you begin the facial recognition process, please keep the
                following in mind:
              </Typography>
              <Image
                src="/images/biometricavatar.svg"
                width={100}
                height={100}
                alt="Biometric Avatar"
              />
              <Box textAlign="start">
                <Stack direction="row" mt={4} spacing={2} alignItems={"center"}>
                  <Image
                    src="/images/directions1.svg"
                    width={50}
                    height={50}
                    alt="Light Bulb"
                  />
                  <Typography variant="body2">
                    Situate yourself in a spot with good lighting. Avoid dim
                    lighting and excess brightness.
                  </Typography>
                </Stack>
                <Stack direction="row" mt={2} spacing={2} alignItems={"center"}>
                  <Image
                    src="/images/directions2.svg"
                    width={50}
                    height={50}
                    alt="Light Bulb"
                  />
                  <Typography variant="body2">
                    If you’re wearing glasses or frames, take them off.
                  </Typography>
                </Stack>
                <Stack direction="row" mt={2} spacing={2} alignItems={"center"}>
                  <Image
                    src="/images/directions3.svg"
                    width={50}
                    height={50}
                    alt="Light Bulb"
                  />
                  <Typography variant="body2">
                    Follow the instructions provided during the facial scanning
                    procedure. Liveness check simply involves taking a selfie.
                  </Typography>
                </Stack>
              </Box>
            </Box>
          </Grid2>

          {/* Right Section */}
          <Grid2
            size={{ xs: 12, md: 5 }}
            textAlign="center"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Box
              border={"solid green 1px"}
              // paddingY={6}
              borderRadius={5}
              width="100%"
              height="100%"
              display="flex"
              flexDirection="column"
              justifyContent={"center"}
              alignItems={"center"}
            >
              {showLiveness ? (
                <FaceLivenessDynamic
                  onClose={() => setShowLiveness(false)}
                  onLivenessSuccess={handleLivenessSuccess}
                />
              ) : loginFailed ? (
                <>
                  <Typography
                    variant="h6"
                    color="#c43e3d"
                    fontWeight={600}
                    mb={2}
                    letterSpacing={0.2}
                  >
                    LOGIN FAILED !
                  </Typography>
                  <Image
                    src="/images/errorred.svg"
                    width={130}
                    height={130}
                    alt="Login Error Logo"
                  />
                  <Typography variant="body2" mt={3}>
                    Click the button below to try again.
                  </Typography>

                  <br />
                  <Button
                    onClick={() => setShowLiveness(true)}
                    variant="contained"
                    sx={{
                      minWidth: "170px",
                      backgroundColor: "#c43e3d",
                      textTransform: "none",
                      color: "white",
                      minHeight: "44px",
                      borderRadius: "50px",
                    }}
                  >
                    <Typography variant="body2">Try Again</Typography>
                  </Button>
                  <br />

                  <Typography variant="body2" mt={5}>
                    Don't have an account?{" "}
                    <Link href="/signup" className="ndigreen">
                      <strong>Sign Up</strong>
                    </Link>
                  </Typography>
                  <Typography
                    mt={3}
                    variant="caption"
                    bgcolor="#fff7e5"
                    py={1}
                    px={2}
                    borderRadius={5}
                    color="#e6b944"
                  >
                    <strong>
                      Note: If you already have a NDI Mobile Wallet, please
                      continue in the NDI Mobile App.
                    </strong>
                  </Typography>
                </>
              ) : (
                <>
                  <Typography
                    variant="h5"
                    color="primary.main"
                    fontWeight={600}
                    mb={3}
                  >
                    Face Recognition
                  </Typography>
                  <Typography variant="body2" mb={6}>
                    Position your face within the frame and click "Scan My Face"
                  </Typography>
                  <Image
                    src="/images/facerecog.svg"
                    width={170}
                    height={170}
                    alt="Biometric Avatar"
                  />
                  <br />
                  <br />
                  <br />
                  <Button
                    onClick={() => {
                      setShowLiveness(true);
                      setLoginFailed(false);
                    }}
                    variant="contained"
                    sx={{
                      minWidth: "250px",
                      backgroundColor: "#5AC994",
                      textTransform: "none",
                      color: "white",
                      minHeight: "60px",
                      borderRadius: "50px",
                    }}
                  >
                    <Typography variant="body1">Scan My Face</Typography>
                  </Button>
                </>
              )}
            </Box>
          </Grid2>
        </Grid2>
      </Box>
      <Footer />
    </Box>
  );
}
