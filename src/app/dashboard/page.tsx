"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardRoot() {
  const router = useRouter();

  useEffect(() => {
    router.push("/dashboard/home"); // Redirect to the first page
  }, [router]);

  return null;
}
