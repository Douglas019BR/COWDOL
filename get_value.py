import yfinance as yf
from datetime import datetime

def get_current_price(symbol):
    stock = yf.Ticker(symbol)
    current_price = stock.history(period='1d')['Close'][0]
    return current_price


if __name__ == "__main__":
    symbol = 'TAEE11.SA'
    
    current_price = get_current_price(symbol)
    print(f"O preço atual da ação {symbol} é: R$ {current_price:.2f}")
