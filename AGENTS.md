# Project instructions

- Use the owner's Git identity for commits: `nightweixd <81551655+nightweixd@users.noreply.github.com>`. Do not change global Git settings or attribute commits to another account.
- This is a public, browser-only game playground built with React, TypeScript, Vite, Three.js, and Blockly. Keep it deployable as static files on Cloudflare Pages.
- Never commit credentials, environment files, student data, account systems, or admin dashboards. Keep this project focused on public gameplay.
- Minecraft gameplay lives in `src/games/minecraft/`. Keep the welcome/game chooser at `/` and the playable world at `/games/minecraft`.
- Add future games to `src/games/catalog.ts` and the route selection in `src/App.tsx`. Only show a playable link when a game is implemented. Coming-soon entries must not pretend to be playable.
- Keep reusable UI in `src/components/`, game code in `src/games/`, tests in `tests/`, maintenance scripts in `scripts/`, and contributor/deployment documentation in `docs/` or `CONTRIBUTING.md`.
- Keep generated builds, dependencies, screenshots, reports, logs and local editor settings out of Git. Do not remove user data as part of cleanup.
- Run `npm run format` after editing, then `npm run check` before committing. Check the welcome screen and the game flow in a real browser when browser tooling is available.
- Keep third-party assets self-hosted, include their licenses, and make trial-world reset behavior clear.
