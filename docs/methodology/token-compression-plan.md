# Token compression plan

Registry for corpus-size reduction. Goal: **≥50%** fewer indexed tokens vs baseline (~309k tok / ~166k words, 148 `*.md` files excl. `graphify-out/`), **without reducing quality** — denser master/PhD register, same obligations and agent utility.

## Principles

1. **Quality first** — MUST keep every normative rule, halt condition, contract section, and one tight Desired/Not-desired pair where the standard requires examples. Compression deletes filler and duplication, not meaning.
2. **Single source** — governance prose lives in [`invariants.md`](invariants.md); entry docs link, not duplicate.
3. **Reference, don't restate** — skills and standards cite canonical sections; shared rules live in one file per concern.
4. **Normative density** — RFC-2119 for requirements; cut marketing, history, and bold emphasis chains.
5. **Archive excision** — superseded research/strategy corpora removed from the tree; history remains in Git; stubs redirect.
6. **Kit stubs** — portable tooling copies minimal redirect docs; canonical prose stays under `docs/graphify/`.
7. **Master/PhD denser register** — assume competent readers; one clause per rule; tables over tutorial prose.

## Completed reductions

| Artifact | Action | Approx. savings |
| --- | --- | --- |
| `docs/cache-augmented-generation-standards-and-specs.research-archive-2026-05-23.md` | Removed (superseded by slim CAG doc) | ~110 KB |
| `README.md` | Router-only landing; defers to `methodology.md` + `invariants.md` | ~12 KB |
| `methodology.md` | Intro compressed; invariant cross-links | ~4 KB |
| `docs/agent-execution-discipline.md` | Tighter rules; invariant reference | ~3 KB |
| `tooling/graphify-setup-kit/docs/*` | Stub redirects to `docs/graphify/` | ~50 KB |
| `docs/methodology/README.md` | Index only | ~1 KB |
| `docs/human-in-loop-pr-review-strategy.md` | Stub → pr-review + methodology | ~essay |
| `docs/cache-augmented-generation-standards-and-specs.md` | Decision + conclusions only | ~essay |
| `docs/using-gh-stack.md`, `worktree-setup.md`, `wt-cheat-sheet.md` | Stub / cheat sheet → skills | ~setup bulk |
| `docs/code-review-graph.md` | Stub → pr-review + upstream | ~guide |
| `docs/graphify/guide.md`, `new-computer-setup.md` | Densify / setup steps | ~40–50%+ |
| `docs/methodology/{deterministic-quality,spec-driven-development,features-and-milestones}.md` | Light densify | ~25% |

## 50% path

| Surface | Target cut | Mechanism | Status |
| --- | --- | --- | --- |
| `.agents/skills/` | ~50% | Procedure-only SKILL.md; densify templates/refs | Done (2026-09) |
| `docs/standards/` | ~50% | Densify bodies; shorten Desired/Not-desired pairs | Done (2026-09) |
| Other `docs/` | ~70% | Archive/stub strategy essays, setup guides, research narrative | Mostly done |
| Methodology + root | ~25% | Light densify | Done |

Measured after densify pass (2026-09-03): **152187 tok (50.69% cut)** vs baseline 308648 (≤154324).

## Backlog (prioritized)

| Target | Action | Rationale |
| --- | --- | --- |
| ~~Skill SKILL.md / spec templates / graphify refs~~ | Done (densify 2026-09) | — |
| ~~`docs/human-in-loop-pr-review-strategy.md`~~ | Done (stub) | — |
| ~~CAG / setup / gh-stack / worktree / code-review-graph / graphify setup~~ | Done (stub/densify 2026-09) | — |
| ~~All `docs/standards/*`~~ | Done (densify 2026-09) | — |
| `.graphifyignore` residuals | Exclude rarely loaded references if corpus grows again | Indexed corpus |

## Voice shift (register)

| Prior pattern | Target register |
| --- | --- |
| Soft tutorial padding | Imperative first sentence; RFC-2119 |
| Historical “departure from earlier convention” | README or delete; SKILL = procedure |
| Persuasive executive overview | Table + invariant reference |
| “Not X; it is Y” rhetorical pairs | Direct invariant |
| Bold on every noun phrase | Bold only normative / halt terms |
| Multi-block starter prompts | One line + template path |

## Measurement

Baseline (2026-09-03): **148 files, 165884 words, 1234593 chars, ~308648 tokens** (`chars/4`).

**Final (2026-09-03 densify):** **152187 tokens**, **50.69% cut** vs baseline (`chars/4` over all `*.md` excl. `.git` / `graphify-out` / `node_modules` / `__pycache__`). Target ≤154324 met.

```bash
# After changes:
python3 -c "
import pathlib,os
tok=0
for r,ds,fs in os.walk('.'):
  ds[:]=[d for d in ds if d not in {'.git','graphify-out','node_modules','__pycache__'}]
  for f in fs:
    if f.endswith('.md'):
      t=(pathlib.Path(r)/f).read_text(encoding='utf-8',errors='ignore'); tok+=len(t)//4
print(tok, 'cut%', round(100*(1-tok/308648),2), 'ok' if tok<=154324 else 'NEED MORE')
"
graphify update . --force
```

Target: `1 - (new_chars/4) / 308648` **≥ 0.50** and absolute tok **≤ 154324**.
