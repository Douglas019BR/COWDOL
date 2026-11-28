"""Unit tests for SQLite persistence."""

from pathlib import Path

import pytest

from app import db


@pytest.fixture
def temp_db(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("COWDOL_DB_PATH", str(tmp_path / "test.db"))


def test_save_list_load_and_delete(temp_db: None) -> None:
    payload = {
        "name": "Carteira",
        "holdings": [
            {
                "symbol": "PETR4.sa",
                "amount": 10,
                "purchase_date": "01/01/2024",
                "purchase_value": 10.0,
            }
        ],
        "results": None,
        "risk": None,
    }
    portfolio_id = db.save_portfolio(payload)

    assert db.list_portfolios()[0]["name"] == "Carteira"
    loaded = db.load_portfolio(portfolio_id)
    assert loaded is not None
    assert loaded["holdings"][0]["symbol"] == "PETR4.sa"

    assert db.delete_portfolio(portfolio_id) is True
    assert db.load_portfolio(portfolio_id) is None
    assert db.delete_portfolio(portfolio_id) is False
