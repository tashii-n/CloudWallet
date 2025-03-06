import { Box, Button, Grid2, Stack, Typography } from "@mui/material";
import Image from "next/image";

import ImageList from "../ImageLIst/imagelist";
// import styles from "./landingpage.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <Box sx={{ mt: 7 }}>
      <Grid2 container sx={{ justifyContent: "center" }}>
        <Grid2 container size={{ md: 10 }} sx={{}} spacing={{ md: 10 }}>
          <Grid2 size={{ md: 6 }}>
            <Typography variant="h2" fontWeight={600} sx={{ mb: 5 }}>
              Bhutan{" "}
              <span className="ndigreen">
                NDI <br />
                <i>Cloud</i>{" "}
              </span>{" "}
              <i>Wallet</i>
            </Typography>

            <p>
              The Bhutan NDI Cloud Wallet enables secure sharing of digital
              identity credentials, ensuring privacy, security, and full user
              control.
            </p>

            <br />
            <Stack direction="row" spacing={3} sx={{ mt: 10 }}>
              <Button
                LinkComponent={Link}
                href="/signup"
                variant="contained"
                sx={{
                  minWidth: "200px",
                  backgroundColor: "#5AC994",
                  textTransform: "none",
                  color: "white",
                }}
              >
                Sign Up
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
          </Grid2>
          <Grid2 size={{ md: 6 }}>
            <Image
              src="/images/landingpage1.svg"
              alt="Landing Page Image"
              width={500}
              height={350}
            />
          </Grid2>
          <Grid2 container size={{ md: 12 }}>
            <Grid2 size={{ md: 5 }}>
              <Typography variant="h4" fontWeight={600}>
                Integration Partners
              </Typography>
              <br />
              <p>
                We have successfully integrated with companies for seamless use
                of the services.
              </p>
            </Grid2>
            <ImageList />
          </Grid2>
        </Grid2>
      </Grid2>
    </Box>
  );
}
