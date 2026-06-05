# Adobe Express Embed SDK samples

This repository contains a set of samples that demonstrate how to implement and use the Adobe Express Embed SDK.

> [!WARNING]
> This repository is a work-in-progress: the samples are being added and updated regularly—please check back often, and excuse any temporary inconsistencies.

## How to get started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- An [Adobe Express Embed SDK API key](https://developer.adobe.com/express/embed-sdk/docs/guides/quickstart/)

### Run a sample

Each sample is a standalone Vite project. To run one:

1. **Get an API key** — Follow the [Quickstart guide](https://developer.adobe.com/express/embed-sdk/docs/guides/quickstart/) to create an Embed SDK API key. When configuring the key, allowlist `localhost:5555` for local development.

2. **Choose a sample** — Pick a project from [`tutorials`](./code-samples/tutorials/README.md) (guided lessons) or [`demo-app`](#demo-app-samples) (one sample per SDK method). For your first run, try [`embed-sdk-getting-started`](./code-samples/tutorials/embed-sdk-getting-started/README.md) or [`embed-sdk-full-editor`](./code-samples/demo-app/embed-sdk-full-editor/README.md).

3. **Configure the API key** — Open the sample’s `.env` file (usually in `src/`, or in the project root for some tutorials) and set your key:

   ```bash
   VITE_API_KEY="your-embed-sdk-api-key-allowlisting-localhost:5555"
   ```

4. **Install and start** — From the sample directory:

   ```bash
   npm install
   npm start
   ```

5. **Open in the browser** — Go to [https://localhost:5555](https://localhost:5555). Samples use HTTPS via `vite-plugin-mkcert`; you may need to accept the local certificate on first visit.

Each sample’s own `README.md` has feature-specific notes and links to related tutorials.

## Samples in this repository

The `code-samples` folder contains the following collections:

- [`tutorials`](./code-samples/tutorials/README.md): samples that are part of the Adobe Express Embed SDK tutorials on the [Adobe Developer](https://developer.adobe.com/express/embed-sdk/docs/guides/tutorials/) website.
- [`demo-app`](#demo-app-samples): standalone demo applications—one folder per SDK method (see below).
- [`cc-everywhere`](./code-samples/cc-everywhere/README.md): samples written by the Adobe Express Embed SDK engineering team, and originally distributed in the [`AdobeDocs/cc-everywhere`](https://github.com/AdobeDocs/cc-everywhere) repository.
- [`contributed`](./code-samples/contributed/): code samples that cover various Embed SDK features.

---

## Demo app samples

The [`demo-app`](./code-samples/demo-app/) folder contains standalone sample applications—one per Embed SDK capability. Each project is a complete Vite app with:

- `src/main.js` — SDK initialization, configuration, and the API call
- `src/index.html` — UI with a button to launch the workflow
- `src/.env` — your `VITE_API_KEY`
- `vite.config.js` — HTTPS dev server on port `5555`

After `CCEverywhere.initialize()`, the SDK exposes three APIs. Each sample calls one SDK method and passes a standard set of configuration objects:

| API | Parameters |
| --- | --- |
| `editor` | `docConfig`, `appConfig`, `exportConfig`, `containerConfig` |
| `module` | `docConfig`, `appConfig`, `exportConfig`, `containerConfig` |
| `quickAction` | `docConfig`, `appConfig`, `exportConfig`, `modalParams` |

### Editor (`editor`)

Full Adobe Express editor workflows—create blank designs, edit saved projects, or start from an asset or template.

| Sample | SDK method | Description |
| --- | --- | --- |
| [embed-sdk-full-editor](./code-samples/demo-app/embed-sdk-full-editor/) | `editor.create()` | Create a new blank design. |
| [embed-sdk-full-editor](./code-samples/demo-app/embed-sdk-full-editor/) | `editor.edit()` | Re-open a saved project by `documentId`. |
| [embed-sdk-create-from-asset](./code-samples/demo-app/embed-sdk-create-from-asset/) | `editor.createWithAsset()` | Open the editor from an uploaded image or video. |
| [embed-sdk-create-with-template](./code-samples/demo-app/embed-sdk-create-with-template/) | `editor.createWithTemplate()` | Open the editor with a pre-selected template. |

### Modules (`module`)

Focused workflows without launching the full editor for every task.

| Sample | SDK method | Description |
| --- | --- | --- |
| [embed-sdk-edit-image](./code-samples/demo-app/embed-sdk-edit-image/) | `module.editImage()` | Edit an image in the image module. |
| [embed-sdk-create-image-from-text](./code-samples/demo-app/embed-sdk-create-image-from-text/) | `module.createImageFromText()` | Generate images from a text prompt (Firefly). |
| [embed-sdk-start-from-template](./code-samples/demo-app/embed-sdk-start-from-template/) | `module.startFromContent()` | Browse and pick from Adobe Express templates. |
| [embed-sdk-view-design](./code-samples/demo-app/embed-sdk-view-design/) | `module.viewDesign()` | View an existing design in read-only mode. |

### Quick actions (`quickAction`)

Single-purpose tools. Most samples accept an uploaded file, then run the action in a modal.

#### Image

| Sample | SDK method | Description |
| --- | --- | --- |
| [embed-sdk-remove-background](./code-samples/demo-app/embed-sdk-remove-background/) | `quickAction.removeBackground()` | Remove the background from an image. |
| [embed-sdk-crop-image](./code-samples/demo-app/embed-sdk-crop-image/) | `quickAction.cropImage()` | Crop an image. |
| [embed-sdk-resize-image](./code-samples/demo-app/embed-sdk-resize-image/) | `quickAction.resizeImage()` | Resize an image. |
| [embed-sdk-convert-to-png](./code-samples/demo-app/embed-sdk-convert-to-png/) | `quickAction.convertToPNG()` | Convert an image to PNG. |
| [embed-sdk-convert-to-jpg](./code-samples/demo-app/embed-sdk-convert-to-jpg/) | `quickAction.convertToJPEG()` | Convert an image to JPEG. |
| [embed-sdk-convert-to-svg](./code-samples/demo-app/embed-sdk-convert-to-svg/) | `quickAction.convertToSVG()` | Convert an image to SVG. |
| [embed-sdk-generate-qr-code](./code-samples/demo-app/embed-sdk-generate-qr-code/) | `quickAction.generateQRCode()` | Generate a QR code. |

#### Video

| Sample | SDK method | Description |
| --- | --- | --- |
| [embed-sdk-crop-video](./code-samples/demo-app/embed-sdk-crop-video/) | `quickAction.cropVideo()` | Crop a video. |
| [embed-sdk-resize-video](./code-samples/demo-app/embed-sdk-resize-video/) | `quickAction.resizeVideo()` | Resize a video. |
| [embed-sdk-trim-video](./code-samples/demo-app/embed-sdk-trim-video/) | `quickAction.trimVideo()` | Trim a video. |
| [embed-sdk-merge-videos](./code-samples/demo-app/embed-sdk-merge-videos/) | `quickAction.mergeVideos()` | Merge multiple videos. |
| [embed-sdk-caption-video](./code-samples/demo-app/embed-sdk-caption-video/) | `quickAction.captionVideo()` | Add captions to a video. |
| [embed-sdk-convert-to-mp4](./code-samples/demo-app/embed-sdk-convert-to-mp4/) | `quickAction.convertToMP4()` | Convert media to MP4. |
| [embed-sdk-convert-to-gif](./code-samples/demo-app/embed-sdk-convert-to-gif/) | `quickAction.convertToGIF()` | Convert media to GIF. |
| [embed-sdk-animate-from-audio](./code-samples/demo-app/embed-sdk-animate-from-audio/) | `quickAction.animateFromAudio()` | Create an animation from an audio file. |

---

## Resources

Please refer to the [Adobe Express Embed SDK Overview](https://developer.adobe.com/express/embed-sdk/docs/guides/) on the Adobe Developer website for more information, or visit the [Adobe Express Embed SDK Community Forum](https://community.adobe.com/t5/adobe-express-embed-sdk/ct-p/ct-express-embed-sdk?page=1&sort=latest_replies&lang=all&tabid=all) to ask questions and get help.

## Contributing

We welcome contributions to this repository. Please read the [Code of Conduct](./CODE_OF_CONDUCT.md) for more information.
