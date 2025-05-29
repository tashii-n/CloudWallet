"use client";

import React, { useState } from "react";
import Footer from "../components/LandingPageMain/Footer/footer";
import Header from "../components/LandingPageMain/Header/Header";
import FAQTabs from "../components/FAQ/faq";
import { Box, Typography } from "@mui/material";

export default function FAQ() {
  return (
    <>
      <Header />
      <Box mx={3}>
        <Typography variant="h4" ml={2} fontWeight={500} mt={5} mb={3} color="primary">
          Frequently Asked Questions
        </Typography>
        <FAQTabs />
      </Box>
      <Footer />
    </>
  );
}
