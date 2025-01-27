import Directions from "@/app/components/LandingPageMain/Directions/Directions";
import Footer from "@/app/components/LandingPageMain/Footer/footer";
import Header from "@/app/components/LandingPageMain/Header/Header";
import {Box, Checkbox, Grid2, Typography } from "@mui/material";
import Image from "next/image";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

export default function BiometricPage() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      minHeight="100vh" // Ensures the full height is utilized
    >
      <Header />
      <Box
        flex="1"
        display="flex"
        justifyContent="center"
        alignItems="center"
        mt={3}
      >
        <Grid2
          container
          spacing={10}
          justifyContent="center"
          alignItems="stretch" // Ensures children have the same height
          sx={{ width: "100%" }}
        >
          {/* Left Section */}
          <Grid2
            size={{ xs: 12, md: 5 }}
            textAlign="center"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Directions />
          </Grid2>

          {/* Right Section */}
          <Grid2
            size={{ xs: 12, md: 5 }}
            textAlign="center"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Box
              bgcolor={"#def4ea"}
              //   border={"solid green 1px"}
              paddingX={5}
              paddingY={5}
              borderRadius={5}
              width="100%"
              height="100%" // Ensures it stretches to match height
            >
              <Grid2
                container
                size={12}
                bgcolor="white"
                justifyContent="space-around"
                py={2}
                borderRadius={15}
              >
                <Grid2 size={5.3} bgcolor="#80808038" borderRadius={15}>
                  <Typography variant="caption">
                    <Checkbox
                      size="small"
                      disabled
                      checked={true}
                      icon={<RadioButtonUncheckedIcon />}
                      checkedIcon={<CheckCircleIcon />}
                    />
                    Image Validation Successfull
                  </Typography>
                </Grid2>
                <Grid2 size={5.3} bgcolor="#80808038" borderRadius={15}>
                  <Typography variant="caption">
                    <Checkbox
                      size="small"
                      disabled
                      checked={true}
                      icon={<RadioButtonUncheckedIcon />}
                      checkedIcon={<CheckCircleIcon />}
                    />
                    Data Validation Successfull
                  </Typography>
                </Grid2>
              </Grid2>
              <Box
                textAlign="center"
                mt={4}
                py={2}
                bgcolor="white"
                borderRadius={5}
                pb={10}
              >
                <Typography variant="h6" component="h2" gutterBottom>
                  Validating your photo
                </Typography>
                <Typography variant="body2" mb={5}>
                  Please wait while your photo is being validated with DCRC
                </Typography>
                <Image
                  src="/images/spinner.gif"
                  width={170}
                  height={170}
                  alt={""}
                />
              </Box>
            </Box>
          </Grid2>
        </Grid2>
      </Box>
      <Box textAlign="center" mt={2}>
        <Typography
          variant="caption"
          bgcolor="#fff7e5"
          py={1}
          px={2}
          borderRadius={5}
          color="#e6b944"
        >
          Note : Do not refresh, close or click the back button in this page as
          validation process may get canceled.
        </Typography>
      </Box>
      <Footer />
    </Box>
  );
}
