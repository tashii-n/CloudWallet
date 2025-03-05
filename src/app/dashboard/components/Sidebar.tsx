"use client";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Box,
  ListItemIcon,
} from "@mui/material";
import Link from "next/link";
import Image from "next/image";
import HomeIcon from "@mui/icons-material/Home";
import PermContactCalendarIcon from "@mui/icons-material/PermContactCalendar";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import HelpIcon from "@mui/icons-material/Help";
import LogoutIcon from "@mui/icons-material/Logout";

const menuItems = [
  { name: "Home", path: "/dashboard", icon: <HomeIcon /> },
  {
    name: "Your Connections",
    path: "/connections",
    icon: <PermContactCalendarIcon />,
  },
  { name: "Credentials", path: "/credentials", icon: <CreditCardIcon /> },
  { name: "Support", path: "/d", icon: <HelpIcon /> },
  { name: "fsdf", path: "/suppfdasort", icon: <HelpIcon /> },
  { name: "fdas", path: "/dfsa", icon: <HelpIcon /> },
  { name: "dfa", path: "/fd", icon: <HelpIcon /> },
];

export default function Sidebar() {
  return (
    <Drawer
      variant="permanent"
      sx={{
        borderRadius: 5,
        width: 300,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          borderRadius: 5,
          border: "none",
          width: 300,
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

      <List sx={{ position: "absolute", bottom: 0, p: 3, width: "100%" }}>
        <ListItem disablePadding>
          <Link href="/" style={{ width: "100%", textDecoration: "none" }}>
            <ListItemButton
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
          </Link>
        </ListItem>
      </List>
    </Drawer>
  );
}
