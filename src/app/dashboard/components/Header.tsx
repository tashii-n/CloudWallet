"use client";
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Avatar,
  Badge,
  Popover,
  TextField,
  Grid2,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AddIcon from "@mui/icons-material/Add";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ContentCopyIcon from "@mui/icons-material/ContentCopy"; // Importing copy icon
import { secureGet } from "@/app/lib/storage/storage";

export default function Header() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [holderDid, setHolderDid] = useState<string | null>(null);

  useEffect(() => {
    const fetchHolderDID = async () => {
      const holderDIDSession = await secureGet("holderDID");
      setHolderDid(holderDIDSession);
    };

    fetchHolderDID();
  }, []);
  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const handleCopy = (value: string | null) => {
    if (!value) return;

    navigator.clipboard.writeText(value).catch((error) => {
      console.error("Error copying text: ", error);
    });
  };

  return (
    <Box
      sx={{
        height: 70,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        py: 2,
        px: 4,
        backgroundColor: "#F4F6F8",
        boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Box>
        {/* <strong>Welcome Back,</strong> <br /> */}
        {/* <span style={{ fontWeight: "bold" }}>Dorji Sonam</span> */}
      </Box>

      <Box display="flex" alignItems="center" gap={2}>
        {/* <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ backgroundColor: "primary.main#", borderRadius: 10 }}
        >
          Accept Invitation
        </Button>

        <Badge badgeContent={1} color="error">
          <NotificationsIcon />
        </Badge> */}

        <Avatar sx={{ bgcolor: "#4CAF50" }} onClick={handlePopoverOpen}>
          <AccountCircleIcon />
        </Avatar>

        {/* Custom Dropdown UI using Popover */}
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handlePopoverClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
          sx={{ mt: 1, position: "absolute" }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              p: 2,
              minWidth: "auto",
              borderRadius: 2,
              boxShadow: 3,
              backgroundColor: "white",
            }}
          >
            {/* Custom content (disabled TextFields) */}
            <Grid2
              display={"flex"}
              flexDirection={"row"}
              justifyContent={"space-between"}
              alignItems={"center"}
            >
              <TextField
                label="HolderDID"
                value={holderDid} // Dynamic value from state
                variant="outlined"
                disabled
                fullWidth
                sx={{ mb: 2 }}
              />
              <Button
                size="large"
                color="primary"
                sx={{
                  ml: 2,
                }}
                onClick={() => handleCopy(holderDid)} // Copy dynamic value
                startIcon={<ContentCopyIcon />}
              ></Button>
            </Grid2>

            {/* Add more custom content here */}
          </Box>
        </Popover>
      </Box>
    </Box>
  );
}
