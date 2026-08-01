/**
 * Hawking Evaporation Physics Engine
 * Formula: T_H = (hbar * c^3) / (8 * pi * G * M * kB)
 * Mass Loss Rate: dM/dt = -alpha / M^2  => M(t) = (M0^3 - 3 * alpha * t)^(1/3)
 */

import { CONSTANTS } from './schwarzschild';

export interface HawkingEvaporationState {
  currentMass: number;       // Solar Masses (M_sun)
  horizonRadiusKm: number;  // km
  hawkingTempKelvin: number;// K
  decayRateRatio: number;   // Normalized shrink acceleration
}

/**
 * Calculates live mass decay and horizon shrink during Hawking Evaporation stage (Stages 7 & 8)
 * @param initialMass Solar Masses (e.g. 30 M_sun)
 * @param stageProgress Progress fraction within Hawking stages [0, 1]
 */
export function calculateHawkingDecay(
  initialMass: number,
  stageProgress: number
): HawkingEvaporationState {
  const p = Math.max(0.0, Math.min(1.0, stageProgress));

  // Non-linear runaway mass decay curve M(p) = M0 * (1 - p^3)^(1/3)
  // Reflects dM/dt = -1/M^2 acceleration as mass drops toward zero
  const massRatio = Math.max(0.00001, Math.cbrt(1.0 - Math.pow(p, 2.5)));
  const currentMass = Math.max(0.0001, initialMass * massRatio);

  const massKg = currentMass * CONSTANTS.M_sun;
  const rsMeters = (2.0 * CONSTANTS.G * massKg) / (CONSTANTS.c * CONSTANTS.c);
  const horizonRadiusKm = rsMeters / 1000.0;

  // T_H = (hbar * c^3) / (8 * pi * G * M * kB)
  const denominator = 8.0 * Math.PI * CONSTANTS.G * massKg * CONSTANTS.kB;
  const numerator = CONSTANTS.hbar * Math.pow(CONSTANTS.c, 3);
  const hawkingTempKelvin = Math.min(1.4e32, numerator / denominator);

  // Accelerated shrink rate
  const decayRateRatio = 1.0 / (massRatio * massRatio);

  return {
    currentMass,
    horizonRadiusKm,
    hawkingTempKelvin,
    decayRateRatio,
  };
}
