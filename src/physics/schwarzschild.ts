/**
 * Schwarzschild & Kerr Relativistic Physics Calculations & 10-Stage Timeline Data Engine
 * Core Collapse Hydrodynamics models sourced from StellarCollapse.org (Ott et al. 2009, 2013)
 * Kerr ISCO physics based on Bardeen, Press, & Teukolsky (1972)
 * Jeans Instability physics based on Jeans (1902) & JWST NIRCam Eagle Nebula data
 * Pre-Main-Sequence Contraction based on Kelvin-Helmholtz & MESA pre-main-sequence tracks
 * Stellar Thermodynamics & Spectral Types sourced from CosmicStudio & Low-High-Mass-Star-Evolution
 */

import * as THREE from 'three';
import { calculateKerrHorizonRadiusM, calculateKerrISCORadiusM, calculateKerrISCOKm } from './kerr';
import { calculateHawkingDecay } from './hawking';
import { evaluateJeansTelemetry } from './jeans';
import { evaluateProtostarTelemetry } from './preMainSequence';
import { getSpectralClass, calculateRadiationPressureRatio, calculateStellarLuminosityLsun } from './stellar-profile';

// Fundamental Physical Constants (SI units)
export const CONSTANTS = {
  G: 6.67430e-11,       // Gravitational constant (m^3 kg^-1 s^-2)
  c: 2.99792458e8,      // Speed of light (m/s)
  M_sun: 1.989e30,      // Solar mass (kg)
  hbar: 1.054571817e-34,// Reduced Planck constant (J s)
  kB: 1.380649e-23,     // Boltzmann constant (J/K)
  nuclearDensity: 2.7e14,// Nuclear saturation density (g/cm^3)
  yearInSeconds: 31557600,
};

export interface StageInfo {
  id: number;
  name: string;
  shortName: string;
  subtitle: string;
  citation: string;
  isTheoretical: boolean;
  description: string;
}

export const STAGES: StageInfo[] = [
  {
    id: 0,
    name: "Molecular Cloud Collapse",
    shortName: "1. Cloud Collapse",
    subtitle: "Jeans mass instability & turbulent fragmentation",
    citation: "Jeans (1902); JWST NIRCam Pillars of Creation (Eagle Nebula / M16)",
    isTheoretical: false,
    description: "A cold (~15 K) giant molecular cloud exceeds its Jeans mass threshold M_J. Gravitational instability triggers turbulent fragmentation into stellar clumps, forming the birth site of the progenitor star."
  },
  {
    id: 1,
    name: "Protostar & Fusion Ignition",
    shortName: "2. Protostar Ignition",
    subtitle: "Kelvin-Helmholtz contraction & CNO hydrogen fusion",
    citation: "Kelvin-Helmholtz contraction timescale; MESA Pre-Main-Sequence tracks; CosmicStudio",
    isTheoretical: false,
    description: "The collapsing clump's core contracts under gravity, heating to T_core ≈ 10 million Kelvin. CNO cycle hydrogen fusion ignites in a brilliant flash, establishing hydrostatic equilibrium on the main sequence."
  },
  {
    id: 2,
    name: "Massive Star",
    shortName: "3. Massive Star",
    subtitle: "Nuclear fusion shell structure (~20 M☉ OB Supergiant)",
    citation: "Betelgeuse / Rigel evolutionary models; StellarCollapse.org; MESA; CosmicStudio",
    isTheoretical: false,
    description: "A supermassive blue giant star undergoing nuclear fusion in onion-like concentric shells (H, He, C, O, Ne, Si, Fe). Iron core builds up until electron degeneracy pressure fails against gravity."
  },
  {
    id: 3,
    name: "Core Collapse & Supernova",
    shortName: "4. Supernova",
    subtitle: "Two-beat core collapse & shock propagation (StellarCollapse.org)",
    citation: "GR1D & SNEC Hydrodynamics (stellarcollapse.org); Low-High-Mass-Star-Evolution; SN 1987A",
    isTheoretical: false,
    description: "Beat 1: Sub-second core implosion to nuclear saturation density (2.7×10¹⁴ g/cm³). Beat 2: Rebound shock wave expands outward through stellar envelope with prolate tidal elongation."
  },
  {
    id: 4,
    name: "Event Horizon Formation",
    shortName: "5. Horizon Formation",
    subtitle: "Spacetime closure at Schwarzschild radius (rs)",
    citation: "Oppenheimer-Snyder collapse (1939); General Relativity",
    isTheoretical: false,
    description: "Matter is compressed beyond its Schwarzschild radius rs = 2GM/c². Spacetime curvature becomes infinite at the central singularity, creating an outer event horizon."
  },
  {
    id: 5,
    name: "Active Accretion & Growth",
    shortName: "6. Active Accretion",
    subtitle: "High-density relativistic disk & polar jets",
    citation: "Event Horizon Telescope (EHT) M87* & Sagittarius A* (2019, 2022); iharm3D",
    isTheoretical: false,
    description: "Inframaterial forms a Keplerian accretion disk heated to millions of Kelvin. Relativistic Doppler beaming (I ∝ δ⁴) blueshifts approaching matter. Magnetic fields launch perpendicular polar jets."
  },
  {
    id: 6,
    name: "Binary Inspiral & Merger",
    shortName: "7. Inspiral & Merger",
    subtitle: "Dual orbiting horizons & GW strain chirp (GW150914)",
    citation: "LIGO/Virgo Collaboration GW150914 (gwosc.org)",
    isTheoretical: false,
    description: "Two black holes orbit each other, emitting gravitational radiation. Frequency and amplitude chirp rapidly right up to merger, followed by exponential ringdown decay."
  },
  {
    id: 7,
    name: "Quiescence",
    shortName: "8. Quiescence",
    subtitle: "Dormant black hole with pure gravitational lensing",
    citation: "Stellar-mass & Supermassive dormant black hole census",
    isTheoretical: false,
    description: "Accretion subsides to near zero (< 0.5%). The dark Schwarzschild/Kerr shadow and photon sphere (r = 1.5 rs) severely distort background Milky Way starfield light through pure gravitational lensing without active gas emissions."
  },
  {
    id: 8,
    name: "Hawking Evaporation",
    shortName: "9. Hawking Radiation",
    subtitle: "Quantum vacuum pair production & mass decay",
    citation: "Stephen Hawking (1974); Quantum field theory in curved spacetime",
    isTheoretical: true,
    description: "Quantum vacuum fluctuations at the horizon split particle-antiparticle pairs. Mass decays as M(t) = (M₀³ - 3αt)¹/³, causing the event horizon radius to shrink continuously in real time as T ∝ 1/M rises."
  },
  {
    id: 9,
    name: "Final Evaporation Burst",
    shortName: "10. Final Burst",
    subtitle: "Runaway thermal explosion as M -> 0",
    citation: "Theoretical quantum gravity & primordial black hole end-states",
    isTheoretical: true,
    description: "As mass approaches zero, shrink acceleration spikes non-linearly. Hawking temperature climbs toward Planck scale (~10³² K), releasing a runaway explosion of high-energy gamma rays in the final fraction of a second."
  }
];

export function calculateSchwarzschildRadiusKm(massInSolarMasses: number): number {
  if (massInSolarMasses <= 0) return 0;
  const massKg = massInSolarMasses * CONSTANTS.M_sun;
  const rsMeters = (2 * CONSTANTS.G * massKg) / (CONSTANTS.c * CONSTANTS.c);
  return rsMeters / 1000;
}

export function calculatePhotonSphereRadiusKm(massInSolarMasses: number): number {
  return 1.5 * calculateSchwarzschildRadiusKm(massInSolarMasses);
}

export function calculateISCOKm(massInSolarMasses: number, spin = 0.0): number {
  return calculateKerrISCOKm(massInSolarMasses, spin);
}

export function calculateHawkingTemperatureKelvin(massInSolarMasses: number): number {
  if (massInSolarMasses <= 0.000000001) return 1.4e32;
  const massKg = massInSolarMasses * CONSTANTS.M_sun;
  const denominator = 8 * Math.PI * CONSTANTS.G * massKg * CONSTANTS.kB;
  const numerator = CONSTANTS.hbar * Math.pow(CONSTANTS.c, 3);
  return numerator / denominator;
}

export function calculateEvaporationLifetimeYears(massInSolarMasses: number): number {
  if (massInSolarMasses <= 0) return 0;
  const massKg = massInSolarMasses * CONSTANTS.M_sun;
  const numerator = 5120 * Math.PI * Math.pow(CONSTANTS.G, 2) * Math.pow(massKg, 3);
  const denominator = 3 * CONSTANTS.hbar * Math.pow(CONSTANTS.c, 4);
  const seconds = numerator / denominator;
  return seconds / CONSTANTS.yearInSeconds;
}

export function formatScientific(value: number, decimalPlaces = 2): string {
  if (value === 0) return "0";
  if (Math.abs(value) >= 0.01 && Math.abs(value) < 100000) {
    return value.toLocaleString(undefined, { maximumFractionDigits: decimalPlaces });
  }
  const exp = value.toExponential(decimalPlaces);
  const [mantissa, exponent] = exp.split('e');
  const expNum = parseInt(exponent, 10);
  return `${mantissa} × 10${toSuperscript(expNum)}`;
}

function toSuperscript(num: number): string {
  const map: Record<string, string> = {
    '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
  };
  return String(num).split('').map(c => map[c] || c).join('');
}

export interface PhysicsState {
  mass: number;           // M_sun
  spin: number;           // a parameter (0 to 0.99)
  accretionRate: number;  // 0 to 1
  diskTemperature: number;// Kelvin
  jetIntensity: number;   // 0 to 1
  gwAmplitude: number;    // Gravitational wave amplitude 0 to 1
  gwFrequency: number;    // Gravitational wave chirp frequency Hz
  hawkingIntensity: number;// 0 to 1
  supernovaBlast: number; // 0 to 1
  starRadius: number;     // Render scale for star stage
  effectiveRsRatio: number; // 0.0 to 1.0
  centralDensity: number; // StellarCollapse.org core density g/cm^3
  neutrinoLuminosity: number; // StellarCollapse.org neutrino burst erg/s
  jeansMass: number;      // Stage 1 Jeans mass threshold (M_sun)
  protostarCoreTemp: number; // Stage 2 protostar core temp (Kelvin)
  protostarIgnitionProgress: number; // 0 to 1
  spectralClass: string;  // Morgan-Keenan spectral class
  radPressureRatio: number; // Radiation pressure vs Gas pressure ratio P_rad / P_total
  stellarLuminosity: number; // L / L_sun
  binaryOffset: THREE.Vector3;
  stageIndex: number;
  stageProgress: number;  // Fractional position between stages (0 to 1)
}

export function interpolatePhysicsState(timelineTime: number): PhysicsState {
  const t = Math.max(0, Math.min(9, timelineTime));
  const stageIndex = Math.floor(t);
  const stageProgress = stageIndex === 9 ? 1.0 : t - stageIndex;

  let mass = 20.0;
  let spin = 0.0;
  let accretionRate = 0.0;
  let diskTemperature = 8000;
  let jetIntensity = 0.0;
  let gwAmplitude = 0.0;
  let gwFrequency = 10.0;
  let hawkingIntensity = 0.0;
  let supernovaBlast = 0.0;
  let starRadius = 0.0;
  let effectiveRsRatio = 0.0;
  let centralDensity = 1.0e9;
  let neutrinoLuminosity = 1.0e49;
  let jeansMass = 500.0;
  let protostarCoreTemp = 1.0e4;
  let protostarIgnitionProgress = 0.0;
  let effectiveTempK = 32000;
  let radiusRsun = 1.0;

  const binaryOffset = new THREE.Vector3(0, 0, 0);

  if (t < 1.0) {
    // Stage 0: Molecular Cloud Collapse (Jeans 1902 / JWST Pillars of Creation)
    const p = t;
    const jeansTelemetry = evaluateJeansTelemetry(1500.0, p);
    mass = 1500.0 * (1.0 - p * 0.98);
    jeansMass = jeansTelemetry.jeansMassSolarMasses;
    effectiveRsRatio = 0.0;
    starRadius = 0.0;
    effectiveTempK = jeansTelemetry.cloudTemperatureKelvin;
    radiusRsun = 500.0;
  } else if (t < 2.0) {
    // Stage 1: Protostar & Fusion Ignition (Kelvin-Helmholtz / MESA Pre-Main-Sequence)
    const p = t - 1.0;
    const protostarTelemetry = evaluateProtostarTelemetry(p);
    protostarCoreTemp = protostarTelemetry.coreTempKelvin;
    protostarIgnitionProgress = p;
    starRadius = protostarTelemetry.protostarRadiusRsun * 0.15;
    radiusRsun = protostarTelemetry.protostarRadiusRsun;
    effectiveTempK = 3000 + p * 29000;
    mass = 20.0;
    effectiveRsRatio = 0.0;
  } else if (t < 3.0) {
    // Stage 2: Massive Star (~20 M☉ OB Supergiant)
    const p = t - 2.0;
    starRadius = 1.0 - p * 0.3;
    mass = 20.0 - p * 2.0;
    diskTemperature = 12000;
    effectiveRsRatio = 0.0;
    centralDensity = 1.0e9 + p * 9.0e9;
    neutrinoLuminosity = 1.0e49 + p * 5.0e49;
    effectiveTempK = 35000 - p * 5000;
    radiusRsun = 12.0;
  } else if (t < 4.0) {
    // Stage 3: Core Collapse & Supernova (Two-beat GR1D/SNEC hydrodynamics)
    const p = t - 3.0;
    if (p < 0.3) {
      const pCore = p / 0.3;
      starRadius = 0.7 * (1.0 - pCore * 0.4);
      effectiveRsRatio = pCore * 0.5;
    } else {
      const pShock = (p - 0.3) / 0.7;
      starRadius = 0.7 * 0.6 * (1.0 - pShock);
      effectiveRsRatio = 0.5 + pShock * 0.5;
    }

    supernovaBlast = Math.sin(p * Math.PI);
    mass = 18.0 - p * 3.0;
    diskTemperature = 50000 * (1 - p);
    centralDensity = 1.0e10 * Math.pow(2.7e4, p);

    const bouncePeak = Math.exp(-Math.pow((p - 0.3) * 10.0, 2.0));
    neutrinoLuminosity = 1.0e50 + bouncePeak * 1.2e53;
    gwAmplitude = bouncePeak * 0.85;
    gwFrequency = 650.0;
    effectiveTempK = 50000;
    radiusRsun = 4.0;
  } else if (t < 5.0) {
    // Stage 4: Event Horizon Formation
    const p = t - 4.0;
    mass = 15.0;
    spin = p * 0.4;
    accretionRate = p * 1.0;
    diskTemperature = 3000 + p * 25000;
    jetIntensity = p * 0.8;
    effectiveRsRatio = 1.0;
    centralDensity = 1.0e15;
    neutrinoLuminosity = 1.0e51 * (1.0 - p * 0.9);
    effectiveTempK = diskTemperature;
    radiusRsun = 1.0;
  } else if (t < 6.0) {
    // Stage 5: Active Accretion & Growth
    const p = t - 5.0;
    mass = 30.0 + p * 30.0;
    spin = 0.4 + p * 0.35;
    accretionRate = 1.0 - p * 0.5;
    diskTemperature = 28000 - p * 10000;
    jetIntensity = 0.8 * (1.0 - p * 0.5);
    effectiveRsRatio = 1.0;
    centralDensity = 1.0e16;

    const orbitRadius = Math.max(0.1, (1.0 - p) * 4.0);
    const orbitAngle = p * Math.PI * 12.0;
    binaryOffset.set(
      Math.cos(orbitAngle) * orbitRadius,
      Math.sin(orbitAngle * 0.5) * 0.2,
      Math.sin(orbitAngle) * orbitRadius
    );

    gwAmplitude = Math.pow(p, 2.5);
    gwFrequency = 35.0 + Math.pow(p, 3.8) * 265.0;
    effectiveTempK = diskTemperature;
    radiusRsun = 1.0;
  } else if (t < 7.0) {
    // Stage 6: Binary Merger & Ringdown
    const p = t - 6.0;
    mass = 60.0;
    spin = 0.75;
    gwAmplitude = Math.max(0, Math.exp(-p * 6.0));
    gwFrequency = 300.0 * Math.exp(-p * 3.0);
    accretionRate = 0.5 * (1.0 - p * 0.9);
    diskTemperature = 18000 * (1.0 - p * 0.7);
    jetIntensity = 0.4 * (1.0 - p);
    effectiveRsRatio = 1.0;
    centralDensity = 1.0e16;
    effectiveTempK = diskTemperature;
    radiusRsun = 1.0;
  } else if (t < 8.0) {
    // Stage 7: Quiescence (Dormant Black Hole)
    const p = t - 7.0;
    mass = 60.0;
    spin = 0.75;
    accretionRate = 0.005;
    diskTemperature = 3000;
    jetIntensity = 0.0;
    effectiveRsRatio = 1.0;
    centralDensity = 1.0e16;
    effectiveTempK = 3000;
    radiusRsun = 1.0;
  } else {
    // Stage 8 & 9: Hawking Evaporation & Final Evaporation Burst
    const p = t - 8.0;
    const hawkingDecay = calculateHawkingDecay(60.0, p);
    mass = hawkingDecay.currentMass;
    spin = 0.75 * Math.cbrt(1.0 - p);
    accretionRate = 0.0;
    jetIntensity = 0.0;
    hawkingIntensity = 0.3 + Math.pow(p, 2.5) * 0.7;
    effectiveRsRatio = Math.max(0.001, hawkingDecay.currentMass / 60.0);
    centralDensity = 1.0e16;
    effectiveTempK = hawkingDecay.hawkingTempKelvin;
    radiusRsun = 0.1;

    if (p > 0.85) {
      supernovaBlast = (p - 0.85) * 6.6;
    }
  }

  const spectralClass = getSpectralClass(effectiveTempK);
  const radPressureRatio = calculateRadiationPressureRatio(centralDensity, effectiveTempK);
  const stellarLuminosity = calculateStellarLuminosityLsun(radiusRsun, effectiveTempK);

  return {
    mass,
    spin,
    accretionRate,
    diskTemperature,
    jetIntensity,
    gwAmplitude,
    gwFrequency,
    hawkingIntensity,
    supernovaBlast,
    starRadius,
    effectiveRsRatio,
    centralDensity,
    neutrinoLuminosity,
    jeansMass,
    protostarCoreTemp,
    protostarIgnitionProgress,
    spectralClass,
    radPressureRatio,
    stellarLuminosity,
    binaryOffset,
    stageIndex,
    stageProgress,
  };
}
