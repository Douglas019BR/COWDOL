"""SQLite persistence for saved portfolios."""

from __future__ import annotations

import json
import os
import sqlite3
from collections.abc import Iterator
from contextlib import contextmanager
from datetime import UTC, datetime
from pathlib import Path
from uuid import uuid4

DEFAULT_DB_PATH = Path(__file__).resolve().parent.parent / "cowdol.db"


def db_path() -> Path:
    """Return the configured database path."""
    return Path(os.getenv("COWDOL_DB_PATH", str(DEFAULT_DB_PATH)))


@contextmanager
def connection() -> Iterator[sqlite3.Connection]:
    """Yield a connection with the schema initialized."""
    path = db_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    try:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS portfolios (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                created_at TEXT NOT NULL,
                holdings TEXT NOT NULL,
                results TEXT,
                risk TEXT
            )
            """
        )
        yield conn
        conn.commit()
    finally:
        conn.close()


def save_portfolio(payload: dict) -> str:
    """Store a portfolio and return its generated id."""
    portfolio_id = uuid4().hex
    created_at = datetime.now(UTC).isoformat()
    with connection() as conn:
        conn.execute(
            "INSERT INTO portfolios VALUES (?, ?, ?, ?, ?, ?)",
            (
                portfolio_id,
                payload["name"],
                created_at,
                json.dumps(payload["holdings"]),
                json.dumps(payload.get("results")),
                json.dumps(payload.get("risk")),
            ),
        )
    return portfolio_id


def list_portfolios() -> list[dict[str, str]]:
    """Return saved portfolio metadata, newest first."""
    with connection() as conn:
        rows = conn.execute(
            "SELECT id, name, created_at FROM portfolios ORDER BY created_at DESC"
        ).fetchall()
    return [dict(row) for row in rows]


def load_portfolio(portfolio_id: str) -> dict | None:
    """Return a saved portfolio with parsed payloads."""
    with connection() as conn:
        row = conn.execute(
            "SELECT * FROM portfolios WHERE id = ?", (portfolio_id,)
        ).fetchone()
    if row is None:
        return None
    data = dict(row)
    for field in ("holdings", "results", "risk"):
        if data[field]:
            data[field] = json.loads(data[field])
    return data


def delete_portfolio(portfolio_id: str) -> bool:
    """Delete a saved portfolio and report whether it existed."""
    with connection() as conn:
        cursor = conn.execute("DELETE FROM portfolios WHERE id = ?", (portfolio_id,))
    return cursor.rowcount > 0
