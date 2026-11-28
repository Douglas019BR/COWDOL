"""FastAPI application for COWDOL."""

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app import db
from app.config import get_settings
from app.models import (
    PortfolioRequest,
    PortfolioResponse,
    PortfolioSaveRequest,
    RiskSummary,
    SavedPortfolio,
    SavedPortfolioSummary,
)
from app.services.portfolio import calculate_portfolio
from app.services.provider import MarketDataProvider, YahooFinanceProvider
from app.services.risk import calculate_risk

settings = get_settings()
app = FastAPI(title="COWDOL API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.cors_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


_provider = YahooFinanceProvider(settings.cache_ttl_seconds)


def get_provider() -> MarketDataProvider:
    """Provide a shared, cached market data provider."""
    return _provider


@app.get("/health")
def health() -> dict[str, str]:
    """Report service availability."""
    return {"status": "ok"}


@app.get("/hello-world")
def hello_world() -> dict[str, str]:
    """Legacy smoke-test endpoint."""
    return {"message": "Hello World"}


@app.post("/profit-calculate", response_model=PortfolioResponse)
def profit_calculate(
    request: PortfolioRequest,
    provider: MarketDataProvider = Depends(get_provider),
) -> PortfolioResponse:
    """Calculate results for every holding in the uploaded portfolio."""
    return PortfolioResponse(holdings=calculate_portfolio(request.data, provider))


@app.post("/risk-metrics", response_model=RiskSummary)
def risk_metrics(
    request: PortfolioRequest,
    provider: MarketDataProvider = Depends(get_provider),
) -> RiskSummary:
    """Calculate volatility, drawdown and diversification for a portfolio."""
    return calculate_risk(request.data, provider)


@app.post("/portfolios", response_model=SavedPortfolioSummary, status_code=201)
def save_portfolio(request: PortfolioSaveRequest) -> SavedPortfolioSummary:
    """Persist a portfolio with its latest analysis."""
    saved = db.load_portfolio(db.save_portfolio(request.model_dump(mode="json")))
    assert saved is not None
    return SavedPortfolioSummary(
        id=saved["id"], name=saved["name"], created_at=saved["created_at"]
    )


@app.get("/portfolios", response_model=list[SavedPortfolioSummary])
def list_portfolios() -> list[SavedPortfolioSummary]:
    """List saved portfolios."""
    return [SavedPortfolioSummary(**item) for item in db.list_portfolios()]


@app.get("/portfolios/{portfolio_id}", response_model=SavedPortfolio)
def get_portfolio(portfolio_id: str) -> SavedPortfolio:
    """Load one saved portfolio."""
    saved = db.load_portfolio(portfolio_id)
    if saved is None:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return SavedPortfolio(**saved)


@app.delete("/portfolios/{portfolio_id}")
def delete_portfolio(portfolio_id: str) -> dict[str, bool]:
    """Delete one saved portfolio."""
    if not db.delete_portfolio(portfolio_id):
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return {"deleted": True}
