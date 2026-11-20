"""Pydantic models describing the portfolio API contract."""

from datetime import date, datetime

from pydantic import AliasChoices, BaseModel, Field, field_validator


def parse_brazilian_date(value: object) -> date:
    """Parse a DD/MM/YYYY string into a date."""
    if isinstance(value, date):
        return value
    if isinstance(value, str):
        return datetime.strptime(value, "%d/%m/%Y").date()
    raise ValueError("date must be a date or a DD/MM/YYYY string")


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
    error: str | None = None


class PortfolioRequest(BaseModel):
    """Request body containing the holdings to analyse."""

    data: list[HoldingInput]


class PortfolioResponse(BaseModel):
    """Response body containing one result per holding."""

    holdings: list[HoldingResult]
