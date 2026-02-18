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
const { quickAction } = await window.CCEverywhere.initialize(hostInfo, configParams);

const outputContainer = document.getElementById("output-container");

// Store the current image blob
let currentImageBlob = null;

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
      const assetType = publishParams.asset[0].type || "image";
      displayOutput(localData, assetType);

      // Update cached blob
      const response = await fetch(localData);
      currentImageBlob = await response.blob();

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
    id: "edit-in-express",
    label: "Open in Adobe Express Editor",
    action: { target: "express" },
    style: { uiType: "button" },
  },
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

// Click handler for the Choose Image button
document.getElementById("uploadBtn").onclick = () => {
  document.getElementById("fileInput").click();
};

// Handle file selection
document.getElementById("fileInput").onchange = (event) => {
  const file = event.target.files[0];
  if (file && file.type.startsWith("image/")) {
    currentImageBlob = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      displayOutput(e.target.result, "image");
    };
    reader.readAsDataURL(file);
  }
};

// Launch Convert to PNG quick action
document.getElementById("convertBtn").onclick = () => {
  if (!currentImageBlob) {
    alert("Please select an image first.");
    return;
  }

  const docConfig = {
    asset: {
      type: "image",
      dataType: "blob",
      data: currentImageBlob,
    },
  };
  const modalParams = {};
  quickAction.convertToPNG(docConfig, appConfig, exportConfig, modalParams);
};
