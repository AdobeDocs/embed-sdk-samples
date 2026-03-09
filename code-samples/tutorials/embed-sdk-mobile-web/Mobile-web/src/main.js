import "./style.css";
import "@spectrum-web-components/styles/typography.css";
import "@spectrum-web-components/theme/express/theme-light.js";
import "@spectrum-web-components/theme/express/scale-medium.js";
import "@spectrum-web-components/theme/sp-theme.js";
import "@spectrum-web-components/button/sp-button.js";
import "@spectrum-web-components/divider/sp-divider.js";
import "@spectrum-web-components/field-label/sp-field-label.js";
import "@spectrum-web-components/textfield/sp-textfield.js";
import "@spectrum-web-components/badge/sp-badge.js";

const promptInput = document.getElementById("promptInput");
const generateBtn = document.getElementById("generateBtn");
const savedImage = document.getElementById("savedImage");
const statusText = document.getElementById("statusText");
const platformPill = document.getElementById("platformPill");
const badgeCard = document.getElementById("badgeCard");

const serverPlatform = String(window.__PLATFORM__ || "desktop-web");
window.PLATFORM = serverPlatform;
platformPill.textContent = serverPlatform;

let embedModule = null;
let sdkReady = false;
let useMockFlow = false;

/**
 * Normalizes platform strings for SDK metadata.
 * Keeps web values unchanged while forcing native values to exact casing.
 * @param {string} value
 * @returns {string}
 */
function normalizeSdkPlatform(value) {
  const raw = String(value || "").trim();
  const lower = raw.toLowerCase();

  if (lower === "ios") {
    return "iOS";
  }
  if (lower === "android") {
    return "android";
  }
  return raw || "desktop-web";
}

const sdkPlatform = normalizeSdkPlatform(window.PLATFORM);
window.PLATFORM = sdkPlatform;
platformPill.textContent = sdkPlatform;

/**
 * Updates the status area in the demo UI.
 * @param {string} message
 */
function setStatus(message) {
  if (!statusText) {
    return;
  }
  statusText.textContent = message;
}

/**
 * Maps an arbitrary prompt to a deterministic color for the mock preview.
 * @param {string} value
 * @returns {string}
 */
function colorFromPrompt(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 75%)`;
}

/**
 * Produces a small inline SVG data URL to simulate a generated image.
 * @param {string} prompt
 * @returns {string}
 */
function createMockImage(prompt) {
  const cleanPrompt = prompt.slice(0, 72) || "Generated mock image";
  const bgColor = colorFromPrompt(cleanPrompt);
  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' width='1024' height='640'>
      <rect width='1024' height='640' fill='${bgColor}' />
      <rect x='32' y='32' width='960' height='576' fill='rgba(255,255,255,0.68)' rx='18' />
      <text x='58' y='130' font-size='44' font-family='Arial, sans-serif' fill='#222'>Mock Generate Flow</text>
      <text x='58' y='208' font-size='31' font-family='Arial, sans-serif' fill='#333'>${cleanPrompt}</text>
      <text x='58' y='574' font-size='24' font-family='Arial, sans-serif' fill='#555'>platform=${window.PLATFORM}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Initializes the Embed SDK and caches the module for button actions.
 * Falls back to a mocked flow when SDK init cannot complete.
 * @returns {Promise<void>}
 */
async function initializeSdk() {
  setStatus(`Initializing SDK for ${sdkPlatform}...`);

  try {
    await import("https://cc-embed.adobe.com/sdk/v4/CCEverywhere.js");

    const hostInfo = {
      clientId: import.meta.env.VITE_API_KEY,
      appName: "Embed SDK mWeb Demo",
    };

    const configParams = {
      loginMode: "delayed",
      metaData: { platform: sdkPlatform },
      skipBrowserSupportCheck: ["iOS", "android", "mobile-web"].includes(
        sdkPlatform,
      ),
    };

    const initResult = await window.CCEverywhere.initialize(
      hostInfo,
      configParams,
    );
    embedModule = initResult.module;
    sdkReady = true;

    setStatus("SDK ready.");

    console.log("[client] SDK initialized", {
      serverPlatform,
      configParams,
      hasApiKey: Boolean(import.meta.env.VITE_API_KEY),
    });
  } catch (error) {
    useMockFlow = true;
    setStatus("SDK unavailable, using mocked generate flow.");
    console.warn("[client] SDK init failed, mock mode enabled", error);
  }

  generateBtn.disabled = false;
}

/**
 * Runs the actual SDK generation call when available.
 * @param {string} prompt
 * @returns {Promise<void>}
 */
async function runSdkGenerate(prompt) {
  if (!embedModule || typeof embedModule.createImageFromText !== "function") {
    throw new Error("createImageFromText is unavailable on SDK module");
  }

  const callbacks = {
    onPublish: (_intent, publishParams) => {
      const imageAsset = publishParams?.asset?.[0]?.data;
      if (imageAsset) {
        savedImage.src = imageAsset;
      }
      setStatus("Publish callback received from Adobe Express.");
    },
    onError: (error) => {
      setStatus("SDK returned an error. Falling back to mock image.");
      console.error("[client] SDK onError callback", error);
      savedImage.src = createMockImage(prompt);
    },
    onCancel: () => {
      setStatus("Action canceled by user.");
    },
  };

  const appConfig = {
    appVersion: "2",
    loginMode: "delayed",
    metaData: { platform: sdkPlatform },
    promptInputPlaceholder: prompt,
    imageDimensions: {
      aspectRatio: "square",
      size: {
        width: 512,
        height: 512,
        unit: "px",
      },
    },
    panelSettings: {
      contentType: {
        value: "auto",
      },
    },
    callbacks,
  };

  const exportConfig = [
    {
      id: "save-image",
      label: "Save image",
      action: { target: "publish" },
      style: { uiType: "button" },
    },
  ];

  await embedModule.createImageFromText(appConfig, exportConfig);
}

/**
 * Handles Generate Image clicks for SDK and mock paths.
 * @returns {Promise<void>}
 */
async function handleGenerateClick() {
  const prompt =
    promptInput.value.trim() ||
    "Chess club badge with a knight icon centerpiece, premium sports badge style, crisp vector look";

  setStatus("Generating badge...");
  generateBtn.disabled = true;

  try {
    if (sdkReady && !useMockFlow) {
      await runSdkGenerate(prompt);
      return;
    }

    savedImage.src = createMockImage(prompt);
    setStatus("Mock badge generated.");
  } catch (error) {
    console.error("[client] Generate action failed", error);
    savedImage.src = createMockImage(prompt);
    setStatus("Generate failed; fallback mock badge was created.");
  } finally {
    generateBtn.disabled = false;
  }
}

generateBtn.disabled = true;
generateBtn.addEventListener("click", handleGenerateClick);

// ===== TEMPORARY FANTASY-CHESS BADGE CLICK SUPPORT (SAFE TO REMOVE LATER) =====
if (badgeCard) {
  badgeCard.addEventListener("click", () => {
    if (!generateBtn.disabled) {
      void handleGenerateClick();
    }
  });

  badgeCard.addEventListener("keydown", (event) => {
    if ((event.key === "Enter" || event.key === " ") && !generateBtn.disabled) {
      event.preventDefault();
      void handleGenerateClick();
    }
  });
}
// ===== END TEMPORARY FANTASY-CHESS BADGE CLICK SUPPORT =====

void initializeSdk();
