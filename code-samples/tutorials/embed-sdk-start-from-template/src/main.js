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
const { module } = await window.CCEverywhere.initialize(hostInfo, configParams);

const outputContainer = document.getElementById("output-container");

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

// Configuration for the export options
const exportConfig = [
  {
    id: "download",
    label: "Download",
    action: { target: "download" },
    style: { uiType: "button" },
  },
  {
    closeTargetOnExport: true,
    id: "save-template-asset",
    label: "Save Template",
    action: { target: "publish" },
    style: { uiType: "button" },
  },
];

// Container configuration
const containerConfig = {
  width: "100%",
  height: "600px",
  showDarkerBackgroundForLoader: true,
  showExpressIconWithText: true,
};

// Launch Start from Template module
document.getElementById("browseBtn").onclick = () => {
  const appConfig = {
    colorTheme: "light",
    contentBrowseConfig: {
      headerText: "Jump-start your inspiration with thousands of professionally designed templates",
      searchQuery: "Instagram story",
      hideSearchBar: false,
      hideFilters: false,
      shortcutPillTerms: ["Social", "Business", "Events", "Personal", "Creative"],
      categoriesConfig: [{ category: "templates" }],
    },
    callbacks: {
      onPublish: (intent, publishParams) => {
        console.log("intent", intent);
        console.log("publishParams", publishParams);
        const localData = publishParams.asset[0].data;
        const assetType = publishParams.asset[0].type || "image";
        displayOutput(localData, assetType);
        window.CCEverywhere.close();
      },
      onIntentChange: () => ({ exportConfig }),
    },
  };

  module.startFromContent(appConfig, null, containerConfig);
};
