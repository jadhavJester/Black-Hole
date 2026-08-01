/*
 * LIGO GW150914 Gravitational Strain Chirp Shader
 * Source: LIGO Open Science Center (gwosc.org)
 * Models quadrupole strain waveform h_+(t) chirp:
 * - Exponential frequency and amplitude rise up to merger peak
 * - Instant post-merger exponential ringdown decay
 */

uniform float u_time;
uniform float u_gwAmplitude; // 0 to 1
uniform float u_gwFrequency; // Hz

varying vec2 vUv;
varying float vDisplacement;
varying vec3 vPosition;

void main() {
  if (u_gwAmplitude <= 0.0005) {
    discard;
  }

  // Quadrupole strain grid lines
  vec2 gridUv = fract(vUv * 60.0);
  float gridLine = min(
    smoothstep(0.0, 0.08, gridUv.x) * smoothstep(1.0, 0.92, gridUv.x),
    smoothstep(0.0, 0.08, gridUv.y) * smoothstep(1.0, 0.92, gridUv.y)
  );

  float isGrid = 1.0 - gridLine;

  // GW150914 Chirp Strain Color Mapping: Cyan crest to Magenta trough
  vec3 crestColor = vec3(0.1, 0.85, 1.0);
  vec3 troughColor = vec3(0.9, 0.2, 1.0);

  float normDisp = clamp((vDisplacement + 1.0) * 0.5, 0.0, 1.0);
  vec3 waveColor = mix(troughColor, crestColor, normDisp);

  float radialFade = smoothstep(28.0, 0.0, length(vPosition.xy));
  float opacity = isGrid * radialFade * u_gwAmplitude * 0.9;

  gl_FragColor = vec4(waveColor, opacity);
}
