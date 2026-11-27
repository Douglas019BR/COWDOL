"""Pydantic models describing the portfolio API contract."""

from datetime import date, datetime

from pydantic import AliasChoices, BaseModel, Field, field_validator


def parse_brazilian_date(value: object) -> date:
    """Parse an ISO or DD/MM/YYYY string into a date."""
    if isinstance(value, date):
        return value
    if isinstance(value, str):
        text = value.strip()
        try:
            return date.fromisoformat(text)
        except ValueError:
            return datetime.strptime(text, "%d/%m/%Y").date()
    raise ValueError("date must be a date, ISO string or DD/MM/YYYY string")


class HoldingInput(BaseModel):
    """One holding as read from an uploaded portfolio CSV."""

    symbol: str = Field(
        min_length=1,
        validation_alias=AliasChoices("symbol", "SYMBOL"),
    )
    amount: int = Field(
        gt=0,
        validation_alias=AliasChoices("amount", "AMOUNT"),
    )
    purchase_date: date = Field(
        validation_alias=AliasChoices("purchase_date", "PURCHASE_DATE"),
    )
    purchase_value: float = Field(
        gt=0,
        validation_alias=AliasChoices("purchase_value", "PURCHASE_VALUE"),
    )
    sector: str | None = Field(
        default=None,
        validation_alias=AliasChoices("sector", "SECTOR"),
    )

    @field_validator("purchase_date", mode="before")
    @classmethod
    def validate_purchase_date(cls, value: object) -> date:
        """Accept both ISO dates and the legacy DD/MM/YYYY format."""
        return parse_brazilian_date(value)


class HoldingResult(BaseModel):
    """Calculated result for one holding."""

    symbol: str
    amount: int
    purchase_total: float
    current_value: float
    value_difference: float
    total_dividends: float
    balance: float
    currency: str = "BRL"
    sector: str = "other"
    error: str | None = None


class PortfolioRequest(BaseModel):
    """Request body containing the holdings to analyse."""

    data: list[HoldingInput]


class PortfolioResponse(BaseModel):
    """Response body containing one result per holding."""

    holdings: list[HoldingResult]


class AssetRisk(BaseModel):
    """Risk metrics for one asset."""

    symbol: str
    volatility: float
    max_drawdown: float
    error: str | None = None


class RiskSummary(BaseModel):
    """Portfolio-level risk metrics."""

    volatility: float
    max_drawdown: float
    diversification: float
    assets: list[AssetRisk]
