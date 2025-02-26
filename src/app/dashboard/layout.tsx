"use client";
import * as React from "react";
import { AppProvider, type Navigation } from "@toolpad/core/AppProvider";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ThemeProviderWrapper from "./theme-provider"; // Import the wrapper

const NAVIGATION: Navigation = [
  { kind: "header", title: "" },
  { segment: "page", title: "Test", icon: <DashboardIcon /> },
];

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProviderWrapper>
      <AppProvider
        navigation={NAVIGATION}
        branding={{
          logo: <img src="/images/ndilogodark.svg" alt="Bhutan NDI logo" />,
          title: "NDI Cloud Wallet",
        }}
      >
        <DashboardLayout>{children}</DashboardLayout>
      </AppProvider>
    </ThemeProviderWrapper>
  );
}
