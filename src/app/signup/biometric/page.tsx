"use client";

import Footer from "@/app/components/LandingPageMain/Footer/footer";
import Header from "@/app/components/LandingPageMain/Header/Header";
import { Box, Button, Grid2, Stack, Typography } from "@mui/material";
import Image from "next/image";
import React, { useState } from "react";
import dynamic from "next/dynamic";

const FaceLivenessDynamic = dynamic(
  () => import("@/app/components/Liveness/Liveness"),
  { ssr: false }
);

export default function BiometricPage() {
  const [showLiveness, setShowLiveness] = useState(false);

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100vh" // Ensures the full height is utilized
    >
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
                <FaceLivenessDynamic onClose={() => setShowLiveness(false)} />
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
