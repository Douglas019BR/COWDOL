from unittest.mock import call
import pytest
import sys
import os
from fastapi.testclient import TestClient


sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from server import app

client = TestClient(app)


@pytest.fixture
def mocked_process_symbol(mocker):
    return mocker.patch(
        "server.process_symbol",
        side_effect=[{
            "current_value": 2,
            "purchase_total": 2,
            "value_difference": 2,
            "balance": 2,
            "total_dividends": 2,
        },{
            "current_value": 1,
            "purchase_total": 1,
            "value_difference": 1,
            "balance": 1,
            "total_dividends": 1,
        }]
    )


def test_profit_calculate(mocked_process_symbol):

    request_data = {
        "data": [
            {
                "SYMBOL": "BBSE3.sa",
                "AMOUNT": 11,
                "PURCHASE_DATE": "01/10/2023",
                "PURCHASE_VALUE": 31.46,
            },
            {
                "SYMBOL": "NIKE34.sa",
                "AMOUNT": 7,
                "PURCHASE_DATE": "09/10/2023",
                "PURCHASE_VALUE": 47.04,
            },
        ]
    }

    response = client.post("/profit-calculate", json=request_data)
    assert mocked_process_symbol.call_args_list == [call('BBSE3.sa', 11, '01/10/2023', 31.46),call('NIKE34.sa', 7, '09/10/2023', 47.04)]
    assert response.status_code == 200

    response_data = response.json()

    assert len(response_data) == 2
    assert response_data[0]["symbol"] == "BBSE3.sa"
    assert response_data[1]["symbol"] == "NIKE34.sa"


if __name__ == "__main__":
    import pytest

    pytest.main()
