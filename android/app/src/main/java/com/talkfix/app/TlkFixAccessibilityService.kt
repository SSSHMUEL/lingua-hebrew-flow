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
    private val TAG = "TlkFixAccessibilityService"

    override fun onServiceConnected() {
        super.onServiceConnected()
        localWordsStore = LocalWordsStore(this)
        wordMap = localWordsStore.getWords()
        Log.d(TAG, "Service connected. Loaded words: $wordMap")
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent) {
        // Reverted to the simplest possible logic for debugging:
        // Process ANY text change, anywhere on the screen.
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
        wordMap.forEach { (hebrew, english) ->
            modifiedText = modifiedText.replace(hebrew, english)
        }

        // If a replacement happened, show the overlay.
        if (originalText != modifiedText) {
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
