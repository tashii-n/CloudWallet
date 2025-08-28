"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { Snackbar, Alert } from "@mui/material";

interface ToastContextType {
  showToast: (
    message: string,
    severity?: "error" | "warning" | "info" | "success"
  ) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "info" as "error" | "warning" | "info" | "success",
  });

  const showToast = useCallback(
    (
      message: string,
      severity: "error" | "warning" | "info" | "success" = "info"
    ) => {
      setToast({ open: true, message, severity });
    },
    []
  );

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, open: false }));
  }, []);

  // Set up the global toast function for axios interceptor
  useEffect(() => {
    // Make showToast available globally
    (window as any).showGlobalToast = showToast;

    return () => {
      delete (window as any).showGlobalToast;
    };
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
        onClose={hideToast}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{ zIndex: 9999 }}
      >
        <Alert
          onClose={hideToast}
          severity={toast.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
};
