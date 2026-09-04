# Graphify new-computer setup (kit stub)

Canonical reference: [`docs/graphify/new-computer-setup.md`](https://github.com/Customer-Engagement-Digital-Technology/agentic-framework/blob/main/docs/graphify/new-computer-setup.md)

## Minimal setup

```bash
uv tool install graphifyy          # or: pip install graphifyy
graphify cursor install            # writes .cursor/rules/graphify.mdc
graphify update .                  # first build
```

Configure `.graphifyignore` for your repo scope. Run `graphify hook install` if you want commit-time refresh.

Full platform notes, troubleshooting, and consumer-repo wiring: canonical doc above.
