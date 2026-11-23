"""FastAPI application for COWDOL."""

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.models import PortfolioRequest, PortfolioResponse
from app.services.portfolio import calculate_portfolio
from app.services.provider import MarketDataProvider, YahooFinanceProvider

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
