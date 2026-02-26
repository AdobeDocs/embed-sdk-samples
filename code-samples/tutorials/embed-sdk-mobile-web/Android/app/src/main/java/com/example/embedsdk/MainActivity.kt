package com.example.embedsdk

import android.annotation.SuppressLint
import android.app.Dialog
import android.os.Bundle
import android.view.View
import android.view.ViewGroup
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import android.os.Build
import android.os.Message
import android.webkit.CookieManager


class MainActivity : AppCompatActivity() {
    companion object {
        private const val START_GAME_URL = "https://lintless-metempirically-issac.ngrok-free.dev?platform=android"
    }

    private var webView: WebView? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_main)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }
        webView = findViewById(R.id.webview)
        configureWebView()
        setUpStartGameHandlers()
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun configureWebView() {
        val webSettings = webView?.settings
        webView?.let { enableCookies(it) }
        // Enable hardware acceleration
        webView?.setLayerType(View.LAYER_TYPE_HARDWARE, null)

        // Enable JavaScript optimizations
        webSettings?.javaScriptEnabled = true
        webSettings?.domStorageEnabled = true
        webSettings?.databaseEnabled = true

        // Enable caching
        webSettings?.cacheMode = WebSettings.LOAD_DEFAULT

        // Set default text size (no zoom)
        webSettings?.textZoom = 100

        // Enable multiple windows
        webSettings?.javaScriptCanOpenWindowsAutomatically = true
        webSettings?.setSupportMultipleWindows(true)

        // Remove WebView identifier for OAuth compatibility
        // Google blocks WebViews by detecting "; wv" in user agent
        val originalUA = webSettings?.userAgentString ?: ""
        if (originalUA.contains("; wv")) {
            webSettings?.userAgentString = originalUA.replace("; wv)", ")").replace("; wv ", " ")
        }

        // Set up WebChromeClient to handle new windows
        webView?.webChromeClient = object : WebChromeClient() {
            override fun onCreateWindow(
                view: WebView?,
                isDialog: Boolean,
                isUserGesture: Boolean,
                resultMsg: Message?
            ): Boolean {
                // Create a new WebView for the popup
                val newWebView = WebView(this@MainActivity)
                setupPopupWebView(newWebView)

                // Create a dialog to display the new WebView
                val dialog = Dialog(this@MainActivity, android.R.style.Theme_Black_NoTitleBar_Fullscreen)

                dialog.setContentView(newWebView)
                dialog.show()

                // Set up close handler when the popup window closes
                newWebView.webChromeClient = object : WebChromeClient() {
                    override fun onCloseWindow(window: WebView?) {
                        dialog.dismiss()
                    }
                }

                // Send the new WebView to the requesting WebView
                val transport = resultMsg?.obj as? WebView.WebViewTransport
                transport?.webView = newWebView
                resultMsg?.sendToTarget()

                return true
            }
        }

        // Set a basic WebViewClient
        webView?.webViewClient = WebViewClient() 
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupPopupWebView(popupWebView: WebView) {
        val webSettings = popupWebView.settings
        enableCookies(popupWebView)
        // Enable JavaScript optimizations
        webSettings.javaScriptEnabled = true
        webSettings.domStorageEnabled = true
        webSettings.databaseEnabled = true

        // Enable caching
        webSettings.cacheMode = WebSettings.LOAD_DEFAULT

        // Set default text size (no zoom)
        webSettings.textZoom = 100

        // Enable multiple windows
        webSettings.javaScriptCanOpenWindowsAutomatically = true
        webSettings.setSupportMultipleWindows(true)

        // Remove WebView identifier for OAuth compatibility
        // Google blocks WebViews by detecting "; wv" in user agent
        val originalUA = webSettings.userAgentString ?: ""
        if (originalUA.contains("; wv")) {
            webSettings.userAgentString = originalUA.replace("; wv)", ")").replace("; wv ", " ")
        }

        // Set WebViewClient for the popup
        popupWebView.webViewClient = WebViewClient() 

        // Enable the popup to also create windows (for nested popups)
        popupWebView.webChromeClient = object : WebChromeClient() {
            override fun onCloseWindow(window: WebView?) {
                (popupWebView.parent as? ViewGroup)?.removeView(popupWebView)
            }
        }
    }

    private fun setUpStartGameHandlers() {
        findViewById<Button>(R.id.btnStartGame)
            .setOnClickListener {
                webView?.loadUrl(START_GAME_URL)
            }
    }

    private fun enableCookies(wv: WebView) {
        val cm = CookieManager.getInstance()
        cm.setAcceptCookie(true)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            cm.setAcceptThirdPartyCookies(wv, true)
        }
        cm.flush()
    }
}
