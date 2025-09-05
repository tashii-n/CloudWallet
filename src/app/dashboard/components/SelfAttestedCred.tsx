"use client";

import React, { useState } from "react";
import {
  Button,
  Menu,
  MenuItem,
  Modal,
  Box,
  Typography,
  TextField,
  Stack,
  Select,
  SelectChangeEvent,
  FormControl,
  InputLabel,
  Grid2,
  FormHelperText,
  Alert,
  Snackbar,
} from "@mui/material";
import CustomNumberInput from "@/app/components/Common/customnumberinput";
import AddIcon from "@mui/icons-material/Add";
import { addSelfAttestedAPI } from "@/app/lib/api_utils/onboardingAPI";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  minWidth: 600,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

interface DropdownModalButtonProps {
  onCredentialAdded?: (credentialType: string) => void;
}

export default function DropdownModalButton({ onCredentialAdded }: DropdownModalButtonProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openModal, setOpenModal] = useState<string | null>(null);

  // Form states
  const [mobileNumber, setMobileNumber] = useState<string>("");
  const [selectedMobileType, setSelectedMobileType] = useState<string>("");
  const [allergyType, setAllergyType] = useState("");
  const [allergicTo, setAllergicTo] = useState("");
  const [email, setEmail] = useState("");
  const [unit, setUnit] = useState("");
  const [building, setBuilding] = useState("");
  const [street, setStreet] = useState("");
  const [suburb, setSuburb] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [landmark, setLandmark] = useState("");

  // Form validation states
  const [errors, setErrors] = useState({
    mobileNumber: "",
    mobileType: "",
    allergyType: "",
    allergicTo: "",
    email: "",
    unit: "",
    building: "",
    street: "",
    suburb: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    landmark: "",
  });

  // Form submission states
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success and error message states
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const [modalAlert, setModalAlert] = useState<{
    show: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    show: false,
    message: "",
    severity: "success",
  });

  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOptionSelect = (option: string) => {
    setOpenModal(option);
    handleMenuClose();
    // Reset errors and alerts when opening a new modal
    setErrors({
      mobileNumber: "",
      mobileType: "",
      allergyType: "",
      allergicTo: "",
      email: "",
      unit: "",
      building: "",
      street: "",
      suburb: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      landmark: "",
    });
    setModalAlert({ show: false, message: "", severity: "success" });
  };

  const handleCloseModal = () => {
    setOpenModal(null);
    setIsSubmitting(false);
    setModalAlert({ show: false, message: "", severity: "success" });
    // Reset form fields
    setMobileNumber("");
    setSelectedMobileType("");
    setAllergyType("");
    setAllergicTo("");
    setEmail("");
    setUnit("");
    setBuilding("");
    setStreet("");
    setSuburb("");
    setCity("");
    setState("");
    setCountry("");
    setPostalCode("");
    setLandmark("");
  };

  const showSuccessMessage = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarSeverity("success");
    setShowSnackbar(true);
  };

  const showErrorMessage = (message: string, inModal = false) => {
    if (inModal) {
      setModalAlert({
        show: true,
        message,
        severity: "error",
      });
    } else {
      setSnackbarMessage(message);
      setSnackbarSeverity("error");
      setShowSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
  };

  const handleMobileNumberChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setMobileNumber(value);

    // Clear error and modal alert when user starts typing
    if (errors.mobileNumber) {
      setErrors((prev) => ({ ...prev, mobileNumber: "" }));
    }
    if (modalAlert.show) {
      setModalAlert({ show: false, message: "", severity: "success" });
    }
  };

  const handleMobileTypeChange = (event: SelectChangeEvent<string>) => {
    setSelectedMobileType(event.target.value);

    // Clear error and modal alert when user selects an option
    if (errors.mobileType) {
      setErrors((prev) => ({ ...prev, mobileType: "" }));
    }
    if (modalAlert.show) {
      setModalAlert({ show: false, message: "", severity: "success" });
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateMobileNumber = (number: string) => {
    // Check length is exactly 8 digits
    const isValidLength = /^\d{8}$/.test(number);

    // Check prefix starts with 17 or 77
    const hasValidPrefix = /^(17|77)/.test(number);

    return {
      isValidLength,
      hasValidPrefix,
      isValid: isValidLength && hasValidPrefix,
    };
  };

  const validateRequired = (value: string, fieldName: string) => {
    if (!value.trim()) {
      return `${fieldName} is required`;
    }
    return "";
  };

  const validateMobileForm = () => {
    let mobileNumberError = validateRequired(mobileNumber, "Mobile Number");

    if (!mobileNumberError && mobileNumber) {
      const mobileValidation = validateMobileNumber(mobileNumber);

      if (!mobileValidation.isValidLength) {
        mobileNumberError = "Mobile number must be exactly 8 digits";
      }

      if (!mobileValidation.hasValidPrefix) {
        mobileNumberError = mobileNumberError
          ? `${mobileNumberError} and must start with 17 or 77`
          : "Mobile number must start with 17 or 77";
      }
    }

    const newErrors = {
      mobileNumber: mobileNumberError,
      mobileType: validateRequired(selectedMobileType, "Mobile Type"),
      allergyType: "",
      allergicTo: "",
      email: "",
      unit: "",
      building: "",
      street: "",
      suburb: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      landmark: "",
    };

    setErrors(newErrors);
    return !newErrors.mobileNumber && !newErrors.mobileType;
  };

  const validateAllergyForm = () => {
    const newErrors = {
      mobileNumber: "",
      mobileType: "",
      allergyType: validateRequired(allergyType, "Allergy Type"),
      allergicTo: validateRequired(allergicTo, "Allergic To"),
      email: "",
      unit: "",
      building: "",
      street: "",
      suburb: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      landmark: "",
    };

    setErrors(newErrors);
    return !newErrors.allergyType && !newErrors.allergicTo;
  };

  const validateEmailForm = () => {
    const emailError =
      validateRequired(email, "Email") ||
      (!validateEmail(email) ? "Please enter a valid email address" : "");

    const newErrors = {
      mobileNumber: "",
      mobileType: "",
      allergyType: "",
      allergicTo: "",
      email: emailError,
      unit: "",
      building: "",
      street: "",
      suburb: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      landmark: "",
    };

    setErrors(newErrors);
    return !newErrors.email;
  };

  const validateAddressForm = () => {
    const newErrors = {
      mobileNumber: "",
      mobileType: "",
      allergyType: "",
      allergicTo: "",
      email: "",
      unit: validateRequired(unit, "Unit"),
      building: validateRequired(building, "Building"),
      street: validateRequired(street, "Street"),
      suburb: validateRequired(suburb, "Suburb"),
      city: validateRequired(city, "City"),
      state: validateRequired(state, "State"),
      country: validateRequired(country, "Country"),
      postalCode: validateRequired(postalCode, "Postal Code"),
      landmark: validateRequired(landmark, "Landmark"),
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleShare = async (modalType: string) => {
    setIsSubmitting(true);
    setModalAlert({ show: false, message: "", severity: "success" });

    let isValid = false;

    switch (modalType) {
      case "Mobile Number":
        isValid = validateMobileForm();
        break;
      case "Allergy":
        isValid = validateAllergyForm();
        break;
      case "Email":
        isValid = validateEmailForm();
        break;
      case "Current Address":
        isValid = validateAddressForm();
        break;
      default:
        isValid = false;
    }

    if (!isValid) {
      setIsSubmitting(false);
      // showErrorMessage("Please fix the validation errors before submitting.", true);
      return;
    }

    let payload: { [key: string]: string } = {};

    if (modalType === "Mobile Number") {
      payload = {
        "Mobile Number": mobileNumber,
        Type: selectedMobileType,
      };
    } else if (modalType === "Allergy") {
      payload = {
        "Allergy Type": allergyType,
        "Allergic To": allergicTo,
      };
    } else if (modalType === "Email") {
      payload = {
        Email: email,
      };
    } else if (modalType === "Current Address") {
      payload = {
        Unit: unit,
        Building: building,
        Street: street,
        Suburb: suburb,
        City: city,
        State: state,
        Country: country,
        "Postal Code": postalCode,
        Landmark: landmark,
      };
    }

    try {
      // console.log("Payload:", payload);
      const response = await addSelfAttestedAPI(payload, modalType);
      console.log("Self-attested credential added");

      // Show success message and close modal after a brief delay
      showSuccessMessage(`${modalType} credential added successfully!`);
      
      if (onCredentialAdded) {
        await onCredentialAdded(modalType);
      }
      setTimeout(() => {
        handleCloseModal();
      }, 1000);
    } catch (error) {
      console.error("Failed to add self-attested credential:", error);
      showErrorMessage(
        `Failed to add ${modalType.toLowerCase()} credential. Please try again.`,
        true
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearFieldError = (fieldName: keyof typeof errors) => {
    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: "" }));
    }
    if (modalAlert.show) {
      setModalAlert({ show: false, message: "", severity: "success" });
    }
  };

  return (
    <div>
      <Button variant="contained" onClick={handleButtonClick}>
        <AddIcon /> &nbsp; Add Self Attested Credential
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleOptionSelect("Mobile Number")}>
          Mobile Number
        </MenuItem>
        <MenuItem onClick={() => handleOptionSelect("Allergy")}>
          Allergy
        </MenuItem>
        <MenuItem onClick={() => handleOptionSelect("Email")}>Email</MenuItem>
        <MenuItem onClick={() => handleOptionSelect("Current Address")}>
          Current Address
        </MenuItem>
      </Menu>

      {/* Mobile Number */}
      <Modal
        open={openModal === "Mobile Number"}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          component={"form"}
          textAlign="center"
          borderRadius={4}
          sx={modalStyle}
        >
          <Typography
            id="modal-modal-title"
            color="primary"
            fontWeight={600}
            variant="h5"
            component="h2"
            gutterBottom
            mb={2}
          >
            Self Attested Credential
          </Typography>

          <Typography
            id="modal-modal-description"
            mt={1}
            mb={4}
            fontWeight={500}
          >
            Mobile Number
          </Typography>

          {modalAlert.show && (
            <Alert
              severity={modalAlert.severity}
              sx={{ mb: 3 }}
              onClose={() =>
                setModalAlert({ show: false, message: "", severity: "success" })
              }
            >
              {modalAlert.message}
            </Alert>
          )}

          <Stack direction={"row"} spacing={3} textAlign={"start"}>
            <FormControl fullWidth error={!!errors.mobileNumber}>
              <CustomNumberInput
                id="mobileNumber"
                name="mobileNumber"
                label="Mobile Number"
                value={mobileNumber}
                onChange={handleMobileNumberChange}
                required={true}
                error={!!errors.mobileNumber}
              />
              {errors.mobileNumber && (
                <FormHelperText>{errors.mobileNumber}</FormHelperText>
              )}
            </FormControl>
            <FormControl fullWidth error={!!errors.mobileType}>
              <InputLabel id="mobileType">Select Type</InputLabel>

              <Select
                id="mobileType"
                fullWidth
                label="Select Type"
                variant="outlined"
                name="mobileType"
                value={selectedMobileType}
                onChange={handleMobileTypeChange}
                required
                error={!!errors.mobileType}
              >
                <MenuItem value={"Prepaid"}>Prepaid</MenuItem>
                <MenuItem value={"Postpaid"}>Postpaid</MenuItem>
              </Select>
              {errors.mobileType && (
                <FormHelperText>{errors.mobileType}</FormHelperText>
              )}
            </FormControl>
          </Stack>

          <Stack
            direction="row"
            spacing={0}
            mt={5}
            justifyContent="space-around"
          >
            <Button
              onClick={() => {
                handleCloseModal();
              }}
              variant="outlined"
              color="error"
              sx={{
                borderRadius: "30px",
                minWidth: "180px",
                textTransform: "none",
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              sx={{
                borderRadius: "30px",
                minWidth: "180px",
                backgroundColor: "#5AC994",
                color: "white",
                textTransform: "none",
                minHeight: "40px",
              }}
              onClick={() => handleShare("Mobile Number")}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add"}
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* Allergy */}
      <Modal
        open={openModal === "Allergy"}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          component={"form"}
          textAlign="center"
          borderRadius={4}
          sx={modalStyle}
        >
          <Typography
            id="modal-modal-title"
            color="primary"
            fontWeight={600}
            variant="h5"
            component="h2"
            gutterBottom
            mb={2}
          >
            Self Attested Credential
          </Typography>

          <Typography
            id="modal-modal-description"
            mt={1}
            mb={4}
            fontWeight={500}
          >
            Allergy
          </Typography>

          {modalAlert.show && (
            <Alert
              severity={modalAlert.severity}
              sx={{ mb: 3 }}
              onClose={() =>
                setModalAlert({ show: false, message: "", severity: "success" })
              }
            >
              {modalAlert.message}
            </Alert>
          )}

          <Stack direction={"row"} spacing={3} textAlign={"start"}>
            <TextField
              label="Allergy Type"
              fullWidth
              value={allergyType}
              onChange={(e) => {
                setAllergyType(e.target.value);
                clearFieldError("allergyType");
              }}
              required
              error={!!errors.allergyType}
              helperText={errors.allergyType}
            />
            <TextField
              label="Allergic To"
              fullWidth
              value={allergicTo}
              onChange={(e) => {
                setAllergicTo(e.target.value);
                clearFieldError("allergicTo");
              }}
              required
              error={!!errors.allergicTo}
              helperText={errors.allergicTo}
            />
          </Stack>

          <Stack
            direction="row"
            spacing={0}
            mt={5}
            justifyContent="space-around"
          >
            <Button
              onClick={() => {
                handleCloseModal();
              }}
              variant="outlined"
              color="error"
              sx={{
                borderRadius: "30px",
                minWidth: "180px",
                textTransform: "none",
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              sx={{
                borderRadius: "30px",
                minWidth: "180px",
                backgroundColor: "#5AC994",
                color: "white",
                textTransform: "none",
                minHeight: "40px",
              }}
              onClick={() => handleShare("Allergy")}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add"}
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* Email */}
      <Modal
        open={openModal === "Email"}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          component={"form"}
          textAlign="center"
          borderRadius={4}
          sx={modalStyle}
        >
          <Typography
            id="modal-modal-title"
            color="primary"
            fontWeight={600}
            variant="h5"
            component="h2"
            gutterBottom
            mb={2}
          >
            Self Attested Credential
          </Typography>

          <Typography
            id="modal-modal-description"
            mt={1}
            mb={4}
            fontWeight={500}
          >
            Email
          </Typography>

          {modalAlert.show && (
            <Alert
              severity={modalAlert.severity}
              sx={{ mb: 3 }}
              onClose={() =>
                setModalAlert({ show: false, message: "", severity: "success" })
              }
            >
              {modalAlert.message}
            </Alert>
          )}

          <Stack direction={"row"} spacing={3} textAlign={"start"}>
            <TextField
              label="Email"
              fullWidth
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearFieldError("email");
              }}
              required
              error={!!errors.email}
              helperText={errors.email}
              type="email"
            />
          </Stack>

          <Stack
            direction="row"
            spacing={0}
            mt={5}
            justifyContent="space-around"
          >
            <Button
              onClick={() => {
                handleCloseModal();
              }}
              variant="outlined"
              color="error"
              sx={{
                borderRadius: "30px",
                minWidth: "180px",
                textTransform: "none",
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              sx={{
                borderRadius: "30px",
                minWidth: "180px",
                backgroundColor: "#5AC994",
                color: "white",
                textTransform: "none",
                minHeight: "40px",
              }}
              onClick={() => handleShare("Email")}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add"}
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* Current Address */}
      <Modal
        open={openModal === "Current Address"}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          component={"form"}
          textAlign="center"
          borderRadius={4}
          sx={modalStyle}
        >
          <Typography
            id="modal-modal-title"
            color="primary"
            fontWeight={600}
            variant="h5"
            component="h2"
            gutterBottom
            mb={2}
          >
            Self Attested Credential
          </Typography>

          <Typography
            id="modal-modal-description"
            mt={1}
            mb={4}
            fontWeight={500}
          >
            Current Address
          </Typography>

          {modalAlert.show && (
            <Alert
              severity={modalAlert.severity}
              sx={{ mb: 3 }}
              onClose={() =>
                setModalAlert({ show: false, message: "", severity: "success" })
              }
            >
              {modalAlert.message}
            </Alert>
          )}

          <Grid2 spacing={2.3} container>
            <Grid2 size={6}>
              <TextField
                label="Unit"
                fullWidth
                value={unit}
                onChange={(e) => {
                  setUnit(e.target.value);
                  clearFieldError("unit");
                }}
                required
                error={!!errors.unit}
                helperText={errors.unit}
              />
            </Grid2>

            <Grid2 size={6}>
              <TextField
                label="Building"
                fullWidth
                value={building}
                onChange={(e) => {
                  setBuilding(e.target.value);
                  clearFieldError("building");
                }}
                required
                error={!!errors.building}
                helperText={errors.building}
              />
            </Grid2>

            <Grid2 size={6}>
              <TextField
                label="Street"
                fullWidth
                value={street}
                onChange={(e) => {
                  setStreet(e.target.value);
                  clearFieldError("street");
                }}
                required
                error={!!errors.street}
                helperText={errors.street}
              />
            </Grid2>

            <Grid2 size={6}>
              <TextField
                label="Suburb"
                fullWidth
                value={suburb}
                onChange={(e) => {
                  setSuburb(e.target.value);
                  clearFieldError("suburb");
                }}
                required
                error={!!errors.suburb}
                helperText={errors.suburb}
              />
            </Grid2>

            <Grid2 size={6}>
              <TextField
                label="City"
                fullWidth
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  clearFieldError("city");
                }}
                required
                error={!!errors.city}
                helperText={errors.city}
              />
            </Grid2>

            <Grid2 size={6}>
              <TextField
                label="State"
                fullWidth
                value={state}
                onChange={(e) => {
                  setState(e.target.value);
                  clearFieldError("state");
                }}
                required
                error={!!errors.state}
                helperText={errors.state}
              />
            </Grid2>
            <Grid2 size={6}>
              <TextField
                label="Country"
                fullWidth
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  clearFieldError("country");
                }}
                required
                error={!!errors.country}
                helperText={errors.country}
              />
            </Grid2>
            <Grid2 size={6}>
              <TextField
                label="Postal Code"
                fullWidth
                value={postalCode}
                onChange={(e) => {
                  setPostalCode(e.target.value);
                  clearFieldError("postalCode");
                }}
                required
                error={!!errors.postalCode}
                helperText={errors.postalCode}
              />
            </Grid2>
            <Grid2 size={6}>
              <TextField
                label="Landmark"
                fullWidth
                value={landmark}
                onChange={(e) => {
                  setLandmark(e.target.value);
                  clearFieldError("landmark");
                }}
                required
                error={!!errors.landmark}
                helperText={errors.landmark}
              />
            </Grid2>
          </Grid2>

          <Stack
            direction="row"
            spacing={0}
            mt={5}
            justifyContent="space-around"
          >
            <Button
              onClick={() => {
                handleCloseModal();
              }}
              variant="outlined"
              color="error"
              sx={{
                borderRadius: "30px",
                minWidth: "180px",
                textTransform: "none",
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              sx={{
                borderRadius: "30px",
                minWidth: "180px",
                backgroundColor: "#5AC994",
                color: "white",
                textTransform: "none",
                minHeight: "40px",
              }}
              onClick={() => handleShare("Current Address")}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add"}
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* Snackbar for global success/error messages */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}
