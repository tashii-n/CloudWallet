import { Card, CardContent, Typography, Grid2, Stack } from "@mui/material";
import Image from "next/image";

interface CredentialCardProps {

  credential: {
    connection?: any;
    credentialsId?: string;
    name: string;
    iconUrl?: string;
    status?: string;
    // selfAttested?: boolean
  };
  onClick?: () => void;
}

// Helper to get icon URL based on status
const getStatusIcon = (status?: string) => {
  switch (status) {
    case "ACTIVE":
      return "/images/cardactiveicon.svg";
    case "REVOKED":
      return "/images/cardrevokedicon.svg";
    case "SUSPENDED":
      return "/images/cardsuspendedicon.svg";
    default:
      return "/images/cardactiveicon.svg"; // fallback icon
  }
};


export default function CredentialCard({
  credential,
  onClick,
}: CredentialCardProps) {
  
  return (
    <Card
      onClick={onClick ? onClick : undefined}
      sx={{
        cursor: onClick ? "pointer" : "normal",
        bgcolor: "#030305",
        color: "#FFFFFF",
        // clipPath: "circle(61.4% at 15% 0)",
        borderRadius: 5,
        p: 1,
        minWidth: 300,
      }}
    >
      <CardContent>
        <Grid2 container spacing={5}>
          <Grid2 size={8}>
            <Image
              src={
                credential.connection?.imageUrl ??
                credential.iconUrl ??
                "/images/ndilogodark.svg"
              }
              width={60}
              height={60}
              alt={credential.name || "Credential Icon"}
              unoptimized
            />

            <Typography mt={5} variant="body1" fontWeight="bold">
              {credential.name}
            </Typography>
          </Grid2>
          <Grid2
            size={4}
            display="flex"
            justifyContent="end"
            alignItems="center"
          >
            <Stack direction="column" spacing={1}>
              <Image
                src={getStatusIcon(credential.status)}
                width={30}
                height={30}
                alt={`${status ?? "unknown"} credential status icon`}
              />
              <Image
                src="/images/star0.svg"
                width={30}
                height={30}
                alt="Star Icon..."
              />
            </Stack>
          </Grid2>
        </Grid2>
      </CardContent>
    </Card>
  );
}
