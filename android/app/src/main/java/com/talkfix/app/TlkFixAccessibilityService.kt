package com.talkfix.app

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.graphics.Rect
import android.os.Build
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

    private data class SubtitleNode(val node: AccessibilityNodeInfo, val rect: Rect, val text: String)

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

            if (allowedPackageSubstrings.any { lowerPkg.contains(it) }) {
                Log.d(TAG, "📺 Detected video app: $pkgName")
                val root = rootInActiveWindow ?: event.source ?: return
                findAndProcessSubtitleCandidates(root)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error in onAccessibilityEvent", e)
        }
    }

    private fun findAndProcessSubtitleCandidates(root: AccessibilityNodeInfo) {
        val subtitleNodes = mutableListOf<SubtitleNode>()
        val queue = ArrayDeque<AccessibilityNodeInfo>()
        queue.add(root)

        while (queue.isNotEmpty()) {
            val node = queue.removeFirst()
            try {
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

        if (subtitleNodes.isEmpty()) {
            Log.d(TAG, "❌ No subtitle nodes found")
            return
        }

        Log.d(TAG, "✅ Found ${subtitleNodes.size} subtitle nodes total")
        val subtitleBlocks = groupNodesIntoBlocks(subtitleNodes)
        Log.d(TAG, "📦 Grouped into ${subtitleBlocks.size} blocks")

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

        // WORD REPLACEMENT LOGIC REMOVED.
        // We will now send the original text directly to the overlay.
        val modifiedText = originalText

        val combinedRect = Rect()
        block.first().rect.let { combinedRect.set(it.left, it.top, it.right, it.bottom) }
        block.forEach { node -> combinedRect.union(node.rect) }

        Log.d(TAG, "🚀 Sending to OverlayService: text='$modifiedText' rect=$combinedRect")

        val intent = Intent(this, OverlayService::class.java).apply {
            putExtra("text", modifiedText)
            putExtra("rect", combinedRect)
            // No isFullscreen flag, we just show what we find.
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        startService(intent)
    }

    override fun onInterrupt() {}

    override fun onDestroy() {
        super.onDestroy()
        stopService(Intent(this, OverlayService::class.java))
    }
}
