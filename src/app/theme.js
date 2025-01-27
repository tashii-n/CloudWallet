// src/theme.js or styles/theme.js
'use client';

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: "'Inter', sans-serif", // Ensure this matches your global font
  },
  palette: {
    primary: {
      main: '#5AC894', // Primary color (blue)
    },
    secondary: {
      main: '#124143', // Secondary color (pink)
    },
    
    // text: {
    //   primary: '#333', // Text color (dark gray)
    //   secondary: '#fff', // Secondary text color (white)
    // },
  },
  
});

export default theme;
