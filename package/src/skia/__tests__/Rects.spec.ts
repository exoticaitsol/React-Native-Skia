import type { CanvasKit } from "canvaskit-wasm";
import CanvasKitInit from "canvaskit-wasm";

import { JsiSkApi } from "../web";

//import type { SkiaApi } from "../SkiaApi";

let Skia: ReturnType<typeof JsiSkApi>;

declare global {
  var CanvasKit: CanvasKit;
}

beforeAll(async () => {
  const CanvasKit = await CanvasKitInit();
  Skia = JsiSkApi(CanvasKit);
});

describe("Draw a rectangle", () => {
  it("Check that CanvasKit and CanvasKit are loaded", async () => {
    expect(Skia).toBeDefined();
  });
  it("Draws a lightblue rectange", () => {
    const paint = Skia.Paint();
    paint.setColor(Skia.Color("lightblue"));
    const rct = Skia.XYWHRect(64, 64, 128, 128);
    const surface = Skia.Surface.Make(256, 256);
    expect(surface).toBeDefined();
    if (!surface) {
      return;
    }
    const canvas = surface.getCanvas();
    canvas.drawRect(rct, paint);
    surface.ref.flush();
    const image = surface.makeImageSnapshot();
    const png = image.encodeToBytes();
    console.log({ png });
    const fs = require("fs");
    const h = fs.openSync("lightblue-rect.png", "w");
    fs.writeFileSync(h, png);
  });
});
