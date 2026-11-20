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


class FakeHistory:
    def __init__(self, values: list[float]) -> None:
        self.empty = not values
        self.close = FakeClose(values[-1] if values else 0.0)

    def __getitem__(self, key: str) -> FakeClose:
        return self.close


def test_quote_returns_price_and_caches_ticker() -> None:
    provider = YahooFinanceProvider()
    ticker = type(
        "Ticker", (), {"history": lambda self, period: FakeHistory([10.0, 11.5])}
    )()
    with patch("app.services.provider.yf.Ticker", return_value=ticker) as ticker_mock:
        first = provider.quote("TEST3.sa")
        second = provider.quote("TEST3.sa")
    assert first.price == 11.5
    assert first.currency == "BRL"
    assert second == first
    assert ticker_mock.call_count == 1


def test_quote_rejects_empty_history() -> None:
    provider = YahooFinanceProvider()
    ticker = type("Ticker", (), {"history": lambda self, period: FakeHistory([])})()
    with patch("app.services.provider.yf.Ticker", return_value=ticker):
        with pytest.raises(MarketDataError, match="No price data"):
            provider.quote("MISSING.sa")


def test_quote_translates_rate_limit_errors() -> None:
    provider = YahooFinanceProvider()

    def raise_rate_limit(self: object, period: str) -> None:
        raise YFRateLimitError()

    ticker = type("Ticker", (), {"history": raise_rate_limit})()
    with patch("app.services.provider.yf.Ticker", return_value=ticker):
        with pytest.raises(MarketDataError, match="rate limited"):
            provider.quote("TEST3.sa")


def test_dividends_are_filtered_and_cached() -> None:
    provider = YahooFinanceProvider()
    series = {
        datetime(2023, 1, 1, tzinfo=UTC): 99.0,
        datetime(2024, 2, 1, tzinfo=UTC): 1.5,
    }
    ticker = type("Ticker", (), {"dividends": series})()
    with patch("app.services.provider.yf.Ticker", return_value=ticker) as ticker_mock:
        first = provider.dividends("TEST3.sa", date(2024, 1, 1))
        second = provider.dividends("TEST3.sa", date(2024, 1, 1))
    assert len(first) == 1
    assert first[0].amount == 1.5
    assert first[0].ex_date == date(2024, 2, 1)
    assert second == first
    assert ticker_mock.call_count == 1
