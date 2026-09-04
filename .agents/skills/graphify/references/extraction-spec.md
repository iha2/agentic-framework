# graphify reference: extraction subagent prompt

Load in Step 3 Part B when corpus has ≥1 doc, paper, or image chunk. Pure-code corpus skips Part B; never read this file. Each semantic subagent receives the prompt below verbatim (substitute FILE_LIST, CHUNK_NUM, TOTAL_CHUNKS, DEEP_MODE, CHUNK_PATH).

```
You are a graphify extraction subagent. Read the files listed and extract a knowledge graph fragment.
Output ONLY valid JSON matching the schema below - no explanation, no markdown fences, no preamble.

Files (chunk CHUNK_NUM of TOTAL_CHUNKS):
FILE_LIST

Rules:
- EXTRACTED: relationship explicit in source (import, call, citation, "see §3.2")
- INFERRED: reasonable inference (shared data structure, implied dependency)
- AMBIGUOUS: uncertain - flag for review, do not omit

Code: semantic edges AST misses (calls, shared data, arch patterns). Do not re-extract imports.
Docs/papers: named concepts, entities, citations. Rationale (WHY, trade-offs, design intent) → `rationale` attribute on the concept node — no separate rationale/fragment node. Nodes only for named entities/concepts. `file_type` MUST be one of: `code`, `document`, `paper`, `image`, `rationale`, `concept`; other values invalid.
Code `calls`: source = caller, target = callee; never reverse. `calls` MUST stay within one language — no cross-language call edges.
Images: vision over OCR — UI (layout, decisions, elements), charts (metric/trend/source), posts (claim, author, concepts), diagrams (components/connections), research figures (demonstration/method/result), whiteboard (ideas/arrows; uncertain → AMBIGUOUS).

DEEP_MODE (if --mode deep): aggressive INFERRED — indirect deps, shared assumptions, latent couplings; uncertain → AMBIGUOUS not omit.

Semantic similarity: concepts solving the same problem without structural link → `semantically_similar_to` INFERRED (confidence 0.6–0.95). E.g. parallel validators, code class + paper algorithm, divergent error handlers for same failure. Only non-obvious cross-cutting similarity; skip trivial pairs.

Hyperedges: ≥3 nodes in shared concept/flow/pattern not captured by pairwise edges alone → top-level `hyperedges`. E.g. protocol implementors, auth-flow functions, paper-section concept group. Sparingly; max 3/chunk.

YAML frontmatter (--- ... ---): copy source_url, captured_at, author, contributor onto every node from that file.

confidence_score REQUIRED on every edge — never omit, never default 0.5:
- EXTRACTED: 1.0
- INFERRED: exactly ONE of {0.95 direct structural evidence; 0.85 strong inference; 0.75 reasonable; 0.65 weak; 0.55 speculative}. No continuous ranges; no 0.5. If none fit → AMBIGUOUS not ≤0.4.
- AMBIGUOUS: 0.1–0.3

Node ID: lowercase `[a-z0-9_]` only. `{stem}_{entity}` — stem = full repo-relative path sans extension, each segment lowercased/non-alnum→`_`, joined; entity = normalized symbol. All directory levels required (not immediate parent only). Examples: `src/auth/session.py`+`ValidateToken`→`src_auth_session_validatetoken`; `lib/utils/helpers.py`+`parse_url`→`lib_utils_helpers_parse_url`; `tests/test_foo.py`+`_helper`→`tests_test_foo_helper`; `docs/v1/api/README.md`+`getUser`→`docs_v1_api_readme_getuser`. Top-level files: filename stem only (`setup_my_func`). MUST match AST extractor IDs — filename-only or parent-only IDs create ghost duplicates; old format → `graphify extract --force`. CRITICAL: no chunk/sequence suffixes (`_c1`, `_chunk2`, etc.); IDs deterministic from label alone across chunks.

Schema:
{"nodes":[{"id":"auth_session_validatetoken","label":"Human Readable Name","file_type":"code|document|paper|image|rationale|concept","source_file":"<FILE_LIST path verbatim>","source_location":null,"source_url":null,"captured_at":null,"author":null,"contributor":null}],"edges":[{"source":"node_id","target":"node_id","relation":"calls|implements|references|cites|conceptually_related_to|shares_data_with|semantically_similar_to|rationale_for","confidence":"EXTRACTED|INFERRED|AMBIGUOUS","confidence_score":1.0,"source_file":"<FILE_LIST path verbatim>","source_location":null,"weight":1.0}],"hyperedges":[{"id":"snake_case_id","label":"Human Readable Label","nodes":["node_id1","node_id2","node_id3"],"relation":"participate_in|implement|form","confidence":"EXTRACTED|INFERRED","confidence_score":0.75,"source_file":"<FILE_LIST path verbatim>"}],"input_tokens":0,"output_tokens":0}

source_file RULE (every node, edge, hyperedge): path EXACTLY as in FILE_LIST — verbatim, absolute. No basename, re-relativization, prefix strip, or separator change (engine canonicalizes downstream). Character-for-character FILE_LIST entry so build_merge replace-on-re-extract matches existing nodes.

Write JSON via Write tool at this exact absolute path (relative paths silently lost):
CHUNK_PATH
```
