# Safari/WebKit `localhost` E2E Failure Reproduction

Reproduces two separate bugs that cause Safari/WebKit Playwright tests to fail in Docker when
`PLAYWRIGHT_BASE_URL` uses `localhost`:

1. **IPv6 connection failure** — WebKit on Linux resolves `localhost` to `::1` first. If the server
   only listens on `0.0.0.0` (IPv4), WebKit gets connection refused. Chrome and Firefox fall back to
   IPv4; WebKit does not.
2. **`storageState` cookie bug** ([#39380](https://github.com/microsoft/playwright/issues/39380)) —
   WebKit drops cookies with `domain: "localhost"` when restoring `storageState` because RFC 6761
   marks `localhost` as a special-use domain.

## Why the bug only manifests in Docker

The compose topology mirrors the actual flex setup: a `test` container shares the `server`
container's network namespace via `network_mode: service:server`. This means both containers share
the same loopback interface, but the Linux resolver behaviour (IPv6-first for `localhost`) still
applies inside the test container.

On macOS, `localhost` resolves to `127.0.0.1` (IPv4) consistently, so the connection failure never
occurs locally.

## Usage

### IPv4-only server — reproduces the connection failure

```bash
docker compose run test
```

With `server.js 0.0.0.0` (the default in `compose.yml`), the server only listens on IPv4. WebKit
attempts `::1` first and gets connection refused. The tests in `docker.spec.ts` will fail.

### Dual-stack server — applies the fix

Edit `compose.yml` and change the server command:

```yaml
command: node server.js ::   # was: node server.js 0.0.0.0
```

Then run:

```bash
docker compose run test
```

The server now listens on `[::]` (dual-stack). WebKit connects successfully via IPv6. The cookie
`storageState` test may still fail depending on whether the installed Playwright version includes
the fix for [#39380](https://github.com/microsoft/playwright/issues/39380).

### Local (macOS) — not a valid reproduction

```bash
npx playwright test tests/example.spec.ts
```

This passes on macOS because `localhost` resolves to IPv4 and the in-process server binds to
`0.0.0.0`. It does not reproduce either bug.

## Files

| File | Purpose |
|------|---------|
| `server.js` | Minimal HTTP server. Accepts a bind address as the first argument (default `0.0.0.0`). Echoes cookies and exposes `window.isSecureContext`. |
| `compose.yml` | flex-like topology: `server` container + `test` container sharing server's network namespace. |
| `tests/docker.spec.ts` | Tests against the Docker server at `localhost:3000`. Isolates the Docker networking failure from the in-process server scenario. |
| `tests/example.spec.ts` | Original in-process server test. Server now binds to `0.0.0.0` (was `127.0.0.1`) to isolate the cookie issue from the IPv6 connectivity issue. |
