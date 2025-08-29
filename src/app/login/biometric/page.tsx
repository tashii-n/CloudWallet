"use client";

import Footer from "@/app/components/LandingPageMain/Footer/footer";
import Header from "@/app/components/LandingPageMain/Header/Header";
import { Backdrop, Box, Button, Grid2, Stack, Typography } from "@mui/material";
import Image from "next/image";
import React, { useState, useRef } from "react";
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
  const apiCalled = useRef(false); // Prevent duplicate API calls
  const maxRetries = 2;

  /**
   * 🔹 Run biometric validation (with retries)
   */
  const fetchBiometricValidation = async (attempt = 1) => {
    if (apiCalled.current) return; // Prevent duplicate API calls
    try {
      const onboardingDataString = await secureGet("onboardingData");
      const onboardingData = onboardingDataString
        ? JSON.parse(onboardingDataString)
        : null;

      if (!onboardingData) {
        throw new Error("No onboarding data found in session storage");
      }

      const imageData = sessionStorage.getItem("imageData") || "";

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

      const response = await onboardingBiometricAPI(requestData);
      console.log("✅ Biometric validation response:", response);

      apiCalled.current = true;

      return response; // ✅ Return response instead of redirecting
    } catch (error) {
      console.error(`Error on attempt ${attempt}:`, error);

      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchBiometricValidation(attempt + 1);
      } else {
        console.error("❌ Max retries reached. API call failed.");
        throw error;
      }
    }
  };

  /**
   * 🔹 Liveness Success Handler
   */
  const handleLivenessSuccess = async (livenessResponse: any, attempt = 1) => {
    try {
      const imageData = livenessResponse?.images?.[0];
      if (!imageData)
        throw new Error("No image data found in liveness response");

      sessionStorage.setItem("imageData", imageData);

      const idNumber = await secureGet("idNumber");
      if (!idNumber) throw new Error("ID Number missing from session storage");

      setIsLoading(true);

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
        const getDidResponse = await retryAPI(onboardingGetDIDAPI, {});
        responseTenantId = getDidResponse.hashTenantID;
        holderDID = getDidResponse.did;

        await secureStore("tenantId", responseTenantId);
        await secureStore("holderDID", holderDID);
        console.log("✅ Existing wallet found - Tenant ID:", responseTenantId);
      } catch {
        console.log("❌ No existing DID found, checking wallet status...");
        const walletStatusResponse = await retryAPI(getCloudWalletStatus, {});
        console.log(
          "🚀 ~ handleLivenessSuccess ~ walletStatusResponse:",
          walletStatusResponse
        );

        if (walletStatusResponse?.status === 404) {
          setIsLoading(false);
          setShowOnboardingForm(true); // Show onboarding form
          return;
        } else {
          throw new Error("Wallet exists but DID retrieval failed");
        }
      }

      const redirectUrl = sessionStorage.getItem("redirectUrl");
      sessionStorage.removeItem("redirectUrl");

      router.push(redirectUrl || "/dashboard");
    } catch (error) {
      console.error(`Error on attempt ${attempt}:`, error);
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        handleLivenessSuccess(livenessResponse, attempt + 1);
      } else {
        setShowLiveness(false);
        setLoginFailed(true);
        await secureClear("cloudAuth");
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 🔹 Onboarding Success Handler
   * - Run onboarding process
   * - Then run biometric validation
   */
  const handleOnboardingSuccess = async () => {
    try {
      setShowOnboardingForm(false);
      setIsLoading(true);

      console.log("🔍 Starting biometric validation...");
      const biometricResult = await fetchBiometricValidation();

      if (
        biometricResult?.scenario === "UPDATE_ONBOARDING_NO_BACKUP_SAME_DEVICE"
      ) {
        console.log(
          "✅ Biometric validation successful, completing onboarding..."
        );
        await completeOnboardingProcess();
        console.log("🎉 Onboarding complete!");

        router.push("/dashboard");
      } else {
        throw new Error(
          "Biometric validation failed. Cannot complete onboarding."
        );
      }
    } catch (error) {
      console.error("❌ Error after onboarding success:", error);
      setIsLoading(false);
      setLoginFailed(true);
    } finally {
      // setIsLoading(false);
    }
  };

  /**
   * 🔹 Onboarding Process (wallet, DID, creds)
   */
  const completeOnboardingProcess = async () => {
    try {
      setIsLoading(true);
      await createWalletForLogin();
      await createDIDForLogin();
      await getTenantIdForLogin();
      await issueCredentialsForLogin();
      await acceptRevocationCredentialsForLogin();
    } catch (error) {
      console.error("Error during onboarding process:", error);
    }
  };

  // Helper function for creating wallet during login
  const createWalletForLogin = async () => {
    const walletResponse = await retryAPI(onboardingWalletCreationAPI, {
      label: "Credential Wallet",
    });
    console.log("✅ Wallet Created during login:", walletResponse);
    return walletResponse;
  };

  // Helper function for creating DID during login
  const createDIDForLogin = async () => {
    const didResponse = await retryAPI(onboardingDIDAPI, {});
    const holderDID = didResponse.did;
    console.log("✅ New Holder DID created during login:", holderDID);
    await secureStore("holderDID", holderDID);
    return holderDID;
  };

  // Helper function for getting tenant ID during login
  const getTenantIdForLogin = async () => {
    const getDidResponse = await retryAPI(onboardingGetDIDAPI, {});
    const responseTenantId = getDidResponse.hashTenantID;
    console.log("✅ New Tenant ID created during login:", responseTenantId);
    await secureStore("tenantId", responseTenantId);
    return responseTenantId;
  };

  // Helper function for issuing credentials during login
  const issueCredentialsForLogin = async () => {
    const holderDID = await secureGet("holderDID");
    if (!holderDID)
      throw new Error("Missing holderDID for credential issuance.");

    // Retrieve the stored onboarding data (from the form)
    const storedData = await secureGet("onboardingData");
    if (!storedData) {
      console.warn("No onboarding data found, skipping credential issuance");
      return;
    }

    const parsedData = JSON.parse(storedData);

    // Prepare the payload for the API
    const payload = {
      ...parsedData, // Include all the onboarding data
      credentialType: "jsonld", // Specify the credential type
      holderDID, // Include the holderDID
    };

    // Call the API to issue credentials
    const credentialsResponse = await retryAPI(
      onboardingInitialCredentialsAPI,
      payload
    );
    console.log("✅ Credentials Issued during login:", credentialsResponse);

    // Accept each issued credential
    if (credentialsResponse?.length) {
      for (const credential of credentialsResponse) {
        console.log(`Accepting credential during login: ${credential.name}`);
        try {
          const acceptResponse = await retryAPI(acceptCredentialAPI, {
            invitationUrl: credential.url,
          });
          console.log(
            `✅ Credential ${credential.name} Accepted during login:`,
            acceptResponse
          );
        } catch (error) {
          console.error(
            `❌ Error Accepting ${credential.name} during login:`,
            error
          );
        }
      }
    }
  };

  // Helper function for getting credential list during login
  const getCredentialListForLogin = async () => {
    const tenantId = await secureGet("tenantId");
    if (!tenantId) throw new Error("Missing tenantId for credential list.");

    let attempts = 0;
    while (attempts < 10) {
      console.log(
        `⏳ Fetching Credential List during login... Attempt ${attempts + 1}`
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
      if (credentialListResponse?.length) {
        console.log(
          "✅ Credential List Found during login:",
          credentialListResponse
        );
        return credentialListResponse;
      }

      attempts++;
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds before retrying
    }

    throw new Error(
      "❌ Credential List still empty after 10 attempts during login"
    );
  };

  // Helper function for accepting revocation credentials during login
  const acceptRevocationCredentialsForLogin = async () => {
    const tenantId = await secureGet("tenantId");
    const holderDID = await secureGet("holderDID");

    if (!tenantId || !holderDID)
      throw new Error("Missing required data for revocation credentials.");

    await new Promise((resolve) => setTimeout(resolve, 5000));
    const credentialList = await getCredentialListForLogin();

    if (credentialList?.length) {
      for (const credential of credentialList) {
        if (credential.revocationId) {
          console.log(
            `Calling Revocation API during login for: ${credential.name}`
          );
          try {
            const revocationResponse = await retryAPI(
              getRevocationCredentialAPI,
              {
                holderDID: holderDID,
                revocationId: credential.revocationId,
              }
            );

            console.log(
              `✅ Revocation Credential during login for ${credential.name}:`,
              revocationResponse
            );

            const invitationUrl = revocationResponse?.credInviteURL;
            if (invitationUrl) {
              const acceptResponse = await retryAPI(acceptCredentialAPI, {
                invitationUrl,
              });
              console.log(
                `✅ Revocation Credential Accepted during login: ${credential.name}`,
                acceptResponse
              );
            } else {
              console.error(
                `❌ Missing credInviteURL for ${credential.name} during login`
              );
            }
          } catch (error) {
            console.error(
              `❌ Error with Revocation Credential during login for ${credential.name}:`,
              error
            );
          }
        }
      }
    }

    console.log("✅ Complete onboarding process finished during login");
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
                    variant="h5"
                    color="#c43e3d"
                    fontWeight={600}
                    mb={3}
                    letterSpacing={1}
                  >
                    LOGIN FAILED !
                  </Typography>
                  <Image
                    src="/images/errorred.svg"
                    width={170}
                    height={170}
                    alt="Biometric Avatar"
                  />
                  <Typography variant="body2" mt={3}>
                    Click the button below to try again.
                  </Typography>
                  <br />
                  <Button
                    onClick={() => setShowLiveness(true)}
                    variant="contained"
                    sx={{
                      minWidth: "250px",
                      backgroundColor: "#c43e3d",
                      textTransform: "none",
                      color: "white",
                      minHeight: "60px",
                      borderRadius: "50px",
                    }}
                  >
                    <Typography variant="body1">Scan My Face</Typography>
                  </Button>
                  <br />
                  <Typography variant="body2">
                    Want to go back?{" "}
                    <Link href="/" className="ndigreen">
                      Return to Home Page
                    </Link>
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
