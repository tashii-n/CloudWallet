"use client";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Box,
} from "@mui/material";
import Image from "next/image";
import HomeIcon from "@mui/icons-material/Home";
import PermContactCalendarIcon from "@mui/icons-material/PermContactCalendar";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import PermPhoneMsgOutlinedIcon from "@mui/icons-material/PermPhoneMsgOutlined";
import PolicyOutlinedIcon from "@mui/icons-material/PolicyOutlined";
import { useRouter } from "next/navigation"; // Import useRouter
import Link from "next/link";

const menuItems = [
  { name: "Home", path: "/dashboard", icon: <HomeIcon /> },
  {
    name: "Your Connections",
    path: "/connections",
    icon: <PermContactCalendarIcon />,
  },
  { name: "Credentials", path: "/credentials", icon: <CreditCardIcon /> },
  {
    name: "Self Attested Credentials",
    path: "/suppfdasort",
    icon: <AccountCircleOutlinedIcon />,
  },
  { name: "Support", path: "/d", icon: <SupportAgentOutlinedIcon /> },
  { name: "About", path: "/dfsa", icon: <HelpOutlineOutlinedIcon /> },
  { name: "Contact", path: "/fd", icon: <PermPhoneMsgOutlinedIcon /> },
  { name: "FAQ", path: "/fd", icon: <PolicyOutlinedIcon /> },
];

export default function Sidebar() {
  const router = useRouter(); // Initialize the router

  // Logout function
  const handleLogout = () => {
    // Clear session storage
    sessionStorage.clear();

    // Redirect to the login page
    router.push("/login");
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        borderRadius: 5,
        width: 330,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          borderRadius: 5,
          border: "none",
          width: 330,
          backgroundColor: "#FFFFFF",
          color: "#0C213A",
        },
      }}
    >
      {/* Logo */}
      <Box
        display={"flex"}
        flexDirection={"row"}
        alignItems={"center"}
        justifyContent={"space-around"}
        sx={{ textAlign: "center", p: 3, borderBottom: "1px solid #e0e0e0" }}
      >
        <Image
          src="/images/ndilogodark.svg"
          alt="NDI Cloud Wallet"
          width={45}
          height={45}
        />
        <Typography variant="h6" fontWeight="bold">
          NDI Cloud Wallet
        </Typography>
      </Box>

      {/* Menu Items */}
      <List sx={{ p: 3 }}>
        {menuItems.map((item) => (
          <ListItem key={item.name} disablePadding>
            <Link
              href={item.path}
              style={{ width: "100%", textDecoration: "none" }}
            >
              <ListItemButton
                sx={{
                  "&:hover": {
                    backgroundColor: "primary.main", // Light green hover color
                    "& .MuiListItemText-root": {
                      color: "white", // Green text on hover
                    },
                    "& .MuiSvgIcon-root": {
                      color: "white", // Icon color on hover
                    },
                  },
                }}
              >
                {item.icon}
                <ListItemText
                  primary={item.name}
                  sx={{ ml: 2, color: "#0C213A" }}
                />
              </ListItemButton>
            </Link>
          </ListItem>
        ))}
      </List>

      {/* Logout Button */}
      <List sx={{ position: "absolute", bottom: 0, p: 3, width: "100%" }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout} // Add onClick handler for logout
            sx={{
              "&:hover": {
                backgroundColor: "#5AC994", // Light green hover color
                "& .MuiListItemText-root": {
                  color: "white", // Green text on hover
                },
                "& .MuiSvgIcon-root": {
                  color: "white", // Icon color on hover
                },
              },
            }}
          >
            <LogoutIcon />
            <ListItemText primary="Logout" sx={{ ml: 2, color: "#0C213A" }} />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
}