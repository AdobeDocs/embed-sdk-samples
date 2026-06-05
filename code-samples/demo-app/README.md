# Adobe Express Embed SDK demo applications

The `demo-app` folder contains standalone sample applications—one per Embed SDK capability. Each project is a complete Vite app you can run locally to see how a specific API is wired up, configured, and called from your host application.

Every sample follows the same structure:

- `src/main.js` — SDK initialization, configuration, and the API call
- `src/index.html` — UI with a button to launch the workflow
- `src/.env` — your `VITE_API_KEY`
- `vite.config.js` — HTTPS dev server on port `5555`

See the [repository getting started guide](../../README.md#how-to-get-started) for setup steps.

---

After `CCEverywhere.initialize()`, the SDK exposes three APIs. Each sample calls one SDK method and passes a standard set of configuration objects:

| API | Parameters |
| --- | --- |
| `editor` | `docConfig`, `appConfig`, `exportConfig`, `containerConfig` |
| `module` | `docConfig`, `appConfig`, `exportConfig`, `containerConfig` |
| `quickAction` | `docConfig`, `appConfig`, `exportConfig`, `containerConfig` |

## Editor (`editor`)

Full Adobe Express editor workflows—create blank designs, edit saved projects, or start from an asset or template.

| Sample | SDK method | Description |
| --- | --- | --- |
| [embed-sdk-full-editor](./embed-sdk-full-editor/) | `editor.create()` | Create a new blank design (e.g. business card canvas). |
| [embed-sdk-full-editor](./embed-sdk-full-editor/) | `editor.edit()` | Re-open a saved project by `documentId`. |
| [embed-sdk-create-from-asset](./embed-sdk-create-from-asset/) | `editor.createWithAsset()` | Open the editor starting from an uploaded image or video. |
| [embed-sdk-create-with-template](./embed-sdk-create-with-template/) | `editor.createWithTemplate()` | Open the editor with a pre-selected template (`templateId`). |

## Modules (`module`)

Focused workflows without launching the full editor for every task.

| Sample | SDK method | Description |
| --- | --- | --- |
| [embed-sdk-edit-image](./embed-sdk-edit-image/) | `module.editImage()` | Edit an image in the image module. |
| [embed-sdk-create-image-from-text](./embed-sdk-create-image-from-text/) | `module.createImageFromText()` | Generate images from a text prompt (Firefly). |
| [embed-sdk-start-from-template](./embed-sdk-start-from-template/) | `module.startFromContent()` | Browse and pick from Adobe Express templates. |
| [embed-sdk-view-design](./embed-sdk-view-design/) | `module.viewDesign()` | View an existing design in read-only mode. |

## Quick actions (`quickAction`)

Single-purpose tools. Most samples accept an uploaded file, then run the action in a modal.

### Image

| Sample | SDK method | Description |
| --- | --- | --- |
| [embed-sdk-remove-background](./embed-sdk-remove-background/) | `quickAction.removeBackground()` | Remove the background from an image. |
| [embed-sdk-crop-image](./embed-sdk-crop-image/) | `quickAction.cropImage()` | Crop an image. |
| [embed-sdk-resize-image](./embed-sdk-resize-image/) | `quickAction.resizeImage()` | Resize an image. |
| [embed-sdk-convert-to-png](./embed-sdk-convert-to-png/) | `quickAction.convertToPNG()` | Convert an image to PNG. |
| [embed-sdk-convert-to-jpg](./embed-sdk-convert-to-jpg/) | `quickAction.convertToJPEG()` | Convert an image to JPEG. |
| [embed-sdk-convert-to-svg](./embed-sdk-convert-to-svg/) | `quickAction.convertToSVG()` | Convert an image to SVG. |
| [embed-sdk-generate-qr-code](./embed-sdk-generate-qr-code/) | `quickAction.generateQRCode()` | Generate a QR code. |

### Video

| Sample | SDK method | Description |
| --- | --- | --- |
| [embed-sdk-crop-video](./embed-sdk-crop-video/) | `quickAction.cropVideo()` | Crop a video. |
| [embed-sdk-resize-video](./embed-sdk-resize-video/) | `quickAction.resizeVideo()` | Resize a video. |
| [embed-sdk-trim-video](./embed-sdk-trim-video/) | `quickAction.trimVideo()` | Trim a video. |
| [embed-sdk-merge-videos](./embed-sdk-merge-videos/) | `quickAction.mergeVideos()` | Merge multiple videos. |
| [embed-sdk-caption-video](./embed-sdk-caption-video/) | `quickAction.captionVideo()` | Add captions to a video. |
| [embed-sdk-convert-to-mp4](./embed-sdk-convert-to-mp4/) | `quickAction.convertToMP4()` | Convert media to MP4. |
| [embed-sdk-convert-to-gif](./embed-sdk-convert-to-gif/) | `quickAction.convertToGIF()` | Convert media to GIF. |
| [embed-sdk-animate-from-audio](./embed-sdk-animate-from-audio/) | `quickAction.animateFromAudio()` | Create an animation from an audio file. |

---

## Common patterns across samples

### Initialization

```javascript
await import("https://cc-embed.adobe.com/sdk/v4/CCEverywhere.js");

const hostInfo = {
  clientId: import.meta.env.VITE_API_KEY,
  appName: "Embed SDK Sample",
};

const { editor, module, quickAction } = await window.CCEverywhere.initialize(hostInfo, {
  loginMode: "delayed",
});
```

Only destructure the API you need (`editor`, `module`, or `quickAction`).

### Callbacks

```javascript
callbacks: {
  onPublish: (intent, publishParams) => {
    // publishParams.asset[0].data — image/video URL or base64
    // publishParams.projectId — saved project ID (editor flows)
  },
}
```

---

## Running any demo app

```bash
cd embed-sdk-<sample-name>
npm install
npm start
```

Open [https://localhost:5555](https://localhost:5555). Ensure your API key allowlists `localhost:5555`.

## Learn more

- [Embed SDK documentation](https://developer.adobe.com/express/embed-sdk/docs/)
- [Tutorials](../tutorials/README.md)
- [cc-everywhere samples](../cc-everywhere/README.md)
