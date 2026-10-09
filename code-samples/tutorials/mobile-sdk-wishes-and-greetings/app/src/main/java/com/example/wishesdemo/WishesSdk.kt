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
internal object WishesSdk {
    // Add your Adobe-provided ClientID below;
    private const val CLIENT_ID = ""

    private var instance: CCEverywhereInterface? = null

    // Re-initializing closes any open SDK session, so initialize once per process.
    @Synchronized
    fun get(context: Context): CCEverywhereInterface =
        instance ?: ExpressEmbedSdk.initialize(
            hostInfo = HostInfo(CLIENT_ID, "Test-App", Version(1, 1, 1, 40042, "Test", "Beta")),
            configParams = ConfigParams(env = Environment.STAGE, locale = "en_US"),
            authProvider = { AuthOption(mode = AuthMode.DELAYED.value) },
            appContext = context.applicationContext,
        ).also { sdk ->
            // The test app's internalSetup() always turns SDK logging on.
            sdk.internal?.enableLogs(true)
            instance = sdk
        }
}
