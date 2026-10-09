package com.example.wishesdemo

import android.graphics.Bitmap
import android.graphics.drawable.BitmapDrawable
import android.util.Base64
import android.widget.ImageView
import androidx.test.core.app.ActivityScenario
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import kotlinx.coroutines.Job
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import java.io.ByteArrayOutputStream

/** Host-side image handling with synthetic inputs; no editor or export request. */
@RunWith(AndroidJUnit4::class)
class LocalHostInstrumentedTest {
    private val device get() = InstrumentationRegistry.getInstrumentation()

    @Test fun syntheticPngRendersInHostImageView() {
        val bitmap = Bitmap.createBitmap(9, 7, Bitmap.Config.ARGB_8888)
        val imageBytes = ByteArrayOutputStream().also {
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, it)
        }.toByteArray()
        bitmap.recycle()
        val input = ExportImageInput(ExportImageInput.Type.BASE64,
            "data:image/png;base64," + Base64.encodeToString(imageBytes, Base64.NO_WRAP))
        ActivityScenario.launch(MainActivity::class.java).use { scenario ->
            var job: Job? = null
            scenario.onActivity { activity -> job = activity.showExportedImage(input) }
            runBlocking { checkNotNull(job).join() }
            scenario.onActivity { activity ->
                val view = activity.findViewById<ImageView>(R.id.exported_image)
                val drawable = view.drawable as BitmapDrawable
                assertNotNull(drawable)
                assertEquals(9, drawable.bitmap.width)
                assertEquals(7, drawable.bitmap.height)
                assertEquals("Published PNG image", view.contentDescription)
            }
        }
    }

    @Test fun decoderRejectsRemoteUrlAndOversizedDataWithoutSdk() {
        val resolver = device.targetContext.contentResolver
        try {
            ExportImageDecoder.decode(ExportImageInput(ExportImageInput.Type.LOCAL_URI,
                "https://example.invalid/image.png"), resolver)
            error("Remote URL was accepted")
        } catch (expected: IllegalArgumentException) {
            assertTrue(expected.message.orEmpty().contains("local"))
        }
        try {
            ExportImageDecoder.decode(ExportImageInput(ExportImageInput.Type.BASE64,
                "x".repeat(11_000_001)), resolver)
            error("Oversized payload was accepted")
        } catch (expected: IllegalArgumentException) {
            assertTrue(expected.message.orEmpty().contains("large"))
        }
    }
}
