from yfinance_functions import process_symbol
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/hello-world")
async def root():
    return {"message": "Hello World"}


@app.post("/profit-calculate")
async def profit_calculate(request: dict):
    print(request)
    results = []
    for row in request['data']:
        symbol_result = process_symbol(
            row['SYMBOL'], row['AMOUNT'], row['PURCHASE_DATE'], row['PURCHASE_VALUE'])
        symbol_result['symbol'] = row['SYMBOL']
        symbol_result['amount'] = row['AMOUNT']
        results.append(symbol_result)
    return results

# {
    #     "data": [
    #         {
    #             "SYMBOL": "BBSE3.sa",
    #             "AMOUNT": 11,
    #             "PURCHASE_DATE": "01/10/2023",
    #             "PURCHASE_VALUE": 31.46,
    #         }
    #         {
    #             "SYMBOL": "NIKE34.sa",
    #             "AMOUNT": 7,
    #             "PURCHASE_DATE": "09/10/2023",
    #             "PURCHASE_VALUE": 47.04,
    #         }
    #     ]
    # }
