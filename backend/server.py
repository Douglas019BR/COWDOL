from fastapi import FastAPI

app = FastAPI()


@app.get("/hello-world")
async def root():
    return {"message": "Hello World"}


@app.post("/profit-calculate")
async def profit_calculate(request: dict):
    print(request.json())
    return {"profit": 100}
