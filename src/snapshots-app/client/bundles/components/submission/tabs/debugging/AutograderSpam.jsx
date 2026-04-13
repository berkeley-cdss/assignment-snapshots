import React, { useEffect, useState } from "react";
import { Typography, Box, Paper, Tooltip, IconButton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import { useParams } from "react-router";

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
  // TODO make adjustable
  const [rows, setRows] = useState([]);
  const [numBackupsThreshold, setNumBackupsThreshold] = useState(5);
  const [timeThreshold, setTimeThreshold] = useState(5);

  const routeParams = useParams();

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
        <Tooltip title="Jump to Timeline">
          <IconButton
            color="primary"
            size="small"
            onClick={() => console.log(`Opening ID: ${params.id}`)}
          >
            <OpenInNewIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Autograder Spam
        </Typography>
        <InfoTooltip
          info="This table shows periods of intense autograder activity within a short time period, which may indicate the student was using the autograder to debug. Click the details icon to jump to that time period in the Timeline tab."
          placement="right"
        />
      </div>

      <Paper
        sx={{
          height: 400,
          width: "100%",
          mt: 3,
          boxShadow: 3,
          borderRadius: 2,
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 5 },
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
