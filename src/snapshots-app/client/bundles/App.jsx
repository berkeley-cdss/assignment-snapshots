import React from "react";

import { BrowserRouter, Route, Routes } from "react-router";

import Login from "./pages/Login";
import Courses from "./pages/Courses";
import Assignments from "./pages/Assignments";
import Students from "./pages/Students";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import TabsLayout from "./layouts/TabsLayout";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <Header />

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:courseId" element={<Assignments />} />
        <Route
          path="/courses/:courseId/assignments/:assignmentId"
          element={<Students />}
        />
        <Route
          path="/courses/:courseId/assignments/:assignmentId/students/:studentId/:tabId"
          element={<TabsLayout />}
        />
        <Route
          path="/courses/:courseId/assignments/:assignmentId/students/:studentId/:tabId/:backupId"
          element={<TabsLayout />}
        />
        <Route
          path="/courses/:courseId/assignments/:assignmentId/students/:studentId"
          element={<TabsLayout />}
        />

        {/* catch all route */}
        <Route
          path="*"
          element={<NotFound />}
        />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;
