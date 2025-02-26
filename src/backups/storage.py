"""
Contains logic for persistent storage of assignment backups
"""

import json
import os
import shutil
import sqlite3
from typing import List

# TODO type hints

# TODO persistent data storage; see data model


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

    con = sqlite3.connect(database)  # TODO autocommit=True?
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


def write_backup_locally(prefix, backup: Backup) -> str:
    # TODO also store autograder output and unlocking test backups?
    for file_name, file_contents in backup.backup_contents.items():
        location = f"{prefix}/{backup.course}/{backup.assignment}/{backup.student_email}/{backup.backup_id}/{file_name}"
        os.makedirs(os.path.dirname(location), exist_ok=True)
        with open(location, "w") as f:
            f.write(file_contents)
    return location


def store_backup(cur: sqlite3.Cursor, prefix: str, backup: Backup):
    location = write_backup_locally(prefix, backup)
    insert_record(cur, backup, location)


def store_all_backups(cur: sqlite3.Cursor, backups: List[Backup]):
    prefix = "../../data/private"  # TODO make this configurable in CLI
    for backup in backups:
        store_backup(cur, prefix, backup)


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


# TODO move logic to main.py once tested
if __name__ == "__main__":
    with open("../../data/private/output.json", "r") as f:
        emails_to_responses = json.load(f)
    cur = setup_db("test.db")
    prefix = "../../data/private"
    course = "cal/cs88/sp25"
    shutil.rmtree(
        f"{prefix}/{course}", ignore_errors=True
    )  # TODO clear directory each time
    backups = responses_to_backups(emails_to_responses, course)
    store_all_backups(cur, backups)
    cur.execute("SELECT COUNT(*) FROM backups_metadata")
    print("rows in backups_metadata:", cur.fetchone())
    cur.execute("SELECT * FROM backups_metadata LIMIT 10")
    print("first 10 rows:", cur.fetchall())
