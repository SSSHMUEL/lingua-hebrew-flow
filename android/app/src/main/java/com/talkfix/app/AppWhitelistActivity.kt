package com.talkfix.app

import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.os.Bundle
import android.util.Log
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.ListView
import androidx.appcompat.app.AppCompatActivity

class AppWhitelistActivity : AppCompatActivity() {

    private lateinit var settingsManager: SettingsManager
    private val TAG = "AppWhitelistActivity"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_app_whitelist)

        settingsManager = SettingsManager(this)

        val listView = findViewById<ListView>(R.id.list_apps)
        val btnSave = findViewById<Button>(R.id.btn_save_whitelist)

        val pm = packageManager
        val myPkg = packageName

        // Curated packages to ensure popular video apps (like YouTube) appear
        val curated = listOf(
            "com.google.android.youtube",
            "com.google.android.youtube.tv",
            "com.google.android.apps.youtube.kids",
            "com.vanced.android.youtube",
            "com.youtube.kids",
            "com.netflix.mediaclient",
            "org.videolan.vlc",
            "com.mxtech.videoplayer.ad",
            "com.mxtech.videoplayer.pro",
            "org.telegram.messenger"
        )

        val seen = linkedSetOf<String>()
        val appItems = mutableListOf<Pair<String, String>>() // Pair<label, package>

        // Add curated packages if installed
        for (pkg in curated) {
            if (pkg == myPkg) {
                Log.d(TAG, "Skipping own package from curated: $pkg")
                continue
            }
            try {
                val ai = pm.getApplicationInfo(pkg, 0)
                val label = pm.getApplicationLabel(ai).toString()
                if (!seen.contains(pkg)) {
                    seen.add(pkg)
                    appItems.add(Pair(label, pkg))
                    Log.d(TAG, "Curated app present: $label ($pkg)")
                }
            } catch (_: Exception) {
                Log.d(TAG, "Curated app not installed: $pkg")
            }
        }

        // Query activities that can VIEW video/* intents (catch other video apps)
        try {
            val intent = Intent(Intent.ACTION_VIEW).apply { type = "video/*" }
            val resolves = pm.queryIntentActivities(intent, PackageManager.MATCH_DEFAULT_ONLY)
            Log.d(TAG, "Intent-resolved count: ${resolves.size}")
            for (ri in resolves) {
                val pkg = ri.activityInfo.packageName
                if (pkg == myPkg) continue
                if (seen.contains(pkg)) continue
                try {
                    val ai = pm.getApplicationInfo(pkg, 0)
                    // skip system apps
                    if ((ai.flags and ApplicationInfo.FLAG_SYSTEM) != 0) continue
                    val label = pm.getApplicationLabel(ai).toString()
                    seen.add(pkg)
                    appItems.add(Pair(label, pkg))
                    Log.d(TAG, "Intent-resolved app: $label ($pkg)")
                } catch (_: Exception) {
                }
            }
        } catch (_: Exception) {
            Log.w(TAG, "Error querying video intent activities")
        }

        // NOTE: removed fallback to include all installed non-system apps — per requirements only curated + intent-resolved video apps should appear

        // Sort by label
        appItems.sortBy { it.first.lowercase() }

        Log.d(TAG, "Final whitelist candidates count: ${appItems.size}")

        val labels = appItems.map { it.first + " (" + it.second + ")" }
        val adapter = ArrayAdapter(this, android.R.layout.simple_list_item_multiple_choice, labels)
        listView.adapter = adapter
        listView.choiceMode = ListView.CHOICE_MODE_MULTIPLE

        val whitelist = settingsManager.getWhitelistPackages()
        // Pre-check items that are in whitelist
        appItems.forEachIndexed { idx, pair ->
            if (whitelist.contains(pair.second)) listView.setItemChecked(idx, true)
        }

        btnSave.setOnClickListener {
            val selected = mutableSetOf<String>()
            for (i in 0 until appItems.size) {
                if (listView.isItemChecked(i)) selected.add(appItems[i].second)
            }
            settingsManager.setWhitelistPackages(selected)
            finish()
        }
    }
}
