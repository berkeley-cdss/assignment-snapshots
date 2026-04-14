import ReactOnRails from "react-on-rails";

import App from "../bundles/App";

import BreadcrumbNav from "../bundles/components/common/BreadcrumbNav";
import Header from "../bundles/components/common/Header";
import Footer from "../bundles/components/common/Footer";

import Login from "../bundles/pages/Login";
import Courses from "../bundles/pages/Courses";
import Assignments from "../bundles/pages/Assignments";
import Students from "../bundles/pages/Students";

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
