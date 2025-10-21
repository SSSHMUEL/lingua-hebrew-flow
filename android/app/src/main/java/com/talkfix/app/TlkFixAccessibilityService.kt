package com.talkfix.app

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.graphics.Rect
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import kotlin.math.abs

class TlkFixAccessibilityService : AccessibilityService() {

    private lateinit var localWordsStore: LocalWordsStore
    private var wordMap: Map<String, String> = emptyMap()
    private val TAG = "TlkFixService"
    private var screenWidth: Int = 0
    private var screenHeight: Int = 0
    private var currentVideoApp: String? = null
    private val handler = Handler(Looper.getMainLooper())
    private var isPolling = false
    private var lastSeekBarVisible = false
    private var lastSubtitleIntent: Intent? = null

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

    private val blockedPackageSubstrings = listOf(
        "com.google.android.apps.nexuslauncher", "com.android.systemui", "com.samsung.android.app.spage"
    )

    override fun onServiceConnected() {
        super.onServiceConnected()
        localWordsStore = LocalWordsStore(this)
        val displayMetrics = resources.displayMetrics
        screenWidth = displayMetrics.widthPixels
        screenHeight = displayMetrics.heightPixels
        reloadWords()
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

            if (blockedPackageSubstrings.any { lowerPkg.contains(it) }) {
                return
            }

            val isVideoApp = allowedPackageSubstrings.any { lowerPkg.contains(it) }

            // Detect when leaving a video app
            if (currentVideoApp != null && !isVideoApp) {
                Log.d(TAG, "🚪 Left video app: $currentVideoApp → $pkgName")
                // Stop polling
                isPolling = false
                handler.removeCallbacks(pollingRunnable)
                // Send signal to hide overlay immediately
                val hideIntent = Intent(this, OverlayService::class.java).apply {
                    putExtra("HIDE_OVERLAY", true)
                }
                startService(hideIntent)
                currentVideoApp = null
                return
            }

            if (isVideoApp) {
                if (currentVideoApp != pkgName) {
                    Log.d(TAG, "📺 Detected video app: $pkgName")
                    currentVideoApp = pkgName
                    // Start polling for faster subtitle detection
                    if (!isPolling) {
                        isPolling = true
                        handler.post(pollingRunnable)
                    }
                }
                val root = rootInActiveWindow ?: event.source ?: return
                findAndProcessSubtitleCandidates(root)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error in onAccessibilityEvent", e)
        }
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
            } catch (e: Exception) {
                // Ignore
            }
        }

        // If seek bar is visible, hide our overlay
        if (seekBarVisible) {
            if (!lastSeekBarVisible) {
                Log.d(TAG, "🎚️ Seek bar visible - hiding our captions temporarily")
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

        Log.d(TAG, "✅ Fullscreen detected (width: ${widthPercentage.toInt()}% of screen, pos: ${verticalPosition.toInt()}%)")
        Log.d(TAG, "🚀 Sending to OverlayService: text='$originalText' rect=$combinedRect")

        val intent = Intent(this, OverlayService::class.java).apply {
            putExtra("text", originalText)
            putExtra("rect", combinedRect)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        lastSubtitleIntent = intent // Save for restoration after seek bar disappears
        startService(intent)
    }

    override fun onInterrupt() {}

    override fun onDestroy() {
        super.onDestroy()
        isPolling = false
        handler.removeCallbacks(pollingRunnable)
        stopService(Intent(this, OverlayService::class.java))
    }
}
