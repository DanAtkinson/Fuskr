# Contributing

Thank you for your interest in contributing to Fuskr! Please read this guide before submitting pull requests or raising issues.

For full developer setup, architecture details, and build instructions, see [DEVELOPER.md](DEVELOPER.md).

## Prerequisites

- [Node.js](https://nodejs.org/) v22 or later
- npm (bundled with Node.js)
- A Chromium-based browser (Chrome, Edge) or Firefox for manual testing

## Getting started

Clone the repository and install dependencies:

```bash
git clone https://github.com/DanAtkinson/Fuskr.git
cd Fuskr
npm install
```

## Running locally

```bash
npm start          # Angular dev server (for UI development)
npm run watch      # Watch mode — rebuilds on file changes
```

To load the extension unpacked in Chrome:

1. Run `npm run build:extensions` to produce `dist/chromium/`
2. Go to `chrome://extensions/` and enable **Developer mode**
3. Click **Load unpacked** and select the `dist/chromium` folder
4. Reload the extension after manifest changes

## Key commands

| Command | Purpose |
|---------|---------|
| `npm run lint` | Run ESLint across the project |
| `npm run format` | Auto-fix formatting with Prettier |
| `npm run format:check` | Check formatting without fixing |
| `npm run test:ci` | Run all unit tests (single run, headless) |
| `npm run test:coverage` | Run unit tests with coverage report |
| `npm run test:e2e` | Run Playwright end-to-end tests (Chrome) |
| `npm run build:extensions` | Build Chrome + Firefox extensions (no tests) |
| `npm run build` | Full release build — lint, test, then package |

## Linting

ESLint with `angular-eslint` enforces code style. Prettier handles formatting.

```bash
npm run lint          # Check for lint errors
npm run format        # Auto-fix formatting
npm run format:check  # Check without fixing (used in CI)
```

## Testing

Unit tests use **Vitest** with jsdom. Test files live alongside source files as `*.spec.ts`.

```bash
npm run test:ci        # Single run (used in CI)
npm run test:coverage  # With coverage report in coverage/fuskr/
```

End-to-end tests use **Playwright** and load the unpacked Chromium extension from `dist/chromium`:

```bash
npm run build:extensions   # Build first
npm run test:e2e           # Then run e2e tests
```

### Writing tests

- Unit test files are named `*.spec.ts` and live next to the source file they test (e.g. `gallery.component.spec.ts`)
- Use `vi.fn()` and `vi.spyOn()` from Vitest for mocking
- E2E tests live in `e2e/tests/`

## Code style

- **TypeScript** with strict mode — no `any`, no implicit returns
- **British English** in all comments and documentation
- Follow the [Angular Style Guide](https://angular.dev/style-guide)
- JSDoc comments on all public API methods
- Commit messages follow Conventional Commits: `type(scope): brief description`
  - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Submitting changes

1. Fork the repository and create a feature branch
2. Make your changes with appropriate tests
3. Run `npm run build` to verify everything passes
4. Open a pull request against `master`
