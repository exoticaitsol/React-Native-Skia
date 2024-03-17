import React from "react";
import {
  Canvas,
  Vertices,
  mapPoint3d,
  processTransform3d,
  vec,
} from "@shopify/react-native-skia";
import { Dimensions } from "react-native";
import {
  useDerivedValue,
  useSharedValue,
  withDecay,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

const { width, height } = Dimensions.get("window");
const size = 100;

// Define the 8 vertices of a cube in 3D space
const vertices = [
  [-1, -1, -1], // Vertex 0
  [1, -1, -1], // Vertex 1
  [1, 1, -1], // Vertex 2
  [-1, 1, -1], // Vertex 3
  [-1, -1, 1], // Vertex 4
  [1, -1, 1], // Vertex 5
  [1, 1, 1], // Vertex 6
  [-1, 1, 1], // Vertex 7
].map(([x, y, z]) => [width / 2 + x * size, height / 2 + y * size, z * size]);

const idx = [
  //   [0, 1, 2],
  //   [0, 2, 3], // Front face
  [1, 5, 6],
  [1, 6, 2], // Right face
  //   [5, 4, 7],
  //   [5, 7, 6], // Back face
  [4, 0, 3],
  [4, 3, 7], // Left face
  [3, 2, 6],
  [3, 6, 7], // Top face
  [4, 5, 1],
  [4, 1, 0], // Bottom face
];

// Define colors for each vertex
const colors = [
  "#61DAFB",
  "#fb61da",
  "#dafb61",
  "#61fbcf",
  "#fb6161",
  "#61fb88",
  "#8861fb",
  "#fb8861",
];

export const Matrix = () => {
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const gesture = Gesture.Pan()
    .onChange((event) => {
      rotateY.value += event.changeX / width;
      rotateX.value -= event.changeY / height;
    })
    .onEnd(({ velocityX, velocityY }) => {
      rotateY.value = withDecay({ velocity: velocityX / width });
      rotateX.value = withDecay({ velocity: -velocityY / height });
    });
  const transform = useDerivedValue(() => {
    return processTransform3d([
      { translate: [width / 2, height / 2] },
      { perspective: 500 },
      { rotateX: rotateX.value },
      { rotateY: rotateY.value },
      { translate: [-width / 2, -height / 2] },
    ]);
  });
  const mappedVertices = useDerivedValue(() => {
    return vertices.map(([x, y, z]) => {
      const result = mapPoint3d(transform.value, [x, y, z]);
      return result;
    });
  });

  const v = useDerivedValue(() => {
    return mappedVertices.value.map((vertex) => {
      return vec(vertex[0], vertex[1]);
    });
  });

  const indices = useDerivedValue(() => {
    const vtx = mappedVertices.value;
    const values = idx.map((triangle) => {
      const p0 = vtx[triangle[0]];
      const p1 = vtx[triangle[1]];
      const p2 = vtx[triangle[2]];
      const z = (p0[2] + p1[2] + p2[2]) / 3;
      return [...triangle, z];
    });
    values.sort((a, b) => a[3] - b[3]);
    return values.map((triangle) => triangle.slice(0, 3)).flat();
  });

  return (
    <GestureDetector gesture={gesture}>
      <Canvas style={{ flex: 1 }}>
        <Vertices vertices={v} colors={colors} indices={indices} />
      </Canvas>
    </GestureDetector>
  );
};
