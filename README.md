# assignment-snapshots

IRB Protocol ID: 2025-03-18384

- A command-line interface (CLI) to retrieve [OkPy](https://okpy.org) backup data (the "backups CLI") and store it in a local SQLite database
- A full-stack web application (the "web app") to display the OkPy backup data to help TAs give qualitative feedback on a student's code
- Exploratory data analysis (EDA) of OkPy backups to examine students' working habits in UC Berkeley's introductory computing courses, CS 61A and DATA C88C, from Fall 2023 - Fall 2025

## Setup

1. Clone the repository with SSH:
```sh
git clone git@github.com:berkeley-cdss/assignment-snapshots.git
```
2. Follow the instructions in the [Backups CLI README](src/backups/README.md)'s **Setup** section. You **may skip step 4 (retrieving your OkPy backup token)** if you don't intend to actually request any backups.
    1. You only need step 4 if you intend to run the `request` command of the Backups CLI. This also requires that you are added as a course staff member for the course you are requesting the backups from.
3. Follow the instructions in the [Web App README](src/snapshots-app/README.md) (read and do all the sections; only do the AWS section once you have [AWS access](https://technology.berkeley.edu/bcloud-aws-central-faq)).
    1. AWS access is only granted to internal UC Berkeley contributors. See internal [onboarding documentation](https://docs.google.com/document/d/1KhpRW0GYBY-HRSRG8b6z3EbRSFQJaqVPPUsha_puY2I/edit?tab=t.0).
    2. When you run the `./bin/dev` command, you should only be able to view the home page with the Login button. If you click the button, it will error until you have done the next step.
4. To get started with some toy development data **if you are on the IRB protocol** (internal contributors only):
    1. Replace the `data` directory with the contents of this zip file (unzip it first): [data.zip](https://drive.google.com/file/d/11O9hZ4Fvh8JcTbUuDdtaF5Jv11ZJUWrX/view?usp=drive_link)
    2. Follow the steps in the "[Dumping the database](https://github.com/berkeley-cdss/assignment-snapshots/tree/main/src/backups#dumping-database-from-okpy-backups-cli-into-rails-database)" section of the Backups CLI README to pipe the data from your local data directory into the snapshots Rails development database

## Repo Structure

All source code is located in the [`src`](src/) directory. All OkPy backup data is located in the [`data`](data/) directory (most of which is ignored by git for privacy reasons).

### Backups CLI

- All code related to the backups CLI is located in the [`src/backups`](src/backups/) directory.
- The [`main.py`](src/backups/main.py) file contains the CLI command functions, and then other functions implement specific parts of the backups CLI such as database functions or functions that request or parse the raw OkPy backup data.

### Web App

- All code related to the assignment snapshots interface/web app is located in the [`src/snapshots-app`](src/snapshots-app/) directory.
- All **frontend** code (React components) is located in the [`src/snapshots-app/client`](src/snapshots-app/client/) directory (specifically you define components in the [`src/snapshots-app/client/bundles`](src/snapshots-app/client/bundles/) directory)
- All **backend** code (Ruby on Rails) is located in other folders. These are the main ones you will need to edit:
    - [`src/snapshots-app/app`](src/snapshots-app/app/) contains the code for models, views, and controllers
    - [`src/snapshots-app/config/routes.rb`](src/snapshots-app/config/routes.rb) contains the backend API routes
    - [`src/snapshots-app/db/schema.rb`](src/snapshots-app/db/schema.rb) contains the database schemas
    - [`src/snapshots-app/db/seeds.rb`](src/snapshots-app/db/seeds.rb) contains the code to seed the development database (e.g. set the initial values of the database programmatically)

### EDA

- All code related to the assignment snapshots EDA is located in the [`src/notebooks`](src/notebooks/) directory.

### Continuous Integration

This repository uses [GitHub Actions](https://docs.github.com/en/actions) to run various unit tests and linters. See [`.github/workflows`](.github/workflows/).

This repository uses the [pre-commit](https://pre-commit.com/) package to automatically run
the black Python formatter upon running `git commit`. Hooks can be added to [`.pre-commit-config.yaml`](.pre-commit-config.yaml).

## Contributors

- Faculty advisors
    - [Lisa Yan](yanlisa@berkeley.edu) (Spring 2025 - present)
    - [Michael Ball](ball@berkeley.edu) (Spring 2025 - present)
    - [Kay Ousterhout](keo@eecs.berkeley.edu) (Spring 2026 - present)
- Students
    - [Rebecca Dang](mailto:rdang@berkeley.edu) (Spring 2025 - present) (5th Year MS EECS)
    - [Richard Villagomez](mailto:richard.villagomez@berkeley.edu) (Spring 2026 - present)
    - [Jasmine Sov](mailto:jasminesov@berkeley.edu) (Spring 2026 - present)

If you are affiliated with UC Berkeley and are interested in working on this project long-term, please reach out to us!

If you are external to UC Berkeley and/or only wish to make code changes, please feel free to fork the repo
and create a pull request to contribute code to the repository. Before requesting a review and merging,
ensure that all status checks are passing.
