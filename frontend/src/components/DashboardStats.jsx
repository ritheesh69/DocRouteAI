import React from "react";
import { Box, Paper, Typography } from "@mui/material";

function Stat({ label, value, color }) {
  return (
    <Paper
      elevation={0}
      sx={{
        px: 3,
        py: 2,
        flex: 1,
        minWidth: 120,
        borderLeft: `3px solid ${color}`,
        bgcolor: "rgba(15,23,36,0.8)",
      }}
    >
      <Typography variant="h5" sx={{ color, fontWeight: 700 }}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Paper>
  );
}

export default function DashboardStats({ jobs }) {
  const total      = jobs.length;
  const completed  = jobs.filter((j) => j.status === "completed").length;
  const inProgress = jobs.filter((j) => j.status === "in_progress" || j.status === "queued").length;
  const failed     = jobs.filter((j) => j.status === "failed").length;

  // Count LLM usage
  const llmCount = {};
  jobs.forEach((j) => {
    if (j.llm) llmCount[j.llm] = (llmCount[j.llm] || 0) + 1;
  });
  const topLLM = Object.entries(llmCount).sort((a, b) => b[1] - a[1])[0];

  return (
    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
      <Stat label="Total Jobs"   value={total}      color="#6ee7f7" />
      <Stat label="Completed"    value={completed}   color="#4ade80" />
      <Stat label="Processing"   value={inProgress}  color="#fbbf24" />
      <Stat label="Failed"       value={failed}      color="#f87171" />
      {topLLM && (
        <Stat label="Top LLM" value={topLLM[0].split(" ")[0]} color="#a78bfa" />
      )}
    </Box>
  );
}
