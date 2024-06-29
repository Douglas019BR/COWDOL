from get_dividends import get_dividends
from get_value import get_current_price
import pandas as pd
from datetime import datetime


def process_portfolio(filename):
    portfolio = pd.read_csv(filename, sep=";")

    results = []

    for index, row in portfolio.iterrows():
        symbol = row["SYMBOL"]
        amount = row["AMOUNT"]
        purchase_date = row["PURCHASE_DATE"]
        purchase_value = row["PURCHASE_VALUE"]

        dividends = get_dividends(symbol, purchase_date)
        total_dividends = dividends.sum() * amount if not dividends.empty else 0

        current_price = get_current_price(symbol)

        current_value = current_price * amount
        purchase_total = purchase_value * amount
        value_difference = current_value + -purchase_total
        balance = value_difference + total_dividends

        if balance > 0:
            status = "Lucro"
        elif balance < 0:
            status = "Prejuízo"
        else:
            status = "Sem variação"

        message = (
            f"Ação: {symbol}\nQuantidade: {amount}\nValor de compra por ação: R$ {purchase_value:.2f}\n"
            f"Valor atual por ação: R$ {current_price:.2f}\n"
            f"Dividendos recebidos: R$ {total_dividends:.2f}\n"
            f"Diferença (Valor Atual - Valor de Compra): R$ {value_difference:.2f}\n"
            f"Balanco (diferenca + dividendos): R$ {balance:.2f}\n"
            f"Status: {status}\n"
        )

        results.append(message)

    return results


# Exemplo de uso
if __name__ == "__main__":
    filename = "input.csv"
    portfolio_results = process_portfolio(filename)

    for result in portfolio_results:
        print(result)
        print("--------------------")
