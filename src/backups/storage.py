"""
Contains logic for persistent storage of assignment backups
"""

import hashlib
import os
import sqlite3
from typing import List, Dict

from db import *
from models import *

# TODO type hints

PREFIX = "../../data/private"

# TODO make this programmatically adjustable
FILENAME_PREFIX = "/Users/rebeccadang/Desktop/Code/ucb/berkeley-cdss/assignment-snapshots/data/private/"


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

    directory = f"{path_prefix}/{course}/{assignment}/{student_email}/{backup_id}"

    # NOTE: dirname expects trailing slash to work properly
    os.makedirs(os.path.dirname(directory + "/"), exist_ok=True)

    for msg in backup["messages"]:
        kind = msg["kind"]

        # skip "email" messages since it's redundant (just contains student's email again)
        if kind == "email":
            continue

        if kind not in MESSAGE_KIND_TO_CLASS:
            # TODO use typer error output formatting
            print(
                f"OkPy message kind {kind} in backup_id {backup_id} unrecognized, skipping"
            )
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


def setup_db(database: str) -> sqlite3.Connection:
    assert database.endswith(".db")

    conn = sqlite3.connect(database)
    cur = conn.cursor()

    cur.execute(DROP_BACKUP_METADATA_TABLE_CMD)
    cur.execute(DROP_OKPY_MESSAGES_TABLE_CMD)

    cur.execute(CREATE_BACKUP_METADATA_TABLE_CMD)
    cur.execute(CREATE_OKPY_MESSAGES_TABLE_CMD)

    conn.commit()

    for row_data in OKPY_MESSAGES_VALUES:
        cur.execute(INSERT_OKPY_MESSAGES_TABLE_CMD, row_data)

    conn.commit()

    return conn


# TODO figure out a way to generalize this better
def setup_db_lint_errors(database: str) -> sqlite3.Connection:
    assert database.endswith(".db")

    conn = sqlite3.connect(database)
    cur = conn.cursor()

    cur.execute(DROP_LINT_ERRORS_TABLE_CMD)
    cur.execute(CREATE_LINT_ERRORS_TABLE_CMD)

    conn.commit()

    return conn


# TODO figure out a way to generalize this better
def setup_db_num_lines(database: str) -> sqlite3.Connection:
    assert database.endswith(".db")

    conn = sqlite3.connect(database)
    cur = conn.cursor()

    cur.execute(DROP_NUM_LINES_TABLE_CMD)
    cur.execute(CREATE_NUM_LINES_TABLE_CMD)

    conn.commit()

    return conn


def insert_record(conn: sqlite3.Connection, backup: Backup):
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
    cur = conn.cursor()
    cur.execute(INSERT_BACKUP_METADATA_CMD, data)
    conn.commit()


def insert_lint_error_record(conn: sqlite3.Connection, lint_error: LintError):
    # TODO do executemany instead?
    # https://docs.python.org/3/library/sqlite3.html#how-to-use-placeholders-to-bind-values-in-sql-queries
    data = {
        "file_contents_location": lint_error.file_contents_location,
        "line_number": lint_error.line_number,
        "message": lint_error.message,
        "code": lint_error.code,
        "url": lint_error.url,
    }
    cur = conn.cursor()
    cur.execute(INSERT_LINT_ERROR_CMD, data)
    conn.commit()


def insert_num_lines_record(conn: sqlite3.Connection, num_lines: NumLines):
    # TODO do executemany instead?
    # https://docs.python.org/3/library/sqlite3.html#how-to-use-placeholders-to-bind-values-in-sql-queries
    data = {
        "file_contents_location": num_lines.file_contents_location,
        "file_name": num_lines.file_name,
        "num_lines": num_lines.num_lines,
    }
    cur = conn.cursor()
    cur.execute(INSERT_NUM_LINES_CMD, data)
    conn.commit()


def compute_num_lines(conn: sqlite3.Connection, assignment_files: Dict[str, List[str]]):
    result = []
    cur = conn.cursor()
    rows = cur.execute(SELECT_BACKUP_METADATA_CMD).fetchall()
    for r in rows:
        assignment = r[0]
        file_contents_location = r[1]
        for file_name in assignment_files[assignment]:
            with open(f"{file_contents_location}/{file_name}", "r") as f:
                num_lines = len(f.read().split("\n"))
            result.append(NumLines(file_contents_location, file_name, num_lines))
    return result


def store_num_lines(
    conn: sqlite3.Connection,
    assignment_files: Dict[str, List[str]],
    verbose: bool = False,
):
    num_lines_objects = compute_num_lines(conn, assignment_files)
    if verbose:
        print(f"Computed {len(num_lines_objects)} num lines objects")

    for num_lines in num_lines_objects:
        insert_num_lines_record(conn, num_lines)

    if verbose:
        print("Inserted all num lines objects into db")


def sha256(s: str) -> str:
    """Returns first 8 characters in SHA256 hash of `s`."""
    return hashlib.sha256(s.encode()).hexdigest()[:8]


def responses_to_backups(
    emails_to_responses: dict,
    course: str,
    path_prefix: str,
    conn: sqlite3.Connection,
    deidentify: bool,
) -> int:
    num_backups = 0
    for student_email, assignment_response_dict in emails_to_responses.items():
        for assignment, response in assignment_response_dict.items():
            if response["code"] == 200:  # skip backups that had an error
                curr_backups = response["data"]["backups"]
                for backup_dict in curr_backups:
                    backup = create_backup_and_write_messages(
                        course,
                        assignment,
                        sha256(student_email) if deidentify else student_email,
                        backup_dict,
                        path_prefix,
                    )
                    insert_record(conn, backup)
                    num_backups += 1
    return num_backups


def lint_output_to_lint_errors(lint_output: list) -> List[LintError]:
    result = []
    for error in lint_output:
        lint_error = LintError(
            error["filename"].removeprefix(FILENAME_PREFIX),
            error["location"]["row"],
            error["message"],
            error["code"],
            error["url"],
        )
        result.append(lint_error)
    return result


def store_lint_errors(
    lint_output: list, conn: sqlite3.Connection, verbose: bool = False
):
    lint_errors = lint_output_to_lint_errors(lint_output)
    if verbose:
        print(f"Parsed {len(lint_errors)} lint errors")

    for err in lint_errors:
        insert_lint_error_record(conn, err)

    if verbose:
        print("Inserted all lint errors into db")
