"""Tests for the secret scan script."""

import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent))
import secret_scan  # noqa: E402


class SecretScanTests(unittest.TestCase):
    def scan_text(self, text: str) -> list[str]:
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "config.txt"
            path.write_text(text, encoding="utf-8")
            with (
                patch.object(secret_scan, "ROOT", Path(directory)),
                patch.object(secret_scan, "tracked_files", return_value=[path]),
            ):
                return secret_scan.scan()

    def test_detects_assignment_forms(self) -> None:
        value = "abcd" + "12345678"
        for line in (
            f'api_key = "{value}"',
            f"API_KEY={value}",
            f'{{"api_key": "{value}"}}',
        ):
            with self.subTest(line=line):
                findings = self.scan_text(line + "\n")
                self.assertTrue(
                    any("secret assignment" in item for item in findings)
                )

    def test_placeholder_values_are_allowed(self) -> None:
        findings = self.scan_text(
            'api_key = "your_api_key_here"  # test connection\n'
        )
        self.assertEqual(findings, [])


if __name__ == "__main__":
    unittest.main()
