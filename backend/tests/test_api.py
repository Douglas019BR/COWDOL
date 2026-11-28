"""API-level tests for the COWDOL service."""

from datetime import UTC, datetime
from pathlib import Path
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from app.main import app
from tests.test_provider import FakeTicker


def test_health_endpoint(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_profit_calculate_accepts_legacy_csv_field_names(
    client: TestClient,
) -> None:
    payload = {
        "data": [
            {
                "SYMBOL": "TEST3.sa",
                "AMOUNT": 10,
                "PURCHASE_DATE": "01/01/2024",
                "PURCHASE_VALUE": 10.0,
            }
        ]
    }
    response = client.post("/profit-calculate", json=payload)
    assert response.status_code == 200
    holding = response.json()["holdings"][0]
    assert holding["symbol"] == "TEST3.sa"
    assert holding["balance"] == 20.0
    assert holding["currency"] == "BRL"


def test_profit_calculate_accepts_iso_dates(client: TestClient) -> None:
    payload = {
        "data": [
            {
                "SYMBOL": "TEST3.sa",
                "AMOUNT": 10,
                "PURCHASE_DATE": "2024-01-01",
                "PURCHASE_VALUE": 10.0,
            }
        ]
    }
    response = client.post("/profit-calculate", json=payload)
    assert response.status_code == 200
    assert response.json()["holdings"][0]["symbol"] == "TEST3.sa"


def test_repeated_requests_share_provider_cache() -> None:
    payload = {
        "data": [
            {
                "SYMBOL": "TEST3.sa",
                "AMOUNT": 10,
                "PURCHASE_DATE": "01/01/2024",
                "PURCHASE_VALUE": 10.0,
            }
        ]
    }
    ticker = FakeTicker(
        price=10.0,
        dividends={datetime(2024, 2, 1, tzinfo=UTC): 1.0},
    )
    with patch("app.services.provider.yf.Ticker", return_value=ticker) as mock:
        with TestClient(app) as live_client:
            live_client.post("/profit-calculate", json=payload)
            live_client.post("/profit-calculate", json=payload)
    assert mock.call_count == 3


def test_saved_portfolio_endpoints(
    client: TestClient,
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("COWDOL_DB_PATH", str(tmp_path / "api.db"))
    payload = {
        "name": "Carteira",
        "holdings": [
            {
                "SYMBOL": "TEST3.sa",
                "AMOUNT": 10,
                "PURCHASE_DATE": "01/01/2024",
                "PURCHASE_VALUE": 10.0,
            }
        ],
    }
    created = client.post("/portfolios", json=payload)
    assert created.status_code == 201
    portfolio_id = created.json()["id"]

    assert client.get("/portfolios").json()[0]["name"] == "Carteira"
    loaded = client.get(f"/portfolios/{portfolio_id}")
    assert loaded.status_code == 200
    assert loaded.json()["holdings"][0]["symbol"] == "TEST3.sa"

    assert client.delete(f"/portfolios/{portfolio_id}").json() == {"deleted": True}
    assert client.get(f"/portfolios/{portfolio_id}").status_code == 404


def test_risk_metrics_endpoint(client: TestClient) -> None:
    payload = {
        "data": [
            {
                "SYMBOL": "TEST3.sa",
                "AMOUNT": 10,
                "PURCHASE_DATE": "01/01/2024",
                "PURCHASE_VALUE": 10.0,
                "SECTOR": "energy",
            }
        ]
    }
    response = client.post("/risk-metrics", json=payload)
    assert response.status_code == 200
    body = response.json()
    assert body["assets"][0]["symbol"] == "TEST3.sa"
    assert body["diversification"] == 0.0
    assert body["coverage"] == 1.0
    assert body["available"] is True


def test_profit_calculate_rejects_invalid_holdings(
    client: TestClient,
) -> None:
    payload = {
        "data": [
            {
                "SYMBOL": "TEST3.sa",
                "AMOUNT": 0,
                "PURCHASE_DATE": "01/01/2024",
                "PURCHASE_VALUE": 10.0,
            }
        ]
    }
    assert client.post("/profit-calculate", json=payload).status_code == 422
