import React, { useState } from "react";
import {
  Paper, Box, Typography, Chip, LinearProgress,
  Collapse, IconButton, Tooltip, Divider, List,
  ListItem, ListItemIcon, ListItemText,
} from "@mui/material";
import PictureAsPdfIcon    from "@mui/icons-material/PictureAsPdf";
import ExpandMoreIcon      from "@mui/icons-material/ExpandMore";
import ExpandLessIcon      from "@mui/icons-material/ExpandLess";
import AutoFixHighIcon     from "@mui/icons-material/AutoFixHigh";
import CheckCircleIcon     from "@mui/icons-material/CheckCircle";
import ErrorIcon           from "@mui/icons-material/Error";
import HourglassTopIcon    from "@mui/icons-material/HourglassTop";
import LightbulbIcon       from "@mui/icons-material/Lightbulb";
import SmartToyIcon        from "@mui/icons-material/SmartToy";

// ── Status config ─────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  queued: {
    label: "Queued",
    color: "#94a3b8",
    bgcolor: "rgba(148,163,184,0.12)",
    icon: <HourglassTopIcon fontSize="small" />,
  },
  in_progress: {
    label: "Processing",
    color: "#fbbf24",
    bgcolor: "rgba(251,191,36,0.12)",
    icon: <AutoFixHighIcon fontSize="small" />,
  },
  completed: {
    label: "Completed",
    color: "#4ade80",
    bgcolor: "rgba(74,222,128,0.12)",
    icon: <CheckCircleIcon fontSize="small" />,
  },
  failed: {
    label: "Failed",
    color: "#f87171",
    bgcolor: "rgba(248,113,113,0.12)",
    icon: <ErrorIcon fontSize="small" />,
  },
};

// ── LLM badge colours ─────────────────────────────────────────────────────
const LLM_COLORS = {
  "GPT-4":                  "#10a37f",
  "Claude 3 Opus":          "#c77035",
  "Gemini Pro Vision":      "#4285f4",
  "Claude 3 Haiku (Fallback)": "#7c3aed",
};

export default function JobCard({ job }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[job.status] || STATUS_CONFIG.queued;
  const llmColor = LLM_COLORS[job.llm] || "#6ee7f7";
  const isActive = job.status === "queued" || job.status === "in_progress";

  return (
    <Paper
      elevation={0}
      sx={{
        p: 0,
        overflow: "hidden",
        transition: "box-shadow 0.2s",
        "&:hover": {
          boxShadow: `0 0 0 1px rgba(110,231,247,0.2), 0 8px 32px rgba(0,0,0,0.4)`,
        },
      }}
    >
      {/* Progress bar (only visible while active) */}
      {isActive && (
        <LinearProgress
          variant={job.progress > 0 ? "determinate" : "indeterminate"}
          value={job.progress}
          sx={{ height: 3, bgcolor: "rgba(110,231,247,0.1)" }}
        />
      )}
      {!isActive && <Box sx={{ height: 3, bgcolor: cfg.bgcolor }} />}

      <Box sx={{ p: 2.5 }}>
        {/* ── Header row ── */}
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 2 }}>
          <PictureAsPdfIcon sx={{ color: "#f87171", mt: 0.3, flexShrink: 0 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              fontWeight={600}
              noWrap
              title={job.filename}
            >
              {job.filename}
            </Typography>
            {job.page_count != null && (
              <Typography variant="caption" color="text.secondary">
                {job.page_count} page{job.page_count !== 1 ? "s" : ""}
              </Typography>
            )}
          </Box>

          {/* Status badge */}
          <Chip
            icon={cfg.icon}
            label={cfg.label}
            size="small"
            sx={{
              color: cfg.color,
              bgcolor: cfg.bgcolor,
              border: `1px solid ${cfg.color}33`,
              fontWeight: 600,
              flexShrink: 0,
              "& .MuiChip-icon": { color: cfg.color },
            }}
          />
        </Box>

        {/* ── LLM badge ── */}
        {job.llm && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <SmartToyIcon sx={{ fontSize: 16, color: llmColor }} />
            <Chip
              label={job.llm}
              size="small"
              sx={{
                bgcolor: `${llmColor}18`,
                color: llmColor,
                border: `1px solid ${llmColor}44`,
                fontWeight: 700,
                fontSize: "0.7rem",
              }}
            />
          </Box>
        )}

        {/* ── Progress percentage ── */}
        {isActive && job.progress > 0 && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <LinearProgress
              variant="determinate"
              value={job.progress}
              sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: "rgba(255,255,255,0.06)" }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
              {job.progress}%
            </Typography>
          </Box>
        )}

        {/* ── Error ── */}
        {job.status === "failed" && job.error && (
          <Typography variant="caption" color="error" sx={{ display: "block", mb: 1.5 }}>
            {job.error}
          </Typography>
        )}

        {/* ── Expand toggle (only when there's something to show) ── */}
        {(job.routing_reason?.length > 0 || job.output_preview) && (
          <>
            <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", mb: 1 }} />
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                opacity: 0.7,
                "&:hover": { opacity: 1 },
              }}
              onClick={() => setExpanded((v) => !v)}
            >
              <LightbulbIcon sx={{ fontSize: 14, mr: 0.5, color: "secondary.main" }} />
              <Typography variant="caption" color="secondary.main" sx={{ flex: 1 }}>
                {expanded ? "Hide details" : "View explainability & output"}
              </Typography>
              <IconButton size="small" sx={{ p: 0 }}>
                {expanded ? (
                  <ExpandLessIcon fontSize="small" />
                ) : (
                  <ExpandMoreIcon fontSize="small" />
                )}
              </IconButton>
            </Box>

            <Collapse in={expanded}>
              <Box sx={{ mt: 2 }}>
                {/* Routing reasons */}
                {job.routing_reason?.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mb: 0.5, textTransform: "uppercase", letterSpacing: "0.08em" }}
                    >
                      Why this LLM?
                    </Typography>
                    <List dense disablePadding>
                      {job.routing_reason.map((reason, i) => (
                        <ListItem key={i} disableGutters sx={{ alignItems: "flex-start", py: 0.25 }}>
                          <ListItemIcon sx={{ minWidth: 20, mt: 0.2 }}>
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                bgcolor: llmColor,
                                mt: 0.5,
                              }}
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={reason}
                            primaryTypographyProps={{ variant: "caption", color: "text.secondary" }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {/* Output preview */}
                {job.output_preview && (
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mb: 0.5, textTransform: "uppercase", letterSpacing: "0.08em" }}
                    >
                      Output Preview
                    </Typography>
                    <Box
                      sx={{
                        bgcolor: "rgba(0,0,0,0.3)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: 2,
                        p: 1.5,
                        fontFamily: "'DM Mono', monospace",
                        fontSize: "0.7rem",
                        color: "#94a3b8",
                        whiteSpace: "pre-wrap",
                        lineHeight: 1.7,
                      }}
                    >
                      {job.output_preview}
                    </Box>
                  </Box>
                )}
              </Box>
            </Collapse>
          </>
        )}
      </Box>
    </Paper>
  );
}
