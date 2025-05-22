import { TextField } from "@mui/material";

interface CustomNumberInputProps {
  id: string;
  name: string;
  label: string;
  value: string; // Accept value prop
  required?: boolean;
  error?: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void; // Accept onChange prop
}

export default function CustomNumberInput({
  id,
  name,
  label,
  value,
  required,
  error,
  onChange,
}: CustomNumberInputProps) {
  return (
    <TextField
      type="number"
      id={id}
      name={name}
      variant="outlined"
      fullWidth
      label={label}
      value={value} // Bind value to the prop
      onChange={onChange} // Handle onChange event
      required={required}
      error={error}
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
