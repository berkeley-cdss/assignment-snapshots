"""
Contains logic for getting students' email addresses from
the Gradescope roster .csv file
"""

import csv
from typing import List


def read_emails(roster: str) -> List[str]:
    """
    Read emails from a .csv file representing the student roster for a course

    Args:
        roster (str): path to roster file, which must be a csv containing a column called 'Email'

    Returns:
        List[str]: list of students' email addresses
    """
    assert roster.endswith(".csv"), "roster file must be in .csv format"
    emails = []
    with open(roster, "r", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            assert "Email" in row, 'csv must contain column "Email"'
            emails.append(row["Email"])
    return emails


def write_emails(emails_file: str, emails: List[str]) -> None:
    """
    Writes each email in the given list to a text file

    Args:
        emails_file (str): name of .txt file to write to
        emails (List[str]): list of emails
    """
    assert emails_file.endswith(".txt"), "`emails_file` must be a .txt file"
    with open(emails_file, "w") as f:
        for email in emails:
            f.write(f"{email}\n")


def process_roster(in_roster: str, out_roster: str, verbose=False) -> None:
    if verbose:
        print(f"Reading emails from roster at {in_roster}")
    emails = read_emails(in_roster)

    if verbose:
        print(f"Read {len(emails)} emails from roster")

    write_emails(out_roster, emails)
    if verbose:
        print(f"Wrote emails to {out_roster}")
