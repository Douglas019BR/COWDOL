import requests

FINNHUB_API_KEY = 'YOUR_FINNHUB_API_KEY'

def get_dividends(symbol, start_date):
    url = f'https://finnhub.io/api/v1/stock/dividend?symbol={symbol}&from={start_date}'
    headers = {
        'X-Finnhub-Token': FINNHUB_API_KEY
    }
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        dividends = {item['date']: item['amount'] for item in data}
        return dividends
    else:
        print(f"Error: {response.status_code} - {response.text}")
        return {}

def get_current_price(symbol):
    url = f'https://finnhub.io/api/v1/quote?symbol={symbol}'
    headers = {
        'X-Finnhub-Token': FINNHUB_API_KEY
    }
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        current_price = data['c']
        return current_price
    else:
        print(f"Error: {response.status_code} - {response.text}")
        return None

# Exemplo de uso
symbol = 'BBSE3.SA'
start_date = '2023-10-01'

dividends = get_dividends(symbol, start_date)
print("Dividends:", dividends)

current_price = get_current_price(symbol)
print("Current Price:", current_price)
