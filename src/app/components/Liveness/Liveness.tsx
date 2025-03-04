"use client";

import * as React from "react";
import "@regulaforensics/vp-frontend-face-components";
import {
  FaceLivenessDetailType,
  FaceLivenessWebComponent,
} from "@regulaforensics/vp-frontend-face-components";

interface FaceLivenessProps {
  onClose: () => void;
  onLivenessSuccess: (response: any) => void; // New callback function
}

const FaceLiveness: React.FC<FaceLivenessProps> = ({ onClose, onLivenessSuccess }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const componentRef = React.useRef<FaceLivenessWebComponent | null>(null);

  const listener = (data: CustomEvent<FaceLivenessDetailType>) => {
    if (data.detail?.action === "PROCESS_FINISHED") {
      console.log("regula log:  ", data.detail)
      if (data.detail.data?.status === 1 && data.detail.data.response?.code === 0) {
        console.log(data.detail.data.status)
        console.log("Face Liveness Response:", data.detail.data.response);
        onLivenessSuccess(data.detail.data.response); // Pass response to parent
      }
    }

    if (
      data.detail?.action === "CLOSE" ||
      data.detail?.action === "RETRY_COUNTER_EXCEEDED"
    ) {
      onClose();
    }
  };

  React.useEffect(() => {
    const containerCurrent = containerRef.current;
    if (!containerCurrent) return;

    containerCurrent.addEventListener("face-liveness", listener);
    return () => {
      containerCurrent.removeEventListener("face-liveness", listener);
    };
  }, []);

  const generateRandomTag = () => {
    return Math.random().toString(36).substring(2, 12).toUpperCase();
  };

  React.useEffect(() => {
    if (componentRef.current) {
      componentRef.current.settings = {
        tag: generateRandomTag(),
        livenessType: 1,
        recordingProcess: 2,
        startScreen: false,
        closeDisabled: true,
        customization: {
          cameraScreenSectorActive: "#5AC894",
          cameraScreenStrokeNormal: "#5AC894",
          processingScreenProgress: "#5AC894",
          fontFamily: "Inter, sans-serif",
        },
        url: "https://qaregula.bhutanndi.com",
      };
    }
  }, []);

  return (
    <div ref={containerRef} style={{ overflow: "hidden", width: "580px" }}>
      <face-liveness
        style={{ display: "flex", objectFit: "contain" }}
        ref={componentRef}
      ></face-liveness>
    </div>
  );
};

export default FaceLiveness;