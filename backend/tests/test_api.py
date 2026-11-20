"""API-level tests for the COWDOL service."""

from fastapi.testclient import TestClient


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
