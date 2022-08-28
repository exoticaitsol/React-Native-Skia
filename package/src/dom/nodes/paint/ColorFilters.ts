import type {
  BlendMode,
  SkColor,
  SkColorFilter,
  Skia,
} from "../../../skia/types";
import { DeclarationNode, NodeType, NestedDeclarationNode } from "../Node";

export interface MatrixColorFilterNodeProps {
  colorMatrix: number[];
}

export class MatrixColorFilterNode extends DeclarationNode<
  MatrixColorFilterNodeProps,
  SkColorFilter
> {
  constructor(props: MatrixColorFilterNodeProps) {
    super(NodeType.MatrixColorFilter, props);
  }

  get(Skia: Skia) {
    const { colorMatrix } = this.props;
    return Skia.ColorFilter.MakeMatrix(colorMatrix);
  }
}

export interface BlendColorFilterNodeProps {
  color: SkColor;
  mode: BlendMode;
}

export class BlendColorFilterNode extends DeclarationNode<
  BlendColorFilterNodeProps,
  SkColorFilter
> {
  constructor(props: BlendColorFilterNodeProps) {
    super(NodeType.BlendColorFilter, props);
  }

  get(Skia: Skia) {
    const { color, mode } = this.props;
    return Skia.ColorFilter.MakeBlend(color, mode);
  }
}

export class ComposeColorFilterNode extends NestedDeclarationNode<
  null,
  SkColorFilter
> {
  constructor() {
    super(NodeType.ComposeColorFilterNode, null);
  }

  get(Skia: Skia) {
    return this.getRecursively(
      Skia,
      Skia.ColorFilter.MakeCompose.bind(Skia.ColorFilter)
    );
  }
}

export class LinearToSRGBGammaColorFilterNode extends DeclarationNode<
  null,
  SkColorFilter
> {
  constructor() {
    super(NodeType.LinearToSRGBGammaColorFilterNode, null);
  }

  get(Skia: Skia) {
    return Skia.ColorFilter.MakeLinearToSRGBGamma();
  }
}

export class SRGBToLinearGammaColorFilterNode extends DeclarationNode<
  null,
  SkColorFilter
> {
  constructor() {
    super(NodeType.SRGBToLinearGammaColorFilterNode, null);
  }

  get(Skia: Skia) {
    return Skia.ColorFilter.MakeSRGBToLinearGamma();
  }
}

export class LumaColorFilterNode extends DeclarationNode<null, SkColorFilter> {
  constructor() {
    super(NodeType.LumaColorFilterColorFilterNode, null);
  }

  get(Skia: Skia) {
    return Skia.ColorFilter.MakeLumaColorFilter();
  }
}
