import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Box, Typography, Button, LinearProgress, Alert,
  Paper, List, ListItem, ListItemIcon, ListItemText,
} from "@mui/material";
import CloudUploadIcon  from "@mui/icons-material/CloudUpload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import CheckCircleIcon  from "@mui/icons-material/CheckCircle";
import AutoFixHighIcon  from "@mui/icons-material/AutoFixHigh";

const FEATURES = [
  "Intelligent multi-LLM routing based on content analysis",
  "Explainable AI — understand WHY a model was chosen",
  "Real-time processing status with live progress tracking",
  "Structured output preview from the selected LLM",
];

export default function UploadPage({ apiBase, onSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState(null);
  const [queued, setQueued]       = useState([]);   // files selected but not yet sent

  const onDrop = useCallback((acceptedFiles) => {
    setError(null);
    const pdfs = acceptedFiles.filter((f) => f.type === "application/pdf");
    if (pdfs.length !== acceptedFiles.length) {
      setError("Only PDF files are supported. Non-PDF files were ignored.");
    }
    setQueued(pdfs);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: true,
  });

  const handleUpload = async () => {
    if (queued.length === 0) return;
    setUploading(true);
    setError(null);

    try {
      for (const file of queued) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(`${apiBase}/upload`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const detail = await res.json();
          throw new Error(detail.detail || "Upload failed");
        }

        const job = await res.json();
        onSuccess(job);
      }
      setQueued([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        py: 6,
        background:
          "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(110,231,247,0.07) 0%, transparent 70%)",
      }}
    >
      <Box sx={{ maxWidth: 680, width: "100%" }}>
        {/* Headline */}
        <Typography
          variant="h4"
          sx={{ mb: 1, textAlign: "center", color: "primary.main" }}
        >
          Intelligent Document Processor
        </Typography>
        <Typography
          variant="body2"
          sx={{ mb: 4, textAlign: "center", color: "text.secondary" }}
        >
          Upload PDFs and watch our routing engine assign the optimal LLM —
          with full explainability.
        </Typography>

        {/* Dropzone */}
        <Paper
          {...getRootProps()}
          elevation={0}
          sx={{
            p: 6,
            textAlign: "center",
            cursor: "pointer",
            border: isDragActive
              ? "2px dashed #6ee7f7"
              : "2px dashed rgba(110,231,247,0.25)",
            bgcolor: isDragActive
              ? "rgba(110,231,247,0.05)"
              : "rgba(15,23,36,0.6)",
            transition: "all 0.2s",
            "&:hover": {
              borderColor: "primary.main",
              bgcolor: "rgba(110,231,247,0.04)",
            },
          }}
        >
          <input {...getInputProps()} />
          <CloudUploadIcon
            sx={{ fontSize: 56, color: "primary.main", opacity: 0.8, mb: 2 }}
          />
          <Typography variant="h6" gutterBottom>
            {isDragActive ? "Drop your PDFs here…" : "Drag & drop PDF files"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            or click to browse — multiple files supported
          </Typography>
        </Paper>

        {/* Queued files list */}
        {queued.length > 0 && (
          <Paper sx={{ mt: 2, p: 2 }}>
            <Typography variant="caption" color="primary.main" sx={{ mb: 1, display: "block" }}>
              {queued.length} file{queued.length > 1 ? "s" : ""} ready to upload
            </Typography>
            <List dense disablePadding>
              {queued.map((f) => (
                <ListItem key={f.name} disableGutters>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <PictureAsPdfIcon fontSize="small" sx={{ color: "#f87171" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={f.name}
                    secondary={`${(f.size / 1024).toFixed(1)} KB`}
                    primaryTypographyProps={{ variant: "body2" }}
                    secondaryTypographyProps={{ variant: "caption" }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {uploading && <LinearProgress sx={{ mt: 2, borderRadius: 4 }} />}

        <Button
          fullWidth
          variant="contained"
          size="large"
          disabled={queued.length === 0 || uploading}
          onClick={handleUpload}
          sx={{ mt: 3, py: 1.5 }}
          startIcon={<AutoFixHighIcon />}
        >
          {uploading ? "Uploading…" : "Process Documents"}
        </Button>

        {/* Feature list */}
        <Box sx={{ mt: 5 }}>
          <List dense>
            {FEATURES.map((f) => (
              <ListItem key={f} disableGutters sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckCircleIcon fontSize="small" sx={{ color: "secondary.main" }} />
                </ListItemIcon>
                <ListItemText
                  primary={f}
                  primaryTypographyProps={{ variant: "body2", color: "text.secondary" }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>
    </Box>
  );
}
