package com.talkfix.app

import android.annotation.SuppressLint
import android.app.Service
import android.content.Intent
import android.graphics.Color
import android.graphics.Paint
import android.graphics.PixelFormat
import android.graphics.Rect
import android.os.Build
import android.os.IBinder
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.util.Log
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.widget.FrameLayout
import android.widget.TextView
import android.text.Layout
import android.text.StaticLayout
import android.text.TextPaint
import androidx.core.content.edit
import kotlin.math.max
import kotlin.math.min

class OverlayService : Service() {

    private lateinit var windowManager: WindowManager
    private var overlayContainer: FrameLayout? = null
    private var overlayView: TextView? = null
    private val TAG = "OverlayService"
    private lateinit var localWordsStore: LocalWordsStore
    private var wordMap: Map<String, String> = emptyMap()
    private var lastText: String = ""
    private var lastUpdateTime: Long = 0

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
        localWordsStore = LocalWordsStore(this)
        wordMap = localWordsStore.getWords()
    }

    @SuppressLint("ClickableViewAccessibility")
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent == null) {
            stopSelf()
            return START_NOT_STICKY
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
            // If there's no text, we just stop here after reloading.
            if (!intent.hasExtra("text")) {
                return START_STICKY
            }
        }

        val text = intent.getStringExtra("text") ?: ""
        val rect = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            intent.getParcelableExtra("rect", Rect::class.java)
        } else {
            @Suppress("DEPRECATION")
            intent.getParcelableExtra("rect")
        }

        if (text.isEmpty() || rect == null) {
            overlayContainer?.let { it.visibility = View.GONE }
            return START_STICKY
        }

        // Filter out small UI elements like clock, buttons, etc.
        // Real subtitles are usually at least 100px wide and 40px tall
        if (rect.width() < 100 || rect.height() < 40) {
            Log.d(TAG, "⏭️ Skipping small element: ${rect.width()}x${rect.height()}")
            return START_STICKY
        }

        // Skip duplicate updates to reduce delay
        val currentTime = System.currentTimeMillis()
        if (text == lastText && (currentTime - lastUpdateTime) < 50) {
            Log.d(TAG, "⏭️ Skipping duplicate update")
            return START_STICKY
        }
        lastText = text
        lastUpdateTime = currentTime

        val modifiedText = replaceWords(text)
        Log.d(TAG, "onStartCommand: received text=$text rect=$rect")
        Log.d(TAG, "Modified text: $modifiedText")
        Log.d(TAG, "WordMap size: ${wordMap.size}")

        val screenHeight = resources.displayMetrics.heightPixels
        val screenWidth = resources.displayMetrics.widthPixels

        if (overlayContainer == null) {
            Log.d(TAG, "onStartCommand: creating overlay container")
            overlayContainer = FrameLayout(this).apply { setBackgroundColor(Color.TRANSPARENT) }
            overlayView = TextView(this).apply {
                setTextColor(Color.WHITE)
                setBackgroundColor(Color.BLACK)
                val pad = (6 * resources.displayMetrics.density).toInt()
                setPadding(pad, pad / 2, pad, pad / 2)
                gravity = Gravity.CENTER
                isSingleLine = false
                maxLines = Integer.MAX_VALUE
            }
            overlayContainer!!.addView(overlayView, FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            ))

            val layoutFlag = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
            else
                @Suppress("DEPRECATION") WindowManager.LayoutParams.TYPE_PHONE

            val params = WindowManager.LayoutParams(
                rect.width(),
                rect.height(),
                layoutFlag,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE,
                PixelFormat.TRANSLUCENT
            ).apply {
                gravity = Gravity.TOP or Gravity.START
                x = rect.left.coerceIn(0, max(0, screenWidth - rect.width()))
                y = rect.top.coerceIn(0, max(0, screenHeight - rect.height()))
            }
            windowManager.addView(overlayContainer, params)
            Log.d(TAG, "overlay added at x=${params.x} y=${params.y} w=${params.width} h=${params.height}")
        }

        overlayContainer?.let {
            it.visibility = View.VISIBLE
            val params = it.layoutParams as WindowManager.LayoutParams
            // Shift 40 pixels to the left to cover original subtitles exactly
            params.x = (rect.left - 40).coerceIn(0, max(0, screenWidth - rect.width()))
            params.y = rect.top.coerceIn(0, max(0, screenHeight - rect.height()))
            params.width = rect.width()
            params.height = rect.height()
            windowManager.updateViewLayout(it, params)
            Log.d(TAG, "updating overlay params: x=${params.x} y=${params.y} w=${params.width} h=${params.height}")
        }

        overlayView?.text = modifiedText
        Log.d(TAG, "set overlay text: '$modifiedText'")

        return START_STICKY
    }

    private fun replaceWords(originalText: String): String {
        if (wordMap.isEmpty()) {
            Log.d(TAG, "WordMap is empty, returning original text")
            return originalText
        }

        try {
            // Split text into words once
            val words = originalText.split(" ")
            Log.d(TAG, "Split into ${words.size} words")

            // Process each word
            val replacedWords = words.map { word ->
                if (word.isBlank()) return@map word

                // Extract leading and trailing punctuation
                val leadingPunct = word.takeWhile { it in "([{\"'״׳" }
                val trailingPunct = word.takeLastWhile { it in ".,!?:;)]}\"'״׳" }
                val cleanWord = word.substring(leadingPunct.length, word.length - trailingPunct.length)

                if (cleanWord.isEmpty()) return@map word

                // Check if this word should be replaced
                val replacement = wordMap[cleanWord]
                if (replacement != null) {
                    Log.d(TAG, "Replacing '$cleanWord' with '$replacement'")
                    leadingPunct + replacement + trailingPunct
                } else {
                    word
                }
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
        overlayView = null
    }
}
