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

/**
 * Export configurations for different workflow stages
 * Each configuration defines the buttons and options available to users
 * at different points in the workflow tethering process
 */

// When starting Generate Image workflow
export const startGenImageExportConfig = [
  {
    id: "download",
    label: "Download",
    action: { target: "download" },
    style: { uiType: "button" },
  },
  {
    id: "save-generated-image",
    label: "Save generated image",
    action: { target: "publish" },
    style: { uiType: "button" },
  },
  {
    id: "open-edit-image",
    label: "Edit image",
    action: { target: "image-module" },
    style: { uiType: "button" },
  },
];

// When starting Edit Image workflow
export const startEditImageExportConfig = [
  {
    id: "download",
    label: "Download",
    action: { target: "download" },
    style: { uiType: "button" },
  },
  {
    id: "save-edited-image",
    label: "Save edited image",
    action: { target: "publish" },
    style: { uiType: "button" },
  },
  {
    type: "continue-editing",
    label: "Do More",
    style: { uiType: "button", variant: "secondary", treatment: "fill" },
    options: [
      {
        id: "exportOption1",
        style: { uiType: "dropdown" },
        action: { target: "express", intent: "add-text" },
      },
      {
        id: "exportOption2",
        style: { uiType: "dropdown" },
        action: { target: "express", intent: "add-images" },
      },
      {
        id: "exportOption3",
        style: { uiType: "dropdown" },
        action: { target: "express", intent: "add-icons-and-shapes" },
      },
    ],
  },
];

// When ending Edit Image workflow (after basic edits)
export const endEditImageExportConfig = [
  {
    id: "download",
    label: "Download",
    action: { target: "download" },
    style: { uiType: "button" },
  },
  {
    id: "save-final-image",
    label: "Save final image",
    action: { target: "publish" },
    style: { uiType: "button" },
  },
];

// When ending Full Editor workflow (after advanced edits)
export const endFullEditorExportConfig = [
  {
    id: "download",
    label: "Download",
    action: { target: "download" },
    style: { uiType: "button" },
  },
  {
    id: "save-full-editor-result",
    label: "Save design",
    action: { target: "publish" },
    style: { uiType: "button" },
  },
  // Optional: Continue in Express for further editing
  // {
  //   id: "continue-in-express",
  //   label: "Continue in Express",
  //   action: { target: "express" },
  //   style: { uiType: "button", variant: "secondary" },
  // },
];
