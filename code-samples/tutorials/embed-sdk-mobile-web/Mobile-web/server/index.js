import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import express from "express";
import isMobile from "is-mobile";
import { createProxyMiddleware } from "http-proxy-middleware";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const isDevMode =
  process.argv.includes("--dev") || !process.argv.includes("--prod");
const serverMode = isDevMode ? "dev" : "prod";

const port = Number.parseInt(process.env.PORT || "5566", 10);
const viteOrigin = process.env.VITE_DEV_ORIGIN || "https://localhost:5173";
const distDir = path.resolve(rootDir, "dist");
const distFantasyHtmlPath = path.resolve(distDir, "src/fantasy-chess.html");

const keyPath = resolvePath(process.env.SSL_KEY_PATH || "certs/localhost.key");
const certPath = resolvePath(
  process.env.SSL_CERT_PATH || "certs/localhost.crt",
);
const PLATFORM_ANDROID = "android";
const PLATFORM_IOS = "iOS";
const PLATFORM_MOBILE_WEB = "mobile-web";
const PLATFORM_DESKTOP_WEB = "desktop-web";

/**
 * Resolves an absolute path from either absolute or project-relative input.
 * @param {string} filePath
 * @returns {string}
 */
function resolvePath(filePath) {
  return path.isAbsolute(filePath) ? filePath : path.resolve(rootDir, filePath);
}

/**
 * Resolves platform metadata from query param and user agent.
 * @param {string | undefined} rawPlatform
 * @param {string} userAgent
 * @returns {{ normalizedPlatform: string, isMobileUa: boolean }}
 */
function normalizePlatform(rawPlatform, userAgent) {
  const normalizedRaw = String(rawPlatform || "")
    .trim()
    .toLowerCase();

  if (normalizedRaw === "ios") {
    return { normalizedPlatform: PLATFORM_IOS, isMobileUa: true };
  }

  if (normalizedRaw === "android") {
    return { normalizedPlatform: PLATFORM_ANDROID, isMobileUa: true };
  }

  const isMobileUa = isMobile({ ua: userAgent, tablet: true });
  return {
    normalizedPlatform: isMobileUa
      ? PLATFORM_MOBILE_WEB
      : PLATFORM_DESKTOP_WEB,
    isMobileUa,
  };
}

/**
 * Injects server-owned platform globals ahead of the first module script tag.
 * @param {string} html
 * @param {string} normalizedPlatform
 * @returns {string}
 */
function injectPlatformScript(html, normalizedPlatform) {
  const platformLiteral = JSON.stringify(normalizedPlatform);
  const injection = `<script>window.__PLATFORM__=${platformLiteral};window.PLATFORM=window.__PLATFORM__;</script>`;

  const moduleScriptIndex = html.search(
    /<script\b[^>]*type=["']module["'][^>]*>/i,
  );
  if (moduleScriptIndex !== -1) {
    return `${html.slice(0, moduleScriptIndex)}${injection}\n${html.slice(moduleScriptIndex)}`;
  }

  const headCloseIndex = html.search(/<\/head>/i);
  if (headCloseIndex !== -1) {
    return `${html.slice(0, headCloseIndex)}${injection}\n${html.slice(headCloseIndex)}`;
  }

  return `${html}\n${injection}`;
}

/**
 * Reads Vite's transformed dev HTML for a specific entry path over HTTPS.
 * @param {string} entryPath
 * @returns {Promise<string>}
 */
function fetchDevHtml(entryPath) {
  return new Promise((resolve, reject) => {
    const target = new URL(entryPath, viteOrigin);

    const request = https.request(
      {
        hostname: target.hostname,
        port: target.port,
        path: `${target.pathname}${target.search}`,
        method: "GET",
        rejectUnauthorized: false,
      },
      (response) => {
        let body = "";

        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          body += chunk;
        });

        response.on("end", () => {
          if (!response.statusCode || response.statusCode >= 400) {
            reject(
              new Error(
                `Failed to load Vite index HTML from ${viteOrigin} (status=${response.statusCode || "unknown"})`,
              ),
            );
            return;
          }

          resolve(body);
        });
      },
    );

    request.on("error", (error) => {
      reject(error);
    });

    request.end();
  });
}

/**
 * Resolves the source HTML for a requested entry path in dev/prod.
 * @param {string} entryPath
 * @returns {Promise<string>}
 */
async function loadSourceHtml(entryPath) {
  if (isDevMode) {
    if (entryPath === "/" || entryPath === "/fantasy-chess.html") {
      return fetchDevHtml("/src/fantasy-chess.html");
    }
    return fetchDevHtml(entryPath);
  }

  const distHtmlPath =
    entryPath === "/"
      ? distFantasyHtmlPath
      : path.resolve(distDir, entryPath.replace(/^\//, ""));

  const resolvedPath = fs.existsSync(distHtmlPath)
    ? distHtmlPath
    : distFantasyHtmlPath;
  return fs.promises.readFile(resolvedPath, "utf8");
}

/**
 * Reads TLS cert files used by Express HTTPS.
 * @returns {{ key: Buffer, cert: Buffer }}
 */
function loadTlsCredentials() {
  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    throw new Error(
      [
        "Missing HTTPS certificate files for Express.",
        `Expected key:  ${keyPath}`,
        `Expected cert: ${certPath}`,
        "Run `npm run gen:cert` to generate localhost certs.",
      ].join("\n"),
    );
  }

  return {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };
}

const app = express();
app.disable("x-powered-by");

async function handleInjectedHtml(request, response) {
  const rawPlatform = Array.isArray(request.query.platform)
    ? request.query.platform[0]
    : request.query.platform;
  const userAgent = request.get("user-agent") || "";

  const { normalizedPlatform, isMobileUa } = normalizePlatform(
    rawPlatform,
    userAgent,
  );

  console.log(
    `[server:${serverMode}] ${request.path} rawPlatform=${rawPlatform || "<omitted>"} normalizedPlatform=${normalizedPlatform} uaMobile=${isMobileUa}`,
  );

  try {
    const sourcePath = request.path;
    const sourceHtml = await loadSourceHtml(sourcePath);
    const injectedHtml = injectPlatformScript(sourceHtml, normalizedPlatform);

    response.setHeader("Content-Type", "text/html; charset=utf-8");
    response.send(injectedHtml);
  } catch (error) {
    console.error(
      `[server] Failed to render injected HTML for ${request.path}`,
      error,
    );
    response
      .status(500)
      .send(`Unable to render ${request.path}. See server logs.`);
  }
}

const injectedRoutes = ["/", "/fantasy-chess.html", "/src/fantasy-chess.html"];
app.get(injectedRoutes, handleInjectedHtml);
app.get("/embed", (_request, response) => {
  response.status(404).send("Route not found.");
});

let devProxy = null;
if (isDevMode) {
  devProxy = createProxyMiddleware({
    target: viteOrigin,
    changeOrigin: true,
    secure: false,
    ws: true,
  });

  app.use((request, response, next) => {
    if (injectedRoutes.includes(request.path)) {
      next();
      return;
    }
    devProxy(request, response, next);
  });
} else {
  app.use(express.static(distDir, { index: false }));

  app.get("*", (_request, response) => {
    response.redirect("/");
  });
}

const tlsCredentials = loadTlsCredentials();
const httpsServer = https.createServer(tlsCredentials, app);

if (isDevMode && devProxy) {
  httpsServer.on("upgrade", devProxy.upgrade);
}

httpsServer.listen(port, () => {
  console.log(`[server] mode=${serverMode}`);
  console.log(`[server] listening at https://localhost:${port}`);
  console.log(`[server] express cert: ${certPath}`);
  console.log(`[server] express key:  ${keyPath}`);
  if (isDevMode) {
    console.log(`[server] proxying non-injected requests to ${viteOrigin}`);
  } else {
    console.log(`[server] serving static assets from ${distDir}`);
  }
});
