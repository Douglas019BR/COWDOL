import pytest
from fastapi.testclient import TestClient
from server import app  # Certifique-se de que 'server' está no mesmo nível de importação

client = TestClient(app)

def test_hello_world():
    response = client.get("/hello-world")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World"}

def test_profit_calculate():
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
    assert response.status_code == 200
    # Adicione aqui mais assertivas baseadas no retorno esperado do seu processamento
