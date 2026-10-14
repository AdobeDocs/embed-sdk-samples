package com.example.wishesdemo

import android.content.Context
import com.adobe.express.embedsdk.AuthMode
import com.adobe.express.embedsdk.AuthOption
import com.adobe.express.embedsdk.CCEverywhereInterface
import com.adobe.express.embedsdk.ConfigParams
import com.adobe.express.embedsdk.Environment
import com.adobe.express.embedsdk.ExpressEmbedSdk
import com.adobe.express.embedsdk.HostInfo
import com.adobe.express.embedsdk.Version

/** Initializes the Embed SDK once per process and keeps the returned interface. */
object WishesSdk {
    // The client ID for your app. Its registered package name must match
    // applicationId in app/build.gradle.kts, or templates won't open in the editor.
    private const val CLIENT_ID = "add-your-client-id-here"

    private var instance: CCEverywhereInterface? = null

    // Initializing again closes any open SDK session, so reuse the first instance.
    @Synchronized
    fun get(context: Context): CCEverywhereInterface {
        instance?.let { return it }
        check(CLIENT_ID.isNotBlank() && CLIENT_ID != "your-client-id") {
            "Set CLIENT_ID in WishesSdk.kt to the client ID Adobe provisioned for this app."
        }
        return ExpressEmbedSdk.initialize(
            hostInfo = HostInfo(clientId = CLIENT_ID, appName = "Wishes demo", appVersion = Version(1, 0, 0)),
            configParams = ConfigParams(env = Environment.PRODUCTION, locale = "en_US"),
            // Third-party hosts must use DELAYED authentication.
            authProvider = { AuthOption(mode = AuthMode.DELAYED.value) },
            appContext = context.applicationContext,
        ).also { instance = it }
    }
}
