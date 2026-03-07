# OkPy Backups CLI

## Setup

1. Install [uv](https://docs.astral.sh/uv/getting-started/installation/)
2. `cd` into this directory (`src/backups`)
3. Run `uv sync` to install dependencies and create the virtual environment (`.venv/`)
4. **Optional**, only if you wish to run the `request` command to request OkPy backups: Create** a `.env` file (follow the `.env-template`):
    - Update the `.env` file with your [OkPy access token](https://okpy.github.io/documentation/ok-api.html#ok-server-api-authentication). You must have staff permissions for the course you want to query and you must periodically re-request your token.

> [!NOTE]
> In VS Code, you may need to [select your Python interpreter manually](https://github.com/astral-sh/uv/issues/8706#issuecomment-3070696514) to get language features in your editor. Alternatively, open the [`src/backups`](.) directory in its own VS Code window so that VS Code can detect the correct environment (`.venv`).

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
If you provide both a config and CLI arguments, the CLI arguments will override anything in the config.

## Uploading backup files to AWS S3

Once you have run the `store` command, there should be files within the `data/private/` directory that you can [upload
to AWS S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/upload-objects.html)
to be retrieved later by the web app. We recommend one of two methods:

1. Manually upload files to the S3 console (fast if you have < 10 files to upload, **very slow** otherwise)
2. Automatically upload files through the AWS CLI

For both methods, you can refer to the documentation linked above. To save yourself some reading, here is an example
of the commands you would need to run for method 2, assuming you have [already configured and authenticated through the AWS CLI](https://github.com/berkeley-cdss/assignment-snapshots/tree/main/src/snapshots-app#aws-s3-configuration-and-authentication):

1. `cd` into the folder that you want to upload, replacing `$FILE_PATH` with your desired path, e.g. `cal/cs88/fa25/ants`:
```sh
cd data/private/$FILE_PATH
```
2. Run the following command to synchronize the contents of the folder you are currently inside to the folder in our AWS S3 bucket, replacing `$BUCKET_NAME` with your desired bucket (`ucb-assignment-snapshots-eae254943a2c4f51bef67654e99560dd`) and `$FILE_PATH` with your desired path, e.g. `cal/cs88/fa25/ants`:
```sh
aws s3 sync . s3://$BUCKET_NAME/$FILE_PATH
```

> [!NOTE]
> We recommend keeping the `$FILE_PATH` the same for steps 1-2 above for consistency, although technically they can differ.

## Dumping database from OkPy Backups CLI into Rails database

1. **Optional if not done already:** Run backups CLI command(s) in this directory to create or update `$OUTPUT_DB_NAME.db`. If you are an internal contributor working with the toy data from `data.zip`, skip this step.
2. Create `.sql` dump of output `.db` file. Replace `$OUTPUT_DB_NAME` and `$OUTPUT_DUMP_NAME` with values of your choice **in the root directory** of the repository:
```sh
sqlite3 data/private/$OUTPUT_DB_NAME.db .dump > data/private/$OUTPUT_DUMP_NAME.sql
```
3. Update `data/private/$OUTPUT_DUMP_NAME.sql`:
    1. Remove `../../data/private/` prefix from paths. **IMPORTANT:** Make sure you are removing the trailing `/`.
    2. Remove/comment out `CREATE TABLE` statements since that will interfere with the Rails database migrations (Rails will already handle table creation on its own end, so if you have a duplicate `CREATE TABLE` statement Rails will error).
4. **Optional if not done already:** [Generate corresponding Rails model(s)](https://guides.rubyonrails.org/command_line.html#generating-models) **in the `src/snapshots-app` directory** by running the following command. If you are an internal contributor working with the toy data from `data.zip`, skip this step.
```sh
rails generate model <model_name> <column_name:data_type> ...
```
> [!CAUTION]
> THE FOLLOWING STEP WILL RESET (e.g. delete everything) AND RE-MIGRATE THE RAILS DB. BE CAREFUL!
5. Run the following command **in the `src/snapshots-app` directory**:
```sh
rails db:migrate:reset
```
6. Run the following command **in the root directory** of the repository to execute commands from output `.sql` dump into the Rails app `development.sqlite3` database. Replace `$OUTPUT_DUMP_NAME` with the same value from steps 1 and 2:
```sh
sqlite3 src/snapshots-app/storage/development.sqlite3 < data/private/$OUTPUT_DUMP_NAME.sql
```
7. Run the following command **in the `src/snapshots-app` directory** to seed the Rails database with hardcoded initial data:
```sh
rails db:seed
```
8. Verify that your data has been loaded properly in the Rails console by using [the `ActiveRecord` query interface](https://guides.rubyonrails.org/active_record_querying.html#retrieving-objects-from-the-database). For example, run the following commands **in the `src/snapshots-app` directory**:
```sh
$ rails c
snapshots-app(dev)> BackupMetadatum.all # view data and check it looks correct, press q to exit long list
snapshots-app(dev)> OkpyMessage.all # view data and check it looks correct
snapshots-app(dev)> exit
```
