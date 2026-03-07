"""
Contains logic for persistent storage of assignment backups
"""

import hashlib
import os
import sqlite3
from typing import List, Dict, Callable
import json
from datetime import datetime

from db import (
    CREATE_BACKUP_METADATA_TABLE_CMD,
    CREATE_OKPY_MESSAGES_TABLE_CMD,
    CREATE_LINT_ERRORS_TABLE_CMD,
    CREATE_ANALYTICS_MESSAGES_TABLE_CMD,
    CREATE_GRADING_MESSAGE_QUESTIONS_TABLE_CMD,
    CREATE_UNLOCK_MESSAGE_CASES_TABLE_CMD,
    CREATE_BACKUP_FILE_METADATA_TABLE_CMD,
    INSERT_BACKUP_METADATA_CMD,
    INSERT_OKPY_MESSAGES_TABLE_CMD,
    INSERT_LINT_ERROR_CMD,
    INSERT_BACKUP_FILE_METADATA_CMD,
    INSERT_ANALYTICS_MESSAGE_CMD,
    INSERT_GRADING_MESSAGE_QUESTION_CMD,
    INSERT_UNLOCK_MESSAGE_CASE_CMD,
    SELECT_BACKUP_METADATA_CMD,
    OKPY_MESSAGES_VALUES,
)
from models import (
    Backup,
    LintError,
    BackupFileMetadata,
    MESSAGE_KIND_TO_CLASS,
    AnalyticsMessage,
    GradingMessage,
    UnlockMessage,
)


PREFIX = "../../data/private"

# TODO make this programmatically adjustable
FILENAME_PREFIX = "/Users/rebeccadang/Desktop/Code/ucb/berkeley-cdss/assignment-snapshots/data/private/"


def create_backup_and_write_messages(
    course: str,
    assignment: str,
    student_email: str,
    backup: dict,
    path_prefix: str,
    conn: sqlite3.Connection,
    deidentify: bool,
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
        msg_obj = msg_class(msg["contents"], deidentify)
        msg_obj.write(directory)

        if kind == "autograder_output":
            autograder_output_location = msg_class.location(directory)
        elif kind == "grading":
            grading_location = msg_class.location(directory)
            insert_grading_message_question_records(conn, backup_id, msg_obj)
        elif kind == "file_contents":
            file_contents_location = msg_class.location(directory)
        elif kind == "analytics":
            analytics_location = msg_class.location(directory)
            insert_analytics_message_record(conn, backup_id, msg_obj)
        elif kind == "scoring":
            scoring_location = msg_class.location(directory)
        elif kind == "unlock":
            unlock_location = msg_class.location(directory)
            insert_unlock_message_case_records(conn, backup_id, msg_obj)
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


def drop_table_if_exists_command(table: str) -> str:
    return f"DROP TABLE IF EXISTS {table}"


def setup_db(
    database: str, setup_func: Callable[[sqlite3.Connection], None]
) -> sqlite3.Connection:
    assert database.endswith(".db")
    conn = sqlite3.connect(database)
    setup_func(conn)
    return conn


def setup_backups_and_messages(conn: sqlite3.Connection) -> None:
    cur = conn.cursor()

    tables = [
        "backup_metadata",
        "okpy_messages",
        "analytics_messages",
        "grading_message_questions",
        "unlock_message_cases",
    ]

    for table in tables:
        cur.execute(drop_table_if_exists_command(table))

    conn.commit()

    create_cmds = [
        CREATE_BACKUP_METADATA_TABLE_CMD,
        CREATE_OKPY_MESSAGES_TABLE_CMD,
        CREATE_ANALYTICS_MESSAGES_TABLE_CMD,
        CREATE_GRADING_MESSAGE_QUESTIONS_TABLE_CMD,
        CREATE_UNLOCK_MESSAGE_CASES_TABLE_CMD,
    ]

    for cmd in create_cmds:
        cur.execute(cmd)

    conn.commit()

    # these values are hardcoded so just add them right away
    for row_data in OKPY_MESSAGES_VALUES:
        cur.execute(INSERT_OKPY_MESSAGES_TABLE_CMD, row_data)

    conn.commit()


def setup_lint_errors(conn: sqlite3.Connection) -> None:
    cur = conn.cursor()

    cur.execute(drop_table_if_exists_command("lint_errors"))
    cur.execute(CREATE_LINT_ERRORS_TABLE_CMD)

    conn.commit()


def setup_backup_file_metadata(conn: sqlite3.Connection) -> None:
    cur = conn.cursor()

    cur.execute(drop_table_if_exists_command("backup_file_metadata"))
    cur.execute(CREATE_BACKUP_FILE_METADATA_TABLE_CMD)

    conn.commit()


def insert_backup_metadata_record(conn: sqlite3.Connection, backup: Backup):
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


def insert_backup_file_metadata_record(
    conn: sqlite3.Connection, backup_file_metadata: BackupFileMetadata
):
    data = {
        "file_contents_location": backup_file_metadata.file_contents_location,
        "file_name": backup_file_metadata.file_name,
        "num_lines": backup_file_metadata.num_lines,
    }
    cur = conn.cursor()
    cur.execute(INSERT_BACKUP_FILE_METADATA_CMD, data)
    conn.commit()


def insert_analytics_message_record(
    conn: sqlite3.Connection, backup_id: str, analytics_message: AnalyticsMessage
):
    questions = analytics_message.contents["history"]["questions"]
    history = []
    for question_display_name, question_data in questions.items():
        question = {
            "display_name": question_display_name,
            "attempts": question_data["attempts"],
            "solved": question_data["solved"],
        }
        history.append(question)

    data = {
        "backup_id": backup_id,
        "unlock": analytics_message.contents["unlock"],
        "question_cli_names": json.dumps(
            analytics_message.contents.get("requested-questions")
        ),
        "question_display_names": json.dumps(
            analytics_message.contents.get("question")
        ),
        "history": json.dumps(history),
    }
    cur = conn.cursor()
    cur.execute(INSERT_ANALYTICS_MESSAGE_CMD, data)
    conn.commit()


def insert_grading_message_question_records(
    conn: sqlite3.Connection, backup_id: str, grading_message: GradingMessage
):
    cur = conn.cursor()
    for question_display_name, test_data in grading_message.contents.items():
        data = {
            "backup_id": backup_id,
            "question_display_name": question_display_name,
            "locked": test_data["locked"],
            "passed": test_data["passed"],
            "failed": test_data["failed"],
        }
        cur.execute(INSERT_GRADING_MESSAGE_QUESTION_CMD, data)
    conn.commit()


def insert_unlock_message_case_records(
    conn: sqlite3.Connection, backup_id: str, unlock_message: UnlockMessage
):
    cur = conn.cursor()
    for case in unlock_message.contents:
        data = {
            "backup_id": backup_id,
            "correct": case["correct"],
            "prompt": case["prompt"],
            "student_answer": json.dumps(case["answer"]),
            "printed_msg": json.dumps(case["printed msg"]),
            "case_id": case["case_id"],
            "question_timestamp": datetime.fromtimestamp(
                case["question timestamp"]
            ).isoformat(),
            "answer_timestamp": datetime.fromtimestamp(
                case["answer timestamp"]
            ).isoformat(),
        }
        cur.execute(INSERT_UNLOCK_MESSAGE_CASE_CMD, data)
    conn.commit()


def compute_all_backup_file_metadata(
    conn: sqlite3.Connection, assignment_files: Dict[str, List[str]]
):
    result = []
    cur = conn.cursor()
    rows = cur.execute(SELECT_BACKUP_METADATA_CMD).fetchall()
    for r in rows:
        assignment = r[0]
        file_contents_location = r[1]
        for file_name in assignment_files[assignment]:
            with open(f"{file_contents_location}/{file_name}", "r") as f:
                num_lines = len(f.read().split("\n"))
            result.append(
                BackupFileMetadata(file_contents_location, file_name, num_lines)
            )
    return result


def store_backup_file_metadata(
    conn: sqlite3.Connection,
    assignment_files: Dict[str, List[str]],
    verbose: bool = False,
):
    backup_file_metadata_objects = compute_all_backup_file_metadata(
        conn, assignment_files
    )
    if verbose:
        print(
            f"Computed {len(backup_file_metadata_objects)} backup file metadata objects"
        )

    for bfm in backup_file_metadata_objects:
        insert_backup_file_metadata_record(conn, bfm)

    if verbose:
        print("Inserted all backup file metadata objects into db")


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
                        conn,
                        deidentify,
                    )
                    insert_backup_metadata_record(conn, backup)
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
