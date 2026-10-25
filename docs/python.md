# Python Carnival

[Project home](../README.md) · [Project guide](README.md) · [Contributing](../CONTRIBUTING.md)

An actual Python editor and interpreter with playful, course-aligned mini-projects. This is not a simulated Python parser. CPython 3.14 runs through Pyodide in a separate browser Web Worker.

## Learning sequence

Start with one concept at a time. The first mission uses literal text and integers with `print()`—no variables. The second introduces only variables, with the print lines already provided. Later missions build on those skills.

| Mission                  | Course topic                   | Activity                                      |
| ------------------------ | ------------------------------ | --------------------------------------------- |
| Say hello to Python      | Module 1: strings and integers | Print a welcome string and a whole number     |
| Your explorer pass       | Module 1: variables            | Set a name and starting coins                 |
| Open the cinema          | Module 1: input and if / else  | Calculate an age-based ticket price           |
| Pack the fruit basket    | Module 2: lists                | Add a fruit with `append()`                   |
| Stock the snack shop     | Module 3: dictionaries         | Add a price and calculate a snack total       |
| Launch the countdown     | Module 4: while loops          | Print a countdown that terminates             |
| Light the lantern trail  | Module 5: for loops            | Loop through a list and call `light()`        |
| Build the ticket machine | Module 6: functions            | Return ticket prices from a reusable function |

The topic order and project themes follow GeniusCode+'s Basic Python curriculum. Mission text, starter programs, examples and checks are authored for this playground, not copied teacher lesson bodies. Each mission links to its corresponding course topic. Missions can be attempted in any order.

## Playing and experimenting

Choose **Missions** for guided practice or **Free code** for an unrestricted exercise editor. Change the code and click **Run Python** (or Ctrl/Command + Enter). Put one answer per line in **Input values** before running programs that call `input()`.

- `print()` output and errors appear as plain text, never HTML.
- `light("blue")` is a custom Carnival helper. It accepts blue, gold, mint, coral or plum and records up to 12 lanterns for the preview.
- Hints and worked examples are available without replacing a student's draft.
- **Reset code** asks for confirmation and affects only the current draft. **Download Python code** exports the current editor contents as a `.py` file.
- A stamp means the current practice checks passed. It is not a formal assessment, certificate or tamper-proof achievement.

## Storage and privacy

Drafts, input text and practice stamps are stored in localStorage under a versioned key, `geniuscode.python-carnival.v1`. Only known mission IDs and bounded strings are accepted when loading saved data. There is no account, cloud sync or server-side execution endpoint. The application does not upload code or input values.

Storage may be unavailable in some browser modes and is lost if site data is cleared. Use fictional names and values, not personal information. Download important code before changing devices or clearing browser data.

## Runtime and limits

- Pyodide is pinned in `package-lock.json`. `npm run dev` and `npm run build` run [prepare-python.cjs](../scripts/prepare-python.cjs), which copies the required runtime assets into the ignored `public/python-runtime/` folder. Build output includes them, but the public Git repository does not.
- All runtime assets are self-hosted. The first run loads about 14 MB; subsequent loads can benefit from browser caching. No external runtime CDN is required.
- Each run uses a fresh worker and fresh Python namespace. The parent terminates it on completion, Stop, a five-second execution timeout, or a loading timeout. This prevents one student's run from modifying the next run's Python builtins.
- Code is limited to 20,000 characters, input to 4,000 characters, and captured output to 20,000 characters. There is no guaranteed hard memory quota; memory-intensive code can still exhaust a browser tab.
- The playground targets standard-library learning exercises. It does not install pip packages or provide desktop graphics, a Python terminal/REPL, a filesystem UI or network APIs as teaching features.
- Production worker responses have a Content Security Policy limiting scripts and connections to this origin and preventing nested workers. WebAssembly compilation is permitted. Local browser tests apply the same policy because Vite preview does not process Cloudflare's `_headers` file.
- A browser worker is **not a security sandbox for hostile code**. Python's JavaScript bridge exists. Do not add application credentials, privileged services, shared untrusted-code execution or secrets to this runner. Only run code you understand. No attempt is made to enforce honest stamps against deliberate tampering.

## Development

| File                                                                   | Responsibility                                                         |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| [missions.ts](../src/games/python/missions.ts)                         | Sequence, goals, starter programs, hints, examples and checks          |
| [PythonGame.tsx](../src/games/python/PythonGame.tsx)                   | Editor, mission navigation, feedback and saved drafts                  |
| [CarnivalScene.tsx](../src/games/python/CarnivalScene.tsx)             | Visual preview of bounded results                                      |
| [harness.py](../src/games/python/harness.py)                           | Real Python execution, input/output capture and mission checks         |
| [python-runner.worker.ts](../src/games/python/python-runner.worker.ts) | Self-hosted runtime loading and typed messages                         |
| [runner.ts](../src/games/python/runner.ts)                             | Worker lifecycle, cancellation and timeouts                            |
| [notebook.ts](../src/games/python/notebook.ts)                         | Versioned localStorage validation                                      |
| [python.cjs](../tests/python.cjs)                                      | Every mission's passing example and incomplete starter in real Pyodide |
| [python-browser.cjs](../tests/python-browser.cjs)                      | Browser checks for editor, missions, storage, timeout and recovery     |

Run `npm run check` for repository hygiene, formatting, all engine tests and a production build. With a preview running on port 5180, run `npm run test:python:browser`. Keep screenshots and generated runtime assets out of Git.

Upstream references: [Pyodide worker execution](https://pyodide.org/en/314.0.7/usage/webworker.html), [standard streams](https://pyodide.org/en/314.0.7/usage/streams.html), [runtime notices](../public/licenses/PYODIDE-NOTICE.md).
