package com.talkfix.app

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.graphics.Rect
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.content.res.Configuration
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import kotlin.math.abs

class TlkFixAccessibilityService : AccessibilityService() {

    /**
     * Accessibility service used to detect on-screen subtitles and forward them to an overlay.
     *
     * NOTE: This service intentionally requires accessibility permissions and reads visible
     * window content. Ensure the app clearly requests consent from the user and that the
     * service is declared in the application's AndroidManifest.xml with appropriate
     * descriptions. This implementation tries to limit data collection to only visible
     * subtitle text and bounding rects, and respects settings (overlay enabled / whitelist).
     */

    private lateinit var localWordsStore: LocalWordsStore
    private var wordMap: Map<String, String> = emptyMap()
    // Make TAG a compile-time constant to satisfy lint and reduce allocations
    companion object {
        private const val TAG = "TlkFixService"
    }
    private var screenWidth: Int = 0
    private var screenHeight: Int = 0
    private var currentVideoApp: String? = null
    private val handler = Handler(Looper.getMainLooper())
    private var isPolling = false
    private var lastSeekBarVisible = false
    private var lastSubtitleIntent: Intent? = null

    // New: remember last sent text/rect to avoid duplicates
    private var lastSentText: String? = null
    private var lastSentRect: Rect? = null

    // Debounce stop runnable to avoid transient package changes cancelling video mode
    private var pendingStopRunnable: Runnable? = null
    private val STOP_DELAY_MS = 500L

    private data class SubtitleNode(val node: AccessibilityNodeInfo, val rect: Rect, val text: String)

    private val pollingRunnable = object : Runnable {
        override fun run() {
            if (isPolling && currentVideoApp != null) {
                try {
                    val root = rootInActiveWindow
                    if (root != null) {
                        findAndProcessSubtitleCandidates(root)
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Error in polling", e)
                }
                handler.postDelayed(this, 30) // Check every 30ms for very fast response
            }
        }
    }

    private val allowedPackageSubstrings = listOf(
        "youtube", "vanced", "netflix", "vlc", "mxtech", "video", "player", "media", "telegram", "spotify", "plex"
    )

    // Removed "systemui" here because transient system UI windows (controls/gestures) frequently
    // cause quick package change events which were cancelling video mode and preventing
    // subtitle detection; we will still ignore true system apps like launchers via other checks.
    private val blockedPackageSubstrings = listOf(
        "launcher", "inputmethod", "keyboard"
    )

    // Settings manager
    private lateinit var settingsManager: SettingsManager

    override fun onServiceConnected() {
        super.onServiceConnected()
        localWordsStore = LocalWordsStore(this)
        val displayMetrics = resources.displayMetrics
        screenWidth = displayMetrics.widthPixels
        screenHeight = displayMetrics.heightPixels
        reloadWords()
        settingsManager = SettingsManager(this)
        Log.d(TAG, "Service connected. Screen: ${screenWidth}x${screenHeight}")
    }

    private fun reloadWords() {
        // We still load the words, but won't use them for now.
        wordMap = localWordsStore.getWords()
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent) {
        try {
            val pkgName = event.packageName?.toString() ?: return
            val lowerPkg = pkgName.lowercase()

            // Update current screen metrics on each event to handle rotation
            val dm = resources.displayMetrics
            screenWidth = dm.widthPixels
            screenHeight = dm.heightPixels
            // Prefer checking the active window bounds (rootInActiveWindow or event.source)
            // because service resources.configuration can be stale or not reflect the video player's orientation.
            var isLandscape = resources.configuration.orientation == Configuration.ORIENTATION_LANDSCAPE
            try {
                val orientationRoot = rootInActiveWindow ?: event.source
                if (orientationRoot != null) {
                    val winRect = Rect()
                    orientationRoot.getBoundsInScreen(winRect)
                    if (winRect.width() > 0 && winRect.height() > 0) {
                        isLandscape = winRect.width() > winRect.height()
                        // Update metrics to the active window's size for more accurate percentage calculations
                        screenWidth = winRect.width()
                        screenHeight = winRect.height()
                      }
                }
            } catch (_: Exception) {
                // Ignore and keep fallback isLandscape
            }

            // Check if this is a blocked package (launcher, system UI, etc.)
            val isBlocked = blockedPackageSubstrings.any { lowerPkg.contains(it) }

            // If we're in a video app and now we see a blocked package or non-video app, schedule an exit
            if (currentVideoApp != null && isBlocked) {
                Log.d(TAG, "🚪 Left video app to blocked app: $currentVideoApp → $pkgName")
                scheduleStopVideoMode()
                return
            }

            val isVideoApp = allowedPackageSubstrings.any { lowerPkg.contains(it) }

            // Detect when leaving a video app to any other app -- schedule stop (debounced)
            if (currentVideoApp != null && !isVideoApp) {
                Log.d(TAG, "🚪 Left video app: $currentVideoApp → $pkgName")
                scheduleStopVideoMode()
                return
            }

            if (isVideoApp) {
                // Only operate while device is in landscape (user requested detection only in landscape)
                if (!isLandscape) {
                    Log.d(TAG, "➡️ Video app detected but device not in landscape - skipping detection")
                    // schedule stop to hide overlay cleanly after a short debounce
                    scheduleStopVideoMode()
                    return
                }

                // Cancel any pending stop since we re-entered a video app quickly
                cancelPendingStop()

                if (currentVideoApp != pkgName) {
                    Log.d(TAG, "📺 Detected video app: $pkgName")
                    currentVideoApp = pkgName
                    // Diagnostic logging: print orientation and active-window bounds for debugging
                    try {
                        val resOrient = resources.configuration.orientation
                        Log.d(TAG, "DEBUG orientation resource: $resOrient (Configuration.ORIENTATION_LANDSCAPE=${Configuration.ORIENTATION_LANDSCAPE})")
                        val rootForDebug = rootInActiveWindow ?: event.source
                        rootForDebug?.let {
                            val dbgRect = Rect()
                            it.getBoundsInScreen(dbgRect)
                            Log.d(TAG, "DEBUG active window bounds: w=${dbgRect.width()} h=${dbgRect.height()} left=${dbgRect.left} top=${dbgRect.top}")
                        }
                        Log.d(TAG, "DEBUG used screenWidth=${screenWidth} screenHeight=${screenHeight} isLandscape=$isLandscape")
                    } catch (_: Exception) {
                        // ignore debug failures
                    }
                    // Start polling for faster subtitle detection only if overlay enabled and whitelist allows
                    if (!isPolling) {
                        // If overlay is disabled in settings, don't start polling
                        if (!this::settingsManager.isInitialized || !settingsManager.isOverlayEnabled()) {
                            Log.d(TAG, "Overlay disabled in settings - not starting polling")
                        } else {
                            // If whitelist exists and current app is not in it, skip starting polling
                            val whitelist = settingsManager.getWhitelistPackages()
                            if (whitelist.isNotEmpty() && !whitelist.contains(pkgName)) {
                                Log.d(TAG, "App not in whitelist - not starting polling for $pkgName")
                            } else {
                                isPolling = true
                                handler.post(pollingRunnable)
                            }
                        }
                    }
                }
                val root = rootInActiveWindow ?: event.source ?: return
                findAndProcessSubtitleCandidates(root)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error in onAccessibilityEvent", e)
        }
    }

    private fun scheduleStopVideoMode() {
        pendingStopRunnable?.let { handler.removeCallbacks(it) }
        val r = Runnable {
            stopVideoMode()
            pendingStopRunnable = null
        }
        pendingStopRunnable = r
        handler.postDelayed(r, STOP_DELAY_MS)
        Log.d(TAG, "⏱️ Scheduled stopVideoMode in ${STOP_DELAY_MS}ms")
    }

    private fun cancelPendingStop() {
        pendingStopRunnable?.let {
            handler.removeCallbacks(it)
            pendingStopRunnable = null
            Log.d(TAG, "✖️ Canceled pending stopVideoMode")
        }
    }

    private fun stopVideoMode() {
        // Cancel any pending stop when actually stopping
        pendingStopRunnable?.let { handler.removeCallbacks(it); pendingStopRunnable = null }

        isPolling = false
        handler.removeCallbacks(pollingRunnable)
        val hideIntent = Intent(this, OverlayService::class.java).apply {
            putExtra("HIDE_OVERLAY", true)
        }
        startService(hideIntent)
        currentVideoApp = null
        lastSubtitleIntent = null
        lastSeekBarVisible = false
        lastSentText = null
        lastSentRect = null
    }

    private fun findAndProcessSubtitleCandidates(root: AccessibilityNodeInfo) {
        val subtitleNodes = mutableListOf<SubtitleNode>()
        var seekBarVisible = false
        val queue = ArrayDeque<AccessibilityNodeInfo>()
        queue.add(root)

        while (queue.isNotEmpty()) {
            val node = queue.removeFirst()
            try {
                // Check if this is a seek bar or progress bar in the bottom of screen
                val className = node.className?.toString() ?: ""
                if ((className.contains("SeekBar") || className.contains("ProgressBar")) && node.isVisibleToUser) {
                    val rect = Rect()
                    node.getBoundsInScreen(rect)
                    // Check if it's in the bottom half and has reasonable size
                    if (rect.top > screenHeight / 2 && rect.width() > screenWidth / 3) {
                        seekBarVisible = true
                        Log.d(TAG, "📊 Seek bar detected at rect=$rect")
                      }
                }

                if (node.isVisibleToUser && !node.text.isNullOrBlank()) {
                    val rect = Rect()
                    node.getBoundsInScreen(rect)
                    if (rect.top > screenHeight / 2) {
                        subtitleNodes.add(SubtitleNode(node, rect, node.text.toString()))
                        Log.d(TAG, "📝 Found subtitle candidate: '${node.text}' at rect=$rect")
                    }
                }
                for (i in 0 until node.childCount) {
                    node.getChild(i)?.let { queue.add(it) }
                }
            } catch (_: Exception) {
                // Ignore
            }
        }

        // If seek bar is visible, hide our overlay (always hide on seekbar per new requirements)
        if (seekBarVisible) {
            if (!lastSeekBarVisible) {
                Log.d(TAG, "🎚️ Seek bar visible - hiding our captions temporarily (default behavior)")
                val hideIntent = Intent(this, OverlayService::class.java).apply {
                    putExtra("TEMP_HIDE", true)
                }
                startService(hideIntent)
                lastSeekBarVisible = true
            }
            return
        }

        // Seek bar just disappeared - restore last subtitle immediately
        if (lastSeekBarVisible) {
            Log.d(TAG, "✅ Seek bar disappeared - restoring captions")
            lastSeekBarVisible = false
            lastSubtitleIntent?.let {
                startService(it)
            }
        }

        if (subtitleNodes.isEmpty()) {
            Log.d(TAG, "❌ No subtitle nodes found (keeping current overlay visible)")
            // Don't hide overlay - just keep the current subtitle visible
            return
        }

        Log.d(TAG, "✅ Found ${subtitleNodes.size} subtitle nodes total")
        val subtitleBlocks = groupNodesIntoBlocks(subtitleNodes)
        Log.d(TAG, "📦 Grouped into ${subtitleBlocks.size} blocks")

        // Process all subtitle blocks
        subtitleBlocks.forEach { block ->
            processSubtitleBlock(block)
        }
    }

    private fun groupNodesIntoBlocks(nodes: List<SubtitleNode>): List<List<SubtitleNode>> {
        if (nodes.isEmpty()) return emptyList()
        val sortedNodes = nodes.sortedWith(compareBy({ it.rect.top }, { it.rect.left }))
        val blocks = mutableListOf<MutableList<SubtitleNode>>()
        var currentBlock: MutableList<SubtitleNode>? = null
        for (node in sortedNodes) {
            if (currentBlock == null) {
                currentBlock = mutableListOf(node)
                blocks.add(currentBlock)
            } else {
                val lastNodeInBlock = currentBlock.last()
                val verticalDistance = node.rect.top - lastNodeInBlock.rect.bottom
                val verticalThreshold = lastNodeInBlock.rect.height() * 1.5
                val horizontalAlignmentDiff = abs(node.rect.centerX() - lastNodeInBlock.rect.centerX())
                val horizontalThreshold = lastNodeInBlock.rect.width() * 0.75

                if (verticalDistance >= 0 && verticalDistance < verticalThreshold && horizontalAlignmentDiff < horizontalThreshold) {
                    currentBlock.add(node)
                } else {
                    currentBlock = mutableListOf(node)
                    blocks.add(currentBlock)
                }
            }
        }
        return blocks
    }

    private fun processSubtitleBlock(block: List<SubtitleNode>) {
        if (block.isEmpty()) return

        val originalText = block.joinToString(separator = "\n") { it.text }
        if (originalText.isBlank()) return

        // Filter out non-subtitle text patterns
        val textLower = originalText.lowercase()
        val nonSubtitlePatterns = listOf(
            "באוקטובר", "בנובמבר", "בדצמבר", "בינואר", "בפברואר", "במרץ", "באפריל", "במאי", "ביוני", "ביולי", "באוגוסט", "בספטמבר",
            "יום א", "יום ב", "יום ג", "יום ד", "יום ה", "יום ו", "שבת",
            "subscribers", "subscribe", "views", "ago", "likes", "comments",
            "צפיות", "לפני", "עריכה", "תגובות", "מנויים", "הירשם"
        )

        if (nonSubtitlePatterns.any { textLower.contains(it) }) {
            Log.d(TAG, "⏭️ Skipping non-subtitle text (date/UI element): '$originalText'")
            return
        }

        val combinedRect = Rect()
        block.first().rect.let { combinedRect.set(it.left, it.top, it.right, it.bottom) }
        block.forEach { node -> combinedRect.union(node.rect) }

        // Check if video is in fullscreen mode
        // Accept subtitles that span at least 10% of screen width to catch short subtitles
        // and are positioned in the bottom 60% of the screen
        val widthPercentage = (combinedRect.width().toFloat() / screenWidth.toFloat()) * 100
        val verticalPosition = (combinedRect.top.toFloat() / screenHeight.toFloat()) * 100

        Log.d(TAG, "🔍 Checking subtitle: width=${widthPercentage.toInt()}% pos=${verticalPosition.toInt()}% text='$originalText'")

        if (widthPercentage < 10) {
            Log.d(TAG, "⏭️ Skipping non-fullscreen subtitle (width: ${widthPercentage.toInt()}% of screen, pos: ${verticalPosition.toInt()}%)")
            return
        }

        if (verticalPosition < 40) {
            Log.d(TAG, "⏭️ Skipping top element (width: ${widthPercentage.toInt()}%, vertical pos: ${verticalPosition.toInt()}%)")
            return
        }

        // Check settings: is overlay enabled? is app whitelisted?
        if (!this::settingsManager.isInitialized || !settingsManager.isOverlayEnabled()) {
            Log.d(TAG, "Overlay disabled in settings - not sending to OverlayService")
            return
        }
        val whitelist = settingsManager.getWhitelistPackages()
        if (whitelist.isNotEmpty() && currentVideoApp != null && !whitelist.contains(currentVideoApp!!)) {
            Log.d(TAG, "Current app not in whitelist - skipping overlay for $currentVideoApp")
            return
        }

        Log.d(TAG, "✅ Fullscreen detected (width: ${widthPercentage.toInt()}% of screen, pos: ${verticalPosition.toInt()}%)")
        Log.d(TAG, "🚀 Sending to OverlayService: text='$originalText' rect=$combinedRect")

        // Avoid resending identical subtitle repeatedly
        if (originalText == lastSentText && combinedRect == lastSentRect) {
            Log.d(TAG, "⏭️ Subtitle unchanged - skipping send")
            return
        }

        val intent = Intent(this, OverlayService::class.java).apply {
            putExtra("text", originalText)
            putExtra("rect", combinedRect)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        lastSubtitleIntent = intent // Save for restoration after seek bar disappears
        lastSentText = originalText
        lastSentRect = Rect(combinedRect)
        startService(intent)
    }

    override fun onInterrupt() {}

    override fun onDestroy() {
        super.onDestroy()
        isPolling = false
        handler.removeCallbacks(pollingRunnable)
        pendingStopRunnable?.let { handler.removeCallbacks(it); pendingStopRunnable = null }
        stopService(Intent(this, OverlayService::class.java))
    }
}
