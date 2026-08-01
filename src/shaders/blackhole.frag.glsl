uniform vec3 u_cameraPos;
uniform vec2 u_resolution;
uniform float u_time;
uniform sampler2D u_skyTexture;

// Physics Uniforms
uniform float u_rs;               // Schwarzschild radius (2GM/c^2)
uniform float u_accretionRate;     // Accretion disk density [0, 1]
uniform float u_diskTemp;          // Accretion disk temp (Kelvin)
uniform float u_jetIntensity;      // Polar jet brightness [0, 1]
uniform float u_hawkingIntensity;  // Hawking particle glow [0, 1]
uniform float u_supernovaBlast;    // Supernova explosion flare [0, 1]
uniform float u_spin;              // Kerr spin parameter a in [0, 0.99]
uniform vec3 u_binaryPos2;         // Position offset of secondary black hole in inspiral phase
uniform int u_maxSteps;            // Raymarching step budget

varying vec2 vUv;
varying vec3 vRayDirection;

#define PI 3.14159265359

// Hash function for procedural noise
float hash(vec3 p) {
  p = fract(p * vec3(443.897, 441.423, 437.195));
  p += dot(p, p.yzx + 19.19);
  return fract((p.x + p.y) * p.z);
}

// 3D Simplex-like noise
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

// Domain-warped FBM noise for 3D accretion disk fluid turbulence
float domainWarpFbm(vec3 p) {
  vec3 q = vec3(fbm(p + vec3(0.0, u_time * 0.1, 0.0)),
                fbm(p + vec3(1.7, 3.2, u_time * 0.08)),
                fbm(p + vec3(4.3, 1.1, 2.8)));
  return fbm(p + q * 0.6);
}

// Interstellar Gargantua Incandescent Blackbody Palette
vec3 gargantuaBlackbody(float kelvin) {
  float temp = clamp(kelvin, 1000.0, 45000.0) / 100.0;
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

  // Gargantua Incandescent Glow Enhancement: Warm Gold/Amber boost
  vec3 gargantuaGold = vec3(1.15, 0.85, 0.4);
  return col * gargantuaGold;
}

// Skybox Texture Sampling on Lensed Rays
vec3 sampleCosmicSkybox(vec3 rayDir) {
  vec3 dir = normalize(rayDir);
  float theta = atan(dir.x, dir.z);
  float phi = dir.y;
  vec2 skyUv = vec2(theta / (PI * 2.0) + 0.5, phi * 0.5 + 0.5);

  vec4 texColor = texture2D(u_skyTexture, skyUv);
  float galLat = abs(dir.y);
  float galBand = exp(-galLat * 4.5);
  vec3 nebColor = mix(vec3(0.05, 0.1, 0.3), vec3(0.9, 0.4, 0.2), galBand);

  return texColor.rgb * 1.3 + nebColor * 0.2;
}

// Kerr Spacetime Geodesic Acceleration Formula
vec3 geodesicAccel(vec3 pos, vec3 vel, float h2, float rs, float spin) {
  float r2 = dot(pos, pos);
  if (r2 < 0.0001) return vec3(0.0);
  float r = sqrt(r2);

  // Schwarzschild effective potential acceleration
  vec3 accSchwarzschild = -1.5 * rs * h2 / pow(r, 5.0) * pos;

  // Kerr Frame Dragging acceleration torque a_drag = -(6.0 * M / r^3) * (vel x J)
  float M = 0.5 * rs;
  vec3 J = vec3(0.0, spin * M * 0.9, 0.0);
  vec3 accFrameDragging = -(6.0 * M / pow(r, 3.0)) * cross(vel, J);

  return accSchwarzschild + accFrameDragging;
}

// 4th-Order Runge-Kutta (RK4) Numerical Geodesic Integrator
vec3 rk4Step(vec3 pos, vec3 vel, float h2, float rs, float spin, float dt) {
  vec3 k1 = dt * geodesicAccel(pos, vel, h2, rs, spin);
  vec3 k2 = dt * geodesicAccel(pos + vel * (0.5 * dt) + k1 * 0.25, vel, h2, rs, spin);
  vec3 k3 = dt * geodesicAccel(pos + vel * (0.5 * dt) + k2 * 0.25, vel, h2, rs, spin);
  vec3 k4 = dt * geodesicAccel(pos + vel * dt + k3 * 0.5, vel, h2, rs, spin);

  return (k1 + 2.0 * k2 + 2.0 * k3 + k4) / 6.0;
}

// ACES Filmic Tone Mapping
vec3 tonemapACES(vec3 x) {
  float a = 2.51;
  float b = 0.03;
  float c = 2.43;
  float d = 0.59;
  float e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}

// 3D Synchrotron Polar Jets Along Y-Axis
vec3 renderPolarJets(vec3 pos, float rs) {
  if (u_jetIntensity <= 0.01) return vec3(0.0);

  float distToAxis = length(pos.xz);
  float yAbs = abs(pos.y);
  float maxRadius = 0.15 * yAbs + 0.3 * rs;

  if (distToAxis < maxRadius && yAbs > 0.8 * rs && yAbs < 18.0 * rs) {
    float falloff = (1.0 - distToAxis / maxRadius) * exp(-yAbs / (10.0 * rs));
    float turbulence = fbm(vec3(pos.xz * 2.0, pos.y * 0.5 - u_time * 4.0));
    float intensity = falloff * (0.6 + 0.4 * turbulence) * u_jetIntensity;

    vec3 jetColor = mix(vec3(0.25, 0.65, 1.0), vec3(0.95, 0.98, 1.0), intensity);
    return jetColor * intensity * 2.5;
  }
  return vec3(0.0);
}

void main() {
  vec3 rayPos = u_cameraPos;
  vec3 rayDir = normalize(vRayDirection);

  float rs = max(0.001, u_rs);
  float M = 0.5 * rs;

  // Kerr spin flattened D-shaped shadow deformation: r_kerr = M + sqrt(M^2 - a^2)
  float aParam = clamp(u_spin * M * 0.95, 0.0, M * 0.98);
  float rKerrHorizon = M + sqrt(max(0.0001, M * M - aParam * aParam));

  // Kerr ISCO inner disk radius shrinks with spin a
  float rISCO = 3.0 * rs * (1.0 - u_spin * 0.35);

  float rPhoton = 1.5 * rs;
  float rDiskOut = 14.0 * rs;
  float rEscape = 35.0 * rs;

  vec3 col = vec3(0.0);
  float diskAlpha = 0.0;
  vec3 diskColorAccum = vec3(0.0);
  vec3 jetColorAccum = vec3(0.0);

  float primaryPhotonRing = 0.0;
  float subPhotonRings = 0.0;
  float chromaticDispersion = 0.0;
  bool hitHorizon = false;

  vec3 vel = rayDir;
  float r = length(rayPos);

  bool isBinaryInspiral = length(u_binaryPos2) > 0.05;

  int steps = u_maxSteps;
  for (int i = 0; i < 128; i++) {
    if (i >= steps) break;

    r = length(rayPos);

    // D-shaped Kerr horizon capture condition
    float dShapeOffset = rayPos.x * u_spin * 0.12 * rs;
    if (r + dShapeOffset <= rKerrHorizon * 1.002) {
      hitHorizon = true;
      break;
    }
    if (isBinaryInspiral && length(rayPos - u_binaryPos2) <= rKerrHorizon * 0.7) {
      hitHorizon = true;
      break;
    }

    if (r > rEscape) break;

    vec3 L = cross(rayPos, vel);
    float h2 = dot(L, L);

    // Adaptive step size: increased precision near photon sphere r ≈ 1.5 * rs
    float distToPhotonSphere = abs(r - rPhoton);
    float stepSize = clamp(0.06 * r, 0.008 * rs, 0.55 * rs);
    if (distToPhotonSphere < 0.4 * rs) {
      stepSize *= 0.35; // Fine precision sub-stepping for photon orbit windings!
    }

    vec3 prevPos = rayPos;

    // Perform RK4 Kerr geodesic velocity step
    vec3 dVel = rk4Step(rayPos, vel, h2, rs, u_spin, stepSize);
    vel += dVel;
    vel = normalize(vel);
    rayPos += vel * stepSize;

    // 1. Volumetric 3D Accretion Disk Density Sampling (|y| <= hDisk)
    // Guarantees 100% vibrant visibility & Interstellar Gargantua halo wrap-around from all camera angles!
    float rXZ = length(rayPos.xz);
    float hDisk = 0.28 * rs * (1.0 + 0.1 * (rXZ - rISCO) / rs);

    if (u_accretionRate > 0.001 && rXZ >= rISCO && rXZ <= rDiskOut && abs(rayPos.y) <= hDisk) {
      float rNorm = rXZ / rISCO;
      float tempProfile = pow(rNorm, -0.75) * pow(1.0 - sqrt(1.0 / rNorm), 0.25) * 3.5;
      float currentTemp = u_diskTemp * max(0.1, tempProfile);

      // Vertical Gaussian density falloff for smooth volumetric disk bounds
      float verticalFalloff = exp(-pow(rayPos.y / (hDisk * 0.6), 2.0));

      // 3D Keplerian orbital velocity vector v_orbit = sqrt(GM/r) * (-z, 0, x) / r
      float beta = sqrt(clamp(rs / (2.0 * rXZ), 0.0, 0.49));
      vec3 rotTangent = normalize(vec3(-rayPos.z, 0.0, rayPos.x));
      float vLine = dot(rotTangent, -vel);
      float betaLOS = beta * vLine;

      // Lorentz gamma factor
      float gamma = 1.0 / sqrt(max(0.01, 1.0 - beta * beta));

      // Relativistic Doppler beaming factor delta = 1 / (gamma * (1 - betaLOS))
      float dopplerFactor = 1.0 / (gamma * (1.0 - betaLOS));

      // Gravitational redshift factor
      float gravRedshift = sqrt(max(0.001, 1.0 - rs / rXZ));
      float shift = dopplerFactor * gravRedshift;

      // Relativistic 4th-power beaming law: I_obs = delta^4 * I_em
      float relativisticBeaming = pow(dopplerFactor, 4.0);

      vec3 baseColor = gargantuaBlackbody(currentTemp * shift);
      vec3 shiftTint = mix(vec3(1.2, 0.5, 0.2), vec3(0.4, 0.8, 1.4), smoothstep(0.7, 1.4, dopplerFactor));
      vec3 radiatedColor = baseColor * shiftTint;

      // Domain-warped FBM fluid turbulence advected along Keplerian flow
      float phiCross = atan(rayPos.z, rayPos.x);
      float shearRotation = phiCross * 3.0 - sqrt(rXZ) * 2.5 + u_time * (4.0 / sqrt(rNorm));
      vec3 diskPos = vec3(rXZ * 0.4, shearRotation, u_time * 0.4);
      float turb = domainWarpFbm(diskPos);
      float density = mix(0.35, 1.35, turb) * u_accretionRate * verticalFalloff;

      vec3 diskColor = radiatedColor * relativisticBeaming * density * 2.2;

      float sampleOpacity = clamp(density * (stepSize / (0.8 * rs)) * (1.0 - (rXZ - rISCO) / (rDiskOut - rISCO)), 0.0, 0.85);
      diskColorAccum += diskColor * sampleOpacity * (1.0 - diskAlpha);
      diskAlpha += sampleOpacity * (1.0 - diskAlpha);
    }

    // 2. Primary Thin Photon Ring & Nested Sub-Rings (r ≈ 1.5 * rs)
    if (distToPhotonSphere < 0.25 * rs) {
      float primaryGlow = exp(-(distToPhotonSphere / (0.05 * rs)) * 8.0);
      float subGlow = exp(-(distToPhotonSphere / (0.18 * rs)) * 14.0) * 0.4;

      primaryPhotonRing += primaryGlow * (1.0 / float(steps)) * 22.0;
      subPhotonRings += subGlow * (1.0 / float(steps)) * 10.0;
      chromaticDispersion += primaryGlow * 0.1;
    }

    // 3. 3D Synchrotron Polar Jets Along Y-Axis
    jetColorAccum += renderPolarJets(rayPos, rs) * (stepSize / (5.0 * rs));
  }

  // Final Composition:
  if (hitHorizon) {
    col = vec3(0.0);
  } else {
    // EVERY escaped ray samples the warped background skybox (Einstein ring distortion on field stars)
    vec3 lensedSky = sampleCosmicSkybox(vel);
    col = lensedSky;
  }

  // Composite Accretion Disk & Interstellar Gargantua 3D Halo Wrap-Around
  col = mix(col, diskColorAccum, diskAlpha);

  // Composite Primary Photon Ring & Nested Sub-Rings
  vec3 photonBase = mix(vec3(1.0, 0.85, 0.5), vec3(0.7, 0.9, 1.0), u_spin);
  vec3 spectralHalo = vec3(0.9 + chromaticDispersion, 0.8, 1.2 - chromaticDispersion);
  col += photonBase * spectralHalo * (primaryPhotonRing + subPhotonRings) * 1.9;

  // Composite Polar Jets
  col += jetColorAccum;

  // Composite Hawking Quantum Emission
  if (u_hawkingIntensity > 0.01 && hitHorizon) {
    vec3 hawkingColor = vec3(0.3, 0.75, 1.0) * u_hawkingIntensity * 4.5;
    col += hawkingColor;
  }

  // Supernova Burst
  if (u_supernovaBlast > 0.01) {
    vec3 blastColor = mix(vec3(1.0, 0.4, 0.1), vec3(1.0, 0.95, 0.8), u_supernovaBlast);
    col += blastColor * u_supernovaBlast * 3.5;
  }

  // ACES Filmic Tone Mapping
  col = tonemapACES(col * 1.3);

  gl_FragColor = vec4(col, 1.0);
}
