# assignment-snapshots

## Setup

1. Install Python 3.11.5
2. Create a virtual environment: `python3 -m venv env`
3. Activate the virtual environment: `source env/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Create a `.env` file (follow the `.env-template`):
    - Update the `.env` file with your [OkPy access token](https://okpy.github.io/documentation/ok-api.html#ok-server-api-authentication). You must have staff permissions for the course you want to query and you must periodically re-request your token.

## OkPy Backups CLI

<!-- TODO update this once done writing the CLI -->

```sh
cd src/backups
python3 main.py --help
```

## Continuous Integration

This repository uses [GitHub Actions](https://docs.github.com/en/actions) to run [black](https://black.readthedocs.io/en/stable/index.html) and [pylint](https://www.pylint.org/). See `.github/workflows`.

## Pre-Commit Hooks

This repository uses the [pre-commit](https://pre-commit.com/) package to automatically run
the black Python formatter upon running `git commit`. Hooks can be added to `.pre-commit-config.yaml`.
