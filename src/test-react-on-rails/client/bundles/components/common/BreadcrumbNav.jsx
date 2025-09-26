import React from "react";

import Breadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import { useLocation, Link as RouterLink } from "react-router";

// Data for dynamic breadcrumb generation
// TODO retrieve this dynamically? use react state management like redux or jotai?
const courses = {
  "1": "CS 61A Fall 2025",
  "2": "DATA C88C Spring 2025",
  "3": "CS 61B Fall 2023",
};

const assignments = {
  "1": "Lab 7",
  "2": "Ants",
  "3": "Maps",
};

const students = {
  "1": "Alice Jones (ajones@berkeley.edu)",
  "2": "Bob Smith (bsmith@berkeley.edu)",
  "3": "Charlie Brown (cbrown@berkeley.edu)",
};

// TODO make this less hacky
function getBreadcrumbName(path) {
  if (path === "/courses") return "Courses";
  if (path === "/courses/submission") return "Submission";

  const parts = path.split("/").filter(Boolean);

  if (parts.length >= 2 && parts[0] === "courses" && courses[parts[1]]) {
    if (parts.length === 2) return courses[parts[1]];
    if (
      parts.length >= 4 &&
      parts[2] === "assignments" &&
      assignments[parts[3]]
    ) {
      if (parts.length === 4) return assignments[parts[3]];
      if (parts.length === 6 && parts[4] === "students" && students[parts[5]]) {
        return students[parts[5]];
      }
    }
  }
  return undefined;
}

function LinkRouter(props) {
  return <Link {...props} component={RouterLink} />;
}

function BreadcrumbNav() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <div
      style={{
        padding: "1rem",
        borderBottom: "1px solid lightGrey",
        backgroundColor: "white",
      }}
    >
      <Breadcrumbs separator="›" aria-label="breadcrumb">
        {/* TODO remove login from breadcrumb nav */}
        <LinkRouter underline="hover" color="inherit" to="/">
          Login
        </LinkRouter>
        {pathnames.map((value, index) => {
          // Remove assignments/students from breadcrumb nav because there's no /assignments or /students by itself
          if (index !== 2 && index !== 4) {
            const last = index === pathnames.length - 1;
            const to = `/${pathnames.slice(0, index + 1).join("/")}`;
            const name = getBreadcrumbName(to);

            if (!name) return null;

            return last ? (
              <Typography key={to} sx={{ color: "text.primary" }}>
                {name}
              </Typography>
            ) : (
              <LinkRouter underline="hover" color="inherit" to={to} key={to}>
                {name}
              </LinkRouter>
            );
          }
          return null;
        })}
      </Breadcrumbs>
    </div>
  );
}

export default BreadcrumbNav;
