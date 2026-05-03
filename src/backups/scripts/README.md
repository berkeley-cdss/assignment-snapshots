# scripts

This directory contains one-off scripts for data processing that is not part of the actual backups CLI.

## Separate Rosters

Run `uv run python3 separate_rosters.py --help` to see how to use the `separate_rosters.py` script.

It was used to separate:

- DATA C88C SP24 (superset), DATA C88C SU24 (subset)
- CS 61A FA24 (superset), DATA C88C FA24 (subset)

```sh
uv run --active python3 scripts/separate_rosters.py ../../data/private/out/datac88c/sp24/roster.csv ../../data/private/out/datac88c/su24/roster.csv ../../data/private/out/datac88c/sp24/emails_separated.txt ../../data/private/out/datac88c/su24/emails_separated.txt
```

```sh
uv run --active python3 scripts/separate_rosters.py ../../data/private/out/cs61a/fa24/roster.csv ../../data/private/out/datac88c/fa24/roster.csv ../../data/private/out/cs61a/fa24/emails_separated.txt ../../data/private/out/datac88c/fa24/emails_separated.txt
```
