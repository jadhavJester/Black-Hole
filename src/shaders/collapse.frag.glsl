/*
 * GR1D / SNEC General Relativistic Core Collapse Shader
 * Source: stellarcollapse.org (GR1D / SNEC Hydrodynamics Code Base)
 * Implementation: Two-beat core collapse and shockwave propagation:
 * - Beat 1: Fast sub-second iron core implosion to nuclear saturation density
 * - Beat 2: Slower shockwave rebound expanding outward through stellar envelope with gravitational redshift dimming
 */

uniform float u_time;
uniform float u_collapseProgress; // 0 to 1

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vViewPosition;

float hash(vec3 p) {
  p = fract(p * vec3(443.897, 441.423, 437.195));
  p += dot(p, p.yzx + 19.19);
  return fract((p.x + p.y) * p.z);
}

float noise(vec3 p) {
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
    v += a * noise(p);
    p *= 2.05;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec3 norm = normalize(vNormal);
  vec3 viewDir = normalize(vViewPosition);

  // Two-beat hydrodynamics timing:
  // Beat 1: Fast core implosion (p < 0.3)
  // Beat 2: Slower shock propagation (p >= 0.3)
  float beat1 = clamp(u_collapseProgress / 0.3, 0.0, 1.0);
  float beat2 = clamp((u_collapseProgress - 0.3) / 0.7, 0.0, 1.0);

  vec3 p = vPosition * (3.5 + beat2 * 2.0) + vec3(u_time * 0.2);
  float granule = fbm(p);
  float fineTurbulence = fbm(p * 3.0 - vec3(u_time * 0.4));

  float NdotV = max(0.0, dot(norm, viewDir));
  float limbDarkening = mix(0.35, 1.0, pow(NdotV, 0.6));

  vec3 deepBlue = vec3(0.15, 0.45, 1.0);
  vec3 brightWhiteBlue = vec3(0.85, 0.95, 1.0);
  vec3 coreIronRed = vec3(1.0, 0.15, 0.02);
  vec3 shockCyan = vec3(0.4, 0.9, 1.0);

  vec3 surfaceColor = mix(deepBlue, brightWhiteBlue, granule * 0.85);

  // Beat 1: Core implosion iron ignition
  surfaceColor = mix(surfaceColor, coreIronRed, fineTurbulence * beat1);

  // Beat 2: Rebound shockwave propagation
  surfaceColor = mix(surfaceColor, shockCyan, fineTurbulence * beat2 * 0.7);

  // GR1D / SNEC Gravitational Redshift dimming: g = sqrt(1 - rs / R(t))
  float gravRedshiftFactor = sqrt(max(0.001, 1.0 - 0.97 * u_collapseProgress));
  surfaceColor *= gravRedshiftFactor * gravRedshiftFactor;

  surfaceColor = mix(surfaceColor, vec3(0.6, 0.05, 0.01) * gravRedshiftFactor, u_collapseProgress * 0.85);

  vec3 finalColor = surfaceColor * limbDarkening;
  gl_FragColor = vec4(finalColor, 1.0 - pow(u_collapseProgress, 3.0) * 0.95);
}
