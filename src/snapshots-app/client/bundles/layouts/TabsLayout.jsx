import React from "react";

import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";

import SummaryTab from "../components/submission/tabs/SummaryTab";
import StyleTab from "../components/submission/tabs/StyleTab";
import DebuggingTab from "../components/submission/tabs/DebuggingTab";
import DesignTab from "../components/submission/tabs/DesignTab";
import IntegrityTab from "../components/submission/tabs/IntegrityTab";
import TimelineTab from "../components/submission/tabs/TimelineTab";

function TabsLayout({}) {
  const [value, setValue] = React.useState(0);
  const TABS = [
    { label: "Summary", component: <SummaryTab /> },
    { label: "Style", component: <StyleTab /> },
    { label: "Debugging", component: <DebuggingTab /> },
    { label: "Design", component: <DesignTab /> },
    { label: "Integrity", component: <IntegrityTab /> },
    { label: "Timeline", component: <TimelineTab /> },
  ];

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%", typography: "body1" }}>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <TabList onChange={handleChange} aria-label="Student submission tabs">
            {TABS.map((tab, idx) => (
              <Tab label={tab.label} value={idx} key={idx} />
            ))}
          </TabList>
        </Box>
        {TABS.map((tab, idx) => (
          <TabPanel value={idx} key={idx}>
            {tab.component}
          </TabPanel>
        ))}
      </TabContext>
    </Box>
  );
}

export default TabsLayout;
