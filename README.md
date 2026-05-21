# action.netrc-credentials

## Purpose

This repository provides a reusable **GitHub Action** that writes a `.netrc`
entry so CLI tools — such as `git`, `curl`, and `wget` — can authenticate
against a remote host without embedding credentials in URLs or duplicating shell
snippets across every workflow.

Instead of copy-pasting this pattern into every repository:

```bash
{
  echo "machine github.com"
  echo "  login x-access-token"
  printf '  password %s\n' "$TOKEN"
} > "$HOME/.netrc"
chmod 600 "$HOME/.netrc"
```

you call a single, versioned action:

```yaml
- uses: JarrodBellmore/action.netrc-credentials@v1
  with:
    machine: github.com
    login: x-access-token
    password: ${{ secrets.SHARED_REPO_TOKEN }}
```

## Inputs

| Input      | Required | Default          | Description                                  |
| ---------- | -------- | ---------------- | -------------------------------------------- |
| `machine`  | yes      | `github.com`     | Hostname to authenticate (e.g. `github.com`) |
| `login`    | yes      | `x-access-token` | Username for the machine                     |
| `password` | yes      | —                | Password or token for the machine            |

## Outputs

| Output       | Description                                         |
| ------------ | --------------------------------------------------- |
| `netrc-path` | Absolute path to the `.netrc` file that was written |

## Usage

### Authenticate to GitHub

```yaml
- uses: JarrodBellmore/action.netrc-credentials@v1
  with:
    machine: github.com
    login: x-access-token
    password: ${{ secrets.GITHUB_TOKEN }}
```

### Authenticate to a private registry

```yaml
- uses: JarrodBellmore/action.netrc-credentials@v1
  with:
    machine: registry.example.com
    login: my-bot
    password: ${{ secrets.REGISTRY_TOKEN }}
```

### Multiple machines

Call the action once per machine:

```yaml
- uses: JarrodBellmore/action.netrc-credentials@v1
  with:
    machine: github.com
    login: x-access-token
    password: ${{ secrets.GITHUB_TOKEN }}

- uses: JarrodBellmore/action.netrc-credentials@v1
  with:
    machine: registry.example.com
    login: bot
    password: ${{ secrets.REGISTRY_TOKEN }}
```

Each call appends (or replaces) only the entry for the specified machine, so
subsequent calls do not clobber earlier ones.

---

## Development

This action is built with the Taskfile + Docker Compose conventions from
[JarrodBellmore/starter.spa](https://github.com/JarrodBellmore/starter.spa).

### Prerequisites

Install the [Task](https://taskfile.dev/installation/) task runner. For local
development, install the [GitHub CLI](https://cli.github.com/) and authenticate
so Task can access remote Taskfiles:

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
| `task build`      | Bundle the action (generates `dist/`)               |
| `task test`       | Run Vitest unit tests                               |
| `task lint`       | Lint the source code with ESLint                    |
| `task format`     | Check code formatting with Prettier                 |
| `task format:fix` | Auto-fix code formatting                            |
| `task local`      | Run the action locally using `@github/local-action` |
| `task shell`      | Open an interactive shell in the container          |
| `task clean`      | Remove `node_modules`, `dist`, and `coverage`       |

### Local Action Testing

Copy `.env.example` to `.env` and fill in your token, then run:

```bash
cp .env.example .env
# edit .env — set INPUT_PASSWORD to a real token
task local
```

This uses `@github/local-action` to simulate a GitHub Actions run locally
without needing to push to GitHub.

## Project Structure

```
.
├── src/
│   ├── index.ts          # Action entrypoint (imports and calls run())
│   ├── main.ts           # Action orchestration — reads inputs, calls netrc
│   └── netrc.ts          # Core .netrc read/write/update logic
├── __tests__/
│   ├── main.test.ts      # Tests for main.ts
│   └── netrc.test.ts     # Tests for netrc.ts
├── dist/                 # Bundled output (committed to repo)
├── action.yml            # GitHub Action definition
├── vite.config.ts        # Vite bundler configuration
├── vitest.config.ts      # Vitest test configuration
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

## CI/CD Workflows

### CI (`ci.yml`)

Runs on every push and pull request:

1. **Format check** — Validates code formatting with Prettier
2. **Lint** — Validates code quality with ESLint
3. **Test** — Runs Vitest unit tests
4. **Action test** — Runs the actual action using `uses: ./` to verify it works
   end-to-end

### Check Dist (`check-dist.yml`)

Runs on push and PRs to `main`. Rebuilds the action and compares the result to
the committed `dist/`. Fails if they differ — reminding you to run `task build`
and commit the updated `dist/`.

### Release (`release.yml`)

Runs when a GitHub Release is published. Automatically updates the major version
tag (e.g., `v1`) to point to the new release.

### Required Secrets

| Secret              | Purpose                                                                                                                                      |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `SHARED_REPO_TOKEN` | Fine-grained PAT or GitHub App token with `Contents: Read` access to `JarrodBellmore/shared.tasks`, used to fetch remote Taskfiles during CI |
