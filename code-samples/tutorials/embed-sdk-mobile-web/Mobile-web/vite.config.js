import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const certDir = path.resolve(__dirname, "certs");
const keyPath = path.resolve(certDir, "localhost.key");
const certPath = path.resolve(certDir, "localhost.crt");

const httpsConfig =
  fs.existsSync(keyPath) && fs.existsSync(certPath)
    ? {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      }
    : true;

export default defineConfig({
  server: {
    https: httpsConfig,
    host: "localhost",
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        "fantasy-chess": path.resolve(__dirname, "src/fantasy-chess.html"),
      },
    },
  },
});
