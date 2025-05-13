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
} from "@mui/material";
import CustomNumberInput from "@/app/components/Common/customnumberinput";
import AddIcon from "@mui/icons-material/Add";

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

export default function DropdownModalButton() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openModal, setOpenModal] = useState<string | null>(null);
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

  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOptionSelect = (option: string) => {
    setOpenModal(option);
    handleMenuClose();
  };

  const handleCloseModal = () => {
    setOpenModal(null);
  };

  const handleMobileNumberChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setMobileNumber(event.target.value);
  };

  const handleMobileTypeChange = (event: SelectChangeEvent<string>) => {
    setSelectedMobileType(event.target.value);
  };

  const handleShare = (modalType: string) => {
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
        "Landmark": landmark,

      };
    }

    console.log("Payload:", payload);
    console.log("Modal Type:", modalType);
    handleCloseModal();
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
          <Stack direction={"row"} spacing={3} textAlign={"start"}>
            <CustomNumberInput
              id="mobileNumber"
              name="mobileNumber"
              label="Mobile Number"
              value={mobileNumber}
              onChange={handleMobileNumberChange}
            />
            <FormControl fullWidth>
              <InputLabel id="mobileType">Select Type</InputLabel>

              <Select
                id="mobileType"
                fullWidth
                label="Select Type"
                variant="outlined"
                name="mobileType"
                value={selectedMobileType}
                onChange={handleMobileTypeChange}
              >
                <MenuItem value={"Prepaid"}>Prepaid</MenuItem>
                <MenuItem value={"Postpaid"}>Postpaid</MenuItem>
              </Select>
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
            >
              Share
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
          <Stack direction={"row"} spacing={3} textAlign={"start"}>
            <TextField
              label="Allergy Type"
              fullWidth
              value={allergyType}
              onChange={(e) => setAllergyType(e.target.value)}
              required
            />
            <TextField
              label="Allergic To"
              fullWidth
              value={allergicTo}
              onChange={(e) => setAllergicTo(e.target.value)}
              required
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
            >
              Share
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
          <Stack direction={"row"} spacing={3} textAlign={"start"}>
            <TextField
              label="Email"
              fullWidth
              value={allergyType}
              onChange={(e) => setEmail(e.target.value)}
              required
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
            >
              Share
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* Email */}
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
          {/* <Stack direction={"row"} spacing={3} textAlign={"start"}>
            
            <TextField
              label="Email"
              fullWidth
              value={allergyType}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Stack> */}
          <Grid2 spacing={2.3} container>
            <Grid2 size={6}>
              <TextField
                label="Unit"
                fullWidth
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                required
              />
            </Grid2>

            <Grid2 size={6}>
              <TextField
                label="Building"
                fullWidth
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                required
              />
            </Grid2>

            <Grid2 size={6}>
              <TextField
                label="Street"
                fullWidth
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                required
              />
            </Grid2>

            <Grid2 size={6}>
              <TextField
                label="Suburb"
                fullWidth
                value={suburb}
                onChange={(e) => setSuburb(e.target.value)}
                required
              />
            </Grid2>

            <Grid2 size={6}>
              <TextField
                label="City"
                fullWidth
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </Grid2>

            <Grid2 size={6}>
              <TextField
                label="State"
                fullWidth
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
              />
            </Grid2>
            <Grid2 size={6}>
              <TextField
                label="Country"
                fullWidth
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
              />
            </Grid2>
            <Grid2 size={6}>
              <TextField
                label="Postal Code"
                fullWidth
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                required
              />
            </Grid2>
            <Grid2 size={6}>
              <TextField
                label="Landmark"
                fullWidth
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                required
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
            >
              Share
            </Button>
          </Stack>
        </Box>
      </Modal>
    </div>
  );
}
