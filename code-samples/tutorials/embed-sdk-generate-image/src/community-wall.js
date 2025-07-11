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

import { v4 as uuidv4 } from "uuid";

/** Read images/images.json and return its raw data */
const fetchImages = async () => {
  const resp = await fetch("images/images.json");
  if (!resp.ok) {
    throw new Error(
      `Could not load images.json - ${resp.status} ${resp.statusText}`
    );
  }
  return resp.json(); // [{file, prompt}, …]
};

/** Convert a single file in /images to a data-URL */
const fileToBase64 = async (fileName) => {
  const resp = await fetch(`images/${fileName}`);
  const blob = await resp.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result); // “data:image/jpeg;base64,…”
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/* ------------------------------------------------------------------
 * one-time cache (so we only hit the network once)
 * ------------------------------------------------------------------ */

let _cache = null; // [{ prompt, base64 }, …]
let _cursor = 0; // how far we have already served
const PAGE_SIZE = 12; // Firefly’s community wall default

const hydrateCache = async () => {
  if (_cache) return _cache; // already loaded

  const meta = await fetchImages(); // images.json
  const base64List = await Promise.all(
    meta.map((item) => fileToBase64(item.file))
  );

  _cache = base64List.map((b64, idx) => ({
    prompt: meta[idx].prompt,
    base64: b64,
  }));

  return _cache;
};

/* ------------------------------------------------------------------
 * public API
 * ------------------------------------------------------------------ */

/**
 * Mimics Adobe Express Community-Wall pagination.
 *
 * @returns {Promise<{assets: Array, cursor: 'Interim_Page'|'Last_Page'}>}
 *
 * The very first call returns items 0-11, cursor = 'Interim_Page'
 * The second call returns items 12-23, etc.
 * When the last chunk is served, cursor = 'Last_Page'
 */
export const fetchCommunityAssets = async () => {
  console.log("fetchCommunityAssets called!");

  // Implement your logic here to fetch the assets from the database
  const data = await hydrateCache();
  console.log("data", data);

  // If we have already served all available assets (cursor at or past end),
  // start over so that a fresh Embed SDK session can see the community wall.
  if (_cursor >= data.length) {
    _cursor = 0;
  }
  console.log("cursor", _cursor);

  // slice next PAGE_SIZE elements
  const slice = data.slice(_cursor, _cursor + PAGE_SIZE);

  const assets = slice.map((item) => ({
    assetId: uuidv4(),
    title: item.prompt,
    thumbnailSrc: item.base64,
    fullRenditionSrc: item.base64,
    width: 467, // hard-coded, or swap for real metadata if you like
    height: 600,
  }));

  _cursor += slice.length;

  const cursor = _cursor >= data.length ? "Last_Page" : "Interim_Page";

  return { assets, cursor };
};
