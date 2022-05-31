import { TileMode } from "../types";

import { processResult, setupSkia } from "./setup";

describe("Shader", () => {
  it("Simple shader", () => {
    const { surface, canvas, Skia } = setupSkia();
    const paint = Skia.Paint();
    const source = Skia.RuntimeEffect.Make(`
vec4 main(vec2 pos) {
  // normalized x,y values go from 0 to 1, the canvas is 256x256
  vec2 normalized = pos/vec2(256);
  return vec4(normalized.x, normalized.y, 0.5, 1);
}`)!;
    paint.setShader(source.makeShader([]));
    canvas.drawPaint(paint);
    processResult(surface, "snapshots/shader/shader1.png");
  });
  it("Shader with uniform", () => {
    const { surface, canvas, width, Skia } = setupSkia();
    const paint = Skia.Paint();
    const source = Skia.RuntimeEffect.Make(`
uniform vec2 c;
uniform float r;
uniform float blue;
  
vec4 main(vec2 pos) {
  vec2 normalized = pos/vec2(2 * r);
  return distance(pos, c) > r ? vec4(1) : vec4(normalized, blue, 1);
}`)!;
    const r = width / 2;
    paint.setShader(source.makeShader([2 * r, r, r, 1]));
    canvas.drawPaint(paint);
    processResult(surface, "snapshots/shader/shader2.png");
  });

  it("Sweep Gradient", () => {
    const { surface, canvas, center, Skia } = setupSkia();
    const paint = Skia.Paint();
    const colors = ["#61DAFB", "#fb61da", "#dafb61", "#61fbcf"].map((c) =>
      Skia.Color(c)
    );
    paint.setShader(
      Skia.Shader.MakeSweepGradient(
        center.x,
        center.y,
        colors,
        null,
        TileMode.Clamp,
        null
      )
    );
    canvas.drawPaint(paint);
    processResult(surface, "snapshots/shader/sweep-gradient.png");
  });
});
