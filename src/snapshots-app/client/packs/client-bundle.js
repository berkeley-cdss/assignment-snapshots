import ReactOnRails from "react-on-rails";

import App from "../bundles/App";

import BreadcrumbNav from "../bundles/components/common/BreadcrumbNav";
import Header from "../bundles/components/common/Header";
import Footer from "../bundles/components/common/Footer";

import DiffViewer from "../bundles/components/submission/DiffViewer";
import FileViewer from "../bundles/components/submission/FileViewer";
import Graphs from "../bundles/components/submission/Graphs";
import Timeline from "../bundles/components/submission/Timeline";
import AutograderOutputDialog from "../bundles/components/submission/AutograderOutputDialog";
import UnlockingTestOutputDialog from "../bundles/components/submission/UnlockingTestOutputDialog";

import SubmissionLayout from "../bundles/layouts/SubmissionLayout";

import Login from "../bundles/pages/Login";
import Courses from "../bundles/pages/Courses";
import Course from "../bundles/pages/Course";
import Assignment from "../bundles/pages/Assignment";

// This is how react_on_rails can see the HelloWorld in the browser.
ReactOnRails.register({
  App,
  BreadcrumbNav,
  Header,
  Footer,
  DiffViewer,
  FileViewer,
  Graphs,
  Timeline,
  AutograderOutputDialog,
  UnlockingTestOutputDialog,
  SubmissionLayout,
  Login,
  Courses,
  Course,
  Assignment,
});

// TODO rename this file to client-bundle?
