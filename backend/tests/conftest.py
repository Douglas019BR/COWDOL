"""Shared test fixtures."""

from collections.abc import Iterator
from datetime import date

import pytest
from fastapi.testclient import TestClient

from app.main import app, get_provider
from app.services.provider import (
    Dividend,
    MarketDataError,
    PricePoint,
    Quote,
)


class FakeProvider:
    """Deterministic market data provider for tests."""

    def __init__(
        self,
        price: float = 12.0,
        dividends: tuple[Dividend, ...] = (),
        error: str | None = None,
        sector: str = "energy",
        prices: tuple[PricePoint, ...] = (
            PricePoint(date(2024, 1, 1), 100.0),
            PricePoint(date(2024, 1, 2), 110.0),
            PricePoint(date(2024, 1, 3), 99.0),
            PricePoint(date(2024, 1, 4), 105.0),
        ),
    ) -> None:
        self.price = price
        self._dividends = dividends
        self.error = error
        self.sector_name = sector
        self.prices = prices

    def quote(self, symbol: str) -> Quote:
        """Return a fixed quote or raise a provider error."""
        if self.error:
            raise MarketDataError(self.error)
        return Quote(symbol=symbol, price=self.price, currency="BRL")

    def dividends(self, symbol: str, since: date) -> tuple[Dividend, ...]:
        """Return the configured dividends."""
        return tuple(item for item in self._dividends if item.ex_date >= since)

    def sector(self, symbol: str) -> str:
        """Return the configured sector."""
        return self.sector_name

    def price_history(self, symbol: str, period: str = "1y") -> tuple[PricePoint, ...]:
        """Return the configured dated closing prices."""
        return self.prices


@pytest.fixture
def client() -> Iterator[TestClient]:
    """API client with the market data provider replaced by a fake."""
    app.dependency_overrides[get_provider] = lambda: FakeProvider()
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
