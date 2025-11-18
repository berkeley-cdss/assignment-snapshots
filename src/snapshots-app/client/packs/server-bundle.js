import ReactOnRails from "react-on-rails";

import App from "../bundles/AppServer";

import BreadcrumbNav from "../bundles/components/common/BreadcrumbNavServer";
import Header from "../bundles/components/common/HeaderServer";
import Footer from "../bundles/components/common/FooterServer";

import DiffViewer from "../bundles/components/submission/DiffViewerServer";
import FileViewer from "../bundles/components/submission/FileViewerServer";
import Graphs from "../bundles/components/submission/GraphsServer";
import Timeline from "../bundles/components/submission/TimelineServer";
import AutograderOutputDialog from "../bundles/components/submission/AutograderOutputDialogServer";
import UnlockingTestOutputDialog from "../bundles/components/submission/UnlockingTestOutputDialogServer";

import SubmissionLayout from "../bundles/layouts/SubmissionLayoutServer";

import Login from "../bundles/pages/LoginServer";
import Courses from "../bundles/pages/CoursesServer";
import Course from "../bundles/pages/CourseServer";
import Assignment from "../bundles/pages/AssignmentServer";

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
