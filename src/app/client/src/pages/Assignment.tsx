import { useParams, useNavigate } from "react-router";
import { useState } from "react";
import { TextField, Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { styled } from "@mui/material/styles";

// TODO: rename paths and components to be consistent
function StudentsTable({ courseId, assignmentId, studentsData }) {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filteredStudents = studentsData.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId.toString().includes(search.toLowerCase()),
  );

  // TODO: replace with API call
  const columns = [
    {
      field: "name",
      headerName: "Student Name",
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
            navigate(
              `/courses/${courseId}/assignments/${assignmentId}/students/${params.row.id}`,
            )
          }
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      headerClassName: "column-header",
    },
    {
      field: "studentId",
      headerName: "Student ID",
      flex: 1,
      headerClassName: "column-header",
    },
  ];

  const rows = filteredStudents.map((row, idx) => ({
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
              sortModel: [{ field: "name", sort: "asc" }],
            },
          }}
          disableRowSelectionOnClick
        />
      </div>
    </Box>
  );
}

function Assignment() {
  const params = useParams();
  const courseId = parseInt(params.courseId);
  const assignmentId = parseInt(params.assignmentId);
  const studentsData = [
    {
      id: 1,
      name: "Alice Jones",
      email: "ajones@berkeley.edu",
      studentId: 12345,
    },
    {
      id: 2,
      name: "Bob Smith",
      email: "bsmith@berkeley.edu",
      studentId: 67890,
    },
    {
      id: 3,
      name: "Charlie Brown",
      email: "cbrown@berkeley.edu",
      studentId: 24680,
    },
  ];
  const assignmentIdMap = {
    1: "Lab 7",
    2: "Ants",
    3: "Maps",
  };

  return (
    <div style={{ paddingLeft: "1rem", paddingRight: "1rem" }}>
      <h1>{assignmentIdMap[assignmentId]}</h1>
      <StudentsTable
        courseId={courseId}
        assignmentId={assignmentId}
        studentsData={studentsData}
      />
    </div>
  );
}

export default Assignment;
