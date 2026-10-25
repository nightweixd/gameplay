# GeniusCode+ Gameplay

<img src="public/brand/geniuscode-logo.png" alt="GeniusCode+ logo" width="120" />

**A little play. A lot of possibility.**

A browser-based playground where curious kids can explore, build, and learn through games. Choose an adventure from the welcome screen and jump straight in—no account required.

Created by [GeniusCode+](https://www.geniuscodeplus.com/).

[Play guide](#before-you-play) · [Run locally](#run-locally) · [Project structure](docs/README.md) · [Cloudflare setup](docs/cloudflare.md) · [Contribute](CONTRIBUTING.md)

## Games

### Minecraft Coding World

Explore a Minecraft-inspired block world and turn your ideas into builds.

- **Build freely:** place and break blocks, choose materials, and explore the landscape.
- **Code your agent:** connect visual blocks to move, turn, build, break, and repeat actions.
- **Start with an example:** run the tower program, then change the blocks and see what happens.
- **Learn at your own pace:** pause anytime and use the built-in controls guide.

More games will be added to the playground. Upcoming adventures are clearly marked **Coming soon**.

### Python Carnival

Write real Python to bring a festival to life. Eight guided missions follow GeniusCode+'s Basic Python topics. Start with just strings and integers, then learn variables in a separate mission before moving on to input, decisions, lists, dictionaries, loops and functions.

- Open a cinema, pack a fruit basket, stock a snack shop, launch a countdown, and light a lantern trail.
- Try **Free code** for your own Python programs, with input, output, useful errors, and `.py` downloads.
- Get a hint or open the matching course lesson when you need help.
- Collect practice stamps and keep drafts in this browser—no student account or cloud save.

See the [Python guide](docs/python.md) for the course mapping, runtime limits, and development notes.

## Before you play

- Minecraft Coding World needs a **computer, keyboard, and mouse**, plus a browser with WebGL enabled.
- The welcome screen works on mobile, but touch-only controls for the block world are not available yet.
- Minecraft worlds and blocks reset when you leave. Python drafts and practice stamps save only in the current browser and can be lost if browser data is cleared.
- Python's first run loads about 14 MB of runtime files from this site. Later loads can use the browser cache. Execution has a five-second limit and a Stop button.
- No account or database is required. The command box talks only to your agent—it is not a public chat.

## Controls

| Control                    | Action                          |
| -------------------------- | ------------------------------- |
| W A S D                    | Walk                            |
| Mouse                      | Look around                     |
| Space                      | Jump                            |
| Shift                      | Walk faster                     |
| F                          | Toggle flight                   |
| Space / Shift while flying | Fly up / down                   |
| Left / right click         | Break / place a block           |
| 1–9                        | Select a material               |
| C                          | Open / close Code Builder       |
| Run code                   | Run your connected blocks       |
| T, then `run`, then Enter  | Run your blocks using a command |
| Esc                        | Pause / release the mouse       |

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
- `/games/python` — Python Carnival and free-code playground

## Development

Built with **React, TypeScript, Vite, Three.js, Blockly, and Pyodide**. The application runs entirely in the browser. Fonts, editor media and the Python runtime are self-hosted. The runtime is copied from the pinned npm package during `dev`/`build`, and its generated files stay out of Git.

```sh
npm test             # Check the world engine and Blockly programs
npm run build        # Check types and create the production build
npm run preview      # Preview the production build
npm run format       # Format project source and documentation
npm run check        # Check repo hygiene, formatting, tests and build
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for browser testing and code conventions. Generated builds, dependencies, reports, screenshots and local configuration stay out of Git. CI runs the repository checks on pushes and pull requests.

## Project layout

| Folder                             | Contents                                           |
| ---------------------------------- | -------------------------------------------------- |
| [src/components/](src/components/) | Shared UI and brand component                      |
| [src/games/](src/games/)           | Game catalog and individual game implementations   |
| [public/](public/)                 | Brand artwork, fonts and self-hosted Blockly media |
| [tests/](tests/)                   | World-engine and browser tests                     |
| [scripts/](scripts/)               | Repository maintenance checks                      |
| [docs/](docs/)                     | Architecture and deployment guides                 |

Start with the [directory guide](docs/README.md) to find the right file for a change.

## Deploy on Cloudflare

For the Git-connected Worker, build with `npm run build` and deploy with `npx wrangler deploy`. The included `wrangler.jsonc` serves `dist/` with a single-page application fallback. `npm run check:cloudflare` validates deployment without publishing. No compiler server is needed—Python runs on the visitor's device.

If you prefer **Cloudflare Pages**, import the repository and use:

| Setting                | Value           |
| ---------------------- | --------------- |
| Production branch      | `main`          |
| Root directory         | Repository root |
| Build command          | `npm run build` |
| Build output directory | `dist`          |
| Node.js version        | `22`            |
| Environment variables  | None required   |

See the [Cloudflare deployment guide](docs/cloudflare.md) for the complete setup, custom domains and troubleshooting.

## Contributing

Suggestions, bug reports, and pull requests are welcome. Read the [contribution guide](CONTRIBUTING.md) for the development workflow and how to add a game. Please do not share children's personal information in issues, screenshots or sample data.

## Credits

See [third-party notices](THIRD_PARTY_NOTICES.md) for libraries, fonts, and attribution.

Minecraft Coding World is an independent Minecraft-inspired browser experience. It is **not an official Minecraft product** and is not affiliated with or endorsed by Mojang or Microsoft.
