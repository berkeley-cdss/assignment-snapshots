import React from "react";

import { useParams, useNavigate } from "react-router";
import { useState } from "react";
import { TextField, Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { styled } from "@mui/material/styles";

// TODO: rename paths and components to be consistent
function AssignmentsTable({ courseId, assignmentsData }) {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filteredAssignments = assignmentsData.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()),
  );

  // TODO: replace with API call
  const columns = [
    {
      field: "name",
      headerName: "Assignment",
      flex: 2,
      headerClassName: "column-header",
      renderCell: (params) => (
        <span
          style={{
            color: "#1976d2",
            cursor: "pointer",
            textDecoration: "underline",
          }}
          onClick={() =>
            navigate(`/courses/${courseId}/assignments/${params.row.id}`)
          }
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "due_date",
      headerName: "Due Date",
      flex: 1,
      headerClassName: "column-header",
      valueFormatter: (value) => {
        const date = new Date(value);
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      },
    },
  ];

  const rows = filteredAssignments.map((row, idx) => ({
    id: idx,
    ...row,
  }));

  const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
    "& .column-header": {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      fontWeight: "bold",
    },
  }));

  return (
    <Box sx={{ mb: 2, width: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>
      <div style={{ width: "100%" }}>
        <StyledDataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
            sorting: {
              sortModel: [{ field: "due_date", sort: "desc" }],
            },
          }}
          disableRowSelectionOnClick
        />
      </div>
    </Box>
  );
}

function Course() {
  const params = useParams();
  const courseId = parseInt(params.courseId);

  const [assignmentsData, setAssignmentsData] = useState([]);
  const userId = "user-id-12345"; // TODO replace me when implementing authentication
  React.useEffect(() => {
    fetch(`/api/assignments/${userId}/${courseId}`, {
      method: "GET",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((responseData) => {
        console.log(responseData);
        setAssignmentsData(responseData["assignments"]);
      })
      .catch((error) => {
        throw new Error(`HTTP error! Error: ${error}`);
      });
  }, []);

  // TODO retrieve programmatically
  const courseIdMap = {
    1: "CS 61A Fall 2025",
    2: "DATA C88C Spring 2025",
    3: "CS 61B Fall 2023",
  };

  return (
    <div style={{ paddingLeft: "1rem", paddingRight: "1rem" }}>
      <h1>{courseIdMap[courseId]}</h1>
      <AssignmentsTable courseId={courseId} assignmentsData={assignmentsData} />
    </div>
  );
}

export default Course;
