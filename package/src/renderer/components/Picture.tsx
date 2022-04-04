import React from "react";

import type { SkPicture } from "../../skia";
import { createDrawing } from "../nodes/Drawing";

export interface PictureProps {
  picture: SkPicture | null;
}

const onDraw = createDrawing<PictureProps>((ctx, { picture }) => {
  const { canvas } = ctx;
  if (picture) {
    canvas.drawPicture(picture);
  }
});

export const Picture = (props: PictureProps) => {
  return <skDrawing onDraw={onDraw} {...props} skipProcessing />;
};
