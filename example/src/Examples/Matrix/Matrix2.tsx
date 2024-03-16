import React, { useEffect, useState } from "react";
import type {
  DataModule,
  SkFont,
  SkImage,
  SkSize,
} from "@shopify/react-native-skia";
import {
  Canvas,
  useFont,
  useTexture,
  Image,
  Glyphs,
  vec,
  Group,
  Fill,
  drawAsImage,
  Skia,
} from "@shopify/react-native-skia";
import { useWindowDimensions, Image as RNImage } from "react-native";

export const COLS = 15;
export const ROWS = 30;

const cols = new Array(COLS).fill(0).map((_, i) => i);
const rows = new Array(ROWS).fill(0).map((_, i) => i);
const pos = vec(0, 0);

const resolveAsset = async (source: DataModule, fontSize: number) => {
  const uri =
    typeof source === "number"
      ? RNImage.resolveAssetSource(source).uri
      : source.default;
  const data = await Skia.Data.fromURI(uri);
  const typeface = Skia.Typeface.MakeFreeTypeFaceFromData(data)!;
  return Skia.Font(typeface, fontSize);
};

const drawTexture = async (size: SkSize) => {
  const symbol = { width: size.width / COLS, height: size.height / ROWS };
  const font = await resolveAsset(
    require("./matrix-code-nfi.otf"),
    symbol.height
  );
  const symbols = font.getGlyphIDs("abcdefghijklmnopqrstuvwxyz");
  return drawAsImage(
    <Group>
      {cols.map((_i, i) =>
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
      )}
    </Group>,
    size
  );
};

interface SceneProps {
  size: SkSize;
}

const Scene = ({ size }: SceneProps) => {
  const [texture, setTexture] = useState<null | SkImage>(null);
  useEffect(() => {
    (async () => {
      const tex = await drawTexture(size);
      setTexture(tex);
    })();
  });
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
  return (
    <Canvas style={{ width, height }}>
      <Scene size={{ width, height }} />
    </Canvas>
  );
};
