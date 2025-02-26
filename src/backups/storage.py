"""
Contains logic for persistent storage of assignment backups
"""

import os
import sqlite3
from typing import List

# TODO type hints

PREFIX = "../../data/private"

DROP_TABLE_CMD = "DROP TABLE IF EXISTS backups_metadata"

# TODO add other metadata like created_at?
CREATE_TABLE_CMD = """
CREATE TABLE backups_metadata (
    course TEXT NOT NULL,
    assignment TEXT NOT NULL,
    student_email TEXT NOT NULL,
    backup_id TEXT PRIMARY KEY,
    location TEXT NOT NULL
);
"""

INSERT_CMD = """
INSERT INTO backups_metadata VALUES
(:course, :assignment, :student_email, :backup_id, :location);
"""


class Backup:
    def __init__(self, course, assignment, student_email, backup_id, backup_contents):
        self.course = course
        self.assignment = assignment
        self.student_email = student_email
        self.backup_id = backup_id
        self.backup_contents = backup_contents


def setup_db(database: str) -> sqlite3.Cursor:
    assert database.endswith(".db")

    con = sqlite3.connect(database)
    cur = con.cursor()

    cur.execute(DROP_TABLE_CMD)
    cur.execute(CREATE_TABLE_CMD)

    return cur


def insert_record(cur: sqlite3.Cursor, backup: Backup, location: str):
    # TODO do executemany instead?
    # https://docs.python.org/3/library/sqlite3.html#how-to-use-placeholders-to-bind-values-in-sql-queries
    data = {
        "course": backup.course,
        "assignment": backup.assignment,
        "student_email": backup.student_email,
        "backup_id": backup.backup_id,
        "location": location,
    }
    cur.execute(INSERT_CMD, data)


def write_backup_locally(backup: Backup) -> str:
    # TODO also store autograder output and unlocking test backups?
    for file_name, file_contents in backup.backup_contents.items():
        location = f"{PREFIX}/{backup.course}/{backup.assignment}/{backup.student_email}/{backup.backup_id}/{file_name}"
        os.makedirs(os.path.dirname(location), exist_ok=True)
        with open(location, "w") as f:
            f.write(file_contents)
    return location


def store_backup(cur: sqlite3.Cursor, backup: Backup):
    location = write_backup_locally(backup)
    insert_record(cur, backup, location)


def store_all_backups(cur: sqlite3.Cursor, backups: List[Backup]):
    for backup in backups:
        store_backup(cur, backup)


def responses_to_backups(emails_to_responses: dict, course: str) -> List[Backup]:
    all_backups = []
    # TODO yikes nested for loops...
    for student_email, assignment_response_dict in emails_to_responses.items():
        for assignment, response in assignment_response_dict.items():
            curr_backups = response["data"]["backups"]
            for backup_data in curr_backups:
                backup_id = backup_data["id"]
                for msg in backup_data["messages"]:
                    if msg["kind"] == "file_contents":
                        backup_contents = msg["contents"]
                        backup = Backup(
                            course,
                            assignment,
                            student_email,
                            backup_id,
                            backup_contents,
                        )
                        all_backups.append(backup)
    return all_backups
