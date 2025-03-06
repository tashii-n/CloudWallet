// src/theme.js or styles/theme.js
"use client";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: "'Inter', sans-serif", // Ensure this matches your global font
  },
  palette: {
    text: {
      disabled: "rgba(0, 0, 0, 0.75)", // Darker color for disabled text
    },
    primary: {
      main: "#5AC894", // Primary color (blue)
    },
    secondary: {
      main: "#124143", // Secondary color (pink)
    },

    // text: {
    //   primary: '#333', // Text color (dark gray)
    //   secondary: '#fff', // Secondary text color (white)
    // },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .Mui-disabled": {
            color: "rgba(0, 0, 0, 0.75)", // Ensure the text color is applied
          },
        },
      },
    },
  },
});

export default theme;
