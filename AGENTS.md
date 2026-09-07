# Factorio Scratchpad

Anton's personal project. Keep it simple: a textarea and a calculated copy beside it.

## Development
- React, TypeScript (strict), Vite, plain CSS. Static site; no backend or sign-in.
- Never use `any` unless strictly necessary.
- Use `jj`, not Git commands, for version control.
- Do not start dev servers directly; use Anton's `devservers` CLI if needed.
- Run `npm test` and `npm run build` for calculation or application changes.
- Update README.md whenever behavior, setup, or deployment changes.
- Keep math evaluation safe: never use `eval`, `Function`, or execute user text.
- Notes stay local to the browser. Preserve the storage key and empty saved documents.
- Keep the two-column layout and inline syntax guide; avoid growing this into a recipe planner.

## Version control and deployment
This is a personal repository: push completed changes to GitHub immediately.
Give substantial changes their own changeset: run `jj new --insert-before @ --no-edit`,
make changes on `@`, squash explicitly named files into the new parent using
`jj squash --into @- --keep-emptied <files>`, describe that parent, set `main` to it,
and run `jj git push --bookmark main`.
GitHub Actions tests, builds, and deploys main to GitHub Pages. Never commit dist,
node_modules, secrets, or personal scratchpad contents.

For human-facing GitHub comments or PR descriptions, prefix with
`**[Action] on behalf of Anton ([modelName])**` followed by two newlines.
Do not delegate unless asked. If asked, prefer T3 Code delegate_task and include
"Do not delegate further" in each child prompt.
