DROP_BACKUP_METADATA_TABLE_CMD = "DROP TABLE IF EXISTS backup_metadata"

DROP_OKPY_MESSAGES_TABLE_CMD = "DROP TABLE IF EXISTS okpy_messages"

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
