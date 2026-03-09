# Web-embed (mWeb tutorial scaffold)

This project is the Adobe Express Embed SDK **mWeb** demo scaffold.

It provides:

- A Vite-built client (ESM + Spectrum Web Components)
- An Express HTTPS server on `https://localhost:5566`
- Server-authoritative platform injection (`window.__PLATFORM__`) for browser and WebView
- A minimal Generate Image flow (SDK-first, mock fallback)

## Platform normalization (server authoritative)

Incoming `?platform=` query values are normalized to these exact values:

- `platform=ios` -> `"iOS"`
- `platform=android` -> `"android"`
- no platform query + mobile UA -> `"mobile-web"`
- no platform query + non-mobile UA -> `"desktop-web"`

For each `/embed` request, the server logs:

- raw incoming platform query value
- normalized platform value

The server injects:

```html
<script>window.__PLATFORM__="...";window.PLATFORM=window.__PLATFORM__;</script>
```

before the first module script tag.

## Requirements

- Node.js 20+
- npm

## Install

```bash
npm install
```

## HTTPS certificates for Express

Express requires:

- `certs/localhost.key`
- `certs/localhost.crt`

Generate them with one command:

```bash
npm run gen:cert
```

This runs `scripts/gen-cert.js`, which bootstraps Vite once and lets
[`vite-plugin-mkcert`](https://github.com/liuweiGL/vite-plugin-mkcert) generate:

- `certs/localhost.key`
- `certs/localhost.crt`

No manual `mkcert` installation is required in project setup.

If you want a simple self-signed fallback, use:

```bash
npm run gen:cert:openssl
```

## Environment

Create `.env` from `.env.example` and set your Embed API key:

```bash
cp .env.example .env
```

`VITE_API_KEY` is read in client code via `import.meta.env.VITE_API_KEY`.

## Development mode

```bash
npm run dev
```

`npm run dev` automatically runs `npm run gen:cert` first.

What starts:

- Vite dev server at `https://localhost:5173` (HTTPS using `certs/localhost.*`)
- Express HTTPS server at `https://localhost:5566`

Dev `/embed` flow:

1. Express receives request on `https://localhost:5566/embed`
2. Express fetches Vite dev `index.html`
3. Express injects platform script
4. Express returns injected HTML over HTTPS
5. Non-`/embed` requests are proxied to Vite for HMR/module assets

## Production mode

Build:

```bash
npm run build
```

Start Express:

```bash
npm run start
```

`npm run start` automatically runs `npm run gen:cert` first.

Prod `/embed` flow:

1. Express reads `dist/index.html`
2. Express injects platform script
3. Express serves injected HTML over HTTPS
4. Static assets are served from `dist/`

## Useful URLs

Desktop/mobile browser detection path:

- `https://localhost:5566/embed`

Native app WebView style URLs:

- `https://localhost:5566/embed?platform=ios`
- `https://localhost:5566/embed?platform=android`
