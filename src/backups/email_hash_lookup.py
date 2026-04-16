import hashlib


def sha256_short(s: str) -> str:
    """Returns first 8 characters in SHA256 hash of `s`."""
    return hashlib.sha256(s.encode()).hexdigest()[:8]


def find_emails_by_hashes(input_file, output_file, target_hashes):
    # 1. Create a dictionary to map hashes back to emails
    # Key: hash string, Value: original email
    hash_map = {}

    try:
        with open(input_file, "r") as f:
            for line in f:
                email = line.strip()
                if email:
                    # Compute hash and store in map
                    h = sha256_short(email)
                    hash_map[h] = email

        # 2. Identify which original emails match our target hash list
        matched_emails = []
        for h in target_hashes:
            if h in hash_map:
                matched_emails.append(hash_map[h])
            else:
                print(f"Warning: No email found for hash {h}")

        # 3. Write the results to a new file
        with open(output_file, "w") as f:
            for email in matched_emails:
                f.write(f"{email}\n")

        print(f"Successfully recovered {len(matched_emails)} emails to {output_file}")

    except FileNotFoundError:
        print(f"Error: The file '{input_file}' or '{output_file}' was not found.")


# TODO parameterize as CLI
if __name__ == "__main__":
    target_list = ['e3384165',
 '1faf1492',
 '0757b4af',
 '5e0b5dff',
 '55d9e0b2',
 '4349b29d',
 '27f16a00',
 '1bcf17a8',
 'bbb281e4',
 '18e36d10',
 'd0d1b4b0',
 '94d2cb91',
 '09e6bcbc',
 '08a08a79',
 '1a3aee97',
 '3ff28b43',
 '4972bef4',
 'a8faf137',
 'd6797b5b',
 'fc1888f1',
 'c2b307c8',
 '395b6a1a',
 'f0cd1289',
 '90cfed97',
 '41a86dbb']

    find_emails_by_hashes(
        input_file="../../data/private/out/cs61a/fa25/emails.txt",
        output_file="../../data/private/out/dev3/emails.txt",
        target_hashes=target_list,
    )
