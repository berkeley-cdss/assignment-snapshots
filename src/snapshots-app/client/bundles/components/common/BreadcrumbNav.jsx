import React, { useEffect } from "react";

import Breadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import { Link as RouterLink, useMatch } from "react-router";
import { useAtom, useAtomValue } from "jotai";

import {
  userAtom,
  coursesAtom,
  assignmentsAtom,
  studentsAtom,
} from "../../state/atoms";

function BreadcrumbNavLink(props) {
  return <Link {...props} component={RouterLink} />;
}

function BreadcrumbNav() {
  const matchesCoursesRoute = useMatch({ path: "/courses", end: false });
  const matchesAssignmentsRoute = useMatch({
    path: "/courses/:courseId/assignments",
    end: false,
  });
  const matchesStudentsRoute = useMatch({
    path: "/courses/:courseId/assignments/:assignmentId/students",
    end: false,
  });
  const matchesSubmissionRoute = useMatch({
    path: "/courses/:courseId/assignments/:assignmentId/students/:studentId/submission",
    end: false,
  });

  const user = useAtomValue(userAtom);
  const [courses, setCourses] = useAtom(coursesAtom);
  const [assignments, setAssignments] = useAtom(assignmentsAtom);
  const [students, setStudents] = useAtom(studentsAtom);

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

  useEffect(() => {
    if (matchesAssignmentsRoute?.params?.courseId) {
      fetch(`/api/assignments/${matchesAssignmentsRoute.params.courseId}`, {
        method: "GET",
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((responseData) => {
          setAssignments(responseData["assignments"]);
        })
        .catch((error) => {
          throw new Error(`HTTP error! Error: ${error}`);
        });
    }
  }, [matchesAssignmentsRoute?.params?.courseId, setAssignments]);

  useEffect(() => {
    if (matchesStudentsRoute?.params?.courseId && matchesStudentsRoute?.params?.assignmentId) {
      fetch(`/api/submissions/${matchesStudentsRoute.params.courseId}/${matchesStudentsRoute.params.assignmentId}`, {
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
    }
  }, [matchesStudentsRoute?.params?.courseId, matchesStudentsRoute?.params?.assignmentId, setStudents]);

  const breadcrumbs = getBreadcrumbs();

  function findById(objects, id) {
    const temp = objects.find((item) => item.id.toString() === id);
    return temp;
  }

  function getCourseHumanReadableName(course) {
    const termCapitalized =
      course.term.charAt(0).toUpperCase() + course.term.slice(1);
    return `${course.dept} ${course.code} (${termCapitalized} ${course.year})`;
  }

  function getBreadcrumbs() {
    const result = [{ name: "Login", path: "/" }];

    if (matchesCoursesRoute) {
      result.push({ name: "Courses", path: "/courses" });
    }

    if (matchesAssignmentsRoute) {
      const course = findById(courses, matchesAssignmentsRoute.params.courseId);
      if (course) {
        result.push({
        name: getCourseHumanReadableName(course),
        path: `/courses/${matchesAssignmentsRoute.params.courseId}/assignments`,
      });
      } else {
        result.push({
          name: "Loading course name",
          path: "#"
        })
      }


    }

    if (matchesStudentsRoute) {
      const assignment = findById(
        assignments,
        matchesStudentsRoute.params.assignmentId,
      );
      if (assignment) {
result.push({
        name: assignment.name,
        path: `/courses/${matchesStudentsRoute.params.courseId}/assignments/${matchesStudentsRoute.params.assignmentId}/students`,
      });
      } else {
        result.push({
          name: "Loading assignment name",
          path: "#"
        })
      }

    }

    if (matchesSubmissionRoute) {
      const student = findById(students, matchesSubmissionRoute.params.studentId);
      if (student) {
        result.push({
        name: `${student.first_name} ${student.last_name} (SID: ${student.student_id})`,
        path: `/courses/${matchesSubmissionRoute.params.courseId}/assignments/${matchesSubmissionRoute.params.assignmentId}/students/${matchesSubmissionRoute.params.studentId}/submission/summary`,
      });
      } else {
        result.push({
        name: "Loading student name and SID",
        path: "#"
      });
      }

    }

    return result;
  }

  return (
    <div
      style={{
        padding: "1rem",
        borderBottom: "1px solid lightGrey",
        backgroundColor: "white",
      }}
    >
      <Breadcrumbs separator="›" aria-label="breadcrumb">
        {breadcrumbs.map((bc, index) => {
          const last = index === breadcrumbs.length - 1;
          return last ? (
            <Typography key={index} sx={{ color: "text.primary" }}>
              {bc.name}
            </Typography>
          ) : (
            <BreadcrumbNavLink
              underline="hover"
              color="inherit"
              to={bc.path}
              key={index}
            >
              {bc.name}
            </BreadcrumbNavLink>
          );
        })}
      </Breadcrumbs>
    </div>
  );
}

export default BreadcrumbNav;
