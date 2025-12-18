package com.talkfix.app

import android.annotation.SuppressLint
import android.app.Service
import android.content.Intent
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.Rect
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Build
import android.os.IBinder
import android.provider.Settings
import android.util.Log
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import android.text.TextPaint
import kotlin.math.max

class OverlayService : Service() {

    private lateinit var windowManager: WindowManager
    private var overlayContainer: FrameLayout? = null
    // Replace single TextView with a LinearLayout of lines
    private var linesContainer: LinearLayout? = null
    private val TAG = "OverlayService"
    private lateinit var localWordsStore: LocalWordsStore
    private var wordMap: Map<String, String> = emptyMap()
    private var lastDisplayedText: String = ""
    private var lastRect: Rect? = null
    private var currentOverlayX: Int = -1
    private var currentOverlayY: Int = -1
    private var currentOverlayWidth: Int = -1
    private var currentOverlayHeight: Int = -1
    private var lastShowTime: Long = 0

    // Settings manager
    private lateinit var settingsManager: SettingsManager

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
        localWordsStore = LocalWordsStore(this)
        wordMap = localWordsStore.getWords()
        settingsManager = SettingsManager(this)
    }

    // Build solid black background with square corners (no transparency, no rounding)
    private fun buildCaptionBackground(): GradientDrawable {
        return GradientDrawable().apply {
            shape = GradientDrawable.RECTANGLE
            setColor(0xFF000000.toInt()) // solid black
            // Use square corners (no rounding)
            cornerRadius = 0f
        }
    }

    @SuppressLint("ClickableViewAccessibility", "RtlHardcoded")
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent == null) {
            stopSelf()
            return START_NOT_STICKY
        }

        // If overlay is disabled in settings, do nothing
        if (this::settingsManager.isInitialized && !settingsManager.isOverlayEnabled()) {
            Log.d(TAG, "Overlay disabled in settings - ignoring start command")
            return START_STICKY
        }

        // Check if we have overlay permission
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (!Settings.canDrawOverlays(this)) {
                Log.e(TAG, "❌ No overlay permission! User must enable 'Display over other apps' in settings.")
                return START_STICKY
            }
        }

        if (intent.hasExtra("RELOAD_WORDS")) {
            wordMap = localWordsStore.getWords()
            Log.d(TAG, "Words reloaded in OverlayService")
            if (!intent.hasExtra("text")) {
                return START_STICKY
            }
        }

        // Temporarily hide overlay when seek bar is visible
        if (intent.hasExtra("TEMP_HIDE")) {
            Log.d(TAG, "🎚️ Temporarily hiding overlay for seek bar")
            overlayContainer?.visibility = View.INVISIBLE // Use INVISIBLE to keep layout
            return START_STICKY
        }

        // Hide overlay when leaving video app
        if (intent.hasExtra("HIDE_OVERLAY")) {
            Log.d(TAG, "🚪 User left video app - hiding overlay")
            overlayContainer?.visibility = View.GONE
            lastDisplayedText = ""
            return START_STICKY
        }

        // Reposition existing overlay according to current settings (no text required)
        if (intent.hasExtra("REPOSITION")) {
            Log.d(TAG, "🔧 Reposition request received")
            if (overlayContainer != null && lastRect != null) {
                try {
                    val screenHeight = resources.displayMetrics.heightPixels
                    val screenWidth = resources.displayMetrics.widthPixels
                    val params = overlayContainer!!.layoutParams as WindowManager.LayoutParams
                    val xOffsetPx = dpToPx(settingsManager.getXOffsetDp().toFloat())
                    val extraLeftShiftPx = settingsManager.getExtraLeftShiftPx()
                    val newX = (lastRect!!.left - xOffsetPx - extraLeftShiftPx).coerceIn(0, max(0, screenWidth - lastRect!!.width()))
                    val newY = lastRect!!.top.coerceIn(0, max(0, screenHeight - lastRect!!.height()))
                    params.x = newX
                    params.y = newY
                    try { windowManager.updateViewLayout(overlayContainer, params) } catch (e: Exception) { Log.e(TAG, "Error updating overlay layout", e) }
                    currentOverlayX = newX
                    currentOverlayY = newY
                    Log.d(TAG, "Overlay repositioned: x=$newX y=$newY")
                } catch (e: Exception) {
                    Log.e(TAG, "Error handling REPOSITION", e)
                }
            }
            return START_STICKY
        }

        val text = intent.getStringExtra("text") ?: ""
        val rect = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            intent.getParcelableExtra("rect", Rect::class.java)
        } else {
            @Suppress("DEPRECATION")
            intent.getParcelableExtra("rect")
        }

        Log.d(TAG, "📥 Incoming: text='${text}' rect=${rect}")

        if (text.isEmpty() || rect == null) {
            overlayContainer?.let { it.visibility = View.GONE }
            return START_STICKY
        }

        // Filter out too small areas
        if (rect.width() < 80 || rect.height() < 15) {
            return START_STICKY
        }

        // Replace words for display only if enabled in settings
        val modifiedText = if (this::settingsManager.isInitialized && settingsManager.isReplaceWordsEnabled()) replaceWords(text) else text
        lastDisplayedText = text
        lastRect = Rect(rect) // Copy the rect

        val screenHeight = resources.displayMetrics.heightPixels
        val screenWidth = resources.displayMetrics.widthPixels

        if (overlayContainer == null) {
            Log.d(TAG, "onStartCommand: creating overlay container")
            overlayContainer = FrameLayout(this).apply { setBackgroundColor(Color.TRANSPARENT) }
            linesContainer = LinearLayout(this).apply {
                orientation = LinearLayout.VERTICAL
                gravity = Gravity.LEFT or Gravity.CENTER_VERTICAL
                setBackgroundColor(Color.TRANSPARENT)
            }
            overlayContainer!!.addView(
                linesContainer,
                FrameLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT
                )
            )

            val layoutFlag = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
            else @Suppress("DEPRECATION") WindowManager.LayoutParams.TYPE_PHONE

            val xOffsetPx = dpToPx(settingsManager.getXOffsetDp().toFloat())
            // Read extra left shift (pixels) from settings so we can adjust at runtime
            val extraLeftShiftPx = settingsManager.getExtraLeftShiftPx()

            val params = WindowManager.LayoutParams(
                rect.width(),
                rect.height(),
                layoutFlag,
                // Keep not touchable so underlying seekbar remains clickable
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE,
                PixelFormat.TRANSLUCENT
            ).apply {
                gravity = Gravity.TOP or Gravity.START
                // apply user X offset (positive moves left relative to rect.left to allow covering original subs)
                // shift left by the configured extra pixels
                x = (rect.left - xOffsetPx - extraLeftShiftPx).coerceIn(0, max(0, screenWidth - rect.width()))
                y = rect.top.coerceIn(0, max(0, screenHeight - rect.height()))
            }
            Log.d(TAG, "Overlay create params: x=${params.x} y=${params.y} w=${params.width} h=${params.height}")
            windowManager.addView(overlayContainer, params)
            currentOverlayX = params.x
            currentOverlayY = params.y
            currentOverlayWidth = params.width
            currentOverlayHeight = params.height
        } else {
            overlayContainer?.let {
                val params = it.layoutParams as WindowManager.LayoutParams
                val xOffsetPx = dpToPx(settingsManager.getXOffsetDp().toFloat())
                // apply same extra-left-shift from settings for updates
                val extraLeftShiftPx = settingsManager.getExtraLeftShiftPx()
                val newX = (rect.left - xOffsetPx - extraLeftShiftPx).coerceIn(0, max(0, screenWidth - rect.width()))
                val newY = rect.top.coerceIn(0, max(0, screenHeight - rect.height()))
                val newWidth = rect.width()
                val newHeight = rect.height()
                val xChanged = kotlin.math.abs(currentOverlayX - newX) >= 5
                val yChanged = kotlin.math.abs(currentOverlayY - newY) >= 5
                val widthChanged = kotlin.math.abs(currentOverlayWidth - newWidth) >= 5
                val heightChanged = kotlin.math.abs(currentOverlayHeight - newHeight) >= 5
                if (xChanged || yChanged || widthChanged || heightChanged) {
                    params.x = newX
                    params.y = newY
                    params.width = newWidth
                    params.height = newHeight
                    Log.d(TAG, "Overlay update params: x=${params.x} y=${params.y} w=${params.width} h=${params.height}")
                    currentOverlayX = newX
                    currentOverlayY = newY
                    currentOverlayWidth = newWidth
                    currentOverlayHeight = newHeight
                    try { windowManager.updateViewLayout(it, params) } catch (_: Exception) {}
                }
            }
        }

        // Build per-line strips that match YouTube style using original and modified text
        ensurePerLineViews(text, modifiedText, rect)

        overlayContainer?.let {
            if (it.visibility != View.VISIBLE) {
                it.visibility = View.VISIBLE
                lastShowTime = System.currentTimeMillis()
            }
        }

        return START_STICKY
    }

    private fun dpToPx(dp: Float): Int = TypedValue.applyDimension(
        TypedValue.COMPLEX_UNIT_DIP,
        dp,
        resources.displayMetrics
    ).toInt()

    // Update to consider both original and modified lines and apply rounded background
    @SuppressLint("RtlHardcoded")
    private fun ensurePerLineViews(originalText: String, modifiedText: String, rect: Rect) {
        val container = linesContainer ?: return
        val origLinesAll = originalText.split("\n").map { it.trim() }
        val modLinesAll = modifiedText.split("\n").map { it.trim() }
        val lines = modLinesAll.filter { it.isNotEmpty() }.ifEmpty { listOf(modifiedText) }
        val lineCount = lines.size.coerceAtLeast(1)
        val lineHeight = (rect.height() / lineCount.toFloat())

        // Approximate YouTube caption style
        val verticalPadPx = dpToPx(6f)
        val horizontalPadPx = dpToPx(12f)
        val ytTypeface = Typeface.create("sans-serif-medium", Typeface.NORMAL)

        // Read user font preference and convert to px
        val userFontDp = if (this::settingsManager.isInitialized) settingsManager.getFontSizeDp() else 16
        val userFontPx = dpToPx(userFontDp.toFloat()).toFloat()

        val computedTextSize = (lineHeight * 0.75f).coerceAtLeast(dpToPx(12f).toFloat())
        val textSizePx = max(computedTextSize, userFontPx)

        val modPaint = TextPaint().apply { isAntiAlias = true; color = Color.WHITE; textSize = textSizePx; typeface = ytTypeface }
        val origPaint = TextPaint().apply { isAntiAlias = true; color = Color.WHITE; textSize = textSizePx; typeface = ytTypeface }

        // Ensure we have enough child views
        while (container.childCount < lineCount) {
            val tv = TextView(this).apply {
                setTextColor(Color.WHITE)
                background = buildCaptionBackground()
                setPadding(horizontalPadPx, verticalPadPx / 2, horizontalPadPx, verticalPadPx / 2)
                gravity = Gravity.LEFT or Gravity.CENTER_VERTICAL
                includeFontPadding = false
                maxLines = 1
                ellipsize = null
                textAlignment = View.TEXT_ALIGNMENT_VIEW_START
                typeface = ytTypeface
            }
            container.addView(
                tv,
                LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT).apply {
                    gravity = Gravity.LEFT
                }
            )
        }
        // Remove extra child views
        while (container.childCount > lineCount) {
            container.removeViewAt(container.childCount - 1)
        }

        val maxWidth = rect.width()
        for (i in 0 until lineCount) {
            val tv = container.getChildAt(i) as TextView
            val modLine = lines[i]
            val origLine = origLinesAll.getOrNull(i)?.ifBlank { modLine } ?: modLine
            tv.text = modLine
            tv.setTextSize(TypedValue.COMPLEX_UNIT_PX, textSizePx)

            // Measure desired width for the text (cover original and modified)
            val modWidth = modPaint.measureText(modLine)
            val origWidth = origPaint.measureText(origLine)
            val contentWidth = max(modWidth, origWidth)
            val desiredWidth = (contentWidth + horizontalPadPx * 2 + dpToPx(4f)).toInt().coerceAtMost(maxWidth)

            val lp = tv.layoutParams as LinearLayout.LayoutParams
            lp.width = desiredWidth
            lp.height = lineHeight.toInt()
            lp.gravity = Gravity.LEFT
            tv.layoutParams = lp
        }
    }

    private fun replaceWords(originalText: String): String {
        if (wordMap.isEmpty()) return originalText
        try {
            val words = originalText.split(" ")
            val replacedWords = words.map { word ->
                if (word.isBlank()) return@map word
                val leadingPunct = word.takeWhile { it in "([{\"'״׳" }
                val trailingPunct = word.takeLastWhile { it in ".,!?:;)]}\"'״׳" }
                val cleanWord = word.substring(leadingPunct.length, word.length - trailingPunct.length)
                if (cleanWord.isEmpty()) return@map word
                val replacement = wordMap[cleanWord]
                if (replacement != null) leadingPunct + replacement + trailingPunct else word
            }
            return replacedWords.joinToString(" ")
        } catch (e: Exception) {
            Log.e(TAG, "Error in replaceWords: ${e.message}", e)
            return originalText
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        overlayContainer?.let { windowManager.removeView(it) }
        overlayContainer = null
        linesContainer = null
    }
}
