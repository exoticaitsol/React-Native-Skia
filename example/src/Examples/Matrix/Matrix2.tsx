import React from "react";
import type { SkFont, SkSize } from "@shopify/react-native-skia";
import {
  Canvas,
  useFont,
  useTexture,
  Image,
  Glyphs,
  vec,
  Group,
  Fill,
} from "@shopify/react-native-skia";
import { useWindowDimensions } from "react-native";

export const COLS = 15;
export const ROWS = 30;

const cols = new Array(COLS).fill(0).map((_, i) => i);
const rows = new Array(ROWS).fill(0).map((_, i) => i);
const pos = vec(0, 0);

interface SceneProps {
  font: SkFont;
  symbols: number[];
  size: SkSize;
}

const Scene = ({ font, symbols, size }: SceneProps) => {
  //const symbol = { width: size.width / COLS, height: size.height / ROWS };
  const texture = useTexture(
    <Group>
      <Fill color="cyan" />
      {/* {cols.map((_i, i) =>
          rows.map((_j, j) => {
            const x = i * symbol.width;
            const y = j * symbol.height;
            return (
              <Glyphs
                key={`${i}-${j}`}
                x={x + symbol.width / 4}
                y={y + symbol.height}
                font={font}
                glyphs={[{ id: symbols[(i + j) % symbols.length], pos }]}
                color="green"
              />
            );
          })
        )} */}
    </Group>,
    size
  );
  console.log("render");
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
  const { width, height } = useWindowDimensions();

  const symbol = { width: width / COLS, height: height / ROWS };
  const font = useFont(require("./matrix-code-nfi.otf"), symbol.height);
  if (font === null) {
    return null;
  }
  const symbols = font.getGlyphIDs("abcdefghijklmnopqrstuvwxyz");
  return (
    <Canvas style={{ width, height }}>
      <Scene font={font} symbols={symbols} size={{ width, height }} />
    </Canvas>
  );
};
