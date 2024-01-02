import {
  Canvas,
  Skia,
  processTransform3d,
  useImage,
  Image,
  BackdropFilter,
  Fill,
  Blur,
  usePathValue,
  Shader,
  convertToColumnMajor,
  Circle,
  mapPoint3d,
  interpolate,
  RuntimeShader,
} from "@shopify/react-native-skia";
import React from "react";
import { Dimensions, PixelRatio, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  useSharedValue,
  withSpring,
  useDerivedValue,
} from "react-native-reanimated";

import { frag } from "../../components/ShaderLib";

import { Core } from "./Core";

const pd = PixelRatio.get();
console.log({ pd });
const { width, height } = Dimensions.get("window");
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = CARD_WIDTH / 1.618;
const rct = Skia.XYWHRect(
  (width - CARD_WIDTH) / 2,
  (height - CARD_HEIGHT) / 2,
  CARD_WIDTH,
  CARD_HEIGHT
);
const rrct = Skia.RRectXY(rct, 10, 10);

const sf = 300;
const springConfig = (velocity: number) => {
  "worklet";
  return {
    mass: 1,
    damping: 1,
    stiffness: 100,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 2,
    velocity,
  };
};

const source = frag`uniform shader image;
uniform mat4 m4;
uniform vec2 resolution;
uniform vec2 p1;
uniform vec2 p2;
uniform vec3 p3;
uniform vec3 p4;

${Core}

half4 main(float2 xy) {
  Context ctx = Context(image.eval(xy), xy, resolution);
  vec3 p1t = project(p1, m4);
  vec3 p2t = project(p2, m4);
  drawSegment(ctx, p1t.xy, p2t.xy, createStroke(vec4(.3, 0.6, 1., 1.), 10.));
  drawSegment(ctx, p3.xy, p4.xy, createStroke(vec4(1., 0.6, .3, 1.), 10.));
  return vec4(ctx.color.rgb, 1.);
}`;

export const FrostedCard = () => {
  const image = useImage(require("./dynamo.jpg"));
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onChange((event) => {
      rotateY.value += event.changeX / sf;
      rotateX.value -= event.changeY / sf;
    })
    .onEnd(({ velocityX, velocityY }) => {
      rotateX.value = withSpring(0, springConfig(velocityY / sf));
      rotateY.value = withSpring(0, springConfig(velocityX / sf));
    });

  const clip = usePathValue((path) => {
    "worklet";
    path.addRRect(rrct);
    path.transform(
      processTransform3d([
        { translate: [width / 2, height / 2] },
        { perspective: 300 },
        { rotateX: rotateX.value },
        { rotateY: rotateY.value },
        { translate: [-width / 2, -height / 2] },
      ])
    );
  });

  const uniforms = useDerivedValue(() => {
    "worklet";
    const m4 = processTransform3d([
      { translate: [width / 2, height / 2] },
      { perspective: 300 },
      { rotateX: rotateX.value },
      { rotateY: rotateY.value },
      { translate: [-width / 2, -height / 2] },
    ]);
    const p3 = mapPoint3d(m4, [rct.x, rct.y, 0]);
    const p4 = mapPoint3d(m4, [rct.x + CARD_WIDTH, rct.y, 0]);
    return {
      m4: convertToColumnMajor(m4),
      resolution: [width, height],
      p1: [rct.x, rct.y],
      p2: [rct.x + CARD_WIDTH, rct.y],
      p3,
      p4,
    };
  });
  return (
    <View style={{ flex: 1 }}>
      <GestureDetector gesture={gesture}>
        <Canvas style={{ flex: 1 }}>
          <Image
            image={image}
            x={0}
            y={0}
            width={width}
            height={height}
            fit="cover"
          />
          {/* <Fill>
            <Shader source={source} uniforms={uniforms} />
          </Fill> */}
          <BackdropFilter
            filter={<RuntimeShader source={source} uniforms={uniforms} />}
            clip={clip}
          >
            <Fill color="rgba(255, 255, 255, 0.1)" />
          </BackdropFilter>
        </Canvas>
      </GestureDetector>
    </View>
  );
};
