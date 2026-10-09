package com.example.wishesdemo

import android.os.Bundle
import android.view.ViewGroup
import android.widget.Button
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.FragmentManager
import androidx.lifecycle.lifecycleScope
import com.adobe.express.embedsdk.AssetDataType
import com.adobe.express.embedsdk.ButtonStyle
import com.adobe.express.embedsdk.Callbacks
import com.adobe.express.embedsdk.CancelCallback
import com.adobe.express.embedsdk.ColorTheme
import com.adobe.express.embedsdk.ErrorCallback
import com.adobe.express.embedsdk.EventCallback
import com.adobe.express.embedsdk.IntentChangeCallback
import com.adobe.express.embedsdk.LoadCallback
import com.adobe.express.embedsdk.LoadInitCallback
import com.adobe.express.embedsdk.LoadStartCallback
import com.adobe.express.embedsdk.PublishAction
import com.adobe.express.embedsdk.PublishCallback
import com.adobe.express.embedsdk.PublishExportOption
import com.adobe.express.embedsdk.PublishStartCallback
import com.adobe.express.embedsdk.SessionFinishedCallback
import com.adobe.express.embedsdk.WarmupCompleteCallback
import com.adobe.express.embedsdk.WishesAndGreetingsNativeAppConfig
import com.adobe.express.embedsdk.WishesAndGreetingsNativeDocConfig
import com.adobe.express.embedsdk.wishesandgreetings.ui.EmbedSdkWishesAndGreetingsNativeFragment
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

// AppCompatActivity is required: the SDK only tears down its editor container from an AppCompatActivity.
class MainActivity : AppCompatActivity() {
    private lateinit var status: TextView
    private lateinit var result: ImageView
    private lateinit var launchButton: Button
    private var publishReceived = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        makeView()
        try {
            WishesSdk.get(this)
            status.text = "SDK initialized: STAGE · 3P · Default client ID · en_US"
        } catch (e: Exception) {
            launchButton.isEnabled = false
            status.text = "SDK initialization failed: ${e.message}"
        }
    }

    private fun makeView() {
        val padding = (20 * resources.displayMetrics.density).toInt()
        val content = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(padding, padding, padding, padding)
        }
        content.addView(TextView(this).apply {
            text = "Wishes and Greetings"
            textSize = 24f
        })
        content.addView(TextView(this).apply {
            text = "Choose a template in the SDK, customize it in the editor, then publish a PNG."
            textSize = 16f
        })
        launchButton = Button(this).apply {
            id = R.id.launch_wishes
            text = "Open Wishes and Greetings"
            setOnClickListener { launchWishesAndGreetingsNative() }
        }
        content.addView(launchButton)
        status = TextView(this).apply {
            id = R.id.status_message
            textSize = 16f
            setPadding(0, 12, 0, 12)
        }
        content.addView(status)
        result = ImageView(this).apply {
            id = R.id.exported_image
            contentDescription = "No published image yet"
            scaleType = ImageView.ScaleType.FIT_CENTER
            adjustViewBounds = true
        }
        content.addView(
            result,
            LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                (320 * resources.displayMetrics.density).toInt(),
            ),
        )
        setContentView(ScrollView(this).apply { addView(content) })
    }

    private fun ui(action: () -> Unit) = runOnUiThread { if (!isDestroyed) action() }

    // atlas-snippet:start:launch-wishes
    // Same call and hosting as the test app's EmbedTestFragment.launchWishesAndGreetingsNative().
    private fun launchWishesAndGreetingsNative() {
        try {
            publishReceived = false
            val appConfig = WishesAndGreetingsNativeAppConfig(
                callbacks = makeCallbacks(),
                onDismiss = { ui { dismissWishes() } },
                colorTheme = ColorTheme.LIGHTEST,
            )
            val wishesFragment = WishesSdk.get(this).module?.wishesAndGreetingsNative(
                wishesAndGreetingsNativeDocConfig = WishesAndGreetingsNativeDocConfig(),
                wishesAndGreetingsNativeAppConfig = appConfig,
                exportConfig = listOf(
                    PublishExportOption(
                        id = "returnImage",
                        label = "Use image",
                        style = ButtonStyle(),
                        action = PublishAction(
                            target = "publish",
                            publishFileType = "image/png",
                            outputType = AssetDataType.BASE64,
                            closeTargetOnExport = true,
                            // As in the test app's Wishes export config; otherwise disabled until the first edit.
                            enableByDefault = true,
                        ),
                    ),
                ),
            ) ?: return
            // On a template tap the SDK replaces android.R.id.content with its editor and pops back on close.
            supportFragmentManager
                .beginTransaction()
                .replace(android.R.id.content, wishesFragment, EmbedSdkWishesAndGreetingsNativeFragment.FRAGMENT_TAG)
                .addToBackStack(EmbedSdkWishesAndGreetingsNativeFragment.FRAGMENT_TAG)
                .commit()
        } catch (e: Exception) {
            status.text = "Could not open Wishes and Greetings: ${e.message}"
        }
    }
    // atlas-snippet:end:launch-wishes

    private fun dismissWishes() {
        if (!supportFragmentManager.isStateSaved) {
            supportFragmentManager.popBackStack(
                EmbedSdkWishesAndGreetingsNativeFragment.FRAGMENT_TAG,
                FragmentManager.POP_BACK_STACK_INCLUSIVE,
            )
        }
    }

    private fun makeCallbacks(): Callbacks = object : Callbacks {
        override var onLoadInit: LoadInitCallback = {}
        override var onLoadStart: LoadStartCallback? = null
        override var onLoad: LoadCallback? = null
        override var onCancel: CancelCallback = { _, _ -> ui { status.text = "Session cancelled." } }
        override var onPublishStart: PublishStartCallback? = null
        override var onError: ErrorCallback<Any>? = { error ->
            ui { status.text = "SDK error: $error" }
        }
        override var onEvent: EventCallback? = null
        override var onIntentChange: IntentChangeCallback? = null
        override var onWarmupComplete: WarmupCompleteCallback? = null

        // Fires after the SDK has removed its editor; then return from browse to show the image.
        override var onSessionFinished: SessionFinishedCallback? = {
            ui { if (publishReceived) dismissWishes() }
        }
        override var onPublish: PublishCallback? = { _, params ->
            ui {
                publishReceived = true
                val assets = params.asset.orEmpty()
                val asset = assets.firstOrNull { it.dataType == AssetDataType.BASE64 }
                    ?: assets.firstOrNull { it.dataType == AssetDataType.URL }
                val data = asset?.getData()?.takeIf { it.isNotBlank() }
                if (data == null) {
                    status.text = "Publish returned no supported image."
                } else {
                    val type = if (asset.dataType == AssetDataType.BASE64) {
                        ExportImageInput.Type.BASE64
                    } else {
                        ExportImageInput.Type.LOCAL_URI
                    }
                    showExportedImage(ExportImageInput(type, data))
                }
            }
        }
    }

    // atlas-snippet:start:display-exported-image
    fun showExportedImage(input: ExportImageInput): Job = lifecycleScope.launch {
        try {
            val bitmap = withContext(Dispatchers.IO) {
                ExportImageDecoder.decode(input, contentResolver)
            }
            result.setImageBitmap(bitmap)
            result.contentDescription = "Published PNG image"
            status.text = "Image received."
        } catch (cancelled: CancellationException) {
            throw cancelled
        } catch (_: Exception) {
            status.text = "Returned image could not be displayed; try publishing again."
        }
    }
    // atlas-snippet:end:display-exported-image
}
