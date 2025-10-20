package com.talkfix.app

import android.accessibilityservice.AccessibilityService
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
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

    private val wordsUpdateReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            if (intent.action == "com.talkfix.app.UPDATE_WORDS") {
                Log.d(TAG, "Received broadcast to update words.")
                reloadWords()
            }
        }
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        localWordsStore = LocalWordsStore(this)
        val displayMetrics = resources.displayMetrics
        screenWidth = displayMetrics.widthPixels
        screenHeight = displayMetrics.heightPixels

        val filter = IntentFilter("com.talkfix.app.UPDATE_WORDS")
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(wordsUpdateReceiver, filter, RECEIVER_EXPORTED)
        } else {
            registerReceiver(wordsUpdateReceiver, filter)
        }

        reloadWords()

        Log.d(TAG, "Service connected and broadcast receiver registered. Screen: ${screenWidth}x${screenHeight}")
    }

    private fun reloadWords() {
        wordMap = localWordsStore.getWords()
        Log.d(TAG, "Reloaded words from storage: ${wordMap.size} words found.")
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent) {
        // Broadened: handle text changes and window content/state changes
        try {
            val source = event.source ?: return

            if (event.eventType == AccessibilityEvent.TYPE_VIEW_TEXT_CHANGED ||
                event.eventType == AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED ||
                event.eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {

                // Walk the subtree from the event source and process candidate text nodes
                val replacements = scanAndProcessCandidates(source)
                if (replacements == 0) {
                    Log.d(TAG, "No replacements performed for this event (type=${event.eventType}).")
                }
            }

            // We don't recycle here because we did in scanAndProcessCandidates
        } catch (e: Exception) {
            Log.e(TAG, "Error handling accessibility event", e)
        }
    }

    private fun scanAndProcessCandidates(root: AccessibilityNodeInfo): Int {
        val queue = ArrayDeque<AccessibilityNodeInfo>()
        queue.add(root)
        val visited = mutableListOf<AccessibilityNodeInfo>()
        var replacements = 0

        try {
            while (queue.isNotEmpty()) {
                val node = queue.removeFirst()
                visited.add(node)

                try {
                    if (node.isVisibleToUser) {
                        val rect = Rect()
                        node.getBoundsInScreen(rect)
                        val textStr = node.text?.toString() ?: node.contentDescription?.toString() ?: ""

                        if (textStr.isNotBlank()) {
                            // Heuristics: lower threshold (60%) and check className/contentDescription
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
                    // Node might become invalid while iterating; log and continue
                    Log.w(TAG, "Skipping node during traversal due to: ${inner.message}")
                }
            }
        } finally {
            // recycle nodes we obtained via getChild/getSource
            visited.forEach { try { it.recycle() } catch (_: Exception) {} }
        }

        return replacements
    }

    private fun processNode(nodeInfo: AccessibilityNodeInfo): Boolean {
        val originalText = nodeInfo.text?.toString() ?: nodeInfo.contentDescription?.toString() ?: ""
        if (originalText.isBlank()) return false

        var modifiedText = originalText
        var replacementOccurred = false

        // Replace occurrences
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

            // Send overlay with replaced text
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
        try {
            unregisterReceiver(wordsUpdateReceiver)
        } catch (e: Exception) {
            Log.w(TAG, "Error unregistering receiver: ${e.message}")
        }
        Log.d(TAG, "Service destroyed and broadcast receiver unregistered.")
    }
}
