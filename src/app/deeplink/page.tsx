import { useEffect } from "react";
import { useRouter } from "next/router";

// This will be your /deeplink page component
const DeeplinkPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Check if router is ready and has query parameters
    if (router.isReady) {
      const { url } = router.query;

      if (url) {
        // Redirect to dashboard with the same URL parameter
        router.push(`/dashboard?URL=${encodeURIComponent(url as string)}`);
      } else {
        // If no URL parameter found, redirect to dashboard without parameters
        router.push("/dashboard");
      }
    }
  }, [router.isReady, router.query]);

  // Optional: Show loading while redirecting
  return <div>Redirecting...</div>;
};

export default DeeplinkPage;
