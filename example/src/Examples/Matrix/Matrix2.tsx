import React, { useEffect } from "react";
import type {
  DataModule,
  SkFont,
  SkImage,
  SkSurface,
} from "@shopify/react-native-skia";
import {
  Canvas,
  useFont,
  Image,
  Glyphs,
  vec,
  Group,
  Fill,
  drawAsImage,
  Skia,
} from "@shopify/react-native-skia";
import { Image as RNImage, Dimensions } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import { runOnUI, useSharedValue } from "react-native-reanimated";

export const COLS = 15;
export const ROWS = 30;

const cols = new Array(COLS).fill(0).map((_, i) => i);
const rows = new Array(ROWS).fill(0).map((_, i) => i);
const pos = vec(0, 0);
const size = Dimensions.get("window");
const symbol = { width: size.width / COLS, height: size.height / ROWS };
const paint = Skia.Paint();
paint.setColor(Skia.Color("green"));

const drawTexture = (
  surface: SharedValue<SkSurface | null>,
  texture: SharedValue<SkImage | null>,
  font: SkFont
) => {
  "worklet";
  const symbols = font.getGlyphIDs("abcdefghijklmnopqrstuvwxyz");
  if (surface.value === null) {
    surface.value = Skia.Surface.MakeOffscreen(size.width, size.height)!;
  }
  const canvas = surface.value.getCanvas();
  canvas.clear(Skia.Color("black"));
  cols.forEach((_i, i) =>
    rows.forEach((_j, j) => {
      const x = i * symbol.width;
      const y = j * symbol.height;
      canvas.drawGlyphs(
        [symbols[(i + j) % symbols.length]],
        [pos],
        x + symbol.width / 4,
        y + symbol.height,
        font,
        paint
      );
    })
  );
  surface.value.flush();
  texture.value = surface.value.makeImageSnapshot();
};

interface SceneProps {
  font: SkFont;
}

const Scene = ({ font }: SceneProps) => {
  const surface = useSharedValue<SkSurface | null>(null);
  const texture = useSharedValue<SkImage | null>(null);
  useEffect(() => {
    runOnUI(drawTexture)(surface, texture, font);
  }, [font, surface, texture]);
  return (
    <Image
      image={texture}
      x={0}
      y={0}
      width={size.width}
      height={size.height}
    />
  );
};

export const Matrix = () => {
  const font = useFont(require("./matrix-code-nfi.otf"), symbol.height);
  if (font === null) {
    return null;
  }
  return (
    <Canvas style={size}>
      <Scene font={font} />
    </Canvas>
  );
};
