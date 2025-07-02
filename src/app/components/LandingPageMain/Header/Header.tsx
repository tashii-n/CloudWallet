"use client";

import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import AdbIcon from "@mui/icons-material/Adb";
import styles from "./header.module.css";
import Image from "next/image";
import Link from "next/link";

const pages = [
  { name: "How it Works", href: "/how-it-works" },
  { name: "FAQ", href: "/faq" },
  { name: "Contact Us", href: "/contact-us" }
];

export default function ResponsiveAppBar() {
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null
  );

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <AppBar
      elevation={0}
      position="static"
      className=""
      enableColorOnDark
      sx={{ p: 2, px: 9, backgroundColor: "white", color: "black" }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo and brand name */}
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              fontFamily: "Belleza",
              fontWeight: 500,
            }}
          >
            <Image
              src="/images/ndilogodark.svg"
              alt="NDI Logo"
              width={50}
              height={50}
            />
            <span style={{ marginLeft: "15px" }}>
              Bhutan{"  "}
              <span className={styles.ndigreen}>
                NDI <br />
                Cloud{"  "}
              </span>
              Wallet
            </span>
          </Typography>

          {/* Mobile navigation */}
          <Box
            sx={{
              flexGrow: 1,
              textAlign: "center",
              display: { xs: "flex", md: "none" },
            }}
          >
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: "block", md: "none" } }}
            >
              {pages.map((page) => (
                <MenuItem key={page.name} onClick={handleCloseNavMenu}>
                  <Link href={page.href} style={{ textDecoration: "none" }}>
                    <Typography sx={{ textAlign: "center", color: "black" }}>
                      {page.name}
                    </Typography>
                  </Link>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Mobile logo (duplicate for responsive design) */}
          <AdbIcon sx={{ display: { xs: "flex", md: "none" }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            Bhutan NDI Cloud Wallet
          </Typography>

          {/* Desktop navigation */}
          <Box
            sx={{
              flexGrow: 1,
              textAlign: "center",
              justifyContent: "end",
              display: { xs: "none", md: "flex" },
            }}
          >
            {pages.map((page) => (
              <Link 
                key={page.name} 
                href={page.href} 
                style={{ textDecoration: "none" }}
              >
                <Button
                  onClick={handleCloseNavMenu}
                  sx={{
                    my: 2,
                    color: "black",
                    display: "block",
                    fontWeight: 600,
                    fontFamily: "Inter",
                    textTransform: "none",
                    fontSize: "1rem",
                    px: 3,
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.04)",
                    }
                  }}
                >
                  {page.name}
                </Button>
              </Link>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}