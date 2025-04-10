"use client";
import {
  getProofPresentationAPI,
  getCredentialsForRequestAPI,
  acceptProofRequestAPI,
  getProofCredentialMatchTest,
  getProofPresentationTest,
  declineProofRequestAPI,
} from "@/app/lib/api_utils/onboardingAPI";
import {
  Box,
  Button,
  Modal,
  Stack,
  TextField,
  Typography,
  MenuItem,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import Image from "next/image";
import React, { useEffect, useState } from "react";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

type ProofShareModalProps = {
  open: boolean;
  handleClose: () => void;
  logoURL: string | undefined;
  verifierName: string;
  recordId: string;
};

interface ValueOption {
  value: string;
  id: string;
  revocationStatus?: string;
}

export default function ProofShareModal({
  open,
  handleClose,
  logoURL,
  verifierName,
  recordId,
}: ProofShareModalProps) {
  const [loading, setLoading] = useState(false);
  const [requestedData, setRequestedData] = useState<{
    [key: string]: ValueOption[];
  }>({});
  const [selectedData, setSelectedData] = useState<{
    [key: string]: ValueOption;
  }>({});
  const [inputDescriptors, setInputDescriptors] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState(false);
  const [anyRevoked, setAnyRevoked] = useState(false);

  const [hasMissingFields, setHasMissingFields] = useState(false);

  // Update this useEffect to check for both revoked and missing fields
  useEffect(() => {
    const hasRevoked = Object.values(selectedData).some(
      (item) =>
        item.revocationStatus &&
        item.revocationStatus !== "ACTIVE" &&
        item.revocationStatus !== "NOT_FOUND"
    );

    const hasMissing = Object.values(selectedData).some(
      (item) =>
        item.value === "Not Found" || item.revocationStatus === "NOT_FOUND"
    );

    setAnyRevoked(hasRevoked);
    setHasMissingFields(hasMissing);
  }, [selectedData]);

  useEffect(() => {
    const fetchProofData = async () => {
      if (!open) return;

      setLoading(true);
      setError(null);
      try {
        const proofPresentation = await getProofPresentationAPI(recordId);
        // const proofPresentation = await getProofPresentationTest();
        // const matchingCredentials = await getCredentialsForRequestAPI(recordId);
        const matchingCredentials = await getProofCredentialMatchTest();

        const result: { [key: string]: ValueOption[] } = {};

        const descriptors =
          proofPresentation.request.presentationExchange.presentation_definition
            .input_descriptors;
        setInputDescriptors(descriptors);

        descriptors.forEach((inputDescriptor: any) => {
          const submissionEntry =
            matchingCredentials.proofFormats.presentationExchange.requirements.find(
              (req: any) =>
                req.submissionEntry.some(
                  (entry: any) => entry.inputDescriptorId === inputDescriptor.id
                )
            )?.submissionEntry;

          // Check if we have any verifiable credentials for this input
          let hasCredentials = false;

          submissionEntry?.forEach((entry: any) => {
            if (
              entry.verifiableCredentials &&
              entry.verifiableCredentials.length > 0
            ) {
              hasCredentials = true;
              entry.verifiableCredentials.forEach((vc: any) => {
                const credential = vc.credentialRecord.credential;
                const credentialId = vc.credentialRecord.id;
                const credentialSubject = credential.credentialSubject;
                // Check for both casing variants of revocation status
                const status =
                  vc.revocationStatus || vc.revocationstatus || "ACTIVE";

                inputDescriptor.constraints.fields.forEach((field: any) => {
                  const match = field.path[0].match(/\['(.+?)'\]/);
                  const fieldName = match ? match[1] : "";
                  const value = credentialSubject[fieldName];
                  if (value) {
                    if (!result[fieldName]) result[fieldName] = [];
                    if (
                      !result[fieldName].some(
                        (v) => v.value === value && v.id === credentialId
                      )
                    ) {
                      result[fieldName].push({
                        value,
                        id: credentialId,
                        revocationStatus: status,
                      });
                    }
                  }
                });
              });
            }
          });

          // If no credentials found for this input, add "Not Found" placeholders
          if (!hasCredentials) {
            inputDescriptor.constraints.fields.forEach((field: any) => {
              const match = field.path[0].match(/\['(.+?)'\]/);
              const fieldName = match ? match[1] : "";

              if (!result[fieldName]) result[fieldName] = [];

              // Only add "Not Found" if we don't have any values for this field yet
              if (result[fieldName].length === 0) {
                result[fieldName].push({
                  value: "Not Found",
                  id: "not-found",
                  revocationStatus: "NOT_FOUND",
                });
              }
            });
          }
        });

        const initialSelected: { [key: string]: ValueOption } = {};
        for (const [key, values] of Object.entries(result)) {
          initialSelected[key] = values[0];
        }

        setRequestedData(result);
        setSelectedData(initialSelected);
      } catch (err) {
        console.error("❌ Error fetching proof data:", err);
        setError("Failed to fetch proof request. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (open) fetchProofData();
  }, [open]);

  const handleDeny = async () => {
    try {
      await declineProofRequestAPI(recordId);
    } catch (err) {
      console.error("❌ Error declining proof:", err);
      setError("Failed to deny proof request. Please try again.");
    }
  };

  const handleShare = async () => {
    try {
      setLoading(true);
      const credentialMap: { [inputId: string]: string } = {};

      inputDescriptors.forEach((descriptor) => {
        descriptor.constraints.fields.forEach((field: any) => {
          const match = field.path[0].match(/\['(.+?)'\]/);
          const fieldName = match ? match[1] : "";
          if (
            selectedData[fieldName] &&
            selectedData[fieldName].id !== "not-found" &&
            selectedData[fieldName].revocationStatus !== "NOT_FOUND"
          ) {
            credentialMap[descriptor.id] = selectedData[fieldName].id;
          }
        });
      });

      const payload = {
        proofFormats: {
          presentationExchange: {
            credentials: credentialMap,
          },
        },
        proofRecordId: recordId,
      };

      console.log("📤 Proof Payload:", JSON.stringify(payload, null, 2));
      await acceptProofRequestAPI(payload);

      setSuccessMessage(true);
      handleClose();
    } catch (err) {
      console.error("❌ Error sending proof:", err);
      setError("Failed to send proof. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={(event, reason) => {
          if (reason !== "backdropClick") {
            handleClose();
          }
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        disableEscapeKeyDown
      >
        <Box textAlign="center" borderRadius={4} sx={modalStyle}>
          <Typography
            id="modal-modal-title"
            color="primary"
            fontWeight={600}
            variant="h5"
            gutterBottom
            mb={2}
          >
            Proof Share Request
          </Typography>
          <Image
            src={logoURL || "/images/ndilogodark.svg"}
            width={50}
            height={50}
            alt="logo"
            unoptimized
          />
          <Typography id="modal-modal-description" mt={2} mb={4}>
            {verifierName} would like to request you to share the following
            data.
          </Typography>

          {loading ? (
            <CircularProgress />
          ) : error ? (
            <Typography color="error" mt={2}>
              {error}
            </Typography>
          ) : Object.keys(requestedData).length === 0 ? (
            <Typography>
              No matching credentials found for this request.
            </Typography>
          ) : (
            Object.entries(requestedData).map(([label, values]) => (
              <TextField
                key={label}
                fullWidth
                select={values.length > 1 && values[0].value !== "Not Found"}
                label={label}
                variant="outlined"
                name={label}
                value={selectedData[label]?.value || ""}
                onChange={(e) => {
                  const selectedValue = values.find(
                    (v) => v.value === e.target.value
                  );
                  if (selectedValue) {
                    setSelectedData((prev) => ({
                      ...prev,
                      [label]: selectedValue,
                    }));
                  }
                }}
                sx={{ marginBottom: "16px" }}
                disabled={
                  values.length === 1 || values[0].value === "Not Found"
                }
                slotProps={{
                  select: {
                    renderValue: (selected) => {
                      const selectedItem = values.find(
                        (val) => val.value === selected
                      );
                      return (
                        <Typography>
                          {selectedItem?.value}
                          {selectedItem?.revocationStatus &&
                          selectedItem.revocationStatus !== "ACTIVE" &&
                          selectedItem.revocationStatus !== "NOT_FOUND"
                            ? ` (${selectedItem.revocationStatus})`
                            : ""}
                        </Typography>
                      );
                    },
                  },
                }}
              >
                {values.map((val) => (
                  <MenuItem
                    key={val.id}
                    value={val.value}
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography>{val.value}</Typography>
                    <Typography color="red">
                      {val.revocationStatus &&
                      val.revocationStatus !== "ACTIVE" &&
                      val.revocationStatus !== "NOT_FOUND"
                        ? val.revocationStatus
                        : ""}
                    </Typography>
                  </MenuItem>
                ))}
              </TextField>
            ))
          )}

          <Stack
            direction="row"
            spacing={3}
            mt={4}
            justifyContent="space-around"
          >
            <Button
              onClick={() => {
                handleDeny();
                handleClose();
              }}
              variant="outlined"
              color="error"
              sx={{
                borderRadius: "30px",
                minWidth: "180px",
                textTransform: "none",
              }}
            >
              Deny
            </Button>
            <Button
              onClick={handleShare}
              disabled={loading || anyRevoked || hasMissingFields}
              sx={{
                borderRadius: "30px",
                minWidth: "180px",
                backgroundColor: "#5AC994",
                color: "white",
                textTransform: "none",
                minHeight: "40px",
              }}
            >
              {loading ? "Sharing..." : "Share"}
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Snackbar
        open={successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage(false)}
        message="Proof successfully shared!"
      />
    </>
  );
}
