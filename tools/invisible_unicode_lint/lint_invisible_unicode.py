#!/usr/bin/env python3
"""
Deterministic scanner for invisible / smuggling Unicode in text ingested by humans and agents.

No network, no models: pure codepoint checks loaded from patterns JSON.
"""

from __future__ import annotations

import argparse
import json
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable, Optional, Sequence


@dataclass(frozen=True)
class Rule:
    rule_id: str
    start: int
    end: int
    title: str
    detail: str
    allow_only_at_file_start: bool


def _load_patterns(path: Path) -> dict[str, Any]:
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def _parse_rules(raw: dict[str, Any]) -> list[Rule]:
    out: list[Rule] = []
    for item in raw.get("rules", []):
        out.append(
            Rule(
                rule_id=str(item["id"]),
                start=int(item["start"]),
                end=int(item["end"]),
                title=str(item["title"]),
                detail=str(item["detail"]),
                allow_only_at_file_start=bool(item.get("allow_only_at_file_start", False)),
            )
        )
    return out


def _match_rules(code: int, offset: int, rules: Iterable[Rule]) -> list[Rule]:
    matched: list[Rule] = []
    for r in rules:
        if r.start <= code <= r.end:
            if r.allow_only_at_file_start and offset == 0:
                continue
            matched.append(r)
    return matched


def scan_text(text: str, rules: Iterable[Rule]) -> list[tuple[int, int, int, Rule]]:
    """
    Returns list of (line, column, codepoint, rule) for each violation.
    Line and column are 1-based.
    """
    violations: list[tuple[int, int, int, Rule]] = []
    line = 1
    col = 1
    for offset, ch in enumerate(text):
        o = ord(ch)
        for rule in _match_rules(o, offset, rules):
            violations.append((line, col, o, rule))
        if ch == "\n":
            line += 1
            col = 1
        elif ch == "\r":
            pass
        else:
            col += 1
    return violations


def _should_scan(path: Path, extensions: set[str], exclude_substrings: tuple[str, ...]) -> bool:
    s = str(path)
    for frag in exclude_substrings:
        if frag in s.replace("\\", "/"):
            return False
    return path.suffix.lower() in extensions


def iter_files(paths: list[Path], extensions: set[str], exclude_substrings: tuple[str, ...]) -> list[Path]:
    files: list[Path] = []
    for p in paths:
        if p.is_file():
            if _should_scan(p, extensions, exclude_substrings):
                files.append(p)
        elif p.is_dir():
            for child in sorted(p.rglob("*")):
                if child.is_file() and _should_scan(child, extensions, exclude_substrings):
                    files.append(child)
    return sorted(set(files))


def format_violation(path: Path, line: int, col: int, code: int, rule: Rule) -> str:
    return (
        f"{path}:{line}:{col}: {rule.rule_id} U+{code:04X} ({rule.title}) — {rule.detail}"
    )


def main(argv: Optional[Sequence[str]] = None) -> int:
    parser = argparse.ArgumentParser(
        description="Fail if files contain high-risk invisible / bidi smuggling Unicode.",
    )
    parser.add_argument(
        "paths",
        nargs="*",
        default=["."],
        help="Files or directories to scan (default: .)",
    )
    parser.add_argument(
        "--patterns",
        type=Path,
        default=Path(__file__).resolve().parent / "patterns.default.json",
        help="JSON rule file (default: packaged patterns.default.json)",
    )
    args = parser.parse_args(argv)

    raw = _load_patterns(args.patterns)
    rules = _parse_rules(raw)
    extensions = {e.lower() for e in raw.get("extensions", [])}
    exclude_substrings = tuple(raw.get("exclude_path_substrings", []))

    paths = [Path(p) for p in args.paths]
    files = iter_files(paths, extensions, exclude_substrings)

    exit_code = 0
    for path in files:
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError as e:
            print(f"{path}:0:0: invalid-utf8 — file is not valid UTF-8 ({e})", file=sys.stderr)
            exit_code = 1
            continue
        for line, col, code, rule in scan_text(text, rules):
            print(format_violation(path, line, col, code, rule), file=sys.stderr)
            exit_code = 1

    return exit_code


if __name__ == "__main__":
    raise SystemExit(main())
