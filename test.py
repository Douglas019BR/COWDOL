from pyrtfolio.StockPortfolio import StockPortfolio

portfolio = StockPortfolio()

portfolio.add_stock(
    stock_symbol="BBVA",
    stock_country="spain",
    purchase_date="04/01/2018",
    num_of_shares=2,
    cost_per_share=7.2,
)

portfolio.add_stock(
    stock_aymbol="ELE",
    stock_country="spain",
    purchase_date="13/06/2019",
    num_of_shares=15,
    cost_per_share=23.8,
)

print(portfolio.data)
