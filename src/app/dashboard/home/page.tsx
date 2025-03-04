"use client";
import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { secureGet } from "@/app/lib/storage/storage";
import { getCredentialListAPI, onboardingGetDIDAPI } from "@/app/lib/api_utils/onboardingAPI";

export default function Page1() {
  const [credentials, setCredentials] = useState([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCredentials = async () => {
      try {
        // Retrieve holderDID and cloudAccessToken from session storage
        const holderDID = await secureGet("holderDID");
        const cloudAccessToken = await secureGet("cloudAccessToken");

        if (!holderDID || !cloudAccessToken) {
          throw new Error("Missing required session data");
        }

        console.log("Holder DID:", holderDID);

        // Step 1: Call DID API
        const didResponse = await onboardingGetDIDAPI();
        console.log("DID API Response:", didResponse);

        const responseTenantId = didResponse.hashTenantID;

        // Step 2: Get Credential List
        const credentialList = await getCredentialListAPI({
          tenantId: responseTenantId,
          // status: "NEW",
          take: 10,
          skip: 0,
        });

        console.log("Credential List:", credentialList);

        setCredentials(credentialList);
      } catch (err: any) {
        console.error("Error fetching credentials:", err);
        setError(err.message);
      }
    };

    fetchCredentials();
  }, []);

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4">Test Credential List</Typography>

      {error && <Typography color="error">{error}</Typography>}

      {credentials.length > 0 ? (
        credentials.map((credential: any, index: number) => (
          <Box key={index} sx={{ marginY: 2, padding: 2, border: "1px solid #ccc" }}>
            <Typography variant="h6">Name: {credential.name}</Typography>
            <Typography>Status: {credential.status}</Typography>
            <Typography>Accepted Date: {credential.acceptedDate}</Typography>
          </Box>
        ))
      ) : (
        !error && <Typography>No credentials found.</Typography>
      )}
    </Box>
  );
}
