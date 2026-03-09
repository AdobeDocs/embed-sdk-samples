import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { createServer } from "vite";
import mkcert from "vite-plugin-mkcert";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const keyPath = path.resolve(rootDir, "certs/localhost.key");
const certPath = path.resolve(rootDir, "certs/localhost.crt");

/**
 * Checks whether expected certificate output files exist.
 * @returns {boolean}
 */
function hasCertFiles() {
  return fs.existsSync(keyPath) && fs.existsSync(certPath);
}

/**
 * Validates expected certificate output files.
 * @returns {void}
 */
function assertCertFiles() {
  if (!hasCertFiles()) {
    throw new Error(
      `Certificate generation did not produce expected files:\n${keyPath}\n${certPath}`,
    );
  }
}

/**
 * Uses the shell fallback script to create self-signed cert files.
 * @returns {void}
 */
function runOpenSslFallback() {
  const scriptPath = path.resolve(rootDir, "scripts/gen-cert.sh");
  const result = spawnSync("bash", [scriptPath], {
    cwd: rootDir,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error(`OpenSSL fallback failed with status ${result.status}`);
  }

  assertCertFiles();
  console.log("[cert] generated fallback self-signed certs via OpenSSL.");
}

/**
 * Generates HTTPS certs by bootstrapping Vite once.
 * This triggers vite-plugin-mkcert, which handles local CA setup.
 * @returns {Promise<void>}
 */
async function generateCertificates() {
  let viteServer;

  try {
    viteServer = await createServer({
      configFile: false,
      clearScreen: false,
      mode: "development",
      root: rootDir,
      plugins: [
        mkcert({
          savePath: "certs",
          keyFileName: "localhost.key",
          certFileName: "localhost.crt",
          hosts: ["localhost", "127.0.0.1", "::1"],
        }),
      ],
      server: {
        https: true,
        host: "localhost",
        port: 0,
        strictPort: false,
      },
    });

    await viteServer.listen();
    assertCertFiles();

    console.log(`[cert] generated key:  ${keyPath}`);
    console.log(`[cert] generated cert: ${certPath}`);
    console.log("[cert] certs are generated via vite-plugin-mkcert.");
  } finally {
    if (viteServer) {
      await viteServer.close();
    }
  }
}

generateCertificates().catch((error) => {
  console.warn("[cert] trusted cert generation failed via vite-plugin-mkcert.");
  console.warn(`[cert] reason: ${error.message}`);

  if (hasCertFiles()) {
    console.warn("[cert] reusing existing cert files.");
    return;
  }

  console.warn("[cert] falling back to OpenSSL self-signed cert generation.");

  try {
    runOpenSslFallback();
  } catch (fallbackError) {
    console.error("[cert] OpenSSL fallback also failed.");
    console.error(fallbackError);
    process.exitCode = 1;
  }
});
