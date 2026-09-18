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
// await import("https://stage.cc-embed.adobe.com/sdk/v4/CCEverywhere.js");
console.log("CCEverywhere loaded", window.CCEverywhere);

// Parameters for initializing the Adobe Express Embed SDK
const hostInfo = {
  clientId: import.meta.env.VITE_API_KEY,
  appName: "Embed SDK Sample",
};

const configParams = { locale: "en-US" };

// Initializing the Adobe Express Embed SDK
// const { editor, module } = await window.CCEverywhere.initialize(
const { editor, module } = await CCEverywhere.initialize(
  hostInfo,
  configParams,
);

// Will hold the project ID when a document is saved on Adobe Express
var existingDocumentId = null;
var expressImage = document.getElementById("savedImage");

// Callbacks to be used when creating or editing a document
const callbacks = {
  onCancel: () => {
    console.log("Process canceled");
  },
  onPublish: (intent, publishParams) => {
    console.log(
      "Document published with intent",
      intent,
      "params",
      publishParams,
    );
    existingDocumentId = publishParams.documentId;
    expressImage.src = publishParams.assetPreview[0].data;
    console.log("Image data", publishParams.assetPreview[0].data);
    // enable the editDesign button
    document.getElementById("editBtn").disabled = false;
    console.log("Project ID", existingDocumentId);
    // Always return a status object to indicate the result of the publish action
    return {
      status: "SUCCESS", // or "DENIED"
    };
  },
  onError: (err) => {
    console.error("Error!", err.toString());
  },
};

const createDesignAppConfig = {
  contentBrowseConfig: {
    // Templates to browse
    categoriesConfig: [
      {
        category: "templates",
        rootCollectionId:
          "urn:aaid:sc:VA6C2:e21f90d3-cc15-4a43-8cfc-afb80f17c1a6",
      },
    ],
    // Template filtering based on number of pages, dimensions, template type
    templateFilters: {
      behaviors: ["still"],
      dimensions: { width: 3.5, height: 2, unit: "in" },
      templateType: "business-card",
    },
    // Adds the CTA for creating a blank document
    showCreateNew: true,

    // Template Browser title
    headerText: "Browse our collection of templates",
    hideSearchBar: true,
    hideFilters: true,
    disablePremiumContent: true,
  },
  allowedFileTypes: ["application/pdf", "image/jpeg", "image/png"],
  variant: "print", // or "default"
  // variant: "default", // or "print"
  callbacks,
};

const editDesignAppConfig = {
  // Tailors the experience to the Print use case
  variant: "print",
  editorGuideConfig: {
    showBleed: true,
    showMargins: true,
    showRulers: true,
  },
  pdfPrintConfig: {
    includeCropMarks: true,
    includeBleed: true,
    colorMode: "cmyk",
    cmykColorProfile: "Coated GRACoL 2006 (ISO 12647-2:2004)",
  },
  allowedFileTypes: ["application/pdf", "image/jpeg", "image/png"],
  // Disable premium content
  contentConfig: { hidePremiumContent: true },
  callbacks,
};

// Configuration for the export options made available to the user
// when creating or editing a document
const sharedExportConfig = [
  {
    id: "save-asset-pdf",
    label: "Save PDF",
    action: {
      target: "publish",
      publishFileType: "application/pdf",
      outputType: "url", // or "blob"
      subFileType: "pdfPrint",
      enableByDefault: true,
      previewConfig: {
        enabled: true,
        fileType: "image/png",
        outputType: "base64", // or "blob"
        scale: 0.25, // or 1.5
      },
    },
    style: { uiType: "button" },
  },
  {
    id: "save-asset-img",
    label: "Save Image",
    action: {
      target: "publish",
      publishFileType: "image/png",
      outputType: "blob",
      // subFileType: "pdfPrint",
      enableByDefault: true,
      previewConfig: {
        enabled: true,
        fileType: "image/png",
        outputType: "base64", // or "blob"
        scale: 0.25, // or 1.5
      },
    },
    style: { uiType: "button" },
  },
];

const sharedContainerConfig = {
  // mode: "fill", // or "inline", "modal"
  mode: "fill",
  hideCloseButton: false,
  // ...
};

// Click handler for the Create Design button
document.getElementById("createBtn").onclick = async () => {
  module.createDesign(
    createDesignAppConfig,
    sharedExportConfig,
    sharedContainerConfig,
  );
};
document.getElementById("editBtn").onclick = async () => {
  const docConfig = { docId: existingDocumentId };
  module.editDesign(
    docConfig,
    editDesignAppConfig,
    sharedExportConfig,
    sharedContainerConfig,
  );
};

document.getElementById("templateBrowserBtn").onclick = async () => {
  module.startFromContent(
    {
      appVersion: "1",
      contentBrowseConfig: {
        // 👈 Configure the Template Browser experience
        categoriesConfig: [
          {
            category: "templates", // 👈 Always "templates"
            collectionId:
              "urn:aaid:sc:VA6C2:e0f161bf-3d73-4ad8-ba20-20722638c625", // 👈 The URN of the collection
          },
        ],
      },
      callbacks: {
        onCancel: () => {},
        onPublish: (intent, publishParams) => {
          console.log("On Publish", intent, publishParams);
          existingDocumentId = publishParams.projectId;
          console.log("Project ID", existingDocumentId);
          expressImage.src = publishParams.asset[0].data;
          console.log("Asset data", publishParams.asset[0].data);
          // enable the editDesign button
          document.getElementById("editBtn").disabled = false;
        },
        onError: (err) => {
          console.error("Error!", err.toString());
        },
      },
    },
    undefined,
    sharedContainerConfig,
  );
};
