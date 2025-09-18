"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme.js";
import { ToastProvider } from "./components/ToastContent/toastContent";
import { Inter } from "next/font/google";
import { useEffect } from "react";
import { getSessionId } from "./lib/client_session";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayoutClient({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    getSessionId(); // generate per-tab session ID once per tab
  }, []);

  return (
    <html lang="en">
      <body className={inter.className}>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <ToastProvider>{children}</ToastProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
