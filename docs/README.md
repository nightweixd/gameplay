# Project guide

[Project home](../README.md) · [Contributing](../CONTRIBUTING.md) · [Cloudflare deployment](cloudflare.md)

## Directory map

```text
gameplay/
├── .github/workflows/       Automated checks for pushes and pull requests
├── docs/                   Project and deployment guides
├── public/
│   ├── brand/              Original GeniusCode+ logo
│   ├── blockly/            Self-hosted editor media and its license
│   └── fonts/              Pixel font and font licenses
├── scripts/                Maintenance checks
├── src/
│   ├── components/         Shared UI, logo, illustration and dialog
│   ├── games/
│   │   ├── catalog.ts      Game descriptions and availability
│   │   └── minecraft/     World, agent, block editor and game styles
│   ├── App.tsx            Welcome screen and route selection
│   ├── main.tsx           Application entry point and font imports
│   └── styles.css         Welcome screen and shared web styles
├── tests/                  Unit-style engine tests and browser tests
├── CONTRIBUTING.md         How to develop, test and contribute
├── README.md               Public introduction and quick start
└── THIRD_PARTY_NOTICES.md   Attribution and license references
```

Root configuration files cover npm, TypeScript, Vite, formatting, editor conventions and Git. `package-lock.json` is committed so installs are reproducible. The package's `private` flag prevents accidental npm publication; it does not make the GitHub repository private.

## Find the right file

| Change                                         | File                                                      |
| ---------------------------------------------- | --------------------------------------------------------- |
| Brand logo or home-link text                   | [Brand.tsx](../src/components/Brand.tsx)                  |
| Welcome screen content or routes               | [App.tsx](../src/App.tsx)                                 |
| Game names and descriptions                    | [catalog.ts](../src/games/catalog.ts)                     |
| Welcome screen appearance                      | [styles.css](../src/styles.css)                           |
| Start menu, commands or inventory UI           | [Game.tsx](../src/games/minecraft/Game.tsx)               |
| 3D renderer, mouse controls or agent animation | [GameWorld.tsx](../src/games/minecraft/GameWorld.tsx)     |
| World rules and agent instructions             | [model.ts](../src/games/minecraft/model.ts)               |
| Blockly block definitions                      | [blocks.ts](../src/games/minecraft/blocks.ts)             |
| Blockly editor UI                              | [BlockEditor.tsx](../src/games/minecraft/BlockEditor.tsx) |
| Engine tests                                   | [gameplay.cjs](../tests/gameplay.cjs)                     |
| End-to-end checks                              | [browser.cjs](../tests/browser.cjs)                       |

## Runtime model

The welcome page loads first. Choosing Minecraft lazy-loads the world and Three.js; opening Code Builder lazy-loads Blockly. The world and code remain in browser memory only. Reloading or leaving the game resets them. There is no server API, account system or database to configure.

## Keep the repository tidy

- Put new files in the appropriate folder above instead of creating root-level copies.
- Keep one canonical logo in `public/brand/`; the app, browser icon and README reference it.
- Preserve third-party licenses and avoid manually formatting vendored media.
- Do not commit dependencies, builds, test screenshots/reports, logs, temporary files, local settings or secrets. These are ignored and checked by `npm run check:repo` for tracked files.
- Run `npm run format` and `npm run check` before submitting a change. CI runs the same checks. Browser testing remains a separate command.

These checks help prevent common mistakes; they are not a full secret scanner or a substitute for reviewing the files being published. Nothing is automatically deleted from a contributor's working folder.
