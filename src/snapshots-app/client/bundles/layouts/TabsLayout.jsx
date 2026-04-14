import React from "react";

import { useParams, useNavigate } from "react-router";
import { Box, Tab } from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";

import SummaryTab from "../components/submission/tabs/SummaryTab";
import StyleTab from "../components/submission/tabs/StyleTab";
import DebuggingTab from "../components/submission/tabs/DebuggingTab";
import DesignTab from "../components/submission/tabs/DesignTab";
import IntegrityTab from "../components/submission/tabs/IntegrityTab";
import SubmissionLayout from "./SubmissionLayout";

function TabsLayout() {
  const { courseId, assignmentId, studentId, tabId } = useParams();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!tabId) {
      navigate(
        `/courses/${courseId}/assignments/${assignmentId}/students/${studentId}/submission/summary`,
        { replace: true },
      );
    }
  }, [courseId, assignmentId, studentId, tabId, navigate]);

  // Define tabs with lowercase IDs for the URL
  const TABS = [
    { id: "summary", label: "Summary", component: <SummaryTab /> },
    { id: "style", label: "Style", component: <StyleTab /> },
    { id: "debugging", label: "Debugging", component: <DebuggingTab /> },
    // { id: "design", label: "Design", component: <DesignTab /> },
    // { id: "integrity", label: "Integrity", component: <IntegrityTab /> },
    { id: "timeline", label: "Timeline", component: <SubmissionLayout /> },
  ];

  // Fallback: If URL has no tabId or an invalid one, default to the first tab
  const activeTab = TABS.find((t) => t.id === tabId) ? tabId : TABS[0].id;

  const handleChange = (event, newValue) => {
    navigate(
      `/courses/${courseId}/assignments/${assignmentId}/students/${studentId}/submission/${newValue}`,
    );
  };

  return (
    <Box sx={{ width: "100%", typography: "body1" }}>
      <TabContext value={activeTab}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <TabList onChange={handleChange} aria-label="Student submission tabs">
            {TABS.map((tab) => (
              <Tab label={tab.label} value={tab.id} key={tab.id} />
            ))}
          </TabList>
        </Box>
        {TABS.map((tab) => (
          <TabPanel value={tab.id} key={tab.id}>
            {tab.component}
          </TabPanel>
        ))}
      </TabContext>
    </Box>
  );
}

export default TabsLayout;
