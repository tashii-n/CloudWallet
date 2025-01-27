import { Grid2, Stack } from "@mui/material";
import Image from "next/image";

export default function ImageList() {
  // List of images with src and alt
  const images = [
    { src: "/images/dhi.svg", alt: "DHI Logo" },
    { src: "/images/tcell.svg", alt: "Tashi Cell Logo" },
    { src: "/images/mid.svg", alt: "Mid Logo" },
    { src: "/images/rcsc.svg", alt: "RCSC Logo" },
    { src: "/images/BOB.svg", alt: "BOB Logo" },
    { src: "/images/rub.svg", alt: "RUB Logo" },
  ];

  // Uniform width and height
  const imageSize = 70;

  return (
    <Grid2 size={{ md: 7 }}>
      <Stack
        direction="row"
        spacing={7}
        sx={{ height: 100, alignItems: "center" }}
      >
        {images.map((image, index) => (
          <Image
            key={index} // Use index as key (better use unique id if available)
            src={image.src}
            alt={image.alt}
            width={imageSize}
            height={imageSize}
          />
        ))}
      </Stack>
    </Grid2>
  );
}
