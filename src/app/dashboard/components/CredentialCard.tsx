import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid2,
  Stack,
} from "@mui/material";
import Image from "next/image";

interface CredentialCardProps {
  credential: {
    credentialsId?: string;
    name: string;
    iconUrl?: string;
  };
  onClick?: () => void;
}

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
        minWidth: 310,
      }}
    >
      <CardContent>
        <Grid2 container spacing={5}>
          <Grid2 size={8}>
            <Image
              src={credential.iconUrl || "/images/ndilogodark.svg"}
              width={60}
              height={60}
              alt="Credential Icon"
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
                src="/images/cardactiveicon.svg"
                width={30}
                height={30}
                alt="Active Credential Icon..."
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
