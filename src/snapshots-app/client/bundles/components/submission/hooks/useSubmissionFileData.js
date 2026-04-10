import React from "react";

function useSubmissionFileData({ courseId, assignmentId, studentId }) {
  const [backups, setBackups] = React.useState([]);
  const [selectedBackup, setSelectedBackup] = React.useState(0);
  const [files, setFiles] = React.useState([]);
  const [file, setFile] = React.useState("");
  const [allProblemDisplayNames, setAllProblemDisplayNames] = React.useState(
    [],
  );

  const [code, setCode] = React.useState("");
  const [autograderOutput, setAutograderOutput] = React.useState("");
  const [lintErrors, setLintErrors] = React.useState([]);
  const [filesToMetadata, setFilesToMetadata] = React.useState(null);
  const [prevFileContents, setPrevFileContents] = React.useState("");
  const [loadingBackups, setLoadingBackups] = React.useState(true);
  const [error, setError] = React.useState(null);

  const hasRouteParams = Boolean(courseId && assignmentId && studentId);

  React.useEffect(() => {
    if (!hasRouteParams) {
      return;
    }

    setLoadingBackups(true);
    setError(null);

    fetch(`/api/backups/${courseId}/${assignmentId}/${studentId}`, {
      method: "GET",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((responseData) => {
        const orderedBackups = responseData.backups.toReversed();
        const assignmentFileNames = responseData.assignment_file_names ?? [];

        setBackups(orderedBackups);
        setSelectedBackup(0);
        setFiles(assignmentFileNames);
        setFile(assignmentFileNames[0] ?? "");
        setAllProblemDisplayNames(responseData.assignment_problem_names ?? []);
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        setLoadingBackups(false);
      });
  }, [hasRouteParams, courseId, assignmentId, studentId]);

  React.useEffect(() => {
    if (backups.length === 0 || backups[selectedBackup].unlock) {
      return;
    }

    const queryParams = new URLSearchParams();
    queryParams.append(
      "object_key",
      backups[selectedBackup].autograder_output_location,
    );

    fetch(`/api/files?${queryParams}`, { method: "GET" })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((responseData) => {
        setAutograderOutput(responseData.file_contents);
      })
      .catch((err) => {
        setError(err);
      });
  }, [backups, selectedBackup]);

  React.useEffect(() => {
    if (backups.length === 0 || file === "") {
      return;
    }

    const queryParams = new URLSearchParams();
    queryParams.append(
      "object_key",
      `${backups[selectedBackup].file_contents_location}/${file}`,
    );

    fetch(`/api/files?${queryParams}`, { method: "GET" })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((responseData) => {
        setCode(responseData.file_contents);
      })
      .catch((err) => {
        setError(err);
      });
  }, [backups, selectedBackup, file]);

  React.useEffect(() => {
    if (backups.length === 0 || file === "") {
      return;
    }

    const queryParams = new URLSearchParams();
    queryParams.append(
      "file_contents_location",
      `${backups[selectedBackup].file_contents_location}/${file}`,
    );

    fetch(`/api/lint_errors?${queryParams}`, { method: "GET" })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((responseData) => {
        setLintErrors(responseData.lint_errors);
      })
      .catch((err) => {
        setError(err);
      });
  }, [backups, selectedBackup, file]);

  React.useEffect(() => {
    if (!hasRouteParams || backups.length === 0 || file === "") {
      return;
    }

    fetch(`/api/backup_file_metadata/${courseId}/${assignmentId}/${studentId}`, {
      method: "GET",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((responseData) => {
        setFilesToMetadata(responseData.files_to_metadata);
      })
      .catch((err) => {
        setError(err);
      });
  }, [hasRouteParams, courseId, assignmentId, studentId, backups, selectedBackup, file]);

  React.useEffect(() => {
    if (selectedBackup === 0 || backups.length === 0 || file === "") {
      return;
    }

    const queryParams = new URLSearchParams();
    queryParams.append(
      "object_key",
      `${backups[selectedBackup - 1].file_contents_location}/${file}`,
    );

    fetch(`/api/files?${queryParams}`, { method: "GET" })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((responseData) => {
        setPrevFileContents(responseData.file_contents);
      })
      .catch((err) => {
        setError(err);
      });
  }, [backups, selectedBackup, file]);

  function handleBackupSelect(selectedBackupIndex) {
    setSelectedBackup(selectedBackupIndex);
    setCode("");
    setAutograderOutput("");
    setFilesToMetadata(null);
    setPrevFileContents("");
  }

  const backupCreatedTimestamps = React.useMemo(() => {
    if (backups.length === 0) {
      return [];
    }
    return backups.map((backup) => backup.created);
  }, [backups]);

  function getTotalQuestionsSolved(history) {
    return history.reduce(
      (total, currQuestion) => total + (currQuestion.solved ? 1 : 0),
      0,
    );
  }

  function getTotalQuestionsUnsolved(history) {
    return history.reduce(
      (total, currQuestion) => total + (currQuestion.solved ? 0 : 1),
      0,
    );
  }

  function getTotalAttempts(history) {
    return history.reduce(
      (total, currQuestion) => total + currQuestion.attempts,
      0,
    );
  }

  const numQuestionsSolved = React.useMemo(() => {
    if (backups.length === 0) {
      return [];
    }
    return backups.map((backup) => getTotalQuestionsSolved(backup.history));
  }, [backups]);

  const numQuestionsUnsolved = React.useMemo(() => {
    if (backups.length === 0) {
      return [];
    }
    return backups.map((backup) => getTotalQuestionsUnsolved(backup.history));
  }, [backups]);

  const numAttempts = React.useMemo(() => {
    if (backups.length === 0) {
      return [];
    }
    return backups.map((backup) => getTotalAttempts(backup.history));
  }, [backups]);

  return {
    backups,
    selectedBackup,
    setSelectedBackup,
    handleBackupSelect,
    files,
    file,
    setFile,
    allProblemDisplayNames,
    code,
    autograderOutput,
    lintErrors,
    filesToMetadata,
    prevFileContents,
    backupCreatedTimestamps,
    numQuestionsSolved,
    numQuestionsUnsolved,
    numAttempts,
    loadingBackups,
    error,
  };
}

export default useSubmissionFileData;
