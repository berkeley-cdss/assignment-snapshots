DROP_BACKUP_METADATA_TABLE_CMD = "DROP TABLE IF EXISTS backup_metadata"

DROP_OKPY_MESSAGES_TABLE_CMD = "DROP TABLE IF EXISTS okpy_messages"

DROP_LINT_ERRORS_TABLE_CMD = "DROP TABLE IF EXISTS lint_errors"

DROP_NUM_LINES_TABLE_CMD = "DROP TABLE IF EXISTS num_lines"

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

CREATE_LINT_ERRORS_TABLE_CMD = """
CREATE TABLE lint_errors (
	file_contents_location TEXT NOT NULL,
	line_number INTEGER NOT NULL,
	message TEXT NOT NULL,
	code TEXT NOT NULL, -- lint error code
	url TEXT, -- lint error URL for more information

	UNIQUE (file_contents_location, line_number, message, code)
);
"""

INSERT_LINT_ERROR_CMD = """
INSERT INTO lint_errors VALUES (
    :file_contents_location,
    :line_number,
    :message,
    :code,
    :url
);
"""

CREATE_NUM_LINES_TABLE_CMD = """
CREATE TABLE num_lines (
	file_contents_location TEXT,
    file_name TEXT,
    num_lines INTEGER NOT NULL,

	PRIMARY KEY (file_contents_location, file_name)
);
"""

INSERT_NUM_LINES_CMD = """
INSERT INTO num_lines VALUES (
    :file_contents_location,
    :file_name,
    :num_lines
);
"""

SELECT_BACKUP_METADATA_CMD = """
SELECT
    assignment,
    file_contents_location
FROM backup_metadata
WHERE
    file_contents_location IS NOT NULL
    AND autograder_output_location IS NOT NULL;
"""
