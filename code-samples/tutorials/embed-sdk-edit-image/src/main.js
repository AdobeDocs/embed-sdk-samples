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
  /* ... */
};

// Initialize the Adobe Express Embed SDK
const { module } = await window.CCEverywhere.initialize(hostInfo, configParams);

const expressImage = document.getElementById("image");

// Blob caching strategy: Keep the image data in memory as a blob for efficient SDK usage
// This avoids re-fetching/converting the image data every time we edit
let currentImageBlob = null;

// Cache the default image as a blob
async function cacheDefaultImageBlob() {
  const response = await fetch(expressImage.src);
  currentImageBlob = await response.blob();
}
await cacheDefaultImageBlob();

// Configuration for the app
const appConfig = {
  appVersion: "2",
  // Callbacks to be used when creating or editing a document
  callbacks: {
    onCancel: () => {},
    onPublish: async (intent, publishParams) => {
      console.log("intent", intent);
      console.log("publishParams", publishParams);

      // Update the displayed image with the edited result
      expressImage.src = publishParams.asset[0].data;

      // Update our cached blob with the edited image (for future edits)
      const response = await fetch(publishParams.asset[0].data);
      currentImageBlob = await response.blob();
    },
    onError: (err) => {
      console.error("Error!", err.toString());
    },
  },
  // allowedFileTypes: ["image/jpeg", "image/png"],
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
    action: { target: "publish" },
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
    // Dual data flow: cache the File (which is a Blob) for SDK, convert to data URL for display
    currentImageBlob = file; // File objects are Blobs - perfect for SDK usage

    // Convert to data URL for immediate display in the <img> element
    const reader = new FileReader();
    reader.onload = (e) => {
      // console.log("e.target.result", e.target.result);
      expressImage.src = e.target.result; // Base64 encoded image data
    };
    reader.readAsDataURL(file);
  }
};

// Launch Adobe Express editor with the current image
document.getElementById("editBtn").onclick = async () => {
  const docConfig = {
    // asset: {
    //   type: "image",
    //   name: "Demo Image",
    //   dataType: "url",
    //   data: expressImage.src, // Remember to set cors in vite.config.js
    // },
    asset: {
      type: "image",
      name: "Demo Image",
      dataType: "blob",
      data: currentImageBlob, // Use cached blob (default or user-selected)
    },
    // intent: "add-effects",
  };

  module.editImage(docConfig, appConfig, exportConfig);
};
