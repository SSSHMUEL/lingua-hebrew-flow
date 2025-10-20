package com.talkfix.app

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.graphics.Rect
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo

class TlkFixAccessibilityService : AccessibilityService() {

    private lateinit var localWordsStore: LocalWordsStore
    private var wordMap: Map<String, String> = emptyMap()
    private val TAG = "TlkFixService"

    override fun onServiceConnected() {
        super.onServiceConnected()
        localWordsStore = LocalWordsStore(this)
        // Load real words from storage
        wordMap = localWordsStore.getWords()
        Log.d(TAG, "Service connected. Loaded words from storage: $wordMap")
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent) {
        // Re-enabled logic
        if (event.eventType == AccessibilityEvent.TYPE_VIEW_TEXT_CHANGED) {
            val source = event.source
            if (source != null && source.text != null) {
                processNode(source)
            }
            source?.recycle()
        }
    }

    private fun processNode(nodeInfo: AccessibilityNodeInfo) {
        val originalText = nodeInfo.text.toString()
        if (originalText.isBlank()) {
            return
        }

        var modifiedText = originalText
        var replacementOccurred = false

        wordMap.forEach { (hebrew, english) ->
            if (modifiedText.contains(hebrew)) {
                modifiedText = modifiedText.replace(hebrew, english)
                replacementOccurred = true
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
            startService(intent)
        }
    }

    override fun onInterrupt() {}
}
