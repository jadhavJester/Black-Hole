uniform float u_time;
uniform float u_gwAmplitude; // 0 to 1
uniform float u_gwFrequency; // Hz

varying vec2 vUv;
varying float vDisplacement;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vec3 pos = position;

  // Quad distance from central binary merger origin
  float dist = length(pos.xy);

  // Gravitational wave phase propagation outwards
  float waveNumber = u_gwFrequency * 0.05;
  float phase = dist * waveNumber - u_time * (u_gwFrequency * 0.2);

  // Quadrupole strain perturbation h_+ and h_x
  float strain = cos(phase) / (1.0 + dist * 0.15);
  float displacement = strain * u_gwAmplitude * 1.8;

  pos.z += displacement;
  vDisplacement = displacement;
  vPosition = pos;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
