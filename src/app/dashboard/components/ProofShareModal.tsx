"use client";
import {
  getProofPresentationTest,
  getProofCredentialMatchTest,
  getProofPresentationAPI,
  getCredentialsForRequestAPI,
  acceptProofRequestAPI,
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
} from "@mui/material";
import Image from "next/image";
import React, { useEffect, useState } from "react";

// Modal styling
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

  // Fetch proof data when modal opens
  useEffect(() => {
    const fetchProofData = async () => {
      if (!open) return; // Only fetch if modal is open

      setLoading(true);
      try {
        const proofPresentation = await getProofPresentationAPI(recordId);
        const matchingCredentials = await getCredentialsForRequestAPI(recordId);

        // Function to process and extract requested values
        const extractRequestedValues = (data: any, proofCredential: any) => {
          const result: { [key: string]: ValueOption[] } = {};
          const descriptors =
            data.request.presentationExchange.presentation_definition
              .input_descriptors;
          setInputDescriptors(descriptors);

          descriptors.forEach((inputDescriptor: any) => {
            const submissionEntry =
              proofCredential.proofFormats.presentationExchange.requirements.find(
                (req: any) =>
                  req.submissionEntry.some(
                    (entry: any) =>
                      entry.inputDescriptorId === inputDescriptor.id
                  )
              )?.submissionEntry;

            submissionEntry?.forEach((entry: any) => {
              entry.verifiableCredentials.forEach((vc: any) => {
                const credentialSubject =
                  vc.credentialRecord.credential.credentialSubject;
                const credentialId = vc.credentialRecord.id;

                inputDescriptor.constraints.fields.forEach((field: any) => {
                  const match = field.path[0].match(/\['(.+?)'\]/);
                  const fieldName = match ? match[1] : "";
                  const value = credentialSubject[fieldName];
                  if (value) {
                    if (!result[fieldName]) result[fieldName] = [];
                    result[fieldName].push({ value, id: credentialId });
                  }
                });
              });
            });
          });

          return result;
        };

        const requested = extractRequestedValues(
          proofPresentation,
          matchingCredentials
        );
        const initialSelected: { [key: string]: ValueOption } = {};

        for (const [key, values] of Object.entries(requested)) {
          initialSelected[key] = values[0]; // Preselect the first value by default
        }

        setRequestedData(requested);
        setSelectedData(initialSelected);
      } catch (err) {
        console.error("❌ Error fetching proof data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchProofData(); // Fetch data when modal opens
    }
  }, [open]);

  // Share proof data
  const handleShare = async () => {
    try {
      setLoading(true);
      const credentialMap: { [inputId: string]: string } = {};

      inputDescriptors.forEach((descriptor) => {
        const field = descriptor.constraints.fields[0];
        const match = field.path[0].match(/\['(.+?)'\]/);
        const fieldName = match ? match[1] : "";
        if (selectedData[fieldName]) {
          credentialMap[descriptor.id] = selectedData[fieldName].id;
        }
      });

      const payload = {
        proofFormats: {
          presentationExchange: {
            credentials: credentialMap,
          },
        },
        proofRecordId: recordId,
      };

      console.log("📤 Proof Payload:");
      console.log(JSON.stringify(payload, null, 2));
      const acceptRequest = await acceptProofRequestAPI(payload);
      console.log("🚀 ~ handleShare ~ acceptRequest:", acceptRequest);

      // Placeholder for sending proof
      // await sendProof(payload);

      handleClose(); // Close modal after sharing
    } catch (err) {
      console.error("❌ Error sending proof:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box textAlign="center" borderRadius={4} border="none" sx={modalStyle}>
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
          src={logoURL ? logoURL : "/images/ndilogodark.svg"}
          width={50}
          height={50}
          alt="Error"
          unoptimized
        />
        <Typography id="modal-modal-description" mt={2} mb={4}>
          {verifierName} would like to request you to share the following data.
        </Typography>

        {loading ? (
          <CircularProgress /> // Show loading spinner while fetching data
        ) : (
          requestedData &&
          Object.entries(requestedData).map(([label, values]) => (
            <TextField
              key={label}
              fullWidth
              select={values.length > 1}
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
              disabled={values.length === 1}
            >
              {values.map((val) => (
                <MenuItem key={val.id} value={val.value}>
                  <Typography textAlign={"start"}>{val.value}</Typography>
                </MenuItem>
              ))}
            </TextField>
          ))
        )}

        <Stack direction="row" spacing={3} mt={4} justifyContent="space-around">
          <Button
            onClick={handleClose}
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
            disabled={loading} // Disable while loading
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
  );
}
