package com.example.wishesdemo

import android.os.Bundle
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.FragmentManager
import com.adobe.express.embedsdk.AssetDataType
import com.adobe.express.embedsdk.ButtonStyle
import com.adobe.express.embedsdk.ImageFileType
import com.adobe.express.embedsdk.PublishAction
import com.adobe.express.embedsdk.PublishExportOption
import com.adobe.express.embedsdk.PublishTarget
import com.adobe.express.embedsdk.WishesAndGreetingsNativeAppConfig
import com.adobe.express.embedsdk.WishesAndGreetingsNativeDocConfig
import com.adobe.express.embedsdk.wishesandgreetings.ui.EmbedSdkWishesAndGreetingsNativeFragment

class MainActivity : AppCompatActivity() {
    private val viewModel: WishesViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        val launchButton = findViewById<Button>(R.id.launch_wishes)
        val status = findViewById<TextView>(R.id.status_message)
        val result = findViewById<ImageView>(R.id.exported_image)

        viewModel.status.observe(this) { status.text = it }
        viewModel.image.observe(this) { bitmap ->
            result.setImageBitmap(bitmap)
            result.contentDescription = getString(R.string.published_image)
        }
        // LiveData only delivers while the Activity is started, so the pop never runs after
        // the FragmentManager has saved its state, and a pending dismiss runs on return.
        viewModel.dismissRequested.observe(this) { requested ->
            if (requested) {
                supportFragmentManager.popBackStack(
                    EmbedSdkWishesAndGreetingsNativeFragment.FRAGMENT_TAG,
                    FragmentManager.POP_BACK_STACK_INCLUSIVE,
                )
                viewModel.onDismissHandled()
            }
        }

        try {
            WishesSdk.get(this)
            launchButton.setOnClickListener { launchWishes() }
        } catch (e: Exception) {
            launchButton.isEnabled = false
            viewModel.setStatus("SDK initialization failed: ${e.message}")
        }
    }

    private fun launchWishes() {
        val manager = supportFragmentManager
        val tag = EmbedSdkWishesAndGreetingsNativeFragment.FRAGMENT_TAG
        if (manager.isStateSaved || manager.findFragmentByTag(tag) != null) return

        try {
            val module = WishesSdk.get(this).module
            if (module == null) {
                viewModel.setStatus("Wishes and Greetings isn't available.")
                return
            }
            viewModel.onLaunch()
            val fragment = module.wishesAndGreetingsNative(
                wishesAndGreetingsNativeDocConfig = WishesAndGreetingsNativeDocConfig(),
                wishesAndGreetingsNativeAppConfig = WishesAndGreetingsNativeAppConfig(
                    // Pass ViewModel-owned handlers, never lambdas that capture this Activity.
                    callbacks = viewModel.callbacks,
                    onDismiss = viewModel.onDismiss,
                ),
                exportConfig = listOf(
                    PublishExportOption(
                        id = "returnImage",
                        label = getString(R.string.export_label),
                        style = ButtonStyle(),
                        action = PublishAction(
                            target = PublishTarget.PUBLISH.value,
                            publishFileType = ImageFileType.PNG.mimeType,
                            outputType = AssetDataType.BASE64,
                            closeTargetOnExport = true,
                            // Otherwise the button stays disabled until the first edit.
                            enableByDefault = true,
                        ),
                    ),
                ),
            )
            // Selecting a template opens the SDK's editor over this fragment; closing it returns here.
            manager.beginTransaction()
                .replace(android.R.id.content, fragment, tag)
                .addToBackStack(tag)
                .commit()
        } catch (e: Exception) {
            viewModel.setStatus("Could not open Wishes and Greetings: ${e.message}")
        }
    }
}
