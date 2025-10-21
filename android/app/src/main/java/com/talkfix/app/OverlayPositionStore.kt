package com.talkfix.app

import android.content.Context
import android.content.SharedPreferences
import android.graphics.Point

class OverlayPositionStore(context: Context) {

    private val sharedPreferences: SharedPreferences =
        context.getSharedPreferences("TlkFixOverlayPosition", Context.MODE_PRIVATE)

    companion object {
        private const val KEY_OFFSET_X = "offsetX"
        private const val KEY_OFFSET_Y = "offsetY"
    }

    /**
     * Saves the positional offset for the overlay.
     */
    fun saveOffset(x: Int, y: Int) {
        sharedPreferences.edit()
            .putInt(KEY_OFFSET_X, x)
            .putInt(KEY_OFFSET_Y, y)
            .apply()
    }

    /**
     * Retrieves the saved positional offset.
     * @return A Point containing the (x, y) offset, or (0, 0) if none is saved.
     */
    fun getOffset(): Point {
        val x = sharedPreferences.getInt(KEY_OFFSET_X, 0)
        val y = sharedPreferences.getInt(KEY_OFFSET_Y, 0)
        return Point(x, y)
    }
}
