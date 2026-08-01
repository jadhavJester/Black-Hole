varying vec2 vUv;
varying vec3 vWorldPosition;
varying vec3 vRayDirection;

uniform mat4 u_inverseProjectionMatrix;
uniform mat4 u_inverseViewMatrix;

void main() {
  vUv = uv;
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;

  // Compute camera ray direction in world space
  vec4 ndc = vec4(position.xy, 1.0, 1.0);
  vec4 viewRay = u_inverseProjectionMatrix * ndc;
  viewRay.z = -1.0;
  viewRay.w = 0.0;
  vec3 worldRay = (u_inverseViewMatrix * viewRay).xyz;
  vRayDirection = normalize(worldRay);

  gl_Position = vec4(position, 1.0);
}
