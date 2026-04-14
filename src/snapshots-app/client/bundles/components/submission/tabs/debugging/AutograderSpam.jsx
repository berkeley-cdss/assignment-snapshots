import React, { useEffect, useState } from "react";

import {
  Typography,
  Box,
  Paper,
  Tooltip,
  IconButton,
  TextField,
  Stack,
  Slider,
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

  const getMarks = (totalBackups) => {
    return [
      {
        value: 0,
        label: "0",
      },
      {
        value: Math.round(totalBackups * 0.25),
        label: `${Math.round(totalBackups * 0.25)}`,
      },
      {
        value: Math.round(totalBackups * 0.5),
        label: `${Math.round(totalBackups * 0.5)}`,
      },
      {
        value: Math.round(totalBackups * 0.75),
        label: `${Math.round(totalBackups * 0.75)}`,
      },
      {
        value: totalBackups,
        label: `${totalBackups}`,
      },
    ];
  };

  const columns = [
    {
      field: "worksession",
      headerName: "Worksession",
      flex: 2,
      valueGetter: (value, row) => new Date(row.startTimestamp),
      sortComparator: (v1, v2) => v1 - v2,
      // TODO fix popper being hidden by DataGrid on the far left side when hovering over the slider thumbs
      renderCell: (params) => {
        const getSliderValueText = (value) => {
          if (value === params.row.startIndex) {
            return `Backup #${value} (${formatTimestamp(params.row.startTimestamp)})`;
          } else {
            return `Backup #${value} (${formatTimestamp(params.row.endTimestamp)})`;
          }
        };

        return (
          <div
            style={{ display: "flex", alignItems: "center", height: "100%" }}
          >
            <Slider
              aria-label="Worksession"
              value={[params.row.startIndex, params.row.endIndex]}
              valueLabelDisplay="auto"
              min={0}
              max={params.row.totalBackups}
              marks={getMarks(params.row.totalBackups)}
              valueLabelFormat={getSliderValueText}
              getAriaValueText={getSliderValueText}
              sx={{
                // Reduce the size of the circles (thumbs)
                "& .MuiSlider-thumb": {
                  height: 12,
                  width: 12,
                },
                // Adjust the track and rail thickness to match smaller thumbs
                "& .MuiSlider-track": {
                  height: 4,
                },
                "& .MuiSlider-rail": {
                  height: 4,
                },
              }}
            />
          </div>
        );
      },
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
      headerName: "# of Backups",
      type: "number",
      width: 100,
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
        <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
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
        </div>
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
          rowHeight={100}
        />
      </Paper>
    </Box>
  );
};

export default AutograderSpam;
