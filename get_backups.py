"""
A script to retrieve OkPy backups by student.
Requires you to have a .env file (see .env-template)
and to install the dependencies in requirements.txt.

This was tested and works with Python 3.11.5.

To run the script, run python3 get_backups.py
"""

import requests
from dotenv import dotenv_values


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


if __name__ == "__main__":
    C88C_SP25_LAB00_OKPY_ENDPOINT = "cal/cs88/sp25/lab00"

    config = dotenv_values(".env")
    response = get_backups(
        C88C_SP25_LAB00_OKPY_ENDPOINT,
        config['OKPY_EMAIL'],
        config['OKPY_TOKEN'],
    )

    print(response.text)
