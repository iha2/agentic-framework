/**
 * Deterministic scanner for invisible / smuggling Unicode in text ingested by humans and agents.
 * No network, no models: codepoint checks from patterns JSON.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseArgs } from "node:util";

export interface Rule {
  readonly ruleId: string;
  readonly start: number;
  readonly end: number;
  readonly title: string;
  readonly detail: string;
  readonly allowOnlyAtFileStart: boolean;
}

export interface PatternsFile {
  version?: number;
  extensions?: string[];
  exclude_path_substrings?: string[];
  rules?: Array<{
    id: string;
    start: number;
    end: number;
    title: string;
    detail: string;
    allow_only_at_file_start?: boolean;
  }>;
}

export function loadPatterns(patternsPath: string): {
  rules: Rule[];
  extensions: Set<string>;
  excludeSubstrings: string[];
} {
  const raw = JSON.parse(fs.readFileSync(patternsPath, "utf8")) as PatternsFile;
  const rules: Rule[] = (raw.rules ?? []).map((item) => ({
    ruleId: String(item.id),
    start: Number(item.start),
    end: Number(item.end),
    title: String(item.title),
    detail: String(item.detail),
    allowOnlyAtFileStart: Boolean(item.allow_only_at_file_start),
  }));
  const extensions = new Set(
    (raw.extensions ?? []).map((e) => e.toLowerCase()),
  );
  const excludeSubstrings = raw.exclude_path_substrings ?? [];
  return { rules, extensions, excludeSubstrings };
}

function matchRules(code: number, offset: number, rules: Iterable<Rule>): Rule[] {
  const matched: Rule[] = [];
  for (const r of rules) {
    if (r.start <= code && code <= r.end) {
      if (r.allowOnlyAtFileStart && offset === 0) {
        continue;
      }
      matched.push(r);
    }
  }
  return matched;
}

/** Each violation: line, column, codepoint, rule (line/column 1-based). */
export function scanText(text: string, rules: Iterable<Rule>): Array<[number, number, number, Rule]> {
  const violations: Array<[number, number, number, Rule]> = [];
  let line = 1;
  let col = 1;
  let cpOffset = 0;
  for (const ch of text) {
    const code = ch.codePointAt(0)!;
    for (const rule of matchRules(code, cpOffset, rules)) {
      violations.push([line, col, code, rule]);
    }
    if (ch === "\n") {
      line++;
      col = 1;
    } else if (ch === "\r") {
      /* keep column */
    } else {
      col++;
    }
    cpOffset++;
  }
  return violations;
}

export function formatViolation(
  filePath: string,
  line: number,
  column: number,
  code: number,
  rule: Rule,
): string {
  return `${filePath}:${line}:${column}: ${rule.ruleId} U+${code.toString(16).toUpperCase().padStart(4, "0")} (${rule.title}) — ${rule.detail}`;
}

function shouldScan(
  filePath: string,
  extensions: Set<string>,
  excludeSubstrings: string[],
): boolean {
  const normalized = filePath.split(path.sep).join("/");
  for (const frag of excludeSubstrings) {
    if (normalized.includes(frag)) {
      return false;
    }
  }
  const ext = path.extname(filePath).toLowerCase();
  return extensions.has(ext);
}

function* walkFiles(rootDir: string): Generator<string> {
  const entries = fs.readdirSync(rootDir, { withFileTypes: true });
  for (const ent of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(rootDir, ent.name);
    if (ent.isDirectory()) {
      yield* walkFiles(full);
    } else if (ent.isFile()) {
      yield full;
    }
  }
}

export function iterFiles(
  roots: string[],
  extensions: Set<string>,
  excludeSubstrings: string[],
): string[] {
  const out = new Set<string>();
  for (const root of roots) {
    const abs = path.resolve(root);
    if (!fs.existsSync(abs)) {
      continue;
    }
    const st = fs.statSync(abs);
    if (st.isFile()) {
      if (shouldScan(abs, extensions, excludeSubstrings)) {
        out.add(abs);
      }
    } else if (st.isDirectory()) {
      for (const f of walkFiles(abs)) {
        if (shouldScan(f, extensions, excludeSubstrings)) {
          out.add(f);
        }
      }
    }
  }
  return [...out].sort();
}

function readUtf8Strict(filePath: string): string | null {
  const buf = fs.readFileSync(filePath);
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buf);
  } catch {
    return null;
  }
}

export function defaultPatternsPath(): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  return path.join(here, "..", "patterns.default.json");
}

export function main(argv: string[]): number {
  const { values, positionals } = parseArgs({
    args: argv,
    options: {
      patterns: { type: "string", short: "p" },
    },
    allowPositionals: true,
  });

  const patternsPath = values.patterns ?? defaultPatternsPath();
  const { rules, extensions, excludeSubstrings } = loadPatterns(patternsPath);
  const roots = positionals.length > 0 ? positionals : ["."];

  const files = iterFiles(roots, extensions, excludeSubstrings);
  let exitCode = 0;

  for (const filePath of files) {
    const text = readUtf8Strict(filePath);
    if (text === null) {
      console.error(`${filePath}:0:0: invalid-utf8 — file is not valid UTF-8`);
      exitCode = 1;
      continue;
    }
    for (const [line, col, code, rule] of scanText(text, rules)) {
      console.error(formatViolation(filePath, line, col, code, rule));
      exitCode = 1;
    }
  }

  return exitCode;
}

function invokedAsCli(): boolean {
  const entry = process.argv[1];
  if (!entry) {
    return false;
  }
  return import.meta.url === pathToFileURL(path.resolve(entry)).href;
}

if (invokedAsCli()) {
  try {
    process.exit(main(process.argv.slice(2)));
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
