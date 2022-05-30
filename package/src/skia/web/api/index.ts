import type { CanvasKit } from "canvaskit-wasm";

import type {
  SkColor,
  SkContourMeasureIter,
  Skia,
  SkPath,
  SkPoint,
  SkRect,
  SkRuntimeEffect,
  SkRuntimeShaderBuilder,
  SkTypeface,
  VertexMode,
} from "../../types";

import { JsiSkPoint } from "./JsiSkPoint";
import { JsiSkPaint } from "./JsiSkPaint";
import { JsiSkRect } from "./JsiSkRect";
import { Color } from "./JsiSkColor";
import { JsiSkSurfaceFactory } from "./JsiSkSurfaceFactory";
import { JsiSkRRect } from "./JsiSkRRect";
import { JsiSkRSXform } from "./JsiSkRSXform";
import { toValue, ckEnum } from "./Host";
import { JsiSkContourMeasureIter } from "./JsiSkContourMeasureIter";
import { JsiSkPictureRecorder } from "./JsiSkPictureRecorder";
import { JsiSkPictureFactory } from "./JsiSkPictureFactory";
import { JsiSkPathFactory } from "./JsiSkPathFactory";
import { JsiSkMatrix } from "./JsiSkMatrix";
import { JsiSkColorFilterFactory } from "./JsiSkColorFilterFactory";
import { JsiSkTypefaceFactory } from "./JsiSkTypefaceFactory";
import { JsiSkMaskFilterFactory } from "./JsiSkMaskFilterFactory";
import { JsiSkRuntimeEffectFactory } from "./JsiSkRuntimeEffectFactory";
import { JsiSkImageFilterFactory } from "./JsiImageFilterFactory";
import { JsiSkShaderFactory } from "./JsiSkShaderFactory";
import { JsiSkPathEffectFactory } from "./JsiSkPathEffectFactory";
import { JsiSkVertices } from "./JsiSkVertices";
import { JsiSkDataFactory } from "./JsiSkDataFactory";
import { JsiSkImageFactory } from "./JsiSkImageFactory";
import { JsiSkSVGFactory } from "./JsiSkSVGFactory";
import { JsiSkTextBlobFactory } from "./JsiSkTextBlobFactory";
import { JsiSkFontMgrFactory } from "./JsiSkFontMgrFactory";
import { JsiSkFont } from "./JsiSkFont";

export const JsiSkApi = (CanvasKit: CanvasKit): Skia => ({
  Point: (x: number, y: number) =>
    new JsiSkPoint(CanvasKit, Float32Array.of(x, y)),
  RuntimeShaderBuilder: (_: SkRuntimeEffect): SkRuntimeShaderBuilder => {
    throw new Error("Not implemented on React Native Web");
  },
  RRectXY: (rect: SkRect, rx: number, ry: number) =>
    new JsiSkRRect(CanvasKit, CanvasKit.RRectXY(toValue(rect), rx, ry)),
  RSXform: (scos: number, ssin: number, tx: number, ty: number) =>
    new JsiSkRSXform(CanvasKit, Float32Array.of(scos, ssin, tx, ty)),
  Color: Color.bind(null, CanvasKit),
  ContourMeasureIter: (
    path: SkPath,
    forceClosed: boolean,
    resScale: number
  ): SkContourMeasureIter =>
    new JsiSkContourMeasureIter(
      CanvasKit,
      new CanvasKit.ContourMeasureIter(toValue(path), forceClosed, resScale)
    ),
  Paint: () => new JsiSkPaint(CanvasKit, new CanvasKit.Paint()),
  PictureRecorder: () =>
    new JsiSkPictureRecorder(CanvasKit, new CanvasKit.PictureRecorder()),
  Picture: new JsiSkPictureFactory(CanvasKit),
  Path: new JsiSkPathFactory(CanvasKit),
  Matrix: () =>
    new JsiSkMatrix(CanvasKit, Float32Array.of(...CanvasKit.Matrix.identity())),
  ColorFilter: new JsiSkColorFilterFactory(CanvasKit),
  Font: (typeface?: SkTypeface, size?: number) =>
    new JsiSkFont(
      CanvasKit,
      new CanvasKit.Font(
        typeface === undefined ? null : toValue(typeface),
        size
      )
    ),
  Typeface: new JsiSkTypefaceFactory(CanvasKit),
  MaskFilter: new JsiSkMaskFilterFactory(CanvasKit),
  RuntimeEffect: new JsiSkRuntimeEffectFactory(CanvasKit),
  ImageFilter: new JsiSkImageFilterFactory(CanvasKit),
  Shader: new JsiSkShaderFactory(CanvasKit),
  PathEffect: new JsiSkPathEffectFactory(CanvasKit),
  MakeVertices: (
    mode: VertexMode,
    positions: SkPoint[],
    textureCoordinates?: SkPoint[] | null,
    colors?: SkColor[],
    indices?: number[] | null,
    isVolatile?: boolean
  ) =>
    new JsiSkVertices(
      CanvasKit,
      CanvasKit.MakeVertices(
        ckEnum(mode),
        positions.map((pos) => toValue(pos)),
        (textureCoordinates ?? []).map((t) => toValue(t)),
        (colors ?? []).map((pos) => toValue(pos)),
        indices,
        isVolatile
      )
    ),
  Data: new JsiSkDataFactory(CanvasKit),
  Image: new JsiSkImageFactory(CanvasKit),
  SVG: new JsiSkSVGFactory(CanvasKit),
  TextBlob: new JsiSkTextBlobFactory(CanvasKit),
  FontMgr: new JsiSkFontMgrFactory(CanvasKit),
  XYWHRect: (x: number, y: number, width: number, height: number) => {
    return new JsiSkRect(CanvasKit, CanvasKit.XYWHRect(x, y, width, height));
  },
  Surface: new JsiSkSurfaceFactory(CanvasKit),
});
