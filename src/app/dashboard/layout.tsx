"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import CircularProgress from "@mui/material/CircularProgress"; // For loading state
import { secureGet } from "../lib/storage/storage";

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const cloudAccessToken = await secureGet("cloudAccessToken");

      if (!cloudAccessToken) {
        // Redirect to login page if no token is found

        router.push("/login");
      } else {
        // Set authenticated state to true
        setIsAuthenticated(true);
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
  }

  // Render the layout only if authenticated
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
