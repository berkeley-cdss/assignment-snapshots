import React from "react";

import { BrowserRouter, Route, Routes } from "react-router";

import SubmissionLayout from "./layouts/SubmissionLayout";
import Login from "./pages/Login";
import Courses from "./pages/Courses";
import Course from "./pages/Course";
import Assignment from "./pages/Assignment";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";

function App() {

  return (
    <BrowserRouter>
      <Header />

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:courseId" element={<Course />} />
        <Route
          path="/courses/:courseId/assignments/:assignmentId"
          element={<Assignment />}
        />
        <Route
          path="/courses/:courseId/assignments/:assignmentId/students/:studentId"
          element={<SubmissionLayout />}
        />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;
