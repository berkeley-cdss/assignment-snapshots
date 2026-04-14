import React from "react";

import { useParams } from "react-router";
import { useState } from "react";
import { TextField, Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { styled } from "@mui/material/styles";
import { useAtomValue } from "jotai";

import { studentsAtom } from "../state/atoms";
import TableCellNavLink from "../components/common/TableCellNavLink";

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
          pathname={`/courses/${courseId}/assignments/${assignmentId}/students/${params.row.id}/submission/summary`}
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

function Students() {
  const routeParams = useParams();
  const students = useAtomValue(studentsAtom);

  return (
    <div style={{ paddingLeft: "1rem", paddingRight: "1rem" }}>
      <StudentsTable
        courseId={routeParams.courseId}
        assignmentId={routeParams.assignmentId}
        students={students}
      />
    </div>
  );
}

export default Students;
