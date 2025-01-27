import { Typography, Box, Stack } from "@mui/material";
import React from "react";
import Image from "next/image";

export default function Directions() {
  return (
    <>
      <Box
        bgcolor={"secondary.main"}
        color={"#ffffffb5"}
        paddingX={9}
        paddingY={6}
        borderRadius={5}
        width="100%"
      >
        <Typography variant="h5" color="primary.main" fontWeight={600} mb={3}>
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
              Situate yourself in a spot with good lighting. Avoid dim lighting
              and excess brightness.
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
    </>
  );
}
