package com.talkfix.app

import android.content.Intent
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
        Log.d(TAG, "TlkFixWordsPlugin loaded")
    }

    @PluginMethod
    fun getUserWords(call: PluginCall) {
        val wordsMap = localWordsStore.getWords()
        val result = JSObject()
        for ((key, value) in wordsMap) {
            result.put(key, value)
        }
        Log.d(TAG, "Returning user words to web: $result")
        call.resolve(result)
    }

    @PluginMethod
    fun saveUserWords(call: PluginCall) {
        val wordPairs = call.getString("wordPairs")
        if (wordPairs != null) {
            Log.d(TAG, "Received word pairs from web: $wordPairs")
            localWordsStore.saveWords(wordPairs)

            // Send a broadcast to notify the accessibility service to update its words
            val intent = Intent("com.talkfix.app.UPDATE_WORDS")
            context.sendBroadcast(intent)
            Log.d(TAG, "Sent UPDATE_WORDS broadcast.")

            call.resolve()
        } else {
            Log.e(TAG, "saveUserWords called with no word pairs provided")
            call.reject("No word pairs provided")
        }
    }
}
