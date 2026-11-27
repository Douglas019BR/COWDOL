"""Risk metrics derived from dated daily price history."""

from __future__ import annotations

import math
from statistics import stdev

from app.models import AssetRisk, HoldingInput, RiskSummary
from app.services.portfolio import calculate_sector
from app.services.provider import (
    MarketDataError,
    MarketDataProvider,
    PricePoint,
)

TRADING_DAYS = 252


def daily_returns(values: tuple[float, ...]) -> tuple[float, ...]:
    """Compute simple daily returns from a value series."""
    return tuple(
        current / previous - 1
        for previous, current in zip(values, values[1:], strict=False)
        if previous > 0
    )


def annualised_volatility(values: tuple[float, ...]) -> float:
    """Annualise the standard deviation of daily returns."""
    returns = daily_returns(values)
    if len(returns) < 2:
        return 0.0
    return stdev(returns) * math.sqrt(TRADING_DAYS)


def max_drawdown(values: tuple[float, ...]) -> float:
    """Return the worst peak-to-trough decline as a negative fraction."""
    if not values:
        return 0.0
    peak = values[0]
    worst = 0.0
    for value in values:
        peak = max(peak, value)
        if peak > 0:
            worst = min(worst, value / peak - 1)
    return worst


def diversification_score(weights: dict[str, float]) -> float:
    """Return one minus the Herfindahl index of sector weights."""
    total = sum(weights.values())
    if total <= 0:
        return 0.0
    herfindahl = sum((weight / total) ** 2 for weight in weights.values())
    return 1 - herfindahl


def portfolio_values(
    histories: list[tuple[int, tuple[PricePoint, ...]]],
) -> tuple[float, ...]:
    """Build a date-aligned portfolio value series."""
    if not histories:
        return ()
    dates = {point.date for point in histories[0][1]}
    for _, points in histories[1:]:
        dates &= {point.date for point in points}
    return tuple(
        sum(
            amount * next(point.close for point in points if point.date == day)
            for amount, points in histories
        )
        for day in sorted(dates)
    )


def calculate_risk(
    holdings: list[HoldingInput], provider: MarketDataProvider
) -> RiskSummary:
    """Compute per-asset and portfolio-level risk metrics."""
    assets: list[AssetRisk] = []
    invested = [holding.amount * holding.purchase_value for holding in holdings]
    total_invested = sum(invested)
    sector_weights: dict[str, float] = {}
    successful_histories: list[tuple[int, tuple[PricePoint, ...]]] = []
    successful_invested = 0.0

    for holding, amount_invested in zip(holdings, invested, strict=False):
        sector = calculate_sector(holding, provider)
        sector_weights[sector] = sector_weights.get(sector, 0.0) + amount_invested
        try:
            points = provider.price_history(holding.symbol)
        except MarketDataError as exc:
            assets.append(
                AssetRisk(
                    symbol=holding.symbol,
                    volatility=0.0,
                    max_drawdown=0.0,
                    error=str(exc),
                )
            )
            continue
        closes = tuple(point.close for point in points)
        assets.append(
            AssetRisk(
                symbol=holding.symbol,
                volatility=annualised_volatility(closes),
                max_drawdown=max_drawdown(closes),
            )
        )
        successful_histories.append((holding.amount, points))
        successful_invested += amount_invested

    values = portfolio_values(successful_histories)
    available = len(values) >= 3
    return RiskSummary(
        volatility=annualised_volatility(values) if available else 0.0,
        max_drawdown=max_drawdown(values) if available else 0.0,
        available=available,
        diversification=diversification_score(sector_weights),
        coverage=successful_invested / total_invested if total_invested else 0.0,
        assets=assets,
    )
