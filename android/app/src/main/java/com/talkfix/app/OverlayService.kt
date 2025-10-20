package com.talkfix.app

import android.app.Service
import android.content.Intent
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.Rect
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.provider.Settings
import android.util.DisplayMetrics
import android.util.Log
import android.view.Gravity
import android.view.WindowManager
import android.widget.TextView

class OverlayService : Service() {

    private lateinit var windowManager: WindowManager
    private var overlayView: TextView? = null
    private val TAG = "OverlayService"
    private val handler = Handler()
    private var removeRunnable: Runnable? = null

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    override fun onStartCommand(intent: Intent, flags: Int, startId: Int): Int {
        val text = intent.getStringExtra("text")
        var rect = intent.getParcelableExtra<Rect>("rect")

        if (text != null) {
            // If rect is null or invalid, compute a fallback rect near the bottom center
            if (rect == null || rect.width() <= 0 || rect.height() <= 0) {
                val metrics = DisplayMetrics()
                val wm = getSystemService(WINDOW_SERVICE) as WindowManager
                try {
                    wm.defaultDisplay.getMetrics(metrics)
                } catch (e: Exception) {
                    // fallback
                    metrics.widthPixels = resources.displayMetrics.widthPixels
                    metrics.heightPixels = resources.displayMetrics.heightPixels
                }
                val fw = (metrics.widthPixels * 0.8).toInt()
                val fh = (metrics.heightPixels * 0.08).toInt().coerceAtLeast(48)
                val fx = (metrics.widthPixels - fw) / 2
                val fy = (metrics.heightPixels * 0.85).toInt()
                rect = Rect(fx, fy, fx + fw, fy + fh)
                Log.d(TAG, "Using fallback rect=$rect for overlay")
            }

            showOverlay(text, rect)
        } else {
            Log.w(TAG, "OverlayService started without text. text=$text rect=$rect")
        }

        return START_NOT_STICKY
    }

    private fun showOverlay(text: String, rect: Rect) {
        try {
            if (!Settings.canDrawOverlays(this)) {
                Log.e(TAG, "No draw-over-other-apps permission. Prompting user to grant it.")
                // Try to open settings so the user can grant the permission
                val intent = Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:$packageName"))
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                startActivity(intent)
                return
            }

            if (overlayView == null) {
                overlayView = TextView(this).apply {
                    setTextColor(Color.WHITE)
                    setBackgroundColor(Color.parseColor("#66000000"))
                    setPadding(16, 8, 16, 8)
                    textSize = 16f
                }
                windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
            }

            overlayView?.text = text

            val layoutType = when {
                Build.VERSION.SDK_INT >= Build.VERSION_CODES.O -> WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                else -> WindowManager.LayoutParams.TYPE_PHONE
            }

            val params = WindowManager.LayoutParams(
                WindowManager.LayoutParams.WRAP_CONTENT,
                WindowManager.LayoutParams.WRAP_CONTENT,
                layoutType,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
                PixelFormat.TRANSLUCENT
            ).apply {
                gravity = Gravity.TOP or Gravity.LEFT
                x = rect.left
                y = rect.top
                // keep view visible on top
            }

            try {
                if (overlayView?.isAttachedToWindow == true) {
                    windowManager.updateViewLayout(overlayView, params)
                } else {
                    windowManager.addView(overlayView, params)
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error adding/updating overlay view", e)
            }

            // Auto-remove after a short timeout to avoid persistent overlays
            removeRunnable?.let { handler.removeCallbacks(it) }
            removeRunnable = Runnable {
                try {
                    if (overlayView != null && overlayView?.isAttachedToWindow == true) {
                        windowManager.removeView(overlayView)
                    }
                    overlayView = null
                    stopSelf()
                } catch (e: Exception) {
                    Log.w(TAG, "Error removing overlay view: ${e.message}")
                }
            }
            handler.postDelayed(removeRunnable!!, 3000)

        } catch (e: Exception) {
            Log.e(TAG, "Unexpected error in showOverlay", e)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        try {
            removeRunnable?.let { handler.removeCallbacks(it) }
            if (overlayView != null && overlayView?.isAttachedToWindow == true) {
                windowManager.removeView(overlayView)
            }
        } catch (e: Exception) {
            Log.w(TAG, "Error cleaning up overlay: ${e.message}")
        }
    }
}
