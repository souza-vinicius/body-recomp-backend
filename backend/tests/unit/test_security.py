"""
Unit tests for security utilities (JWT and password hashing).

Tests JWT token generation, verification, expiration handling,
and bcrypt password hashing/verification.
"""
from datetime import timedelta

import pytest
from jose import JWTError, jwt

from src.core.config import settings
from src.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
)


class TestPasswordHashing:
    """Test password hashing and verification with bcrypt."""

    def test_hash_password(self):
        """Test that password hashing produces a bcrypt hash."""
        password = "SecurePassword123!"
        hashed = get_password_hash(password)

        # Bcrypt hashes start with $2b$ or $2a$
        assert hashed.startswith("$2b$") or hashed.startswith("$2a$")
        # Bcrypt hashes are 60 characters long
        assert len(hashed) == 60
        # Hash should be different from plain password
        assert hashed != password

    def test_verify_correct_password(self):
        """Test that correct password verification returns True."""
        password = "MyPassword123!"
        hashed = get_password_hash(password)

        assert verify_password(password, hashed) is True

    def test_verify_incorrect_password(self):
        """Test that incorrect password verification returns False."""
        password = "CorrectPassword123!"
        wrong_password = "WrongPassword123!"
        hashed = get_password_hash(password)

        assert verify_password(wrong_password, hashed) is False

    def test_hash_different_passwords_produce_different_hashes(self):
        """Test that same password hashed twice produces different hashes (salt)."""
        password = "SamePassword123!"
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)

        # Due to random salt, hashes should differ
        assert hash1 != hash2
        # But both should verify successfully
        assert verify_password(password, hash1) is True
        assert verify_password(password, hash2) is True

    def test_bcrypt_rounds_is_12(self):
        """Test that bcrypt is using 12 rounds (security requirement)."""
        password = "TestPassword123!"
        hashed = get_password_hash(password)

        # Bcrypt hash format: $2b$12$... (12 indicates rounds)
        parts = hashed.split("$")
        rounds = int(parts[2])
        assert rounds == 12

    def test_password_exceeds_72_bytes_raises_error(self):
        """Test that passwords exceeding bcrypt's 72-byte limit raise ValueError."""
        # Create a password longer than 72 bytes
        long_password = "a" * 73

        with pytest.raises(ValueError, match="Password cannot be longer than 72 bytes"):
            get_password_hash(long_password)


class TestJWTTokenGeneration:
    """Test JWT token creation for access and refresh tokens."""

    def test_create_access_token_with_default_expiration(self):
        """Test access token creation with default expiration time."""
        data = {"sub": "user123"}
        token = create_access_token(data)

        # Decode token to verify contents
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])

        assert payload["sub"] == "user123"
        assert payload["type"] == "access"
        assert "exp" in payload

        # Verify expiration is approximately ACCESS_TOKEN_EXPIRE_MINUTES from now
        # (allowing 5 second tolerance)
        import datetime
        expected_exp = datetime.datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
        actual_exp = datetime.datetime.utcfromtimestamp(payload["exp"])
        time_diff = abs((actual_exp - expected_exp).total_seconds())
        assert time_diff < 5  # Within 5 seconds

    def test_create_access_token_with_custom_expiration(self):
        """Test access token creation with custom expiration delta."""
        data = {"sub": "user456"}
        custom_delta = timedelta(minutes=30)
        token = create_access_token(data, expires_delta=custom_delta)

        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])

        assert payload["sub"] == "user456"
        assert payload["type"] == "access"

        # Verify custom expiration
        import datetime
        expected_exp = datetime.datetime.utcnow() + custom_delta
        actual_exp = datetime.datetime.utcfromtimestamp(payload["exp"])
        time_diff = abs((actual_exp - expected_exp).total_seconds())
        assert time_diff < 5

    def test_create_refresh_token(self):
        """Test refresh token creation with 7-day expiration."""
        data = {"sub": "user789"}
        token = create_refresh_token(data)

        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])

        assert payload["sub"] == "user789"
        assert payload["type"] == "refresh"
        assert "exp" in payload

        # Verify expiration is approximately 7 days from now
        import datetime
        expected_exp = datetime.datetime.utcnow() + timedelta(
            days=settings.REFRESH_TOKEN_EXPIRE_DAYS
        )
        actual_exp = datetime.datetime.utcfromtimestamp(payload["exp"])
        time_diff = abs((actual_exp - expected_exp).total_seconds())
        assert time_diff < 5

    def test_token_contains_all_provided_data(self):
        """Test that token includes all data from input dictionary."""
        data = {
            "sub": "user_id_123",
            "email": "user@example.com",
            "role": "admin"
        }
        token = create_access_token(data)

        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])

        assert payload["sub"] == "user_id_123"
        assert payload["email"] == "user@example.com"
        assert payload["role"] == "admin"
        assert payload["type"] == "access"


class TestJWTTokenVerification:
    """Test JWT token decoding and verification."""

    def test_decode_valid_token(self):
        """Test decoding a valid token returns correct payload."""
        data = {"sub": "user123", "custom_claim": "value"}
        token = create_access_token(data)

        decoded = decode_token(token)

        assert decoded["sub"] == "user123"
        assert decoded["custom_claim"] == "value"
        assert decoded["type"] == "access"

    def test_decode_expired_token_raises_error(self):
        """Test that expired token raises JWTError."""
        data = {"sub": "user456"}
        # Create token that expires immediately
        token = create_access_token(data, expires_delta=timedelta(seconds=-1))

        with pytest.raises(JWTError, match="Could not validate token"):
            decode_token(token)

    def test_decode_invalid_signature_raises_error(self):
        """Test that token with invalid signature raises JWTError."""
        data = {"sub": "user789"}
        # Create token with correct key
        token = create_access_token(data)

        # Tamper with the token by changing last character
        tampered_token = token[:-1] + ("a" if token[-1] != "a" else "b")

        with pytest.raises(JWTError, match="Could not validate token"):
            decode_token(tampered_token)

    def test_decode_malformed_token_raises_error(self):
        """Test that malformed token raises JWTError."""
        malformed_token = "not.a.valid.jwt.token"

        with pytest.raises(JWTError, match="Could not validate token"):
            decode_token(malformed_token)

    def test_decode_token_with_wrong_algorithm_raises_error(self):
        """Test that token signed with different algorithm is rejected."""
        data = {"sub": "user999"}
        # Create token with HS512 instead of HS256
        wrong_algo_token = jwt.encode(
            data,
            settings.SECRET_KEY,
            algorithm="HS512"
        )

        with pytest.raises(JWTError, match="Could not validate token"):
            decode_token(wrong_algo_token)

    def test_decode_token_preserves_all_claims(self):
        """Test that decode preserves all custom claims."""
        data = {
            "sub": "user111",
            "email": "test@example.com",
            "roles": ["admin", "user"],
            "metadata": {"key": "value"}
        }
        token = create_access_token(data)

        decoded = decode_token(token)

        assert decoded["sub"] == "user111"
        assert decoded["email"] == "test@example.com"
        assert decoded["roles"] == ["admin", "user"]
        assert decoded["metadata"] == {"key": "value"}


class TestTokenTypes:
    """Test that access and refresh tokens have correct type claims."""

    def test_access_token_has_access_type(self):
        """Test that access tokens have type='access'."""
        token = create_access_token({"sub": "user1"})
        payload = decode_token(token)

        assert payload["type"] == "access"

    def test_refresh_token_has_refresh_type(self):
        """Test that refresh tokens have type='refresh'."""
        token = create_refresh_token({"sub": "user2"})
        payload = decode_token(token)

        assert payload["type"] == "refresh"

    def test_access_and_refresh_tokens_differ(self):
        """Test that access and refresh tokens for same user differ."""
        data = {"sub": "user3"}
        access_token = create_access_token(data)
        refresh_token = create_refresh_token(data)

        assert access_token != refresh_token

        access_payload = decode_token(access_token)
        refresh_payload = decode_token(refresh_token)

        # Same subject but different types and expiration
        assert access_payload["sub"] == refresh_payload["sub"]
        assert access_payload["type"] != refresh_payload["type"]
        assert access_payload["exp"] != refresh_payload["exp"]
