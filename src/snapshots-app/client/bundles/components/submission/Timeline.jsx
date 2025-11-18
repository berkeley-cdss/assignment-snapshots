import React from "react";

import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import DoneIcon from "@mui/icons-material/Done";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { Tooltip } from "@mui/material";

function TimelineButton({ backup, selected, index, handleBackupSelect }) {
  function getNumPassedTests() {
    if (backup.unlock) {
      return backup.unlock_message_cases
        .map((umc) => (umc.correct ? 1 : 0))
        .reduce((a, b) => a + b, 0);
    } else {
      return backup.grading_message_questions
        .map((gmq) => gmq.passed)
        .reduce((a, b) => a + b, 0);
    }
  }

  function getNumFailedTests() {
    if (backup.unlock) {
      return backup.unlock_message_cases
        .map((umc) => (umc.correct ? 0 : 1))
        .reduce((a, b) => a + b, 0);
    } else {
      return backup.grading_message_questions
        .map((gmq) => gmq.failed)
        .reduce((a, b) => a + b, 0);
    }
  }

  function getNumLockedTests() {
    if (backup.unlock) {
      return null;
    } else {
      return backup.grading_message_questions
        .map((gmq) => gmq.locked)
        .reduce((a, b) => a + b, 0);
    }
  }

  function getTooltipTitle() {
    if (backup.unlock) {
      if (numFailedTests === 0) {
        return `All ${numPassedTests} unlocking tests passed`;
      } else {
        return `${numPassedTests} unlocking tests passed, ${numFailedTests} unlocking tests failed`;
      }
    } else {
      if (numFailedTests === 0 && numLockedTests === 0) {
        return `All ${numPassedTests} coding tests passed`;
      } else {
        return `${numPassedTests} coding tests passed, ${numFailedTests} coding tests failed, ${numLockedTests} coding tests locked`;
      }
    }
  }

  function getBackupStatusIcon(backup, selected) {
    if (backup.unlock) {
      return <LockOpenIcon color={selected ? "white" : "secondary"} />;
    } else {
      if (numFailedTests === 0 && numLockedTests === 0) {
        return <DoneIcon color={selected ? "white" : "success"} />;
      } else {
        return <ErrorOutlineIcon color={selected ? "white" : "error"} />;
      }
    }
  }

  const date = new Date(backup.created);
  const formattedDate = date.toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  const numPassedTests = getNumPassedTests();
  const numFailedTests = getNumFailedTests();
  const numLockedTests = getNumLockedTests();

  return (
    <Tooltip title={getTooltipTitle()} placement="right">
      <Button
        key={backup.id}
        variant={selected ? "contained" : "outlined"}
        onClick={() => handleBackupSelect(index)}
        startIcon={getBackupStatusIcon(backup, selected)}
      >
        {formattedDate}
      </Button>
    </Tooltip>
  );
}

function Timeline({ backups, selectedBackup, handleBackupSelect }) {
  return (
    <div>
      <div style={{ fontSize: "1.5rem" }}>Timeline</div>
      <ButtonGroup
        orientation="vertical"
        aria-label="Vertical button group"
        style={{ width: "100%" }}
      >
        {backups.map((backup, index) => (
          <TimelineButton
            backup={backup}
            selected={index === selectedBackup}
            index={index}
            handleBackupSelect={handleBackupSelect}
          />
        ))}
      </ButtonGroup>
    </div>
  );
}

export default Timeline;
