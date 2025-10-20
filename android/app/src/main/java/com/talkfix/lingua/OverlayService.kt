package com.talkfix.lingua

import android.app.Service
import android.content.Intent
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.Rect
import android.os.IBinder
import android.view.Gravity
import android.view.WindowManager
import android.widget.TextView

class OverlayService : Service() {

    private lateinit var windowManager: WindowManager
    private var overlayView: TextView? = null

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    override fun onStartCommand(intent: Intent, flags: Int, startId: Int): Int {
        val text = intent.getStringExtra("text")
        val rect = intent.getParcelableExtra<Rect>("rect")

        if (text != null && rect != null) {
            showOverlay(text, rect)
        }

        return START_NOT_STICKY
    }

    private fun showOverlay(text: String, rect: Rect) {
        if (overlayView == null) {
            overlayView = TextView(this).apply {
                setTextColor(Color.WHITE)
                setBackgroundColor(Color.BLACK)
                setPadding(10, 10, 10, 10)
            }
            windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
        }

        overlayView?.text = text

        val params = WindowManager.LayoutParams(
            rect.width(),
            rect.height(),
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.LEFT
            x = rect.left
            y = rect.top
        }

        if (overlayView?.windowToken == null) {
            windowManager.addView(overlayView, params)
        } else {
            windowManager.updateViewLayout(overlayView, params)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        if (overlayView != null) {
            windowManager.removeView(overlayView)
        }
    }
}
