"""Market data provider interface and Yahoo Finance implementation."""

from __future__ import annotations

import time
from dataclasses import dataclass
from datetime import date
from typing import Protocol

import yfinance as yf
from yfinance.exceptions import YFRateLimitError


class MarketDataError(Exception):
    """Raised when market data cannot be retrieved."""


@dataclass(frozen=True)
class Quote:
    """Latest known price for a symbol."""

    symbol: str
    price: float
    currency: str


@dataclass(frozen=True)
class Dividend:
    """A dividend payment with its ex-date."""

    ex_date: date
    amount: float


class MarketDataProvider(Protocol):
    """Contract used by the portfolio calculator."""

    def quote(self, symbol: str) -> Quote:
        """Return the latest quote for a symbol."""
        ...

    def dividends(self, symbol: str, since: date) -> tuple[Dividend, ...]:
        """Return dividends with ex-date on or after ``since``."""
        ...


class YahooFinanceProvider:
    """Market data provider backed by the yfinance library."""

    def __init__(self, cache_ttl_seconds: int = 300) -> None:
        self._ttl = cache_ttl_seconds
        self._quotes: dict[str, tuple[float, Quote]] = {}
        self._dividends: dict[tuple[str, date], tuple[float, tuple[Dividend, ...]]] = {}

    def quote(self, symbol: str) -> Quote:
        """Return the latest quote, using a short-lived cache."""
        cached = self._quotes.get(symbol)
        if cached and time.monotonic() - cached[0] < self._ttl:
            return cached[1]
        try:
            history = yf.Ticker(symbol).history(period="5d")
        except YFRateLimitError as exc:
            raise MarketDataError(
                "Market data provider is rate limited. Try again later."
            ) from exc
        if history.empty:
            raise MarketDataError(f"No price data found for {symbol}")
        quote = Quote(
            symbol=symbol,
            price=float(history["Close"].iloc[-1]),
            currency="BRL",
        )
        self._quotes[symbol] = (time.monotonic(), quote)
        return quote

    def dividends(self, symbol: str, since: date) -> tuple[Dividend, ...]:
        """Return dividends since a date, using a short-lived cache."""
        key = (symbol, since)
        cached = self._dividends.get(key)
        if cached and time.monotonic() - cached[0] < self._ttl:
            return cached[1]
        try:
            series = yf.Ticker(symbol).dividends
        except YFRateLimitError as exc:
            raise MarketDataError(
                "Market data provider is rate limited. Try again later."
            ) from exc
        dividends = tuple(
            Dividend(ex_date=timestamp.date(), amount=float(value))
            for timestamp, value in series.items()
            if timestamp.date() >= since
        )
        self._dividends[key] = (time.monotonic(), dividends)
        return dividends
