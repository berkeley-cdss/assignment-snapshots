import ReactOnRails from "react-on-rails";

import App from "../bundles/AppServer";

import BreadcrumbNav from "../bundles/components/common/BreadcrumbNavServer";
import Header from "../bundles/components/common/HeaderServer";
import Footer from "../bundles/components/common/FooterServer";

import Login from "../bundles/pages/LoginServer";
import Courses from "../bundles/pages/CoursesServer";
import Assignments from "../bundles/pages/AssignmentsServer";
import Students from "../bundles/pages/StudentsServer";

// This is how react_on_rails can see the HelloWorld in the browser.
ReactOnRails.register({
  App,
  BreadcrumbNav,
  Header,
  Footer,
  Login,
  Courses,
  Assignments,
  Students,
});
