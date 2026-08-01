/**
 * Jeans Instability Astrophysics Engine (Stage 1: Molecular Cloud Collapse)
 * Formula: M_J = (5 * k * T / (G * mu * m_H))^(3/2) * (3 / (4 * pi * rho))^(1/2)
 * Free-fall timescale: t_ff = sqrt(3 * pi / (32 * G * rho))
 * Reference: Jeans (1902) Philosophical Transactions of the Royal Society of London, A, 199, 1-53.
 */

import { CONSTANTS } from './schwarzschild';

// Mean molecular weight for cold molecular hydrogen gas (mu ~ 2.3)
const MU = 2.3;
const M_H = 1.6735575e-27; // Mass of hydrogen atom (kg)

export interface JeansInstabilityState {
  jeansMassSolarMasses: number; // M_sun
  cloudTemperatureKelvin: number; // K
  cloudDensityGcm3: number;      // g/cm^3
  freeFallTimeYears: number;     // Years
  isInstable: boolean;           // True if Cloud Mass > M_J
}

/**
 * Calculates Jeans Mass threshold M_J in Solar Masses
 * @param temperatureKelvin Cloud temperature in Kelvin (e.g. 15 K)
 * @param densityGcm3 Cloud density in g/cm^3 (e.g. 1e-19 g/cm^3)
 */
export function calculateJeansMassSolarMasses(
  temperatureKelvin: number,
  densityGcm3: number
): number {
  const T = Math.max(1.0, temperatureKelvin);
  const rhoKgM3 = Math.max(1e-25, densityGcm3 * 1000.0); // convert g/cm^3 to kg/m^3

  const term1 = (5.0 * CONSTANTS.kB * T) / (CONSTANTS.G * MU * M_H);
  const term2 = 3.0 / (4.0 * Math.PI * rhoKgM3);

  const mJeansKg = Math.pow(term1, 1.5) * Math.sqrt(term2);
  return mJeansKg / CONSTANTS.M_sun;
}

/**
 * Calculates gravitational free-fall collapse timescale t_ff in years
 * @param densityGcm3 Cloud density in g/cm^3
 */
export function calculateFreeFallTimeYears(densityGcm3: number): number {
  const rhoKgM3 = Math.max(1e-25, densityGcm3 * 1000.0);
  const tSeconds = Math.sqrt((3.0 * Math.PI) / (32.0 * CONSTANTS.G * rhoKgM3));
  return tSeconds / CONSTANTS.yearInSeconds;
}

/**
 * Evaluates Jeans Instability telemetry for Stage 1
 * @param cloudMassSolarMasses Current total cloud mass (e.g. 1500 M_sun)
 * @param stageProgress Progress fraction [0, 1]
 */
export function evaluateJeansTelemetry(
  cloudMassSolarMasses: number,
  stageProgress: number
): JeansInstabilityState {
  const p = Math.max(0.0, Math.min(1.0, stageProgress));

  // Temperature cools as outer gas radiates; density increases as collapse proceeds
  const cloudTemperatureKelvin = Math.max(10.0, 25.0 - p * 12.0);
  const cloudDensityGcm3 = 1.0e-19 * Math.pow(10.0, p * 4.0); // 1e-19 to 1e-15 g/cm^3

  const jeansMassSolarMasses = calculateJeansMassSolarMasses(cloudTemperatureKelvin, cloudDensityGcm3);
  const freeFallTimeYears = calculateFreeFallTimeYears(cloudDensityGcm3);

  return {
    jeansMassSolarMasses,
    cloudTemperatureKelvin,
    cloudDensityGcm3,
    freeFallTimeYears,
    isInstable: cloudMassSolarMasses > jeansMassSolarMasses,
  };
}
