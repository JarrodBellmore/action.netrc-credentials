# starter.github-workflow

## Purpose

This repository is a starter template for building custom **GitHub Actions using
TypeScript**. It combines:

- The official GitHub Actions TypeScript patterns from
  [actions/typescript-action](https://github.com/actions/typescript-action)
- The Taskfile + Docker workflow conventions from
  [JarrodBellmore/starter.spa](https://github.com/JarrodBellmore/starter.spa)

It provides:

- A complete TypeScript GitHub Action scaffold with example inputs, outputs, and
  logic
- Task automation using [Taskfile.dev](https://taskfile.dev) wrapping all build,
  test, lint, and package operations
- Docker Compose configuration so all development tasks run in a consistent
  Node.js 24 container
- GitHub Actions CI/CD workflows for automated testing, dist verification, and
  release management
- A clean, extensible foundation ready to be customized for your specific action

## Getting Started

### Development Container

This repository includes a dev container configuration for use with VS Code and
GitHub Codespaces. The dev container provides:

- Ubuntu-based environment with standard development tools
- Bash shell (default)
- Task runner pre-installed
- Docker-in-Docker support for running containers
- Docker, Task, ESLint, and Prettier VS Code extensions

#### Using with VS Code

1. Install the
   [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
2. Open the repository in VS Code
3. Click "Reopen in Container" when prompted (or use Command Palette: "Dev
   Containers: Reopen in Container")

#### Using with GitHub Codespaces

1. Click the "Code" button on GitHub
2. Select the "Codespaces" tab
3. Click "Create codespace on [branch]"

### Prerequisites

If not using the dev container, install the
[Task](https://taskfile.dev/installation/) task runner. For local development,
install the [GitHub CLI](https://cli.github.com/) and authenticate so Task can
access remote Taskfiles using standard Git auth:

```bash
gh auth login
gh auth status
```

### Available Tasks

Run `task` to see all available tasks:

```bash
task
```

### Running Tasks

All tasks run inside the Docker container defined in `docker-compose.yml`.

| Task              | Description                                         |
| ----------------- | --------------------------------------------------- |
| `task install`    | Install npm dependencies                            |
| `task build`      | Bundle the action (alias for `task package`)        |
| `task test`       | Run Jest unit tests                                 |
| `task lint`       | Lint the source code with ESLint                    |
| `task format`     | Check code formatting with Prettier                 |
| `task format:fix` | Auto-fix code formatting                            |
| `task package`    | Bundle action for distribution (generates `dist/`)  |
| `task bundle`     | Format, lint, test, and bundle for distribution     |
| `task local`      | Run the action locally using `@github/local-action` |
| `task shell`      | Open an interactive shell in the container          |
| `task clean`      | Remove `node_modules`, `dist`, and `coverage`       |

## Project Structure

```
.
├── src/
│   ├── index.ts          # Action entrypoint (imports and calls run())
│   ├── main.ts           # Action main logic
│   └── wait.ts           # Example helper module
├── __tests__/
│   ├── main.test.ts      # Tests for main.ts
│   └── wait.test.ts      # Tests for wait.ts
├── __fixtures__/
│   ├── core.ts           # Mock for @actions/core
│   └── wait.ts           # Mock for wait module
├── dist/                 # Bundled output (committed to repo)
├── action.yml            # GitHub Action definition
├── rollup.config.ts      # Rollup bundler configuration
├── jest.config.js        # Jest test configuration
├── tsconfig.json         # TypeScript configuration
├── eslint.config.mjs     # ESLint configuration
├── .prettierrc.yml       # Prettier formatting configuration
├── Taskfile.yml          # Task automation
├── docker-compose.yml    # Docker service definitions
└── .github/
    └── workflows/
        ├── ci.yml            # CI: lint, test, and action smoke test
        ├── check-dist.yml    # Verify dist/ is up to date
        └── release.yml       # Update version tags on release
```

## Customizing the Action

1. **Update `action.yml`** — Change the name, description, branding, inputs, and
   outputs
2. **Update `src/main.ts`** — Replace the example `wait` logic with your action
   logic, reading inputs with `core.getInput()` and setting outputs with
   `core.setOutput()`
3. **Add tests** — Write Jest tests in `__tests__/` using the fixture pattern
4. **Bundle** — Run `task package` to compile and bundle `src/` into `dist/`
5. **Commit `dist/`** — The `dist/` directory must be committed so GitHub
   Actions can run your action directly

## Local Action Testing

Copy `.env.example` to `.env` and configure your inputs, then run:

```bash
task local
```

This uses `@github/local-action` to simulate a GitHub Actions run locally
without needing to push to GitHub.

## CI/CD Workflows

### CI (`ci.yml`)

Runs on every push and pull request:

1. **Format check** — Validates code formatting with Prettier
2. **Lint** — Validates code quality with ESLint
3. **Test** — Runs Jest unit tests
4. **Action test** — Runs the actual action using `uses: ./` to verify it works
   end-to-end

### Check Dist (`check-dist.yml`)

Runs on push and PRs to `main`. Rebuilds the action and compares the result to
the committed `dist/`. Fails if they differ — reminding you to run
`task package` and commit the updated `dist/`.

### Release (`release.yml`)

Runs when a GitHub Release is published. Automatically updates the major version
tag (e.g., `v1`) to point to the new release, so consumers pinning to a major
version receive the update.

## Usage

Fork or clone this repository to use as a template for your new action.
Customize `action.yml` and the `src/` files according to your action's
requirements.

### Required Secrets

| Secret              | Purpose                                                                                                                                      |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `SHARED_REPO_TOKEN` | Fine-grained PAT or GitHub App token with `Contents: Read` access to `JarrodBellmore/shared.tasks`, used to fetch remote Taskfiles during CI |
