package com.talkfix.app

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.graphics.Rect
import android.os.Build
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo

class TlkFixAccessibilityService : AccessibilityService() {

    private lateinit var localWordsStore: LocalWordsStore
    private var wordMap: Map<String, String> = emptyMap()
    private val TAG = "TlkFixService"
    private var screenWidth: Int = 0
    private var screenHeight: Int = 0

    // Exact package whitelist for popular video apps (matches package name)
    private val allowedPackageExact = setOf(
        "com.google.android.youtube",
        "com.netflix.mediaclient",
        "org.videolan.vlc",
        "com.mxtech.videoplayer.ad",
        "com.mxtech.videoplayer.pro",
        "org.xbmc.kodi",
        "com.plexapp.android",
        "com.amazon.avod",
        "com.huawei.hws.mediaplayer",
        // Add NewPipe exact package
        "org.schabi.newpipe",
        // Telegram official package
        "org.telegram.messenger",
        // YouTube Vanced common package (may vary)
        "com.vanced.android.youtube",
        // Spotify official package
        "com.spotify.music"
    )

    // Substring fallback for other less common players and variants (includes Telegram and modded YouTubes)
    private val allowedPackageSubstrings = listOf(
        "youtube",
        "vanced",
        "ytvanced",
        "netflix",
        "vlc",
        "mxtech",
        "vimeo",
        "exoplayer",
        "video",
        "player",
        "media",
        "telegram",
        "newpipe",
        "microg",
        "spotify"
    )

    override fun onServiceConnected() {
        super.onServiceConnected()
        localWordsStore = LocalWordsStore(this)
        val displayMetrics = resources.displayMetrics
        screenWidth = displayMetrics.widthPixels
        screenHeight = displayMetrics.heightPixels

        // Initial load
        reloadWords()

        Log.d(TAG, "Service connected. Screen: ${screenWidth}x${screenHeight}")
    }

    private fun reloadWords() {
        wordMap = localWordsStore.getWords()
        Log.d(TAG, "Reloaded words from storage: ${wordMap.size} words found.")
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent) {
        try {
            // Reload words each event to pick up latest changes without needing broadcasts
            reloadWords()

            // Determine root to inspect
            val root = rootInActiveWindow ?: event.source ?: return

            // Gather heuristics first
            val hasSeekBar = hasVideoSeekBar(root)
            val hasSubtitleLike = hasSubtitleNode(root)

            val pkgName = (event.packageName ?: root.packageName)?.toString()
            val lowerPkg = pkgName?.lowercase() ?: ""
            val pkgExact = allowedPackageExact.contains(pkgName)
            val pkgLikelyVideo = allowedPackageSubstrings.any { lowerPkg.contains(it) }

            // Decide: allow only if exact whitelist, or detected subtitle node, or (seekbar present and package looks like a video player)
            val proceed = pkgExact || hasSubtitleLike || (hasSeekBar && pkgLikelyVideo)

            Log.d(TAG, "Event from pkg=$pkgName pkgExact=$pkgExact pkgLikelyVideo=$pkgLikelyVideo seekbar=$hasSeekBar subtitleLike=$hasSubtitleLike proceed=$proceed type=${event.eventType}")

            if (!proceed) return

            if (event.eventType == AccessibilityEvent.TYPE_VIEW_TEXT_CHANGED ||
                event.eventType == AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED ||
                event.eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {

                val replacements = scanAndProcessCandidates(root)
                if (replacements == 0) {
                    Log.d(TAG, "No replacements performed for this event (type=${event.eventType}).")
                }
            }

        } catch (e: Exception) {
            Log.e(TAG, "Error handling accessibility event", e)
        }
    }

    private fun isPackageAllowed(pkg: String?): Boolean {
        // kept for backward compatibility but not used in main flow
        if (pkg.isNullOrBlank()) return false
        val lower = pkg.lowercase()
        if (allowedPackageExact.contains(pkg)) return true
        allowedPackageSubstrings.forEach { sub ->
            if (lower.contains(sub)) return true
        }
        return false
    }

    private fun hasVideoSeekBar(root: AccessibilityNodeInfo): Boolean {
        val queue = ArrayDeque<AccessibilityNodeInfo>()
        queue.add(root)
        try {
            while (queue.isNotEmpty()) {
                val node = queue.removeFirst()
                try {
                    val className = node.className?.toString() ?: ""
                    if (className.contains("SeekBar") || className.contains("seekbar", true)) {
                        val bounds = Rect()
                        node.getBoundsInScreen(bounds)
                        if (bounds.width() > screenWidth * 0.6) {
                            return true
                        }
                    }
                    for (i in 0 until node.childCount) {
                        node.getChild(i)?.let { queue.add(it) }
                    }
                } catch (_: Exception) {
                    // ignore and continue
                }
            }
        } finally {
            // No explicit recycle() calls; AccessibilityNodeInfo.recycle() is deprecated.
        }
        return false
    }

    private fun hasSubtitleNode(root: AccessibilityNodeInfo): Boolean {
        val queue = ArrayDeque<AccessibilityNodeInfo>()
        queue.add(root)
        try {
            while (queue.isNotEmpty()) {
                val node = queue.removeFirst()
                try {
                    val className = node.className?.toString() ?: ""
                    val text = node.text?.toString() ?: node.contentDescription?.toString() ?: ""
                    if (className.contains("Subtitle", true) || className.contains("Caption", true) || className.contains("video", true)) {
                        if (text.isNotBlank()) return true
                    }
                    if (className.contains("TextView", true) && text.length in 1..100) {
                        val bounds = Rect()
                        node.getBoundsInScreen(bounds)
                        val bottomThreshold = (screenHeight * 0.7).toInt()
                        if (bounds.bottom >= bottomThreshold) return true
                    }
                    for (i in 0 until node.childCount) {
                        node.getChild(i)?.let { queue.add(it) }
                    }
                } catch (_: Exception) {
                }
            }
        } finally {
            // No explicit recycle() calls; AccessibilityNodeInfo.recycle() is deprecated.
        }
        return false
    }

    private fun scanAndProcessCandidates(root: AccessibilityNodeInfo): Int {
        val queue = ArrayDeque<AccessibilityNodeInfo>()
        queue.add(root)
        var replacements = 0

        try {
            while (queue.isNotEmpty()) {
                val node = queue.removeFirst()
                try {
                    if (node.isVisibleToUser) {
                        val rect = Rect()
                        node.getBoundsInScreen(rect)
                        val textStr = node.text?.toString() ?: node.contentDescription?.toString() ?: ""

                        if (textStr.isNotBlank()) {
                            val bottomThreshold = (screenHeight * 0.6).toInt()
                            val className = node.className?.toString() ?: ""
                            val looksLikeSubtitle = className.contains("Subtitle", true) ||
                                    className.contains("TextView", true) ||
                                    className.contains("Caption", true)

                            Log.d(TAG, "Candidate text='$textStr' bounds=$rect class=$className desc=${node.contentDescription}")

                            if ((rect.bottom >= bottomThreshold && textStr.length <= 800) || looksLikeSubtitle) {
                                val didReplace = processNode(node)
                                if (didReplace) replacements++
                            }
                        }
                    }

                    for (i in 0 until node.childCount) {
                        node.getChild(i)?.let { child ->
                            queue.add(child)
                        }
                    }
                } catch (inner: Exception) {
                    Log.w(TAG, "Skipping node during traversal due to: ${inner.message}")
                }
            }
        } finally {
            // No explicit recycle() calls; AccessibilityNodeInfo.recycle() is deprecated.
        }

        return replacements
    }

    private fun processNode(nodeInfo: AccessibilityNodeInfo): Boolean {
        val originalText = nodeInfo.text?.toString() ?: nodeInfo.contentDescription?.toString() ?: ""
        if (originalText.isBlank()) return false

        var modifiedText = originalText
        var replacementOccurred = false

        wordMap.forEach { (hebrew, english) ->
            try {
                if (modifiedText.contains(hebrew)) {
                    modifiedText = modifiedText.replace(hebrew, english)
                    replacementOccurred = true
                }
            } catch (e: Exception) {
                Log.w(TAG, "Error replacing word '$hebrew' in text", e)
            }
        }

        if (replacementOccurred) {
            Log.d(TAG, "Replacing '$originalText' with '$modifiedText'")
            val rect = Rect()
            nodeInfo.getBoundsInScreen(rect)

            val intent = Intent(this, OverlayService::class.java).apply {
                putExtra("text", modifiedText)
                putExtra("rect", rect)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }

            try {
                startService(intent)
            } catch (e: Exception) {
                Log.e(TAG, "Failed to start OverlayService", e)
            }

            return true
        }

        return false
    }

    override fun onInterrupt() {}

    override fun onDestroy() {
        super.onDestroy()
        Log.d(TAG, "Service destroyed.")
    }
}
