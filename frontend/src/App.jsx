import React, { useState, useEffect, useCallback } from "react";
import UploadPage from "./components/UploadPage";
import Dashboard from "./components/Dashboard";
import Navbar from "./components/Navbar";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary:   { main: "#6ee7f7" },
    secondary: { main: "#a78bfa" },
    background: { default: "#080c14", paper: "#0f1724" },
    text: { primary: "#e2e8f0", secondary: "#94a3b8" },
  },
  typography: {
    fontFamily: "'DM Mono', 'Fira Code', monospace",
    h4: { fontWeight: 700, letterSpacing: "-0.02em" },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid rgba(110, 231, 247, 0.08)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600 },
      },
    },
  },
});

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

export default function App() {
  const [page, setPage]   = useState("upload"); // "upload" | "dashboard"
  const [jobs, setJobs]   = useState([]);        // array of job status objects

  // ── Polling: refresh all in-progress jobs every 3 s ─────────────────────
  useEffect(() => {
    const interval = setInterval(async () => {
      const pending = jobs.filter(
        (j) => j.status === "queued" || j.status === "in_progress"
      );
      if (pending.length === 0) return;

      const updates = await Promise.allSettled(
        pending.map((j) =>
          fetch(`${API_BASE}/status/${j.job_id}`).then((r) => r.json())
        )
      );

      setJobs((prev) => {
        const map = Object.fromEntries(prev.map((j) => [j.job_id, j]));
        updates.forEach((result) => {
          if (result.status === "fulfilled") {
            const updated = result.value;
            map[updated.job_id] = updated;
          }
        });
        return Object.values(map);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [jobs]);

  const handleUploadSuccess = useCallback((newJob) => {
    setJobs((prev) => [newJob, ...prev]);
    setPage("dashboard");
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar page={page} onNav={setPage} jobCount={jobs.length} />
      {page === "upload" ? (
        <UploadPage apiBase={API_BASE} onSuccess={handleUploadSuccess} />
      ) : (
        <Dashboard jobs={jobs} apiBase={API_BASE} />
      )}
    </ThemeProvider>
  );
}
