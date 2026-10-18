# Contributing to KRM3 Frontend

This repository is the React/Vite frontend of KRM3. It is not deployed on its
own: it is included as a git submodule (`krm3-fe`) in the
[krm3](https://github.com/k-tech-italy/krm3) backend repository, which builds
it and ships it inside the backend Docker image.

## Development setup

See the [README](README.md) for prerequisites. In short:

```bash
nvm use          # or `direnv allow`
yarn install     # also installs the husky git hooks
yarn start
```

## Branches

| Branch       | Purpose                                                  |
| ------------ | -------------------------------------------------------- |
| `develop`    | Integration branch. All feature/fix PRs target it.       |
| `master`     | Released code. Only updated by `develop` → `master` PRs. |
| `feature/*`  | New features, branched from `develop`.                   |
| `fix/*`      | Bug fixes, branched from `develop`.                      |
| `refactor/*` | Refactorings, branched from `develop`.                   |

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/) messages,
e.g. `feat(contacts): ...`, `fix(Expense): ...`,
`chore(release): bump frontend version to 1.5.0`.

The `pre-commit` hook runs `lint-staged`, which formats staged files with
Prettier and lints JS/TS files with ESLint.

## Checks

Before opening a PR, make sure these pass locally:

```bash
yarn lint
yarn test:coverage
yarn build
```

CI ([.github/workflows/test.yml](.github/workflows/test.yml)) runs on every
push and PR to `develop` and `master`:

1. **test** — `yarn install --frozen-lockfile` and `yarn test:coverage`.
2. **version-check** — runs [check_versions.sh](check_versions.sh), which
   compares the `version` in `package.json` with the one in `HEAD~1` and fails
   if it was not increased.

> Because of the version check, **every PR into `develop` must bump the
> version** in `package.json`, and so must the `develop` → `master` PR
> (which it does if `develop` was bumped since the last release).

## Versioning

The frontend follows [Semantic Versioning](https://semver.org/). The single
source of truth is the `version` field in `package.json`:

- `fix:` changes → patch (`1.5.0` → `1.5.1`)
- `feat:` changes → minor (`1.5.0` → `1.6.0`)
- breaking changes → major (`1.5.0` → `2.0.0`)

Bump it without creating a git tag:

```bash
yarn version --no-git-tag-version --patch   # or --minor / --major
```

The version is exposed to the app as `REACT_APP_VERSION` by the `yarn`
scripts, and is shown in the user menu through the `release.json` file that
the backend generates at build time (`make release` in the backend reads it
with `npm pkg get version`).

## Release process

### 1. Merge the changes into `develop`

1. Branch from `develop` (`feature/...`, `fix/...`).
2. Commit your changes and bump `version` in `package.json`, usually as a
   separate `chore(release): bump frontend version to X.Y.Z` commit.
3. Open a PR to `develop`. CI must be green (tests + version check).
4. Get it reviewed and merge it.

### 2. Promote `develop` to `master`

1. Open a PR from `develop` to `master`.
2. Wait for CI to pass, then merge it. The merge commit on `master` is the
   released frontend.

No tag or GitHub release is created in this repository; the version in
`package.json` on `master` identifies the release.

### 3. Publish it through the backend

The frontend reaches users only when the backend is released with an updated
submodule pointer. In your `krm3` checkout, on the backend `develop` branch:

```bash
cd krm3-fe
git fetch origin
git checkout origin/master        # the merge commit from step 2
cd ..
git add krm3-fe
git commit -m "chore: use krm3-fe X.Y.Z"
git push
```

Then follow the backend release process described in
[krm3/RELEASE.md](https://github.com/k-tech-italy/krm3/blob/develop/RELEASE.md):
bump the backend version, merge `develop` → `master`, approve the deployment to
`krm3int`, and manually trigger **Deploy to Production**.

The backend **Build and Deploy** workflow checks out the submodule, runs
`yarn install && yarn build`, writes `release.json` into `krm3-fe/dist`, and
packages the result into the Docker image.

### 4. Verify

After the backend is deployed, open the user menu in the app and check that
the FE version, branch and commit in the release info match what you released.
