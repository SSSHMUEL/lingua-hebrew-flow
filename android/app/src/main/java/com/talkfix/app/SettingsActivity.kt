package com.talkfix.app

import android.content.ComponentName
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.widget.Button
import androidx.appcompat.widget.SwitchCompat
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity

class SettingsActivity : AppCompatActivity() {

    private lateinit var settingsManager: SettingsManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_settings)

        settingsManager = SettingsManager(this)

        val tvPermissions = findViewById<TextView>(R.id.tv_permissions_status)
        val btnOverlay = findViewById<Button>(R.id.btn_check_overlay_permission)
        val btnAccessibility = findViewById<Button>(R.id.btn_open_accessibility_settings)
        val switchAll = findViewById<SwitchCompat>(R.id.switch_enable_all)
        val btnChooseApps = findViewById<Button>(R.id.btn_choose_apps)

        // Extra left shift UI
        val tvShiftValue = findViewById<TextView>(R.id.tv_extra_left_shift_value)
        val btnShiftInc = findViewById<Button>(R.id.btn_shift_increase)
        val btnShiftDec = findViewById<Button>(R.id.btn_shift_decrease)

        // Initialize current value
        tvShiftValue.text = settingsManager.getExtraLeftShiftPx().toString()

        // Helper to persist and notify overlay service
        fun applyShift(newPx: Int) {
            settingsManager.setExtraLeftShiftPx(newPx)
            tvShiftValue.text = newPx.toString()
            // Tell OverlayService to reposition immediately
            val intent = Intent(this, OverlayService::class.java).apply { putExtra("REPOSITION", true) }
            startService(intent)
        }

        btnShiftInc.setOnClickListener {
            val cur = settingsManager.getExtraLeftShiftPx()
            val next = (cur + 10).coerceAtLeast(0)
            applyShift(next)
            Toast.makeText(this, getString(R.string.shift_set_to, next), Toast.LENGTH_SHORT).show()
        }

        btnShiftDec.setOnClickListener {
            val cur = settingsManager.getExtraLeftShiftPx()
            val next = (cur - 10).coerceAtLeast(0)
            applyShift(next)
            Toast.makeText(this, getString(R.string.shift_set_to, next), Toast.LENGTH_SHORT).show()
        }

        btnOverlay.setOnClickListener {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                val intent = Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:$packageName"))
                startActivity(intent)
            }
        }

        btnAccessibility.setOnClickListener {
            // Show a consent/description dialog before sending the user to Accessibility settings
            AlertDialog.Builder(this)
                .setTitle(getString(R.string.open_accessibility))
                .setMessage(getString(R.string.accessibility_service_description))
                .setPositiveButton(getString(R.string.open_accessibility)) { _, _ ->
                    startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS))
                }
                .setNegativeButton(getString(R.string.permission_button_close), null)
                .show()
        }

        // Initialize master switch from prefs
        switchAll.isChecked = settingsManager.isOverlayEnabled() && settingsManager.isReplaceWordsEnabled()

        switchAll.setOnCheckedChangeListener { _, isChecked ->
            if (isChecked) {
                // Before enabling ensure both permissions granted
                val overlayOk = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) Settings.canDrawOverlays(this) else true
                val component = ComponentName(this, TlkFixAccessibilityService::class.java)
                val enabledServices = Settings.Secure.getString(contentResolver, Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES) ?: ""
                val accessibleOk = enabledServices.contains(component.flattenToString())

                if (!overlayOk || !accessibleOk) {
                    // revert switch and prompt user with dialog offering to open settings
                    switchAll.isChecked = false
                    AlertDialog.Builder(this)
                        .setTitle(getString(R.string.permission_dialog_title))
                        .setMessage(getString(R.string.permission_dialog_message))
                        .setPositiveButton(getString(R.string.open_accessibility)) { _, _ ->
                            startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS))
                        }
                        .setNeutralButton(getString(R.string.permission_button_settings)) { _, _ ->
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                                startActivity(Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:$packageName")))
                            }
                        }
                        .setNegativeButton(getString(R.string.permission_button_close), null)
                        .show()
                    return@setOnCheckedChangeListener
                }

                // Permissions OK — enable prefs (both overlay and replace words)
                settingsManager.setOverlayEnabled(true)
                settingsManager.setReplaceWordsEnabled(true)
                Toast.makeText(this, getString(R.string.enabled), Toast.LENGTH_SHORT).show()
            } else {
                // Turn off features
                settingsManager.setOverlayEnabled(false)
                settingsManager.setReplaceWordsEnabled(false)
                // Send hide overlay to service
                val hideIntent = Intent(this, OverlayService::class.java).apply { putExtra("HIDE_OVERLAY", true) }
                startService(hideIntent)
                Toast.makeText(this, getString(R.string.disabled), Toast.LENGTH_SHORT).show()
            }
        }

        btnChooseApps.setOnClickListener {
            val intent = Intent().setClassName(packageName, "$packageName.AppWhitelistActivity")
            startActivity(intent)
        }

        // Refresh permission status when returning
        fun refreshPermissionText() {
            val overlayOk = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) Settings.canDrawOverlays(this) else true
            val component = ComponentName(this, TlkFixAccessibilityService::class.java)
            val enabledServices = Settings.Secure.getString(contentResolver, Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES) ?: ""
            val accessibleOk = enabledServices.contains(component.flattenToString())

            val overlayStr = if (overlayOk) getString(R.string.enabled) else getString(R.string.disabled)
            val accessibleStr = if (accessibleOk) getString(R.string.enabled) else getString(R.string.disabled)
            tvPermissions.text = getString(R.string.permissions_status, overlayStr, accessibleStr)

            // Disable the master switch if permissions are missing (user must enable them first)
            if (!overlayOk || !accessibleOk) {
                if (!settingsManager.isOverlayEnabled()) {
                    switchAll.isChecked = false
                }
            }
        }
        refreshPermissionText()
    }
}
