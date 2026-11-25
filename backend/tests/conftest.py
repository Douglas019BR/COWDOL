"""Shared test fixtures."""

from collections.abc import Iterator
from datetime import date

import pytest
from fastapi.testclient import TestClient

from app.main import app, get_provider
from app.services.provider import (
    Dividend,
    MarketDataError,
    Quote,
)


class FakeProvider:
    """Deterministic market data provider for tests."""

    def __init__(
        self,
        price: float = 12.0,
        dividends: tuple[Dividend, ...] = (),
        error: str | None = None,
    ) -> None:
        self.price = price
        self._dividends = dividends
        self.error = error

    def quote(self, symbol: str) -> Quote:
        """Return a fixed quote or raise a provider error."""
        if self.error:
            raise MarketDataError(self.error)
        return Quote(symbol=symbol, price=self.price, currency="BRL")

    def dividends(self, symbol: str, since: date) -> tuple[Dividend, ...]:
        """Return the configured dividends."""
        return tuple(item for item in self._dividends if item.ex_date >= since)


@pytest.fixture
def client() -> Iterator[TestClient]:
    """API client with the market data provider replaced by a fake."""
    app.dependency_overrides[get_provider] = lambda: FakeProvider()
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
