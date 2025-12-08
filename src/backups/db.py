CREATE_BACKUP_METADATA_TABLE_CMD = """
CREATE TABLE backup_metadata (
    backup_id TEXT PRIMARY KEY,

    -- ISO8601 string
	created TEXT NOT NULL,

    -- okpy endpoint for course (includes semester, e.g. cal/cs88/sp25)
    course TEXT NOT NULL,

    -- okpy assignment endpoint (not including course endpoint prefix,
    -- e.g. lab00. to get full endpoint, do {course}/{assignment})
    assignment TEXT NOT NULL,

    student_email TEXT NOT NULL,

	is_late INTEGER NOT NULL CHECK (is_late = TRUE OR is_late = FALSE),

    -- whether student used --submit flag (educated guess)
    submitted INTEGER NOT NULL CHECK (submitted = TRUE OR submitted = FALSE),

    -- each backup has one or more kinds of okpy "messages"
    -- which contain different data about the student's work.
    -- see okpy_messages table for more information.
    -- the following columns contain the path to the file
    -- containing the contents of the okpy message, or NULL if it doesn't exist.
    autograder_output_location TEXT,
    grading_location TEXT,
    file_contents_location TEXT,
    analytics_location TEXT,
    scoring_location TEXT,
    unlock_location TEXT
);
"""

CREATE_OKPY_MESSAGES_TABLE_CMD = """
CREATE TABLE okpy_messages (
    id INTEGER PRIMARY KEY,
    type TEXT NOT NULL,
    description TEXT NOT NULL
);
"""

INSERT_BACKUP_METADATA_CMD = """
INSERT INTO backup_metadata VALUES (
    :backup_id,
    :created,
    :course,
    :assignment,
    :student_email,

    :is_late,
    :submitted,

    :autograder_output_location,
    :grading_location,
    :file_contents_location,
    :analytics_location,
    :scoring_location,
    :unlock_location
);
"""

INSERT_OKPY_MESSAGES_TABLE_CMD = """
INSERT INTO okpy_messages VALUES
(:id, :type, :description)
"""

# NOTE: UNIQUE (file_contents_location, line_number, message, code) fails if column location different
CREATE_LINT_ERRORS_TABLE_CMD = """
CREATE TABLE lint_errors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
	file_contents_location TEXT NOT NULL,
	line_number INTEGER NOT NULL,
	message TEXT NOT NULL,
	code TEXT NOT NULL, -- lint error code
	url TEXT -- lint error URL for more information
);
"""

CREATE_BACKUP_FILE_METADATA_TABLE_CMD = """
CREATE TABLE backup_file_metadata (
	file_contents_location TEXT,
    file_name TEXT,
    num_lines INTEGER NOT NULL,

	PRIMARY KEY (file_contents_location, file_name)
);
"""

CREATE_ANALYTICS_MESSAGES_TABLE_CMD = """
CREATE TABLE analytics_messages (
    backup_id TEXT PRIMARY KEY NOT NULL,

    -- boolean
    unlock INTEGER NOT NULL,

    -- under the hood, TEXT (json string)
    -- names of questions passed into -q flag of python3 ok command
    question_cli_names JSON,

    -- under the hood, TEXT (json string)
    question_display_names JSON,

    -- under the hood, TEXT (json string)
    --- past problems solved bool and attempts
    history JSON NOT NULL,

    FOREIGN KEY (backup_id) REFERENCES backup_metadata(backup_id)
);
"""

CREATE_GRADING_MESSAGE_QUESTIONS_TABLE_CMD = """
CREATE TABLE grading_message_questions (
	backup_id TEXT NOT NULL,
	question_display_name TEXT NOT NULL,
	locked INTEGER NOT NULL, -- number of locked tests for this question
	passed INTEGER NOT NULL, -- number of passed tests for this question
	failed INTEGER NOT NULL, -- number of failed tests for this question

	PRIMARY KEY (backup_id, question_display_name)
	FOREIGN KEY (backup_id) REFERENCES backup_metadata(backup_id)
);
"""

CREATE_UNLOCK_MESSAGE_CASES_TABLE_CMD = """
CREATE TABLE unlock_message_cases (
	backup_id TEXT NOT NULL,
	correct INTEGER NOT NULL, -- boolean
	prompt TEXT NOT NULL,
	student_answer JSON NOT NULL,
	printed_msg JSON NOT NULL,
	case_id TEXT NOT NULL,
    question_timestamp TEXT NOT NULL, -- ISO8601 string
    answer_timestamp TEXT NOT NULL, -- ISO8601 string

	FOREIGN KEY (backup_id) REFERENCES backup_metadata(backup_id)
);
"""

# NOTE: Have to explicitly list columns since id is autoincremented
INSERT_LINT_ERROR_CMD = """
INSERT INTO lint_errors (file_contents_location, line_number, message, code, url) VALUES (
    :file_contents_location,
    :line_number,
    :message,
    :code,
    :url
);
"""

INSERT_BACKUP_FILE_METADATA_CMD = """
INSERT INTO backup_file_metadata VALUES (
    :file_contents_location,
    :file_name,
    :num_lines
);
"""

INSERT_ANALYTICS_MESSAGE_CMD = """
INSERT INTO analytics_messages VALUES (
    :backup_id,
    :unlock,
    :question_cli_names,
    :question_display_names,
    :history
);
"""

INSERT_GRADING_MESSAGE_QUESTION_CMD = """
INSERT INTO grading_message_questions VALUES (
    :backup_id,
    :question_display_name,
    :locked,
    :passed,
    :failed
);
"""

INSERT_UNLOCK_MESSAGE_CASE_CMD = """
INSERT INTO unlock_message_cases VALUES (
    :backup_id,
    :correct,
    :prompt,
    :student_answer,
    :printed_msg,
    :case_id,
    :question_timestamp,
    :answer_timestamp
);
"""

SELECT_BACKUP_METADATA_CMD = """
SELECT
    assignment,
    file_contents_location
FROM backup_metadata
WHERE file_contents_location IS NOT NULL;
"""

OKPY_MESSAGES_VALUES = [
    {
        "id": 1,
        "type": "autograder_output",
        "description": "OkPy autograder output string",
    },
    {
        "id": 2,
        "type": "grading",
        "description": "For each test, a count of how many were locked/passed/failed",
    },
    {
        "id": 3,
        "type": "file_contents",
        "description": "Source file names and their contents",
    },
    {
        "id": 4,
        "type": "analytics",
        "description": "Count of how many attempts student made on a problem and boolean of whether it was solved",
    },
    {
        "id": 5,
        "type": "scoring",
        "description": "Total score for that OkPy run",  # probably only occurs if --score was passed
    },
    {
        "id": 6,
        "type": "unlock",
        "description": "Unlocking test output",
    },
    # NOTE: there is another okpy message called "email" but that just contains the student's email
]
