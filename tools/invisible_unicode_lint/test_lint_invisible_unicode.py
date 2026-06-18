"""Unit tests for invisible Unicode lint (no malicious fixtures on disk)."""

import json
import sys
import unittest
from pathlib import Path

_ROOT = Path(__file__).resolve().parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from lint_invisible_unicode import Rule, format_violation, scan_text


class TestScan(unittest.TestCase):
    def test_clean_ascii(self) -> None:
        rules = [
            Rule("unicode-tags", 0xE0000, 0xE007F, "t", "d", False),
        ]
        self.assertEqual(scan_text("hello\n", rules), [])

    def test_tag_block_detected(self) -> None:
        rules = [
            Rule("unicode-tags", 0xE0000, 0xE007F, "Unicode tags", "detail", False),
        ]
        hidden = "".join(chr(0xE0000 + ord(c)) for c in "RUN")
        text = "visible" + hidden
        v = scan_text(text, rules)
        self.assertEqual(len(v), 3)
        self.assertTrue(all(r.rule_id == "unicode-tags" for *_, r in v))

    def test_bom_allowed_only_at_start(self) -> None:
        rules = [
            Rule("bom", 0xFEFF, 0xFEFF, "BOM", "d", allow_only_at_file_start=True),
        ]
        self.assertEqual(scan_text("\ufeffok", rules), [])
        v = scan_text("x\ufeffy", rules)
        self.assertEqual(len(v), 1)

    def test_default_patterns_json_loads(self) -> None:
        p = Path(__file__).resolve().parent / "patterns.default.json"
        data = json.loads(p.read_text(encoding="utf-8"))
        self.assertIn("rules", data)
        self.assertGreaterEqual(len(data["rules"]), 5)

    def test_format_violation(self) -> None:
        r = Rule("x", 1, 2, "title", "detail", False)
        s = format_violation(Path("a.md"), 3, 4, 0x202E, r)
        self.assertIn("a.md:3:4:", s)
        self.assertIn("U+202E", s)


if __name__ == "__main__":
    unittest.main()
