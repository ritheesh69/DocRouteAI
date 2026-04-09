import React from "react";
import { Box, Typography, Grid, Alert } from "@mui/material";
import JobCard from "./JobCard";
import DashboardStats from "./DashboardStats";

export default function Dashboard({ jobs, apiBase }) {
  if (jobs.length === 0) {
    return (
      <Box
        sx={{
          minHeight: "calc(100vh - 64px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 2,
          opacity: 0.6,
        }}
      >
        <Typography variant="h6" color="text.secondary">
          No documents processed yet.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Upload PDFs from the Upload tab to get started.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        px: { xs: 2, md: 4 },
        py: 4,
        background:
          "radial-gradient(ellipse 60% 40% at 80% 0%, rgba(167,139,250,0.06) 0%, transparent 60%)",
      }}
    >
      <Typography variant="h5" sx={{ mb: 1, color: "primary.main" }}>
        Processing Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Jobs refresh automatically every 3 seconds while in-progress.
      </Typography>

      <DashboardStats jobs={jobs} />

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {jobs.map((job) => (
          <Grid item xs={12} md={6} xl={4} key={job.job_id}>
            <JobCard job={job} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
