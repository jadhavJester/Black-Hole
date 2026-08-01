/**
 * MESA (Modules for Experiments in Stellar Astrophysics) & CosmicStudio Engine
 * Models Stellar Structure, H-R Diagram Positions, Spectral Classification, and Radiation Pressure
 * Sources:
 * - CosmicStudio (github.com/bayramkotan/CosmicStudio)
 * - Low-High-Mass-Star-Evolution (github.com/axr6077/Low-High-Mass-Star-Evolution)
 */

import { CONSTANTS } from './schwarzschild';

export interface CompositionShell {
  element: string;
  symbol: string;
  innerRadiusFraction: number; // r / R_*
  outerRadiusFraction: number; // r / R_*
  temperatureKelvin: number;
  densityGcm3: number;
  colorHex: string;
  description: string;
}

export const MESA_20MSUN_ONION_SHELLS: CompositionShell[] = [
  {
    element: "Iron Core",
    symbol: "Fe",
    innerRadiusFraction: 0.0,
    outerRadiusFraction: 0.08,
    temperatureKelvin: 4.2e9,
    densityGcm3: 1.0e9,
    colorHex: "#dc2626", // Deep Crimson Core
    description: "Inert degenerate iron core exceeding Chandrasekhar limit (~1.4 M☉). Electron capture triggers collapse."
  },
  {
    element: "Silicon Shell",
    symbol: "Si",
    innerRadiusFraction: 0.08,
    outerRadiusFraction: 0.18,
    temperatureKelvin: 2.1e9,
    densityGcm3: 3.0e7,
    colorHex: "#f59e0b", // Amber / Gold
    description: "Active silicon burning shell producing iron peak elements."
  },
  {
    element: "Oxygen Shell",
    symbol: "O-Ne-Mg",
    innerRadiusFraction: 0.18,
    outerRadiusFraction: 0.32,
    temperatureKelvin: 1.1e9,
    densityGcm3: 5.0e5,
    colorHex: "#10b981", // Emerald / Turquoise
    description: "Oxygen-Neon-Magnesium burning layer."
  },
  {
    element: "Carbon Shell",
    symbol: "C-O",
    innerRadiusFraction: 0.32,
    outerRadiusFraction: 0.50,
    temperatureKelvin: 6.5e8,
    densityGcm3: 1.0e4,
    colorHex: "#8b5cf6", // Violet / Cobalt
    description: "Carbon-oxygen fusion layer generating neon and magnesium."
  },
  {
    element: "Helium Shell",
    symbol: "He",
    innerRadiusFraction: 0.50,
    outerRadiusFraction: 0.75,
    temperatureKelvin: 2.2e8,
    densityGcm3: 8.0e1,
    colorHex: "#2563eb", // Deep Sapphire Blue
    description: "Helium burning envelope producing carbon and oxygen."
  },
  {
    element: "Hydrogen Envelope",
    symbol: "H",
    innerRadiusFraction: 0.75,
    outerRadiusFraction: 1.00,
    temperatureKelvin: 3.2e4,
    densityGcm3: 1.0e-7,
    colorHex: "#38bdf8", // Bright Cyan OB Supergiant Surface
    description: "Massive hydrogen convective envelope forming the stellar surface."
  }
];

export function getMESACompositionShell(radiusFraction: number): CompositionShell {
  const r = Math.max(0.0, Math.min(1.0, radiusFraction));
  return MESA_20MSUN_ONION_SHELLS.find(
    shell => r >= shell.innerRadiusFraction && r <= shell.outerRadiusFraction
  ) || MESA_20MSUN_ONION_SHELLS[MESA_20MSUN_ONION_SHELLS.length - 1];
}

/**
 * Returns Morgan-Keenan Spectral Classification based on Effective Temperature (T_eff)
 * Source: CosmicStudio / Morgan-Keenan Spectral Standard
 */
export function getSpectralClass(T_eff: number): string {
  if (T_eff >= 30000) return "Class O (Blue Supergiant)";
  if (T_eff >= 10000) return "Class B (Blue-White)";
  if (T_eff >= 7500) return "Class A (White)";
  if (T_eff >= 6000) return "Class F (Yellow-White)";
  if (T_eff >= 5200) return "Class G (Yellow)";
  if (T_eff >= 3700) return "Class K (Orange)";
  return "Class M (Red Supergiant)";
}

/**
 * Calculates Radiation Pressure vs Gas Pressure Ratio P_rad / P_total
 * P_gas = (rho * kB * T) / (mu * m_H)
 * P_rad = (1/3) * a_rad * T^4
 */
export function calculateRadiationPressureRatio(
  densityGcm3: number,
  temperatureKelvin: number
): number {
  const rho = Math.max(1e-15, densityGcm3 * 1000.0); // kg/m^3
  const T = Math.max(10.0, temperatureKelvin);
  const mu = 0.62; // Ionized stellar interior mean molecular weight
  const mH = 1.673e-27;
  const aRad = 7.5657e-16; // Radiation constant J m^-3 K^-4

  const P_gas = (rho * CONSTANTS.kB * T) / (mu * mH);
  const P_rad = (1.0 / 3.0) * aRad * Math.pow(T, 4.0);

  return P_rad / (P_gas + P_rad);
}

/**
 * Calculates Stellar Luminosity L / L_sun via Stefan-Boltzmann law L = 4 * pi * R^2 * sigma * T^4
 */
export function calculateStellarLuminosityLsun(
  radiusRsun: number,
  T_eff: number
): number {
  const R = radiusRsun * 6.957e8; // meters
  const sigma = 5.670374e-8; // Stefan-Boltzmann constant
  const L_watts = 4.0 * Math.PI * R * R * sigma * Math.pow(T_eff, 4.0);
  return L_watts / 3.828e26; // L_sun
}
