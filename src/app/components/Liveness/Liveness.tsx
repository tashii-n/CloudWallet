"use client";

import * as React from "react";
import "@regulaforensics/vp-frontend-face-components";
import {
  FaceLivenessDetailType,
  FaceLivenessWebComponent,
} from "@regulaforensics/vp-frontend-face-components";

interface FaceLivenessProps {
  onClose: () => void;
}

const FaceLiveness: React.FC<FaceLivenessProps> = ({ onClose }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const componentRef = React.useRef<FaceLivenessWebComponent | null>(null);

  const listener = (data: CustomEvent<FaceLivenessDetailType>) => {
    if (data.detail?.action === "PROCESS_FINISHED") {
      if (data.detail.data?.status === 1 && data.detail.data.response) {
        console.log("Face Liveness Response:", data.detail.data.response);
      }
    }

    if (
      data.detail?.action === "CLOSE" ||
      data.detail?.action === "RETRY_COUNTER_EXCEEDED"
    ) {
      onClose(); // Notify the parent to close the component
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

  React.useEffect(() => {
    if (componentRef.current) {
      componentRef.current.settings = {
        tag: "123",
        livenessType: 1,
        recordingProcess: 2,
        startScreen: false,
        closeDisabled: true,
        // rotationAngle:90,
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
    <div
      ref={containerRef}
      style={{
        overflow: "hidden",
        width: "580px",
      }}
    >
      <face-liveness
        style={{
          display: "flex",
          objectFit: "contain",
        }}
        ref={componentRef}
      ></face-liveness>
    </div>
  );
};

export default FaceLiveness;
