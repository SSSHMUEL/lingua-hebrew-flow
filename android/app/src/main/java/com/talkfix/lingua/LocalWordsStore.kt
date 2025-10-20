package com.talkfix.lingua

import android.content.Context
import android.content.SharedPreferences
import org.json.JSONObject

class LocalWordsStore(context: Context) {

    private val sharedPreferences: SharedPreferences =
        context.getSharedPreferences("TlkFixWords", Context.MODE_PRIVATE)

    fun saveWords(wordPairsJson: String) {
        sharedPreferences.edit().putString("wordPairs", wordPairsJson).apply()
    }

    fun getWords(): Map<String, String> {
        val wordPairsJson = sharedPreferences.getString("wordPairs", null)
        val wordMap = mutableMapOf<String, String>()

        if (wordPairsJson != null) {
            val jsonObject = JSONObject(wordPairsJson)
            val keys = jsonObject.keys()
            while (keys.hasNext()) {
                val key = keys.next()
                wordMap[key] = jsonObject.getString(key)
            }
        }

        return wordMap
    }
}
