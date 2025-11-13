import React from "react";

import { useState, useEffect } from "react";
import { TextField, Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { styled } from "@mui/material/styles";
import { useAtom, useAtomValue } from "jotai";

import { userAtom, coursesAtom } from "../state/atoms";
import TableCellNavLink from "../components/common/TableCellNavLink";

function CoursesTable() {
  const user = useAtomValue(userAtom);
  const [courses, setCourses] = useAtom(coursesAtom);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`/api/courses?email=${encodeURIComponent(user)}`, {
      method: "GET",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((responseData) => {
        setCourses(responseData["courses"]);
      })
      .catch((error) => {
        throw new Error(`HTTP error! Error: ${error}`);
      });
  }, [user, setCourses]);

  const termStringToInt = (termString) => {
    switch (termString) {
      case "winter":
        return 0;
      case "spring":
        return 1;
      case "summer":
        return 2;
      case "fall":
        return 3;
      default:
        throw new Error("Unknown Term String: " + termString);
    }
  };

  const filteredCourses = courses.filter(
    (c) =>
      c.dept.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.term.toLowerCase().includes(search.toLowerCase()) ||
      c.year.toString().includes(search.toLowerCase()),
  );

  function termComparator(a, b) {
    if (a.year !== b.year) {
      return a.year - b.year;
    }
    return termStringToInt(a.term) - termStringToInt(b.term);
  }

  const columns = [
    {
      field: "course",
      headerName: "Course",
      valueGetter: (value, row) => `${row.dept} ${row.code}`,
      flex: 1,
      headerClassName: "column-header",
      renderCell: (params) => (
        <TableCellNavLink pathname={`/courses/${params.row.id}`}>
          {params.value}
        </TableCellNavLink>
      ),
    },
    {
      field: "name",
      headerName: "Name",
      flex: 2,
      headerClassName: "column-header",
    },
    {
      field: "term",
      headerName: "Term",
      valueGetter: (value, row) =>
        `${row.term.charAt(0).toUpperCase() + row.term.slice(1)} ${row.year}`,
      flex: 1,
      headerClassName: "column-header",
      sortComparator: termComparator,
    },
  ];

  const rows = filteredCourses.map((row) => ({
    id: row.id,
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
          }}
          disableRowSelectionOnClick
        />
      </div>
    </Box>
  );
}

function Courses() {
  return (
    <div style={{ paddingLeft: "1rem", paddingRight: "1rem" }}>
      <h1>Courses</h1>
      <CoursesTable />
    </div>
  );
}

export default Courses;
