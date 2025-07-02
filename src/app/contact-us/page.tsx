"use client";

import React, { useState } from "react";
import Footer from "../components/LandingPageMain/Footer/footer";
import Header from "../components/LandingPageMain/Header/Header";
import { Box, Typography } from "@mui/material";
import ContactUs from "../components/ContactUs/contact";

export default function FAQ() {
  return (
    <>
      <Header />
      <Box mx={3}>
        <ContactUs/>
      </Box>
      <Footer />
    </>
  );
}
