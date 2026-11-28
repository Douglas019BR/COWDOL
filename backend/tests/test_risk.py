"""Unit tests for portfolio risk metrics."""

from datetime import date

import pytest

from app.models import HoldingInput
from app.services.provider import MarketDataError, PricePoint
from app.services.risk import (
    annualised_volatility,
    calculate_risk,
    daily_returns,
    diversification_score,
    max_drawdown,
    portfolio_values,
)
from tests.conftest import FakeProvider

PRICES = (
    PricePoint(date(2024, 1, 1), 100.0),
    PricePoint(date(2024, 1, 2), 110.0),
    PricePoint(date(2024, 1, 3), 99.0),
    PricePoint(date(2024, 1, 4), 105.0),
)


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
    closes = tuple(point.close for point in PRICES)
    assert daily_returns(closes)[0] == pytest.approx(0.1)


def test_annualised_volatility() -> None:
    assert annualised_volatility((100.0,) * 5) == 0.0
    assert annualised_volatility(tuple(point.close for point in PRICES)) > 0


def test_max_drawdown() -> None:
    closes = tuple(point.close for point in PRICES)
    assert max_drawdown(closes) == pytest.approx(-0.1)
    assert max_drawdown((100.0, 110.0)) == 0.0
    assert max_drawdown(()) == 0.0


def test_diversification_score() -> None:
    assert diversification_score({"energy": 100.0}) == 0.0
    assert diversification_score({"energy": 100.0, "financial": 100.0}) == 0.5


def test_portfolio_values_cancel_opposite_moves() -> None:
    first = (
        PricePoint(date(2024, 1, 1), 100.0),
        PricePoint(date(2024, 1, 2), 110.0),
        PricePoint(date(2024, 1, 3), 100.0),
    )
    second = (
        PricePoint(date(2024, 1, 1), 100.0),
        PricePoint(date(2024, 1, 2), 90.0),
        PricePoint(date(2024, 1, 3), 100.0),
    )
    values = portfolio_values([(1, first), (1, second)])
    assert values == (200.0, 200.0, 200.0)
    assert annualised_volatility(values) == 0.0
    assert max_drawdown(values) == 0.0


def test_calculate_risk_combines_assets_and_sectors() -> None:
    summary = calculate_risk(
        [make_holding("energy"), make_holding("financial")],
        FakeProvider(prices=PRICES),
    )
    assert len(summary.assets) == 2
    assert summary.diversification == 0.5
    assert summary.coverage == 1.0
    assert summary.available is True
    assert summary.volatility > 0
    assert summary.max_drawdown == pytest.approx(-0.1)


def test_calculate_risk_marks_disjoint_histories_unavailable() -> None:
    class DisjointProvider(FakeProvider):
        def price_history(
            self, symbol: str, period: str = "1y"
        ) -> tuple[PricePoint, ...]:
            if symbol == "A.sa":
                return (
                    PricePoint(date(2024, 1, 1), 100.0),
                    PricePoint(date(2024, 1, 2), 110.0),
                )
            return (
                PricePoint(date(2024, 2, 1), 100.0),
                PricePoint(date(2024, 2, 2), 90.0),
            )

    holdings = [
        HoldingInput.model_validate(
            {
                "SYMBOL": symbol,
                "AMOUNT": 10,
                "PURCHASE_DATE": "01/01/2024",
                "PURCHASE_VALUE": 10.0,
                "SECTOR": "energy",
            }
        )
        for symbol in ("A.sa", "B.sa")
    ]
    summary = calculate_risk(holdings, DisjointProvider())
    assert summary.available is False
    assert summary.volatility == 0.0
    assert summary.coverage == 1.0


def test_calculate_risk_reports_incomplete_coverage() -> None:
    class FailingHistoryProvider(FakeProvider):
        def price_history(
            self, symbol: str, period: str = "1y"
        ) -> tuple[PricePoint, ...]:
            raise MarketDataError("rate limited")

    summary = calculate_risk([make_holding("energy")], FailingHistoryProvider())
    assert summary.assets[0].error == "rate limited"
    assert summary.coverage == 0.0
    assert summary.volatility == 0.0
