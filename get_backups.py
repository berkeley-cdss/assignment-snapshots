"""
A script to retrieve OkPy backups by student.
Requires you to have a .env file (see .env-template)
and to install the dependencies in requirements.txt.

This was tested and works with Python 3.11.5.

To run the script, run python3 get_backups.py
"""

import json
import requests
from dotenv import dotenv_values
from typing import List, Dict
from time import time


BASE_URL = "https://okpy.org/api/v3"
C88C_PROJECT_NAMES = ["maps", "ants"]


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
    limit: int = 150,
    offset: int = 0,
) -> List[requests.Response]:
    lab_names = get_all_lab_names(0, 11)
    hw_names = get_all_hw_names(1, 10)
    project_names = C88C_PROJECT_NAMES
    all_names = lab_names + hw_names + project_names

    all_responses = []

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

        all_responses.append(response)
    
    return all_responses


def read_all_emails(emails_file: str) -> List[str]:
    """Reads file containing email addresses, one on each line"""
    with open(emails_file, 'r') as f:
        emails = []
        for line in f.readlines():
            emails.append(line.strip())
        return emails


def get_backups_for_all_users_all_assignments(
    emails_file: str,
    course_endpoint: str,
    access_token: str,
    limit: int = 150,
    offset: int = 0,
) -> Dict[str, Dict]:
    emails = read_all_emails(emails_file)
    email_to_responses = {} # key: email, value: list of all responses

    for email in emails:
        responses = get_backups_for_all_assignments(
            course_endpoint,
            email,
            access_token,
            limit,
            offset,
        )

        # Convert into json dict (instead of storing as Response object, which isn't serializable)
        for i, res in enumerate(responses):
            responses[i] = res.json()
        email_to_responses[email] = responses
    
    return email_to_responses


if __name__ == "__main__":
    config = dotenv_values(".env")
    emails_file = "emails.txt"
    output_file = "output.json"

    start = time()
    email_to_responses = get_backups_for_all_users_all_assignments(
        emails_file,
        config["COURSE_OKPY_ENDPOINT"],
        config["OKPY_TOKEN"],
        limit=5,
    )

    with open(output_file, 'w') as f:
        json.dump(email_to_responses, f, indent=2)
    
    end = time()

    print(f"Dumped backups in {output_file} in {end - start} seconds")
