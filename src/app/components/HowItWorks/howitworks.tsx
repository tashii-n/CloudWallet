"use client";

import React from "react";
import {
  Box,
  Container,
  Typography,
  Avatar,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import Image from "next/image";

const HowItWorks = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const steps = [
    {
      number: 1,
      title: "Register with Your CID and Face",
      description:
        "Sign up using your CID number and complete a secure biometric liveness check. Your identity is verified using official data from the Department of Civil Registration and Census (DCRC).",
      image: "/images/howitworks1.svg", // Replace with your image path
    },
    {
      number: 2,
      title: "Get Your Digital Wallet",
      description:
        "Once verified, a personal cloud wallet is created for you. Inside it, you receive your first government-issued credentials — such as your Foundation ID and Permanent Address.",
      image: "/images/howitworks2.svg", // Replace with your image path
    },
    {
      number: 3,
      title: "Log In Anytime with Facial Recognition",
      description:
        "Access your wallet securely using biometric authentication — no passwords. Simply scan your face and you're in.",
      image: "/images/howitworks3.svg", // Replace with your image path
    },
    {
      number: 4,
      title: "View and Manage Your Credentials",
      description:
        "After logging in, you’ll see a dashboard with all your credentials. You can access some features like viewing your details and adding self-attested credentials.",
      image: "/images/howitworks4.svg", // Replace with your image path
    },
    {
      number: 5,
      title: "Share Proof With Consent",
      description:
        "When a service provider requests information, such as your address or ID, you are securely redirected to your wallet through a deep link. There, you can review the details of the request and choose whether to approve or deny it. Only the data you approve is shared with the service provider in the form of a Verifiable Presentation.",
      image: "/images/howitworks5.svg", // Replace with your image path
    },
    {
      number: 6,
      title: "Receive New Credentials Automatically",
      description:
        "Once you’ve shared proof, organizations (like government offices or schools) can issue new credentials to you directly. These are securely stored in your wallet — no paperwork needed.",
      image: "/images/howitworks6.svg", // Replace with your image path
    },
    {
      number: 7,
      title: "You're Always in Control",
      description:
        "You decide who sees your credentials, when, and why. The NDI Cloud Wallet uses encryption, decentralization, and consent-based data sharing to give you full control over your digital identity.",
      image: "/images/howitworks7.svg", // Replace with your image path
    },
  ];

  return (
    <Box
      sx={{
        py: 8,
        minHeight: "100vh",
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Box textAlign="center" mb={8}>
          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontWeight: "bold",
              mb: 3,
              color: "#333",
            }}
          >
            HOW IT <span style={{ color: "#5AC994" }}>WORKS?</span>
          </Typography>

          <Typography
            variant="body1"
            // color="text.secondary"
            sx={{
              maxWidth: "1200px",
              mx: "auto",
              lineHeight: 1.6,
            }}
          >
            The Cloud Wallet is a secure, user-centric digital identity wallet
            using the principles of Self-Sovereign Identity (SSI). It enables
            users to access their wallet using a web browser and manage the
            Verifiable Credentials (VCs) in a secure and privacy-preserving
            manner. Here's how it works from start to finish.
          </Typography>
        </Box>

        {/* Steps */}
        <Box position="relative">
          {/* Central dotted line */}
          <Box
            sx={{
              position: "absolute",
              left: "50%",
              top: 0,
              bottom: 0,
              width: "2px",
              transform: "translateX(-50%)",
              background: `repeating-linear-gradient(
                to bottom,
                #5AC994 0px,
                #5AC994 8px,
                transparent 8px,
                transparent 16px
              )`,
              zIndex: 1,
              display: isMobile ? "none" : "block",
            }}
          />

          {steps.map((step, index) => (
            <Box
              key={step.number}
              sx={{
                display: "flex",
                alignItems: "center",
                mb: index === steps.length - 1 ? 0 : 12,
                flexDirection: isMobile
                  ? "column"
                  : index % 2 === 0
                    ? "row"
                    : "row-reverse",
                gap: isMobile ? 4 : 8,
              }}
            >
              {/* Content Side */}
              <Box
                sx={{
                  flex: 1,
                  // display: "flex",
                  justifyContent: isMobile
                    ? "center"
                    : index % 2 === 0
                      ? "flex-end"
                      : "flex-start",
                  pr: isMobile ? 0 : index % 2 === 0 ? 4 : 0,
                  pl: isMobile ? 0 : index % 2 === 0 ? 0 : 4,
                }}
              >
                <Typography
                  variant="h5"
                  component="h3"
                  sx={{
                    fontWeight: "bold",
                    mb: 2,
                    color: "primary.main",
                  }}
                >
                  {step.title}
                </Typography>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 3, lineHeight: 1.6 }}
                >
                  {step.description}
                </Typography>
              </Box>

              {/* Center Number Circle */}
              <Box
                sx={{
                  position: "relative",
                  zIndex: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    backgroundColor: "primary.main",
                    fontSize: "2rem",
                    fontWeight: "bold",
                    // border: "4px solid white",
                    boxShadow: "0 4px 20px rgba(76, 175, 80, 0.3)",
                  }}
                >
                  {step.number}
                </Avatar>
              </Box>

              {/* Image Side */}
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  justifyContent: isMobile
                    ? "center"
                    : index % 2 === 0
                      ? "flex-start"
                      : "flex-end",
                  pl: isMobile ? 0 : index % 2 === 0 ? 4 : 0,
                  pr: isMobile ? 0 : index % 2 === 0 ? 0 : 4,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 300,
                    height: 270,
                  }}
                >
                  <Image
                    src={step.image}
                    alt={step.title}
                    width={350}
                    height={350}
                    style={{
                      objectFit: "contain",
                      borderRadius: "8px",
                    }}
                  />
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
        <Box mt={7} textAlign={"center"}>
          <Typography
            variant="h4"
            color="primary"
            textAlign={"center"}
            fontWeight={600}
            mb={5}
          >
            Features Demonstration
          </Typography>

          <iframe
            width="800"
            height="415"
            src="https://www.youtube.com/embed/hzBgpzzot7w?si=HEaPq16qRVCp9sx_"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
        </Box>
      </Container>
    </Box>
  );
};

export default HowItWorks;
