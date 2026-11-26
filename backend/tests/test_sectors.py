"""Unit tests for sector classification."""

from app.services.sectors import (
    canonical_sector,
    normalize_symbol,
    sector_from_static_map,
)


def test_normalize_symbol_strips_exchange_suffix() -> None:
    assert normalize_symbol("bbse3.sa") == "BBSE3"
    assert normalize_symbol(" TAEE11.SA ") == "TAEE11"


def test_static_map_covers_known_b3_tickers() -> None:
    assert sector_from_static_map("PETR4.sa") == "energy"
    assert sector_from_static_map("TAEE11.sa") == "utilities"
    assert sector_from_static_map("UNKNOWN.sa") is None


def test_canonical_sector_accepts_keys_and_english_labels() -> None:
    assert canonical_sector("real_estate") == "real_estate"
    assert canonical_sector("Financial Services") == "financial"
    assert canonical_sector("Healthcare") == "health"
    assert canonical_sector("something new") == "other"
    assert canonical_sector(None) == "other"
