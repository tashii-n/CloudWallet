// app/deeplink/page.tsx
"use client";

import { Suspense } from "react";
import { Box, CircularProgress } from "@mui/material";
import DeepLinkHandler from "./DeepLinkHandler"; // we'll create this next

export const dynamic = "force-dynamic";

export default function DeeplinkPage() {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <CircularProgress size={100} />
        </Box>
      }
    >
      <DeepLinkHandler />
    </Suspense>
  );
}
