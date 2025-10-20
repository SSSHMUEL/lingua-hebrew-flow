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
    private val TAG = "TlkFixService" // Changed tag for clarity

    override fun onServiceConnected() {
        super.onServiceConnected()
        localWordsStore = LocalWordsStore(this)
        // Load words from the actual storage
        wordMap = localWordsStore.getWords()

        Log.d(TAG, "✅ ✅ ✅ Service connected. Loaded REAL words from storage: $wordMap")
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent) {
        // Word replacement logic is paused while we debug the receiving part.
        // We can re-enable this later.
    }

    override fun onInterrupt() {}
}
