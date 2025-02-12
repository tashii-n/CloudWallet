import {
  Typography,
  Box,
  Grid2,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Stack,
  Button,
  SelectChangeEvent,
  Modal,
  Backdrop,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Link from "next/link";
import CustomNumberInput from "../../Common/customnumberinput";
import dzongkhagData from "../../../lib/address.json";
import { useState } from "react";
import React from "react";
import { Dayjs } from "dayjs";
import { onboardingValidateAPI } from "@/app/lib/api_utils/onboardingAPI";
import { secureStore } from "@/app/lib/storage/storage";
import Image from "next/image";
import { useRouter } from "next/navigation";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
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

export default function SignupForm() {

  const router = useRouter();
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
  const [agreeToTerms, setAgreeToTerms] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

  const handleAgreeToTermsChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setAgreeToTerms(event.target.checked);
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
      secureStore("onboardingData", JSON.stringify(response));
      router.push("/signup/biometric"); 
      setIsLoading(false);
      // Handle the API response as needed
      // console.log("API Response:", response);
    } catch (error) {
      setIsLoading(false);
      console.error("API call failed:", error);
      throw new Error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <>
      <Backdrop open={isLoading} sx={{ color: "#fff", zIndex: 1301 }}>
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
          {/* <Typography variant="h5" color="black" mt={2} textAlign={'center'}>
            Validating...
          </Typography> */}
        </Box>
      </Backdrop>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Start <span className="ndigreen">Onboarding</span> with Us!
      </Typography>
      <p>
        Create an account and start managing your credentials securely and
        seamlessly.
      </p>

      <Box
        component="form"
        // noValidate
        onSubmit={handleSubmit}
        action={"/"}
        method="POST"
        autoComplete="off"
        marginTop={3}
        sx={{
          mx: "auto",
          borderRadius: 2,
        }}
      >
        <Grid2
          marginBottom={4}
          container
          spacing={2}
          // border="1px solid"
          // borderRadius={2}
          // borderColor="primary.main"
          // padding={3}
        >
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
              <InputLabel id="gender-select">Select Citizenship</InputLabel>

              <Select
                id="gender-select"
                fullWidth
                label="Select Citizenship"
                variant="outlined"
                name="citizenship"
                disabled
                value={selectedCitizenship}
                onChange={handleCitizenshipChange}
                // value={"Bhutanese"}
              >
                <MenuItem value={"Bhutanese"}>Bhutanese</MenuItem>
                <MenuItem value={"Non Bhutanese"}>Non Bhutanese</MenuItem>
              </Select>
            </FormControl>
          </Grid2>

          {/* Row 3 */}
          <Grid2 size={6}>
            <FormControl fullWidth>
              <InputLabel id="gender-select">Select ID Type</InputLabel>

              <Select
                id="gender-select"
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
                disabled={!gewogs.length} // Disable if no gewogs available
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

        <FormControlLabel
          control={
            <Checkbox
              color="primary"
              required
              checked={agreeToTerms}
              onChange={handleAgreeToTermsChange}
            />
          }
          label={
            <>
              I agree to the{" "}
              <a
                href="https://www.bhutanndi.com/terms-of-services"
                className="ndigreen"
                target="_blank"
              >
                Terms and Privacy
              </a>
            </>
          }
        />

        <Stack
          direction="row"
          spacing={3}
          marginTop={2}
          justifyContent="space-between"
        >
          <Button
            type="submit"
            // onClick={handleOpen}
            disabled={!agreeToTerms}
            variant="contained"
            sx={{
              minWidth: "200px",
              backgroundColor: "#5AC994",
              textTransform: "none",
              color: "white",
              minHeight: "40px",
            }}
          >
            Continue
          </Button>
          <Button
            LinkComponent={Link}
            href="/login"
            variant="outlined"
            sx={{
              minWidth: "200px",
              borderColor: "#5AC994",
              borderWidth: "2px",
              color: "black",
              textTransform: "none",
            }}
          >
            Login
          </Button>
        </Stack>

        {/* <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box textAlign="center" borderRadius={4} sx={modalStyle}>
            <Image
              src="images/success.svg"
              width={110}
              height={110}
              alt="Success"
            />
            <Typography
              id="modal-modal-title"
              color="primary"
              fontWeight={600}
              variant="h6"
              component="h2"
              mt={2}
            >
              Successfully submitted!
            </Typography>
            <Typography id="modal-modal-description" mt={2}>
              
              Please click on "Next" to proceed.
            </Typography>
            <Button
              type="submit"
              variant="contained"
              sx={{
                color: "white",
                minWidth: 110,
                borderRadius: 15,
                mt: 4,
                textTransform: "none",
              }}
            >
              Next
            </Button>
          </Box>
        </Modal> */}
      </Box>
    </>
  );
}
