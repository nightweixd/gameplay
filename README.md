# GeniusCode+ Gameplay

**A little play. A lot of possibility.**

A browser-based playground where curious kids can explore, build, and learn through games. Choose an adventure from the welcome screen and jump straight in—no account required.

Created by [GeniusCode+](https://www.geniuscodeplus.com/).

## Games

### Minecraft Coding World

Explore a Minecraft-inspired block world and turn your ideas into builds.

- **Build freely:** place and break blocks, choose materials, and explore the landscape.
- **Code your agent:** connect visual blocks to move, turn, build, break, and repeat actions.
- **Start with an example:** run the tower program, then change the blocks and see what happens.
- **Learn at your own pace:** pause anytime and use the built-in controls guide.

More games will be added to the playground. Upcoming adventures are clearly marked **Coming soon**.

## Before you play

- Minecraft Coding World needs a **computer, keyboard, and mouse**, plus a browser with WebGL enabled.
- The welcome screen works on mobile, but touch-only controls for the block world are not available yet.
- This is a trial playground: **your world and code reset when you reload or leave the game**.
- No account or database is required. The command box talks only to your agent—it is not a public chat.

## Controls

| Control | Action |
| --- | --- |
| W A S D | Walk |
| Mouse | Look around |
| Space | Jump |
| Shift | Walk faster |
| F | Toggle flight |
| Space / Shift while flying | Fly up / down |
| Left / right click | Break / place a block |
| 1–9 | Select a material |
| C | Open / close Code Builder |
| Run code | Run your connected blocks |
| T, then `run`, then Enter | Run your blocks using a command |
| Esc | Pause / release the mouse |

Other local commands: `stop` stops your agent, `agent` brings it nearby, and `help` lists available commands.

## Run locally

Requires **Node.js 22.12 or newer** and npm.

```sh
git clone https://github.com/nightweixd/gameplay.git
cd gameplay
npm ci
npm run dev
```

Open the local address printed in your terminal.

- `/` — welcome screen and game chooser
- `/games/minecraft` — Minecraft Coding World

## Development

Built with **React, TypeScript, Vite, Three.js, and Blockly**. The application runs entirely in the browser. Fonts and editor media are hosted with the site.

```sh
npm test             # Check the world engine and Blockly programs
npm run build        # Check types and create the production build
npm run preview      # Preview the production build
```

For browser checks, keep a development or preview server running, then run `npm run test:browser`. The tests use a clean headless browser and save screenshots in the ignored `test-results/` folder. Set `GAMEPLAY_TEST_URL` to your server address if needed. On Windows, installed Google Chrome is used by default; elsewhere, run `npx playwright install chromium`. You can also specify a browser executable with `CHROME_PATH`.

## Deploy on Cloudflare Pages

Import this GitHub repository into **Cloudflare Pages** and use:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Root directory | Repository root |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node.js version | `22` |
| Environment variables | None required |

After deployment, add your domain through the project's **Custom domains** settings. Direct links to games use Cloudflare Pages' single-page application fallback.

See the official guides for [React on Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/) and [custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/).

## Contributing

Suggestions, bug reports, and pull requests are welcome. For a bug report, include your browser, device, steps to reproduce, and a screenshot if useful. Please do not share children's personal information.

To add a game, create its implementation under `src/games/`, register it in `src/games/catalog.ts`, and add its lazy-loaded route and welcome-screen card in `src/App.tsx`. Keep unfinished games marked **Coming soon**. Run the tests and production build before opening a pull request.

## Credits

See [third-party notices](THIRD_PARTY_NOTICES.md) for libraries, fonts, and attribution.

Minecraft Coding World is an independent Minecraft-inspired browser experience. It is **not an official Minecraft product** and is not affiliated with or endorsed by Mojang or Microsoft.
