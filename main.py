import requests
import csv

# ALPHA_VANTAGE_API_KEY = 'I5BDJ29HDPFX7N0W'
# ALPHA_VANTAGE_API_KEY = 'BN8PXO3QS0YZBPSD'
FINNHUB_API_KEY = 'cq3f8s1r01qobiisl0u0cq3f8s1r01qobiisl0ug'


def get_dividends(symbol, start_date):
    url = f'https://finnhub.io/api/v1/stock/dividend?symbol={symbol}&from={start_date}'
    headers = {
        'X-Finnhub-Token': FINNHUB_API_KEY
    }
    response = requests.get(url, headers=headers)
    print(f"response : {response}")
    if response.status_code == 200:
        data = response.json()
        print("##############")
        print(data)
        dividends = {item['date']: item['amount'] for item in data}
        return dividends
    else:
        return {}


def get_current_price(symbol):
    url = f'https://finnhub.io/api/v1/quote?symbol={symbol}&token={FINNHUB_API_KEY}'
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        current_price = data['c']
        return current_price
    else:
        return None


def process_portfolio(filename):
    results = []
    print('Processing portfolio...')
    with open(filename, newline="", encoding="utf-8") as csvfile:
        reader = csv.DictReader(csvfile, delimiter=";")
        print('Reading file...')
        for row in reader:
            symbol = row["SYMBOL"]
            amount = int(row["AMOUNT"])
            purchase_date = row["PURCHASE_DATE"]
            purchase_value = float(row["PURCHASE_VALUE"])

            print(f"Processing {symbol}...")
            dividends = get_dividends(symbol, purchase_date)

            print(f"dividends : {dividends}")
            current_price = get_current_price(symbol)

            print(f"current_price : {current_price}")
            total_dividends = sum(dividends.values()) * \
                amount if dividends else 0

            print(f"total_dividends : {total_dividends}")
            current_value = current_price * amount
            purchase_total = purchase_value * amount
            value_difference = current_value - purchase_total
            balance = value_difference + total_dividends
            print(f"balance : {balance}")
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
    import pyscript

    results = process_portfolio("input.csv")
    for result in results:
        print(result)
