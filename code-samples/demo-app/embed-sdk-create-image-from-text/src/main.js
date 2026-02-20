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

import { fetchCommunityAssets } from "./community-wall.js";

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
const { module } = await window.CCEverywhere.initialize(hostInfo, configParams);

// Will hold the project ID when a document is saved on Adobe Express
var existingProjectId = null;
var expressImage = document.getElementById("savedImage");
const outputContainer = document.getElementById("output-container");
const placeholderText = outputContainer.querySelector(".placeholder-text");

// Callbacks to be used when creating or editing a document
const callbacks = {
  onCancel: () => {},
  onPublish: (intent, publishParams) => {
    existingProjectId = publishParams.projectId;
    
    if (publishParams.exportButtonId === "saveToHostApp" || publishParams.exportButtonId === "save-modified-asset") {
      expressImage.src = publishParams.asset[0].data;
      expressImage.style.display = "block";
      if (placeholderText) {
        placeholderText.style.display = "none";
      }
    }
  },
  onError: (err) => {},
};

// Container configuration for the SDK module
const containerConfig = {
  width: "100%",
  height: "600px",
  showDarkerBackgroundForLoader: true,
  showExpressIconWithText: true,
};

// Helper functions
const getChecked = (id) => {
  const el = document.getElementById(id);
  return el ? el.checked : false;
};

const getValue = (id) => {
  const el = document.getElementById(id);
  return el ? el.value : '';
};

// Function to build dynamic appConfig based on checkbox states
const buildAppConfig = () => {
  const isCustomCommunityWall = getChecked('custom-community-wall');
  const isEditDropDown = getChecked('edit-dropdown');
  const isPublish = getChecked('publish');
  const publishLabel = getValue('publish-label') || 'Publish';

  // Build thumbnail options array
  const thumbnailOptions = [
    isEditDropDown && 'edit-dropdown',
    getChecked('rich-preview') && 'rich-preview',
    isPublish && 'publish'
  ].filter(Boolean);

  // Build edit dropdown options array
  const editDropdownOptions = [
    'add-effects', 'remove-background', 'apply-adjustment', 
    'insert-object', 'remove-object'
  ].filter(option => getChecked(option)).map(option => ({ "option": option }));

  // Build export config
  const exportConfig = [
    { action: { context: 'new', target: 'express' }, id: 'editor', label: "Create a design", style: { uiType: 'button' } },
    { action: { target: 'download' }, id: 'download', label: 'Download', style: { uiType: 'button' } },
    isPublish && { action: { target: 'publish' }, id: 'saveToHostApp', label: publishLabel, style: { uiType: 'button' } }
  ].filter(Boolean);

  // Build app config
  const appConfig = {
    appVersion: "2",
    thumbnailOptions,
    featureConfig: {
      "community-wall": true,
      "fast-mode": getChecked('fast-mode'),
      "custom-models": getChecked('custom-modal')
    },
    fastModeConfig: { defaultFastModeState: "off" },
    ...(isPublish && { publishConfig: { id: "saveToHostApp", label: publishLabel } }),
    ...(isEditDropDown && { editDropdownOptions }),
    ...(isCustomCommunityWall && { communityWallConfig: { fetchCommunityAssets } }),
    promptInputPlaceholder: "A cat on a leather armchair sipping various cocktails",
    panelSettings: {
      contentType: { value: "graphic" },
      styles: {
        value: ["vector_look", "pop_art", "divine"],
      },
    },
    callbacks,
  };

  return { appConfig, exportConfig };
};

// Conditional rendering functions
const toggleCustomCommunityWall = () => {
  const communityWallChecked = getChecked('community-wall');
  const container = document.getElementById('custom-community-wall-container');
  
  if (container) {
    container.style.display = communityWallChecked ? 'block' : 'none';
    if (!communityWallChecked) {
      document.getElementById('custom-community-wall').checked = false;
    }
  }
};

const togglePublishLabel = () => {
  const publishChecked = getChecked('publish');
  const container = document.getElementById('publish-label-container');
  
  if (container) {
    container.style.display = publishChecked ? 'block' : 'none';
    if (!publishChecked) {
      document.getElementById('publish-label').value = '';
    }
  }
};

const toggleEditDropdownOptions = () => {
  const editDropdownChecked = getChecked('edit-dropdown');
  const container = document.getElementById('edit-dropdown-options-container');
  
  if (container) {
    container.style.display = editDropdownChecked ? 'block' : 'none';
    if (!editDropdownChecked) {
      ['add-effects', 'remove-background', 'apply-adjustment', 'insert-object', 'remove-object'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.checked = false;
      });
    }
  }
};

// Collapsible config section
const configToggle = document.getElementById('config-toggle');
const configSection = document.querySelector('.config-section');
if (configToggle && configSection) {
  configToggle.addEventListener('click', () => {
    configSection.classList.toggle('collapsed');
  });
}

// Force community-wall checkbox to always be checked
const communityWallCheckbox = document.getElementById('community-wall');
if (communityWallCheckbox) {
  communityWallCheckbox.checked = true;
  communityWallCheckbox.addEventListener('click', (e) => {
    e.preventDefault();
    communityWallCheckbox.checked = true;
  });
}

// Add event listeners for conditional rendering
const communityWallEl = document.getElementById('community-wall');
const publishEl = document.getElementById('publish');
const editDropdownEl = document.getElementById('edit-dropdown');

if (communityWallEl) {
  communityWallEl.addEventListener('change', toggleCustomCommunityWall);
}
if (publishEl) {
  publishEl.addEventListener('change', togglePublishLabel);
}
if (editDropdownEl) {
  editDropdownEl.addEventListener('change', toggleEditDropdownOptions);
}

// Initialize conditional rendering on page load
toggleCustomCommunityWall();
togglePublishLabel();
toggleEditDropdownOptions();

// Click handler for the Generate Image button
document.getElementById("generateBtn").onclick = async () => {
  try {
    const { appConfig, exportConfig } = buildAppConfig();
    module.createImageFromText(appConfig, exportConfig, containerConfig);
  } catch (error) {
    console.error('Error generating image:', error);
    alert('Failed to generate image. Please try again.');
  }
};

// Initialize - hide image initially, show placeholder
if (expressImage) {
  expressImage.style.display = "none";
}
