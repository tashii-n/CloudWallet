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
  acceptCredentialAPI,
  getCredentialDetailsAPI,
  getCredentialListAPI,
} from "../lib/api_utils/onboardingAPI";
import { secureGet } from "../lib/storage/storage";
import { retryAPI } from "../lib/api_utils/helperFunction";
import { useRouter, useSearchParams } from "next/navigation";
import ProofShareModal from "./components/ProofShareModal";
import { getSocket, initSocket } from "../lib/socket";

interface Credential {
  id: string;
  name: string;
  status: string;
  credentialsId: string;
  revocationCredentialsId: string;
  revocationId: string;
  acceptedDate: string;
}

// interface InputDescriptor {
//   id: string;
//   schema: { uri: string }[];
//   constraints: {
//     fields: { path: string[] }[];
//   };
// }

// interface PresentationDefinition {
//   id: string;
//   name: string;
//   purpose: string;
//   input_descriptors: InputDescriptor[];
// }

interface ModalProps {
  logoURL: string;
  verifierName: string;
  recordId: string;
}

export default function DashboardPage() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [selectedCredential, setSelectedCredential] = useState<any | null>(
    null
  );
  const [filteredCredentials, setFilteredCredentials] = useState<Credential[]>(
    []
  );
  const [modalProps, setModalProps] = useState<ModalProps>({
    logoURL: "",
    verifierName: "",
    recordId: "",
  });
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleCloseModal = () => setProofModalOpen(false);

  // const dummyCredential: Credential = {
  //   id: "12345",
  //   name: "John Doe's Driver License",
  //   status: "Active",
  //   credentialsId: "ABC123XYZ",
  //   revocationCredentialsId: "XYZ123ABC",
  //   revocationId: "98765",
  //   acceptedDate: "2025-03-06T12:00:00Z",
  // };

  useEffect(() => {
    fetchCredentials();

    const deepLinkURL = searchParams?.get("proofRequestURL");
    if (deepLinkURL) {
      handleDeepLinkRequest(deepLinkURL);
    }

    // handleProofRequestTest();
  }, []);



  // Assuming this function is inside a React component
  const handleDeepLinkRequest = async (url: string) => {
    const tenantId = await secureGet("tenantId");
    console.log("🚀 ~ fetchCredentials ~ tenantId:", tenantId);
    if (!tenantId) {
      console.error("Tenant ID is missing");
      return;
    }

    try {
      let responseLogoURL: string | undefined;
      let responseVerifierName: string | undefined;
      let responseRecordId: string | undefined;

      // Initialize socket and wait for connection
      const socket = await initSocket();

      // Step 1: Create a Promise to listen for the tenant-specific event before calling the API
      const socketEventPromise = new Promise<string>((resolve, reject) => {
        socket.once(tenantId, (data) => {
          console.log("📥 Socket message received for tenant:", data);
          const recordId = data?.message?.recordId;
          if (recordId) {
            console.log("Record ID received:", recordId);
            responseRecordId = recordId;
            resolve(recordId); // Resolve the promise when recordId is received
          } else {
            reject(new Error("Record ID is missing in socket response"));
          }
        });
      });

      // Step 2: Now call the acceptCredentialAPI after setting up the listener
      const payload = { invitationUrl: url, isShortenUrl: true };
      const proofAcceptResponse = await acceptCredentialAPI(payload);

      console.log(
        "✅ Proof request handled successfully:",
        proofAcceptResponse
      );

      // Step 3: Extract logoURL and verifierName from the API response
      responseLogoURL =
        proofAcceptResponse?.outOfBandRecord?.outOfBandInvitation?.imageUrl;
      responseVerifierName =
        proofAcceptResponse?.outOfBandRecord?.outOfBandInvitation?.label;

      // Step 4: Wait for the socket event response (recordId)
      const recordId = await socketEventPromise;

      // Step 5: Set modal props once both socket and API data are available
      if (responseLogoURL && responseVerifierName && recordId) {
        setModalProps({
          logoURL: responseLogoURL,
          verifierName: responseVerifierName,
          recordId: recordId,
        });
        setProofModalOpen(true);
      }
      if (socket) {
        socket.disconnect();
        console.log("Socket connection closed.");
      }
    } catch (error) {
      console.error("❌ Error handling DeepLinkRequest:", error);
    } 
  };

  const fetchCredentials = async (status?: string) => {
    const tenantId = await secureGet("tenantId");
    console.log("🚀 ~ fetchCredentials ~ tenantId:", tenantId);

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
      setFilteredCredentials(data); // Set filtered credentials to all initially
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

  // Handle the click on a status card to filter the list based on status
  const handleStatusCardClick = (status?: string) => {
    if (status) {
      const filtered = credentials.filter(
        (credential) => credential.status === status
      );
      setSelectedCredential(null);
      setFilteredCredentials(filtered);
    } else {
      setSelectedCredential(null);
      setFilteredCredentials(credentials); // Show all credentials if no status
    }
  };

  return (
    <Box>
      {proofModalOpen && (
        <ProofShareModal
          open={proofModalOpen}
          handleClose={handleCloseModal}
          logoURL={modalProps.logoURL}
          verifierName={modalProps.verifierName}
          recordId={modalProps.recordId}
        />
      )}

      <Grid2 size={12} display={"flex"} justifyContent={"space-between"} mb={3}>
        <Typography variant="h5" fontWeight={500} mb={3}>
          Credential Overview
        </Typography>
        {/* <Grid2 display="flex" alignItems="center">
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            sx={{ marginRight: 2, borderRadius: 10 }}
          />
        </Grid2> */}
      </Grid2>

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
              onClick={() => handleStatusCardClick(card.status)} // Use the new function to filter credentials
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
          {filteredCredentials.length === 0 ? (
            <Typography variant="h6">
              You do not have any credentials yet.
            </Typography>
          ) : (
            filteredCredentials.map((credential) => (
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
