//
//  ViewController.swift
//  DevxSampleApp
//
//  Created by Priyanshu Gupta on 2/3/26.
//

import UIKit
import WebKit

class ViewController: UIViewController, WKNavigationDelegate, WKUIDelegate {
    // private let startGameUrlString = "https://lintless-metempirically-issac.ngrok-free.dev?platform=ios"
    private let startGameUrlString = "https://fantasy.premierleague.com/badge-create?platform=ios"
    var newWebviewPopupWindow: WKWebView?
    
    @IBOutlet weak var startGameButton: UIButton!
    @IBOutlet weak var footerView: UIView!

    lazy var webView: WKWebView = {
        let webViewConfig = getWebviewConfig()

        let webView = WKWebView(
            frame: .zero,
            configuration: webViewConfig
        )
        webView.navigationDelegate = self
        webView.uiDelegate = self
        // Set custom user agent for OAuth compatibility (affects HTTP headers)
        self.setCustomUserAgent(for: webView)
        
        return webView
    }()

    private func getWebviewConfig() -> WKWebViewConfiguration {
        let webViewConfig = WKWebViewConfiguration()
        let webpagePreferences = WKWebpagePreferences()
        webpagePreferences.allowsContentJavaScript = true
        webViewConfig.websiteDataStore = .default()
        webViewConfig.preferences.javaScriptCanOpenWindowsAutomatically = true
        webViewConfig.defaultWebpagePreferences = webpagePreferences
        webViewConfig.userContentController.addUserScript(getZoomDisableScript())

        return webViewConfig
    }

    // Set custom user agent that affects HTTP headers (required for OAuth)
    private func setCustomUserAgent(for webView: WKWebView) {
        let version = UIDevice.current.systemVersion.replacingOccurrences(of: ".", with: "_")
        let iosVersion = UIDevice.current.systemVersion
        let customUA = "Mozilla/5.0 (iPhone; CPU iPhone OS \(version) like Mac OS X) " +
            "AppleWebKit/605.1.15 (KHTML, like Gecko) " +
            "Version/\(iosVersion) Mobile/15E148 Safari/604.1"
        webView.customUserAgent = customUA
    }

    private func getZoomDisableScript() -> WKUserScript {
        let source = """
        var meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
        var head = document.getElementsByTagName('head')[0];
        head.appendChild(meta);
        """
        return WKUserScript(source: source, injectionTime: .atDocumentStart, forMainFrameOnly: true)
    }

    func webView(
        _: WKWebView,
        createWebViewWith configuration: WKWebViewConfiguration,
        for navigationAction: WKNavigationAction,
        windowFeatures _: WKWindowFeatures
    ) -> WKWebView? {
        newWebviewPopupWindow = WKWebView(frame: view.bounds, configuration: configuration)
        newWebviewPopupWindow!.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        newWebviewPopupWindow!.navigationDelegate = self
        newWebviewPopupWindow!.uiDelegate = self
        self.setCustomUserAgent(for: newWebviewPopupWindow!)
        
        // Set content insets for safe areas
        let topInset = view.safeAreaInsets.top
        newWebviewPopupWindow!.scrollView.contentInset = UIEdgeInsets(top: topInset, left: 0, bottom: 0, right: 0)
        newWebviewPopupWindow!.scrollView.scrollIndicatorInsets = newWebviewPopupWindow!.scrollView.contentInset
        
        view.addSubview(newWebviewPopupWindow!)
        return newWebviewPopupWindow!
    }

    func webViewDidClose(_ webView: WKWebView) {
        webView.removeFromSuperview()
        newWebviewPopupWindow = nil
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view.
        view.addSubview(webView)
        
        // Ensure the footer stays on top of the webView
        if let footer = footerView {
            view.bringSubviewToFront(footer)
        }
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()

        let buttonHeight: CGFloat = 50
        let buttonPadding: CGFloat = 16
        let topPadding: CGFloat = 12
        let footerContentHeight = topPadding + buttonHeight + buttonPadding
        
        // Set webview frame to fill from top edge, leaving space at bottom for footer
        webView.frame.origin.x = 0
        webView.frame.origin.y = 0
        webView.frame.size.width = view.bounds.width
        webView.frame.size.height = view.safeAreaLayoutGuide.layoutFrame.maxY - footerContentHeight
        
        // Set content insets so web content respects safe areas
        let topInset = view.safeAreaInsets.top
        webView.scrollView.contentInset = UIEdgeInsets(top: topInset, left: 0, bottom: 0, right: 0)
        webView.scrollView.scrollIndicatorInsets = webView.scrollView.contentInset
        
        // Start content at top (accounting for the inset)
        if webView.scrollView.contentOffset.y == 0 {
            webView.scrollView.contentOffset = CGPoint(x: 0, y: -topInset)
        }
        
        // Position footer directly below webView extending to bottom of screen
        if let footer = footerView {
            footer.frame.origin.x = 0
            footer.frame.origin.y = webView.frame.maxY
            footer.frame.size.width = view.bounds.width
            footer.frame.size.height = view.bounds.height - webView.frame.maxY
            view.bringSubviewToFront(footer)
            
            // Center button vertically within the visible footer area
            if let button = startGameButton {
                button.frame.origin.x = buttonPadding
                button.frame.origin.y = topPadding
                button.frame.size.width = footer.frame.width - (buttonPadding * 2)
                button.frame.size.height = buttonHeight
            }
        }
    }

    @IBAction func startGameButtonPressed(_ sender: UIButton) {
        print("Start the Game button was pressed")
        guard let url = URL(string: startGameUrlString) else { return }
        let urlRequest = URLRequest(url: url)
        webView.load(urlRequest)
    }
}
