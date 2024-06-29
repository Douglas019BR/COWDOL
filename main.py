import requests
import csv

ALPHA_VANTAGE_API_KEY = 'I5BDJ29HDPFX7N0W'

def get_dividends(symbol, start_date):
    url = f'https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY_ADJUSTED&symbol={symbol}&apikey={ALPHA_VANTAGE_API_KEY}'
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        if 'Our standard API rate limit is 25 requests per day.' in data:
            raise Exception("API rate limit exceeded")
        monthly_adjusted_data = data.get('Monthly Adjusted Time Series', {})
        dividends ={}
        for date, values in monthly_adjusted_data.items():
            if date >= start_date:
                dividend_amount = float(values.get('7. dividend amount', '0.0'))
                dividends[date] = dividend_amount
                
        return dividends
    else:
        return {}
        

def get_current_price(symbol):
    url = f'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={ALPHA_VANTAGE_API_KEY}'
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        if 'Our standard API rate limit is 25 requests per day.' in data:
            raise Exception("API rate limit exceeded")
        current_price = float(data['Global Quote']['05. price'])
        return current_price
    else:
        return None


def process_portfolio(filename):
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
            total_dividends = sum(dividends.values()) * amount if dividends else 0

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
    import pyscript

    results = process_portfolio("input.csv")
    for result in results:
        print(result)
