"""
Contains logic for deidentification of sensitive data
"""

import hashlib

def sha256(s: str) -> str:
    """Returns first 8 characters in SHA256 hash of `s`."""
    return hashlib.sha256(s.encode()).hexdigest()[:8]

def deidentify():
    # TODO actually perform deidentification (on just student emails right?)
    pass
