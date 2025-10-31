import React from "react";

import { useParams, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { TextField, Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { styled } from "@mui/material/styles";
import { useAtom } from "jotai";

import { selectedCourseAtom, selectedAssignmentAtom } from "../state/atoms";

// TODO: rename paths and components to be consistent
function AssignmentsTable({ courseId, assignmentsData, setSelectedAssignment }) {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filteredAssignments = assignmentsData.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

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
          onClick={() => {
            setSelectedAssignment(params.row);
            navigate(`/courses/${courseId}/assignments/${params.row.id}`)
          }}
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
  const [selectedCourse, setSelectedCourse] = useAtom(selectedCourseAtom);
  const [selectedAssignment, setSelectedAssignment] = useAtom(selectedAssignmentAtom);
  const [assignmentsData, setAssignmentsData] = useState([]);

  useEffect(() => {
    fetch(`/api/assignments/${selectedCourse.id}`, {
      method: "GET",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((responseData) => {
        setAssignmentsData(responseData["assignments"]);
      })
      .catch((error) => {
        throw new Error(`HTTP error! Error: ${error}`);
      });
  }, [selectedCourse]);

  return (
    <div style={{ paddingLeft: "1rem", paddingRight: "1rem" }}>
      <h1>{selectedCourse.dept} {selectedCourse.code} {selectedCourse.term.charAt(0).toUpperCase() + selectedCourse.term.slice(1)} {selectedCourse.year}</h1>
      <AssignmentsTable courseId={selectedCourse.id} assignmentsData={assignmentsData} setSelectedAssignment={setSelectedAssignment} />
    </div>
  );
}

export default Course;
