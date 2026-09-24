# Adobe Express Embed SDK — Focused Design Editor sample for FedEx

A minimal host page that embeds the Adobe Express **Focused Design Editor (FDE)** with a configuration tailored to FedEx's **print** use case. It shows how to launch a template browser tethered to FDE, re-open a saved design for editing, wire up **client-based entitlement** (centralized GenAI metering), and where **partner identity** (IDPA) plugs in once it ships.

The frontend is plain [Vite](https://vitejs.dev/) + [Spectrum Web Components](https://opensource.adobe.com/spectrum-web-components/); the only backend is a tiny Express endpoint that mints the entitlement token server-side.

## What this sample demonstrates

- **Create Design:** opens the FDE Template Browser via `module.createDesign()`.
- **Edit Design:** edits an existing design via `module.editDesign()`.
- **Template Browser (old):** the older `module.startFromContent()` collection-browse flow, kept for reference.
- **Client-based entitlement:** `useClientAuth: true` plus a `clientAuthProvider` that fetches a client access token from the local token backend, so GenAI usage is metered at FedEx's level.

## Prerequisites

- **Node.js 18+**.
- **An Embed SDK API key**.
- **FFS credentials** (client id + secret) for the entitlement token — shared separately.

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure the Embed SDK key** (frontend). Copy the example and add your key:

   ```bash
   cp src/.env.example src/.env
   ```

   ```bash
   # src/.env
   VITE_API_KEY="your-embed-sdk-key-allowlisting-your-dev-origin"
   ```

3. **Configure the token backend** (entitlement). Copy the example and fill in your FFS credentials:

   ```bash
   cp server/.env.example server/.env
   ```

   ```bash
   # server/.env
   IMS_CLIENT_ID="your-FFS-client-id"
   IMS_CLIENT_SECRET="your-FFS-client-secret"
   IMS_SCOPE="openid,AdobeID,firefly_api,ff_apis"   # leave as-is
   PORT=3000
   ```

   These come from the FFS credential and are independent from the Embed SDK `VITE_API_KEY`.

4. **(Optional) Custom hostname.** `vite.config.js` serves on `https://localhost:5555` and also
   allows `https://test.adobe.com:5555`. To use the latter, add a hosts entry:

   ```
   127.0.0.1  test.adobe.com
   ```

   `vite-plugin-mkcert` generates a locally-trusted cert for both hostnames automatically.

## Run

```bash
npm run dev
```

This starts, together (via `concurrently`):

- **Vite** — the frontend on `https://localhost:5555`
- **Express** — the token backend on `http://localhost:3000`

Vite proxies `/api/*` to the token server, so the browser only ever talks to the single HTTPS origin.

Then open **[https://test.adobe.com:5555](https://test.adobe.com:5555)**.
