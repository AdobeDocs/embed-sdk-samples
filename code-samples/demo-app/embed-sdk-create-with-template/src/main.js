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

const expressImage = document.getElementById("image");

// Configuration for the app
const appConfig = {
  callbacks: {
    onCancel: () => {},
    onPublish: async (intent, publishParams) => {
      // Update the displayed image with the created result
      expressImage.src = publishParams.asset[0].data;
    },
    onError: (err) => {},
  },
};

// Configuration for the export options made available to the user
const exportConfig = [
  {
    id: "download",
    label: "Download",
    action: { target: "download" },
    style: { uiType: "button" },
  },
  {
    id: "saveToHostApp",
    label: "Save in App",
    action: { target: "publish", closeTargetOnExport: true },
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

// Launch Adobe Express editor with template
document.getElementById("createBtn").onclick = async () => {
  const docConfig = {
    templateId: "urn:aaid:sc:VA6C2:32a87038-be14-384b-958e-c396a01d10a0",
  };

  editor.createWithTemplate(docConfig, appConfig, exportConfig, containerConfig);
};
