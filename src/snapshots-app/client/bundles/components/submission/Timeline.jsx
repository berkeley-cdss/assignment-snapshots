import React, { useEffect, useMemo } from "react";

import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import DoneIcon from "@mui/icons-material/Done";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { Tooltip } from "@mui/material";
import InfoTooltip from "../common/InfoTooltip";
import Snackbar from "@mui/material/Snackbar";

import { useCopyToClipboard } from "react-use";

import { getOkpyCommand, areArraysEqual } from "./utils";

function TimelineButton({ backup, selected, index, handleBackupSelect }) {
  function getQuestionsWorkedOn() {
    return backup.question_display_names.join(" ");
  }

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
    const questions = getQuestionsWorkedOn();

    if (backup.unlock) {
      if (numFailedTests === 0) {
        if (numPassedTests > 0) {
          return `Worked on: ${questions}. All ${numPassedTests} unlocking tests passed`;
        } else {
          return `Ran unlocking command for ${questions} but there was no test data`;
        }
      } else {
        return `Worked on: ${questions}. ${numPassedTests} unlocking tests passed, ${numFailedTests} unlocking tests failed`;
      }
    } else {
      if (numFailedTests === 0 && numLockedTests === 0) {
        return `Worked on: ${questions}. All ${numPassedTests} coding tests passed`;
      } else {
        return `Worked on: ${questions}. ${numPassedTests} coding tests passed, ${numFailedTests} coding tests failed, ${numLockedTests} coding tests locked`;
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

function TimelineButtonGroup({
  backups,
  selectedBackup,
  handleBackupSelect,
  absoluteStartIndex,
  setIsSnackbarOpen,
}) {
  const [_, copyOkpyCommand] = useCopyToClipboard();
  const okpyCommand = getOkpyCommand(
    backups[0].question_cli_names,
    backups[0].unlock,
  );
  const onClickCommand = () => {
    copyOkpyCommand(okpyCommand);
    setIsSnackbarOpen(true);
  };

  return (
    <div>
      <div
        style={{
          whiteSpace: "pre-wrap",
          fontFamily: "Menlo",
          fontSize: "0.8rem",
          cursor: "pointer",
          marginBottom: "0.5rem",
        }}
        onClick={onClickCommand}
      >
        {okpyCommand}
      </div>

      <ButtonGroup
        orientation="vertical"
        aria-label="Vertical button group"
        style={{ width: "100%" }}
      >
        {backups.map((backup, relativeIndex) => (
          <TimelineButton
            backup={backup}
            selected={relativeIndex + absoluteStartIndex === selectedBackup}
            index={relativeIndex + absoluteStartIndex}
            handleBackupSelect={handleBackupSelect}
          />
        ))}
      </ButtonGroup>
    </div>
  );
}

function Timeline({ backups, selectedBackup, handleBackupSelect }) {
  const TIMELINE_TOOLTIP_INFO =
    "A timeline of this student's OkPy backups. A backup is formed every time they run unlocking or coding tests for a particular question. You can use the left and right arrow keys to navigate.";

  const [isSnackbarOpen, setIsSnackbarOpen] = React.useState(false);

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setIsSnackbarOpen(false);
  };

  const prevArrow = () => {
    if (selectedBackup > 0) {
      handleBackupSelect(selectedBackup - 1);
    }
  };

  const nextArrow = () => {
    if (selectedBackup < backups.length - 1) {
      handleBackupSelect(selectedBackup + 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft") {
        prevArrow();
      } else if (event.key === "ArrowRight") {
        nextArrow();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedBackup, backups]);

  function newWorksession(prevCreated, currCreated) {
    if (prevCreated === null) {
      return true;
    }

    const prevDate = new Date(prevCreated);
    const currDate = new Date(currCreated);
    const timeDiff = Math.abs(currDate - prevDate);
    const minutesDiff = timeDiff / (1000 * 60);
    return minutesDiff >= 30;
  }

  const groupedBackups = useMemo(() => {
    const grouped = [];
    let prevQuestionCliNames = null;
    let prevUnlock = null;
    let prevCreated = null;

    for (const backup of backups) {
      if (
        !areArraysEqual(backup.question_cli_names, prevQuestionCliNames) ||
        backup.unlock !== prevUnlock ||
        newWorksession(prevCreated, backup.created)
      ) {
        grouped.push([backup]);
        prevQuestionCliNames = backup.question_cli_names;
        prevUnlock = backup.unlock;
        prevCreated = backup.created;
      } else {
        grouped[grouped.length - 1].push(backup);
      }
    }

    return grouped;
  }, [backups]);

  function getTimelineButtonGroups() {
    const buttonGroups = [];
    let absoluteStartIndex = 0;

    for (const backupGroup of groupedBackups) {
      buttonGroups.push(
        <TimelineButtonGroup
          backups={backupGroup}
          selectedBackup={selectedBackup}
          handleBackupSelect={handleBackupSelect}
          absoluteStartIndex={absoluteStartIndex}
          setIsSnackbarOpen={setIsSnackbarOpen}
        />,
      );
      absoluteStartIndex += backupGroup.length;
    }

    return buttonGroups;
  }

  return (
    <div>
      <div style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
        Timeline <InfoTooltip info={TIMELINE_TOOLTIP_INFO} placement="top" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {getTimelineButtonGroups()}
      </div>
      <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={1000}
        onClose={handleSnackbarClose}
        message="Command copied to clipboard!"
      />
    </div>
  );
}

export default Timeline;
