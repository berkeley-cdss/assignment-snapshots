# OkPy Backups CLI

## Setup

1. Install [uv](https://docs.astral.sh/uv/getting-started/installation/)
2. `cd` into this directory (`src/backups`)
3. Run `uv sync` to install dependencies and create the virtual environment (`.venv/`)
4. Create a `.env` file (follow the `.env-template`):
    - Update the `.env` file with your [OkPy access token](https://okpy.github.io/documentation/ok-api.html#ok-server-api-authentication). You must have staff permissions for the course you want to query and you must periodically re-request your token.

> [!NOTE]
> In VS Code, you may need to [select your Python interpreter manually](https://github.com/astral-sh/uv/issues/8706#issuecomment-3070696514) to get language features in your editor.

## Commands

```sh
cd src/backups

# Extract student emails from Gradescope .csv roster
uv run python3 main.py emails

# Make HTTP requests to OkPy server to create .json dump of
# student emails to the backups for all of their assignments
uv run python3 main.py request

# Given the .json dump, store the file contents of the backups
# locally and also write the backup metadata to a sqlite database
uv run python3 main.py store

# Compute lint_errors table given .json output of running
# ruff linter on backup files.
# STEP 0: Configure ruff as you wish: https://docs.astral.sh/ruff/configuration/

# STEP 1: Run ruff, replacing $PATH_TO_DIR and $PATH_TO_OUTPUT_JSON with your values
uvx ruff check ../../data/private/$PATH_TO_DIR --output-format json --output-file ../../data/private/$PATH_TO_OUTPUT_JSON

# STEP 2: Run the lint command
uv run python3 main.py lint

# Compute num_lines table given that backup files
# have been stored already. This table stores the number of lines
# for each file in each backup
uv run python3 main.py backup-file-metadata
```

> [!TIP]
> If you get tired of prefixing all commands with `uv run` you can
> activate and deactivate the virtual environment manually with
> `source .venv/bin/activate` and `deactivate`, respectively.

Run `--help` with any of the commands for more information.

Create a configuration file to save yourself the effort of typing a bunch of CLI arguments.
An example can be found in [src/backups/backup_config.json](src/backups/backup_config.json).
All fields are required (e.g. they must either be provided in the config or via the CLI).
CLI arguments will override anything in the config.

## Dumping database from OkPy Backups CLI into Rails database

1. Run backups CLI command(s) to create or update `$OUTPUT_DB_NAME.db`
2. Create `.sql` dump of output `.db` file. Replace `$OUTPUT_DB_NAME` and `$OUTPUT_DUMP_NAME` with values of your choice:
```sh
cd $REPO_ROOT
sqlite3 data/private/$OUTPUT_DB_NAME.db .dump > data/private/$OUTPUT_DUMP_NAME.sql
```
3. Update `.sql` dump:
    1. Remove `../../data/private/` prefix from paths
    2. Remove/comment out `CREATE TABLE` statements since that will interfere with the Rails database migrations
4. Optional if not done already: [Generate corresponding Rails model(s)](https://guides.rubyonrails.org/command_line.html#generating-models) as needed, e.g. `rails generate model <model_name> <column_name:data_type> ...`
> [!CAUTION]
> THE FOLLOWING STEP WILL RESET (e.g. delete everything) AND RE-MIGRATE THE RAILS DB. BE CAREFUL!
5. Run `cd src/snapshots-app` and `rails db:migrate:reset`.
6. Run command below to execute commands from output `.sql` dump into the Rails app `development.sqlite3` database. Replace `$OUTPUT_DUMP_NAME` with the same value from steps 1 and 2:
```sh
cd $REPO_ROOT
sqlite3 src/snapshots-app/storage/development.sqlite3 < data/private/$OUTPUT_DUMP_NAME.sql
```
7. Run `rails db:seed` to seed the Rails database with "hardcoded" seed data
8. Verify that your data has been loaded properly in the rails console by using [the `ActiveRecord` query interface](https://guides.rubyonrails.org/active_record_querying.html#retrieving-objects-from-the-database) for example:
```sh
$ rails c
snapshots-app(dev)> BackupMetadatum.all # view data and check it looks correct, press q to exit long list
snapshots-app(dev)> OkpyMessage.all # view data and check it looks correct
snapshots-app(dev)> exit
```
