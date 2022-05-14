import {
  Canvas,
  Fill,
  Group,
  Rect,
  useClockValue,
  useFont,
  useDerivedValue,
} from "@shopify/react-native-skia";
import React from "react";
import { Dimensions } from "react-native";

import { CRT } from "./CRT";
import { BG, FG } from "./Theme";

const { width, height } = Dimensions.get("window");
export const COLS = 5;
export const ROWS = 10;
export const SIZE = { width: width / COLS, height: height / ROWS };
const rows = new Array(Math.round(COLS)).fill(0).map((_, i) => i);
const cols = new Array(Math.round(ROWS)).fill(0).map((_, i) => i);
const F = 0.009;

export const Severance = () => {
  const clock = useClockValue();
  const font = useFont(require("./SF-Mono-Medium.otf"), 32);

  const transform = useDerivedValue(
    () => [{ translateY: clock.current / 50 }],
    [clock]
  );
  if (font === null) {
    return null;
  }
  return (
    <Canvas style={{ flex: 1 }} debug>
      <CRT>
        <Group transform={transform}>
          <Fill color={BG} />
          {rows.map((_i, i) =>
            cols.map((_j, j) => {
              const x = i * SIZE.width;
              const y = j * SIZE.height;
              return (
                <Rect
                  key={`${i}-${j}`}
                  x={x + 10}
                  y={y + 10}
                  width={SIZE.width - 20}
                  height={SIZE.height - 20}
                  color={FG}
                />
              );
            })
          )}
        </Group>
      </CRT>
    </Canvas>
  );
};
// return (
//   <Text
//     key={`${i}-${j}`}
//     text="0"
//     x={x}
//     y={y}
//     font={font}
//     color={FG}
//   />
// );
