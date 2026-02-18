/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

// Import theme and typography styles from Spectrum Web Components
import "@spectrum-web-components/styles/typography.css";
import "@spectrum-web-components/theme/express/theme-light.js";
import "@spectrum-web-components/theme/express/scale-medium.js";
import "@spectrum-web-components/theme/sp-theme.js";

// Import Spectrum Web Components
import "@spectrum-web-components/button/sp-button.js";
import "@spectrum-web-components/button-group/sp-button-group.js";
import "@spectrum-web-components/divider/sp-divider.js";
import "./style.css";

// Import the Adobe Express Embed SDK
await import("https://cc-embed.adobe.com/sdk/v4/CCEverywhere.js");
console.log("CCEverywhere loaded", window.CCEverywhere);

// Parameters for initializing the Adobe Express Embed SDK
const hostInfo = {
  clientId: import.meta.env.VITE_API_KEY,
  appName: "Embed SDK Sample",
};

// Optional parameters
const configParams = {
  loginMode: "delayed",
};

// Initialize the Adobe Express Embed SDK
const { editor } = await window.CCEverywhere.initialize(hostInfo, configParams);

const outputContainer = document.getElementById("output-container");

// Store the current asset blob
let currentAssetBlob = null;
let assetType = "image";

// Helper function to display output
const displayOutput = (data, type) => {
  outputContainer.innerHTML = "";
  if (type === "video") {
    const video = document.createElement("video");
    video.src = data;
    video.controls = true;
    video.autoplay = false;
    outputContainer.appendChild(video);
  } else {
    const img = document.createElement("img");
    img.src = data;
    outputContainer.appendChild(img);
  }
};

// Configuration for the app
const appConfig = {
  callbacks: {
    onCancel: () => {},
    onPublish: async (intent, publishParams) => {
      console.log("intent", intent);
      console.log("publishParams", publishParams);
      const localData = publishParams.asset[0].data;
      const outputType = publishParams.asset[0].type || "image";
      displayOutput(localData, outputType);

      // Update cached blob
      const response = await fetch(localData);
      currentAssetBlob = await response.blob();

      window.CCEverywhere.close();
    },
    onError: (err) => {
      console.error("Error!", err.toString());
    },
  },
};

// Configuration for the export options
const exportConfig = [
  {
    id: "download",
    label: "Download",
    action: { target: "download" },
    style: { uiType: "button" },
  },
  {
    id: "save-modified-asset",
    label: "Save image",
    action: { target: "publish", closeTargetOnExport: true },
    style: { uiType: "button" },
  },
];

// Click handler for the Choose File button
document.getElementById("uploadBtn").onclick = () => {
  document.getElementById("fileInput").click();
};

// Handle file selection
document.getElementById("fileInput").onchange = (event) => {
  const file = event.target.files[0];
  if (file) {
    currentAssetBlob = file;
    assetType = file.type.startsWith("video/") ? "video" : "image";

    const reader = new FileReader();
    reader.onload = (e) => {
      displayOutput(e.target.result, assetType);
    };
    reader.readAsDataURL(file);
  }
};

// Launch Create from Asset
document.getElementById("createBtn").onclick = () => {
  if (!currentAssetBlob) {
    alert("Please select a file first.");
    return;
  }

  const docConfig = {
    asset: {
      type: assetType,
      dataType: "blob",
      data: currentAssetBlob,
    },
  };

  editor.createWithAsset(docConfig, appConfig, exportConfig);
};
