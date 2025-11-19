import React from "react";

import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import CheckIcon from "@mui/icons-material/Check";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import Tooltip from "@mui/material/Tooltip";
import Divider from "@mui/material/Divider";

function UnlockingTestCase({
  testCaseId,
  prompt,
  studentAnswer,
  printedMsg,
  questionTimestamp,
  answerTimestamp,
  correct,
}) {
  const questionDate = new Date(questionTimestamp);
  const answerDate = new Date(answerTimestamp);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "2rem",
        }}
      >
        <div style={{ fontSize: "1.2rem", paddingBottom: "0.5rem" }}>
          {testCaseId}
        </div>
        <div style={{ color: "gray" }}>
          Completed in: {(answerDate - questionDate) / 1000}s
        </div>
        {correct ? (
          <Tooltip title="Correct">
            <CheckIcon color="success" />
          </Tooltip>
        ) : (
          <Tooltip title="Incorrect">
            <ErrorOutlineIcon color="error" />
          </Tooltip>
        )}
      </div>

      <div style={{ fontWeight: "bold", fontFamily: "Menlo", whiteSpace: "pre-wrap" }}>{prompt}</div>

      <div style={{ fontFamily: "Menlo" }}>
        {studentAnswer.map((answer) => (
          <div>{answer}</div>
        ))}
      </div>

      <div style={{ fontFamily: "Menlo" }}>
        {printedMsg.map((msg) => (
          <div>{msg}</div>
        ))}
      </div>
    </div>
  );
}

function UnlockingTestOutputDialog({
  open,
  onClose,
  unlockingTestCases,
  questionCliNames,
}) {
  const okpyCliQuestions = questionCliNames
    .map((questionName) => `-q ${questionName} -u`)
    .join(" ");

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="unlocking-test-output-dialog-title"
      aria-describedby="unlocking-test-output-dialog-description"
    >
      <DialogTitle id="unlocking-test-output-dialog-title">
        Unlocking Test Output
      </DialogTitle>
      <DialogContent id="unlocking-test-output-dialog-description">
        <div style={{ color: "gray", fontSize: "0.8rem" }}>
          <em>In chronological order of completion</em>
        </div>
        <div style={{ fontFamily: "Menlo", paddingBottom: "1rem" }}>
          {`$ python3 ok ${okpyCliQuestions}`}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {unlockingTestCases.map((testCase) => (
            <>
              <Divider />
              <UnlockingTestCase
                testCaseId={testCase.case_id}
                prompt={testCase.prompt}
                studentAnswer={testCase.student_answer}
                printedMsg={testCase.printed_msg}
                questionTimestamp={testCase.question_timestamp}
                answerTimestamp={testCase.answer_timestamp}
                correct={testCase.correct}
              />
            </>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default UnlockingTestOutputDialog;
