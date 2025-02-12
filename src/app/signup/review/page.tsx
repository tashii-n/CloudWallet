"use client";
import { Box } from "@mui/material";
import Footer from "../../components/LandingPageMain/Footer/footer";
import Header from "../../components/LandingPageMain/Header/Header";
import Image from "next/image";
import SignupReview from "@/app/components/LandingPageMain/Signup/SignupReview";

export default function DataReviewPage() {
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
              //   justifyContent: "center",
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
