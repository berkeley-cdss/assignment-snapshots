"""
Contains logic for persistent storage of assignment backups
"""

import os
import sqlite3
import json

# TODO type hints

PREFIX = "../../data/private"

DROP_BACKUP_METADATA_TABLE_CMD = "DROP TABLE IF EXISTS backup_metadata"

DROP_OKPY_MESSAGES_TABLE_CMD = "DROP TABLE IF EXISTS okpy_messages"

# TODO add other metadata like created_at?
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

# TODO what if there are multiple source files???

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


class Backup:
    def __init__(
        self,
        backup_id: str,
        created: str,
        course: str,
        assignment: str,
        student_email: str,
        is_late: bool,
        submitted: bool,
        autograder_output_location: str = None,
        grading_location: str = None,
        file_contents_location: str = None,
        analytics_location: str = None,
        scoring_location: str = None,
        unlock_location: str = None,
    ):
        self.backup_id = backup_id
        self.created = created
        self.course = course
        self.assignment = assignment
        self.student_email = student_email

        self.is_late = is_late
        self.submitted = submitted

        self.autograder_output_location = autograder_output_location
        self.grading_location = grading_location
        self.file_contents_location = file_contents_location
        self.analytics_location = analytics_location
        self.scoring_location = scoring_location
        self.unlock_location = unlock_location


class OkPyMessage:
    def __init__(self, contents):
        self.contents = contents


class AutograderOutputMessage(OkPyMessage):
    @staticmethod
    def location(directory):
        return f"{directory}autograder_output.txt"

    def write(self, directory):
        with open(AutograderOutputMessage.location(directory), "w") as f:
            f.write(self.contents)


class GradingMessage(OkPyMessage):
    @staticmethod
    def location(directory):
        return f"{directory}grading.json"

    def write(self, directory):
        with open(GradingMessage.location(directory), "w") as f:
            json.dump(self.contents, f, indent=2)


class FileContentsMessage(OkPyMessage):
    @staticmethod
    def location(directory):
        # NOTE: a file content message's location is a DIRECTORY rather than a file
        # since there may be multiple source files in a student's backup
        return directory

    def write(self, directory):
        for src_file_name, src_file_contents in self.contents.items():
            with open(f"{directory}{src_file_name}", "w") as f:
                f.write(src_file_contents)


class AnalyticsMessage(OkPyMessage):
    @staticmethod
    def location(directory):
        return f"{directory}analytics.json"

    def write(self, directory):
        with open(f"{directory}analytics.json", "w") as f:
            json.dump(self.contents, f, indent=2)


class ScoringMessage(OkPyMessage):
    @staticmethod
    def location(directory):
        return f"{directory}scoring.json"

    def write(self, directory):
        with open(f"{directory}scoring.json", "w") as f:
            json.dump(self.contents, f, indent=2)


class UnlockMessage(OkPyMessage):
    @staticmethod
    def location(directory):
        return f"{directory}unlock.json"

    def write(self, directory):
        with open(GradingMessage.location(directory), "w") as f:
            json.dump(self.contents, f, indent=2)


MESSAGE_KIND_TO_CLASS = {
    "autograder_output": AutograderOutputMessage,
    "grading": GradingMessage,
    "file_contents": FileContentsMessage,
    "analytics": AnalyticsMessage,
    "scoring": ScoringMessage,
    "unlock": UnlockMessage,
}


def create_backup_and_write_messages(
    course: str,
    assignment: str,
    student_email: str,
    backup: dict,
    path_prefix: str,
):
    backup_id = backup["id"]
    created = backup["created"]

    is_late = backup["is_late"]
    submitted = backup["submit"]

    autograder_output_location = None
    grading_location = None
    file_contents_location = None
    analytics_location = None
    scoring_location = None
    unlock_location = None

    directory = f"{path_prefix}/{course}/{assignment}/{student_email}/{backup_id}/"
    os.makedirs(os.path.dirname(directory), exist_ok=True)

    for msg in backup["messages"]:
        kind = msg["kind"]

        if kind not in MESSAGE_KIND_TO_CLASS:
            print(f"message kind unrecognized, skipping: {kind}")
            continue

        msg_class = MESSAGE_KIND_TO_CLASS[kind]
        msg_obj = msg_class(msg["contents"])
        msg_obj.write(directory)

        if kind == "autograder_output":
            autograder_output_location = msg_class.location(directory)
        elif kind == "grading":
            grading_location = msg_class.location(directory)
        elif kind == "file_contents":
            file_contents_location = msg_class.location(directory)
        elif kind == "analytics":
            analytics_location = msg_class.location(directory)
        elif kind == "scoring":
            scoring_location = msg_class.location(directory)
        elif kind == "unlock":
            unlock_location = msg_class.location(directory)
        else:
            raise ValueError(f"Unknown backup message type {msg_class}")

    return Backup(
        backup_id,
        created,
        course,
        assignment,
        student_email,
        is_late,
        submitted,
        autograder_output_location=autograder_output_location,
        grading_location=grading_location,
        file_contents_location=file_contents_location,
        analytics_location=analytics_location,
        scoring_location=scoring_location,
        unlock_location=unlock_location,
    )


def setup_db(database: str) -> sqlite3.Cursor:
    assert database.endswith(".db")

    con = sqlite3.connect(database)
    cur = con.cursor()

    cur.execute(DROP_BACKUP_METADATA_TABLE_CMD)
    cur.execute(DROP_OKPY_MESSAGES_TABLE_CMD)

    cur.execute(CREATE_BACKUP_METADATA_TABLE_CMD)
    cur.execute(CREATE_OKPY_MESSAGES_TABLE_CMD)

    for row_data in OKPY_MESSAGES_VALUES:
        cur.execute(INSERT_OKPY_MESSAGES_TABLE_CMD, row_data)

    return cur


def insert_record(cur: sqlite3.Cursor, backup: Backup):
    # TODO do executemany instead?
    # https://docs.python.org/3/library/sqlite3.html#how-to-use-placeholders-to-bind-values-in-sql-queries
    data = {
        "backup_id": backup.backup_id,
        "created": backup.created,
        "course": backup.course,
        "assignment": backup.assignment,
        "student_email": backup.student_email,
        "is_late": backup.is_late,
        "submitted": backup.submitted,
        "autograder_output_location": backup.autograder_output_location,
        "grading_location": backup.grading_location,
        "file_contents_location": backup.file_contents_location,
        "analytics_location": backup.analytics_location,
        "scoring_location": backup.scoring_location,
        "unlock_location": backup.unlock_location,
    }
    cur.execute(INSERT_BACKUP_METADATA_CMD, data)


# def write_backup_locally(backup: Backup) -> str:
#     # TODO also store autograder output and unlocking test backups?
#     for file_name, file_contents in backup.backup_contents.items():
#         location = f"{PREFIX}/{backup.course}/{backup.assignment}/{backup.student_email}/{backup.backup_id}/{file_name}"
#         os.makedirs(os.path.dirname(location), exist_ok=True)
#         with open(location, "w") as f:
#             f.write(file_contents)
#     return location


# def store_backup(cur: sqlite3.Cursor, backup: Backup):
#     location = write_backup_locally(backup)
#     insert_record(cur, backup, location)


# def store_all_backups(cur: sqlite3.Cursor, backups: List[Backup]):
#     for backup in backups:
#         store_backup(cur, backup)


def responses_to_backups(
    emails_to_responses: dict, course: str, path_prefix: str, cur: sqlite3.Cursor
) -> int:
    num_backups = 0
    for student_email, assignment_response_dict in emails_to_responses.items():
        for assignment, response in assignment_response_dict.items():
            curr_backups = response["data"]["backups"]
            for backup_dict in curr_backups:
                backup = create_backup_and_write_messages(
                    course,
                    assignment,
                    student_email,
                    backup_dict,
                    path_prefix,
                )
                insert_record(cur, backup)
                num_backups += 1

                # backup_id = backup_data["id"]
                # for msg in backup_data["messages"]:
                #     if msg["kind"] == "file_contents":
                #         backup_contents = msg["contents"]
                #         backup = Backup(
                #             course,
                #             assignment,
                #             student_email,
                #             backup_id,
                #             backup_contents,
                #         )
                #         all_backups.append(backup)
    return num_backups
