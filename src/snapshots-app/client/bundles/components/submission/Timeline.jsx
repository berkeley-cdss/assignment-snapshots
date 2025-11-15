import React from "react";

import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";

// TODO add icons based on backup status
// import ErrorIcon from "@mui/icons-material/Error";
// import DoneIcon from "@mui/icons-material/Done";
// import LoopIcon from "@mui/icons-material/Loop";

function Timeline({ backups, selectedBackup, handleBackupSelect }) {
  // const buttons = [
  //   <Button variant={variant0} onClick={handleClick0} key="one">
  //     04/09/25 09:00 AM PST <ErrorIcon sx={{ marginLeft: "10px" }} />
  //   </Button>,
  //   <Button variant={variant1} onClick={handleClick1} key="two">
  //     04/09/25 10:00 AM PST <LoopIcon sx={{ marginLeft: "10px" }} />
  //   </Button>,
  //   <Button variant={variant2} onClick={handleClick2} key="three">
  //     04/09/25 11:00 AM PST <DoneIcon sx={{ marginLeft: "10px" }} />
  //   </Button>,
  // ];

  return (
    <div>
      <h2>Timeline</h2>
      <ButtonGroup
        orientation="vertical"
        aria-label="Vertical button group"
        style={{ width: "100%" }}
      >
        {backups.map((backup, index) => {
          const isSelected = index === selectedBackup;
          const date = new Date(backup.created);
          const formattedDate = date.toLocaleString("en-US", {
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          });
          return (
            <Button
              key={backup.id}
              variant={isSelected ? "contained" : "outlined"}
              onClick={() => handleBackupSelect(index)}
            >
              {formattedDate}
            </Button>
          );
        })}
      </ButtonGroup>
    </div>
  );
}

export default Timeline;
