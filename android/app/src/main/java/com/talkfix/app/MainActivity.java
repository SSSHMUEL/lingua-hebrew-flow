package com.talkfix.app;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Bundle;
import android.provider.Settings;
import android.content.ComponentName;
import android.widget.Toast;
import android.util.Log;
import android.app.AlertDialog;
import android.view.View;
import android.widget.ImageButton;
import com.getcapacitor.BridgeActivity;
import android.widget.FrameLayout;
import android.view.Gravity;
import android.graphics.drawable.GradientDrawable;
import android.content.res.ColorStateList;
import android.graphics.Color;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "MainActivity";
    private static final String SETTINGS_BTN_TAG = "tlk_settings_btn";
    // Onboarding prefs keys (shared with SettingsManager)
    private static final String PREFS_NAME = "tlkfix_prefs";
    private static final String KEY_ONBOARD_SHOWN = "onboard_shown";
    private static final String KEY_ONBOARD_WAITING = "onboard_waiting_permissions";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Register the native plugin implementation so Capacitor can call it from JS
        registerPlugin(TlkFixWordsPlugin.class);
        Log.d(TAG, "onCreate: registered TlkFixWordsPlugin (before super)");

        super.onCreate(savedInstanceState);

        // Run first-run onboarding to offer enabling captions (user must consent)
        runOnUiThread(this::runOnboardingIfNeeded);

        // Check if overlay permission prompt is needed (set by the service)
        checkOverlayPermissionPrompt();

        Log.d(TAG, "onCreate finished");
    }

    @Override
    public void onResume() {
        super.onResume();
        // Ensure settings button is present (do this in onResume so Capacitor/BridgeActivity has inflated content)
        ensureSettingsButton();
        // Re-check when the activity returns to foreground (user may have granted permission)
        checkOverlayPermissionPrompt();
        // If onboarding was waiting for permissions, re-check and enable overlay if now granted
        recheckOnboardingPermissions();
    }

    // Add or find the settings button and attach it to the root content view if needed
    private void ensureSettingsButton() {
        try {
            FrameLayout root = findViewById(android.R.id.content);
            if (root == null) {
                Log.w(TAG, "ensureSettingsButton: root content view is null");
                return;
            }

            // If already added, skip
            View existing = root.findViewWithTag(SETTINGS_BTN_TAG);
            if (existing != null) {
                Log.d(TAG, "ensureSettingsButton: settings button already present, skipping");
                return;
            }

            Log.d(TAG, "ensureSettingsButton: adding settings button");

            ImageButton btn = new ImageButton(this);
            btn.setImageResource(android.R.drawable.ic_menu_manage);
            btn.setTag(SETTINGS_BTN_TAG);

            // High-contrast circular background to ensure visibility over WebView content
            GradientDrawable bg = new GradientDrawable();
            bg.setShape(GradientDrawable.OVAL);
            bg.setColor(0xCC000000); // semi-transparent black
            final int padding = (int) (getResources().getDisplayMetrics().density * 8);
            btn.setPadding(padding, padding, padding, padding);
            btn.setBackground(bg);

            // White tint for the icon
            btn.setImageTintList(ColorStateList.valueOf(Color.WHITE));

            final int size = (int) (getResources().getDisplayMetrics().density * 48);
            FrameLayout.LayoutParams lp = new FrameLayout.LayoutParams(size, size);
            lp.gravity = Gravity.BOTTOM | Gravity.END;
            final int margin = (int) (getResources().getDisplayMetrics().density * 16);
            lp.setMargins(margin, margin, margin, margin);
            btn.setLayoutParams(lp);
            btn.setContentDescription(getString(R.string.settings_button_desc));
            btn.setScaleType(ImageButton.ScaleType.CENTER_INSIDE);
            btn.setElevation(8 * getResources().getDisplayMetrics().density);
            btn.setTranslationZ(200f);

            btn.setOnClickListener(v -> {
                try {
                    Intent i = new Intent(MainActivity.this, SettingsActivity.class);
                    i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    startActivity(i);
                } catch (Exception e) {
                    Log.e(TAG, "Failed to open SettingsActivity", e);
                }
            });

            root.post(() -> {
                try {
                    if (btn.getParent() == null) root.addView(btn);
                    // Ensure it's on top
                    btn.bringToFront();
                    root.invalidate();
                    Log.d(TAG, "ensureSettingsButton: settings button added to root and brought to front");
                } catch (Exception e) {
                    Log.e(TAG, "ensureSettingsButton: failed to add button to root", e);
                }
            });
        } catch (Exception e) {
            Log.w(TAG, "Failed to add settings button programmatically", e);
        }
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
                        .setTitle(getString(R.string.permission_dialog_title))
                        .setMessage(getString(R.string.permission_dialog_message))
                        .setPositiveButton(getString(R.string.permission_button_settings), (dialog, which) -> {
                            Intent i = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:" + getPackageName()));
                            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            startActivity(i);
                        })
                        .setNegativeButton(getString(R.string.permission_button_close), (dialog, which) -> dialog.dismiss())
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

    // Show onboarding dialog on first run; enable overlay only after consent and permissions
    private void runOnboardingIfNeeded() {
        try {
            SharedPreferences prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            boolean shown = prefs.getBoolean(KEY_ONBOARD_SHOWN, false);
            if (shown) return;
            prefs.edit().putBoolean(KEY_ONBOARD_SHOWN, true).apply();

            new AlertDialog.Builder(MainActivity.this)
                .setTitle(getString(R.string.onboarding_title))
                .setMessage(getString(R.string.onboarding_message))
                .setPositiveButton(getString(R.string.enable_now), (dialog, which) -> {
                    // Attempt to enable now if permissions already present
                    try {
                        SettingsManager sm = new SettingsManager(MainActivity.this);
                        boolean overlayOk = Settings.canDrawOverlays(MainActivity.this);
                        ComponentName comp = new ComponentName(MainActivity.this, com.talkfix.app.TlkFixAccessibilityService.class);
                        String enabled = Settings.Secure.getString(getContentResolver(), Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES);
                        boolean accessibleOk = enabled != null && enabled.contains(comp.flattenToString());

                        if (overlayOk && accessibleOk) {
                            sm.setOverlayEnabled(true);
                            sm.setReplaceWordsEnabled(true);
                            Toast.makeText(MainActivity.this, getString(R.string.enabled), Toast.LENGTH_SHORT).show();
                        } else {
                            // Mark that onboarding is waiting for permissions and guide user to settings
                            prefs.edit().putBoolean(KEY_ONBOARD_WAITING, true).apply();
                            new AlertDialog.Builder(MainActivity.this)
                                .setTitle(getString(R.string.permission_dialog_title))
                                .setMessage(getString(R.string.permission_dialog_message))
                                .setPositiveButton(getString(R.string.open_accessibility), (d, w) -> {
                                    startActivity(new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS));
                                })
                                .setNeutralButton(getString(R.string.permission_button_settings), (d, w) -> {
                                    startActivity(new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:" + getPackageName())));
                                })
                                .setNegativeButton(getString(R.string.permission_button_close), null)
                                .show();
                        }
                    } catch (Exception e) {
                        Log.e(TAG, "Onboarding enable failed", e);
                    }
                })
                .setNegativeButton(getString(R.string.not_now), null)
                .setCancelable(false)
                .show();

        } catch (Exception e) {
            Log.e(TAG, "runOnboardingIfNeeded error", e);
        }
    }

    private void recheckOnboardingPermissions() {
        try {
            SharedPreferences prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            boolean waiting = prefs.getBoolean(KEY_ONBOARD_WAITING, false);
            if (!waiting) return;

            SettingsManager sm = new SettingsManager(this);
            boolean overlayOk = Settings.canDrawOverlays(this);
            ComponentName comp = new ComponentName(this, com.talkfix.app.TlkFixAccessibilityService.class);
            String enabled = Settings.Secure.getString(getContentResolver(), Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES);
            boolean accessibleOk = enabled != null && enabled.contains(comp.flattenToString());

            if (overlayOk && accessibleOk) {
                sm.setOverlayEnabled(true);
                sm.setReplaceWordsEnabled(true);
                prefs.edit().putBoolean(KEY_ONBOARD_WAITING, false).apply();
                Toast.makeText(this, getString(R.string.enabled), Toast.LENGTH_SHORT).show();
            }
        } catch (Exception e) {
            Log.e(TAG, "recheckOnboardingPermissions error", e);
        }
    }
}
