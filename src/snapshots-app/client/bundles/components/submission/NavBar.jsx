import React from "react";

import { Typography } from "@mui/material";

function NavBar({ studentName, studentEmail, studentId, assignmentName }) {
  return (
    <Typography align="left">Assignment: {assignmentName}</Typography>

    // TODO fix spacing of student information - this is because toolbar doesn't extend full width in layout
    // <Grid container spacing={2} alignItems="center">
    //   <Grid size={{ xs: 4 }}>
    //     <Typography align="left">Assignment: {assignmentName}</Typography>
    //   </Grid>
    //   <Grid size={{ xs: 4 }}>
    //     {/* Center Empty Area */}
    //   </Grid>
    //   <Grid size={{ xs: 4 }}>
    //     <Typography align="right">Student: {studentName} {studentEmail} {studentId}</Typography>
    //   </Grid>
    // </Grid>
  );
}

export default NavBar;
