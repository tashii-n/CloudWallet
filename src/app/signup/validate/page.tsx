"use client";

import Directions from "@/app/components/LandingPageMain/Directions/Directions";
import Footer from "@/app/components/LandingPageMain/Footer/footer";
import Header from "@/app/components/LandingPageMain/Header/Header";
import {
  Box,
  Button,
  Checkbox,
  Grid2,
  Link,
  List,
  Typography,
} from "@mui/material";
import Image from "next/image";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { useEffect, useState, useRef } from "react";
import { secureClear, secureGet, secureStore } from "@/app/lib/storage/storage";
import { onboardingBiometricAPI } from "@/app/lib/api_utils/onboardingAPI";
import { useRouter } from "next/navigation";

export default function BiometricValidatePage() {
  const [validateSuccess, setValidateSuccess] = useState(false);
  const [newUser, setNewUser] = useState(false);

  const apiCalled = useRef(false);
  const maxRetries = 4; // Maximum number of retry attempts
  const router = useRouter();

  useEffect(() => {
    const fetchBiometricValidation = async (attempt = 1) => {
      if (apiCalled.current) return; // Prevent duplicate API calls in Strict Mode

      try {
        const onboardingDataString = await secureGet("onboardingData");
        const onboardingData = onboardingDataString
          ? JSON.parse(onboardingDataString)
          : null;

        if (!onboardingData) {
          throw new Error("No onboarding data found in session storage");
        }

        const imageData = sessionStorage.getItem("imageData") || "";

        const requestData = {
          idNumber: onboardingData["ID Number"],
          idType: onboardingData["ID Type"],
          onboardingUniqueId: onboardingData["onboardingUniqueId"],
          image: imageData,
        };

        console.log(onboardingData["onboardingUniqueId"]);

        // console.log(`Attempt ${attempt}: Calling Biometric API`, requestData);

        const response = await onboardingBiometricAPI(requestData);
        // console.log("API Response:", response);

        const scenario = response.scenario;

        apiCalled.current = true;

        await secureClear("imageData");

        setTimeout(() => {
          setValidateSuccess(true);
        }, 2000);
        if (response && scenario === "NEW_USER_ONBOARDING") {
          setNewUser(true);
          const pid = response?.personId;
          await secureStore("personId", pid);

          setTimeout(() => {
            router.push("/signup/review");
          }, 3000);
        } else {
          // console.log(
          //   "Scenario is not 'NEW_PERSON_ONBOARDING'. Redirect not triggered."
          // );
          setNewUser(false);
          // setTimeout(() => {
          //   router.push("/");
          // }, 4000);
        }
      } catch (error) {
        console.error(`Error on attempt ${attempt}:`, error);

        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(`Retrying in ${delay / 1000} seconds...`);

          await new Promise((resolve) => setTimeout(resolve, delay));

          fetchBiometricValidation(attempt + 1);
        } else {
          console.error("Max retries reached. API call failed.");
        }
      }
    };

    fetchBiometricValidation();
  }, []);

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
                      checked={true} // Always checked
                      sx={{
                        cursor: "default", // Removes pointer cursor
                        pointerEvents: "none", // Completely disables interaction
                        color: "grey.500", // Default gray color
                        "&.Mui-checked": {
                          color: validateSuccess ? "primary.main" : "grey.500", // Green if validated, otherwise gray
                        },
                      }}
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
                      checked={true} // Always checked
                      sx={{
                        cursor: "default", // Removes pointer cursor
                        pointerEvents: "none", // Completely disables interaction
                        color: "grey.500", // Default gray color
                        "&.Mui-checked": {
                          color: validateSuccess ? "primary.main" : "grey.500", // Green if validated, otherwise gray
                        },
                      }}
                      icon={<RadioButtonUncheckedIcon />}
                      checkedIcon={<CheckCircleIcon />}
                    />
                    Data Validation Successfull
                  </Typography>
                </Grid2>
              </Grid2>

              {/* Main Content */}
              <Box
                textAlign="center"
                mt={4}
                py={2}
                bgcolor="white"
                borderRadius={5}
                pb={validateSuccess ? 6 : 10}
              >
                {!validateSuccess ? (
                  <Box>
                    <Typography variant="h6" component="h2" gutterBottom>
                      Validating your photo
                    </Typography>
                    <Typography variant="body2" mb={5}>
                      Please wait while your photo is being validated with DCRC
                    </Typography>
                    <Image
                      unoptimized
                      src="/images/NDIlogospinner.gif"
                      width={170}
                      height={170}
                      alt={""}
                    />
                  </Box>
                ) : (
                  <Box>
                    {newUser ? (
                      <>
                        <Typography
                          variant="h5"
                          component="h2"
                          mt={1}
                          fontWeight={600}
                          color="primary.main"
                        >
                          SUCCESSFULL
                        </Typography>
                        <Image
                          src="/images/validate_success.svg"
                          width={270}
                          height={200}
                          alt={"Validation Success Image"}
                        />
                        <Grid2 size={8} mx="auto">
                          <Typography variant="body1" color="grey">
                            <span className="ndigreen">
                              <b>Congratulations</b>
                            </span>
                            , you have been successfully authenticated.
                          </Typography>
                        </Grid2>
                      </>
                    ) : (
                      <>
                        <Typography
                          variant="h5"
                          component="h2"
                          mt={1}
                          fontWeight={600}
                          color="primary.main"
                        >
                          Account Already Exists
                        </Typography>
                        <Image
                          src="/images/error.svg"
                          width={170}
                          height={170}
                          alt={"Validation Success Image"}
                        />
                        <Grid2 size={9} mx="auto" color="grey" fontSize={14.5}>
                          {/* <Typography
                            variant="body1"
                            color="grey"
                            gutterBottom
                            mb={3}
                          >
                            You already have an account with us. <br />
                            If your account is set up in Edge Wallet, please log in through the Edge Wallet app.
                          </Typography> */}
                          <p>It seems you already have an account with us.</p>
                          <br />
                          <ul>
                            <li>
                              If your account is set up in Edge Wallet, please
                              log in through the Edge Wallet app. Go to{" "}
                            <Link href="/" className="ndigreen">
                              home
                            </Link>{" "}
                            page.
                            </li>
                            <li>
                              If your account is in the Cloud Wallet, you can
                              log in{" "}
                              <Link href="/login" className="ndigreen">
                                here
                              </Link>{" "}
                              to continue.
                            </li>
                          </ul>
                          {/* <br />
                          <p>
                            Go to{" "}
                            <Link href="/" className="ndigreen">
                              home
                            </Link>{" "}
                            page
                          </p> */}
                          {/* <Button
                        
                            href="/login"
                            variant="contained"
                            sx={{
                              minWidth: "250px",
                              backgroundColor: "",
                              textTransform: "none",
                              color: "white",
                              minHeight: "60px",
                              borderRadius: "50px",
                              mt
                            }}
                          >
                            <Typography variant="body1">Go to Login</Typography>
                          </Button> */}
                        </Grid2>
                      </>
                    )}
                    {/* Success */}
                  </Box>
                )}
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
          the validation process may get cancelled.
        </Typography>
      </Box>

      <Footer />
    </Box>
  );
}
