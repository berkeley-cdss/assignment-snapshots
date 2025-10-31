# assignment-snapshots

## Setup

1. Install Python 3.11.5
2. Create a virtual environment: `python3 -m venv env`
3. Activate the virtual environment: `source env/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Create a `.env` file (follow the `.env-template`):
    - Update the `.env` file with your [OkPy access token](https://okpy.github.io/documentation/ok-api.html#ok-server-api-authentication). You must have staff permissions for the course you want to query and you must periodically re-request your token.

## OkPy Backups CLI

```sh
cd src/backups

# Extract student emails from Gradescope .csv roster
python3 main.py emails

# Make HTTP requests to OkPy server to create .json dump of
# student emails to the backups for all of their assignments
python3 main.py request

# Given the .json dump, store the file contents of the backups
# locally and also write the backup metadata to a sqlite database
python3 main.py store
```

Run `--help` with any of the commands for more information.

Create a configuration file to save yourself the effort of typing a bunch of CLI arguments.
An example can be found in [src/backups/backup_config.json](src/backups/backup_config.json).
All fields are required (e.g. they must either be provided in the config or via the CLI).
CLI arguments will override anything in the config.

## Dumping database from OkPy Backups CLI into Rails database

1. Create a `.sql` file dump of the OkPy Backups database (after you have run the `request` and `store` commands):
```sh
# Replace $OUTPUT_DB_NAME and $OUTPUT_DUMP_NAME with values of your choice
sqlite3 data/private/$OUTPUT_DB_NAME.db .dump > data/private/$OUTPUT_DUMP_NAME.sql
```
2. Add the dump data into your Rails (development) database:
```sh
# Replace $OUTPUT_DUMP_NAME with value from step 1
sqlite3 src/snapshots-app/storage/development.sqlite3 < data/private/$OUTPUT_DUMP_NAME.sql
```
3. Generate models for the tables:
```sh
rails generate model BackupMetadatum
rails generate model OkpyMessage
```
4. Verify that your data has been loaded properly:
```
# Open the rails console
$ rails c
snapshots-app(dev)> BackupMetadatum.all # view data and check it looks correct, press q to exit long list
snapshots-app(dev)> OkpyMessage.all # view data and check it looks correct
snapshots-app(dev)> exit
```

## Continuous Integration

This repository uses [GitHub Actions](https://docs.github.com/en/actions) to run [black](https://black.readthedocs.io/en/stable/index.html) and [pylint](https://www.pylint.org/). See `.github/workflows`.

## Pre-Commit Hooks

This repository uses the [pre-commit](https://pre-commit.com/) package to automatically run
the black Python formatter upon running `git commit`. Hooks can be added to `.pre-commit-config.yaml`.
