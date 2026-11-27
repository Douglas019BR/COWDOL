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
            r"(?i)(?:api[_-]?key|secret|password|token)"
            r"[\"']?\s*[:=]\s*[\"']([^\"']{8,})[\"']"
        ),
    ),
    (
        "secret assignment",
        re.compile(
            r"(?i)(?:api[_-]?key|secret|password|token)"
            r"\s*[:=]\s*([A-Za-z0-9_\-/+]{8,})"
        ),
    ),
)

ALLOWED = re.compile(r"(?i)(example|placeholder|dummy|sample|your[_-]?|test)")


def tracked_files() -> list[Path]:
    """Return text files tracked by git, including unusual filenames."""
    output = subprocess.check_output(["git", "ls-files", "-z"], cwd=ROOT)
    return [
        ROOT / Path(path.decode("utf-8"))
        for path in output.split(b"\0")
        if path
        and not path.startswith(
            (b"frontend/package-lock.json", b"frontend/node_modules")
        )
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
            for name, pattern in PATTERNS:
                for match in pattern.finditer(line):
                    candidate = (
                        match.group(1) if match.groups() else match.group(0)
                    )
                    if ALLOWED.search(candidate):
                        continue
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
