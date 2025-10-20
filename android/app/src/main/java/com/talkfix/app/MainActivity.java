package com.talkfix.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Register the native plugin implementation so Capacitor can call it from JS
        registerPlugin(TlkFixWordsPlugin.class);
    }
}
