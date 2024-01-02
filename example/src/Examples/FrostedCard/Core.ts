import { glsl } from "../../components/ShaderLib";

export const Core = glsl`
const vec4 TRANSPARENT = vec4(0., 0., 0., 0.);
const vec4 BLUE = vec4(0., 0., 1., 1.);
const vec4 GREEN = vec4(0., 1., 0., 1.);

struct Paint {
  half4 color;
  bool stroke;
  float strokeWidth;
  int blendMode;
};

struct Context  {
  half4 color;
  float2 p;
  float2 resolution;
};

Paint createStroke(half4 color, float strokeWidth) {
  return Paint(color, true, strokeWidth, 0);
}

Paint createFill(half4 color) {
  return Paint(color, false, 0, 0);
}
 
float4 draw(inout Context ctx, float d, Paint paint, vec4 color) {
  bool isFill = !paint.stroke && d < 0;
  bool isStroke = paint.stroke && abs(d) < paint.strokeWidth/2;
  if (isFill || isStroke) {
    ctx.color = color;
  }
  return TRANSPARENT;
}

float sdSegment(vec2 p, in vec2 a, in vec2 b)
{
    vec2 pa = p-a, ba = b-a;
    float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
    return length( pa - ba*h );
}

void drawSegment(inout Context ctx, vec2 a, vec2 b, Paint paint) {
  float d = sdSegment(ctx.p, a, b);
  float lerpFactor = clamp(length(ctx.p - a) / length(b - a), 0.0, 1.0);
  //mix(BLUE, GREEN, lerpFactor); // Calculate gradient color\ + 10sdfdsfsd
  draw(ctx, d, paint, mix(BLUE, GREEN, lerpFactor)); 
}
`;
