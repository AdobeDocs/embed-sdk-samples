package com.example.wishesdemo

import android.content.ContentResolver
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.util.Base64
import java.io.ByteArrayOutputStream

/** A local-only input from a real SDK asset or an explicitly synthetic host test. */
data class ExportImageInput(val type: Type, val data: String) {
    enum class Type { BASE64, LOCAL_URI }
}

internal object ExportImageDecoder {
    private const val MAX_ENCODED_CHARS = 11_000_000
    private const val MAX_BYTES = 8 * 1024 * 1024
    private const val MAX_EDGE = 2048
    private val pngSignature = byteArrayOf(0x89.toByte(), 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)

    // atlas-snippet:start:decode-exported-image
    fun decode(input: ExportImageInput, resolver: ContentResolver): Bitmap {
        val bytes = when (input.type) {
            ExportImageInput.Type.BASE64 -> {
                require(input.data.length <= MAX_ENCODED_CHARS) { "Image is too large." }
                val encoded = input.data.substringAfter("base64,", input.data)
                require(encoded.length <= MAX_ENCODED_CHARS) { "Image is too large." }
                Base64.decode(encoded, Base64.DEFAULT)
            }
            ExportImageInput.Type.LOCAL_URI -> {
                val uri = Uri.parse(input.data)
                require(uri.scheme == ContentResolver.SCHEME_CONTENT) {
                    "Only local content URIs are accepted, not remote URLs."
                }
                resolver.openInputStream(uri)?.use { stream ->
                    ByteArrayOutputStream().use { output ->
                        val chunk = ByteArray(8192)
                        while (true) {
                            val count = stream.read(chunk)
                            if (count < 0) break
                            require(output.size() + count <= MAX_BYTES) { "Image is too large." }
                            output.write(chunk, 0, count)
                        }
                        output.toByteArray()
                    }
                } ?: error("The local image is unavailable.")
            }
        }
        require(bytes.size in pngSignature.size..MAX_BYTES &&
            bytes.take(pngSignature.size).toByteArray().contentEquals(pngSignature)) {
            "Expected a PNG image within the size limit."
        }
        val options = BitmapFactory.Options().apply { inJustDecodeBounds = true }
        BitmapFactory.decodeByteArray(bytes, 0, bytes.size, options)
        require(options.outWidth > 0 && options.outHeight > 0 &&
            options.outWidth <= 32768 && options.outHeight <= 32768) { "Invalid image dimensions." }
        options.inSampleSize = 1
        while (options.outWidth / options.inSampleSize > MAX_EDGE ||
            options.outHeight / options.inSampleSize > MAX_EDGE) options.inSampleSize *= 2
        options.inJustDecodeBounds = false
        return checkNotNull(BitmapFactory.decodeByteArray(bytes, 0, bytes.size, options)) {
            "The PNG could not be displayed."
        }
    }
    // atlas-snippet:end:decode-exported-image
}
