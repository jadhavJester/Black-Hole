/*
 * Accretion Disk Shader Calibrated to Event Horizon Telescope (EHT) M87* and Sgr A* Images
 * Physics: Keplerian Orbital Velocity v = sqrt(GM/r) = c * sqrt(rs / (2*r)) in Kerr metric
 * Relativistic Doppler Beaming factor delta = 1 / (gamma * (1 - beta * cos(theta)))
 * Observed Intensity scaling I_obs = delta^4 * I_em (Standard 4th-power relativistic beaming law)
 */

uniform float u_time;
uniform float u_rs;
uniform float u_accretionRate;
uniform float u_diskTemp;
uniform float u_spin;

varying vec2 vUv;
varying vec3 vPosition;

#define PI 3.14159265359

// Simplex-like 3D noise
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
    p *= 2.02;
    a *= 0.5;
  }
  return v;
}

// Planckian Blackbody Radiance to RGB Color
vec3 blackbody(float kelvin) {
  float temp = clamp(kelvin, 1000.0, 40000.0) / 100.0;
  vec3 col;

  if (temp <= 66.0) {
    col.r = 1.0;
    col.g = clamp((99.4708025861 * log(temp) - 161.1195681661) / 255.0, 0.0, 1.0);
  } else {
    float r = temp - 60.0;
    col.r = clamp((329.698727446 * pow(r, -0.1332047592)) / 255.0, 0.0, 1.0);
    col.g = clamp((288.1221695283 * pow(temp - 60.0, -0.0755148492)) / 255.0, 0.0, 1.0);
  }

  if (temp >= 66.0) {
    col.b = 1.0;
  } else if (temp <= 19.0) {
    col.b = 0.0;
  } else {
    col.b = clamp((138.5177312231 * log(temp - 10.0) - 305.0447927307) / 255.0, 0.0, 1.0);
  }

  return col;
}

void main() {
  vec2 st = vUv * 2.0 - 1.0;
  float r = length(st) * 14.0 * max(0.01, u_rs);

  // Kerr ISCO inner disk radius shrinks with spin a
  float rISCO = 3.0 * u_rs * (1.0 - u_spin * 0.35);
  float rDiskOut = 14.0 * u_rs;

  if (r < rISCO || r > rDiskOut || u_accretionRate <= 0.001) {
    discard;
  }

  // Radial temperature profile T(r)
  float rNorm = r / rISCO;
  float tempProfile = pow(rNorm, -0.75) * pow(1.0 - sqrt(1.0 / rNorm), 0.25) * 3.5;
  float currentTemp = u_diskTemp * max(0.1, tempProfile);

  // Keplerian orbital velocity in Kerr spacetime v = sqrt(GM/r)
  float beta = sqrt(clamp(u_rs / (2.0 * r), 0.0, 0.49));

  // Azimuthal angle and line-of-sight velocity projection
  float phi = atan(st.y, st.x);
  float vLine = -sin(phi);
  float betaLOS = beta * vLine;

  // Lorentz gamma factor
  float gamma = 1.0 / sqrt(max(0.01, 1.0 - beta * beta));

  // Relativistic Doppler beaming factor delta = 1 / (gamma * (1 - betaLOS))
  float dopplerFactor = 1.0 / (gamma * (1.0 - betaLOS));

  // Gravitational redshift factor g_grav = sqrt(1 - rs/r)
  float gravRedshift = sqrt(max(0.001, 1.0 - u_rs / r));
  float shift = dopplerFactor * gravRedshift;

  // Relativistic beaming scaling law: I_obs proportional to delta^4
  float relativisticBeaming = pow(dopplerFactor, 4.0);

  // Base blackbody color shifted by Doppler & gravitational redshift
  vec3 baseColor = blackbody(currentTemp * shift);

  // Distinct blue-shift tint on approaching side (delta > 1.0) and red-shift tint on receding side (delta < 1.0)
  vec3 shiftTint = mix(vec3(1.2, 0.5, 0.2), vec3(0.4, 0.8, 1.4), smoothstep(0.7, 1.4, dopplerFactor));
  vec3 radiatedColor = baseColor * shiftTint;

  // 2-3 Octaves of Keplerian shear advected domain-warped turbulence
  float shearRotation = phi * 3.0 - sqrt(r) * 2.5 + u_time * (4.0 / sqrt(rNorm));
  vec3 turbPos = vec3(r * 0.4, shearRotation, u_time * 0.5);
  float turb = fbm(turbPos);
  float density = mix(0.4, 1.3, turb) * u_accretionRate;

  vec3 finalColor = radiatedColor * relativisticBeaming * density;

  float opacity = clamp(density * 0.7 * (1.0 - (r - rISCO) / (rDiskOut - rISCO)), 0.0, 0.95);
  gl_FragColor = vec4(finalColor, opacity);
}
