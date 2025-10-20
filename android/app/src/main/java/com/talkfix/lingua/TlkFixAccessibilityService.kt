package com.talkfix.lingua

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.graphics.Rect
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo

class TlkFixAccessibilityService : AccessibilityService() {

    private lateinit var localWordsStore: LocalWordsStore
    private var wordMap: Map<String, String> = emptyMap()

    override fun onServiceConnected() {
        super.onServiceConnected()
        localWordsStore = LocalWordsStore(this)
        wordMap = localWordsStore.getWords()
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent) {
        if (event.eventType == AccessibilityEvent.TYPE_VIEW_TEXT_CHANGED) {
            val source = event.source
            if (source != null && source.text != null) {
                processNode(source)
            }
        }
    }

    private fun processNode(nodeInfo: AccessibilityNodeInfo) {
        val originalText = nodeInfo.text.toString()
        var modifiedText = originalText
        wordMap.forEach { (hebrew, english) ->
            modifiedText = modifiedText.replace(hebrew, english)
        }

        if (originalText != modifiedText) {
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
