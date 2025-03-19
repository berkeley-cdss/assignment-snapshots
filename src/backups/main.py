"""
A script to retrieve OkPy backups and store them
Requires you to have a .env file (see .env-template)
and to install the dependencies in requirements.txt.

This was tested and works with Python 3.11.5,
and probably works for other recent versions of Python as well.

To run the script, run python3 main.py
"""

from dotenv import dotenv_values
import json
import shutil
from time import time
import typer
from typing_extensions import Annotated

from emails import process_roster
from request import get_backups_for_all_users_all_assignments
from storage import setup_db, PREFIX, responses_to_backups

DEFAULT_CONFIG_FILE = "backup_config.json"

app = typer.Typer(help="A CLI to retrieve and process OkPy backups")


def read_config(config: str) -> dict:
    with open(config, "r") as f:
        return json.load(f)


@app.command()
def emails(
    in_roster: Annotated[str, typer.Option(help="Gradescope roster .csv file")] = None,
    out_roster: Annotated[
        str,
        typer.Option(
            help="Output .txt file that will contain email of each student in the roster, one per line"
        ),
    ] = None,
    config: Annotated[
        str, typer.Option(help="Configuration .json file")
    ] = DEFAULT_CONFIG_FILE,
    verbose: bool = False,
):
    """
    Reads the Gradescope roster IN_ROSTER and writes each student's email,
    one per line, to OUT_ROSTER. If IN_ROSTER or OUT_ROSTER are not provided,
    use the values provided in CONFIG.
    """
    config_dict = read_config(config)

    if in_roster is None:
        in_roster = config_dict["data"]["in_roster"]

    if out_roster is None:
        out_roster = config_dict["data"]["out_roster"]

    process_roster(in_roster, out_roster, verbose)


@app.command()
def request(
    emails: Annotated[
        str, typer.Option(help=".txt file containing student emails, one per line")
    ] = None,
    course_endpoint: Annotated[
        str, typer.Option(help="OkPy course endpoint, e.g. 'cal/cs88/sp25'")
    ] = None,
    limit: Annotated[
        int,
        typer.Option(
            help="Number of backups to retrieve in one request. High numbers may result in slower responses. See https://okpy.github.io/documentation/ok-api.html#assignments-export-backups"
        ),
    ] = None,
    offset: Annotated[
        int,
        typer.Option(
            help="How many recent backups to ignore. An offset of 100 with a limit of 150 will provide backup numbers #101 to #250. See https://okpy.github.io/documentation/ok-api.html#assignments-export-backups"
        ),
    ] = None,
    lab_start: Annotated[
        int, typer.Option(help="Number of the first lab assignment")
    ] = None,
    lab_end: Annotated[
        int, typer.Option(help="Number of the last lab assignment, inclusive")
    ] = None,
    hw_start: Annotated[
        int, typer.Option(help="Number of the first homework assignment")
    ] = None,
    hw_end: Annotated[
        int, typer.Option(help="Number of the last homework assignment, inclusive")
    ] = None,
    projects: Annotated[
        str,
        typer.Option(
            help="Comma-separated list of project OkPy endpoints, e.g. 'maps,ants'"
        ),
    ] = None,
    config: Annotated[
        str, typer.Option(help="Configuration .json file")
    ] = DEFAULT_CONFIG_FILE,
    dump: Annotated[
        str,
        typer.Option(
            help=".json file that will contain a dump of email addresses to backups"
        ),
    ] = None,
    timeit: Annotated[
        bool, typer.Option(help="Whether to time how long it takes this command to run")
    ] = True,
    verbose: bool = False,
):
    """
    Makes HTTP requests to the OkPy server to retrieve the backups
    for users with emails specified in the EMAILS file and writes
    the result to the DUMP .json file.

    If any arguments are not specified, this command will use the values in the CONFIG .json file.
    """
    config_dict = read_config(config)

    # if any args are None, replace with config. also do input validation
    if emails is None:
        emails = config_dict["data"]["out_roster"]
    assert emails.endswith(".txt"), "emails file should be a .txt"

    if course_endpoint is None:
        course_endpoint = config_dict["okpy_api"]["course_endpoint"]

    if limit is None:
        limit = config_dict["okpy_api"]["limit"]
    assert limit >= 0, "limit should be non-negative"

    if offset is None:
        offset = config_dict["okpy_api"]["offset"]
    assert offset >= 0, "offset should be non-negative"

    if lab_start is None:
        lab_start = config_dict["course"]["lab_start"]
    assert lab_start >= 0, "lab_start should be non-negative"

    if lab_end is None:
        lab_end = config_dict["course"]["lab_end"]
    assert lab_end >= 0, "lab_end should be non-negative"

    if hw_start is None:
        hw_start = config_dict["course"]["hw_start"]
    assert hw_start >= 0, "hw_start should be non-negative"

    if hw_end is None:
        hw_end = config_dict["course"]["hw_end"]
    assert hw_end >= 0, "hw_end should be non-negative"

    if projects is None:
        projects = config_dict["course"]["projects"]
    else:
        projects = projects.split(",")

    if dump is None:
        dump = config_dict["data"]["dump"]
    assert dump.endswith(".json"), "dump must be the path to a .json file"

    # make HTTP requests to okpy server to get backups for everyone and all assignments
    env_vars = dotenv_values("../../.env")

    if timeit:
        start = time()

    email_to_responses = get_backups_for_all_users_all_assignments(
        emails,
        course_endpoint,
        env_vars["OKPY_TOKEN"],
        lab_start,
        lab_end,
        hw_start,
        hw_end,
        projects,
        limit=limit,
        offset=offset,
    )

    with open(dump, "w") as f:
        json.dump(email_to_responses, f, indent=2)

    if verbose:
        print(f"Dumped backups for {len(email_to_responses)} students in {dump}")

    if timeit:
        end = time()
        print(f"Finished requesting backups from OkPy server in {end - start} seconds")


@app.command()
def store(
    course_endpoint: Annotated[
        str, typer.Option(help="OkPy course endpoint, e.g. 'cal/cs88/sp25'")
    ] = None,
    dump: Annotated[
        str,
        typer.Option(
            help=".json file that will contain a dump of email addresses to backups"
        ),
    ] = None,
    database: Annotated[
        str,
        typer.Option(
            help="Name of sqlite database .db file where backups will be stored"
        ),
    ] = None,
    config: Annotated[
        str, typer.Option(help="Configuration .json file")
    ] = DEFAULT_CONFIG_FILE,
    timeit: Annotated[
        bool, typer.Option(help="Whether to time how long it takes this command to run")
    ] = True,
    verbose: bool = False,
):
    """
    Given a .json DUMP file with the results from the `request` command,
    store the contents of the files in {PREFIX}/COURSE_ENDPOINT and
    store the metadata for each backup in {PREFIX}/DATABASE.

    If any arguments are not specified, this command will use the values in the CONFIG .json file.
    """
    # TODO add prompt when overwriting db or actual files
    config_dict = read_config(config)

    if course_endpoint is None:
        course_endpoint = config_dict["okpy_api"]["course_endpoint"]

    if dump is None:
        dump = config_dict["data"]["dump"]
    assert dump.endswith(".json"), "dump must be the path to a .json file"

    if database is None:
        database = config_dict["data"]["database"]
    assert database.endswith(".db"), "database must be a sqlite .db file"

    # take HTTP response data and persist it in the database
    if timeit:
        start = time()

    cur = setup_db(database)
    if verbose:
        print(f"Setup database {database}")

    storage_dir = f"{PREFIX}/{course_endpoint}"
    shutil.rmtree(storage_dir, ignore_errors=True)
    if verbose:
        print(f"Removed storage directory {storage_dir}")

    with open(dump, "r") as f:
        emails_to_responses = json.load(f)

    num_backups = responses_to_backups(
        emails_to_responses, course_endpoint, PREFIX, cur
    )
    if verbose:
        print(f"Processed {num_backups} backups from {dump}")

    cur.execute("SELECT COUNT(*) FROM backup_metadata")
    num_rows = cur.fetchone()[0]
    assert (
        num_backups == num_rows
    ), "num_backups should match num_rows in backup_metadata table"
    if verbose:
        print(
            f"Wrote backup file contents to {storage_dir} and inserted {num_rows} rows into backup_metadata table"
        )
        cur.execute("SELECT * FROM backup_metadata LIMIT 10")
        rows = cur.fetchall()
        print("First 10 rows:")
        for r in rows:
            print(r)

    if timeit:
        end = time()
        print(f"Finished storing backups in {database} in {end - start} seconds")


@app.command()
def deidentify():
    """Not implemented yet"""
    pass


@app.command()
def query():
    """Not implemented yet"""
    pass


if __name__ == "__main__":
    app()
