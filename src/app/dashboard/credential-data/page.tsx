import { Grid2, Typography, Box, Card, CardContent } from "@mui/material";
import CredentialCard from "../components/CredentialCard";

const cardData = [
  { title: "Total", value: 100 },
  { title: "Active", value: 80 },
  { title: "Self Attested", value: 10 },
  { title: "Suspended", value: 5 },
  { title: "Revoked", value: 5 },
];

export default function CredentialData() {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Credential Overview
      </Typography>

      <Grid2 container spacing={2} sx={{ fontFamily: "Inter, sans-serif" }}>
        {cardData.map((card, index) => (
          <Grid2 size={2.4} key={index}>
            <Card
              sx={{
                p: 1,
                height: "90%",
                boxShadow: `-4px 3px 1px 1px #5AC994`,
              }}
            >
              <CardContent>
                <Typography mb={3} variant="h6" sx={{ fontWeight: "bold" }}>
                  {card.title}
                </Typography>
                <Typography variant="h6" color="primary">
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid2>
        ))}
      </Grid2>
      <Grid2
        bgcolor="white"
        mt={2}
        py={2}
        px={4}
        container
        borderRadius={3}
        spacing={3}
      >
        <Typography variant="h5">
        Your Credential Details
        </Typography>
        <Grid2 size={4}>
          <CredentialCard credential={{
            credentialsId: undefined,
            name: "",
            iconUrl: undefined
          }} />
        </Grid2>
        
      </Grid2>
    </Box>
  );
}
