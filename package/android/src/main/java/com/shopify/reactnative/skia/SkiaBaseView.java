package com.shopify.reactnative.skia;

import android.annotation.SuppressLint;
import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Matrix;
import android.graphics.Paint;
import android.graphics.PixelFormat;
import android.media.Image;
import android.media.ImageReader;
import android.os.Build;
import android.util.Log;
import android.view.Choreographer;
import android.view.MotionEvent;
import android.view.ViewGroup;
import android.hardware.HardwareBuffer;

import androidx.annotation.RequiresApi;

import com.facebook.react.views.view.ReactViewGroup;

@RequiresApi(api = Build.VERSION_CODES.Q)
public abstract class SkiaBaseView extends ReactViewGroup implements Choreographer.FrameCallback {
    private ImageReader mImageReader = null;
    private Bitmap mBitmap = null;
    private String tag = "SkiaView";
    private Choreographer choreographer;

    private Paint paint = new Paint();
    private Matrix matrix = new Matrix();

    @SuppressLint("WrongConstant")
    public SkiaBaseView(Context context) {
        super(context);
        LayoutParams params = new LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT);
        setLayoutParams(params);
        setWillNotDraw(false);
    }

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        if (mBitmap != null) {
            end = System.nanoTime();
            Log.i(tag, "render time: " + (end - start) / 1000000 + "ms");
            canvas.drawBitmap(mBitmap, matrix, paint);
        }
    }

    public void destroySurface() {
        Log.i(tag, "destroySurface");
        surfaceDestroyed();
    }

    @SuppressLint("WrongConstant")
    @Override
    protected void onLayout(boolean changed, int left, int top, int right, int bottom) {
        Log.i(tag, "onLayout " + this.getMeasuredWidth() + "/" + this.getMeasuredHeight());
        super.onLayout(changed, left, top, right, bottom);
        // TODO: fix lifecycle there
        if (mImageReader != null) {
          //  mImageReader.close();
          //  surfaceSizeChanged(getMeasuredWidth(), getMeasuredHeight());
        } else {
            long usage = HardwareBuffer.USAGE_CPU_READ_RARELY |
                    HardwareBuffer.USAGE_CPU_WRITE_RARELY |
                    HardwareBuffer.USAGE_GPU_COLOR_OUTPUT |
                    HardwareBuffer.USAGE_GPU_SAMPLED_IMAGE;
            mImageReader = ImageReader.newInstance(getMeasuredWidth(), getMeasuredHeight(), PixelFormat.RGBA_8888, 2, usage);
            surfaceAvailable(mImageReader.getSurface(), getMeasuredWidth(), getMeasuredHeight());
            choreographer = Choreographer.getInstance();
            choreographer.postFrameCallback(this);
        }
    }

    long start;
    long end;

    @Override
    public void doFrame(long frameTimeNanos) {
        choreographer.postFrameCallback(this);
        if (mImageReader.getSurface() != null) {
            // TODO: use drawFrame() instead
            surfaceSizeChanged(getMeasuredWidth(), getMeasuredHeight());
            try (Image image = mImageReader.acquireLatestImage()) {
                if (image != null) {
                    start = System.nanoTime();
                    HardwareBuffer hb = image.getHardwareBuffer();
                    mBitmap = Bitmap.wrapHardwareBuffer(hb, null);
                    hb.close();
                    invalidate();
                }
            }
        }
    }

    @Override
    public boolean onTouchEvent(MotionEvent ev) {
        // https://developer.android.com/training/gestures/multi
        int action = ev.getActionMasked();

        MotionEvent.PointerCoords r = new MotionEvent.PointerCoords();

        double[] points;

        // If this is a pointer_up/down event we need to handle it a bit specialized
        switch (action) {
            case MotionEvent.ACTION_POINTER_DOWN:
            case MotionEvent.ACTION_POINTER_UP: {
                points = new double[5];
                int pointerIndex = ev.getActionIndex();
                ev.getPointerCoords(pointerIndex, r);
                points[0] = r.x;
                points[1] = r.y;
                points[2] = ev.getPressure(pointerIndex);
                points[3] = motionActionToType(action);
                points[4] = ev.getPointerId(pointerIndex);

                updateTouchPoints(points);

                break;
            }
            default: {
                // For the rest we can just handle it like expected
                int count = ev.getPointerCount();
                int pointerIndex = 0;
                points = new double[5 * count];
                for (int i = 0; i < count; i++) {
                    ev.getPointerCoords(i, r);
                    points[pointerIndex++] = r.x;
                    points[pointerIndex++] = r.y;
                    points[pointerIndex++] = ev.getPressure(i);
                    points[pointerIndex++] = motionActionToType(action);
                    points[pointerIndex++] = ev.getPointerId(i);
                }

                updateTouchPoints(points);

                break;
            }
        }

        return true;
    }

    private static int motionActionToType(int action) {
        int actionType = 3;
        switch (action) {
            case MotionEvent.ACTION_DOWN:
            case MotionEvent.ACTION_POINTER_DOWN:
                actionType = 0;
                break;
            case MotionEvent.ACTION_MOVE:
                actionType = 1;
                break;
            case MotionEvent.ACTION_UP:
            case MotionEvent.ACTION_POINTER_UP:
                actionType = 2;
                break;
            case MotionEvent.ACTION_CANCEL:
                actionType = 3;
                break;
        }
        return actionType;
    }

    protected abstract void surfaceAvailable(Object surface, int width, int height);

    protected abstract void surfaceSizeChanged(int width, int height);

    protected abstract void surfaceDestroyed();

    protected abstract void setMode(String mode);

    protected abstract void setDebugMode(boolean show);

    protected abstract void updateTouchPoints(double[] points);

    protected abstract void registerView(int nativeId);

    protected abstract void unregisterView();
}