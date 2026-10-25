# Contributing

Thanks for helping make the playground better for young builders and coders.

[Project home](README.md) · [Directory guide](docs/README.md) · [Deployment guide](docs/cloudflare.md)

## Development setup

Use Node.js 22.12+ and npm. Clone the repository, then run:

```sh
npm ci
npm run dev
```

Use the local address printed by Vite. `/` is the game chooser; `/games/minecraft` is the block world.

## Before opening a pull request

```sh
npm run format
npm run check
```

The combined check verifies tracked-file hygiene, local documentation links, formatting, gameplay tests, TypeScript and the production build. CI runs it on pushes and pull requests. Only include files related to your change.

Please keep:

- Shared UI in `src/components/`, and individual games in `src/games/<game-id>/`.
- Tests in `tests/`, maintenance scripts in `scripts/`, and longer guides in `docs/`.
- Original brand artwork in `public/brand/`, without stretching or redrawing the logo.
- Builds, dependencies, test artifacts, logs, local settings and credentials out of Git.
- Controls keyboard-accessible, buttons clearly labeled, images appropriately described, and layouts usable on small screens. Do not suggest touch gameplay when it is not implemented.

## Browser tests

Start a preview with the same static output used in production:

```sh
npm run build
npm run preview -- --port 5180
```

In another terminal:

```sh
npm run test:browser
```

On Windows, the checks use Google Chrome from its standard installation path. Elsewhere, install the test browser with `npx playwright install chromium`. You can set `CHROME_PATH` to another Chrome/Chromium executable and `GAMEPLAY_TEST_URL` to a different preview address.

The tests cover responsive layout, logo loading, help/focus, game entry, Blockly, agent execution, inventory, commands, pause, exit and fresh sessions. Screenshots go into the ignored `test-results/` folder. Do not commit test artifacts.

## Adding a game

1. Create the implementation in `src/games/<game-id>/`.
2. Register its description and availability in `src/games/catalog.ts`.
3. Add a lazy-loaded route and welcome-screen card in `src/App.tsx`.
4. Explain controls and reset/save behavior before play.
5. Add tests, run the checks, and verify the game in a browser.

Only mark a game playable when it works. Leave unfinished adventures labeled **Coming soon** without a play link.

## Bug reports

Include your browser/device, steps to reproduce, and what you expected to happen. A screenshot is helpful, but do not include children's names, identifying information, passwords or tokens. Report only material you have permission to share.
