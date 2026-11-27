"""Unit tests for portfolio risk metrics."""

import pytest

from app.models import HoldingInput
from app.services.provider import MarketDataError
from app.services.risk import (
    annualised_volatility,
    calculate_risk,
    daily_returns,
    diversification_score,
    max_drawdown,
)
from tests.conftest import FakeProvider

PRICES = (100.0, 110.0, 99.0, 105.0)


def make_holding(sector: str) -> HoldingInput:
    return HoldingInput.model_validate(
        {
            "SYMBOL": "TEST3.sa",
            "AMOUNT": 10,
            "PURCHASE_DATE": "01/01/2024",
            "PURCHASE_VALUE": 10.0,
            "SECTOR": sector,
        }
    )


def test_daily_returns() -> None:
    assert daily_returns(PRICES)[0] == pytest.approx(0.1)


def test_annualised_volatility() -> None:
    assert annualised_volatility((100.0,) * 5) == 0.0
    assert annualised_volatility(PRICES) > 0


def test_max_drawdown() -> None:
    assert max_drawdown(PRICES) == pytest.approx(-0.1)
    assert max_drawdown((100.0, 110.0)) == 0.0
    assert max_drawdown(()) == 0.0


def test_diversification_score() -> None:
    assert diversification_score({"energy": 100.0}) == 0.0
    assert diversification_score({"energy": 100.0, "financial": 100.0}) == 0.5


def test_calculate_risk_combines_assets_and_sectors() -> None:
    summary = calculate_risk(
        [make_holding("energy"), make_holding("financial")],
        FakeProvider(prices=PRICES),
    )
    assert len(summary.assets) == 2
    assert summary.diversification == 0.5
    assert summary.volatility > 0
    assert summary.max_drawdown == pytest.approx(-0.1)


def test_calculate_risk_reports_history_failures() -> None:
    class FailingHistoryProvider(FakeProvider):
        def price_history(self, symbol: str, period: str = "1y") -> tuple[float, ...]:
            raise MarketDataError("rate limited")

    summary = calculate_risk([make_holding("energy")], FailingHistoryProvider())
    assert summary.assets[0].error == "rate limited"
    assert summary.volatility == 0.0
