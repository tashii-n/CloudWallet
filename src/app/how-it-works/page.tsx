"use client";

import React from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
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
      title: "View and Manage Your Credentials",
      description:
        "Once verified, a personal cloud wallet is created for you. Inside it, you receive your first government-issued credentials — such as your Foundation ID and Permanent Address.",
      image: "/images/howitworks2.svg", // Replace with your image path
    },
  ];

  return (
    <Box
      sx={{
        py: 8,
        backgroundColor: "#f8fffe",
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
            HOW <span style={{ color: "#4CAF50" }}>IT WORKS?</span>
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
                #4CAF50 0px,
                #4CAF50 8px,
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
                    color: "#4CAF50",
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
                    backgroundColor: "#4CAF50",
                    fontSize: "2rem",
                    fontWeight: "bold",
                    border: "4px solid white",
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
                    height: 250,
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
      </Container>
    </Box>
  );
};

export default HowItWorks;
