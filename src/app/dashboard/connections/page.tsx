"use client";

import { getConnectionsAPI } from "@/app/lib/api_utils/onboardingAPI";
import { Typography } from "@mui/material";
import { useEffect, useState } from "react";

export default function FAQTabs() {
  const [connections, setConnections] = useState();
  useEffect(() => {
    const getConnections = async () => {
      const connections = await getConnectionsAPI();
      const connectionList = connections?.data;
      console.log("🚀 ~ getConnections ~ connectionList:", connectionList)
      setConnections(connections?.data?.data);
    };
    getConnections();
  }, []);
  return (
    <>
      Connections Dummy Page
      <Typography>
        
      {connections}
      </Typography>
    </>
  );
}
