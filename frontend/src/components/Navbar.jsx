import React from "react";
import {
  AppBar, Toolbar, Typography, Button, Box, Chip,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DashboardIcon   from "@mui/icons-material/Dashboard";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

export default function Navbar({ page, onNav, jobCount }) {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "rgba(8,12,20,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(110,231,247,0.10)",
      }}
    >
      <Toolbar sx={{ gap: 1 }}>
        <AutoAwesomeIcon sx={{ color: "primary.main", mr: 1 }} />
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            fontFamily: "'DM Mono', monospace",
            color: "primary.main",
            letterSpacing: "0.04em",
          }}
        >
          DocRoute<span style={{ color: "#a78bfa" }}>AI</span>
        </Typography>

        <Button
          startIcon={<CloudUploadIcon />}
          onClick={() => onNav("upload")}
          variant={page === "upload" ? "contained" : "text"}
          color="primary"
          size="small"
        >
          Upload
        </Button>

        <Button
          startIcon={<DashboardIcon />}
          onClick={() => onNav("dashboard")}
          variant={page === "dashboard" ? "contained" : "text"}
          color="primary"
          size="small"
        >
          Dashboard
          {jobCount > 0 && (
            <Chip
              label={jobCount}
              size="small"
              sx={{ ml: 1, height: 18, fontSize: 10, bgcolor: "secondary.main" }}
            />
          )}
        </Button>
      </Toolbar>
    </AppBar>
  );
}
