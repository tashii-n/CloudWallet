"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // Import both from next/navigation
import { Box, CircularProgress } from "@mui/material";

export default function DeeplinkPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const deepLinkURL = searchParams.get("url");

    if (deepLinkURL) {
      router.push(`/dashboard?url=${encodeURIComponent(deepLinkURL)}`);
    } else {
      router.push("/dashboard");
    }
  }, [router, searchParams]);

  return (
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
  );
}
