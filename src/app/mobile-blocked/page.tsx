// pages/mobile-blocked.tsx or app/mobile-blocked/page.tsx
import { Box, Stack, Typography } from "@mui/material";
import Link from "next/link";
import Image from "next/image";

export default function MobileBlocked() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <Typography
        variant="h6"
        noWrap
        marginBottom="4rem"
        sx={{
          display: "flex",
          alignItems: "center",
          textDecoration: "none",
          fontFamily: "Belleza",
          fontWeight: 500,
        //   marginTop: "-5rem",
        }}
      >
        <Image
          src="/images/ndilogodark.svg"
          alt="NDI Logo"
          width={50}
          height={50}
        />
        <span style={{ marginLeft: "15px" }}>
          Bhutan{"  "}
          <span className={"ndigreen"}>
            NDI <br />
            Cloud{"  "}
          </span>
          Wallet
        </span>
      </Typography>

      <Image
        src="/images/mobileblockedimage.svg"
        alt="Mobile Blocked Image"
        width={275}
        height={275}
        priority
      />

      <Typography
        variant="h5"
        component="h1"
        mt={2}
        fontWeight={500}
        gutterBottom
      >
        Bhutan NDI Cloud Wallet is for non-mobile users.
      </Typography>
      <Typography variant="body2" maxWidth={600}>
        Cloud Wallet can only be accessed via web. If you have a phone, please
        use the NDI app for a more secure and seamless experience.
      </Typography>

      <Box mt={4}>
        <Stack direction={"row"} spacing={2} justifyContent="center" mt={4}>
          <Link
            href={"https://apps.apple.com/bt/app/bhutan-ndi/id1645493166"}
            legacyBehavior
            passHref
          >
            <a rel="noopener noreferrer" target="_blank">
              <Image
                src="/images/appstoredownload.svg"
                alt="App Store Download"
                width={158}
                height={46}
              />
            </a>
          </Link>
          <Link
            href={
              "https://play.google.com/store/apps/details?id=com.bhutanndi&hl=en&pli=1"
            }
            legacyBehavior
            passHref
          >
            <a rel="noopener noreferrer" target="_blank">
              <Image
                src="/images/googleplaydownload.svg"
                alt="Google Play Download"
                width={158}
                height={46}
              />
            </a>
          </Link>
        </Stack>
      </Box>
      {/* <details style={{ marginTop: "2rem", cursor: "pointer" }}>
        <summary style={{ color: "#666", fontSize: "0.9rem" }}>
          Need to access the web version anyway?
        </summary>
        <p style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#666" }}>
          <Link
            href="/?force-web=true"
            style={{ color: "#0066cc", textDecoration: "underline" }}
          >
            Continue to web version
          </Link>
          <br />
          <small>(Not recommended on mobile devices)</small>
        </p>
      </details> */}
    </div>
  );
}
