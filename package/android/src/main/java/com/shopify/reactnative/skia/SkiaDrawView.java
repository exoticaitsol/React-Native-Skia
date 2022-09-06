package com.shopify.reactnative.skia;

import android.content.Context;

import com.facebook.jni.HybridData;
import com.facebook.react.bridge.ReactContext;

public class SkiaDrawView extends SkiaBaseView {
    public SkiaDrawView(Context context) {
        super(context);
        RNSkiaModule skiaModule = ((ReactContext)context).getNativeModule(RNSkiaModule.class);
        mHybridData = initHybrid(skiaModule.getSkiaManager());
    }

    protected native HybridData initHybrid(SkiaManager skiaManager);
}
