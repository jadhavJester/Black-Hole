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

  // Convective solar plasma turbulence
  vec3 p = vPosition * 3.5 + vec3(u_time * 0.2);
  float granule = fbm(p);
  float fineTurbulence = fbm(p * 3.0 - vec3(u_time * 0.4));

  // Limb darkening (Eddington approximation)
  float NdotV = max(0.0, dot(norm, viewDir));
  float limbDarkening = mix(0.35, 1.0, pow(NdotV, 0.6));

  // Outer coronal atmosphere rim glow
  float fresnelRim = pow(1.0 - NdotV, 3.5);

  // Surface base color (Blue OB Supergiant ~28,000 K)
  vec3 deepBlue = vec3(0.15, 0.45, 1.0);
  vec3 brightWhiteBlue = vec3(0.85, 0.95, 1.0);
  vec3 coreIronRed = vec3(1.0, 0.15, 0.02);

  vec3 surfaceColor = mix(deepBlue, brightWhiteBlue, granule * 0.85);

  // Core collapse ignition: Rayleigh-Taylor instability filaments
  surfaceColor = mix(surfaceColor, coreIronRed, fineTurbulence * u_collapseProgress);

  // Real Physics: Gravitational Redshift Dimming g = sqrt(1 - rs / R(t))
  // As stellar radius R approaches rs, light loses energy, shifting blue -> deep red -> black
  float gravRedshiftFactor = sqrt(max(0.001, 1.0 - 0.97 * u_collapseProgress));
  surfaceColor *= gravRedshiftFactor * gravRedshiftFactor; // Intensity dimming I ~ g^2

  // Color shift toward deep gravitational infrared
  surfaceColor = mix(surfaceColor, vec3(0.6, 0.05, 0.01) * gravRedshiftFactor, u_collapseProgress * 0.85);

  // Solar flare plasma prominence highlights
  float flare = pow(fineTurbulence, 3.5) * 3.0 * (1.0 - u_collapseProgress);
  surfaceColor += vec3(0.5, 0.8, 1.0) * flare;

  vec3 finalColor = surfaceColor * limbDarkening;
  vec3 rimGlow = vec3(0.3, 0.7, 1.0) * fresnelRim * 2.5 * (1.0 - u_collapseProgress * 0.9);

  finalColor += rimGlow;

  gl_FragColor = vec4(finalColor, 1.0 - pow(u_collapseProgress, 3.0) * 0.95);
}
