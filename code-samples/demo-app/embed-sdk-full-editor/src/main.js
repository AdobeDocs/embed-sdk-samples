/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import "./style.css";

// Importing theme and typography styles from Spectrum Web Components
import "@spectrum-web-components/styles/typography.css";
import "@spectrum-web-components/theme/express/theme-light.js";
import "@spectrum-web-components/theme/express/scale-medium.js";
import "@spectrum-web-components/theme/sp-theme.js";

// Importing Spectrum Web Components
import "@spectrum-web-components/button/sp-button.js";
import "@spectrum-web-components/button-group/sp-button-group.js";
import "@spectrum-web-components/divider/sp-divider.js";

// Importing the Adobe Express Embed SDK
await import("https://cc-embed.adobe.com/sdk/v4/CCEverywhere.js");

// Parameters for initializing the Adobe Express Embed SDK
const hostInfo = {
  clientId: import.meta.env.VITE_API_KEY,
  appName: "Embed SDK Sample",
};

// Prompts the user to login only when exporting/saving the document
const configParams = {
  loginMode: "delayed",
};

// Initializing the Adobe Express Embed SDK
const { editor } = await window.CCEverywhere.initialize(hostInfo, configParams);

// Will hold the project ID when a document is saved on Adobe Express
var existingProjectId = null;
var expressImage = document.getElementById("savedImage");

// Helper function to set image URL
const setImageURL = (url) => {
  expressImage.src = url;
};

// Callbacks to be used when creating or editing a document
const callbacks = {
  onCancel: () => {},
  onPublish: (intent, publishParams) => {
    existingProjectId = publishParams.projectId;
    expressImage.src = publishParams.asset[0].data;
    setImageURL(publishParams.asset[0].data);
    // enable the editDesign button
    const editBtn = document.getElementById("editDesign") || document.getElementById("editBtn");
    if (editBtn) {
      editBtn.disabled = false;
    }
  },
  onError: (err) => {},
};

// Configuration for the app, shared by both Create and Edit flows
const appConfig = {
  selectedCategory: "media",
  templateType: "all",
  allowedFileTypes: ['image/png', 'image/jpeg'],
  multiPage: true,
  callbacks,
};

// Configuration for the export options made available to the user
// when creating or editing a document
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

// Container configuration
const containerConfig = {
  width: "100%",
  height: "600px",
  showDarkerBackgroundForLoader: true,
  showExpressIconWithText: true,
};

// Click handler for the Create Design button
document.getElementById("createBtn").onclick = async () => {
  // Presetting the canvas size
  const canvasSize = "BusinessCard";
  const docConfig = { canvasSize };
  // Using the global appConfig and exportConfig
  editor.create(docConfig, appConfig, exportConfig, containerConfig);
};

// Click handler for the Edit Design button
document.getElementById("editBtn").onclick = async () => {
  // Opening the existing project by ID
  const docConfig = { documentId: existingProjectId };
  // Using the global appConfig and exportConfig
  editor.edit(docConfig, appConfig, exportConfig, containerConfig);
};
