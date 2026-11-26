"""Deterministic scan of tracked files for obvious credentials."""

from __future__ import annotations

import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

PATTERNS = (
    ("private key", re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----")),
    ("aws access key", re.compile(r"AKIA[0-9A-Z]{16}")),
    ("github token", re.compile(r"gh[pousr]_[A-Za-z0-9]{36,}")),
    ("openai token", re.compile(r"sk-[A-Za-z0-9]{20,}")),
    (
        "secret assignment",
        re.compile(
            r"(?i)(secret|password|api[_-]?key|token)\s*[:=]\s*['\"][A-Za-z0-9_\-]{8,}['\"]"
        ),
    ),
)

ALLOWED = re.compile(r"(?i)(example|placeholder|dummy|sample|your[_-]?|test)")


def tracked_files() -> list[Path]:
    """Return text files tracked by git."""
    output = subprocess.check_output(
        ["git", "ls-files"], cwd=ROOT, text=True
    )
    return [
        ROOT / path
        for path in output.splitlines()
        if path
        and not path.startswith(("frontend/package-lock.json", "frontend/node_modules"))
    ]


def scan() -> list[str]:
    """Return human-readable findings."""
    findings: list[str] = []
    for path in tracked_files():
        if not path.is_file():
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        for line_number, line in enumerate(text.splitlines(), start=1):
            if ALLOWED.search(line):
                continue
            for name, pattern in PATTERNS:
                if pattern.search(line):
                    relative = path.relative_to(ROOT)
                    findings.append(f"{relative}:{line_number}: {name}")
    return findings


def main() -> int:
    """Print findings and return a process exit code."""
    findings = scan()
    if findings:
        print("Potential secrets found:")
        for finding in findings:
            print(f"  {finding}")
        return 1
    print("Secret scan: no findings")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
