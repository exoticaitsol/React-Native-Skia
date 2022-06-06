import CanvasKitInit from "canvaskit-wasm";
import type { CanvasKit as CanvasKitType } from "canvaskit-wasm";

declare global {
  var CanvasKit: CanvasKitType;
}

export const LoadSkia = async () => {
  const CanvasKit = await CanvasKitInit();
  // The CanvasKit API is stored on the global object and used
  // to create the JsiSKApi in the Skia.web.ts file.
  global.CanvasKit = CanvasKit;
};
