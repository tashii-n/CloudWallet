import {
  Typography,
  Box,
  Grid2,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Button,
  SelectChangeEvent,
  Modal,
  Backdrop,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CustomNumberInput from "../Common/customnumberinput";
import dzongkhagData from "../../lib/data/address.json";
import { useState } from "react";
import React from "react";
import { Dayjs } from "dayjs";
import { onboardingValidateAPI } from "@/app/lib/api_utils/onboardingAPI";
import { secureStore } from "@/app/lib/storage/storage";
import Image from "next/image";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90vw",
  maxWidth: 800,
  maxHeight: "90vh",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  overflow: "auto",
};

const errorModalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

interface Gewog {
  gewogSerialNo: number;
  gewogName: string;
}

interface Dzongkhag {
  dzongkhagSerialNo: number;
  dzongkhagName: string;
  gewogs: Gewog[];
}

interface OnboardingFormPopupProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function OnboardingFormPopup({
  open,
  onClose,
  onSuccess,
}: OnboardingFormPopupProps) {
  const dzongkhags: Dzongkhag[] = dzongkhagData.dzongkhags;

  const [fullname, setFullname] = useState<string>("");
  const [selectedDzongkhag, setSelectedDzongkhag] = useState<string>("");
  const [gewogs, setGewogs] = useState<Gewog[]>([]);
  const [selectedGewog, setSelectedGewog] = useState<string>("");
  const [selectedGender, setSelectedGender] = useState<string>("");
  const [selectedCitizenship, setSelectedCitizenship] =
    useState<string>("Bhutanese");
  const [selectedIDType, setSelectedIDType] = useState<string>("Citizenship");
  const [cidNumber, setCidNumber] = useState<string>("");
  const [dob, setDob] = useState<Dayjs | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [validateFailed, setValidateFailed] = useState<boolean>(false);

  const handleErrorModalClose = () => {
    setValidateFailed(false);
  };

  // Handlers
  const handleFullNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFullname(event.target.value);
  };

  const handleDzongkhagChange = (event: SelectChangeEvent<string>) => {
    const dzongkhagName = event.target.value;
    setSelectedDzongkhag(dzongkhagName);

    const dzongkhag = dzongkhags.find(
      (dz) => dz.dzongkhagName === dzongkhagName
    );
    if (dzongkhag) {
      setGewogs(dzongkhag.gewogs);
      setSelectedGewog(""); // Reset gewog selection
    }
  };

  const handleGewogChange = (event: SelectChangeEvent<string>) => {
    setSelectedGewog(event.target.value);
  };

  const handleGenderChange = (event: SelectChangeEvent<string>) => {
    setSelectedGender(event.target.value);
  };

  const handleCitizenshipChange = (event: SelectChangeEvent<string>) => {
    setSelectedCitizenship(event.target.value);
  };

  const handleIDTypeChange = (event: SelectChangeEvent<string>) => {
    setSelectedIDType(event.target.value);
  };

  const handleCidNumberChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCidNumber(event.target.value);
  };

  const handleDobChange = (date: Dayjs | null) => {
    setDob(date);
  };

  // Check if all required fields are filled
  const isFormValid = () => {
    return (
      fullname.trim() !== "" &&
      selectedGender !== "" &&
      selectedCitizenship !== "" &&
      selectedIDType !== "" &&
      cidNumber.trim() !== "" &&
      selectedDzongkhag !== "" &&
      selectedGewog !== "" &&
      dob !== null
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const formData = {
      fullName: fullname,
      gender: selectedGender,
      citizenship: selectedCitizenship,
      idType: selectedIDType,
      idNumber: cidNumber,
      dzongkhagName: selectedDzongkhag,
      gewogName: selectedGewog,
    };

    try {
      setIsLoading(true);
      const response = await onboardingValidateAPI(formData);
      await secureStore("onboardingData", JSON.stringify(response));
    //   console.log("🚀 ~ handleSubmit ~ response:", response);

      setIsLoading(false);
      onSuccess(); // Call the success callback to proceed with onboarding
    } catch (error) {
      setIsLoading(false);
      setValidateFailed(true);
      console.error("API call failed:", error);
    }
  };

  return (
    <>
      <Backdrop open={isLoading} sx={{ color: "#fff", zIndex: 1302 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            padding: 4,
            borderRadius: 2,
          }}
        >
          <Image
            src="/images/spinner.gif"
            width={150}
            height={150}
            alt="Loading..."
            unoptimized
          />
        </Box>
      </Backdrop>

      <Modal
        open={open}
        onClose={() => {}}
        disableEscapeKeyDown
        aria-labelledby="onboarding-form-title"
        aria-describedby="onboarding-form-description"
      >
        <Box sx={modalStyle} m={3}>
          <Typography
            id="onboarding-form-title"
            variant="h5"
            fontWeight={600}
            gutterBottom
          >
            Complete Your{" "}
            <span style={{ color: "#5AC994" }}>Profile Setup</span>
          </Typography>
          <Typography
            id="onboarding-form-description"
            variant="body1"
            gutterBottom
            mb={2}
          >
            Some additional information is required to set up your digital
            wallet and complete your login.
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            autoComplete="off"
            sx={{
              mt: 2,
            }}
          >
            <Grid2 marginBottom={4} container spacing={2}>
              {/* Row 1 */}
              <Grid2 size={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  variant="outlined"
                  name="fullname"
                  value={fullname}
                  onChange={handleFullNameChange}
                  required
                />
              </Grid2>
              <Grid2 size={6}>
                <FormControl fullWidth>
                  <InputLabel id="gender-select">Gender</InputLabel>
                  <Select
                    id="gender-select"
                    value={selectedGender}
                    onChange={handleGenderChange}
                    label="Gender"
                    name="gender"
                    required
                  >
                    <MenuItem value={"Male"}>Male</MenuItem>
                    <MenuItem value={"Female"}>Female</MenuItem>
                  </Select>
                </FormControl>
              </Grid2>

              {/* Row 2 */}
              <Grid2 size={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    name="dob"
                    label="Date of Birth"
                    sx={{ width: "100%" }}
                    format="DD/MM/YYYY"
                    value={dob}
                    onChange={handleDobChange}
                  />
                </LocalizationProvider>
              </Grid2>
              <Grid2 size={6}>
                <FormControl fullWidth>
                  <InputLabel id="citizenship-select">
                    Select Citizenship
                  </InputLabel>
                  <Select
                    id="citizenship-select"
                    fullWidth
                    label="Select Citizenship"
                    variant="outlined"
                    name="citizenship"
                    disabled
                    value={selectedCitizenship}
                    onChange={handleCitizenshipChange}
                  >
                    <MenuItem value={"Bhutanese"}>Bhutanese</MenuItem>
                    <MenuItem value={"Non Bhutanese"}>Non Bhutanese</MenuItem>
                  </Select>
                </FormControl>
              </Grid2>

              {/* Row 3 */}
              <Grid2 size={6}>
                <FormControl fullWidth>
                  <InputLabel id="idtype-select">Select ID Type</InputLabel>
                  <Select
                    id="idtype-select"
                    fullWidth
                    label="Select ID Type"
                    variant="outlined"
                    name="idtype"
                    value={selectedIDType}
                    onChange={handleIDTypeChange}
                    disabled
                  >
                    <MenuItem value={"Citizenship"}>National ID Card</MenuItem>
                  </Select>
                </FormControl>
              </Grid2>

              <Grid2 size={6}>
                <CustomNumberInput
                  id="cidnumber"
                  name="cidnumber"
                  label="Citizenship ID Number"
                  value={cidNumber}
                  onChange={handleCidNumberChange}
                  required
                />
              </Grid2>

              {/* Row 4 */}
              <Grid2 size={6}>
                <FormControl fullWidth>
                  <InputLabel id="dzongkhag-select-label">Dzongkhag</InputLabel>
                  <Select
                    id="dzongkhag-select"
                    value={selectedDzongkhag}
                    onChange={handleDzongkhagChange}
                    label="Dzongkhag"
                    required
                  >
                    {dzongkhags.map((dzongkhag) => (
                      <MenuItem
                        key={dzongkhag.dzongkhagSerialNo}
                        value={dzongkhag.dzongkhagName}
                      >
                        {dzongkhag.dzongkhagName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid2>

              {/* Gewog Selection */}
              <Grid2 size={6}>
                <FormControl fullWidth>
                  <InputLabel id="gewog-select-label">Gewog</InputLabel>
                  <Select
                    id="gewog-select"
                    value={selectedGewog}
                    onChange={handleGewogChange}
                    label="Gewog"
                    disabled={!gewogs.length}
                    required
                  >
                    {gewogs.map((gewog) => (
                      <MenuItem key={gewog.gewogName} value={gewog.gewogName}>
                        {gewog.gewogName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid2>
            </Grid2>

            <Stack
              direction="row"
              spacing={3}
              marginTop={2}
              justifyContent="center"
            >
              <Button
                type="submit"
                variant="contained"
                sx={{
                  minWidth: "200px",
                  backgroundColor: "#5AC994",
                  textTransform: "none",
                  color: "white",
                  minHeight: "40px",
                }}
              >
                Complete Setup
              </Button>
            </Stack>
          </Box>
        </Box>
      </Modal>

      {/* Error Modal */}
      <Modal
        open={validateFailed}
        onClose={handleErrorModalClose}
        aria-labelledby="error-modal-title"
        aria-describedby="error-modal-description"
      >
        <Box textAlign="center" borderRadius={4} sx={errorModalStyle}>
          <Image
            src="/images/errorred.svg"
            width={150}
            height={150}
            alt="Error"
          />
          <Typography
            id="error-modal-title"
            variant="h6"
            color="red"
            gutterBottom
            mt={3}
          >
            INVALID INFORMATION !
          </Typography>
          <Typography id="error-modal-description" gutterBottom m={3}>
            The information you provided appears to be incorrect, incomplete or
            not found at the source. Please ensure your data is correct and try
            again.
          </Typography>
          <Button
            onClick={handleErrorModalClose}
            variant="contained"
            sx={{
              minWidth: "180px",
              backgroundColor: "#c43e3d",
              textTransform: "none",
              color: "white",
              minHeight: "40px",
              borderRadius: 10,
            }}
          >
            Try Again
          </Button>
        </Box>
      </Modal>
    </>
  );
}