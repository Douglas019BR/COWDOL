"""Unit tests for the market data provider."""

from datetime import UTC, date, datetime
from unittest.mock import patch

import pytest
from yfinance.exceptions import YFRateLimitError

from app.services.provider import MarketDataError, YahooFinanceProvider


class FakeILoc:
    def __init__(self, value: float) -> None:
        self.value = value

    def __getitem__(self, index: int) -> float:
        return self.value


class FakeClose:
    def __init__(self, value: float) -> None:
        self.iloc = FakeILoc(value)


class FakePriceHistory:
    def __init__(self, value: float) -> None:
        self.empty = False
        self.close = FakeClose(value)

    def __getitem__(self, key: str) -> FakeClose:
        return self.close


class FakeDividendHistory:
    def __init__(self, values: dict[datetime, float]) -> None:
        self.empty = not values
        self.columns = ["Dividends"]
        self.values = values

    def __getitem__(self, key: str) -> dict[datetime, float]:
        return self.values


class FakeTicker:
    def __init__(
        self,
        price: float = 11.5,
        currency: str | None = "BRL",
        dividends: dict[datetime, float] | None = None,
        empty_dividends: bool = False,
    ) -> None:
        self.price_history = FakePriceHistory(price)
        self.history_metadata = {"currency": currency}
        self.dividend_history = FakeDividendHistory(dividends or {})
        self.empty_dividends = empty_dividends

    def history(
        self, period: str, actions: bool = False, auto_adjust: bool = True
    ) -> FakePriceHistory | FakeDividendHistory:
        """Return price or dividend history depending on the request."""
        if actions:
            if self.empty_dividends:
                return FakeDividendHistory({})
            return self.dividend_history
        return self.price_history


def test_quote_uses_actual_currency_and_caches() -> None:
    provider = YahooFinanceProvider()
    ticker = FakeTicker()
    with patch("app.services.provider.yf.Ticker", return_value=ticker) as mock:
        first = provider.quote("PETR4.sa")
        second = provider.quote("PETR4.sa")
    assert first.price == 11.5
    assert first.currency == "BRL"
    assert second == first
    assert mock.call_count == 1


def test_quote_rejects_unsupported_currency() -> None:
    provider = YahooFinanceProvider()
    with patch(
        "app.services.provider.yf.Ticker",
        return_value=FakeTicker(currency="USD"),
    ):
        with pytest.raises(MarketDataError, match="Unsupported currency USD"):
            provider.quote("AAPL")


def test_quote_rejects_missing_currency_metadata() -> None:
    provider = YahooFinanceProvider()
    with patch(
        "app.services.provider.yf.Ticker",
        return_value=FakeTicker(currency=None),
    ):
        with pytest.raises(MarketDataError, match="Unsupported currency unknown"):
            provider.quote("TEST3.sa")


def test_dividends_filter_dates_and_zero_values() -> None:
    provider = YahooFinanceProvider()
    ticker = FakeTicker(
        dividends={
            datetime(2023, 1, 1, tzinfo=UTC): 99.0,
            datetime(2024, 2, 1, tzinfo=UTC): 1.5,
            datetime(2024, 3, 1, tzinfo=UTC): 0.0,
        }
    )
    with patch("app.services.provider.yf.Ticker", return_value=ticker) as mock:
        first = provider.dividends("PETR4.sa", date(2024, 1, 1))
        second = provider.dividends("PETR4.sa", date(2024, 1, 1))
    assert [(item.ex_date, item.amount) for item in first] == [(date(2024, 2, 1), 1.5)]
    assert second == first
    assert mock.call_count == 1


def test_dividends_reject_empty_history_instead_of_returning_zero() -> None:
    provider = YahooFinanceProvider()
    ticker = FakeTicker(empty_dividends=True)
    with patch("app.services.provider.yf.Ticker", return_value=ticker):
        with pytest.raises(MarketDataError, match="No dividend history"):
            provider.dividends("PETR4.sa", date(2024, 1, 1))


def test_quote_translates_rate_limit_errors() -> None:
    provider = YahooFinanceProvider()

    class RateLimitedTicker(FakeTicker):
        def history(
            self, period: str, actions: bool = False, auto_adjust: bool = True
        ) -> FakePriceHistory:
            raise YFRateLimitError()

    with patch("app.services.provider.yf.Ticker", return_value=RateLimitedTicker()):
        with pytest.raises(MarketDataError, match="rate limited"):
            provider.quote("PETR4.sa")
