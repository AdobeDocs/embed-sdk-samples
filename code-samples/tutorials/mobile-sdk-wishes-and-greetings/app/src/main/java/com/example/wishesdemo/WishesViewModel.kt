package com.example.wishesdemo

import android.graphics.Bitmap
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.adobe.express.embedsdk.AssetDataType
import com.adobe.express.embedsdk.Callbacks
import com.adobe.express.embedsdk.CancelCallback
import com.adobe.express.embedsdk.ErrorCallback
import com.adobe.express.embedsdk.EventCallback
import com.adobe.express.embedsdk.IntentChangeCallback
import com.adobe.express.embedsdk.LoadCallback
import com.adobe.express.embedsdk.LoadInitCallback
import com.adobe.express.embedsdk.LoadStartCallback
import com.adobe.express.embedsdk.PublishCallback
import com.adobe.express.embedsdk.PublishParams
import com.adobe.express.embedsdk.PublishStartCallback
import com.adobe.express.embedsdk.SessionFinishedCallback
import com.adobe.express.embedsdk.WarmupCompleteCallback
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * Owns everything the SDK calls back into.
 *
 * The SDK keeps the callbacks and onDismiss passed at launch for the whole session, including
 * across rotation, so they must not capture the Activity. This ViewModel survives the
 * configuration change, and whichever Activity is current observes it.
 */
class WishesViewModel : ViewModel() {
    private val _status = MutableLiveData<String>()
    val status: LiveData<String> = _status

    private val _image = MutableLiveData<Bitmap>()
    val image: LiveData<Bitmap> = _image

    private val _dismissRequested = MutableLiveData(false)
    val dismissRequested: LiveData<Boolean> = _dismissRequested

    @Volatile private var publishReceived = false

    fun onLaunch() {
        publishReceived = false
    }

    fun onDismissHandled() {
        _dismissRequested.value = false
    }

    fun setStatus(message: String) = _status.postValue(message)

    // The SDK may invoke these off the main thread, so LiveData is updated with postValue.
    val onDismiss: () -> Unit = { _dismissRequested.postValue(true) }

    val callbacks: Callbacks = object : Callbacks {
        override var onLoadInit: LoadInitCallback = {}
        override var onLoadStart: LoadStartCallback? = null
        override var onLoad: LoadCallback? = null
        override var onPublishStart: PublishStartCallback? = null
        override var onEvent: EventCallback? = null
        override var onIntentChange: IntentChangeCallback? = null
        override var onWarmupComplete: WarmupCompleteCallback? = null

        override var onCancel: CancelCallback = { _, _ -> setStatus("Session cancelled.") }
        override var onError: ErrorCallback<Any>? = { error ->
            setStatus("SDK error: ${error.code} ${error.message}")
        }
        override var onPublish: PublishCallback? = { _, params -> handlePublish(params) }

        // Fires after the SDK closes its editor. After a publish, leave the browse screen too.
        override var onSessionFinished: SessionFinishedCallback? = {
            if (publishReceived) _dismissRequested.postValue(true)
        }
    }

    private fun handlePublish(params: PublishParams) {
        publishReceived = true
        val data = params.asset.orEmpty()
            .firstOrNull { it.dataType == AssetDataType.BASE64 }
            ?.getData()
            ?.takeIf { it.isNotBlank() }
        if (data == null) {
            setStatus("Publish returned no image.")
            return
        }
        viewModelScope.launch(Dispatchers.Default) {
            try {
                _image.postValue(ExportImageDecoder.decode(data))
                setStatus("Image received.")
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                setStatus("The returned image could not be displayed; try publishing again.")
            }
        }
    }
}
