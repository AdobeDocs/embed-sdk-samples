# Wishes and Greetings: Android host sample

A small native Android app that launches the **Wishes and Greetings** module of the [Adobe Express Embed SDK for Android](https://github.com/AdobeDocs/express-embed-mobile-sdk-android-release). The user picks a template, personalizes it in the SDK's editor, and selects **Use image**. The app then shows the exported PNG on its own screen.

This is the companion sample for the *Build a Wishes and Greetings integration with the Android Mobile SDK* tutorial on the [Adobe Developer](https://developer.adobe.com/express/embed-sdk/docs/guides/tutorials/) website.

## Requirements

- The latest stable Android Studio, with JDK 17 or later and Android SDK Platform 36
- A device or emulator running Android 9 (API 28) or later, with internet access
- A client ID from Adobe for the Embed SDK, and your app's package name registered with Adobe for that client ID

## Setup

1. In `app/src/main/java/com/example/wishesdemo/WishesSdk.kt`, set `CLIENT_ID` to your client ID.
2. In `app/build.gradle.kts`, set `applicationId` to the package name registered for that client ID.

The SDK, `com.adobe.express.embed:embedsdk:1.1.1-beta`, is downloaded from Maven Central. You don't need any repository credentials.

## Run the sample in Android Studio

1. **Open the project.** In Android Studio, select **File > Open** and choose this `mobile-sdk-wishes-and-greetings` folder (the one that contains `settings.gradle.kts`), not the root of the repository. If Android Studio asks whether to trust the project, select **Trust Project**.
2. **Check the Gradle JDK.** Open **Settings** (**Android Studio > Settings** on macOS), go to **Build, Execution, Deployment > Build Tools > Gradle**, and make sure **Gradle JDK** is version 17 or later. The JetBrains Runtime bundled with Android Studio works.
3. **Install Android SDK Platform 36.** Open **Tools > SDK Manager** and, on the **SDK Platforms** tab, select the Android 16 platform (API level 36), then select **Apply**. Android Studio may also offer to install it during the first sync.
4. **Set your client ID and package name**, as described in [Setup](#setup).
5. **Sync the project.** Select **File > Sync Project with Gradle Files**. The first sync needs internet access: it downloads the Gradle version set in the wrapper, the Android Gradle Plugin, and the Embed SDK from Maven Central. It also creates `local.properties` with the path to your Android SDK. Sync again whenever you edit a `build.gradle.kts` file.
6. **Prepare a device.**
   - **Emulator:** open **View > Tool Windows > Device Manager**, select **+ > Create Virtual Device**, and choose a phone with a system image for API 28 or later. A **Google APIs** or **Google Play** image includes an up-to-date WebView.
   - **Physical device:** enable **Developer options** and **USB debugging** on an Android 9 or later device, then connect it.
7. **Run the app.** In the toolbar, select the **app** run configuration and your device, then select **Run > Run 'app'** or the green **Run** button.
8. In the app, select **Open Wishes and Greetings**, pick a template, and select **Use image** in the editor. The exported image appears below the button.

## Run the sample from the command line

Set `ANDROID_HOME` to your Android SDK location, or open the project in Android Studio once so it creates `local.properties`, then start an emulator or connect a device and run:

```sh
./gradlew :app:installDebug
```

Then open **Wishes demo** from the device's app drawer.

## Troubleshooting the build

| Problem                                                    | Solution                                                                                                 |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Sync fails because the Android Gradle Plugin version isn't supported | Update Android Studio to the latest stable version.                                                      |
| `SDK location not found`                                   | Open the project in Android Studio so it creates `local.properties`, or set `ANDROID_HOME`.             |
| Sync reports that Android SDK Platform 36 (`android-36`) is missing | Install Android SDK Platform 36 with the SDK Manager.                                                    |
| Gradle reports an unsupported Java version                 | Set **Gradle JDK** to version 17 or later.                                                               |
| `Could not resolve com.adobe.express.embed:embedsdk`       | Check your internet connection and any proxy settings; the SDK is downloaded from Maven Central.        |
| The app shows "Set CLIENT_ID in WishesSdk.kt…"             | Replace the placeholder client ID in `WishesSdk.kt`.                                                     |
| The template browser loads, but the editor never finishes loading | Check that `applicationId` matches the package name registered with Adobe for your client ID.            |

## Project structure

| File                    | What it does                                                                                    |
| ----------------------- | ----------------------------------------------------------------------------------------------- |
| `WishesSdk.kt`          | Initializes the SDK once per process and keeps the returned instance                            |
| `MainActivity.kt`       | Launches the Wishes and Greetings fragment and observes the ViewModel                           |
| `WishesViewModel.kt`    | Implements the SDK callbacks and `onDismiss`, and holds the status message and exported image  |
| `ExportImageDecoder.kt` | Decodes the Base64 PNG returned by the editor and downsamples it for display                    |

## Notes

- **Configuration changes.** The SDK keeps the `callbacks` and `onDismiss` passed at launch for the whole session, including across rotation. They live in `WishesViewModel` rather than in the Activity, so they still reach the current Activity after it's recreated.
- **Environment.** The sample uses `Environment.PRODUCTION`. Use the environment that matches the client ID Adobe gave you.
- **Client ID.** For simplicity, the client ID is a constant in the source. In a production app, inject it at build time instead, for example through a `buildConfigField` populated from `local.properties` or your CI secrets.
- **Package name.** If the template browser loads but the editor never finishes loading, check that `applicationId` matches the package name registered for your client ID.
