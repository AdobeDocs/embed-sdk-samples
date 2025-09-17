# Adobe Express Embed SDK Workflow Tethering tutorial

This sample project is a companion to the [Workflow Tethering](https://developer.adobe.com/express/embed-sdk/docs/guides/tutorials/workflow-tethering) tutorial for the Adobe Express Embed SDK.

## Running the sample

1. Make sure you have an Embed SDK API Key. If you don't have one, follow the instructions in the [Quickstart guide](https://developer.adobe.com/express/embed-sdk/docs/guides/quickstart/).
2. Locate the `.env` file in the project root and add your Embed SDK API Key to the `API_KEY` field. Your API Key should allowlist `localhost:5555`.

```bash
VITE_API_KEY="replace-with-your-Embed-SDK-API-key-allowlisting-localhost:5555"
```

3. Install the dependencies:

```bash
npm install
```

4. Start the local server:

```bash
npm run start
```

5. Open your browser and navigate to [https://localhost:5555](https://localhost:5555).

## Learn more

Please refer to the [Tutorial](https://developer.adobe.com/express/embed-sdk/docs/guides/tutorials/workflow-tethering) for a detailed guide on how to use this sample project.
