"use client";

import { useEffect, useState, useRef } from "react";
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
  const [waitingForVerification, setWaitingForVerification] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const socketRef = useRef<any>(null);
  const tenantIdRef = useRef<string | null>(null);
  const initialSocketMessageReceivedRef = useRef<boolean>(false);


  useEffect(() => {
    // If there are any query parameters, remove them after the page reloads
    if (searchParams && searchParams.toString()) {
      // Use window.location.replace to reload the page without the query params
      router.replace("/dashboard");
    }
  }, [searchParams]);

  const handleCloseModal = () => {
    setProofModalOpen(false);
    // We don't disconnect the socket since we still want to listen for messages
  };

  const waitingForVerificationRef = useRef(false);

  useEffect(() => {
    waitingForVerificationRef.current = waitingForVerification;
  }, [waitingForVerification]);

  // This function will be passed to the ProofShare modal to inform us when share button is clicked
  const handleProofShared = () => {
    setWaitingForVerification(true);
    console.log("Proof share initiated, waiting for verification message...");
    console.log(
      "🚀 ~ DashboardPage ~ waitingForVerification:",
      waitingForVerification
    );
  };

  useEffect(() => {
    const setupComponent = async () => {
      // Get tenant ID and store it for use throughout the component
      const tenantId = await secureGet("tenantId");
      tenantIdRef.current = tenantId;

      if (tenantId) {
        // If we have a tenant ID, fetch credentials
        await fetchCredentials();

        // Check for deep link URL
        const deepLinkURL = searchParams?.get("proofRequestURL");
        if (deepLinkURL) {
          await handleDeepLinkRequest(deepLinkURL);
        }
      } else {
        console.error("Tenant ID is missing");
      }
    };

    setupComponent();

    // Cleanup function for socket connection
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        console.log("Socket connection closed on component unmount.");
      }
    };
  }, []);

  // Set up socket message handler
  const setupSocketListener = (tenantId: string) => {
    if (!socketRef.current) return;

    // Remove any existing listeners to prevent duplicates
    socketRef.current.off(tenantId);

    // Set up the new listener
    socketRef.current.on(tenantId, async (data: any) => {
      console.log("📥 Socket message received for tenant:", data);
      console.log(
        "🚀 ~ socketRef.current.on ~ waitingForVerification:",
        waitingForVerification
      );

      // First message contains the recordId needed to open the modal
      if (!initialSocketMessageReceivedRef.current && data?.message?.recordId) {
        initialSocketMessageReceivedRef.current = true;
        const recordId = data.message.recordId;
        console.log(
          "Initial socket message with Record ID received:",
          recordId
        );

        // If we have all the data needed, open the modal
        if (modalProps.logoURL && modalProps.verifierName) {
          setModalProps((prev) => ({
            ...prev,
            recordId: recordId,
          }));
          setProofModalOpen(true);
          
        }
      }
      else if (waitingForVerificationRef.current) {
        console.log("✅ Verification message received:", data);
        if (data?.message?.type === "Issuance" || false) {
          setWaitingForVerification(false);
          await handlePostProofVerification(data);
        }
      }
    });
  };

  const handlePostProofVerification = async (data: any) => {
    try {
      console.log("✅ Post-proof verification API called successfully, ", data);      
      await fetchCredentials();
      router.replace("/dashboard");
    } catch (error) {
      console.error("❌ Error calling post-proof verification API:", error);
    }
  };

  const handleDeepLinkRequest = async (url: string) => {
    const tenantId = tenantIdRef.current;
    if (!tenantId) {
      console.error("Tenant ID is missing");
      return;
    }

    try {
      if (!socketRef.current) {
        const socket = await initSocket();
        socketRef.current = socket;

        setupSocketListener(tenantId);
      }

      const initialSocketEventPromise = new Promise<string>(
        (resolve, reject) => {
          // Set a timeout to reject the promise if no message is received
          const timeoutId = setTimeout(() => {
            reject(
              new Error("Socket event timeout: No initial message received")
            );
          }, 20000); // 20 seconds timeout

          // Set up a one-time listener just for the initial message
          const handleInitialMessage = (data: any) => {
            const recordId = data?.message?.recordId;
            if (recordId) {
              clearTimeout(timeoutId);
              initialSocketMessageReceivedRef.current = true;
              console.log("Initial Record ID received:", recordId);
              resolve(recordId);
              // Don't remove the listener here - setupSocketListener handles this
            }
          };

          // Only add this temporary listener if we don't already have a permanent one
          if (!initialSocketMessageReceivedRef.current) {
            socketRef.current.once(tenantId, handleInitialMessage);
          }
        }
      );

      // Step 2: Now call the acceptCredentialAPI after setting up the listener
      const payload = { invitationUrl: url, isShortenUrl: true };
      const proofAcceptResponse = await acceptCredentialAPI(payload);

      console.log(
        "✅ Proof request handled successfully:",
        proofAcceptResponse
      );

      // Step 3: Extract logoURL and verifierName from the API response
      const responseLogoURL =
        proofAcceptResponse?.outOfBandRecord?.outOfBandInvitation?.imageUrl;
      const responseVerifierName =
        proofAcceptResponse?.outOfBandRecord?.outOfBandInvitation?.label;

      // Store these in the modal props
      setModalProps((prev) => ({
        ...prev,
        logoURL: responseLogoURL || "",
        verifierName: responseVerifierName || "",
      }));

      // Step 4: Wait for the initial socket event response (recordId)
      try {
        const recordId = await initialSocketEventPromise;

        // Step 5: Set modal props once both socket and API data are available
        setModalProps((prev) => ({
          ...prev,
          recordId: recordId,
        }));
        setProofModalOpen(true);
      } catch (error) {
        console.error("❌ Error waiting for initial socket message:", error);
      }
    } catch (error) {
      console.error("❌ Error handling DeepLinkRequest:", error);
      // Don't disconnect socket on error - just log the error
    }
  };

  const fetchCredentials = async (status?: string) => {
    const tenantId = tenantIdRef.current;
    console.log("🚀 ~ fetchCredentials ~ tenantId:", tenantId);

    if (!tenantId) {
      console.error("Tenant ID is missing");
      return;
    }
    try {
      const data = await retryAPI(getCredentialListAPI, {
        tenantId: tenantId,
        take: 20,
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
          onShareClick={handleProofShared} // Pass this to the modal to notify us when share is clicked
        />
      )}

      <Grid2 size={12} display={"flex"} justifyContent={"space-between"} mb={3}>
        <Typography variant="h5" fontWeight={500} mb={3}>
          Credential Overview
        </Typography>
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
              onClick={() => handleStatusCardClick(card.status)}
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
