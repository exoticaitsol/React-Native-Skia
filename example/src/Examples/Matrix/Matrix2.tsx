import React from "react";
import type { SkCanvas, SkFont } from "@shopify/react-native-skia";
import {
  Canvas,
  useFont,
  Image,
  vec,
  Skia,
  interpolateColors,
  ImageShader,
  Circle,
  Group,
  Fill,
} from "@shopify/react-native-skia";
import { Dimensions } from "react-native";

import { useCanvasAsTexture } from "./Helper";

export const COLS = 15;
export const ROWS = 30;

const cols = new Array(COLS).fill(0).map((_, i) => i);
const rows = new Array(ROWS).fill(0).map((_, i) => i);
const pos = vec(0, 0);
const size = Dimensions.get("window");
const symbol = { width: size.width / COLS, height: size.height / ROWS };

const randomArray = (from: number, to: number, blank?: boolean) => {
  const s = Math.round(from + Math.random() * (to - from));
  const a = new Array(s).fill(0).map((_, i) => (blank ? 0 : i / s));
  return a.reverse();
};

const streams = cols.map(() =>
  new Array(3)
    .fill(0)
    .map(() => [
      ...randomArray(1, 4, true),
      ...randomArray(4, 16),
      ...randomArray(2, 8, true),
    ])
    .flat()
);

const paint = Skia.Paint();
paint.setColor(Skia.Color("green"));

interface State {
  stream: number[];
  offset: number;
  range: number;
}

const state: Record<string, State> = {};
cols.forEach((_i, i) =>
  rows.forEach((_j, j) => {
    state[`${i}-${j}`] = {
      stream: streams[i],
      offset: Math.round(Math.random() * (26 - 1)),
      range: 100 + Math.random() * 900,
    };
  })
);

const drawTexture = (font: SkFont, canvas: SkCanvas, timestamp: number) => {
  "worklet";
  const symbols = font.getGlyphIDs("abcdefghijklmnopqrstuvwxyz");
  canvas.clear(Skia.Color("transparent"));
  cols.forEach((_i, i) =>
    rows.forEach((_j, j) => {
      const { stream, offset, range } = state[`${i}-${j}`];
      const x = i * symbol.width;
      const y = j * symbol.height;

      const glyphs = (() => {
        const idx = offset + Math.floor(timestamp / range);
        return [symbols[idx % symbols.length]];
      })();

      const opacity = (() => {
        const idx = Math.round(timestamp / 100);
        return stream[(stream.length - j + idx) % stream.length];
      })();

      const color = (() =>
        interpolateColors(
          opacity,
          [0.8, 1],
          ["rgb(0, 255, 70)", "rgb(140, 255, 170)"]
        ))();
      paint.setColor(Float32Array.of(...color));
      paint.setAlphaf(opacity);
      canvas.drawGlyphs(
        glyphs,
        [pos],
        x + symbol.width / 4,
        y + symbol.height,
        font,
        paint
      );
    })
  );
};

interface SceneProps {
  font: SkFont;
}

const Scene = ({ font }: SceneProps) => {
  const texture = useCanvasAsTexture((canvas, timestamp) => {
    "worklet";
    drawTexture(font, canvas, timestamp);
  }, size);
  return (
    <Group>
      <Fill color="black" />
      <Circle cx={200} cy={200} r={300}>
        <ImageShader
          image={texture}
          x={0}
          y={0}
          width={size.width}
          height={size.height}
        />
      </Circle>
    </Group>
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
