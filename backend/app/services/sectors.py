"""Sector classification for Brazilian listed assets."""

SECTOR_KEYS = frozenset(
    {
        "financial",
        "energy",
        "materials",
        "health",
        "utilities",
        "real_estate",
        "industrials",
        "consumer",
        "technology",
        "communication",
        "other",
    }
)

STATIC_SECTORS = {
    "BBSE3": "financial",
    "ISAE4": "financial",
    "ITUB4": "financial",
    "BBDC4": "financial",
    "B3SA3": "financial",
    "PETR4": "energy",
    "PETR3": "energy",
    "VALE3": "materials",
    "VALE5": "materials",
    "GMAT3": "consumer",
    "TAEE11": "utilities",
    "ECOR3": "utilities",
    "CDII11": "real_estate",
    "PATL11": "real_estate",
    "TVRI11": "real_estate",
    "NIKE34": "consumer",
    "NVDC34": "technology",
    "WEGE3": "industrials",
}

ENGLISH_SECTORS = {
    "financial services": "financial",
    "energy": "energy",
    "basic materials": "materials",
    "healthcare": "health",
    "utilities": "utilities",
    "real estate": "real_estate",
    "industrials": "industrials",
    "consumer cyclical": "consumer",
    "consumer defensive": "consumer",
    "technology": "technology",
    "communication services": "communication",
}


def normalize_symbol(symbol: str) -> str:
    """Return the ticker root without exchange suffix or case."""
    return symbol.split(".")[0].strip().upper()


def canonical_sector(value: str | None) -> str:
    """Map a raw sector label to a canonical key."""
    if not value:
        return "other"
    normalized = value.strip().lower().replace(" ", "_")
    if normalized in SECTOR_KEYS:
        return normalized
    return ENGLISH_SECTORS.get(value.strip().lower(), "other")


def sector_from_static_map(symbol: str) -> str | None:
    """Return a known sector for a ticker, if one is configured."""
    return STATIC_SECTORS.get(normalize_symbol(symbol))
