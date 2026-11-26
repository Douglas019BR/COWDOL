"""Unit tests for portfolio calculations."""

from datetime import date

from app.models import HoldingInput
from app.services.portfolio import calculate_holding, calculate_portfolio
from app.services.provider import Dividend, MarketDataError
from tests.conftest import FakeProvider


def make_holding() -> HoldingInput:
    """Build a representative holding using legacy CSV field names."""
    return HoldingInput.model_validate(
        {
            "SYMBOL": "TEST3.sa",
            "AMOUNT": 10,
            "PURCHASE_DATE": "01/01/2024",
            "PURCHASE_VALUE": 10.0,
        }
    )


def test_calculate_holding_values_and_filters_old_dividends() -> None:
    provider = FakeProvider(
        price=12.0,
        dividends=(
            Dividend(ex_date=date(2023, 1, 1), amount=99.0),
            Dividend(ex_date=date(2024, 2, 1), amount=1.0),
            Dividend(ex_date=date(2024, 3, 1), amount=0.5),
        ),
    )
    result = calculate_holding(make_holding(), provider)
    assert result.symbol == "TEST3.sa"
    assert result.amount == 10
    assert result.current_value == 120.0
    assert result.purchase_total == 100.0
    assert result.value_difference == 20.0
    assert result.total_dividends == 15.0
    assert result.balance == 35.0
    assert result.currency == "BRL"
    assert result.sector == "energy"
    assert result.error is None


def test_csv_sector_override_wins_over_provider() -> None:
    holding = HoldingInput.model_validate(
        {
            "SYMBOL": "TEST3.sa",
            "AMOUNT": 10,
            "PURCHASE_DATE": "01/01/2024",
            "PURCHASE_VALUE": 10.0,
            "SECTOR": "Financial Services",
        }
    )
    result = calculate_holding(holding, FakeProvider())
    assert result.sector == "financial"


def test_sector_lookup_failure_keeps_calculated_values() -> None:
    class FailingSectorProvider(FakeProvider):
        def sector(self, symbol: str) -> str:
            raise MarketDataError("rate limited")

    result = calculate_holding(make_holding(), FailingSectorProvider())
    assert result.balance == 20.0
    assert result.sector == "other"
    assert result.error is None


def test_calculate_portfolio_reports_provider_errors_per_holding() -> None:
    provider = FakeProvider(error="provider unavailable")
    results = calculate_portfolio([make_holding()], provider)
    assert len(results) == 1
    assert results[0].error == "provider unavailable"
    assert results[0].symbol == "TEST3.sa"
    assert results[0].balance == 0.0
    assert results[0].purchase_total == 100.0
