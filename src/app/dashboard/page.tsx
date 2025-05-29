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
  getPermanentAddressAPI,
  getRevocationCredentialAPI,
} from "../lib/api_utils/onboardingAPI";
import { secureClear, secureGet } from "../lib/storage/storage";
import { retryAPI } from "../lib/api_utils/helperFunction";
import { useRouter, useSearchParams } from "next/navigation";
import ProofShareModal from "./components/ProofShareModal";
import { getSocket, initSocket } from "../lib/socket";
import IssuanceModal from "./components/IssuanceModal";
import SearchBar from "./components/SearchBar";
import SelfAttestedCred from "./components/SelfAttestedCred";

interface Credential {
  connection: any;
  id: string;
  name: string;
  status: string;
  credentialsId: string;
  revocationCredentialsId: string;
  revocationId: string;
  acceptedDate: string;
  selfAttested: boolean;
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
  const [selectedLogo, setSelectedLogo] = useState("");
  const [filteredCredentials, setFilteredCredentials] = useState<Credential[]>(
    []
  );
  const [modalProps, setModalProps] = useState<ModalProps>({
    logoURL: "",
    verifierName: "",
    recordId: "",
  });
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [issuanceModalOpen, setIssuanceModalOpen] = useState(false);
  const [issuanceCredentialData, setIssuanceCredentialData] =
    useState<any>(null);
  const [waitingForVerification, setWaitingForVerification] = useState(false);
  const socketRef = useRef<any>(null);
  const tenantIdRef = useRef<string | null>(null);
  const initialSocketMessageReceivedRef = useRef<boolean>(false);
  const [isSelfAttested, setIsSelfAttested] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    // You can filter data, trigger API calls, etc. here
  };

  const handleCloseModal = () => {
    setProofModalOpen(false);
  };

  const handleCloseIssuanceModal = () => {
    setIssuanceModalOpen(false);
  };

  const waitingForVerificationRef = useRef(false);

  useEffect(() => {
    waitingForVerificationRef.current = waitingForVerification;
  }, [waitingForVerification]);

  const handleProofShared = () => {
    setWaitingForVerification(true);
    waitingForVerificationRef.current = true;
    console.log(
      "After update, waitingForVerificationRef.current =",
      waitingForVerificationRef.current
    );
  };

  useEffect(() => {
    const setupComponent = async () => {
      // Get tenant ID and store it for use throughout the component
      const tenantId = await secureGet("tenantId");
      tenantIdRef.current = tenantId;
      const credentials = await fetchCredentials();

      if (!tenantId) {
        console.error("Tenant ID is missing");
        return;
      }

      // Check for deep link URL first
      const deepLinkURL = await secureGet("deeplinkURL");
      if (deepLinkURL) {
        // If there's a deep link, handle it and return early - skip revocation checks
        await handleDeepLinkRequest(deepLinkURL, true);
        await secureClear("deeplinkURL");
        return; // <-- Early return to avoid running revocation checks
      }

      // If no deep link URL, proceed with normal credential processing
      const holderDID = await secureGet("holderDID");

      if (credentials) {
        const newCredentials = credentials.filter(
          (cred: Credential) =>
            cred.status === "NEW" && cred.name !== "Revocation Credential"
        );

        // Check if "Permanent Address" credential exists
        const permanentAddressExists = credentials.some(
          (cred: Credential) => cred.name === "Permanent Address"
        );

        if (!permanentAddressExists && holderDID) {
          try {
            const addressResponse = await getPermanentAddressAPI();
            console.log(
              "🚀 ~ setupComponent ~ addressResponse:",
              addressResponse
            );
            const url = addressResponse.data?.proofRequestURL;
            await handleDeepLinkRequest(url, false);
            return;
          } catch (error) {
            console.error("Error calling API for Permanent Address:", error);
          }
        }

        for (const credential of newCredentials) {
          if (credential.revocationId) {
            try {
              if (holderDID) {
                const revocationResponse = await getRevocationCredentialAPI({
                  holderDID: holderDID,
                  revocationId: credential.revocationId,
                });

                console.log(
                  "🚀 ~ setupComponent ~ revocationResponse:",
                  revocationResponse
                );

                const invitationUrl = revocationResponse?.credInviteURL;
                if (invitationUrl) {
                  const acceptResponse = await acceptCredentialAPI({
                    invitationUrl,
                  });
                  console.log(
                    `✅ Revocation Credential Accepted: ${credential.name}`,
                    acceptResponse
                  );
                } else {
                  console.error(
                    `❌ Missing credInviteURL for ${credential.name}`
                  );
                }
              } else {
                console.error("holderDID is null, cannot call API");
              }
            } catch (error) {
              console.error(
                `Error calling API for revocationId ${credential.revocationId}:`,
                error
              );
            }
          }
        }
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
        "🚀 ~ socketRef.current.on ~ waitingForVerificationref:():",
        waitingForVerificationRef.current
      );

      // Look for a Verification type message with recordId
      if (
        !initialSocketMessageReceivedRef.current &&
        data?.message?.type === "Verification" &&
        data?.message?.recordId
      ) {
        initialSocketMessageReceivedRef.current = true;
        const recordId = data.message.recordId;
        console.log("Verification message with Record ID received:", recordId);

        // If we have all the data needed, open the modal
        if (modalProps.logoURL && modalProps.verifierName) {
          setModalProps((prev) => ({
            ...prev,
            recordId: recordId,
          }));
          setProofModalOpen(true);
        }
      } else if (waitingForVerificationRef.current) {
        console.log(
          "🚀 ~ socketRef.current.on ~ waitingForVerificationRef.current:",
          waitingForVerificationRef.current
        );
        console.log("✅ Verification message received:", data);
        if (data?.message?.type === "Issuance") {
          setWaitingForVerification(false);
          await handlePostProofVerification(data);
        }
      }
    });
  };

  const handlePostProofVerification = async (data: any) => {
    try {
      console.log("✅ Post-proof verification API called successfully, ", data);
      const holderDID = await secureGet("holderDID");
      const revocationId = data?.message?.data?.revocation_id;
      setIssuanceCredentialData(data?.message?.data);
      if (holderDID) {
        const issuanceRevocationResponse = await getRevocationCredentialAPI({
          holderDID: holderDID,
          revocationId,
        });
        const invitationUrl = issuanceRevocationResponse?.credInviteURL;
        const acceptInviteResponse = await acceptCredentialAPI({
          invitationUrl,
        });
        console.log(
          "🚀 ~ handlePostProofVerification ~ acceptInviteResponse:",
          acceptInviteResponse
        );
      }
      setProofModalOpen(false);
      setIssuanceModalOpen(true);
      await fetchCredentials();
    } catch (error) {
      console.error("❌ Error calling post-proof verification API:", error);
    }
  };

  const handleDeepLinkRequest = async (url: string, isShortenUrl: boolean) => {
    const tenantId = tenantIdRef.current;
    if (!tenantId) {
      console.error("Tenant ID is missing");
      return;
    }

    try {
      // Step 1: Make sure socket is initialized and listener is set up
      if (!socketRef.current) {
        const socket = await initSocket();
        socketRef.current = socket;
      }

      // Explicitly set up the listener and wait for it to complete
      await new Promise<void>((resolve) => {
        setupSocketListener(tenantId);
        // The listener is now ready
        resolve();
      });

      // Step 2: Set up the promise to listen for the Verification message
      const initialSocketEventPromise = new Promise<string>(
        (resolve, reject) => {
          // Set a timeout to reject the promise if no message is received
          const timeoutId = setTimeout(() => {
            reject(
              new Error(
                "Socket event timeout: No Verification message received"
              )
            );
          }, 60000); // 60 seconds timeout

          // Set up a specific listener for the Verification message
          const handleVerificationMessage = (data: any) => {
            if (
              data?.message?.type === "Verification" &&
              data?.message?.recordId
            ) {
              clearTimeout(timeoutId);
              initialSocketMessageReceivedRef.current = true;
              console.log(
                "Verification message with Record ID received:",
                data.message.recordId
              );
              resolve(data.message.recordId);
              // Remove this specific listener since we got what we needed
              socketRef.current.off(tenantId, handleVerificationMessage);
            }
          };

          // Add this dedicated listener
          socketRef.current.on(tenantId, handleVerificationMessage);
        }
      );

      // Socket.IO specific verification before API call
      if (!socketRef.current) {
        throw new Error("Socket is not initialized before API call");
      }

      // Check if the socket is connected (Socket.IO specific)
      if (!socketRef.current.connected) {
        console.warn("Socket is disconnected. Attempting to reconnect...");

        // Wait for reconnection if needed
        await new Promise<void>((resolve, reject) => {
          const reconnectTimeout = setTimeout(() => {
            reject(new Error("Socket reconnection timeout"));
          }, 5000);

          socketRef.current.once("connect", () => {
            clearTimeout(reconnectTimeout);
            resolve();
          });

          // Force reconnection attempt
          socketRef.current.connect();
        });
      }

      // Verify that we have listeners for this event (Socket.IO specific)
      // Socket.IO v3+ method to check listeners
      const hasListeners = socketRef.current.hasListeners(tenantId);

      if (!hasListeners) {
        console.warn(
          "No listeners detected for tenant ID. Re-establishing listener..."
        );
        setupSocketListener(tenantId);

        // Wait a moment for the listener to register
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      console.log(
        "✅ Socket.IO connection and listeners verified. Proceeding with API call."
      );

      // Step 3: Now that the listener is set up and verified, call the API
      const payload = { invitationUrl: url, isShortenUrl: isShortenUrl };
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const proofAcceptResponse = await acceptCredentialAPI(payload);
      console.log(
        "✅ Proof request handled successfully:",
        proofAcceptResponse
      );

      // Step 4: Extract logoURL and verifierName from the API response
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

      // Step 5: Wait for the initial socket event response (recordId)
      try {
        const recordId = await initialSocketEventPromise;
        console.log("🚀 ~ handleDeepLinkRequest ~ recordId:", recordId);

        setModalProps((prev) => ({
          ...prev,
          recordId: recordId,
        }));
        setProofModalOpen(true);
      } catch (error) {
        console.error(
          "❌ Error waiting for Verification socket message:",
          error
        );
      }
    } catch (error) {
      console.error("❌ Error handling DeepLinkRequest:", error);
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
        take: 30,
        skip: 0,
        status: status,
      });
      setCredentials(data);
      setFilteredCredentials(data);
      return data;
    } catch (error) {
      console.error("Error fetching credentials after retries:", error);
    }
  };

  const handleCardClick = async (
    credentialId: string,
    selfAttested: boolean
  ): Promise<void> => {
    try {
      let credentialDetails;
      if (selfAttested == true) {
        credentialDetails = await getCredentialDetailsAPI(
          credentialId,
          selfAttested
        );
      } else {
        credentialDetails = await getCredentialDetailsAPI(credentialId);
      }
      setSelectedCredential(credentialDetails);
      setIsSelfAttested(selfAttested); // Store the flag
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
        value: credentials.filter((c) => c.selfAttested === true).length,
        status: "SELF-ATTESTED",
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
      let filtered;
      if (status === "SELF-ATTESTED") {
        filtered = credentials.filter(
          (credential) => credential.selfAttested === true
        );
      } else {
        filtered = credentials.filter(
          (credential) => credential.status === status
        );
      }
      setSelectedCredential(null);
      setSelectedLogo("");
      setFilteredCredentials(filtered);
    } else {
      setSelectedCredential(null);
      setSelectedLogo("");
      setFilteredCredentials(credentials); // Show all credentials if no status
    }
  };

  const handleCredentialAdded = async (credentialType: string) => {
    console.log(`${credentialType} credential was added successfully`);
    // Refresh the credentials list
    await fetchCredentials();
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
          onShareClick={handleProofShared}
        />
      )}

      {issuanceModalOpen && (
        <IssuanceModal
          open={issuanceModalOpen}
          onClose={handleCloseIssuanceModal}
          credentialData={issuanceCredentialData}
        />
      )}

      <Grid2 size={12} display={"flex"} justifyContent={"space-between"} mb={3}>
        <Typography variant="h5" fontWeight={500}>
          Credential Overview
        </Typography>
      </Grid2>

      {/* Search bar here
      <Grid2 container mb={2} justifyContent={"end"}>
        <Grid2 size={5}>
          <SearchBar onSearchChange={handleSearchChange} />
        </Grid2>
      </Grid2> */}
      <Grid2 container justifyContent={"end"}>
        <SelfAttestedCred onCredentialAdded={handleCredentialAdded}/>
      </Grid2>

      <Grid2
        container
        mt={3}
        spacing={2}
        sx={{ fontFamily: "Inter, sans-serif" }}
      >
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
                      name: isSelfAttested
                        ? selectedCredential?.credential?.type?.[1] || ""
                        : selectedCredential?.credential?.jsonld?.type?.[1] ||
                          "",
                      iconUrl: isSelfAttested
                        ? "/images/ndilogodark.svg"
                        : selectedLogo,
                    }}
                  />
                </Grid2>
                <Grid2 container size={7} spacing={3}>
                  <Grid2 size={12}>
                    <Typography variant="h6">Credential Attributes</Typography>
                  </Grid2>
                  {Object.keys(
                    isSelfAttested
                      ? selectedCredential?.credential?.credentialSubject || {}
                      : selectedCredential?.credential?.jsonld
                          ?.credentialSubject || {}
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
                            isSelfAttested
                              ? selectedCredential?.credential
                                  ?.credentialSubject?.[field] || ""
                              : selectedCredential?.credential?.jsonld
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
                  onClick={() => {
                    handleCardClick(
                      credential.credentialsId,
                      credential.selfAttested
                    );
                    setSelectedLogo(credential.connection?.imageUrl);
                  }}
                />
              </Grid2>
            ))
          )}
        </Grid2>
      )}
    </Box>
  );
}
