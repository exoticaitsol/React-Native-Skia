import type { GroupProps, SkCanvas, SkPaint } from "@shopify/react-native-skia";
import { NodeType, PaintStyle, Skia } from "@shopify/react-native-skia";

interface Node<P> {
  type: NodeType;
  props: P;
  children?: Node<unknown>[];
}

interface DrawingContext {
  canvas: SkCanvas;
  paint: SkPaint;
}

function drawGroup(ctx: DrawingContext, node: Node<any>) {
  "worklet";
  const { canvas } = ctx;
  const { matrix } = node.props;
  if (matrix) {
    canvas.concat(matrix);
  }
}

function drawRect(ctx: DrawingContext, node: Node<any>) {
  "worklet";
  const { canvas, paint } = ctx;
  const { rect, color, style, strokeWidth } = node.props;
  if (color !== undefined) {
    paint.setColor(new Float32Array(color));
  }
  if (style !== undefined) {
    paint.setStyle(style);
  } else {
    // TODO: remove this
    paint.setStyle(PaintStyle.Fill);
  }
  if (strokeWidth !== undefined) {
    paint.setStrokeWidth(strokeWidth);
  }
  canvas.drawRect(rect, paint);
}

function draw(ctx: DrawingContext, node: Node<unknown>) {
  "worklet";
  ctx.canvas.save();
  switch (node.type) {
    case NodeType.Group:
      drawGroup(ctx, node);
      break;
    case NodeType.Rect:
      drawRect(ctx, node);
      break;
    default:
      throw new Error("Unknown node type");
  }
  node.children?.forEach((child) => draw(ctx, child));
  ctx.canvas.restore();
}

export const render = (node: Node<unknown>) => {
  "worklet";
  const rec = Skia.PictureRecorder();
  const canvas = rec.beginRecording();
  const paint = Skia.Paint();
  draw({ canvas, paint }, node);
  return rec.finishRecordingAsPicture();
};

// TODO: test with a host object
// TODO: add example with object declaration
export const example1: Node<GroupProps> = {
  type: NodeType.Group,
  props: {},
  children: new Array(450).fill(0).map(() => {
    return {
      type: NodeType.Group,
      props: {
        matrix: [1, 0, 0, 0, 1, 0, 0, 0, 1],
      },
      children: [
        {
          type: NodeType.Rect,
          props: {
            rect: {
              x: 0,
              y: 0,
              width: 100,
              height: 100,
            },
            color: [0, 1, 1, 1],
          },
        },
        {
          type: NodeType.Rect,
          props: {
            rect: {
              x: 0,
              y: 0,
              width: 100,
              height: 100,
            },
            style: PaintStyle.Stroke,
            strokeWidth: 2,
            color: [0, 0, 1, 1],
          },
        },
      ],
    };
  }),
};
