"use client";

import Header from "../components/LandingPageMain/Header/Header";
import { Box, Typography, TextField, Button, InputLabel } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { secureStore } from "../lib/storage/storage";

export default function LoginPage() {
  const [idNumber, setIdNumber] = useState("");
  const router = useRouter();

  const handleFacialRecognitionLogin = async () => {
    try {
      if (!idNumber) {
        alert("Please enter your Citizenship ID Number");
        return;
      }

      // Save ID Number in session storage
      await secureStore("idNumber", idNumber);
      // Navigate to the next page (replace '/dashboard' with your route)
      router.push("login/biometric");
    } catch (error) {
      console.error("Authentication failed:", error);
    }
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header />
      <Box sx={{ flex: 1, display: "flex" }}>
        {/* Left half */}
        <Box
          sx={{
            flex: 0.9,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <Typography variant="h3" fontWeight={600} component="h1" gutterBottom>
            Bhutan <span className="ndigreen">NDI</span> <br />
            <i>Cloud</i> <i>Wallet</i>
          </Typography>

          <Image
            src="/images/loginimage.svg"
            alt="Login Image"
            width={400}
            height={450}
          />
        </Box>

        {/* Right half */}
        <Box
          sx={{
            flex: 1.1,
            backgroundColor: "#124143",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: 4,
          }}
        >
          <Box
            sx={{
              width: "50%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              src="/images/ndilogo.svg"
              alt="NDI Logo"
              width={80}
              height={80}
            />
            <Typography
              variant="h4"
              fontWeight={600}
              gutterBottom
              marginTop={3}
              color="white"
              letterSpacing={0.8}
            >
              Welcome Back
            </Typography>

            <Typography
              variant="body2"
              color="#ffffffd7"
              textAlign="center"
              gutterBottom
            >
              Glad to see you again
            </Typography>
            <Typography
              variant="body2"
              color="#ffffffd7"
              textAlign="center"
              sx={{ marginBottom: 12 }}
            >
              Login to your account below
            </Typography>

            <Box textAlign="left" width="100%">
              <InputLabel
                shrink
                htmlFor="username"
                sx={{ color: "#ffffffbe", marginBottom: 1 }}
              >
                Citizenship ID Number
              </InputLabel>

              <TextField
                type="number"
                id="username"
                variant="outlined"
                fullWidth
                placeholder="xxxxxxxxxxx"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                sx={{
                  marginBottom: 6,
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "primary.main" },
                    "&:hover fieldset": { borderColor: "primary.main" },
                    "&.Mui-focused fieldset": { borderColor: "#63dca1" },
                  },
                  "& .MuiInputBase-input": { color: "#ffffffbe" },
                  "& .MuiInputBase-input::placeholder": { color: "#ffffff" },
                  "& input[type=number]": { MozAppearance: "textfield" },
                  "& input[type=number]::-webkit-outer-spin-button": {
                    WebkitAppearance: "none",
                    margin: 0,
                  },
                  "& input[type=number]::-webkit-inner-spin-button": {
                    WebkitAppearance: "none",
                    margin: 0,
                  },
                }}
              />
            </Box>

            <Button
              variant="contained"
              fullWidth
              sx={{
                p: 2,
                textTransform: "none",
                letterSpacing: 0.5,
                color: "#ffffffee",
                marginBottom: 2,
              }}
              onClick={handleFacialRecognitionLogin}
            >
              Facial Recognition Log In
            </Button>

            <Typography variant="caption" color="#ffffffbe">
              Don't have an account?{" "}
              <span className="ndigreen">
                <Link href="/signup">Sign Up</Link>
              </span>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
