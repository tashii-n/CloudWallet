"use client";

import Footer from "@/app/components/LandingPageMain/Footer/footer";
import Header from "@/app/components/LandingPageMain/Header/Header";
import { Backdrop, Box, Button, Grid2, Stack, Typography } from "@mui/material";
import Image from "next/image";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { secureGet } from "@/app/lib/storage/storage";
import { loginAPI } from "@/app/lib/api_utils/onboardingAPI";

const FaceLivenessDynamic = dynamic(
  () => import("@/app/components/Liveness/Liveness"),
  { ssr: false }
);

export default function BiometricPage() {
  const router = useRouter();

  const [showLiveness, setShowLiveness] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const maxRetries = 3; // Maximum number of retries

const handleLivenessSuccess = async (livenessResponse: any, attempt = 1) => {
  try {
    console.log("Liveness successful:", livenessResponse);

    const imageData = livenessResponse?.images?.[0]; // Base64 encoded image
    if (!imageData) {
      throw new Error("No image data found in liveness response");
    }

    const idNumber = await secureGet("idNumber");
    if (!idNumber) {
      throw new Error("ID Number is missing from session storage");
    }

    setIsLoading(true); // Show loading spinner

    // Prepare data for API
    const jsonData = {
      idNumber,
      image: imageData,
    };

    // ✅ Call login API
    const apiResponse = await loginAPI(jsonData);
    console.log("API Response:", apiResponse);

    // Navigate to validation page after success
    router.push("/dashboard");

  } catch (error) {
    console.error(`Error on attempt ${attempt}:`, error);

    if (attempt < maxRetries) {
      const delay = Math.pow(2, attempt) * 1000; // Exponential backoff (2^attempt seconds)
      console.log(`Retrying in ${delay / 1000} seconds...`);

      await new Promise((resolve) => setTimeout(resolve, delay));

      handleLivenessSuccess(livenessResponse, attempt + 1); // Retry
    } else {
      console.error("Max retries reached. API call failed.");
    }
  } finally {
    setIsLoading(false); // Hide loading spinner
  }
};
  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100vh" // Ensures the full height is utilized
    >
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
          <Typography variant="h5" color="green" mt={2} textAlign={"center"}>
            Your biometric data is being validated. Please wait...
          </Typography>
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
                    onClick={() => setShowLiveness(true)}
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
