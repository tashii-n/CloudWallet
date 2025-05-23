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
  maxHeight: "90vh", // Add maximum height
  display: "flex",
  flexDirection: "column", // Stack children vertically
};

type ProofShareModalProps = {
  open: boolean;
  handleClose: () => void;
  logoURL: string | undefined;
  verifierName: string;
  recordId: string;
  onShareClick?: () => void;
};

interface ValueOption {
  value: string;
  id: string;
  revocationStatus?: string;
  orgLogo?: string | null;
}

export default function ProofShareModal({
  open,
  handleClose,
  logoURL,
  verifierName,
  recordId,
  onShareClick,
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
  const [status, setStatus] = useState<string | null>(null);

  const [hasMissingFields, setHasMissingFields] = useState(false);

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
        const matchingCredentials = await getCredentialsForRequestAPI(recordId);
        // const matchingCredentials = await getProofCredentialMatchTest();

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

                const orgLogo = vc.orgLogo || "/images/ndilogodark.svg";

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
                        orgLogo: orgLogo,
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
                  orgLogo: null,
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
      setStatus("DENIED");
    } catch (err) {
      console.error("❌ Error declining proof:", err);
      setError("Failed to deny proof request. Please try again.");
    }
  };

  const handleShare = async () => {
    if (onShareClick) {
      onShareClick(); // Call this before sending the proof
    }
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
      setStatus("SHARED");
      // handleClose();
    } catch (err) {
      console.error("❌ Error sending proof:", err);
      setError("Failed to send proof. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Function to create a unique key for each dropdown item
  const getCompositeKey = (item: ValueOption) => {
    return `${item.value}_${item.id}_${item.revocationStatus || "active"}`;
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
          {!status ? (
            <>
              <Box textAlign={"center"}>
                <Image
                  src={logoURL || "/images/ndilogodark.svg"}
                  width={60}
                  height={60}
                  alt="logo"
                  unoptimized
                />
              </Box>
              <Typography id="modal-modal-description" mt={2} mb={4}>
                {verifierName} would like to request you to share the following
                data.
              </Typography>
            </>
          ) : status == "SHARED" ? (
            <>
              <Typography
                color="primary.main"
                variant="h5"
                fontWeight={500}
                mb={3}
              >
                Proof Share Successful
              </Typography>
            </>
          ) : (
            <>
              <>
                <Typography
                  color="primary.main"
                  variant="h5"
                  fontWeight={500}
                  mb={3}
                >
                  Proof Deny Successful
                </Typography>
              </>
            </>
          )}

          {/* Wrap the scrollable content in a Box with overflow */}

          <Box
            sx={{
              overflowY: "auto",
              flex: "1 1 auto",
              maxHeight: "calc(90vh - 390px)", // Adjust based on header/footer height
              mb: 2,
              py: 1,
            }}
          >
            {loading ? (
              <CircularProgress />
            ) : error ? (
              <Typography color="error" mt={2}>
                {error}
              </Typography>
            ) : Object.keys(requestedData).length === 0 ? (
              <>
                <Typography>
                  No matching credentials found for this request.
                </Typography>
              </>
            ) : status ? (
              <>
                <Image
                  src={"/images/success.svg"}
                  width={150}
                  height={150}
                  alt="Success Image"
                />
                <Typography mt={2}>
                  You have {status.toLocaleLowerCase()} proof for {verifierName}{" "}
                  successfully.
                </Typography>
              </>
            ) : (
              Object.entries(requestedData).map(([label, values]) => {
                const isMultiple =
                  values.length > 1 && values[0].value !== "Not Found";

                // Create a composite value that includes both value and id to ensure uniqueness
                const selectedItem = selectedData[label] || values[0];
                // For select fields, use composite key; for non-select fields, use just the value
                const displayValue = isMultiple
                  ? getCompositeKey(selectedItem)
                  : selectedItem.value;

                return (
                  <TextField
                    key={label}
                    fullWidth
                    select={isMultiple}
                    label={label}
                    variant="outlined"
                    name={label}
                    value={displayValue}
                    onChange={(e) => {
                      if (isMultiple) {
                        // For dropdown fields, find item by composite key
                        const selectedValue = e.target.value;
                        const selectedItem = values.find(
                          (item) => getCompositeKey(item) === selectedValue
                        );

                        if (selectedItem) {
                          setSelectedData((prev) => ({
                            ...prev,
                            [label]: selectedItem,
                          }));
                        }
                      } else {
                        // For non-dropdown fields, find by value (should not happen but just in case)
                        const selectedValue = e.target.value;
                        const selectedItem = values.find(
                          (v) => v.value === selectedValue
                        );

                        if (selectedItem) {
                          setSelectedData((prev) => ({
                            ...prev,
                            [label]: selectedItem,
                          }));
                        }
                      }
                    }}
                    sx={{ marginBottom: "16px" }}
                    disabled={
                      values.length === 1 || values[0].value === "Not Found"
                    }
                    slotProps={{
                      select: {
                        // Only for dropdown fields - render the actual item data
                        renderValue: () => (
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            justifyContent={"space-between"}
                            sx={{ width: "100%" }}
                          >
                            <Stack direction={"row"} spacing={2}>
                              {selectedItem?.orgLogo === "NotFound" ? (
                                <Image
                                  src="/images/ndilogodark.svg"
                                  width={25}
                                  height={25}
                                  alt="logo"
                                  unoptimized
                                />
                              ) : selectedItem?.orgLogo ? (
                                <>
                                  <Image
                                    src={selectedItem.orgLogo}
                                    width={25}
                                    height={25}
                                    alt="logo"
                                    unoptimized
                                  />
                                </>
                              ) : (
                                <Image
                                  src="/images/ndilogodark.svg"
                                  width={25}
                                  height={25}
                                  alt="logo"
                                  unoptimized
                                />
                              )}
                              <Typography sx={{ flexGrow: 1 }}>
                                {selectedItem?.value}
                              </Typography>
                            </Stack>
                            {selectedItem?.revocationStatus &&
                            selectedItem.revocationStatus !== "ACTIVE" &&
                            selectedItem.revocationStatus !== "NOT_FOUND" ? (
                              <Typography color="red">
                                ({selectedItem.revocationStatus})
                              </Typography>
                            ) : null}
                          </Stack>
                        ),
                      },
                      input: {
                        endAdornment:
                          !isMultiple &&
                          selectedItem?.revocationStatus &&
                          selectedItem.revocationStatus !== "ACTIVE" &&
                          selectedItem.revocationStatus !== "NOT_FOUND" ? (
                            <Typography color="red">
                              ({selectedItem.revocationStatus})
                            </Typography>
                          ) : null,
                        startAdornment:
                          !isMultiple &&
                          selectedItem.revocationStatus !== "NOT_FOUND" ? (
                            selectedItem?.orgLogo === "NotFound" ? (
                              <Box
                                mr={2}
                                display={"flex"}
                                alignItems={"center"}
                                justifyContent={"center"}
                              >
                                <Image
                                  src="/images/ndilogodark.svg"
                                  width={25}
                                  height={25}
                                  alt="logo"
                                  unoptimized
                                />
                              </Box>
                            ) : selectedItem?.orgLogo ? (
                              <>
                                <Image
                                  src={selectedItem.orgLogo}
                                  width={25}
                                  height={25}
                                  alt="logo"
                                  unoptimized
                                />
                              </>
                            ) : (
                              <Image
                                src="/images/ndilogodark.svg"
                                width={25}
                                height={25}
                                alt="logo"
                                unoptimized
                              />
                            )
                          ) : null,
                      },
                    }}
                  >
                    {values.map((val) => (
                      <MenuItem
                        key={getCompositeKey(val)}
                        value={getCompositeKey(val)}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          width: "100%",
                        }}
                      >
                        {val?.orgLogo === "NotFound" ? (
                          <Image
                            src="/images/ndilogodark.svg"
                            width={25}
                            height={25}
                            alt="logo"
                            unoptimized
                          />
                        ) : val?.orgLogo ? (
                          <>
                            <Image
                              src={val.orgLogo}
                              width={25}
                              height={25}
                              alt="logo"
                              unoptimized
                            />
                          </>
                        ) : (
                          <Image
                            src="/images/ndilogodark.svg"
                            width={25}
                            height={25}
                            alt="logo"
                            unoptimized
                          />
                        )}
                        <Typography sx={{ flexGrow: 1 }}>
                          {val.value}
                        </Typography>
                        {val.revocationStatus &&
                        val.revocationStatus !== "ACTIVE" &&
                        val.revocationStatus !== "NOT_FOUND" ? (
                          <Typography color="red">
                            ({val.revocationStatus})
                          </Typography>
                        ) : null}
                      </MenuItem>
                    ))}
                  </TextField>
                );
              })
            )}
          </Box>
          {!status ? (
            <>
              <Stack
                direction="row"
                spacing={3}
                mt={4}
                justifyContent="space-around"
              >
                <Button
                  onClick={() => {
                    handleDeny();
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
            </>
          ) : (
            <>
              <Button
                onClick={handleClose}
                sx={{
                  mt: 3,
                  borderRadius: "30px",
                  minWidth: "180px",
                  backgroundColor: "#5AC994",
                  color: "white",
                  textTransform: "none",
                  minHeight: "40px",
                }}
              >
                Close
              </Button>
            </>
          )}
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
