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
 * Edit Image to Full Editor Workflow
 * Handles the transition from Edit Image workflow to Full Editor workflow
 */

import {
  expressImage,
  resetWorkflow,
  updateImageAndCache,
  baseCallbacks,
} from "../utils/shared.js";
import { endFullEditorExportConfig } from "../config/exportConfigs.js";

/**
 * Publish callback for Edit Image workflow
 * Updates the edited image and maintains blob cache
 */
export async function handleEditImagePublish(intent, publishParams) {
  console.log("Edit workflow - intent:", intent);
  console.log("Edit workflow - publishParams:", publishParams);

  // Update the right image (image2) with edited content
  await updateImageAndCache(expressImage, publishParams.asset[0].data, true);
  console.log("Updated expressImage (image2) with edited content");

  // Reset workflow tracking
  resetWorkflow();
}

/**
 * Publish callback for Full Editor workflow (nested)
 * Handles the final result from the Full Editor
 */
export async function handleFullEditorPublish(intent, publishParams) {
  console.log("Full editor workflow - intent:", intent);
  console.log("Full editor workflow - publishParams:", publishParams);

  // Save back to image2 (expressImage) - same logic as regular edit workflow
  await updateImageAndCache(expressImage, publishParams.asset[0].data, true);
  console.log("Updated expressImage (image2) with full editor content");
}

/**
 * Creates the workflow transition configuration for Edit Image → Full Editor
 * This is returned by onIntentChange when transitioning from edit to full editor
 */
export function createEditToFullEditorTransition() {
  return {
    appConfig: {
      appVersion: "2",
      callbacks: {
        ...baseCallbacks,
        onPublish: handleFullEditorPublish,
      },
    },
    exportConfig: endFullEditorExportConfig,
  };
}

/**
 * Complete workflow configuration for Edit Image
 * Minimal configuration - just the essentials for editing
 */
export function createEditImageWorkflowConfig(
  baseCallbacks,
  onIntentChangeHandler
) {
  return {
    appVersion: "2",
    callbacks: {
      ...baseCallbacks,
      onPublish: handleEditImagePublish,
      onIntentChange: onIntentChangeHandler,
    },
  };
}
