"""Convert emails.txt file to Ruby array of hashes (for seeds.rb file)"""

import hashlib

def sha256(s: str) -> str:
    """Returns first 8 characters in SHA256 hash of `s`."""
    return hashlib.sha256(s.encode()).hexdigest()[:8]

if __name__ == "__main__":
    emails_path = input("Path to emails.txt file: ")
    output_path = input("Path to output file: ")
    hashes = []

    with open(emails_path) as f:
        emails = f.readlines()
        for email in emails:
            hashes.append(sha256(email.strip()))

    with open(output_path, 'w') as f:
        f.writelines([h + '\n' for h in hashes])
