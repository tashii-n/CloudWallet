import Lottie from "lottie-react";
import animationData from "../../lib/data/FaceMatch.json"; // adjust path

export default function BiometricAnimation({ width = 300, height = 300 }) {
  return (
    <Lottie 
      animationData={animationData} 
      loop 
      autoplay 
      style={{ width, height }}
    />
  );
}