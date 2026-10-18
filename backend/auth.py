"""Accounts, sign-in and sessions for DocuMind AI.

- Passwords are hashed with scrypt from the standard library (no extra packages).
- A session is a random opaque token. Only its SHA-256 digest is stored, so a
  leaked database file cannot be replayed as live sessions.
- Repeated failed sign-ins are rate limited per client and per email.
"""
import hashlib
import hmac
import re
import secrets
import time
import uuid
from collections import defaultdict, deque
from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from pydantic import BaseModel

from backend.config import settings
from backend.db import get_connection

router = APIRouter(prefix="/api/auth", tags=["auth"])

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]{2,}$")
MIN_PASSWORD_LENGTH = 8
MAX_PASSWORD_LENGTH = 128

DEMO_EMAIL = "demo@documind.ai"
DEMO_NAME = "Demo Analyst"

# scrypt cost parameters (about 16 MiB of memory per hash)
_N, _R, _P = 2 ** 14, 8, 1
_MAXMEM = 64 * 1024 * 1024


# ----------------------------- passwords -----------------------------

def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.scrypt(
        password.encode("utf-8"), salt=salt, n=_N, r=_R, p=_P, dklen=32, maxmem=_MAXMEM
    )
    return f"scrypt${_N}${_R}${_P}${salt.hex()}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    """Constant-time check. Returns False for malformed or disabled hashes."""
    try:
        scheme, n, r, p, salt_hex, hash_hex = stored.split("$")
        if scheme != "scrypt":
            return False
        expected = bytes.fromhex(hash_hex)
        actual = hashlib.scrypt(
            password.encode("utf-8"),
            salt=bytes.fromhex(salt_hex),
            n=int(n), r=int(r), p=int(p),
            dklen=len(expected),
            maxmem=_MAXMEM,
        )
    except (ValueError, TypeError):
        return False
    return hmac.compare_digest(actual, expected)


# Used to spend the same time on unknown emails as on real ones, so response
# timing does not reveal which addresses have accounts.
_DUMMY_HASH = hash_password(secrets.token_urlsafe(16))


# ----------------------------- rate limiting -----------------------------

_FAIL_WINDOW = 300          # seconds
_MAX_FAILS_PER_ACCOUNT = 5  # per client + email
_MAX_FAILS_PER_CLIENT = 20  # per client, any email
_failures: dict[str, deque] = defaultdict(deque)


def _client_id(request: Request) -> str:
    return request.client.host if request.client else "unknown"


def _prune(key: str, now: float) -> deque:
    q = _failures[key]
    while q and now - q[0] > _FAIL_WINDOW:
        q.popleft()
    if not q:
        _failures.pop(key, None)
        return deque()
    return q


def _retry_after(q: deque, now: float) -> int:
    return max(1, int(_FAIL_WINDOW - (now - q[0])) + 1)


def _check_not_locked(client: str, email: str) -> None:
    now = time.time()
    for key, limit in ((f"{client}|{email}", _MAX_FAILS_PER_ACCOUNT), (client, _MAX_FAILS_PER_CLIENT)):
        q = _prune(key, now)
        if len(q) >= limit:
            raise HTTPException(
                status_code=429,
                detail={
                    "message": "Too many failed attempts.",
                    "retry_after": _retry_after(q, now),
                },
            )


def _record_failure(client: str, email: str) -> None:
    now = time.time()
    _failures[f"{client}|{email}"].append(now)
    _failures[client].append(now)


def _clear_failures(client: str, email: str) -> None:
    _failures.pop(f"{client}|{email}", None)


# ----------------------------- sessions -----------------------------

def _digest(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def _issue_session(conn, user_id: str, remember: bool) -> tuple[str, int]:
    now = int(time.time())
    ttl = settings.remember_days * 86400 if remember else settings.session_hours * 3600
    token = secrets.token_urlsafe(32)
    conn.execute("DELETE FROM sessions WHERE expires_at < ?", (now,))
    conn.execute(
        "INSERT INTO sessions (token_hash, user_id, created_at, expires_at, remember) VALUES (?, ?, ?, ?, ?)",
        (_digest(token), user_id, now, now + ttl, int(remember)),
    )
    return token, now + ttl


def _public_user(row) -> dict:
    return {
        "id": row["id"],
        "name": row["name"],
        "email": row["email"],
        "is_demo": bool(row["is_demo"]),
        "created_at": row["created_at"],
        "last_login_at": row["last_login_at"],
    }


def _session_payload(conn, user_row, remember: bool) -> dict:
    token, expires_at = _issue_session(conn, user_row["id"], remember)
    return {
        "token": token,
        "token_type": "bearer",
        "expires_at": expires_at,
        "user": _public_user(user_row),
    }


def _bearer_token(authorization: Optional[str]) -> Optional[str]:
    if not authorization:
        return None
    scheme, _, value = authorization.partition(" ")
    value = value.strip()
    return value if scheme.lower() == "bearer" and value else None


def require_user(authorization: Optional[str] = Header(default=None)) -> dict:
    """FastAPI dependency: returns the signed-in user or raises 401."""
    token = _bearer_token(authorization)
    if not token:
        raise HTTPException(
            status_code=401,
            detail="Sign in to continue.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    digest = _digest(token)
    conn = get_connection()
    try:
        row = conn.execute(
            """
            SELECT u.id, u.name, u.email, u.is_demo, u.created_at, u.last_login_at
            FROM sessions s JOIN users u ON u.id = s.user_id
            WHERE s.token_hash = ? AND s.expires_at > ?
            """,
            (digest, int(time.time())),
        ).fetchone()
    finally:
        conn.close()
    if row is None:
        raise HTTPException(
            status_code=401,
            detail="Your session has expired. Sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = _public_user(row)
    user["_token_digest"] = digest
    return user


# ----------------------------- schemas -----------------------------

class RegisterRequest(BaseModel):
    name: str = ""
    email: str = ""
    password: str = ""
    remember: bool = True


class LoginRequest(BaseModel):
    email: str = ""
    password: str = ""
    remember: bool = False


def _clean_email(raw: str) -> str:
    return (raw or "").strip().lower()


# ----------------------------- routes -----------------------------

@router.post("/register", status_code=201)
def register(payload: RegisterRequest, request: Request):
    name = re.sub(r"\s+", " ", (payload.name or "").strip())
    email = _clean_email(payload.email)
    password = payload.password or ""

    if len(name) < 2 or len(name) > 60:
        raise HTTPException(status_code=400, detail="Enter your name (2 to 60 characters).")
    if len(email) > 254 or not EMAIL_RE.match(email):
        raise HTTPException(status_code=400, detail="Enter a valid email address.")
    if len(password) < MIN_PASSWORD_LENGTH:
        raise HTTPException(status_code=400, detail=f"Use at least {MIN_PASSWORD_LENGTH} characters for your password.")
    if len(password) > MAX_PASSWORD_LENGTH:
        raise HTTPException(status_code=400, detail=f"Use {MAX_PASSWORD_LENGTH} characters or fewer for your password.")
    if email == DEMO_EMAIL:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    user_id = str(uuid.uuid4())
    now = int(time.time())
    conn = get_connection()
    try:
        exists = conn.execute("SELECT 1 FROM users WHERE email = ?", (email,)).fetchone()
        if exists:
            raise HTTPException(status_code=409, detail="An account with this email already exists.")
        conn.execute(
            "INSERT INTO users (id, email, name, password_hash, is_demo, created_at, last_login_at) VALUES (?, ?, ?, ?, 0, ?, ?)",
            (user_id, email, name, hash_password(password), now, now),
        )
        user_row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        result = _session_payload(conn, user_row, payload.remember)
        conn.commit()
        return result
    finally:
        conn.close()


@router.post("/login")
def login(payload: LoginRequest, request: Request):
    email = _clean_email(payload.email)
    password = payload.password or ""
    client = _client_id(request)

    if not email or not password:
        raise HTTPException(status_code=400, detail="Enter your email and password.")

    _check_not_locked(client, email)

    conn = get_connection()
    try:
        user_row = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        stored = user_row["password_hash"] if user_row else _DUMMY_HASH
        valid = verify_password(password[:MAX_PASSWORD_LENGTH], stored) and user_row is not None

        if not valid:
            _record_failure(client, email)
            raise HTTPException(status_code=401, detail="Email or password is incorrect.")

        _clear_failures(client, email)
        conn.execute("UPDATE users SET last_login_at = ? WHERE id = ?", (int(time.time()), user_row["id"]))
        user_row = conn.execute("SELECT * FROM users WHERE id = ?", (user_row["id"],)).fetchone()
        result = _session_payload(conn, user_row, payload.remember)
        conn.commit()
        return result
    finally:
        conn.close()


@router.post("/demo")
def demo_login():
    """Signs in as a shared demo account. Can be switched off with ALLOW_DEMO_LOGIN=false."""
    if not settings.allow_demo_login:
        raise HTTPException(status_code=403, detail="Demo access is turned off on this server.")

    conn = get_connection()
    try:
        user_row = conn.execute("SELECT * FROM users WHERE email = ?", (DEMO_EMAIL,)).fetchone()
        now = int(time.time())
        if user_row is None:
            # The password hash is a placeholder that never verifies, so this
            # account can only be entered through the demo button.
            conn.execute(
                "INSERT INTO users (id, email, name, password_hash, is_demo, created_at, last_login_at) VALUES (?, ?, ?, 'disabled', 1, ?, ?)",
                (str(uuid.uuid4()), DEMO_EMAIL, DEMO_NAME, now, now),
            )
        else:
            conn.execute("UPDATE users SET last_login_at = ? WHERE id = ?", (now, user_row["id"]))
        user_row = conn.execute("SELECT * FROM users WHERE email = ?", (DEMO_EMAIL,)).fetchone()
        result = _session_payload(conn, user_row, remember=False)
        conn.commit()
        return result
    finally:
        conn.close()


@router.get("/me")
def me(user: dict = Depends(require_user)):
    return {k: v for k, v in user.items() if not k.startswith("_")}


@router.post("/logout")
def logout(user: dict = Depends(require_user)):
    conn = get_connection()
    try:
        conn.execute("DELETE FROM sessions WHERE token_hash = ?", (user["_token_digest"],))
        conn.commit()
    finally:
        conn.close()
    return {"status": "signed_out"}
