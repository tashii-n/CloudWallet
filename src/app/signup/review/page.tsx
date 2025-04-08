"use client";
import { Box } from "@mui/material";
import Footer from "../../components/LandingPageMain/Footer/footer";
import Header from "../../components/LandingPageMain/Header/Header";
import Image from "next/image";
import SignupReview from "@/app/components/LandingPageMain/Signup/SignupReview/SignupReview";
// import { useEffect } from "react";

export default function DataReviewPage() {
  // // Clear session when the component unmounts (user navigates away)
  // useEffect(() => {
  //   console.log("Component mounted");

  //   return () => {
  //     // This cleanup function will run when the component unmounts
  //     sessionStorage.clear(); // Clear the session
  //     console.log("Session cleared on page leave.");
  //   };
  // }, []); // Empty dependency array ensures this runs only on mount/unmount

  return (
    <>
      <Box
        sx={{
          width: "100vw",
          height: "88vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header />

        <Box
          sx={{
            flex: 1,
            display: "flex",
          }}
        >
          {/* Left half */}
          <Box
            sx={{
              flex: 1.3,
              display: "flex",
              flexDirection: "column",
              paddingX: 10,
              paddingY: 5,
            }}
          >
            <SignupReview />
          </Box>

          {/* Right half */}
          <Box
            sx={{
              flex: 0.7,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Image
              src="/images/signupimage.svg"
              alt="Login Image"
              width={450}
              height={400}
            />
          </Box>
        </Box>
      </Box>
      <Footer />
    </>
  );
}