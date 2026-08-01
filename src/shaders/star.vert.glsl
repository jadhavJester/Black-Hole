uniform float u_time;
uniform float u_collapseProgress; // 0 to 1

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vViewPosition;

void main() {
  vUv = uv;
  vec3 pos = position;

  // Real Physics: Tidal Disruption & Non-Spherical Prolate Elongation
  // Gravitational tidal forces stretch the star along its axis while squashing it radially
  float stretch = 1.0 + u_collapseProgress * 1.8;
  float squash = 1.0 / sqrt(stretch);

  pos.y *= stretch;
  pos.xz *= squash;

  // Rayleigh-Taylor turbulence surface deformation during implosion
  float wave = sin(pos.y * 6.0 + u_time * 5.0) * cos(pos.x * 6.0 + u_time * 4.0);
  pos += normal * wave * u_collapseProgress * 0.35;

  vNormal = normalize(normalMatrix * normal);
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  vPosition = pos;
  vViewPosition = -mvPosition.xyz;
  gl_Position = projectionMatrix * mvPosition;
}
