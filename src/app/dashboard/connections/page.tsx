"use client";

import { getConnectionsAPI } from "@/app/lib/api_utils/onboardingAPI";
import { useEffect, useState } from "react";

export default function FAQTabs() {
  const [connections, setConnections] = useState();
  useEffect(() => {
    const getConnections = async () => {
      const connections = await getConnectionsAPI();
      setConnections(connections?.data);
    };
    getConnections();
  }, []);
  return (
    <>
      Connections Dummy Page
      {connections}
    </>
  );
}
