// ProofShareModal.tsx

"use client";
import {
  Box,
  Button,
  Modal,
  Stack,
  TextField,
  Typography,
  MenuItem,
} from "@mui/material";
import Image from "next/image";
import React, { useState } from "react";

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
  requestedData: { [key: string]: { value: string; id: string }[] };
  selectedData: { [key: string]: { value: string; id: string } };
  setSelectedData: React.Dispatch<
    React.SetStateAction<{
      [key: string]: { value: string; id: string };
    }>
  >;
  inputDescriptors: any[];
};

export default function ProofShareModal({
  open,
  handleClose,
  requestedData,
  selectedData,
  setSelectedData,
  inputDescriptors,
}: ProofShareModalProps) {
  const [loading, setLoading] = useState(false);

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
        // proofRecordId intentionally removed
      };
  
      console.log("📤 Proof Payload:");
      console.log(JSON.stringify(payload, null, 2));
  
      // await sendProof(payload);
  
      // handleClose();
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
        <Image src="/images/error.svg" width={150} height={50} alt="Error" />
        <Typography id="modal-modal-description" mt={2} mb={3}>
          G2C would like to request you to share the following data
        </Typography>

        {Object.entries(requestedData).map(([label, values]) => (
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
              <MenuItem
                key={val.id}
                value={val.value}
                sx={{ textAlign: "start" }}
              >
                {val.value}
              </MenuItem>
            ))}
          </TextField>
        ))}

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
            disabled={loading}
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
