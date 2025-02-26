"""
A script to retrieve OkPy backups and store them
Requires you to have a .env file (see .env-template)
and to install the dependencies in requirements.txt.

This was tested and works with Python 3.11.5,
and probably works for other recent versions of Python as well.

To run the script, run python3 main.py
"""

import json
from time import time
import typer

from emails import read_emails, write_emails


DEFAULT_CONFIG_FILE = 'backup_config.json'

app = typer.Typer(help="A CLI to retrieve and process OkPy backups")

# TODO cli to separate request vs database vs deidentification? vs. querying


def read_config(config: str) -> dict:
    with open(config, 'r') as f:
        return json.load(f)


def process_roster(in_roster: str, out_roster: str, verbose=False) -> None:
    if verbose:
        print(f"Reading emails from roster at {in_roster}")
    emails = read_emails(in_roster)

    if verbose:
        print(f"Read {len(emails)} emails from roster")

    write_emails(out_roster, emails)
    if verbose:
        print(f"Wrote emails to {out_roster}")


@app.command()
def emails(in_roster: str = None, out_roster: str = None, config_file: str = DEFAULT_CONFIG_FILE, verbose: bool = False):
    """
    Reads the Gradescope roster .csv file IN_ROSTER and writes each student's email,
    one per line, in OUT_ROSTER. If IN_ROSTER or OUT_ROSTER are `None`, use the values
    specified in the CONFIG_FILE.
    """
    config = read_config(config_file)

    if in_roster is None:
        in_roster = config["data"]["in_roster"]

    if out_roster is None:
        out_roster = config["data"]["out_roster"]

    process_roster(in_roster, out_roster, verbose)


@app.command()
def other():
    print('blah')

if __name__ == "__main__":
    app()

    # config = dotenv_values(".env")
    # emails_file = "emails.txt"
    # output_file = "output.json"

    # start = time()
    # email_to_responses = get_backups_for_all_users_all_assignments(
    #     emails_file,
    #     config["COURSE_OKPY_ENDPOINT"],
    #     config["OKPY_TOKEN"],
    #     limit=5,
    # )

    # with open(output_file, 'w') as f:
    #     json.dump(email_to_responses, f, indent=2)
    
    # end = time()

    # print(f"Dumped backups in {output_file} in {end - start} seconds")
