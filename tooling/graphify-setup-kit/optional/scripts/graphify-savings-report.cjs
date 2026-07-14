#!/usr/bin/env node
/**
 * Runs `graphify benchmark`, parses token reduction vs naive full-corpus read,
 * appends one JSON line per run to reports/graphify/history.ndjson, and prints
 * tables grouped by calendar date (local timezone).
 *
 * Dollar figures are illustrative: set GRAPHIFY_PRICE_INPUT_PER_MTOK (USD per
 * 1M input tokens used for both naive and graphify context estimates).
 *
 * Usage: node scripts/graphify-savings-report.cjs [--no-save] [--graph path/to/graph.json]
 * Writes reports/graphify/latest-report.md and latest-report.html (unless --no-save).
 * See docs/misc/graphify-local.md (this script and reports/ are gitignored in this repo).
 */
"use strict";

const { mkdirSync, appendFileSync, readFileSync, existsSync, writeFileSync } = require("node:fs");
const { execFileSync } = require("node:child_process");
const path = require("node:path");

const REPO_ROOT = path.resolve(__dirname, "..");
const REPORT_DIR = path.join(REPO_ROOT, "reports", "graphify");
const HISTORY_PATH = path.join(REPORT_DIR, "history.ndjson");
const LATEST_MD = path.join(REPORT_DIR, "latest-report.md");
const LATEST_HTML = path.join(REPORT_DIR, "latest-report.html");

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function localYmd(ts = Date.now()) {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function num(s) {
  return Number(String(s).replace(/,/g, ""));
}

function parseBenchmark(stdout) {
  const corpusWords = stdout.match(/Corpus:\s+([\d,]+)\s+words/);
  const corpusTokens = stdout.match(/~\s*([\d,]+)\s+tokens\s*\(naive\)/);
  const graphLine = stdout.match(/Graph:\s+([\d,]+)\s+nodes,\s+([\d,]+)\s+edges/);
  const avgQuery = stdout.match(/Avg query cost:\s+~\s*([\d,]+)\s+tokens/);
  const reduction = stdout.match(/Reduction:\s+([\d.]+)x/);
  if (!corpusWords || !corpusTokens || !graphLine || !avgQuery || !reduction) {
    throw new Error(
      "Could not parse graphify benchmark output. Is graphify on PATH and graph.json valid?",
    );
  }
  return {
    corpus_words: num(corpusWords[1]),
    corpus_tokens: num(corpusTokens[1]),
    graph_nodes: num(graphLine[1]),
    graph_edges: num(graphLine[2]),
    avg_query_tokens: num(avgQuery[1]),
    reduction_ratio: Number(reduction[1]),
  };
}

function money(n) {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 4 });
}

function runBenchmark(graphRel) {
  const graphPath = path.isAbsolute(graphRel) ? graphRel : path.join(REPO_ROOT, graphRel);
  const out = execFileSync("graphify", ["benchmark", graphPath], {
    cwd: REPO_ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 10 * 1024 * 1024,
  });
  return parseBenchmark(out);
}

function loadHistory() {
  if (!existsSync(HISTORY_PATH)) return [];
  const lines = readFileSync(HISTORY_PATH, "utf8").trim().split(/\n+/).filter(Boolean);
  const rows = [];
  for (const line of lines) {
    try {
      rows.push(JSON.parse(line));
    } catch {
      // skip bad lines
    }
  }
  return rows;
}

function aggregateByDate(rows) {
  /** @type {Map<string, typeof rows>} */
  const m = new Map();
  for (const r of rows) {
    const d = r.date || localYmd(new Date(r.timestamp).getTime());
    if (!m.has(d)) m.set(d, []);
    m.get(d).push(r);
  }
  return [...m.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
}

function avg(arr, key) {
  const xs = arr.map((r) => r[key]).filter((x) => typeof x === "number" && Number.isFinite(x));
  if (!xs.length) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

/** Markdown appendix: table/column definitions + ideas for extending the report. */
function definitionsMarkdownAppendix() {
  return `## Definitions and column keys

### Table: **This run**

Two columns:

| Column | Definition |
|--------|------------|
| **Metric** | Name of the quantity being reported for the benchmark that just ran. |
| **Value** | The measured or derived amount for this run (same units as the metric name). |

Row meanings (**Metric** → **Value**):

| Metric | Definition |
|--------|------------|
| **Corpus (naive)** | Words and **estimated tokens** if you sent the **entire indexed corpus** as model context in one shot. Comes from \`graphify benchmark\` (word count and the same token heuristic Graphify uses for “naive” reads). |
| **Graph** | **Nodes** and **edges** in \`graph.json\` at benchmark time (structure of the knowledge graph). |
| **Avg query context** | **Average estimated tokens** across Graphify’s **fixed sample questions** when their BFS subgraphs are materialized as context (still from \`graphify benchmark\`). |
| **Reduction** | **corpus_tokens ÷ avg_query_tokens** — how many times smaller the graph-backed context is than the naive full-corpus read, for that benchmark. |
| **Est. $ naive read / query** | \`(corpus_tokens / 1e6) × GRAPHIFY_PRICE_INPUT_PER_MTOK\` — **illustrative** USD to “read” the naive corpus once at your configured input price. |
| **Est. $ graphify read / query** | \`(avg_query_tokens / 1e6) × GRAPHIFY_PRICE_INPUT_PER_MTOK\` — same price knob, applied to the average subgraph size. |
| **Est. $ saved / query** | **Naive $ minus Graphify $** for one representative query at that price; does **not** include output tokens, tools, or caching. |

### Table: **By date — rollup** (one row per calendar day)

| Column | Definition |
|--------|------------|
| **Runs** | Number of times the savings report script was executed **and saved** a row for that **local calendar date** (see \`history.ndjson\`). |
| **Avg corpus tok** | Mean of **corpus_tokens** across those runs (naive token estimate per run). |
| **Avg query tok** | Mean of **avg_query_tokens** across runs. |
| **Avg reduction** | Mean of **reduction_ratio** across runs. |
| **Sum saved $/query** | **Sum** of each run’s **Est. $ saved / query** (additive across runs; useful as a rough “ledger” of benchmarked savings, not wall-clock spend). |
| **Avg saved $/query** | **Sum saved** ÷ **Runs** — average dollar delta per saved benchmark row. |

### Table: **By date — detail** (one row per saved run)

| Column | Definition |
|--------|------------|
| **Time (UTC)** | **\`timestamp\`** when the script appended this record (ISO-8601, UTC). |
| **Corpus tok** | **\`corpus_tokens\`** from that benchmark (naive full-corpus token estimate). |
| **Query tok** | **\`avg_query_tokens\`** for that benchmark (average subgraph context size). |
| **Reduction** | **\`reduction_ratio\`** for that benchmark. |
| **Saved $/query** | **\`usd_saved_per_query_estimate\`** stored for that run (same formula as “Est. $ saved / query” above). |

### Ideas for additional reporting (not implemented here)

- **Output + reasoning tokens**: add a second price (e.g. $/1M output) and assume a token split per “answer” if you log real completions.
- **Per-question breakdown**: \`graphify benchmark\` already prints per-question multipliers; capture and store them in JSON for variance / min–max.
- **Git + scope metadata**: record \`git rev-parse HEAD\`, \`graph_path\`, and whether \`.graphifyignore\` narrowed the corpus so trends are comparable across refactors.
- **Wall-clock $**: multiply by **queries per day** from your agent or IDE logs to turn “per query” into “per day” estimates.
- **Provider list prices**: load a small YAML of model tiers instead of a single \`GRAPHIFY_PRICE_INPUT_PER_MTOK\`.
- **Export**: append the same row to CSV for spreadsheets, or emit a monthly \`.md\` rollup from \`history.ndjson\`.

`;
}

/** HTML appendix matching {@link definitionsMarkdownAppendix} (static prose). */
function definitionsHtmlAppendix() {
  return `<section class="glossary" id="definitions">
  <h2>Definitions and column keys</h2>

  <h3>Table: <strong>This run</strong></h3>
  <p>Two columns: <strong>Metric</strong> (name of the quantity) and <strong>Value</strong> (the amount for this benchmark run).</p>
  <table class="defkey"><thead><tr><th>Metric</th><th>Definition</th></tr></thead><tbody>
    <tr><th scope="row">Corpus (naive)</th><td>Words and estimated tokens if the entire indexed corpus were sent as one model context. From <code>graphify benchmark</code>.</td></tr>
    <tr><th scope="row">Graph</th><td>Node and edge counts in <code>graph.json</code> at benchmark time.</td></tr>
    <tr><th scope="row">Avg query context</th><td>Average estimated tokens for Graphify’s fixed sample questions when BFS subgraphs are materialized as context.</td></tr>
    <tr><th scope="row">Reduction</th><td><code>corpus_tokens ÷ avg_query_tokens</code> for this run.</td></tr>
    <tr><th scope="row">Est. $ naive read / query</th><td><code>(corpus_tokens / 1e6) × GRAPHIFY_PRICE_INPUT_PER_MTOK</code> — illustrative input-only USD.</td></tr>
    <tr><th scope="row">Est. $ graphify read / query</th><td><code>(avg_query_tokens / 1e6) × GRAPHIFY_PRICE_INPUT_PER_MTOK</code>.</td></tr>
    <tr><th scope="row">Est. $ saved / query</th><td>Naive $ minus Graphify $ for one query at that price; excludes output tokens, tools, and caching.</td></tr>
  </tbody></table>

  <h3>Table: <strong>By date — rollup</strong> (one row per calendar day)</h3>
  <table class="defkey"><thead><tr><th>Column</th><th>Definition</th></tr></thead><tbody>
    <tr><th scope="row">Runs</th><td>Number of saved report runs (same script) on that local calendar date.</td></tr>
    <tr><th scope="row">Avg corpus tok</th><td>Mean <code>corpus_tokens</code> across those runs.</td></tr>
    <tr><th scope="row">Avg query tok</th><td>Mean <code>avg_query_tokens</code> across runs.</td></tr>
    <tr><th scope="row">Avg reduction</th><td>Mean <code>reduction_ratio</code> across runs.</td></tr>
    <tr><th scope="row">Sum saved $/query</th><td>Sum of each run’s saved-$ estimate (additive benchmark ledger, not wall-clock spend).</td></tr>
    <tr><th scope="row">Avg saved $/query</th><td>Sum saved ÷ Runs.</td></tr>
  </tbody></table>

  <h3>Table: <strong>By date — detail</strong> (one row per saved run)</h3>
  <table class="defkey"><thead><tr><th>Column</th><th>Definition</th></tr></thead><tbody>
    <tr><th scope="row">Time (UTC)</th><td>ISO timestamp when the record was appended (<code>timestamp</code>).</td></tr>
    <tr><th scope="row">Corpus tok</th><td><code>corpus_tokens</code> for that run.</td></tr>
    <tr><th scope="row">Query tok</th><td><code>avg_query_tokens</code> for that run.</td></tr>
    <tr><th scope="row">Reduction</th><td><code>reduction_ratio</code> for that run.</td></tr>
    <tr><th scope="row">Saved $/query</th><td><code>usd_saved_per_query_estimate</code> for that run.</td></tr>
  </tbody></table>

  <h3>Ideas for additional reporting</h3>
  <ul class="ideas">
    <li><strong>Output + reasoning tokens</strong>: add output $/1M and an assumed split per answer if you log real completions.</li>
    <li><strong>Per-question breakdown</strong>: persist per-question token counts from <code>graphify benchmark</code> for variance and min–max.</li>
    <li><strong>Git + scope metadata</strong>: store <code>HEAD</code>, graph path, and whether <code>.graphifyignore</code> narrowed the corpus.</li>
    <li><strong>Wall-clock $</strong>: multiply per-query estimates by measured queries/day from agent or IDE logs.</li>
    <li><strong>Provider tiers</strong>: YAML of model prices instead of a single env var.</li>
    <li><strong>Export</strong>: CSV append or monthly Markdown rollup from <code>history.ndjson</code>.</li>
  </ul>
</section>`;
}

/**
 * @param {object} opts
 * @param {string} opts.ts
 * @param {string} opts.date
 * @param {string} opts.pricingNote
 * @param {ReturnType<typeof parseBenchmark>} opts.parsed
 * @param {number} opts.naiveUsd
 * @param {number} opts.graphifyUsd
 * @param {number} opts.savedUsd
 * @param {ReturnType<typeof aggregateByDate>} opts.byDate
 */
function buildHtml(opts) {
  const { ts, date, pricingNote, parsed, naiveUsd, graphifyUsd, savedUsd, byDate } = opts;
  const rowsThisRun = `<tr><th scope="row">Corpus (naive)</th><td>${escapeHtml(
    `${parsed.corpus_words.toLocaleString()} words → ~${parsed.corpus_tokens.toLocaleString()} tokens`,
  )}</td></tr>
<tr><th scope="row">Graph</th><td>${escapeHtml(
    `${parsed.graph_nodes.toLocaleString()} nodes, ${parsed.graph_edges.toLocaleString()} edges`,
  )}</td></tr>
<tr><th scope="row">Avg query context</th><td>${escapeHtml(`~${parsed.avg_query_tokens.toLocaleString()} tokens`)}</td></tr>
<tr><th scope="row">Reduction</th><td><strong>${escapeHtml(String(parsed.reduction_ratio))}x</strong></td></tr>
<tr><th scope="row">Est. $ naive read / query</th><td>${escapeHtml(money(naiveUsd))}</td></tr>
<tr><th scope="row">Est. $ graphify read / query</th><td>${escapeHtml(money(graphifyUsd))}</td></tr>
<tr><th scope="row">Est. $ saved / query</th><td><strong>${escapeHtml(money(savedUsd))}</strong></td></tr>`;

  let dateSections = "";
  for (const [d, runs] of byDate) {
    const n = runs.length;
    const aCorpus = Math.round(avg(runs, "corpus_tokens"));
    const aQuery = Math.round(avg(runs, "avg_query_tokens"));
    const aRed = round1(avg(runs, "reduction_ratio"));
    const sumSaved = runs.reduce((s, r) => s + (numish(r.usd_saved_per_query_estimate) || 0), 0);
    const avgSaved = sumSaved / n;
    dateSections += `<section class="day"><h2>${escapeHtml(d)} <span class="meta">(${n} run${n === 1 ? "" : "s"})</span></h2>`;
    dateSections += `<table class="rollup"><thead><tr><th>Runs</th><th>Avg corpus tok</th><th>Avg query tok</th><th>Avg reduction</th><th>Sum saved $/query</th><th>Avg saved $/query</th></tr></thead><tbody>`;
    dateSections += `<tr><td>${n}</td><td>${aCorpus.toLocaleString()}</td><td>${aQuery.toLocaleString()}</td><td>${aRed}x</td><td>${escapeHtml(money(sumSaved))}</td><td>${escapeHtml(money(avgSaved))}</td></tr></tbody></table>`;
    dateSections += `<table class="detail"><thead><tr><th>Time (UTC)</th><th>Corpus tok</th><th>Query tok</th><th>Reduction</th><th>Saved $/query</th></tr></thead><tbody>`;
    for (const r of [...runs].sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp)))) {
      dateSections += `<tr><td><code>${escapeHtml(r.timestamp)}</code></td><td>${Number(r.corpus_tokens).toLocaleString()}</td><td>${Number(r.avg_query_tokens).toLocaleString()}</td><td>${r.reduction_ratio}x</td><td>${escapeHtml(money(numish(r.usd_saved_per_query_estimate)))}</td></tr>`;
    }
    dateSections += `</tbody></table></section>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Graphify token savings</title>
  <style>
    :root { color-scheme: light dark; --bg: #0f1115; --fg: #e8eaed; --muted: #9aa0a6; --border: #30363d; --accent: #58a6ff; --card: #161b22; }
    @media (prefers-color-scheme: light) {
      :root { --bg: #f6f8fa; --fg: #1f2328; --muted: #59636e; --border: #d1d9e0; --accent: #0969da; --card: #ffffff; }
    }
    * { box-sizing: border-box; }
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; margin: 0; padding: 24px; background: var(--bg); color: var(--fg); line-height: 1.5; }
    header { max-width: 960px; margin: 0 auto 24px; }
    h1 { font-size: 1.35rem; font-weight: 600; margin: 0 0 8px; }
    .stamp { color: var(--muted); font-size: 0.9rem; }
    .note { max-width: 960px; margin: 0 auto 20px; padding: 12px 14px; background: var(--card); border: 1px solid var(--border); border-radius: 8px; color: var(--muted); font-size: 0.9rem; }
    .method { max-width: 960px; margin: 0 auto 24px; color: var(--muted); font-size: 0.9rem; }
    main { max-width: 960px; margin: 0 auto; }
    h2 { font-size: 1.1rem; margin: 28px 0 12px; border-bottom: 1px solid var(--border); padding-bottom: 6px; }
    h2 .meta { font-weight: 400; color: var(--muted); font-size: 0.95rem; }
    table { width: 100%; border-collapse: collapse; font-size: 0.9rem; margin-bottom: 16px; background: var(--card); border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
    th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid var(--border); }
    thead th { background: rgba(88, 166, 255, 0.08); font-weight: 600; color: var(--fg); }
    tbody tr:last-child th, tbody tr:last-child td { border-bottom: none; }
    th[scope="row"] { width: 38%; color: var(--muted); font-weight: 500; }
    .rollup td, .rollup th { text-align: right; }
    .rollup td:first-child, .rollup th:first-child { text-align: left; }
    .detail code { font-size: 0.8rem; }
    section.day { margin-bottom: 32px; }
    footer { max-width: 960px; margin: 32px auto 0; padding-top: 16px; border-top: 1px solid var(--border); color: var(--muted); font-size: 0.8rem; }
    section.glossary { margin-top: 40px; padding-top: 24px; border-top: 1px solid var(--border); }
    section.glossary h3 { margin-top: 20px; font-size: 1rem; }
    section.glossary p { color: var(--muted); font-size: 0.9rem; max-width: 960px; }
    table.defkey th[scope="row"] { width: 28%; }
    ul.ideas { max-width: 960px; margin: 0 auto 0 1.25rem; color: var(--muted); font-size: 0.9rem; }
    ul.ideas li { margin-bottom: 8px; }
  </style>
</head>
<body>
  <header>
    <h1>Graphify token savings</h1>
    <p class="stamp">Generated <strong>${escapeHtml(ts)}</strong> · local date <strong>${escapeHtml(date)}</strong></p>
  </header>
  <p class="note">${escapeHtml(pricingNote)}</p>
  <p class="method">Method: same estimates as <code>graphify benchmark</code> — naive full-corpus tokens vs average tokens for fixed sample subgraph queries. See <a href="#definitions">Definitions and column keys</a> at the bottom for every table and column.</p>
  <main>
    <h2>This run</h2>
    <table><tbody>${rowsThisRun}</tbody></table>
    <h2>By date (all saved runs)</h2>
    ${dateSections}
    ${definitionsHtmlAppendix()}
  </main>
  <footer>Open <code>reports/graphify/latest-report.html</code> in a browser. Regenerate with <code>node scripts/graphify-savings-report.cjs</code> (local-only script).</footer>
</body>
</html>`;
}

function main() {
  const argv = process.argv.slice(2);
  const noSave = argv.includes("--no-save");
  let graphArg = "graphify-out/graph.json";
  const gi = argv.indexOf("--graph");
  if (gi !== -1 && argv[gi + 1]) graphArg = argv[gi + 1];

  const inputPerMtok = Number(process.env.GRAPHIFY_PRICE_INPUT_PER_MTOK ?? "3");
  const pricingNote =
    process.env.GRAPHIFY_PRICING_NOTE ||
    `Illustrative input pricing: $${inputPerMtok}/1M tokens (override GRAPHIFY_PRICE_INPUT_PER_MTOK). Does not include output tokens or your provider’s batch discounts.`;

  let parsed;
  try {
    parsed = runBenchmark(graphArg);
  } catch (e) {
    console.error(e.message || e);
    process.exit(1);
  }

  const ts = new Date().toISOString();
  const date = localYmd();
  const naiveUsd = (parsed.corpus_tokens / 1_000_000) * inputPerMtok;
  const graphifyUsd = (parsed.avg_query_tokens / 1_000_000) * inputPerMtok;
  const savedUsd = naiveUsd - graphifyUsd;

  const record = {
    timestamp: ts,
    date,
    graph_path: graphArg,
    ...parsed,
    pricing_input_usd_per_mtok: inputPerMtok,
    usd_naive_context_read_per_query: round4(naiveUsd),
    usd_graphify_context_read_per_query: round4(graphifyUsd),
    usd_saved_per_query_estimate: round4(savedUsd),
    pricing_note: pricingNote,
  };

  if (!noSave) {
    mkdirSync(REPORT_DIR, { recursive: true });
    appendFileSync(HISTORY_PATH, JSON.stringify(record) + "\n", "utf8");
  }

  const all = noSave ? [record] : loadHistory();
  const byDate = aggregateByDate(all);

  // --- Markdown report (overwritten each run) ---
  let md = `# Graphify token savings report\n\n`;
  md += `Generated: **${ts}** (local date **${date}**)\n\n`;
  md += `> ${pricingNote}\n\n`;
  md += `Method: same estimates as \`graphify benchmark\` (naive full-corpus tokens vs average tokens for fixed sample subgraph queries). Column and table meanings are in **Definitions and column keys** at the end of this file.\n\n`;

  md += `## This run\n\n`;
  md += `| Metric | Value |\n|--------|-------|\n`;
  md += `| Corpus (naive) | ${parsed.corpus_words.toLocaleString()} words → ~${parsed.corpus_tokens.toLocaleString()} tokens |\n`;
  md += `| Graph | ${parsed.graph_nodes.toLocaleString()} nodes, ${parsed.graph_edges.toLocaleString()} edges |\n`;
  md += `| Avg query context | ~${parsed.avg_query_tokens.toLocaleString()} tokens |\n`;
  md += `| Reduction | **${parsed.reduction_ratio}x** |\n`;
  md += `| Est. $ naive read / query | ${money(naiveUsd)} |\n`;
  md += `| Est. $ graphify read / query | ${money(graphifyUsd)} |\n`;
  md += `| Est. $ saved / query | **${money(savedUsd)}** |\n\n`;

  md += `## By date (all saved runs)\n\n`;
  for (const [d, runs] of byDate) {
    const n = runs.length;
    const aCorpus = Math.round(avg(runs, "corpus_tokens"));
    const aQuery = Math.round(avg(runs, "avg_query_tokens"));
    const aRed = round1(avg(runs, "reduction_ratio"));
    const sumSaved = runs.reduce((s, r) => s + (numish(r.usd_saved_per_query_estimate) || 0), 0);
    const avgSaved = sumSaved / n;
    md += `### ${d} (${n} run${n === 1 ? "" : "s"})\n\n`;
    md += `| Runs | Avg corpus tok | Avg query tok | Avg reduction | Sum saved $/query | Avg saved $/query |\n`;
    md += `|------|----------------|---------------|---------------|-------------------|------------------|\n`;
    md += `| ${n} | ${aCorpus.toLocaleString()} | ${aQuery.toLocaleString()} | ${aRed}x | ${money(sumSaved)} | ${money(avgSaved)} |\n\n`;
    md += `| Time (UTC) | Corpus tok | Query tok | Reduction | Saved $/query |\n`;
    md += `|--------------|------------|-----------|-----------|----------------|\n`;
    for (const r of [...runs].sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp)))) {
      md += `| ${r.timestamp} | ${Number(r.corpus_tokens).toLocaleString()} | ${Number(r.avg_query_tokens).toLocaleString()} | ${r.reduction_ratio}x | ${money(numish(r.usd_saved_per_query_estimate))} |\n`;
    }
    md += `\n`;
  }

  md += definitionsMarkdownAppendix();

  if (!noSave) {
    writeFileSync(LATEST_MD, md, "utf8");
    const html = buildHtml({
      ts,
      date,
      pricingNote,
      parsed,
      naiveUsd,
      graphifyUsd,
      savedUsd,
      byDate,
    });
    writeFileSync(LATEST_HTML, html, "utf8");
  }

  process.stdout.write(md);
  if (!noSave) {
    process.stdout.write(`\nAppended to ${path.relative(REPO_ROOT, HISTORY_PATH)}\n`);
    process.stdout.write(`Wrote ${path.relative(REPO_ROOT, LATEST_MD)}\n`);
    process.stdout.write(`Wrote ${path.relative(REPO_ROOT, LATEST_HTML)}\n`);
  }

  process.stdout.write("\n--- By date (terminal) ---\n");
  for (const [d, runs] of byDate) {
    const n = runs.length;
    const aCorpus = Math.round(avg(runs, "corpus_tokens"));
    const aQuery = Math.round(avg(runs, "avg_query_tokens"));
    const aRed = round1(avg(runs, "reduction_ratio"));
    const sumSaved = runs.reduce((s, r) => s + (numish(r.usd_saved_per_query_estimate) || 0), 0);
    const avgSaved = sumSaved / n;
    process.stdout.write(
      `${d}  runs=${n}  avgCorpusTok=${aCorpus.toLocaleString()}  avgQueryTok=${aQuery.toLocaleString()}  avgRed=${aRed}x  sumSaved=${money(sumSaved)}  avgSaved=${money(avgSaved)}\n`,
    );
  }
  process.stdout.write("\n");
}

function round4(x) {
  return Math.round(x * 10000) / 10000;
}

function round1(x) {
  return Math.round(x * 10) / 10;
}

function numish(x) {
  if (typeof x === "number") return x;
  if (typeof x === "string") return Number(x);
  return NaN;
}

main();
