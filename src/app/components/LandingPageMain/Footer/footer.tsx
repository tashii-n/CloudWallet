import { Box } from "@mui/material";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box textAlign={"center"} mt={8} bgcolor={"#141B29"} color={"#FFFFFF"} py={4}>
      <p>
        <small>
          Powered by Bhutan NDI - {currentYear} © Copyright All Rights Reserved -{" "}
          <span className="ndigreen">
            {" "}
            <a href="https://www.bhutanndi.com/terms-of-services" target="_blank">
              Terms | Privacy
            </a>{" "}
          </span>
        </small>
      </p>
    </Box>
  );
}
