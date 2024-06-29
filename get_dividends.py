import yfinance as yf
import pandas as pd


def get_dividends(symbol, start_date):
    stock = yf.Ticker(symbol)
    dividends = stock.dividends
    dividends = dividends[dividends.index >= start_date]
    return dividends


if __name__ == "__main__":
    symbol = "TAEE11.SA"
    start_date = "2023-01-01"

    dividends = get_dividends(symbol, start_date)
    print(dividends)
    total_dividends = dividends.sum()
    print(f"Total de dividendos recebidos desde {start_date}: R$ {total_dividends:.2f}")
