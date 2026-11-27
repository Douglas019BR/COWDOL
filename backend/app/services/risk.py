"""Risk metrics derived from daily price history."""

from __future__ import annotations

import math
from statistics import stdev

from app.models import AssetRisk, HoldingInput, RiskSummary
from app.services.portfolio import calculate_sector
from app.services.provider import MarketDataError, MarketDataProvider

TRADING_DAYS = 252


def daily_returns(prices: tuple[float, ...]) -> tuple[float, ...]:
    """Compute simple daily returns from closing prices."""
    return tuple(
        current / previous - 1
        for previous, current in zip(prices, prices[1:], strict=False)
        if previous > 0
    )


def annualised_volatility(prices: tuple[float, ...]) -> float:
    """Annualise the standard deviation of daily returns."""
    returns = daily_returns(prices)
    if len(returns) < 2:
        return 0.0
    return stdev(returns) * math.sqrt(TRADING_DAYS)


def max_drawdown(prices: tuple[float, ...]) -> float:
    """Return the worst peak-to-trough decline as a negative fraction."""
    if not prices:
        return 0.0
    peak = prices[0]
    worst = 0.0
    for price in prices:
        peak = max(peak, price)
        if peak > 0:
            worst = min(worst, price / peak - 1)
    return worst


def diversification_score(weights: dict[str, float]) -> float:
    """Return one minus the Herfindahl index of sector weights."""
    total = sum(weights.values())
    if total <= 0:
        return 0.0
    herfindahl = sum((weight / total) ** 2 for weight in weights.values())
    return 1 - herfindahl


def calculate_risk(
    holdings: list[HoldingInput], provider: MarketDataProvider
) -> RiskSummary:
    """Compute per-asset and portfolio-level risk metrics."""
    assets: list[AssetRisk] = []
    invested = [holding.amount * holding.purchase_value for holding in holdings]
    total_invested = sum(invested)
    sector_weights: dict[str, float] = {}

    for holding, amount_invested in zip(holdings, invested, strict=False):
        sector = calculate_sector(holding, provider)
        sector_weights[sector] = sector_weights.get(sector, 0.0) + amount_invested
        try:
            prices = provider.price_history(holding.symbol)
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
        assets.append(
            AssetRisk(
                symbol=holding.symbol,
                volatility=annualised_volatility(prices),
                max_drawdown=max_drawdown(prices),
            )
        )

    successful = [asset for asset in assets if not asset.error]
    portfolio_volatility = (
        sum(
            asset.volatility * weight / total_invested
            for asset, weight in zip(assets, invested, strict=False)
            if not asset.error
        )
        if total_invested > 0
        else 0.0
    )
    portfolio_drawdown = (
        min(asset.max_drawdown for asset in successful) if successful else 0.0
    )
    return RiskSummary(
        volatility=portfolio_volatility,
        max_drawdown=portfolio_drawdown,
        diversification=diversification_score(sector_weights),
        assets=assets,
    )
