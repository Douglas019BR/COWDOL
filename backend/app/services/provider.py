"""Market data provider interface and Yahoo Finance implementation."""

from __future__ import annotations

import math
import threading
import time
from dataclasses import dataclass
from datetime import date
from typing import Protocol, TypeVar

import yfinance as yf
from yfinance.exceptions import YFRateLimitError

from app.services.sectors import canonical_sector, sector_from_static_map

CacheKey = TypeVar("CacheKey")
CacheValue = TypeVar("CacheValue")


class MarketDataError(Exception):
    """Raised when market data cannot be retrieved."""


@dataclass(frozen=True)
class PricePoint:
    """One daily closing price."""

    date: date
    close: float


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

    def sector(self, symbol: str) -> str:
        """Return the canonical sector key for a symbol."""
        ...

    def price_history(self, symbol: str, period: str = "1y") -> tuple[PricePoint, ...]:
        """Return dated daily closing prices for a symbol."""
        ...


class YahooFinanceProvider:
    """Market data provider backed by the yfinance library."""

    MAX_CACHE_ENTRIES = 256

    def __init__(self, cache_ttl_seconds: int = 300) -> None:
        self._ttl = cache_ttl_seconds
        self._lock = threading.Lock()
        self._quotes: dict[str, tuple[float, Quote]] = {}
        self._dividends: dict[tuple[str, date], tuple[float, tuple[Dividend, ...]]] = {}
        self._sectors: dict[str, tuple[float, str]] = {}
        self._histories: dict[
            tuple[str, str], tuple[float, tuple[PricePoint, ...]]
        ] = {}

    def _prune(
        self,
        cache: dict[CacheKey, tuple[float, CacheValue]],
        incoming_key: CacheKey,
    ) -> None:
        """Drop expired entries and bound the cache size."""
        now = time.monotonic()
        expired = [
            key
            for key, (stored_at, _) in cache.items()
            if key != incoming_key and now - stored_at >= self._ttl
        ]
        for key in expired:
            del cache[key]
        required = (
            len(cache) + (0 if incoming_key in cache else 1) - self.MAX_CACHE_ENTRIES
        )
        if required > 0:
            candidates = [item for item in cache.items() if item[0] != incoming_key]
            oldest = sorted(candidates, key=lambda item: item[1][0])[:required]
            for key, _ in oldest:
                del cache[key]

    def quote(self, symbol: str) -> Quote:
        """Return the latest quote, using a short-lived cache."""
        with self._lock:
            cached = self._quotes.get(symbol)
            if cached and time.monotonic() - cached[0] < self._ttl:
                return cached[1]
        try:
            ticker = yf.Ticker(symbol)
            history = ticker.history(period="5d")
            metadata = ticker.history_metadata
        except YFRateLimitError as exc:
            raise MarketDataError(
                "Market data provider is rate limited. Try again later."
            ) from exc
        if history.empty:
            raise MarketDataError(f"No price data found for {symbol}")
        currency = metadata.get("currency")
        if currency != "BRL":
            raise MarketDataError(
                f"Unsupported currency {currency or 'unknown'} for {symbol}; "
                "only BRL instruments are supported"
            )
        quote = Quote(
            symbol=symbol,
            price=float(history["Close"].iloc[-1]),
            currency=currency,
        )
        with self._lock:
            self._prune(self._quotes, symbol)
            self._quotes[symbol] = (time.monotonic(), quote)
        return quote

    def dividends(self, symbol: str, since: date) -> tuple[Dividend, ...]:
        """Return dividends since a date, using a short-lived cache."""
        key = (symbol, since)
        with self._lock:
            cached = self._dividends.get(key)
            if cached and time.monotonic() - cached[0] < self._ttl:
                return cached[1]
        try:
            history = yf.Ticker(symbol).history(
                period="max", actions=True, auto_adjust=False
            )
        except YFRateLimitError as exc:
            raise MarketDataError(
                "Market data provider is rate limited. Try again later."
            ) from exc
        if history.empty or "Dividends" not in history.columns:
            raise MarketDataError(f"No dividend history available for {symbol}")
        dividends = tuple(
            Dividend(ex_date=timestamp.date(), amount=float(value))
            for timestamp, value in history["Dividends"].items()
            if value > 0 and timestamp.date() >= since
        )
        with self._lock:
            self._prune(self._dividends, key)
            self._dividends[key] = (time.monotonic(), dividends)
        return dividends

    def sector(self, symbol: str) -> str:
        """Return a canonical sector, using the static map or Yahoo info."""
        static_sector = sector_from_static_map(symbol)
        if static_sector:
            return static_sector
        with self._lock:
            cached = self._sectors.get(symbol)
            if cached and time.monotonic() - cached[0] < self._ttl:
                return cached[1]
        try:
            raw_sector = yf.Ticker(symbol).info.get("sector")
        except YFRateLimitError as exc:
            raise MarketDataError(
                "Market data provider is rate limited. Try again later."
            ) from exc
        sector = canonical_sector(raw_sector)
        with self._lock:
            self._prune(self._sectors, symbol)
            self._sectors[symbol] = (time.monotonic(), sector)
        return sector

    def price_history(self, symbol: str, period: str = "1y") -> tuple[PricePoint, ...]:
        """Return dated daily closing prices, using a short-lived cache."""
        key = (symbol, period)
        with self._lock:
            cached = self._histories.get(key)
            if cached and time.monotonic() - cached[0] < self._ttl:
                return cached[1]
        try:
            history = yf.Ticker(symbol).history(period=period)
        except YFRateLimitError as exc:
            raise MarketDataError(
                "Market data provider is rate limited. Try again later."
            ) from exc
        if history.empty:
            raise MarketDataError(f"No price history found for {symbol}")
        prices = tuple(
            PricePoint(date=timestamp.date(), close=float(value))
            for timestamp, value in history["Close"].items()
            if value and math.isfinite(float(value)) and float(value) > 0
        )
        if not prices:
            raise MarketDataError(f"No valid prices found for {symbol}")
        with self._lock:
            self._prune(self._histories, key)
            self._histories[key] = (time.monotonic(), prices)
        return prices
