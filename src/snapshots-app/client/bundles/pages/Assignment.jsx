import React from "react";

import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { TextField, Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { styled } from "@mui/material/styles";
import { useAtom } from "jotai";

import { selectedCourseAtom, selectedAssignmentAtom, selectedStudentAtom } from "../state/atoms";

// TODO: rename paths and components to be consistent
function StudentsTable({ courseId, assignmentId, studentsData }) {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const [selectedStudent, setSelectedStudent] = useAtom(selectedStudentAtom);

  const filteredStudents = studentsData.filter(
    (s) =>
      s.first_name.toLowerCase().includes(search.toLowerCase()) ||
      s.last_name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.student_id.toString().includes(search.toLowerCase())
  );

  const columns = [
    {
      field: "name",
      headerName: "Student Name",
      valueGetter: (value, row) => `${row.first_name} ${row.last_name}`,
      flex: 2,
      headerClassName: "column-header",
      renderCell: (params) => (
        <span
          style={{
            color: "#1976d2",
            cursor: "pointer",
            textDecoration: "underline",
          }}
          onClick={() => {
            setSelectedStudent(params.row);
            console.log("selected student", params.row)
            navigate(
              `/courses/${courseId}/assignments/${assignmentId}/students/${params.row.id}`,
            )
          }}
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
      field: "student_id",
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
  const [selectedCourse, setSelectedCourse] = useAtom(selectedCourseAtom);
  const [selectedAssignment, setSelectedAssignment] = useAtom(selectedAssignmentAtom);
  const [studentsData, setStudentsData] = useState([]);

  useEffect(() => {
    fetch(`/api/submissions/${selectedCourse.id}/${selectedAssignment.id}`, {
      method: "GET",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((responseData) => {
        setStudentsData(responseData["submissions"]);
      })
      .catch((error) => {
        throw new Error(`HTTP error! Error: ${error}`);
      });
  }, [selectedCourse, selectedAssignment]);

  return (
    <div style={{ paddingLeft: "1rem", paddingRight: "1rem" }}>
      <h1>{selectedAssignment.name}</h1>
      <StudentsTable
        courseId={selectedCourse.id}
        assignmentId={selectedAssignment.id}
        studentsData={studentsData}
      />
    </div>
  );
}

export default Assignment;
