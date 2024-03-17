import { Skia } from "@shopify/react-native-skia";
import type {
  SkCanvas,
  SkImage,
  SkSize,
  SkSurface,
} from "@shopify/react-native-skia";
import { useFrameCallback, useSharedValue } from "react-native-reanimated";

export const useCanvasAsTexture = (
  cb: (canvas: SkCanvas, timestamp: number) => void,
  size: SkSize
) => {
  const surface = useSharedValue<SkSurface | null>(null);
  const texture = useSharedValue<SkImage | null>(null);
  useFrameCallback(({ timestamp }) => {
    if (surface.value === null) {
      surface.value = Skia.Surface.MakeOffscreen(size.width, size.height);
    }
    const canvas = surface.value!.getCanvas();
    cb(canvas, timestamp);
    texture.value = surface.value!.makeImageSnapshot();
  });
  return texture;
};
