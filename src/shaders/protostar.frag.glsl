/*
 * Protostar Contraction & CNO Fusion Ignition Shader (Stage 2)
 * Source: MESA Pre-Main-Sequence Evolutionary Tracks (http://mesa.sourceforge.net/)
 * Models Kelvin-Helmholtz gravitational contraction & core fusion ignition flash at T_core >= 10^7 K
 */

uniform float u_time;
uniform float u_ignitionProgress; // 0 to 1

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vViewPosition;

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
  for (int i = 0; i < 4; i++) {
    v += a * noise3d(p);
    p *= 2.05;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec3 norm = normalize(vNormal);
  vec3 viewDir = normalize(vViewPosition);

  vec3 p = vPosition * 3.0 + vec3(u_time * 0.15);
  float granule = fbm(p);

  float NdotV = max(0.0, dot(norm, viewDir));
  float limbDarkening = mix(0.4, 1.0, pow(NdotV, 0.5));

  // Colors: Infrared Protostar Red -> Ignition Gold -> Main-Sequence Blue OB Giant
  vec3 protostarInfraredRed = vec3(0.85, 0.15, 0.05);
  vec3 ignitionGoldFlash = vec3(1.0, 0.85, 0.3);
  vec3 mainSequenceBlueOB = vec3(0.3, 0.65, 1.0);

  // Transition from contraction glow to fusion ignition
  vec3 surfaceColor = mix(protostarInfraredRed, ignitionGoldFlash, smoothstep(0.4, 0.7, u_ignitionProgress));
  surfaceColor = mix(surfaceColor, mainSequenceBlueOB, smoothstep(0.7, 1.0, u_ignitionProgress));

  // Ignition flash spike near T_core = 10^7 K (p ≈ 0.7)
  float flashSpike = exp(-pow((u_ignitionProgress - 0.7) * 12.0, 2.0));
  surfaceColor += vec3(0.9, 0.95, 1.0) * flashSpike * 2.5;

  vec3 finalColor = surfaceColor * limbDarkening * mix(1.0, 1.4, granule);
  gl_FragColor = vec4(finalColor, 1.0);
}
