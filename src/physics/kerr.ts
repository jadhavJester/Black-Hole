/**
 * Kerr Metric Astrophysics Engine
 * Physics: Rotating Black Hole Horizon, Bardeen-Press-Teukolsky ISCO, and Frame Dragging
 * Reference: Bardeen, Press, & Teukolsky (1972) Astrophysical Journal, 178, 347.
 */

import { CONSTANTS } from './schwarzschild';

/**
 * Calculates Kerr Outer Event Horizon Radius r_+ in Solar Mass units (M)
 * r_+ = M + sqrt(M^2 - a^2)
 * @param M Mass in Solar Masses (M_sun)
 * @param a Spin parameter in range [0, 0.999] (dimensionless spin a/M)
 */
export function calculateKerrHorizonRadiusM(M: number, a: number): number {
  const spinClamped = Math.max(0.0, Math.min(0.999, a));
  return M + Math.sqrt(Math.max(0.0001, M * M - spinClamped * spinClamped * M * M));
}

/**
 * Calculates Kerr Innermost Stable Circular Orbit (ISCO) Radius in Solar Mass units (M)
 * Exact Bardeen, Press, & Teukolsky (1972) formula for prolate co-rotating equatorial orbits
 * @param M Mass in Solar Masses (M_sun)
 * @param a Spin parameter in range [0, 0.999] (dimensionless spin a/M)
 */
export function calculateKerrISCORadiusM(M: number, a: number): number {
  const aNorm = Math.max(0.0, Math.min(0.999, a));

  if (aNorm < 0.001) return 6.0 * M; // Schwarzschild limit r_isco = 6M = 3.0 rs

  const Z1 = 1.0 + Math.cbrt(1.0 - aNorm * aNorm) * (Math.cbrt(1.0 + aNorm) + Math.cbrt(1.0 - aNorm));
  const Z2 = Math.sqrt(3.0 * aNorm * aNorm + Z1 * Z1);

  // Co-rotating orbit ISCO
  const rISCO = M * (3.0 + Z2 - Math.sqrt((3.0 - Z1) * (3.0 + Z1 + 2.0 * Z2)));
  return rISCO;
}

/**
 * Converts Kerr ISCO radius to kilometers for UI Telemetry display
 */
export function calculateKerrISCOKm(massInSolarMasses: number, spin: number): number {
  if (massInSolarMasses <= 0) return 0;
  const rISCOM = calculateKerrISCORadiusM(massInSolarMasses, spin);
  // 1 M_sun radius unit M = G M_sun / c^2 = ~1.4766 km
  const rMeters = (CONSTANTS.G * massInSolarMasses * CONSTANTS.M_sun) / (CONSTANTS.c * CONSTANTS.c);
  return (rISCOM * rMeters) / 1000;
}

/**
 * Calculates Kerr Lense-Thirring frame-dragging precession frequency (Hz)
 * omega_drag = (2 * G * J * r) / (c^2 * (r^2 + a^2)^2)
 */
export function calculateFrameDraggingOmega(rM: number, a: number): number {
  const rClamped = Math.max(1.0, rM);
  const aClamped = Math.max(0.0, Math.min(0.999, a));
  return (2.0 * aClamped) / Math.pow(rClamped, 3.0);
}
