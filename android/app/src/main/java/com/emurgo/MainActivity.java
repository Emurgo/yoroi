package com.emurgo;

import android.os.Bundle;
import android.view.WindowManager;

import com.facebook.react.ReactActivity;
import com.zoontek.rnbootsplash.RNBootSplash;

public class MainActivity extends ReactActivity {

    /**
     * Returns the name of the main component registered from JavaScript. This is
     * used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "emurgo";
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        RNBootSplash.init(R.drawable.bootsplash, MainActivity.this);
        super.onCreate(savedInstanceState);
        if (BuildConfig.FLAVOR.equals("mainnet")) {
            getWindow().setFlags(WindowManager.LayoutParams.FLAG_SECURE, WindowManager.LayoutParams.FLAG_SECURE);
        }
    }
}
