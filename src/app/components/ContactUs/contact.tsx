"use client";

import {
  Box,
  Button,
  Grid2,
  InputLabel,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";

export default function ContactUs() {
  return (
    <Box maxWidth={"1200px"} mx="auto" mt={4}>
      <Grid2 container spacing={2}>
        <Grid2 size={6}>
          <Typography variant="h3" fontWeight={500} mb={2}>
            <span className="ndigreen">Get In Touch</span> With Us
          </Typography>
          <Typography variant="body1" mb={5}>
            Need help with the NDI Cloud Wallet? Whether you have questions,
            feedback, or need technical support, we are here to assist you.
            Reach out through the options below, and our team will get back to
            you as soon as possible.
          </Typography>
          <Box mb={5}>
            <Stack direction={"row"} spacing={4} mb={3}>
              <Image
                src={"/images/location.svg"}
                height={50}
                width={50}
                alt="Location logo"
              ></Image>
              <Box>
                <Typography fontWeight={600} variant="body1">
                  Our Location
                </Typography>
                <Typography variant="subtitle2" fontWeight={400}>
                  TechPark, Babesa, Thimphu
                </Typography>
              </Box>
            </Stack>
            <Stack direction={"row"} spacing={4} mb={3}>
              <Image
                src={"/images/contact.svg"}
                height={50}
                width={50}
                alt="Contact logo"
              ></Image>
              <Box>
                <Typography fontWeight={600} variant="body1">
                  Phone Number
                </Typography>
                <Typography variant="subtitle2" fontWeight={400}>
                  +975 17112086
                </Typography>
              </Box>
            </Stack>
            <Stack direction={"row"} spacing={4} mb={3}>
              <Image
                src={"/images/email.svg"}
                height={50}
                width={50}
                alt="Email logo"
              ></Image>
              <Box>
                <Typography fontWeight={600} variant="body1">
                  Email Address
                </Typography>
                <Typography variant="subtitle2" fontWeight={400}>
                  ndifeedback@dhi.bt
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Box>
            <Typography
              variant="h4"
              color="primary.main"
              fontWeight={500}
              gutterBottom
            >
              Socials
            </Typography>
            <Typography mb={2}>
              Follow us on our socials so you never miss out on the latest news
              and updates.
            </Typography>
            <Stack direction={"row"} spacing={3}>
              <Link
                href="https://www.linkedin.com/company/bhutan-ndi/"
                target="_blank"
              >
                <Image
                  src="/images/linkedin.svg"
                  alt="LinkedIn Logo"
                  width={40}
                  height={40}
                />
              </Link>
              <Link href="https://www.instagram.com/bhutanndi/" target="_blank">
                <Image
                  src="/images/instagram.svg"
                  alt="Instagram Logo"
                  width={40}
                  height={40}
                />
              </Link>
              <Link
                href="https://www.facebook.com/p/Bhutan-NDI-61551076655472/"
                target="_blank"
              >
                <Image
                  src="/images/facebook.svg"
                  alt="Facebook Logo"
                  width={40}
                  height={40}
                />
              </Link>
              <Link href="http://www.youtube.com/@BhutanNDI" target="_blank">
                <Image
                  src="/images/youtube.svg"
                  alt="Youtube Logo"
                  width={40}
                  height={40}
                />
              </Link>
            </Stack>
          </Box>
        </Grid2>

        {/* Inquiry section */}
        {/* bgcolor={"#F8F8F8"} */}
        <Grid2
          size={6}
          padding={3}
          borderRadius={3}
          display={"flex"}
          flexDirection={"column"}
          alignItems={"center"}
          justifyContent={"center"}
        >
          <Image
            src="/images/contactuslandingimage.png"
            alt="Contact Us Image"
            width={540}
            height={350}
          />

          {/* <Typography variant="h4" color="primary.main" fontWeight={600} mb={3}>
            General Inquiry
          </Typography>
          <Typography mb={2}>
            Tell us what's working, what's not, or what features you'd like to
            see.
          </Typography>

          <Box>
            <Grid2 container spacing={2}>
              <Grid2 size={6}>
                <InputLabel shrink={false} htmlFor={"firstname"}>
                  <Typography variant="subtitle2" gutterBottom>
                    First Name *
                  </Typography>
                </InputLabel>
                <TextField
                  id="firstname"
                  size="small"
                  variant="outlined"
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#141B290D",
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                      },
                    },
                  }}
                />
              </Grid2>
              <Grid2 size={6}>
                <InputLabel shrink={false} htmlFor={"lastname"}>
                  <Typography variant="subtitle2" gutterBottom>
                    Last Name *
                  </Typography>
                </InputLabel>
                <TextField
                  id="lastname"
                  size="small"
                  variant="outlined"
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#141B290D",
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                      },
                    },
                  }}
                />
              </Grid2>
              <Grid2 size={12}>
                <InputLabel shrink={false} htmlFor={"email"}>
                  <Typography variant="subtitle2" gutterBottom>
                    Email *
                  </Typography>
                </InputLabel>
                <TextField
                  size="small"
                  id="email"
                  variant="outlined"
                  fullWidth
                  type="email"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#141B290D",
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                      },
                    },
                  }}
                />
              </Grid2>
              <Grid2 size={12}>
                <InputLabel shrink={false} htmlFor={"contact"}>
                  <Typography variant="subtitle2" gutterBottom>
                    Contact Number (optional)
                  </Typography>
                </InputLabel>
                <TextField
                  size="small"
                  id="contact"
                  variant="outlined"
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#141B290D",
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                      },
                    },
                  }}
                />
              </Grid2>
              <Grid2 size={12}>
                <InputLabel shrink={false} htmlFor={"message"}>
                  <Typography variant="subtitle2" gutterBottom>
                    Message *
                  </Typography>
                </InputLabel>
                <TextField
                  id="message"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={4}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#141B290D",
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                      },
                    },
                  }}
                />
              </Grid2>
              <Grid2 size={12} mt={2}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{ color: "white" }}
                >
                  Submit
                </Button>
              </Grid2>
            </Grid2>
          </Box> */}
        </Grid2>
      </Grid2>
    </Box>
  );
}
