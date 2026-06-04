# Adobe Express Embed SDK — Sample Integration

A small, self-contained integration of the [Adobe Express Embed SDK (v4)](https://developer.adobe.com/express/embed-sdk/docs/guides/) that demonstrates three common entry points from a single page:

1. **Full editor** — launch the full Express editor with a blank document.
2. **Browse Instagram templates** — open the v4 templates browser (`module.startFromContent`) pre-filtered to Instagram-style designs.
3. **Edit Image module** — pick a local image and open it in the image editor.

All three flows share an export configuration and surface publish / cancel / error callbacks in a status panel on the page.

## Prerequisites

- Node.js 18+ and npm.
- An Adobe Express Embed SDK **client ID** (API Key). If you don't have one, follow the [Quickstart guide](https://developer.adobe.com/express/embed-sdk/docs/guides/quickstart/) to create one and add `https://localhost:8080` to its list of allowed origins.

## Setup

1. Copy `.env.example` to `.env` and paste your client ID:

   ```bash
   cp .env.example .env
   ```

   ```bash
   # .env
   VITE_API_KEY="your-client-id-here"
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the local HTTPS dev server (Vite + `vite-plugin-mkcert`):

   ```bash
   npm run start
   ```

4. Open [https://localhost:8080](https://localhost:8080) in your browser.

   > The first run will create a local trusted certificate via `mkcert`. The Embed SDK requires the host page to be served over HTTPS even during development.

## Project layout

```
embed-sdk-sample-integration/
├── .env.example        # Template — copy to .env and fill in your client ID
├── .gitignore
├── index.html          # UI markup with three action cards
├── main.js             # SDK init + three flow handlers
├── package.json
├── style.css
└── vite.config.js      # HTTPS dev server on port 8080
```

## How it works

`main.js` dynamically loads the v4 Embed SDK from Adobe's CDN, initializes it with your client ID, and wires three buttons to the SDK's `editor.create(...)` and `module.editImage(...)` APIs. Every flow registers the same `onPublish` / `onCancel` / `onError` callbacks so you can watch the lifecycle in the on-page **Status** panel.

The client ID is read from `import.meta.env.VITE_API_KEY` (provided by Vite from `.env`) — it is **not** hardcoded in source. Adobe enforces Embed SDK security via the **allowed-origins** list configured in the Adobe Developer Console, so make sure `https://localhost:8080` is registered there.

## Learn more

- [Embed SDK guides](https://developer.adobe.com/express/embed-sdk/docs/guides/)
- [Embed SDK tutorials](https://developer.adobe.com/express/embed-sdk/docs/guides/tutorials/)
- [Community forum](https://community.adobe.com/t5/adobe-express-embed-sdk/ct-p/ct-express-embed-sdk)
