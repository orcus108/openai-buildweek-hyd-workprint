# Workprint design lab

This is a disposable interaction prototype. It does not import or modify the production Workprint application.

Serve the workspace root, then open:

```text
http://localhost:4173/design-lab/?reset=1
```

The `reset=1` query starts at first-time setup. Without it, the prototype remembers the connection and opens directly on today's ready posts.

Use `?empty=1` to review the quiet-day state.

The prototype opens in light mode. Use the header toggle to switch to dark mode.

Flow:

1. Connect GitHub and Codex once.
2. Workprint catches up automatically.
3. Choose a ready post from the Workprint demo project.
4. Switch between an X (formerly Twitter) draft and a LinkedIn draft.
5. Edit the draft directly or ask Workprint for a change.
6. Post on X or LinkedIn with the draft copied and ready.

Secondary surfaces:

- Click “4 sources” to inspect claim-level proof.
- Answer the optional personalization question to work one real detail into the draft.
- Click “Watching GitHub + Codex” to manage connections.
- Add an OpenRouter or Google AI Studio demo key inside connections. It is stored only in local browser storage and is never committed to the prototype.
- Use `?empty=1` to see what happens when nothing is worth posting.
