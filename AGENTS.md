# Project instructions

- Use the owner's Git identity for commits: `nightweixd <81551655+nightweixd@users.noreply.github.com>`. Do not change global Git settings or attribute commits to another account.
- This is a public, browser-only game playground built with React, TypeScript, Vite, Three.js, and Blockly. Keep it deployable as static files on Cloudflare Pages.
- Never copy credentials, environment files, student data, authentication, admin dashboards, or Moblox's creature-creation features into this repository.
- Minecraft gameplay lives in `src/games/minecraft/`. Keep the welcome/game chooser at `/` and the playable world at `/games/minecraft`.
- Add future games to `src/games/catalog.ts` and the route selection in `src/App.tsx`. Only show a playable link when a game is implemented. Coming-soon entries must not pretend to be playable.
- Preserve the original `nightweixd/minecraft` project; this is a separate gameplay-only project.
- Run `npm test` and `npm run build` before committing. Check the welcome screen and the game flow in a real browser when browser tooling is available.
- Keep third-party assets self-hosted, include their licenses, and make trial-world reset behavior clear.
