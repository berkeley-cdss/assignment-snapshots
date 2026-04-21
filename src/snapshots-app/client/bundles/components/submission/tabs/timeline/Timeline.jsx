import React, { useEffect, useMemo } from "react";

import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import DoneIcon from "@mui/icons-material/Done";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Tooltip } from "@mui/material";
import InfoTooltip from "../../../common/InfoTooltip";
import Snackbar from "@mui/material/Snackbar";

import { useCopyToClipboard } from "react-use";

import { getOkpyCommand, areArraysEqual } from "../../utils";

function TimelineButton({ backup, selected, index, handleBackupSelect, ref }) {
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
        ref={ref}
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
  selectedRef,
}) {
  const [_, copyOkpyCommand] = useCopyToClipboard();
  const okpyCommand = getOkpyCommand(
    backups[0].question_cli_names,
    backups[0].unlock,
  );

  const problemNames = useMemo(() => {
    const questionCliNames = backups[0].question_cli_names;
    const joined = questionCliNames.join(", ");
    const unlockSuffix = backups[0].unlock ? " (Unlocking)" : "";

    if (questionCliNames.length <= 1) {
      return "Problem " + joined + unlockSuffix;
    } else {
      return "Problems " + joined + unlockSuffix;
    }
  }, [backups]);

  const onClickCommand = () => {
    copyOkpyCommand(okpyCommand);
    setIsSnackbarOpen(true);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "0.5rem",
        }}
      >
        <Tooltip title="Copy OkPy command" placement="top">
          <IconButton aria-label="copy" onClick={onClickCommand} size="small">
            <ContentCopyIcon />
          </IconButton>
        </Tooltip>
        <div>{problemNames}</div>
      </div>

      <ButtonGroup
        orientation="vertical"
        aria-label="Vertical button group"
        style={{ width: "100%" }}
      >
        {backups.map((backup, relativeIndex) => {
          const isSelected =
            relativeIndex + absoluteStartIndex === selectedBackup;

          return (
            <TimelineButton
              backup={backup}
              selected={isSelected}
              index={relativeIndex + absoluteStartIndex}
              handleBackupSelect={handleBackupSelect}
              ref={isSelected ? selectedRef : null}
            />
          );
        })}
      </ButtonGroup>
    </div>
  );
}

function Timeline({ backups, selectedBackup, handleBackupSelect }) {
  const TIMELINE_TOOLTIP_INFO =
    "A timeline of this student's OkPy backups, most recent backup first. A backup is formed every time they run unlocking or coding tests for a particular question.";

  const [isSnackbarOpen, setIsSnackbarOpen] = React.useState(false);
  const selectedRef = React.useRef(null);

  // Add an effect that scrolls when selectedBackup changes or on initial load
  // TODO only scroll left sidebar, not entire page
  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({
        behavior: "smooth", // Use "auto" for instant jump on page load
        block: "center", // Centers the button in the viewport
      });
    }
  }, [selectedBackup]); // Re-run if the selection changes

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
    let prevCreated = null;

    for (const backup of backups) {
      if (
        !areArraysEqual(backup.question_cli_names, prevQuestionCliNames) ||
        newWorksession(prevCreated, backup.created)
      ) {
        grouped.push([backup]);
        prevQuestionCliNames = backup.question_cli_names;
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
          selectedRef={selectedRef}
        />,
      );
      absoluteStartIndex += backupGroup.length;
    }

    return buttonGroups;
  }

  return (
    <div>
      <div
        style={{
          fontSize: "1.5rem",
          marginBottom: "1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          Timeline <InfoTooltip info={TIMELINE_TOOLTIP_INFO} placement="top" />
        </div>
        <div>
          <Tooltip title="Next snapshot (left arrow key)" placement="top">
            <IconButton onClick={prevArrow}>
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Previous snapshot (right arrow key)" placement="top">
            <IconButton onClick={nextArrow}>
              <ArrowForwardIcon />
            </IconButton>
          </Tooltip>
        </div>
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
