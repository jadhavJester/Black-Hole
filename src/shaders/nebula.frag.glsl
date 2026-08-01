/*
 * JWST Eagle Nebula (Pillars of Creation) Volumetric Molecular Cloud Shader
 * Source: JWST Near-Infrared Camera (NIRCam) M16 Eagle Nebula Public Imagery
 * Models Jeans instability fragmentation, gravitational density clumps, and amber/cyan dust lanes
 */

uniform float u_time;
uniform float u_collapseProgress; // 0 to 1

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

float hash(vec3 p) {
  p = fract(p * vec3(443.897, 441.423, 437.195));
  p += dot(p, p.yzx + 19.19);
  return fract((p.x + p.y) * p.z);
}

float noise3d(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);

  return mix(
    mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
        mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
    mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
        mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z
  );
}

float fbm(vec3 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise3d(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec3 p = vPosition * (1.8 + u_collapseProgress * 1.5) + vec3(0.0, u_time * 0.05, 0.0);

  // Layered turbulence for Pillars of Creation cloud density
  float density1 = fbm(p);
  float density2 = fbm(p * 2.2 - vec3(u_time * 0.08));
  float cloudDensity = mix(density1, density2, 0.5);

  // Gravitational clump contraction
  float distToCenter = length(vPosition);
  float clumpContraction = exp(-distToCenter * (1.2 + u_collapseProgress * 2.5));

  // JWST NIRCam Color Palette: Deep Cyan gas, Amber/Gold dust lanes, White core
  vec3 deepCyanGas = vec3(0.05, 0.35, 0.55);
  vec3 amberGoldDust = vec3(0.9, 0.55, 0.15);
  vec3 brightProtostarCore = vec3(1.0, 0.92, 0.75);

  vec3 cloudColor = mix(deepCyanGas, amberGoldDust, cloudDensity * 1.2);
  cloudColor = mix(cloudColor, brightProtostarCore, clumpContraction * u_collapseProgress * 1.4);

  float alpha = clamp(cloudDensity * (0.4 + clumpContraction * 0.6), 0.0, 0.85);

  gl_FragColor = vec4(cloudColor * (1.2 + u_collapseProgress * 0.8), alpha);
}
