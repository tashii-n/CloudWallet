"use client";
import {
  Typography,
  Box,
  Grid2,
  TextField,
  Stack,
  Button,
  Modal,
  Backdrop,
} from "@mui/material";
import Link from "next/link";
import { useEffect, useState } from "react";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { secureGet, secureStore } from "@/app/lib/storage/storage";
import {
  acceptCredentialAPI,
  getCredentialListAPI,
  getRevocationCredentialAPI,
  onboardingDIDAPI,
  onboardingGetDIDAPI,
  onboardingInitialCredentialsAPI,
  onboardingRegisterAPI,
  onboardingWalletCreationAPI,
} from "@/app/lib/api_utils/onboardingAPI";
import { retryAPI } from "@/app/lib/api_utils/helperFunction";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

// Define the steps in the onboarding process
const ONBOARDING_STEPS = {
  REGISTER: "REGISTER",
  CREATE_WALLET: "CREATE_WALLET",
  CREATE_DID: "CREATE_DID",
  ISSUE_CREDENTIALS: "ISSUE_CREDENTIALS",
  GET_TENANT_ID: "GET_TENANT_ID",
  GET_CREDENTIAL_LIST: "GET_CREDENTIAL_LIST",
  ACCEPT_REVOCATION_CREDENTIALS: "ACCEPT_REVOCATION_CREDENTIALS",
};

export default function SignupForm() {
  const router = useRouter();
  const requiredFields = [
    "Full Name",
    "Gender",
    "Date of Birth",
    "Citizenship",
    "ID Type",
    "ID Number",
    "Dzongkhag Name",
    "Gewog Name",
    "Village Name",
    "Thram No",
    "Permanent Household Number",
  ];

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>(null); // Track the current step
  const [holderDID, setHolderDID] = useState<string | null>(null); // Store holderDID
  const [tenantId, setTenantId] = useState<string | null>(null); // Store tenantId

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleErrorModalClose = () => {
    setErrorModalOpen(false);
  };

  // Step 1: Register and Get Token
  const registerAndGetToken = async () => {
    const storedData = await secureGet("onboardingData");
    if (!storedData) throw new Error("No onboarding data found.");

    const parsedData = JSON.parse(storedData);
    const { onboardingUniqueId } = parsedData;
    if (!onboardingUniqueId) throw new Error("Missing onboardingUniqueId.");

    const response = await retryAPI(onboardingRegisterAPI, {
      onboardingUniqueId,
    });
    const cloudAccessToken = response.access_token;
    await secureStore("cloudAccessToken", cloudAccessToken);

    setCurrentStep(ONBOARDING_STEPS.CREATE_WALLET); // Move to the next step
  };

  // Step 2: Create Wallet
  const createWallet = async () => {
    const walletResponse = await retryAPI(onboardingWalletCreationAPI, {
      label: "Credential Wallet",
    });
    console.log("✅ Wallet Created:", walletResponse);
    setCurrentStep(ONBOARDING_STEPS.CREATE_DID); // Move to the next step
  };

  // Step 3: Create DID
  const createDID = async () => {
    const didResponse = await retryAPI(onboardingDIDAPI, {});
    const holderDID = didResponse.did;
    console.log("✅ Holder DID:", holderDID);
    await secureStore("holderDID", holderDID);
    setHolderDID(holderDID); // Store holderDID for later steps
    setCurrentStep(ONBOARDING_STEPS.ISSUE_CREDENTIALS); // Move to the next step
  };

  // Step 4: Issue Credentials
  const issueCredentials = async () => {
    if (!holderDID) throw new Error("Missing holderDID.");

    // Retrieve the stored onboarding data
    const storedData = await secureGet("onboardingData");
    if (!storedData) throw new Error("No onboarding data found.");

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
    console.log("✅ Credentials Issued:", credentialsResponse);

    // Accept each issued credential
    if (credentialsResponse?.length) {
      for (const credential of credentialsResponse) {
        console.log(`Accepting credential: ${credential.name}`);
        try {
          const acceptResponse = await retryAPI(acceptCredentialAPI, {
            invitationUrl: credential.url,
          });
          console.log(
            `✅ Credential ${credential.name} Accepted:`,
            acceptResponse
          );
        } catch (error) {
          console.error(`❌ Error Accepting ${credential.name}:`, error);
        }
      }
    }

    // Move to the next step
    setCurrentStep(ONBOARDING_STEPS.GET_TENANT_ID);
  };

  // Step 5: Get Tenant ID
  const getTenantId = async () => {
    const getDidResponse = await retryAPI(onboardingGetDIDAPI, {});
    const responseTenantId = getDidResponse.hashTenantID;
    console.log("✅ Tenant ID:", responseTenantId);
    setTenantId(responseTenantId); // Store tenantId for later steps
    setCurrentStep(ONBOARDING_STEPS.ACCEPT_REVOCATION_CREDENTIALS); // Move to the next step
  };

  // Step 6: Get Credential List
  const getCredentialList = async () => {
    if (!tenantId) throw new Error("Missing tenantId.");

    let attempts = 0;
    while (attempts < 10) {
      console.log(`⏳ Fetching Credential List... Attempt ${attempts + 1}`);
      const credentialList = await getCredentialListAPI({
        tenantId,
        take: 10,
        skip: 0,
      });

      if (credentialList?.length) {
        console.log("✅ Credential List Found:", credentialList);
        // setCurrentStep(ONBOARDING_STEPS.ACCEPT_REVOCATION_CREDENTIALS); // Move to the next step
        return credentialList;
      }

      attempts++;
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds before retrying
    }

    throw new Error("❌ Credential List still empty after 10 attempts");
  };

  // Step 7: Accept Revocation Credentials
  const acceptRevocationCredentials = async () => {
    if (!tenantId || !holderDID) throw new Error("Missing required data.");

    const credentialList = await getCredentialList();
    if (credentialList?.length) {
      for (const credential of credentialList) {
        if (credential.revocationId) {
          console.log(`Calling Revocation API for: ${credential.name}`);
          try {
            const revocationResponse = await retryAPI(
              getRevocationCredentialAPI,
              {
                holderDID,
                revocationId: credential.revocationId,
              }
            );

            console.log(
              `✅ Revocation Credential for ${credential.name}:`,
              revocationResponse
            );

            const invitationUrl = revocationResponse?.credInviteURL;
            if (invitationUrl) {
              const acceptResponse = await retryAPI(acceptCredentialAPI, {
                invitationUrl,
              });
              console.log(
                `✅ Revocation Credential Accepted: ${credential.name}`,
                acceptResponse
              );
            } else {
              console.error(`❌ Missing credInviteURL for ${credential.name}`);
            }
          } catch (error) {
            console.error(
              `❌ Error with Revocation Credential for ${credential.name}:`,
              error
            );
          }
        }
      }
    }
    setIsLoading(false); // Hide the spinner after the process completes
    sessionStorage.clear();
    // Onboarding completed successfully
    router.push("/login");
  };

  const handleConfirm = async () => {
    setIsLoading(true); // Show the spinner
    try {
      // Start from the current step (or the first step if no step is set)
      switch (currentStep || ONBOARDING_STEPS.REGISTER) {
        case ONBOARDING_STEPS.REGISTER:
          await registerAndGetToken();
          break;
        case ONBOARDING_STEPS.CREATE_WALLET:
          await createWallet();
          break;
        case ONBOARDING_STEPS.CREATE_DID:
          await createDID();
          break;
        case ONBOARDING_STEPS.ISSUE_CREDENTIALS:
          await issueCredentials();
          break;
        case ONBOARDING_STEPS.GET_TENANT_ID:
          await getTenantId();
          break;
        case ONBOARDING_STEPS.GET_CREDENTIAL_LIST:
          await getCredentialList();
          break;
        case ONBOARDING_STEPS.ACCEPT_REVOCATION_CREDENTIALS:
          await acceptRevocationCredentials();
          break;
        default:
          throw new Error("Invalid step");
      }
    } catch (error) {
      console.error("Error during onboarding:", error);
      setErrorModalOpen(true); // Show error modal
      setIsLoading(false); // Hide the spinner on error
    }
  };

  // Automatically progress through steps
  useEffect(() => {
    if (currentStep) {
      handleConfirm();
    }
  }, [currentStep]); // Trigger handleConfirm when currentStep changes

  // When "Try Again" is clicked, resume the onboarding process
  const handleTryAgain = () => {
    setErrorModalOpen(false); // Close the error modal
    setIsLoading(true); // Show the spinner
    handleConfirm(); // Resume from the current step
  };

  // Fetch onboarding data on component mount
  useEffect(() => {
    const fetchOnboardingData = async () => {
      try {
        const storedData = await secureGet("onboardingData");
        if (storedData) {
          const parsedData = JSON.parse(storedData);

          // Filter only the required fields
          const filteredData = Object.keys(parsedData)
            .filter((key) => requiredFields.includes(key))
            .reduce(
              (obj, key) => {
                obj[key] = parsedData[key];
                return obj;
              },
              {} as Record<string, string>
            );

          setFormData(filteredData);
        }
      } catch (error) {
        console.error("Error fetching onboarding data:", error);
      }
    };

    fetchOnboardingData();
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
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
        </Box>
      </Backdrop>
      <Typography
        variant="h5"
        fontWeight={600}
        gutterBottom
        className="ndigreen"
      >
        Your Information
      </Typography>
      <p>Please confirm that the following information is correct.</p>

      <Box
        component="form"
        action={"/"}
        method="POST"
        autoComplete="off"
        marginTop={3}
        sx={{
          mx: "auto",
          borderRadius: 2,
        }}
      >
        <Grid2 marginBottom={4} container spacing={2}>
          {requiredFields.map((field) => (
            <Grid2 key={field} size={6}>
              <TextField
                fullWidth
                label={field}
                variant="outlined"
                name={field}
                disabled
                value={formData[field] || ""}
                onChange={(e) => handleChange(field, e.target.value)}
              />
            </Grid2>
          ))}
        </Grid2>

        <Stack
          direction="row"
          spacing={3}
          marginTop={2}
          justifyContent="space-between"
        >
          <Button
            onClick={() => {
              setIsLoading(true); // Show the spinner
              setCurrentStep(ONBOARDING_STEPS.REGISTER); // Start the process
            }}
            disabled={isLoading}
            variant="contained"
            sx={{
              minWidth: "200px",
              backgroundColor: "#5AC994",
              textTransform: "none",
              color: "white",
              minHeight: "40px",
            }}
          >
            Confirm
          </Button>
          <Button
            onClick={handleOpen}
            variant="outlined"
            sx={{
              minWidth: "200px",
              borderColor: "#5AC994",
              borderWidth: "2px",
              color: "black",
              textTransform: "none",
            }}
          >
            Deny
          </Button>
        </Stack>

        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box textAlign="center" borderRadius={4} sx={modalStyle}>
            <Typography
              id="modal-modal-title"
              color="primary"
              fontWeight={600}
              variant="h5"
              component="h2"
              gutterBottom
              mb={2}
            >
              Data Mismatch
            </Typography>
            <Image
              src="/images/error.svg"
              width={150}
              height={110}
              alt="Error"
            />

            <Typography id="modal-modal-description" mt={2}>
              If your information is incorrect or you've encountered other
              issues, please <b>contact 1199</b>.
            </Typography>
            <Stack
              direction="row"
              spacing={3}
              marginTop={4}
              justifyContent="space-around"
            >
              <Button
                onClick={handleClose}
                variant="outlined"
                color="error"
                sx={{
                  minWidth: "180px",
                  borderWidth: "1px",
                  textTransform: "none",
                }}
              >
                Cancel
              </Button>
              <Button
                LinkComponent={Link}
                type="submit"
                href="/signup"
                variant="contained"
                sx={{
                  minWidth: "180px",
                  backgroundColor: "#5AC994",
                  textTransform: "none",
                  color: "white",
                  minHeight: "40px",
                }}
              >
                OK
              </Button>
            </Stack>
          </Box>
        </Modal>

        {/* Error Modal */}
        <Modal
          open={errorModalOpen}
          onClose={handleErrorModalClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box textAlign="center" borderRadius={4} sx={modalStyle}>
            <Image
              src="/images/errorred.svg"
              width={150}
              height={150}
              alt="Error"
            />
            <Typography gutterBottom m={3}>
              An error has occurred. Please click the button below to try again.
            </Typography>
            <Button
              onClick={handleTryAgain}
              variant="contained"
              sx={{
                minWidth: "180px",
                backgroundColor: "#5AC994",
                textTransform: "none",
                color: "white",
                minHeight: "40px",
                borderRadius: 10,
              }}
            >
              Try Again
            </Button>
          </Box>
        </Modal>
      </Box>
    </>
  );
}
