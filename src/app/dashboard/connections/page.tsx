"use client";

import { getConnectionsAPI } from "@/app/lib/api_utils/onboardingAPI";
import {
  Box,
  Card,
  CardContent,
  Grid2,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  CONNECTION_TYPES,
  REVOCATION_EXCLUDED_LABELS,
} from "@/app/lib/constants";

// Define interface for connection object
interface Connection {
  id: string;
  theirLabel: string;
  imageUrl?: string;
  state: string;
  createdAt: string;
  updatedAt: string;
  connectionTypes?: string[];
  // Add other properties as needed
}

export default function FAQTabs() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [connectionCount, setConnectionCount] = useState<number>(0);
  const excludedLabels: string | string[] = Object.values(
    REVOCATION_EXCLUDED_LABELS
  );
  const revocationCred = CONNECTION_TYPES.REVOCATION_CREDENTIAL;

  useEffect(() => {
    const getConnections = async () => {
      try {
        const response = await getConnectionsAPI();
        const connectionList = response?.data?.filter(
          (connection: Connection) =>
            !(
              excludedLabels.includes(connection.theirLabel) ||
              connection.connectionTypes?.includes(revocationCred)
            )
        );
        setConnections(connectionList || []);
        setConnectionCount(connectionList?.length || 0);
      } catch (error) {
        console.error("Error fetching connections:", error);
      }
    };
    getConnections();
  }, []);

  return (
    <Box bgcolor={"white"} p={3} borderRadius={3}>
      <Typography variant="h5" fontWeight={500} mb={3}>
        Connections
      </Typography>
      <Typography variant="subtitle2" mb={3}>
        {connectionCount} Connections
      </Typography>
      <Grid2 container spacing={2}>
        {connections.map((connection: Connection) => (
          <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={connection.id}>
            <Card
              variant="outlined"
              sx={{
                border: "2px solid",
                borderColor: "primary.main",
                borderRadius: 3,
                height: 120,
                display: "flex",
                alignItems: "center",
              }}
            >
              <CardContent sx={{ width: "100%" }}>
                <Stack
                  direction={"row"}
                  spacing={2}
                  alignItems={"center"}
                  justifyContent={"space-between"}
                  sx={{ height: "100%" }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 50,
                      height: 50,
                    }}
                  >
                    <Image
                      src={connection.imageUrl || "/images/ndilogodark.svg"}
                      width={50}
                      height={50}
                      alt={`${connection.theirLabel} Logo`}
                      style={{ objectFit: "contain" }}
                      unoptimized
                    />
                  </Box>
                  <Typography
                    variant="h6"
                    fontWeight={500}
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {connection.theirLabel}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid2>
        ))}
      </Grid2>
    </Box>
  );
}
