import sys
import os
from fastapi.testclient import TestClient


sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from server import app  
client = TestClient(app)

def test_read_root():
    response = client.get("/hello-world")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World"}
