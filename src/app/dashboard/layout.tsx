"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import CircularProgress from "@mui/material/CircularProgress"; // For loading state
import { getValidCloudAccessToken } from "../lib/auth/auth";
import { isUserAuthenticated } from "../lib/api_utils/onboardingAPI";

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get a valid cloudAccessToken (checks expiration and refreshes if needed)
        // const cloudAccessToken = await getValidCloudAccessToken();

        // if (!cloudAccessToken) {
        //   // Redirect to login page if no valid token is found
        //   sessionStorage.setItem("redirectUrl", window.location.href);
        //   router.push("/login");
        // } else {
        //   // Set authenticated state to true
        //   setIsAuthenticated(true);
        // }
        const authenticated = await isUserAuthenticated();

        if (!authenticated) {
          sessionStorage.setItem("redirectUrl", window.location.href);
          router.push("/login");
        } else {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        sessionStorage.setItem("redirectUrl", window.location.href);
        // Redirect to login page if there's an error (e.g., token refresh failed)
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  // Show a loading spinner while checking authentication
  if (isAuthenticated === null) {
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
  } else if (isAuthenticated === true) {
    return (
      <Box sx={{ display: "flex", height: "100vh", bgcolor: "#F4F6F8" }}>
        <Sidebar />
        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
          <Header />
          <Box
            sx={{
              padding: 3,
              flexGrow: 1,
              overflowY: "auto",
              backgroundColor: "#F4F6F8",
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    );
  }
  return <div></div>;
}
