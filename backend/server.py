from yfinance_functions import process_symbol
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/profit-calculate")
async def profit_calculate(request: dict):
    print(request)
    results = []
    # import ipdb;ipdb.set_trace()
    for row in request["data"]:
        symbol_result = process_symbol(
            row["SYMBOL"], row["AMOUNT"], row["PURCHASE_DATE"], row["PURCHASE_VALUE"]
        )
        symbol_result["symbol"] = row["SYMBOL"]
        symbol_result["amount"] = row["AMOUNT"]
        results.append(symbol_result)
    return results
