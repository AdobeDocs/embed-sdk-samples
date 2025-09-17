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
 * Shared utilities for workflow management and image handling
 */

// Global state management
export let currentWorkflow = null; // 'generate' or 'edit'
export let currentImageBlob = null;

export function setCurrentWorkflow(workflow) {
  currentWorkflow = workflow;
}

export function resetWorkflow() {
  currentWorkflow = null;
}

export function setCurrentImageBlob(blob) {
  currentImageBlob = blob;
}

// DOM element references
export const generateImage = document.getElementById("image1");
export const expressImage = document.getElementById("image2");

/**
 * Cache the default image as a blob for efficient SDK usage
 */
export async function cacheDefaultImageBlob() {
  const response = await fetch(expressImage.src);
  currentImageBlob = await response.blob();
}

/**
 * Handle file selection from file input
 * @param {Event} event - The file input change event
 */
export function handleFileSelection(event) {
  const file = event.target.files[0];
  if (file && file.type.startsWith("image/")) {
    // Dual data flow: cache the File (which is a Blob) for SDK, convert to data URL for display
    currentImageBlob = file; // File objects are Blobs - perfect for SDK usage

    // Convert to data URL for immediate display in the <img> element
    const reader = new FileReader();
    reader.onload = (e) => {
      expressImage.src = e.target.result; // Base64 encoded image data
    };
    reader.readAsDataURL(file);
  }
}

/**
 * Base callback configurations used across workflows
 */
export const baseCallbacks = {
  onCancel: () => {
    // Reset workflow tracking on cancel
    resetWorkflow();
  },
  onError: (err) => {
    console.error("Error!", err.toString());
  },
};

/**
 * Update an image element and cache the blob for future use
 * @param {HTMLImageElement} imageElement - The image element to update
 * @param {string} imageData - The image data URL
 * @param {boolean} updateCache - Whether to update the global blob cache
 */
export async function updateImageAndCache(
  imageElement,
  imageData,
  updateCache = false
) {
  imageElement.src = imageData;

  if (updateCache) {
    const response = await fetch(imageData);
    currentImageBlob = await response.blob();
  }
}
