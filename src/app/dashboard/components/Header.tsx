"use client";
import { Box, Button, Avatar, Badge } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AddIcon from "@mui/icons-material/Add";

export default function Header() {
  return (
    <Box
      sx={{
        height: 70,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 4,
        backgroundColor: "#F4F6F8",
        boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Box>
        <strong>Welcome Back,</strong> <br />
        <span style={{ fontWeight: "bold" }}>Dorji Sonam</span>
      </Box>

      <Box display="flex" alignItems="center" gap={2}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ backgroundColor: "primary.main#", borderRadius: 10 }}
        >
          Accept Invitation
        </Button>

        <Badge badgeContent={1} color="error">
          <NotificationsIcon />
        </Badge>

        <Avatar sx={{ bgcolor: "#4CAF50" }}>JD</Avatar>
      </Box>
    </Box>
  );
}
