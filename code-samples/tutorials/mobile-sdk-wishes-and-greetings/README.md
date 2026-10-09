# Wishes and Greetings: Android host sample

This small native Android host uses the Adobe Express Embed SDK's Wishes and Greetings module (`wishesAndGreetingsNative`). The user picks a template in the SDK's browse screen, edits it in the SDK-owned editor, and taps **Use image**. The host then shows the published PNG.

The sample reproduces the engineering test app's configuration for **Wishes And Greetings Native → STAGE → 3P → Client ID Default → en_US**. It initializes the SDK automatically when the app starts and has no configuration UI.

## Prerequisites

- JDK 17, Android SDK platform 36, and a device or emulator on API 28 or later with a working WebView and internet access.
- An approved Maven repository that serves `com.adobe.express.embed:embedsdk:x.y.z` with its POM and transitive dependencies. Set `EMBED_SDK_MAVEN_URL`, and set `EMBED_SDK_MAVEN_USER` and `EMBED_SDK_MAVEN_TOKEN` if the repository needs credentials. Keep these values out of this checkout.

## Build and run

```sh
./gradlew :app:installDebug
./gradlew :app:connectedDebugAndroidTest
```

## Configuration

Please see the table below for the required configuration values:

| Setting                        | Value                                                                             | Source in the test app                                                       |
| ------------------------------ | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `applicationId`                | `your-application-id` (e.g., `com.airtel.testapp`)                                | `app/build.gradle.kts`                                                       |
| Client ID (3P, Stage, Default) | `your-client-id` (obtain from your Adobe contact)                                 | `THIRD_PARTY_CLIENT_ID_STAGE` (also the SDK's Stage `THIRD_PARTY_CLIENT_ID`) |
| `HostInfo`                     | `"Test-App"` (or your preferred value), `Version(1, 1, 1, 40042, "Test", "Beta")` | `EmbedTestFragment.initialize3PSdk`                                          |
| `ConfigParams`                 | `env = STAGE`, `locale = "en_US"`                                                 | `SdkInitializer.initialize3PSdk`                                             |
| Auth                           | `AuthMode.DELAYED`                                                                | `SdkInitializer.initialize3PSdk`                                             |
| SDK logs                       | `internal.enableLogs(true)`                                                       | `EmbedTestFragment.internalSetup`                                            |
| Host activity and theme        | `AppCompatActivity`, `Theme.MaterialComponents.DayNight.NoActionBar`              | `EmbedTestActivity`, `Theme.TestApp`                                         |
| Browse hosting                 | `replace(android.R.id.content, …, FRAGMENT_TAG).addToBackStack(FRAGMENT_TAG)`     | `EmbedTestFragment.launchWishesAndGreetingsNative`                           |
| App config                     | `colorTheme = ColorTheme.LIGHTEST`; `onDismiss` pops `FRAGMENT_TAG`               | `EmbedTestFragment.launchWishesAndGreetingsNative`                           |
| Export option                  | `enableByDefault = true`                                                          | `DefaultConfig.getWishesAndGreetingsExportConfig`                            |

Two of these values are required for templates to open:

- **`applicationId`**: the SDK sends the package name to the Stage editor as `appId`, and the editor only accepts allowlisted package names for this client ID. Any other package name is redirected to `/blocked/embed-not-allowed`, and the editor stays on "Loading…". To use your own package name, ask the SDK team to allowlist it for your client ID.
- **`AppCompatActivity`**: the SDK removes its editor container only when the hosting activity is an `AppCompatActivity`.
