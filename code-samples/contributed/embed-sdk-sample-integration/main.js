/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import "./style.css";

// Spectrum Web Components — theme + UI elements used in index.html
import "@spectrum-web-components/theme/express/theme-light.js";
import "@spectrum-web-components/theme/express/scale-medium.js";
import "@spectrum-web-components/theme/sp-theme.js";
import "@spectrum-web-components/button/sp-button.js";
import "@spectrum-web-components/divider/sp-divider.js";

// The Adobe Express Embed SDK is loaded dynamically from Adobe's CDN.
// Pinning to v4 keeps the API surface used below stable.
await import("https://cc-embed.adobe.com/sdk/v4/CCEverywhere.js");

const statusLog = document.getElementById("statusLog");
const log = (label, payload) => {
  const ts = new Date().toLocaleTimeString();
  const body = payload === undefined ? "" : ` ${JSON.stringify(payload, null, 2)}`;
  statusLog.textContent = `[${ts}] ${label}${body}\n` + statusLog.textContent;
};

// The client ID is read from a Vite env var (VITE_API_KEY in .env). It is not a
// long-lived secret — the Embed SDK is a browser-side library, and Adobe enforces
// access via the allowed-origins list configured in the Adobe Developer Console.
// Even so, we avoid hardcoding it in source so this file can be shared safely.
const clientId = import.meta.env.VITE_API_KEY;
if (!clientId || clientId === "your-api-key-here!") {
  log("Missing VITE_API_KEY. Add it to .env and restart `npm run start`.");
  throw new Error("Missing VITE_API_KEY env variable.");
}

const hostInfo = {
  clientId,
  appName: "Embed SDK Sample Integration",
};

// Defer the Adobe login prompt until the user explicitly publishes/saves.
const configParams = {
  loginMode: "delayed",
};

const ccEverywhere = await window.CCEverywhere.initialize(hostInfo, configParams);
const { editor, module: imageModule } = ccEverywhere;
log("Embed SDK initialized.");

// A shared export configuration. In v4, `action.target` accepts lowercase verbs
// like "download" and "publish"; "publish" routes the asset back into onPublish.
const exportConfig = [
  {
    id: "download",
    label: "Download",
    action: { target: "download" },
    style: { uiType: "button" },
  },
  {
    id: "save-asset",
    label: "Save to my app",
    action: { target: "publish" },
    style: { uiType: "button" },
  },
];

// In v4, onPublish is called with two arguments: (intent, publishParams).
const buildCallbacks = (flowName) => ({
  onPublish: (intent, publishParams) => {
    log(`${flowName}: onPublish`, {
      intent,
      exportButtonId: publishParams?.exportButtonId,
      projectId: publishParams?.projectId,
      assetCount: publishParams?.asset?.length ?? 0,
    });
  },
  onCancel: () => log(`${flowName}: user cancelled`),
  onError: (err) => log(`${flowName}: onError`, { message: err?.toString?.() ?? String(err) }),
});

// ---- Flow 1: Launch the full editor with a blank document --------------------
document.getElementById("launchEditor").addEventListener("click", () => {
  log("Launching full editor…");
  editor.create(
    /* docConfig  */ {},
    /* appConfig  */ { callbacks: buildCallbacks("full-editor") },
    /* exportConfig */ exportConfig,
  );
});

// ---- Flow 2: Browse Instagram-style templates via the templates module -------
// Uses `module.startFromContent` (the v4 templates browser) with a search query.
// This is the supported API for landing on a specific kind of template — passing
// `selectedCategory: "social"` to `editor.create` is NOT a valid v4 parameter and
// triggers INVALID_PARAMETERS.
const templatesContainerConfig = {
  width: "100%",
  height: "600px",
  showDarkerBackgroundForLoader: true,
  showExpressIconWithText: true,
};

document.getElementById("launchSocial").addEventListener("click", () => {
  log("Opening templates browser (Instagram)…");
  const appConfig = {
    colorTheme: "light",
    contentBrowseConfig: {
      headerText: "Pick an Instagram template to start from",
      searchQuery: "Instagram story",
      hideSearchBar: false,
      hideFilters: false,
      shortcutPillTerms: ["Social", "Story", "Post", "Reel", "Quote"],
      categoriesConfig: [{ category: "templates" }],
    },
    callbacks: {
      ...buildCallbacks("templates"),
      // onIntentChange returns the export buttons to show after the user picks
      // a template and customizes it.
      onIntentChange: () => ({ exportConfig }),
    },
  };
  imageModule.startFromContent(appConfig, null, templatesContainerConfig);
});

// ---- Flow 3: Edit an image the user picks from disk --------------------------
const imageInput = document.getElementById("imageInput");
const editImageBtn = document.getElementById("launchEditImage");

let pendingImage = null;

imageInput.addEventListener("change", () => {
  const file = imageInput.files?.[0];
  pendingImage = file ?? null;
  editImageBtn.disabled = !pendingImage;
  if (pendingImage) {
    log("Image selected", { name: pendingImage.name, size: pendingImage.size, type: pendingImage.type });
  }
});

editImageBtn.addEventListener("click", () => {
  if (!pendingImage) return;
  log("Opening Edit Image module…");
  // The v4 Edit Image module accepts the source asset on docConfig.asset.
  // File objects are Blobs, so dataType "blob" is the right choice.
  imageModule.editImage(
    {
      asset: {
        type: "image",
        name: pendingImage.name || "user-image",
        dataType: "blob",
        data: pendingImage,
      },
    },
    {
      appVersion: "2",
      callbacks: buildCallbacks("edit-image"),
    },
    exportConfig,
  );
});
