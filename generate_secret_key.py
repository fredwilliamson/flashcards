#!/usr/bin/env python3
"""
Generate a secure SECRET_KEY for production use.
Run: python generate_secret_key.py
"""

import secrets
import string

def generate_secret_key(length: int = 64) -> str:
    """Generate a cryptographically secure random string."""
    alphabet = string.ascii_letters + string.digits + string.punctuation
    return ''.join(secrets.choice(alphabet) for _ in range(length))

if __name__ == "__main__":
    secret_key = generate_secret_key()
    print("=" * 80)
    print("🔐 Generated SECRET_KEY for production:")
    print("=" * 80)
    print()
    print(f"SECRET_KEY={secret_key}")
    print()
    print("=" * 80)
    print("⚠️  Copy this key to your .env file or deployment platform")
    print("⚠️  NEVER commit this key to version control")
    print("⚠️  Keep this key secret and secure")
    print("=" * 80)

