"use client";

import Box from "@mui/material/Box";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
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
