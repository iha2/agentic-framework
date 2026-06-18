import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  formatViolation,
  loadPatterns,
  scanText,
  type Rule,
} from "./lint-invisible-unicode.js";

const here = dirname(fileURLToPath(import.meta.url));
const patternsPath = join(here, "..", "patterns.default.json");

describe("scanText", () => {
  it("allows clean ASCII", () => {
    const rules: Rule[] = [
      {
        ruleId: "unicode-tags",
        start: 0xe0000,
        end: 0xe007f,
        title: "t",
        detail: "d",
        allowOnlyAtFileStart: false,
      },
    ];
    assert.deepEqual(scanText("hello\n", rules), []);
  });

  it("detects Unicode tag block", () => {
    const rules: Rule[] = [
      {
        ruleId: "unicode-tags",
        start: 0xe0000,
        end: 0xe007f,
        title: "Unicode tags",
        detail: "detail",
        allowOnlyAtFileStart: false,
      },
    ];
    const hidden = Array.from("RUN", (c) =>
      String.fromCodePoint(0xe0000 + c.codePointAt(0)!),
    ).join("");
    const v = scanText(`visible${hidden}`, rules);
    assert.equal(v.length, 3);
    assert.ok(v.every(([, , , r]) => r.ruleId === "unicode-tags"));
  });

  it("allows BOM only at file start", () => {
    const rules: Rule[] = [
      {
        ruleId: "bom",
        start: 0xfeff,
        end: 0xfeff,
        title: "BOM",
        detail: "d",
        allowOnlyAtFileStart: true,
      },
    ];
    assert.deepEqual(scanText("\ufeffok", rules), []);
    const v = scanText("x\ufeffy", rules);
    assert.equal(v.length, 1);
  });
});

describe("patterns.default.json", () => {
  it("loads", () => {
    const raw = JSON.parse(readFileSync(patternsPath, "utf8")) as { rules: unknown[] };
    assert.ok(Array.isArray(raw.rules));
    assert.ok(raw.rules.length >= 5);
  });

  it("loadPatterns parses rules", () => {
    const { rules } = loadPatterns(patternsPath);
    assert.ok(rules.length >= 5);
  });
});

describe("formatViolation", () => {
  it("includes path and codepoint", () => {
    const r: Rule = {
      ruleId: "x",
      start: 1,
      end: 2,
      title: "title",
      detail: "detail",
      allowOnlyAtFileStart: false,
    };
    const s = formatViolation("a.md", 3, 4, 0x202e, r);
    assert.match(s, /a\.md:3:4:/);
    assert.match(s, /U\+202E/);
  });
});
