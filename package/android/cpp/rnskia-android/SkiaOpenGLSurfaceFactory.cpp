#include "SkiaOpenGLHelper.h"
#include <SkiaOpenGLSurfaceFactory.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/gpu/ganesh/gl/GrGLBackendSurface.h"

#pragma clang diagnostic pop

namespace RNSkia {

typedef EGLClientBuffer (*EGLGetNativeClientBufferANDROIDProc)(
      const struct AHardwareBuffer *);
typedef EGLImageKHR (*EGLCreateImageKHRProc)(EGLDisplay, EGLContext, EGLenum,
                                               EGLClientBuffer, const EGLint *);
typedef void (*EGLImageTargetTexture2DOESProc)(EGLenum, void *);

thread_local SkiaOpenGLContext ThreadContextHolder::ThreadSkiaOpenGLContext;

sk_sp<SkImage>
SkiaOpenGLSurfaceFactory::makeImageFromTexture(const SkImageInfo &info,
                                               const void *buffer) {
  // Setup OpenGL and Skia:
  auto ctx = ThreadContextHolder::ThreadSkiaOpenGLContext;
  if (!SkiaOpenGLHelper::createSkiaDirectContextIfNecessary(&ctx)) {

    RNSkLogger::logToConsole(
        "Could not create Skia Surface from native window / surface. "
        "Failed creating Skia Direct Context");
    return nullptr;
  }

  // TODO: do this only once:
  if (!ctx.interface->hasExtension("EGL_KHR_image") ||
      !ctx.interface->hasExtension("EGL_ANDROID_get_native_client_buffer") ||
      !ctx.interface->hasExtension("GL_OES_EGL_image_external") ||
      !ctx.interface->hasExtension("GL_OES_EGL_image") ||
      !ctx.interface->hasExtension("EGL_KHR_fence_sync") ||
      !ctx.interface->hasExtension("EGL_ANDROID_native_fence_sync")) {
    RNSkLogger::logToConsole(
        "Didn't find the right extensions to make a texture from a buffer");
    return nullptr;
  }



  EGLGetNativeClientBufferANDROIDProc fEGLGetNativeClientBufferANDROID =
      (EGLGetNativeClientBufferANDROIDProc)eglGetProcAddress(
          "eglGetNativeClientBufferANDROID");
  if (!fEGLGetNativeClientBufferANDROID) {
    RNSkLogger::logToConsole(
        "Failed to get the eglGetNativeClientBufferAndroid proc");
    return nullptr;
  }

  EGLCreateImageKHRProc fEGLCreateImageKHR =
      (EGLCreateImageKHRProc)eglGetProcAddress("eglCreateImageKHR");
  if (!fEGLCreateImageKHR) {
    RNSkLogger::logToConsole("Failed to get the proc eglCreateImageKHR");
    return nullptr;
  }

  EGLImageTargetTexture2DOESProc fEGLImageTargetTexture2DOES =
      (EGLImageTargetTexture2DOESProc)eglGetProcAddress(
          "glEGLImageTargetTexture2DOES");
  if (!fEGLImageTargetTexture2DOES) {
    RNSkLogger::logToConsole(
        "Failed to get the proc EGLImageTargetTexture2DOES");
    return nullptr;
  }

  PFNEGLCREATESYNCKHRPROC fEGLCreateSyncKHR =
      (PFNEGLCREATESYNCKHRPROC)eglGetProcAddress("eglCreateSyncKHR");
  if (!fEGLCreateSyncKHR) {
    RNSkLogger::logToConsole("Failed to get the proc eglCreateSyncKHR");
    return nullptr;
  }

  PFNEGLWAITSYNCKHRPROC fEGLWaitSyncKHR = (PFNEGLWAITSYNCKHRPROC)eglGetProcAddress("eglWaitSyncKHR");
  if (!fEGLWaitSyncKHR) {
    RNSkLogger::logToConsole("Failed to get the proc eglWaitSyncKHR");
    return nullptr;
  }
  PFNEGLGETSYNCATTRIBKHRPROC fEGLGetSyncAttribKHR =
      (PFNEGLGETSYNCATTRIBKHRPROC)eglGetProcAddress("eglGetSyncAttribKHR");
  if (!fEGLGetSyncAttribKHR) {
    RNSkLogger::logToConsole("Failed to get the proc eglGetSyncAttribKHR");
    return nullptr;
  }
  PFNEGLDUPNATIVEFENCEFDANDROIDPROC fEGLDupNativeFenceFDANDROID =
      (PFNEGLDUPNATIVEFENCEFDANDROIDPROC)eglGetProcAddress(
          "eglDupNativeFenceFDANDROID");
  if (!fEGLDupNativeFenceFDANDROID) {
    RNSkLogger::logToConsole(
        "Failed to get the proc eglDupNativeFenceFDANDROID");
    return nullptr;
  }
  PFNEGLDESTROYSYNCKHRPROC fEGLDestroySyncKHR =
      (PFNEGLDESTROYSYNCKHRPROC)eglGetProcAddress("eglDestroySyncKHR");
  if (!fEGLDestroySyncKHR) {
    RNSkLogger::logToConsole("Failed to get the proc eglDestroySyncKHR");
    return nullptr;
  }

  // Import buffer
    //   EGLClientBuffer eglClientBuffer = fEGLGetNativeClientBufferANDROID(buffer);
    // EGLint eglAttribs[] = { EGL_IMAGE_PRESERVED_KHR, EGL_TRUE,
    //                         EGL_NONE };
    // EGLDisplay eglDisplay = eglGetCurrentDisplay();
    // fImage = fEGLCreateImageKHR(eglDisplay, EGL_NO_CONTEXT,
    //                             EGL_NATIVE_BUFFER_ANDROID,
    //                             eglClientBuffer, eglAttribs);

    // if (EGL_NO_IMAGE_KHR == fImage) {
    //    // SkDebugf("Could not create EGL image, err = (%#x)\n", (int) eglGetError() );
    //     return nullptr;
    // }
    // GR_GL_CALL(fGLCtx->gl(), GenTextures(1, &fTexID));
    // if (!fTexID) {
    //     ERRORF(reporter, "Failed to create GL Texture");
    //     return false;
    // }
    // GR_GL_CALL_NOERRCHECK(fGLCtx->gl(), BindTexture(GR_GL_TEXTURE_2D, fTexID));
    // if (fGLCtx->gl()->fFunctions.fGetError() != GR_GL_NO_ERROR) {
    //     ERRORF(reporter, "Failed to bind GL Texture");
    //     return false;
    // }

    // fEGLImageTargetTexture2DOES(GL_TEXTURE_2D, fImage);
    // if (GrGLenum error = fGLCtx->gl()->fFunctions.fGetError(); error != GR_GL_NO_ERROR) {
    //     ERRORF(reporter, "EGLImageTargetTexture2DOES failed (%#x)", (int) error);
    //     return false;
    // }

    // fDirectContext->resetContext(kTextureBinding_GrGLBackendState);
    //     GrGLTextureInfo textureInfo;
    // textureInfo.fTarget = GR_GL_TEXTURE_2D;
    // textureInfo.fID = fTexID;
    // textureInfo.fFormat = GR_GL_RGBA8;

    // auto backendTex = GrBackendTextures::MakeGL(DEV_W, DEV_H, skgpu::Mipmapped::kNo, textureInfo);
    // REPORTER_ASSERT(reporter, backendTex.isValid());

    // sk_sp<SkImage> image = SkImages::BorrowTextureFrom(fDirectContext,
    //                                                    backendTex,
    //                                                    kTopLeft_GrSurfaceOrigin,
    //                                                    kRGBA_8888_SkColorType,
    //                                                    kPremul_SkAlphaType,
    //                                                    nullptr);

    // if (!image) {
    //     ERRORF(reporter, "Failed to make wrapped GL SkImage");
    //     return nullptr;
    // }

    // return image;
    return nullptr;
    
}

sk_sp<SkSurface> SkiaOpenGLSurfaceFactory::makeOffscreenSurface(int width,
                                                                int height) {
  // Setup OpenGL and Skia:
  if (!SkiaOpenGLHelper::createSkiaDirectContextIfNecessary(
          &ThreadContextHolder::ThreadSkiaOpenGLContext)) {

    RNSkLogger::logToConsole(
        "Could not create Skia Surface from native window / surface. "
        "Failed creating Skia Direct Context");
    return nullptr;
  }

  auto colorType = kN32_SkColorType;

  SkSurfaceProps props(0, kUnknown_SkPixelGeometry);

  if (!SkiaOpenGLHelper::makeCurrent(
          &ThreadContextHolder::ThreadSkiaOpenGLContext,
          ThreadContextHolder::ThreadSkiaOpenGLContext.gl1x1Surface)) {
    RNSkLogger::logToConsole(
        "Could not create EGL Surface from native window / surface. Could "
        "not set new surface as current surface.");
    return nullptr;
  }

  // Create texture
  auto texture =
      ThreadContextHolder::ThreadSkiaOpenGLContext.directContext
          ->createBackendTexture(width, height, colorType,
                                 skgpu::Mipmapped::kNo, GrRenderable::kYes);

  if (!texture.isValid()) {
    RNSkLogger::logToConsole("couldn't create offscreen texture %dx%d", width,
                             height);
  }

  struct ReleaseContext {
    SkiaOpenGLContext *context;
    GrBackendTexture texture;
  };

  auto releaseCtx = new ReleaseContext(
      {&ThreadContextHolder::ThreadSkiaOpenGLContext, texture});

  // Create a SkSurface from the GrBackendTexture
  return SkSurfaces::WrapBackendTexture(
      ThreadContextHolder::ThreadSkiaOpenGLContext.directContext.get(), texture,
      kTopLeft_GrSurfaceOrigin, 0, colorType, nullptr, &props,
      [](void *addr) {
        auto releaseCtx = reinterpret_cast<ReleaseContext *>(addr);

        releaseCtx->context->directContext->deleteBackendTexture(
            releaseCtx->texture);
      },
      releaseCtx);
}

sk_sp<SkSurface> WindowSurfaceHolder::getSurface() {
  if (_skSurface == nullptr) {

    // Setup OpenGL and Skia
    if (!SkiaOpenGLHelper::createSkiaDirectContextIfNecessary(
            &ThreadContextHolder::ThreadSkiaOpenGLContext)) {
      RNSkLogger::logToConsole(
          "Could not create Skia Surface from native window / surface. "
          "Failed creating Skia Direct Context");
      return nullptr;
    }

    // Now we can create a surface
    _glSurface = SkiaOpenGLHelper::createWindowedSurface(_window);
    if (_glSurface == EGL_NO_SURFACE) {
      RNSkLogger::logToConsole(
          "Could not create EGL Surface from native window / surface.");
      return nullptr;
    }

    // Now make this one current
    if (!SkiaOpenGLHelper::makeCurrent(
            &ThreadContextHolder::ThreadSkiaOpenGLContext, _glSurface)) {
      RNSkLogger::logToConsole(
          "Could not create EGL Surface from native window / surface. Could "
          "not set new surface as current surface.");
      return nullptr;
    }

    // Set up parameters for the render target so that it
    // matches the underlying OpenGL context.
    GrGLFramebufferInfo fboInfo;

    // We pass 0 as the framebuffer id, since the
    // underlying Skia GrGlGpu will read this when wrapping the context in the
    // render target and the GrGlGpu object.
    fboInfo.fFBOID = 0;
    fboInfo.fFormat = 0x8058; // GL_RGBA8

    GLint stencil;
    glGetIntegerv(GL_STENCIL_BITS, &stencil);

    GLint samples;
    glGetIntegerv(GL_SAMPLES, &samples);

    auto colorType = kN32_SkColorType;

    auto maxSamples =
        ThreadContextHolder::ThreadSkiaOpenGLContext.directContext
            ->maxSurfaceSampleCountForColorType(colorType);

    if (samples > maxSamples) {
      samples = maxSamples;
    }

    auto renderTarget = GrBackendRenderTargets::MakeGL(_width, _height, samples,
                                                       stencil, fboInfo);

    SkSurfaceProps props(0, kUnknown_SkPixelGeometry);

    struct ReleaseContext {
      EGLSurface glSurface;
    };

    auto releaseCtx = new ReleaseContext({_glSurface});

    // Create surface object
    _skSurface = SkSurfaces::WrapBackendRenderTarget(
        ThreadContextHolder::ThreadSkiaOpenGLContext.directContext.get(),
        renderTarget, kBottomLeft_GrSurfaceOrigin, colorType, nullptr, &props,
        [](void *addr) {
          auto releaseCtx = reinterpret_cast<ReleaseContext *>(addr);
          SkiaOpenGLHelper::destroySurface(releaseCtx->glSurface);
          delete releaseCtx;
        },
        reinterpret_cast<void *>(releaseCtx));
  }

  return _skSurface;
}

} // namespace RNSkia