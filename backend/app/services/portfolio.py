"""Portfolio calculation logic."""

from app.models import HoldingInput, HoldingResult
from app.services.provider import MarketDataError, MarketDataProvider
from app.services.sectors import canonical_sector


def calculate_sector(holding: HoldingInput, provider: MarketDataProvider) -> str:
    """Resolve a sector from the CSV override or the provider."""
    try:
        return canonical_sector(holding.sector or provider.sector(holding.symbol))
    except MarketDataError:
        return "other"


def calculate_holding(
    holding: HoldingInput, provider: MarketDataProvider
) -> HoldingResult:
    """Calculate profit, dividends and balance for a single holding."""
    quote = provider.quote(holding.symbol)
    dividends = provider.dividends(holding.symbol, holding.purchase_date)
    total_dividends = sum(item.amount for item in dividends) * holding.amount
    current_value = quote.price * holding.amount
    purchase_total = holding.purchase_value * holding.amount
    value_difference = current_value - purchase_total
    sector = calculate_sector(holding, provider)
    return HoldingResult(
        symbol=holding.symbol,
        amount=holding.amount,
        purchase_total=round(purchase_total, 2),
        current_value=round(current_value, 2),
        value_difference=round(value_difference, 2),
        total_dividends=round(total_dividends, 2),
        balance=round(value_difference + total_dividends, 2),
        currency=quote.currency,
        sector=sector,
    )


def calculate_portfolio(
    holdings: list[HoldingInput], provider: MarketDataProvider
) -> list[HoldingResult]:
    """Calculate every holding, reporting provider errors per holding."""
    results: list[HoldingResult] = []
    for holding in holdings:
        try:
            results.append(calculate_holding(holding, provider))
        except MarketDataError as exc:
            results.append(
                HoldingResult(
                    symbol=holding.symbol,
                    amount=holding.amount,
                    purchase_total=round(holding.purchase_value * holding.amount, 2),
                    current_value=0.0,
                    value_difference=0.0,
                    total_dividends=0.0,
                    balance=0.0,
                    sector=canonical_sector(holding.sector),
                    error=str(exc),
                )
            )
    return results
