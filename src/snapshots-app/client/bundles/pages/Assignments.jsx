import React from "react";

import { useParams } from "react-router";
import { useState } from "react";
import { TextField, Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { styled } from "@mui/material/styles";
import { useAtomValue } from "jotai";

import { assignmentsAtom } from "../state/atoms";
import TableCellNavLink from "../components/common/TableCellNavLink";

// TODO do below and rename submission layout to timeline and move files around
function AssignmentsTable({ courseId, assignments }) {
  const [search, setSearch] = useState("");

  const filteredAssignments = assignments.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()),
  );

  const columns = [
    {
      field: "name",
      headerName: "Assignment",
      flex: 2,
      headerClassName: "column-header",
      renderCell: (params) => (
        <TableCellNavLink
          pathname={`/courses/${courseId}/assignments/${params.row.id}`}
        >
          {params.value}
        </TableCellNavLink>
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

function Assignments() {
  const routeParams = useParams();
  const assignments = useAtomValue(assignmentsAtom);

  return (
    <div style={{ paddingLeft: "1rem", paddingRight: "1rem" }}>
      <AssignmentsTable
        courseId={routeParams.courseId}
        assignments={assignments}
      />
    </div>
  );
}

export default Assignments;
