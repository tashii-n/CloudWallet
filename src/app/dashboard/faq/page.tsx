"use client";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import React, { useState } from "react";
import faqData from "@/app/lib/data/faqData";
import SearchBar from "../components/SearchBar";


export default function FAQTabs() {
  const [tabIndex, setTabIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [expanded, setExpanded] = useState<string | false>("panel-0");

  const handleChangeTab = (_: React.SyntheticEvent, newIndex: number) => {
    setTabIndex(newIndex);
    setSearchTerm(""); // clear search when switching tabs
    setExpanded(false); // collapse all accordions when switching
  };

  const handleAccordionChange =
    (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const currentCategory = tabIndex === 0 ? "users" : "organizations";
  const filteredFaqs = faqData[currentCategory].filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box bgcolor={"white"} p={2} borderRadius={2}>
      <Typography variant="h5" fontWeight={500} mb={3}>
        FAQs
      </Typography>
      <Tabs value={tabIndex} onChange={handleChangeTab} aria-label="FAQ Tabs">
        <Tab label="For Users" />
        <Tab label="For Organizations" />
      </Tabs>
      
      {/* Replace TextField with SearchBar component */}
      <Box mt={2} mb={4}>
        <SearchBar onSearchChange={handleSearchChange} />
      </Box>

      {filteredFaqs.length > 0 ? (
        filteredFaqs.map((faq, index) => (
          <Accordion
            key={index}
            expanded={expanded === `panel-${index}`}
            onChange={handleAccordionChange(`panel-${index}`)}
            square
            sx={{
              mb: 2,
              borderRadius: 2,
              border: "solid 1px",
              borderColor: "primary.main",
              boxShadow: "none",
              "&:before": {
                display: "none",
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel-${index}-content`}
              id={`panel-${index}-header`}
              sx={{
                "&:hover": {
                  color: "primary.main",
                },
              }}
            >
              <Typography fontSize={17}>{faq.question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">{faq.answer}</Typography>
            </AccordionDetails>
          </Accordion>
        ))
      ) : (
        <Typography variant="body1" sx={{ mt: 2 }}>
          No FAQs match your search.
        </Typography>
      )}
    </Box>
  );
}