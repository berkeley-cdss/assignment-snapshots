"""
Contains logic for persistent storage of assignment backups
"""

import os
import sqlite3

from db import *
from models import *

# TODO type hints

PREFIX = "../../data/private"


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
    return num_backups
