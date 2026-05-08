# scripts

This directory contains one-off scripts for data processing that is not part of the actual backups CLI.

## Email Hash Lookup

The email hash lookup script is used to "reverse" student email hashes.

> [!IMPORTANT]
> Do not commit personally identifiable information / study participant data to the repository!

Run `uv run python3 email_hash_lookup.py --help` to see how to use it. An example that we ran is below:

```sh
uv run python3 email_hash_lookup.py hashes.txt ../../data/private/out/cs61a/fa25/emails.txt ../../data/private/out/dev3/emails.txt
```

## Separate Rosters

The separate rosters script is used to separate Gradescope or OkPy rosters if one roster is the superset of another.

Run `uv run python3 separate_rosters.py --help` to see how to use it.

It was used to separate DATA C88C SP24 (superset) and DATA C88C SU24 (subset):

```sh
$ uv run --active python3 scripts/separate_rosters.py ../../data/private/out/datac88c/sp24/roster.csv ../../data/private/out/datac88c/su24/roster.csv ../../data/private/out/datac88c/sp24/emails_separated.txt ../../data/private/out/datac88c/su24/emails_separated.txt

Read 590 student records in superset roster file ../../data/private/out/datac88c/sp24/roster.csv
Read 106 student records in subset roster file ../../data/private/out/datac88c/su24/roster.csv
Computed set difference superset - subset. Roster A has 581 emails; Roster B has 106 emails
Wrote Roster A emails to ../../data/private/out/datac88c/sp24/emails_separated.txt
Wrote Roster A emails to ../../data/private/out/datac88c/su24/emails_separated.txt
```
