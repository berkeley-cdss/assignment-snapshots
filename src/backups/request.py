"""
Contains logic for making HTTP requests
to the OkPy server to retrieve student backups
"""

import requests
from typing import List, Dict

BASE_URL = "https://okpy.org/api/v3"


def get_backups(
    assignment_endpoint: str,
    email: str,
    access_token: str,
    limit: int = 150,
    offset: int = 0,
) -> requests.Response:
    """
    Get all of the OkPy backups for a particular user.
    See https://okpy.github.io/documentation/ok-api.html#assignments-export-backups

    Args:
        assignment_endpoint (str): OkPy endpoint for the assignment,
            such as "/cal/cs61a/sp16/lab00"
        email (str): email of the user you want to retrieve backups for,
            such as "rdang@berkeley.edu"
        access_token (str): access token of the person making the request.
            Must have staff permissions for the OkPy course.
        limit (int): Number of backups to retrieve in one request.
            High numbers may result in slower responses. Defaults to 150.
        offset (int): How many recent backups to ignore.
            An offset of 100 with a limit of 150 will provide
            backup numbers #101 to #250. Defaults to 0.

    Returns:
        requests.Response - the response to the GET request
    """
    api_endpoint = f"/assignment/{assignment_endpoint}/export/{email}"
    params = {
        "access_token": access_token,
        "limit": limit,
        "offset": offset,
    }
    return requests.get(
        BASE_URL + api_endpoint,
        params=params,
    )


def get_all_lab_names(start: int, end: int) -> List[str]:
    """
    >>> get_all_lab_names(0, 5)
    ['lab00', 'lab01', 'lab02', 'lab03', 'lab04', 'lab05']
    """
    return [f"lab{n:02}" for n in range(start, end + 1)]


def get_all_hw_names(start: int, end: int) -> List[str]:
    """
    >>> get_all_hw_names(1, 5)
    ['hw01', 'hw02', 'hw03', 'hw04', 'hw05']
    """
    return [f"hw{n:02}" for n in range(start, end + 1)]


def get_backups_for_all_assignments(
    course_endpoint: str,
    email: str,
    access_token: str,
    lab_start: int,
    lab_end: int,
    hw_start: int,
    hw_end: int,
    projects: List[str],
    limit: int = 150,
    offset: int = 0,
) -> dict:
    """Get backups for all assignments of one particular user"""
    lab_names = get_all_lab_names(lab_start, lab_end)
    hw_names = get_all_hw_names(hw_start, hw_end)
    all_names = lab_names + hw_names + projects

    all_responses = {}

    for assignment_name in all_names:
        assignment_endpoint = f"{course_endpoint}/{assignment_name}"
        response = get_backups(
            assignment_endpoint,
            email,
            access_token,
            limit,
            offset,
        )

        if not response.ok:
            print(
                f"Response for user {email}, assignment {assignment_name} did not have OK status code: {response}"
            )

        all_responses[assignment_name] = response.json()

    return all_responses


def read_all_emails(emails_file: str) -> List[str]:
    """Reads file containing email addresses, one on each line"""
    with open(emails_file, "r") as f:
        emails = []
        for line in f.readlines():
            emails.append(line.strip())
        return emails


def get_backups_for_all_users_all_assignments(
    emails_file: str,
    course_endpoint: str,
    access_token: str,
    lab_start: int,
    lab_end: int,
    hw_start: int,
    hw_end: int,
    projects: List[str],
    limit: int = 150,
    offset: int = 0,
) -> Dict[str, Dict]:
    emails = read_all_emails(emails_file)
    email_to_responses = {}  # key: email, value: list of all responses

    for email in emails:
        responses = get_backups_for_all_assignments(
            course_endpoint,
            email,
            access_token,
            lab_start,
            lab_end,
            hw_start,
            hw_end,
            projects,
            limit,
            offset,
        )

        email_to_responses[email] = responses

    return email_to_responses
