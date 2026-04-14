import React, { useMemo, useState, useEffect } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Link,
  Tooltip,
  IconButton,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { useNavigate } from "react-router";

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

const Errors = () => {
  const [errorData, setErrorData] = useState([]);
  const [errorTypeSortDescending, setErrorTypeSortDescending] = useState(true);

  const routeParams = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(
      `/api/debugging/errors/${routeParams.courseId}/${routeParams.assignmentId}/${routeParams.studentId}`,
    )
      .then((response) => response.json())
      .then((responseData) => setErrorData(responseData));
  }, [routeParams]);

  const sortedGroupedErrors = useMemo(() => {
    const groups = errorData.reduce((acc, error) => {
      if (!acc[error.type]) acc[error.type] = [];
      acc[error.type].push(error);
      return acc;
    }, {});

    return Object.entries(groups).sort((a, b) => {
      const countA = a[1].length;
      const countB = b[1].length;

      return errorTypeSortDescending ? countB - countA : countA - countB;
    });
  }, [errorData, errorTypeSortDescending]);

  const columns = [
    {
      field: "timestamp",
      headerName: "Timestamp",
      flex: 1,
      valueFormatter: (value) => formatTimestamp(value),
      display: "flex",
    },
    {
      field: "backupId",
      headerName: "Backup ID",
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Tooltip title="Open in timeline" arrow>
            <Link
              component="button"
              variant="body2"
              onClick={() =>
                navigate(
                  `/courses/${routeParams.courseId}/assignments/${routeParams.assignmentId}/students/${routeParams.studentId}/submission/timeline/${params.value}`,
                )
              }
            >
              {params.value}
            </Link>
          </Tooltip>
        </Box>
      ),
    },
    {
      field: "message",
      headerName: "Error Message",
      flex: 2,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Typography
            variant="body2"
            sx={{
              fontFamily: "monospace",
              color: "#d32f2f",
              lineHeight: "normal",
            }}
          >
            {params.value}
          </Typography>
        </Box>
      ),
    },
  ];

  const toggleSort = () => {
    setErrorTypeSortDescending((prev) => !prev);
  };

  return (
    <Box sx={{ width: "100%", p: 1, position: "relative" }}>
      {/* Header Container */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            Errors
          </Typography>
          <InfoTooltip
            info="This page shows backups with errors, grouped by the error type. Click the backup ID to view that backup in the Timeline tab."
            placement="right"
          />
        </Box>

        {/* Top-Right Sort Toggle Button */}
        <Tooltip
          title={`Sort errors by frequency (Current: ${errorTypeSortDescending ? "Descending" : "Ascending"})`}
        >
          <IconButton
            onClick={toggleSort}
            color="primary"
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            {errorTypeSortDescending ? (
              <ArrowDownwardIcon />
            ) : (
              <ArrowUpwardIcon />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Error group accordions */}
      {sortedGroupedErrors.map(([errorType, errors]) => (
        <Accordion
          key={errorType}
          sx={{
            mb: 1,
            boxShadow: "none",
            border: "1px solid #e0e0e0",
            "&:before": { display: "none" },
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <ErrorOutlineIcon color="error" />
              <Typography sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                {errorType}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", ml: 1 }}
              >
                ({errors.length}{" "}
                {errors.length === 1 ? "occurrence" : "occurrences"})
              </Typography>
            </Box>
          </AccordionSummary>

          <AccordionDetails
            sx={{
              p: 2,
              display: "flex",
              justifyContent: "center",
              backgroundColor: "#fafafa",
            }}
          >
            <Paper
              sx={{
                height: 300,
                width: "95%",
                borderRadius: 1,
                overflow: "hidden",
              }}
            >
              <DataGrid
                rows={errors}
                columns={columns}
                pageSizeOptions={[5]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 5 } },
                  sorting: {
                    sortModel: [{ field: "timestamp", sort: "desc" }],
                  },
                }}
                disableRowSelectionOnClick
                sx={{
                  "& .MuiDataGrid-cell": {
                    display: "flex",
                    alignItems: "center",
                  },
                }}
              />
            </Paper>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default Errors;
