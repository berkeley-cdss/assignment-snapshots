import React, { useEffect, useState } from "react";

import {
  Typography,
  Box,
  Paper,
  Tooltip,
  IconButton,
  TextField,
  Stack,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import { useParams, useNavigate } from "react-router";

import InfoTooltip from "../../../common/InfoTooltip";

const formatTimestamp = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

/**
 * Helper to turn millisecond difference into "Xm Ys"
 */
const formatDuration = (ms) => {
  if (ms < 0) return "0s";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
};

const AutograderSpam = () => {
  const [rows, setRows] = useState([]);

  const THRESHOLD_DEFAULT = 1;
  const [numBackupsThreshold, setNumBackupsThreshold] =
    useState(THRESHOLD_DEFAULT);
  const [timeThreshold, setTimeThreshold] = useState(THRESHOLD_DEFAULT);

  const routeParams = useParams();
  const navigate = useNavigate();

  /**
   * Validates and updates thresholds to ensure they are positive integers
   */
  const handleThresholdChange = (setter) => (e) => {
    const value = e.target.value;
    // Allow empty string so user can delete text, otherwise parse and clamp to min 1
    if (value === "") {
      setter("");
      return;
    }
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed)) {
      setter(Math.max(1, parsed));
    }
  };

  useEffect(() => {
    const queryParams = {
      num_backups_threshold: numBackupsThreshold,
      time_threshold: timeThreshold,
    };

    const queryString = new URLSearchParams(queryParams).toString();

    fetch(
      `/api/debugging/autograder_spam/${routeParams.courseId}/${routeParams.assignmentId}/${routeParams.studentId}?${queryString}`,
      { method: "GET" },
    )
      .then((response) => response.json())
      .then((responseData) => {
        setRows(responseData);
      });
  }, [routeParams, numBackupsThreshold, timeThreshold]);

  const columns = [
    {
      field: "startTimestamp",
      headerName: "Start Timestamp",
      flex: 1,
      valueGetter: (value) => value,
      valueFormatter: (value) => formatTimestamp(value),
    },
    {
      field: "endTimestamp",
      headerName: "End Timestamp",
      flex: 1,
      valueGetter: (value) => value,
      valueFormatter: (value) => formatTimestamp(value),
    },
    {
      field: "duration",
      headerName: "Duration",
      width: 100,
      valueGetter: (value, row) => {
        const start = new Date(row.startTimestamp).getTime();
        const end = new Date(row.endTimestamp).getTime();
        return end - start; // Returns value in milliseconds
      },
      valueFormatter: (value) => formatDuration(value),
    },
    {
      field: "numBackups",
      headerName: "Number of Backups",
      type: "number",
      width: 150,
      align: "right",
      headerAlign: "right",
    },
    {
      field: "problems",
      headerName: "Problem(s) Worked On",
      flex: 1,
      valueGetter: (value) => (value ? value.join(", ") : ""),
    },
    {
      field: "actions",
      headerName: "Details",
      width: 100,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Tooltip title="Jump to start of session in Timeline">
          <IconButton
            color="primary"
            size="small"
            onClick={() => {
              navigate(
                `/courses/${routeParams.courseId}/assignments/${routeParams.assignmentId}/students/${routeParams.studentId}/submission/timeline/${params.id}`,
              );
            }}
          >
            <OpenInNewIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            Autograder Spam
          </Typography>
          <InfoTooltip
            info="This table shows periods of intense activity. Adjust the thresholds to redefine what constitutes a 'spam session'."
            placement="right"
          />
        </div>

        <Box sx={{ flexGrow: 1 }} />
      </Stack>

      {/* Threshold Controls */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap", // Ensures it looks good on smaller screens
          gap: 1.5, // Consistent spacing between elements
          mb: 3, // Margin bottom to separate from the table
          p: 2,
          bgcolor: "action.hover",
          borderRadius: 2,
        }}
      >
        <Typography variant="body1">
          Only include sessions where the # of backups per minute is at least
        </Typography>

        <TextField
          label="Backup(s)"
          type="number"
          size="small"
          value={numBackupsThreshold}
          onChange={handleThresholdChange(setNumBackupsThreshold)}
          sx={{ width: 100 }} // Narrowed because numbers are usually small
        />

        <Typography variant="body1">per</Typography>

        <TextField
          label="Minute(s)"
          type="number"
          size="small"
          value={timeThreshold}
          onChange={handleThresholdChange(setTimeThreshold)}
          sx={{ width: 100 }}
        />

        <Typography variant="body1">minute(s).</Typography>
      </Box>

      <Paper
        sx={{
          height: 500,
          width: "100%",
          boxShadow: 3,
          borderRadius: 2,
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
            sorting: {
              sortModel: [{ field: "startTimestamp", sort: "desc" }],
            },
          }}
          pageSizeOptions={[5, 10, 25]}
          disableRowSelectionOnClick
        />
      </Paper>
    </Box>
  );
};

export default AutograderSpam;
