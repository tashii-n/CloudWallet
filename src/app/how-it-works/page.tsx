import { Box, Typography } from "@mui/material";
import HowItWorks from "../components/HowItWorks/howitworks";
import Footer from "../components/LandingPageMain/Footer/footer";
import Header from "../components/LandingPageMain/Header/Header";

export default function FAQ() {
  return (
    <>
      <Header />
      <Box mx={3}>
        
        <HowItWorks/>
      </Box>
      <Footer />
    </>
  );
}