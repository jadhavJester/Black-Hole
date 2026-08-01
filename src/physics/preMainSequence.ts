/**
 * Pre-Main Sequence Protostar & Fusion Ignition Physics Engine (Stage 2)
 * Physics: Kelvin-Helmholtz Gravitational Contraction to Hydrostatic Equilibrium
 * Ignition: CNO Cycle Core Fusion Ignition at T_core >= 10^7 K (10 Million Kelvin)
 * Reference: MESA Pre-Main-Sequence Evolutionary Tracks (http://mesa.sourceforge.net/)
 */

import { CONSTANTS } from './schwarzschild';

export interface ProtostarIgnitionState {
  coreTempKelvin: number;    // K (rising from 1e4 K to 1e7 K)
  luminositySolarL: number;  // L_sun
  protostarRadiusRsun: number;// R_sun (contracting from 12 R_sun to 1 R_sun)
  khTimescaleYears: number;  // Kelvin-Helmholtz timescale (years)
  isFusionIgnited: boolean;  // True when T_core >= 1e7 K
}

/**
 * Calculates Kelvin-Helmholtz contraction timescale t_KH in years
 * t_KH = (G * M^2) / (R * L)
 */
export function calculateKHTimescaleYears(
  massSolarMasses: number,
  radiusRsun: number,
  luminosityLsun: number
): number {
  const M = massSolarMasses * CONSTANTS.M_sun;
  const R = Math.max(0.1, radiusRsun) * 6.957e8; // Sun radius in meters
  const L = Math.max(1.0, luminosityLsun) * 3.828e26; // Sun luminosity in Watts

  const tSeconds = (CONSTANTS.G * M * M) / (R * L);
  return tSeconds / CONSTANTS.yearInSeconds;
}

/**
 * Evaluates Pre-Main-Sequence Protostar telemetry for Stage 2
 * @param stageProgress Progress fraction [0, 1]
 */
export function evaluateProtostarTelemetry(stageProgress: number): ProtostarIgnitionState {
  const p = Math.max(0.0, Math.min(1.0, stageProgress));

  // Core temperature rises non-linearly via gravitational contraction
  const coreTempKelvin = 1.0e4 + Math.pow(p, 2.2) * (1.5e7 - 1.0e4);

  // Radius contracts from 12 R_sun down to 1.0 R_sun
  const protostarRadiusRsun = 12.0 - p * 11.0;

  // Luminosity flares during gravitational collapse, then stabilizes
  const luminositySolarL = 500.0 + Math.pow(p, 1.5) * 45000.0;

  const khTimescaleYears = calculateKHTimescaleYears(20.0, protostarRadiusRsun, luminositySolarL);
  const isFusionIgnited = coreTempKelvin >= 1.0e7;

  return {
    coreTempKelvin,
    luminositySolarL,
    protostarRadiusRsun,
    khTimescaleYears,
    isFusionIgnited,
  };
}
