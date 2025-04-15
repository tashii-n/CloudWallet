"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CircularProgress, Box } from "@mui/material";
import { secureStore } from "../lib/storage/storage";

export default function DeepLinkHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const deepLinkURL = searchParams.get("url");

    if (deepLinkURL) {
      secureStore("deeplinkURL", deepLinkURL.toString());
      router.push(`/dashboard`);
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
