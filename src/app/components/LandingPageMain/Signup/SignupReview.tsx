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
  onboardingDIDAPI,
  onboardingInitialCredentialsAPI,
  onboardingRegisterAPI,
  onboardingWalletCreationAPI,
} from "@/app/lib/api_utils/onboardingAPI";

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

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      // Retrieve onboarding data from session storage
      const storedData = await secureGet("onboardingData");
      if (!storedData) throw new Error("No onboarding data found.");

      const parsedData = JSON.parse(storedData);
      const { onboardingUniqueId } = parsedData;
      if (!onboardingUniqueId) throw new Error("Missing onboardingUniqueId.");
      const holderdid = secureGet("holderDID");
      // Step 1: Register and get access token
      const response = await onboardingRegisterAPI({ onboardingUniqueId });
      const cloudAccessToken = response.access_token;
      await secureStore("cloudAccessToken", cloudAccessToken);

      // Step 2: Create Wallet
      const walletResponse = await onboardingWalletCreationAPI({
        label: "Credential Wallet",
      });
      console.log("Wallet Created:", walletResponse);

      // Step 3: Create DID
      const didResponse = await onboardingDIDAPI();
      console.log("DID Created:", didResponse);
      const holderDID = didResponse.did;
      console.log("Holder DID:", holderDID)
      // Store holderDID for later use
      await secureStore("holderDID", holderDID);

      // Step 4: Issue Credentials
      const credentialsResponse = await onboardingInitialCredentialsAPI({
        ...parsedData,
        credentialType: "jsonId", // Always "jsonId"
        holderDID: holderDID, // Retrieve holderDID from previous step
      });
      console.log("Credentials Issued:", credentialsResponse);

      alert("Onboarding completed successfully!");
      // router.push("/next-step"); // Navigate to the next step if needed
    } catch (error) {
      console.error("Error during onboarding:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const testhandleConfirm = async () => {
    setIsLoading(true);
    try {
      // Retrieve onboarding data from session storage
      const storedData = await secureGet("onboardingData");
      if (!storedData) throw new Error("No onboarding data found.");

      const parsedData = JSON.parse(storedData);
      const { onboardingUniqueId } = parsedData;
      if (!onboardingUniqueId) throw new Error("Missing onboardingUniqueId.");

      const holderdid = secureGet("holderDID");
      console.log("holderdid:", holderdid);
      // Step 1: Register and get access token

      // Step 4: Issue Credentials
      const credentialsResponse = await onboardingInitialCredentialsAPI({
        ...parsedData,
        holderDID: holderdid, // Retrieve holderDID from previous step
        credentialType: "jsonId", // Always "jsonId"
      });
      console.log("Credentials Issued:", credentialsResponse);

      alert("Onboarding completed successfully!");
      // router.push("/next-step"); // Navigate to the next step if needed
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
            .reduce((obj, key) => {
              obj[key] = parsedData[key];
              return obj;
            }, {} as Record<string, string>);

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
