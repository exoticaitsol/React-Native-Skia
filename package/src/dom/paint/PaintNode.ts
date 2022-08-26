import { processColor } from "../../renderer/processors/Color";
import type {
  PaintStyle,
  StrokeCap,
  StrokeJoin,
  BlendMode,
  SkColor,
  SkPaint,
  Skia,
} from "../../skia/types";
import { NodeType, Node } from "../Node";

export interface PaintNodeProps {
  color?: SkColor;
  strokeWidth?: number;
  blendMode?: BlendMode;
  style?: PaintStyle;
  strokeJoin?: StrokeJoin;
  strokeCap?: StrokeCap;
  strokeMiter?: number;
  opacity?: number;
  antiAlias?: boolean;
}

export class PaintNode extends Node<PaintNodeProps> {
  constructor(props: PaintNodeProps) {
    super(NodeType.Paint, props);
  }

  concat(Skia: Skia, parentPaint: SkPaint, currentOpacity: number) {
    const {
      color,
      blendMode,
      style,
      strokeJoin,
      strokeMiter,
      strokeCap,
      strokeWidth,
      opacity,
      antiAlias,
    } = this.props;
    // TODO: this should/could be cached
    const paint = parentPaint.copy();
    if (color !== undefined) {
      const c = processColor(Skia, color, currentOpacity);
      paint.setShader(null);
      paint.setColor(c);
    } else {
      const c = processColor(Skia, paint.getColor(), currentOpacity);
      paint.setColor(c);
    }
    if (blendMode !== undefined) {
      paint.setBlendMode(blendMode);
    }
    if (style !== undefined) {
      paint.setStyle(style);
    }
    if (strokeJoin !== undefined) {
      paint.setStrokeJoin(strokeJoin);
    }
    if (strokeCap !== undefined) {
      paint.setStrokeCap(strokeCap);
    }
    if (strokeMiter !== undefined) {
      paint.setStrokeMiter(strokeMiter);
    }
    if (strokeWidth !== undefined) {
      paint.setStrokeWidth(strokeWidth);
    }
    if (opacity !== undefined) {
      paint.setAlphaf(opacity);
    }
    if (antiAlias !== undefined) {
      paint.setAntiAlias(antiAlias);
    }
    return paint;
  }
}
