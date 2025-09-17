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
 * Generate Image to Edit Image Workflow
 * Handles the transition from Generate Image workflow to Edit Image workflow
 */

import { generateImage, resetWorkflow } from "../utils/shared.js";
import { endEditImageExportConfig } from "../config/exportConfigs.js";

/**
 * Publish callback for Generate Image workflow
 * Updates the generated image and resets workflow state
 */
export async function handleGenerateImagePublish(intent, publishParams) {
  console.log("Generate workflow - intent:", intent);
  console.log("Generate workflow - publishParams:", publishParams);

  // Update the left image (image1) with generated content
  generateImage.src = publishParams.asset[0].data;
  console.log("Updated generateImage (image1) with generated content");

  // Reset workflow tracking
  resetWorkflow();
}

/**
 * Creates the workflow transition configuration for Generate Image → Edit Image
 * This is returned by onIntentChange when transitioning from generate to edit
 */
export function createGenerateToEditTransition() {
  return {
    exportConfig: endEditImageExportConfig,
  };
}

/**
 * Complete workflow configuration for Generate Image
 * Includes all features needed for the generate image workflow
 */
export function createGenerateImageWorkflowConfig(
  baseCallbacks,
  onIntentChangeHandler
) {
  return {
    appVersion: "2",
    featureConfig: {
      "community-wall": true,
      "fast-mode": false,
      "custom-models": false,
    },
    thumbnailOptions: ["rich-preview", "edit-dropdown"],
    editDropdownOptions: [
      { option: "add-effects" },
      { option: "remove-background" },
      { option: "apply-adjustment" },
      { option: "insert-object" },
      { option: "remove-object" },
    ],
    callbacks: {
      ...baseCallbacks,
      onPublish: handleGenerateImagePublish,
      onIntentChange: onIntentChangeHandler,
    },
  };
}
