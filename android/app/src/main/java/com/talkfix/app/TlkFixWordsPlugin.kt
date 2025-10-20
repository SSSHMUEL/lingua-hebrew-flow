package com.talkfix.app

import android.util.Log
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

@CapacitorPlugin(name = "TlkFixWords")
class TlkFixWordsPlugin : Plugin() {

    private lateinit var localWordsStore: LocalWordsStore
    private val TAG = "TlkFixWordsPlugin"

    override fun load() {
        super.load()
        localWordsStore = LocalWordsStore(context)
    }

    @PluginMethod
    fun saveUserWords(call: PluginCall) {
        val wordPairs = call.getString("wordPairs")
        if (wordPairs != null) {
            Log.d(TAG, "Received word pairs from web: $wordPairs")
            localWordsStore.saveWords(wordPairs)
            // Update Accessibility Service with new data
            // This part requires a mechanism to pass data to the running service, e.g., using a BroadcastReceiver or EventBus.
            // For simplicity, we'll assume the service reloads the data upon new events.
            call.resolve()
        } else {
            Log.e(TAG, "saveUserWords called with no word pairs provided")
            call.reject("No word pairs provided")
        }
    }
}
