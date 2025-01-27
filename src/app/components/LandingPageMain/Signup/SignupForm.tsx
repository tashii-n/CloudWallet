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
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Link from "next/link";
import CustomNumberInput from "../../Common/customnumberinput";
import dzongkhagData from "../../../lib/address.json";
import { useState } from "react";
import React from "react";

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
  gewogId: string;
  gewogName: string;
}

interface Dzongkhag {
  dzongkhagSerialNo: number;
  dzongkhagId: string;
  dzongkhagName: string;
  gewogs: Gewog[];
}

export default function SignupForm() {
  const dzongkhags: Dzongkhag[] = dzongkhagData.dzongkhags;

  const [selectedDzongkhag, setSelectedDzongkhag] = useState<string>("");
  const [gewogs, setGewogs] = useState<Gewog[]>([]);
  const [selectedGewog, setSelectedGewog] = useState<string>("");

  // const [open, setOpen] = React.useState(false);
  // const handleOpen = () => setOpen(true);
  // const handleClose = () => setOpen(false);

  const handleDzongkhagChange = (event: SelectChangeEvent<string>) => {
    const dzongkhagId = event.target.value;
    setSelectedDzongkhag(dzongkhagId);

    const dzongkhag = dzongkhags.find((dz) => dz.dzongkhagId === dzongkhagId);
    if (dzongkhag) {
      setGewogs(dzongkhag.gewogs);
      setSelectedGewog(""); // Reset gewog selection
    }
  };

  const handleGewogChange = (event: SelectChangeEvent<string>) => {
    setSelectedGewog(event.target.value);
  };

  return (
    <>
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
              required
            />
          </Grid2>
          <Grid2 size={6}>
            <FormControl fullWidth>
              <InputLabel id="gender-select">Gender</InputLabel>

              <Select
                required
                id="gender-select"
                fullWidth
                label="Gender"
                variant="outlined"
                name="lastName"
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
              >
                <MenuItem value={"Bhutanese"}>Bhutanese</MenuItem>
                <MenuItem value={"Non Bhutanese"}>Non Bhutanese</MenuItem>
              </Select>
            </FormControl>
          </Grid2>
          <Grid2 size={6}>
            <CustomNumberInput
              id="cidnumber"
              name="cidnumber"
              label="Citizenship ID Number"
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
                    key={dzongkhag.dzongkhagId}
                    value={dzongkhag.dzongkhagId}
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
                  <MenuItem key={gewog.gewogId} value={gewog.gewogId}>
                    {gewog.gewogName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid2>
        </Grid2>

        <FormControlLabel
          control={<Checkbox color="primary" required />}
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
