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
    a.assignment.toLowerCase().includes(search.toLowerCase()),
  );

  // TODO: replace with API call
  const columns = [
    {
      field: "assignment",
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
      field: "dueDate",
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
              sortModel: [{ field: "dueDate", sort: "desc" }],
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
  const assignmentsData = [
    { id: 1, assignment: "Lab 7", dueDate: "2025-12-01" },
    { id: 2, assignment: "Ants", dueDate: "2025-11-26" },
    { id: 3, assignment: "Maps", dueDate: "2025-10-01" },
  ];
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
