import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  IconButton,
  IconButtonProps,
  Stack,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Close as CloseIcon,
  DeleteOutline as DeleteOutlineIcon,
} from "@mui/icons-material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { deleteCredential } from "@/app/lib/api_utils/onboardingAPI";

// Import your API function

interface DeleteCredentialModalProps {
  credentialId: string;
  isSelfAttested: boolean;
  credentialName?: string;
  buttonProps?: Partial<IconButtonProps>;
  onDeleteSuccess?: () => void; // Optional callback for success handling
  onDeleteError?: (error: any) => void; // Optional callback for error handling
}

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  minWidth: 500,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 4,
};

const DeleteCredentialModal: React.FC<DeleteCredentialModalProps> = ({
  credentialId,
  isSelfAttested,
  credentialName = "credential",
  buttonProps = {},
  onDeleteSuccess,
  onDeleteError,
}) => {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleConfirm = async () => {
    setIsDeleting(true);

    try {
      // Use your deleteCredential API function
      await deleteCredential(credentialId, isSelfAttested);

      // Success handling
      setOpen(false);
      setSnackbarMessage(`${credentialName} deleted successfully`);
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }

      console.log("Credential deleted successfully");
    } catch (error) {
      console.error("Error deleting credential:", error);
      setSnackbarMessage(`Failed to delete ${credentialName}`);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      
      if (onDeleteError) {
        onDeleteError(error);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Delete Trigger Button */}
      <IconButton
        onClick={handleOpen}
        color="error"
        aria-label="delete credential"
        sx={{
          "&:hover": {
            backgroundColor: "error.light",
            color: "white",
          },
          ...buttonProps.sx, // Allow custom styling
        }}
        {...buttonProps} // Spread any additional props
      >
        <DeleteOutlineIcon />
      </IconButton>

      {/* Delete Confirmation Modal */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box textAlign="center" sx={modalStyle}>
          <Typography
            id="modal-modal-title"
            color="error"
            fontWeight={600}
            variant="h5"
            component="h2"
            gutterBottom
            mb={2}
          >
            Delete Credential {credentialName}
          </Typography>

          <Typography
            id="modal-modal-description"
            mt={1}
            mb={4}
            fontWeight={500}
          >
            Are you sure you want to delete this credential?
          </Typography>

          <Stack direction={"row"} justifyContent={"center"} spacing={1}>
            <WarningAmberIcon color="warning" />
            <Typography>This action cannot be undone.</Typography>
          </Stack>

          <Stack
            direction="row"
            spacing={0}
            mt={5}
            justifyContent="space-around"
          >
            <Button
              onClick={handleClose}
              variant="outlined"
              color="primary"
              sx={{
                borderRadius: "30px",
                minWidth: "180px",
                textTransform: "none",
              }}
              disabled={isDeleting}
            >
              Not Now
            </Button>
            <Button
              onClick={handleConfirm}
              variant="contained"
              color="error"
              sx={{
                borderRadius: "30px",
                minWidth: "180px",
                textTransform: "none",
                minHeight: "40px",
              }}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default DeleteCredentialModal;