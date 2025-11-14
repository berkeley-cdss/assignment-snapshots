import React from "react";

import { useParams } from "react-router";
import { useState, useEffect } from "react";
import { TextField, Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { styled } from "@mui/material/styles";
import { useAtom, useAtomValue } from "jotai";

import { coursesAtom, assignmentsAtom, studentsAtom } from "../state/atoms";
import TableCellNavLink from "../components/common/TableCellNavLink";

// TODO: rename paths and components to be consistent
function StudentsTable({ courseId, assignmentId, students }) {
  const [search, setSearch] = useState("");

  const filteredStudents = students.filter(
    (s) =>
      s.first_name.toLowerCase().includes(search.toLowerCase()) ||
      s.last_name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.student_id.toString().includes(search.toLowerCase()),
  );

  const columns = [
    {
      field: "name",
      headerName: "Student Name",
      valueGetter: (value, row) => `${row.first_name} ${row.last_name}`,
      flex: 2,
      headerClassName: "column-header",
      renderCell: (params) => (
        <TableCellNavLink
          pathname={`/courses/${courseId}/assignments/${assignmentId}/students/${params.row.id}`}
        >
          {params.value}
        </TableCellNavLink>
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
  const routeParams = useParams();

  const courses = useAtomValue(coursesAtom);
  const selectedCourse = courses.find(
    (course) => course.id.toString() === routeParams.courseId,
  );

  const assignments = useAtomValue(assignmentsAtom);
  const selectedAssignment = assignments.find(
    (assignment) => assignment.id.toString() === routeParams.assignmentId,
  );

  const [students, setStudents] = useAtom(studentsAtom);

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
        setStudents(responseData["submissions"]);
      })
      .catch((error) => {
        throw new Error(`HTTP error! Error: ${error}`);
      });
  }, [selectedCourse, selectedAssignment, setStudents]);

  return (
    <div style={{ paddingLeft: "1rem", paddingRight: "1rem" }}>
      <StudentsTable
        courseId={selectedCourse.id}
        assignmentId={selectedAssignment.id}
        students={students}
      />
    </div>
  );
}

export default Assignment;
