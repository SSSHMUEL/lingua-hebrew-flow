package com.talkfix.app

import android.content.Context

class SettingsManager(private val context: Context) {
    private val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    companion object {
        private const val PREFS_NAME = "tlkfix_prefs"
        private const val KEY_ENABLE_OVERLAY = "enable_overlay"
        private const val KEY_REPLACE_WORDS = "replace_words"
        private const val KEY_WHITELIST = "whitelist_packages"

        // New keys for UI preferences
        private const val KEY_X_OFFSET_DP = "x_offset_dp"
        private const val KEY_FONT_SIZE_DP = "font_size_dp"
        private const val KEY_EXTRA_LEFT_SHIFT_PX = "extra_left_shift_px"

        // Defaults
        // Do NOT enable overlay by default. Installing from an APK should NOT start showing captions
        // automatically; user must opt-in via the app settings.
        private const val DEFAULT_ENABLE_OVERLAY = false
        private const val DEFAULT_REPLACE_WORDS = false
        private const val DEFAULT_X_OFFSET_DP = 0
        private const val DEFAULT_FONT_SIZE_DP = 16
        private const val DEFAULT_EXTRA_LEFT_SHIFT_PX = 60
    }

    fun isOverlayEnabled(): Boolean = prefs.getBoolean(KEY_ENABLE_OVERLAY, DEFAULT_ENABLE_OVERLAY)
    fun setOverlayEnabled(value: Boolean) = prefs.edit().putBoolean(KEY_ENABLE_OVERLAY, value).apply()

    fun isReplaceWordsEnabled(): Boolean = prefs.getBoolean(KEY_REPLACE_WORDS, DEFAULT_REPLACE_WORDS)
    fun setReplaceWordsEnabled(value: Boolean) = prefs.edit().putBoolean(KEY_REPLACE_WORDS, value).apply()

    fun getWhitelistPackages(): Set<String> = prefs.getStringSet(KEY_WHITELIST, emptySet()) ?: emptySet()
    fun setWhitelistPackages(packages: Set<String>) = prefs.edit().putStringSet(KEY_WHITELIST, packages).apply()

    // X offset in dp (used to shift overlay horizontally)
    fun getXOffsetDp(): Int = prefs.getInt(KEY_X_OFFSET_DP, DEFAULT_X_OFFSET_DP)
    fun setXOffsetDp(dp: Int) = prefs.edit().putInt(KEY_X_OFFSET_DP, dp).apply()

    // Font size in dp for overlay text
    fun getFontSizeDp(): Int = prefs.getInt(KEY_FONT_SIZE_DP, DEFAULT_FONT_SIZE_DP)
    fun setFontSizeDp(dp: Int) = prefs.edit().putInt(KEY_FONT_SIZE_DP, dp).apply()

    // Extra hard left shift in pixels (useful for quick adjustments)
    fun getExtraLeftShiftPx(): Int = prefs.getInt(KEY_EXTRA_LEFT_SHIFT_PX, DEFAULT_EXTRA_LEFT_SHIFT_PX)
    fun setExtraLeftShiftPx(px: Int) = prefs.edit().putInt(KEY_EXTRA_LEFT_SHIFT_PX, px).apply()
}
