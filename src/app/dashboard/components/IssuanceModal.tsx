import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { TextField } from "@mui/material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  maxHeight: "90vh",
  display: "flex",
  flexDirection: "column",
  borderRadius: 3,
};

interface CredentialData {
  [key: string]: any;
}

interface IssuanceModalProps {
  open: boolean;
  onClose: () => void;
  credentialData?: CredentialData;
}

export default function IssuanceModal({
  open,
  onClose,
  credentialData,
}: IssuanceModalProps) {
  // Function to render credential data fields excluding revocation_id and id
  const renderCredentialFields = () => {
    if (!credentialData) return null;

    const excludedFields = ["revocation_id", "id"];
    
    return Object.entries(credentialData)
      .filter(([key]) => !excludedFields.includes(key))
      .map(([key, value]) => (
        <Box key={key} sx={{ mb: 2 }}>
          <TextField
            label={key}
            value={value}
            fullWidth
            disabled
            variant="outlined"
            // size="small"
          />
        </Box>
      ));
  };

  return (
    <div>
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} textAlign={"center"}>
          {/* Fixed header section */}
          <Typography variant="h6" component="h2" mb={3} color="primary.main" fontWeight={500}>
            New Credential Received
          </Typography>
          
          <Typography mb={3}>
            You have been issued a new credential. Please check the details below.
          </Typography>
          
          {/* Scrollable content area */}
          <Box 
            sx={{ 
              mb: 3, 
              width: "100%",
              overflow: "auto", 
              maxHeight: "50vh", // Control the max height of the scrollable area
              py:2,
              pr: 1, // Add a bit of padding for the scrollbar
            }}
          >
            {renderCredentialFields()}
          </Box>
          
          {/* Fixed footer section */}
          <Button
            onClick={onClose}
            sx={{
              mt: 1,
              borderRadius: "30px",
              minWidth: "180px",
              backgroundColor: "#5AC994",
              color: "white",
              textTransform: "none",
              minHeight: "40px",
              "&:hover": {
                backgroundColor: "#49b683",
              },
            }}
          >
            Close
          </Button>
        </Box>
      </Modal>
    </div>
  );
}