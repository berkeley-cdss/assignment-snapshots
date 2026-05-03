import argparse
import pandas as pd


def diff_roster_emails(
    superset_df: pd.DataFrame, subset_df: pd.DataFrame
) -> tuple[set[str], set[str]]:
    if "email" in superset_df.columns:
        superset_emails_col = "email"
    else:
        superset_emails_col = "Email"

    if "email" in subset_df.columns:
        subset_emails_col = "email"
    else:
        subset_emails_col = "Email"

    superset_emails = set(superset_df[superset_emails_col])
    subset_emails = set(subset_df[subset_emails_col])

    return superset_emails - subset_emails, subset_emails


def write_emails(emails: list[str], emails_file: str):
    emails = [email + "\n" for email in emails]
    with open(emails_file, "w") as f:
        f.writelines(emails)


def main(superset_file: str, subset_file: str, roster_a_file: str, roster_b_file: str):
    superset_df = pd.read_csv(superset_file)
    print(
        f"Read {len(superset_df)} student records in superset roster file {superset_file}"
    )

    subset_df = pd.read_csv(subset_file)
    print(f"Read {len(subset_df)} student records in subset roster file {subset_file}")

    roster_a, roster_b = diff_roster_emails(superset_df, subset_df)
    print(
        f"Computed set difference superset - subset. Roster A has {len(roster_a)} emails; Roster B has {len(roster_b)} emails"
    )

    write_emails(list(sorted(roster_a)), roster_a_file)
    print(f"Wrote Roster A emails to {roster_a_file}")

    write_emails(list(sorted(roster_b)), roster_b_file)
    print(f"Wrote Roster A emails to {roster_b_file}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        prog="Separate Rosters",
        description="Given a superset .csv roster and subset .csv roster, separate them into 2 rosters. Roster A is (set difference of superset - subset) and Roster B is subset. This program writes both to emails.txt files.",
    )

    parser.add_argument(
        "superset", type=str, help="Path to superset roster .csv input file"
    )
    parser.add_argument(
        "subset", type=str, help="Path to superset roster .csv input file"
    )
    parser.add_argument(
        "roster_a",
        type=str,
        help="Path to Roster A emails.txt output file. Must end with '.txt'",
    )
    parser.add_argument(
        "roster_b",
        type=str,
        help="Path to Roster B emails.txt output file. Must end with '.txt'",
    )

    args = parser.parse_args()

    assert args.roster_a.endswith(".txt")
    assert args.roster_b.endswith(".txt")

    main(args.superset, args.subset, args.roster_a, args.roster_b)
