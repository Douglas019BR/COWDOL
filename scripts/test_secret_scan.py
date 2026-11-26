"""Tests for the secret scan script."""

import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent))
import secret_scan  # noqa: E402


class SecretScanTests(unittest.TestCase):
    def test_detects_a_hardcoded_secret(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "config.py"
            path.write_text('api_key = "abcdefgh12345678"\n', encoding="utf-8")
            with (
                patch.object(secret_scan, "ROOT", Path(directory)),
                patch.object(secret_scan, "tracked_files", return_value=[path]),
            ):
                findings = secret_scan.scan()
        self.assertTrue(any("secret assignment" in item for item in findings))

    def test_allows_placeholder_values(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / ".env.example"
            path.write_text(
                'api_key = "your_api_key_here"\n', encoding="utf-8"
            )
            with (
                patch.object(secret_scan, "ROOT", Path(directory)),
                patch.object(secret_scan, "tracked_files", return_value=[path]),
            ):
                findings = secret_scan.scan()
        self.assertEqual(findings, [])


if __name__ == "__main__":
    unittest.main()
