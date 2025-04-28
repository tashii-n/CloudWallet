"use client";

import { TextField } from "@mui/material";
import React, { ChangeEvent } from "react";
import SearchIcon from "@mui/icons-material/Search";

type Props = {
  onSearchChange: (value: string) => void;
};

const SearchBar: React.FC<Props> = ({ onSearchChange }) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  return (
    <TextField
      placeholder="Search"
      variant="outlined"
      fullWidth
      onChange={handleChange}
      slotProps={{
        input: {
          startAdornment: <SearchIcon sx={{ marginRight: 2 }} />,
        },
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 6, // or any radius you want
        },
      }}
    />
  );
};

export default SearchBar;
