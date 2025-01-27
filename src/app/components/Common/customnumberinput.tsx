import { TextField } from "@mui/material";

interface CustomNumberInputProps {
  id: string;
  name: string;
  label: string;
}

export default function CustomNumberInput({
  id,
  name,
  label,
}: CustomNumberInputProps) {
  return (
    <TextField
      type="number"
      id={id}
      name={name}
      variant="outlined"
      fullWidth
      label={label}
      sx={{
        "& input[type=number]": {
          MozAppearance: "textfield",
        },
        "& input[type=number]::-webkit-outer-spin-button": {
          WebkitAppearance: "none",
          margin: 0,
        },
        "& input[type=number]::-webkit-inner-spin-button": {
          WebkitAppearance: "none",
          margin: 0,
        },
      }}
    />
  );
}
