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
 * App configuration factory
 * Creates workflow-specific app configurations for the Adobe Express Embed SDK
 */

import { baseCallbacks } from "../utils/shared.js";
import {
  createGenerateToEditTransition,
  createGenerateImageWorkflowConfig,
} from "../workflows/generateToEdit.js";
import {
  createEditToFullEditorTransition,
  createEditImageWorkflowConfig,
} from "../workflows/editToFullEditor.js";

/**
 * Intent change handler factory
 * Manages transitions between different workflow modules
 */
export function createIntentChangeHandler() {
  return (oldIntent, newIntent) => {
    console.log("Intent transition:", oldIntent, "→", newIntent);

    // Generate Image → Edit Image transition
    if (oldIntent === "create-image-from-text") {
      return createGenerateToEditTransition();
    }

    // Edit Image → Full Editor transition
    if (oldIntent === "edit-image-v2") {
      return createEditToFullEditorTransition();
    }

    return undefined;
  };
}

/**
 * Create the app configuration for Generate Image workflow
 */
export function createGenerateImageAppConfig() {
  const intentChangeHandler = createIntentChangeHandler();
  return createGenerateImageWorkflowConfig(baseCallbacks, intentChangeHandler);
}

/**
 * Create the app configuration for Edit Image workflow
 */
export function createEditImageAppConfig() {
  const intentChangeHandler = createIntentChangeHandler();
  return createEditImageWorkflowConfig(baseCallbacks, intentChangeHandler);
}
