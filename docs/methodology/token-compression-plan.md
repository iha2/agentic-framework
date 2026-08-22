# Token compression plan

Registry for corpus-size reduction. Goal: lower total indexed tokens while preserving normative content and shifting voice to a denser, graduate-level register.

## Principles

1. **Single source** — governance prose lives in [`invariants.md`](invariants.md); entry docs link, not duplicate.
2. **Reference, don't restate** — skills and standards cite canonical sections; shared rules live in one file per concern.
3. **Normative density** — RFC-2119 keywords for requirements; remove marketing repetition and bold emphasis chains.
4. **Archive excision** — superseded research corpora removed from the tree; history remains in Git.
5. **Kit stubs** — portable tooling copies minimal redirect docs; canonical prose stays under `docs/graphify/`.

## Completed reductions

| Artifact | Action | Approx. savings |
| --- | --- | --- |
| `docs/cache-augmented-generation-standards-and-specs.research-archive-2026-05-23.md` | Removed (superseded by slim CAG doc) | ~110 KB |
| `README.md` | Router-only landing; defers to `methodology.md` + `invariants.md` | ~12 KB |
| `methodology.md` | Intro compressed; invariant cross-links | ~4 KB |
| `docs/agent-execution-discipline.md` | Tighter rules; invariant reference | ~3 KB |
| `tooling/graphify-setup-kit/docs/*` | Stub redirects to `docs/graphify/` | ~50 KB |
| `docs/methodology/README.md` | Index only | ~1 KB |

## Backlog (prioritized)

| Target | Action | Rationale |
| --- | --- | --- |
| `.agents/skills/spec-builder/SKILL.md` | Move operating-model history to README; SKILL = procedure only | High line count, repeated governance |
| `.agents/skills/gh-stack/SKILL.md` | Extract lane rules to `references/`; trim examples | 858 lines |
| `docs/human-in-loop-pr-review-strategy.md` | Cross-link `pr-review/shared-rules.md`; dedupe sizing prose | 779 lines |
| Standards intros | Replace duplicated "how agents consume" with link to `docs-hygiene.md` | Many files |
| `docs/graphify/guide.md` vs kit copy | Kit already stubbed; keep one canonical guide | Maintenance |
| Example starter prompts in builder skills | Collapse to one line + template path | Token-heavy when loaded |

## Voice shift (register)

| Prior pattern | Target register |
| --- | --- |
| Repeated "engineering-led… agent acceleration… vibe coding" mantra | State once in `invariants.md` |
| Bold emphasis on every noun phrase | Reserve emphasis for normative terms only |
| Persuasive executive overview blocks | Assumes reader competence; table + invariant reference |
| "This is not X; it is Y" rhetorical pairs | Direct invariant statements |

## Measurement

Re-index after changes:

```bash
graphify update . --force
# Compare corpus token estimate in docs/graphify/guide.md § Token savings
```

Track `wc -c` on `*.md` excluding `graphify-out/` for coarse byte deltas between commits.
