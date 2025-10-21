package com.talkfix.app;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Bundle;
import android.provider.Settings;
import android.util.Log;
import android.app.AlertDialog;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "MainActivity";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Register the native plugin implementation so Capacitor can call it from JS
        registerPlugin(TlkFixWordsPlugin.class);
        Log.d(TAG, "onCreate: registered TlkFixWordsPlugin (before super)");

        super.onCreate(savedInstanceState);

        // Check if overlay permission prompt is needed (set by the service)
        checkOverlayPermissionPrompt();
    }

    @Override
    public void onResume() {
        super.onResume();
        // Re-check when the activity returns to foreground (user may have granted permission)
        checkOverlayPermissionPrompt();
    }

    private void checkOverlayPermissionPrompt() {
        try {
            SharedPreferences prefs = getSharedPreferences("TlkFixPrefs", Context.MODE_PRIVATE);
            boolean needed = prefs.getBoolean("overlay_permission_needed", false);
            if (!needed) return;

            // Clear the flag so we don't spam
            prefs.edit().putBoolean("overlay_permission_needed", false).apply();

            // If permission already granted, nothing to do
            if (Settings.canDrawOverlays(this)) return;

            // Show a simple in-app dialog (no vibration) directing user to overlay settings
            runOnUiThread(() -> {
                try {
                    new AlertDialog.Builder(MainActivity.this)
                        .setTitle("פעולת הרשאה נדרשת")
                        .setMessage("על מנת להציג כתוביות מתוקנות בתוך אפליקציות חיצוניות, אנא אפשר את ההרשאה 'הצג על גבי אפליקציות אחרות' במסך ההגדרות.")
                        .setPositiveButton("הגדרות", (dialog, which) -> {
                            Intent i = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:" + getPackageName()));
                            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            startActivity(i);
                        })
                        .setNegativeButton("סגור", (dialog, which) -> dialog.dismiss())
                        .setCancelable(true)
                        .show();
                } catch (Exception e) {
                    Log.e(TAG, "Failed to show overlay permission dialog", e);
                }
            });

        } catch (Exception e) {
            Log.e(TAG, "Error checking overlay permission prompt", e);
        }
    }
}
