import sys
import os
from fastapi.testclient import TestClient


sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from server import app 

client = TestClient(app)

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
            }
        ]
    }

    
    response = client.post("/profit-calculate", json=request_data)
    

    assert response.status_code == 200
    

    # Para verificar se a resposta contém os resultados esperados.
    response_data = response.json()
    
    
    assert len(response_data) == 2  
    assert response_data[0]['symbol'] == "BBSE3.sa"
    assert response_data[1]['symbol'] == "NIKE34.sa"  


if __name__ == "__main__":
    import pytest
    pytest.main()
