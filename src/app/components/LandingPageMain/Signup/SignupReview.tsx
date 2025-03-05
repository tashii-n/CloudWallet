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
  const [isLoading, setIsLoading] = useState<boolean>(false); // Example of a non-JSON state variable
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // const testconfirm = async () => {
  //   setIsLoading(true);
  //   try {
  //     // Retrieve onboarding data
  //     const storedData = await secureGet("onboardingData");
  //     if (!storedData) throw new Error("No onboarding data found.");

  //     const parsedData = JSON.parse(storedData);
  //     const { onboardingUniqueId } = parsedData;
  //     if (!onboardingUniqueId) throw new Error("Missing onboardingUniqueId.");
  //     const responseTenantId = await secureGet("tenantId");
  //     if (!responseTenantId) throw new Error("Missing onboardingUniqueId.");
  //     const holderDID = await secureGet("holderDID")
  //     if (!holderDID) throw new Error("Missing onboardingUniqueId.");

  //     console.log("Tenant ID:", responseTenantId);

  //     // Step 7: Get Credential List
  //     const credentialList = await getCredentialListAPI({
  //       tenantId: responseTenantId,
  //       take: 10,
  //       skip: 0,
  //     });
  //     console.log("Credential List:", credentialList);

  //     // Step 8: Call Revocation API and Accept Each Revocation Credential
  //     if (credentialList?.length) {
  //       for (const credential of credentialList) {
  //         if (credential.revocationId) {
  //           console.log(`Calling revocation API for: ${credential.name}`);

  //           try {
  //             const revocationResponse = await getRevocationCredentialAPI({
  //               holderDID,
  //               revocationId: credential.revocationId,
  //             });

  //             console.log(
  //               `✅ Revocation Credential for ${credential.name}:`,
  //               revocationResponse
  //             );

  //             const invitationUrl = revocationResponse?.credInviteURL; // Correct URL from API response
  //             if (invitationUrl) {
  //               const acceptResponse = await acceptCredentialAPI({
  //                 invitationUrl,
  //               });

  //               console.log(
  //                 `✅ Revocation Credential Accepted: ${credential.name}`,
  //                 acceptResponse
  //               );
  //             } else {
  //               console.error(
  //                 `❌ Missing credInviteURL for ${credential.name}`
  //               );
  //             }
  //           } catch (error) {
  //             console.error(
  //               `❌ Error with Revocation Credential for ${credential.name}:`,
  //               error
  //             );
  //           }
  //         }
  //       }
  //     }

  //     alert("Onboarding completed successfully!");
  //   } catch (error) {
  //     console.error("Error during onboarding:", error);
  //     alert("An error occurred. Please try again.");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      // Step 1: Retrieve onboarding data
      const storedData = await secureGet("onboardingData");
      if (!storedData) throw new Error("No onboarding data found.");

      const parsedData = JSON.parse(storedData);
      const { onboardingUniqueId } = parsedData;
      if (!onboardingUniqueId) throw new Error("Missing onboardingUniqueId.");

      // Step 2: Register and Get Token
      const response = await retryAPI(onboardingRegisterAPI, {
        onboardingUniqueId,
      });
      const cloudAccessToken = response.access_token;
      await secureStore("cloudAccessToken", cloudAccessToken);

      // Step 3: Create Wallet
      const walletResponse = await retryAPI(onboardingWalletCreationAPI, {
        label: "Credential Wallet",
      });
      console.log("✅ Wallet Created:", walletResponse);

      // Step 4: Create DID
      const didResponse = await retryAPI(onboardingDIDAPI, {});
      const holderDID = didResponse.did;
      console.log("✅ Holder DID:", holderDID);
      await secureStore("holderDID", holderDID);

      // Step 5: Issue Credentials
      const credentialsResponse = await retryAPI(
        onboardingInitialCredentialsAPI,
        {
          ...parsedData,
          credentialType: "jsonId",
          holderDID,
        }
      );
      console.log("✅ Credentials Issued:", credentialsResponse);

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

      // Step 6: Get Tenant ID
      const getDidResponse = await retryAPI(onboardingGetDIDAPI, {});
      const responseTenantId = getDidResponse.hashTenantID;
      console.log("✅ Tenant ID:", responseTenantId);

      // Step 7: Get Credential List
      const fetchCredentialList = async (tenantId: string) => {
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
            return credentialList; // Break out if credentials are found
          }

          attempts++;
          await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds before retrying
        }

        console.error("❌ Credential List still empty after 10 attempts");
        return [];
      };

      const credentialList = await fetchCredentialList(responseTenantId);
      console.log("Credential List:", credentialList);

      // Step 8: Call Revocation API and Accept Each Revocation Credential
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
                console.error(
                  `❌ Missing credInviteURL for ${credential.name}`
                );
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

      router.push("/dashboard");
    } catch (error) {
      console.error("Error during onboarding:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
          {/* <Typography variant="h5" color="black" mt={2} textAlign={'center'}>
              Validating...
            </Typography> */}
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
        // noValidate
        action={"/"}
        method="POST"
        autoComplete="off"
        marginTop={3}
        sx={{
          mx: "auto",
          borderRadius: 2,
        }}
      >
        <Grid2
          marginBottom={4}
          container
          spacing={2}
          // border="1px solid"
          // borderRadius={2}
          // borderColor="primary.main"
          // padding={3}
        >
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
            onClick={handleConfirm}
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
                // onClick={handleOpen}
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
      </Box>
    </>
  );
}
