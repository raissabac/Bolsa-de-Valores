import hashlib
import secrets


_SCHEME = "pbkdf2_sha256"
_ITERATIONS = 600_000
_SALT_BYTES = 16
_DIGEST_BYTES = 32
_MIN_ITERATIONS = 100_000
_MAX_ITERATIONS = 1_000_000


def hash_password(password: str) -> str:
    """Return a salted PBKDF2-SHA256 password hash suitable for senha_hash."""
    salt = secrets.token_bytes(_SALT_BYTES)
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        _ITERATIONS,
        dklen=_DIGEST_BYTES,
    )
    return f"{_SCHEME}${_ITERATIONS}${salt.hex()}${digest.hex()}"


def verify_password(password: str, stored_hash: str) -> bool:
    """Verify a password without exposing a direct string comparison."""
    try:
        scheme, iteration_text, salt_hex, digest_hex = stored_hash.split("$")
        iterations = int(iteration_text)
        salt = bytes.fromhex(salt_hex)
        expected_digest = bytes.fromhex(digest_hex)
    except (AttributeError, TypeError, ValueError):
        return False

    if (
        scheme != _SCHEME
        or not _MIN_ITERATIONS <= iterations <= _MAX_ITERATIONS
        or len(salt) != _SALT_BYTES
        or len(expected_digest) != _DIGEST_BYTES
    ):
        return False

    actual_digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        iterations,
        dklen=_DIGEST_BYTES,
    )
    return secrets.compare_digest(actual_digest, expected_digest)
