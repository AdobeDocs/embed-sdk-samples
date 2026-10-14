package com.example.wishesdemo

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.util.Base64

object ExportImageDecoder {
    private const val MAX_EDGE = 2048

    /** Decodes a Base64 image, or a data URI, and downsamples it to fit within [MAX_EDGE] pixels. */
    fun decode(base64: String): Bitmap {
        val bytes = Base64.decode(base64.substringAfter("base64,"), Base64.DEFAULT)
        val options = BitmapFactory.Options().apply { inJustDecodeBounds = true }
        BitmapFactory.decodeByteArray(bytes, 0, bytes.size, options)
        require(options.outWidth > 0 && options.outHeight > 0) { "Not a valid image." }
        options.inSampleSize = 1
        while (maxOf(options.outWidth, options.outHeight) / options.inSampleSize > MAX_EDGE) {
            options.inSampleSize *= 2
        }
        options.inJustDecodeBounds = false
        return checkNotNull(BitmapFactory.decodeByteArray(bytes, 0, bytes.size, options)) {
            "The image could not be decoded."
        }
    }
}
