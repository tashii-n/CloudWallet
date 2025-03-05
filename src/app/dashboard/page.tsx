"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid2,
  TextField,
} from "@mui/material";
import CredentialCard from "./components/CredentialCard";
import {
  getCredentialDetailsAPI,
  getCredentialListAPI,
} from "../lib/api_utils/onboardingAPI";
import { secureGet } from "../lib/storage/storage";
import { retryAPI } from "../lib/api_utils/helperFunction";

interface Credential {
  id: string;
  name: string;
  status: string;
  credentialsId: string;
  revocationCredentialsId: string;
  revocationId: string;
  acceptedDate: string;
}

export default function DashboardPage() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [selectedCredential, setSelectedCredential] = useState<any | null>(
    null
  );

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async (status?: string) => {
    const tenantId = await secureGet("tenantId");
    if (!tenantId) {
      console.error("Tenant ID is missing");
      return;
    }
    try {
      const data = await retryAPI(getCredentialListAPI, {
        tenantId: tenantId,
        take: 10,
        skip: 0,
        status: status,
      });
      setCredentials(data);
    } catch (error) {
      console.error("Error fetching credentials after retries:", error);
    }
  };

  const handleCardClick = async (credentialId: string): Promise<void> => {
    try {
      const credentialDetails = await getCredentialDetailsAPI(credentialId);
      setSelectedCredential(credentialDetails);
    } catch (error) {
      console.error("Error fetching credential details:", error);
    }
  };

  const calculateCardData = () => {
    return [
      { title: "Total", value: credentials.length, status: undefined },
      {
        title: "Active",
        value: credentials.filter((c) => c.status === "ACTIVE").length,
        status: "ACTIVE",
      },
      {
        title: "Self Attested",
        value: credentials.filter((c) => c.status === "self-attested").length,
        status: "self-attested",
      },
      {
        title: "Suspended",
        value: credentials.filter((c) => c.status === "SUSPENDED").length,
        status: "SUSPENDED",
      },
      {
        title: "Revoked",
        value: credentials.filter((c) => c.status === "REVOKED").length,
        status: "REVOKED",
      },
    ];
  };

  const cardData = calculateCardData();

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Credential Overview
      </Typography>

      <Grid2 container spacing={2} sx={{ fontFamily: "Inter, sans-serif" }}>
        {cardData.map((card, index) => (
          <Grid2 size={2.4} key={index}>
            <Card
              sx={{
                p: 1,
                height: "90%",
                boxShadow: `-4px 3px 1px 1px #5AC994`,
                border: "solid 1px #5AC994",
                cursor: "pointer",
              }}
              onClick={() => fetchCredentials(card.status)}
            >
              <CardContent>
                <Typography mb={3} variant="h6" sx={{ fontWeight: "bold" }}>
                  {card.title}
                </Typography>
                <Typography variant="h6" color="primary">
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid2>
        ))}
      </Grid2>

      {selectedCredential ? (
        <Box mt={3} bgcolor="white" p={3}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Your Credential Details
          </Typography>
          <Card
            sx={{
              p: 2,
              border: "solid 1px #5AC994",
              boxShadow: `-4px 3px 1px 1px #5AC994`,
            }}
          >
            <CardContent>
              <Grid2 container spacing={8}>
                <Grid2 size={5}>
                  <CredentialCard
                    credential={{
                      name:
                        selectedCredential?.credential?.jsonld?.type?.[1] || "",
                      iconUrl: undefined,
                    }}
                  />
                </Grid2>
                <Grid2 container size={7} spacing={3}>
                  <Grid2 size={12}>
                    <Typography variant="h6">Credential Attributes</Typography>
                  </Grid2>
                  {Object.keys(
                    selectedCredential?.credential?.jsonld?.credentialSubject ||
                      {}
                  )
                    .filter(
                      (field) => field !== "revocation_id" && field !== "id"
                    )
                    .map((field) => (
                      <Grid2 key={field} size={6}>
                        <TextField
                          fullWidth
                          label={field}
                          variant="outlined"
                          name={field}
                          disabled
                          value={
                            selectedCredential?.credential?.jsonld
                              ?.credentialSubject?.[field] || ""
                          }
                        />
                      </Grid2>
                    ))}
                </Grid2>
              </Grid2>
            </CardContent>
          </Card>
        </Box>
      ) : (
        <Grid2
          bgcolor="white"
          mt={2}
          py={2}
          px={4}
          container
          borderRadius={3}
          spacing={3}
        >
          {credentials.length === 0 ? (
            <Typography variant="h6">
              You do not have any credentials yet.
            </Typography>
          ) : (
            credentials.map((credential) => (
              <Grid2 size={4} key={credential.id}>
                <CredentialCard
                  credential={credential}
                  onClick={() => handleCardClick(credential.credentialsId)}
                />
              </Grid2>
            ))
          )}
        </Grid2>
      )}
    </Box>
  );
}
