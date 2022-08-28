import type { SkCanvas, Skia, SkPaint } from "../../skia/types";
export enum NodeType {
  Group,

  Shader,
  ImageShader,

  BlurMaskFilter,

  DashPathEffect,
  Path1DPathEffect,
  Path2DPathEffect,
  CornerPathEffect,
  ComposePathEffect,
  SumPathEffect,
  Line2DPathEffect,

  MatrixColorFilter,

  Drawing,
  Paint,
  Circle,
  Fill,
  Image,
  Points,
  Path,
  Rect,
  RRect,
  Oval,
  Line,
  Patch,
  Vertices,
}

export interface DrawingContext {
  Skia: Skia;
  canvas: SkCanvas;
  paint: SkPaint;
  opacity: number;
}

export abstract class Node<P> {
  constructor(public type: NodeType, protected props: P) {}

  setProps(props: P) {
    this.props = props;
  }
}

export abstract class RenderNode<P> extends Node<P> {
  constructor(type: NodeType, props: P) {
    super(type, props);
  }

  abstract render(ctx: DrawingContext): void;
}

export type Invalidate = () => void;

export abstract class DeclarationNode<
  P,
  T,
  Nullable extends null | never = never
> extends Node<P> {
  private invalidate: Invalidate | null = null;

  constructor(type: NodeType, props: P) {
    super(type, props);
  }

  abstract get(Skia: Skia): T | Nullable;

  setInvalidate(invalidate: Invalidate) {
    this.invalidate = invalidate;
  }

  setProps(props: P) {
    if (!this.invalidate) {
      throw new Error(
        "Setting props on a declaration not attached to a drawing"
      );
    }
    this.props = props;
    this.invalidate();
  }
}

export abstract class NestedDeclarationNode<
  P,
  T,
  Nullable extends null | never = never
> extends DeclarationNode<P, T, Nullable> {
  protected children: DeclarationNode<unknown, T>[] = [];

  constructor(type: NodeType, props: P) {
    super(type, props);
  }

  addChild(shader: DeclarationNode<unknown, T>) {
    this.children.push(shader);
  }
}
