"use client";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import * as React from "react";
import { useState, useEffect } from "react";

const demoTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: "data-toolpad-color-scheme",
  },
  colorSchemes: { 
    light: true, 
    dark: true 
  },
  palette: {
    mode: "light",
    primary: {
      main: '#5AC894', // Primary color (blue)
    }, 
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});

export default function ThemeProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Avoid hydration mismatch
  }

  return (
    <ThemeProvider theme={demoTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
