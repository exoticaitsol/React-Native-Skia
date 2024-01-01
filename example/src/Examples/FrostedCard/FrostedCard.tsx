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
} from "@shopify/react-native-skia";
import { useDerivedValue } from "@shopify/react-native-skia/src/external/reanimated/moduleWrapper";
import React from "react";
import { Dimensions, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSharedValue, withSpring } from "react-native-reanimated";

import { frag } from "../../components/ShaderLib";

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

const source = frag`
uniform mat4 m4;

vec4 main(vec2 fragCoord)
{
    vec2 pos = (m4 * vec4(fragCoord, 1.0, 1.0)).xy; // Apply transformation to fragment position
    float radius = 100; // Radius of the circle
    vec2 center = vec2(${(width / 2).toFixed(1)}, ${(height / 2).toFixed(
  1
)}); // Center of the circle

    // Check if the current fragment is inside the circle
    if (length(pos - center) < radius) {
        return vec4(0.3, 0.6, 1.0, 1.0); // Inside the circle (orange color)
    } else {
        return vec4(0.0, 0.0, 0.0, 1.0); // Outside the circle (transparent)
    }
}
`;

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
    return {
      m4: processTransform3d([
        { translate: [width / 2, height / 2] },
        { perspective: 300 },
        { rotateX: rotateX.value },
        { rotateY: rotateY.value },
        { translate: [-width / 2, -height / 2] },
      ]),
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
          <Fill>
            <Shader source={source} uniforms={uniforms} />
          </Fill>
          {/* <BackdropFilter filter={<Blur blur={30} mode="clamp" />} clip={clip}>
            <Fill color="rgba(255, 255, 255, 0.1)" />
          </BackdropFilter> */}
        </Canvas>
      </GestureDetector>
    </View>
  );
};
