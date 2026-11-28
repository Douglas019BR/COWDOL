"""Unit tests for the market data provider."""

from concurrent.futures import ThreadPoolExecutor
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
        sector: str | None = None,
    ) -> None:
        self.price_history = FakePriceHistory(price)
        self.history_metadata = {"currency": currency}
        self.dividend_history = FakeDividendHistory(dividends or {})
        self.empty_dividends = empty_dividends
        self.info = {"sector": sector}

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


def test_quote_cache_is_bounded() -> None:
    provider = YahooFinanceProvider()
    tickers = [FakeTicker(price=index) for index in range(1, 4)]
    with (
        patch.object(YahooFinanceProvider, "MAX_CACHE_ENTRIES", 2),
        patch("app.services.provider.yf.Ticker", side_effect=tickers),
    ):
        for symbol in ("A.sa", "B.sa", "C.sa"):
            provider.quote(symbol)
    assert set(provider._quotes) == {"B.sa", "C.sa"}


def test_dividend_cache_is_bounded() -> None:
    provider = YahooFinanceProvider()
    ticker = FakeTicker(dividends={datetime(2025, 1, 1, tzinfo=UTC): 1.0})
    with (
        patch.object(YahooFinanceProvider, "MAX_CACHE_ENTRIES", 2),
        patch("app.services.provider.yf.Ticker", return_value=ticker),
    ):
        for month in (1, 2, 3):
            provider.dividends("PETR4.sa", date(2024, month, 1))
    assert len(provider._dividends) == 2


def test_replacing_a_key_does_not_over_evict() -> None:
    provider = YahooFinanceProvider()
    with patch("app.services.provider.yf.Ticker", return_value=FakeTicker()):
        provider.quote("A.sa")
        provider.quote("B.sa")
    with (
        patch.object(YahooFinanceProvider, "MAX_CACHE_ENTRIES", 2),
        patch(
            "app.services.provider.yf.Ticker",
            side_effect=[FakeTicker(), FakeTicker()],
        ),
    ):
        with ThreadPoolExecutor(max_workers=2) as pool:
            list(pool.map(lambda _: provider.quote("C.sa"), range(2)))
    assert len(provider._quotes) == 2
    assert "C.sa" in provider._quotes
    assert {"A.sa", "B.sa"} & set(provider._quotes)


def test_concurrent_cache_writes_are_safe() -> None:
    provider = YahooFinanceProvider()
    ticker = FakeTicker(dividends={datetime(2025, 1, 1, tzinfo=UTC): 1.0})

    def load(index: int) -> None:
        provider.quote(f"S{index}.sa")
        provider.dividends(f"S{index}.sa", date(2024, 1, 1))

    with patch("app.services.provider.yf.Ticker", return_value=ticker):
        with ThreadPoolExecutor(max_workers=8) as pool:
            list(pool.map(load, range(50)))
    assert len(provider._quotes) <= YahooFinanceProvider.MAX_CACHE_ENTRIES
    assert len(provider._dividends) <= YahooFinanceProvider.MAX_CACHE_ENTRIES


def test_sector_uses_static_map_without_a_network_call() -> None:
    provider = YahooFinanceProvider()
    with patch("app.services.provider.yf.Ticker") as ticker_mock:
        assert provider.sector("BBSE3.sa") == "financial"
    ticker_mock.assert_not_called()


def test_sector_falls_back_to_yahoo_info_and_caches() -> None:
    provider = YahooFinanceProvider()
    ticker = FakeTicker(sector="Healthcare")
    with patch("app.services.provider.yf.Ticker", return_value=ticker) as mock:
        first = provider.sector("UNKNOWN.sa")
        second = provider.sector("UNKNOWN.sa")
    assert first == "health"
    assert second == first
    assert mock.call_count == 1


def test_unknown_sector_maps_to_other() -> None:
    provider = YahooFinanceProvider()
    with patch(
        "app.services.provider.yf.Ticker",
        return_value=FakeTicker(sector=None),
    ):
        assert provider.sector("UNKNOWN.sa") == "other"


def test_price_history_rejects_unsupported_currency() -> None:
    provider = YahooFinanceProvider()

    class Series:
        def items(self) -> object:
            return iter([(datetime(2024, 1, 1, tzinfo=UTC), 100.0)])

    class Frame:
        empty = False

        def __getitem__(self, key: str) -> Series:
            return Series()

    class PriceTicker:
        history_metadata = {"currency": "USD"}

        def history(
            self, period: str, actions: bool = False, auto_adjust: bool = True
        ) -> Frame:
            return Frame()

    with patch(
        "app.services.provider.yf.Ticker",
        return_value=PriceTicker(),
    ):
        with pytest.raises(MarketDataError, match="Unsupported currency USD"):
            provider.price_history("MSFT")


def test_expired_cache_entries_are_removed() -> None:
    provider = YahooFinanceProvider(cache_ttl_seconds=0)
    with patch(
        "app.services.provider.yf.Ticker",
        side_effect=[FakeTicker(), FakeTicker()],
    ):
        provider.quote("A.sa")
        provider.quote("B.sa")
    assert list(provider._quotes) == ["B.sa"]
