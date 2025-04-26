import csv
from datetime import datetime
from typing import List

import pytz
import yfinance as yf


def get_dividends(symbol: str, start_date: str) -> dict:
    start_date = datetime.strptime(start_date, "%d/%m/%Y")
    timezone = pytz.timezone("America/Sao_Paulo")
    start_date = timezone.localize(start_date)
    stock = yf.Ticker(symbol)
    dividends = stock.dividends
    dividends = dividends[dividends.index >= start_date]
    dividends_dict = dividends.to_dict()

    return dividends_dict


def get_current_price(symbol: str) -> float:
    try:
        stock = yf.Ticker(symbol)
        current_price = stock.history(period="1d")["Close"].iloc[0]
    except IndexError:
        symbol = f"{symbol.split('.')[0]}F.sa"
        stock = yf.Ticker(symbol)
        current_price = stock.history(period="1d")["Close"].iloc[0]
    return current_price


def process_symbol(
    symbol: str, amount: int, purchase_date: str, purchase_value: float
) -> dict:
    dividends = get_dividends(symbol, purchase_date)
    current_price = get_current_price(symbol)
    total_dividends = sum(dividends.values()) * amount if dividends else 0

    current_value = current_price * amount
    purchase_total = purchase_value * amount
    value_difference = current_value - purchase_total
    balance = value_difference + total_dividends

    return {
        "current_value": current_value,
        "purchase_total": purchase_total,
        "value_difference": value_difference,
        "balance": balance,
        "total_dividends": total_dividends,
    }


def process_portfolio(filename: str) -> List[dict]:
    results = []

    with open(filename, newline="", encoding="utf-8") as csvfile:
        reader = csv.DictReader(csvfile, delimiter=";")

        for row in reader:
            symbol = row["SYMBOL"]
            amount = int(row["AMOUNT"])
            purchase_date = row["PURCHASE_DATE"]
            purchase_value = float(row["PURCHASE_VALUE"])

            dividends = get_dividends(symbol, purchase_date)
            current_price = get_current_price(symbol)
            total_dividends = (
                sum(dividends.values()) * amount if dividends else 0
            )

            current_value = current_price * amount
            purchase_total = purchase_value * amount
            value_difference = current_value - purchase_total
            balance = value_difference + total_dividends

            if balance > 0:
                status = "Profit"
            elif balance < 0:
                status = "Loss"
            else:
                status = "No change"

            message = (
                f"Stock: {symbol}\nQuantity: {amount}\nPurchase Price per Share: ${purchase_value:.2f}\n"
                f"Current Price per Share: ${current_price:.2f}\n"
                f"Dividends Received: ${total_dividends:.2f}\n"
                f"Difference (Current Price - Purchase Price): ${value_difference:.2f}\n"
                f"Balance (Difference + Dividends): ${balance:.2f}\n"
                f"Status: {status}\n"
            )

            results.append(message)

    return results


if __name__ == "__main__":
    results = process_portfolio("input.csv")
    for result in results:
        print(result)
