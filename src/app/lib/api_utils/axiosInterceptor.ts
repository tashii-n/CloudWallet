import axios, { AxiosError } from "axios";

// Extend Window interface to include our global toast function
declare global {
  interface Window {
    showGlobalToast?: (
      message: string,
      severity?: "error" | "warning" | "info" | "success"
    ) => void;
  }
}

// Add response interceptor to handle 429 errors globally
axios.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Check if it's a 429 error and if we have the global toast function available
    if (
      error.response?.status === 429 &&
      typeof window !== "undefined" &&
      window.showGlobalToast
    ) {
      window.showGlobalToast(
        "Too many requests. Please try again later.",
        "error"
      );
    }

    return Promise.reject(error);
  }
);

export default axios;
