import React, { useState } from 'react';
import {
  STAGES,
  PhysicsState,
  calculateSchwarzschildRadiusKm,
  calculatePhotonSphereRadiusKm,
  calculateISCOKm,
  calculateHawkingTemperatureKelvin,
  calculateEvaporationLifetimeYears,
  formatScientific
} from '../physics/schwarzschild';
import { getMESACompositionShell } from '../physics/stellar-profile';
import { DraggablePanel } from './DraggablePanel';
import { cosmicAudio } from '../physics/audio';
import { Activity, AlertTriangle, Atom, Flame, Scale, Thermometer, ShieldAlert, Sparkles, Zap, Binary, Layers, Cloud, Sun, Compass, Gauge, Volume2, VolumeX, Video } from 'lucide-react';

interface DataPanelProps {
  physics: PhysicsState;
  isCinematicMode?: boolean;
  setIsCinematicMode?: (mode: boolean) => void;
}

export const DataPanel: React.FC<DataPanelProps> = ({ physics, isCinematicMode = false, setIsCinematicMode }) => {
  const [isMuted, setIsMuted] = useState<boolean>(true);

  const currentStage = STAGES[physics.stageIndex] || STAGES[0];
  const rsKm = calculateSchwarzschildRadiusKm(physics.mass);
  const rPhotonKm = calculatePhotonSphereRadiusKm(physics.mass);
  const rISCOKm = calculateISCOKm(physics.mass);
  const hawkingTempK = calculateHawkingTemperatureKelvin(physics.mass);
  const evapLifetimeYears = calculateEvaporationLifetimeYears(physics.mass);

  const mesaShell = getMESACompositionShell(physics.stageProgress);

  const handleAudioToggle = () => {
    const unMuted = cosmicAudio.toggleMute();
    setIsMuted(!unMuted);
  };

  const headerTitle = (
    <div className="flex items-center justify-between w-full pr-2">
      <div className="flex items-center gap-2">
        <Activity className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
        <span className="font-bold text-sky-300">STAGE {physics.stageIndex + 1} OF 10: {currentStage.name}</span>
      </div>

      <div className="flex items-center gap-1">
        {/* Audio Mute/Unmute Toggle Button */}
        <button
          onClick={handleAudioToggle}
          className={`p-1 rounded-lg border transition-all ${
            !isMuted
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
              : "bg-slate-800 text-slate-400 border-slate-700"
          }`}
          title={isMuted ? "Unmute Cosmic Audio" : "Mute Cosmic Audio"}
        >
          {!isMuted ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        {/* Cinematic Tour Camera Toggle Button */}
        {setIsCinematicMode && (
          <button
            onClick={() => setIsCinematicMode(!isCinematicMode)}
            className={`p-1 rounded-lg border transition-all ${
              isCinematicMode
                ? "bg-sky-500/20 text-sky-300 border-sky-500/50"
                : "bg-slate-800 text-slate-400 border-slate-700"
            }`}
            title={isCinematicMode ? "Exit Cinematic Fly-Through" : "Enable Cinematic Tour Mode"}
          >
            <Video className="w-3.5 h-3.5 text-sky-400" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <DraggablePanel
      title={headerTitle}
      initialX={16}
      initialY={16}
      initialWidth={380}
      minWidth={300}
      minHeight={200}
    >
      {/* Stage Header Info */}
      <div className="flex flex-col gap-1.5 pb-3 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-200">{currentStage.subtitle}</span>
          {currentStage.isTheoretical && (
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              Theoretical
            </span>
          )}
        </div>

        <p className="text-xs text-slate-400 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
          {currentStage.description}
        </p>

        <div className="flex items-start gap-1.5 text-[11px] text-slate-400 italic">
          <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
          <span><strong className="not-italic text-slate-300 font-medium">Calibrated Basis: </strong>{currentStage.citation}</span>
        </div>
      </div>

      {/* Live Physics Metrics HUD */}
      <div className="flex flex-col gap-2 text-xs">
        <h2 className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Relativistic & Stellar Telemetry</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </h2>

        {/* Mass */}
        <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-sky-400" /> Mass (M)
          </span>
          <span className="font-mono font-semibold text-slate-100">
            {physics.mass < 0.01 ? formatScientific(physics.mass) : physics.mass.toFixed(2)} M☉
          </span>
        </div>

        {/* Spectral Classification */}
        {physics.stageIndex <= 3 && (
          <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-indigo-400" /> Spectral Classification
            </span>
            <span className="font-mono font-semibold text-indigo-300">
              {physics.spectralClass}
            </span>
          </div>
        )}

        {/* Stellar Luminosity */}
        {physics.stageIndex <= 3 && (
          <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-400" /> Luminosity (L)
            </span>
            <span className="font-mono font-semibold text-amber-300">
              {formatScientific(physics.stellarLuminosity)} L☉
            </span>
          </div>
        )}

        {/* Radiation Pressure Ratio P_rad / P_total */}
        {physics.stageIndex <= 3 && (
          <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-rose-400" /> Radiation Pressure (P<sub className="text-[9px]">rad</sub>/P<sub className="text-[9px]">tot</sub>)
            </span>
            <span className="font-mono font-semibold text-rose-300">
              {(physics.radPressureRatio * 100).toFixed(1)}%
            </span>
          </div>
        )}

        {/* Stage 1 Jeans Mass Threshold */}
        {physics.stageIndex === 0 && (
          <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Cloud className="w-3.5 h-3.5 text-amber-400" /> Jeans Mass (M<sub className="text-[9px]">J</sub>)
            </span>
            <span className="font-mono font-semibold text-amber-300">
              {formatScientific(physics.jeansMass)} M☉
            </span>
          </div>
        )}

        {/* Stage 2 Protostar Core Temperature */}
        {physics.stageIndex === 1 && (
          <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-rose-400" /> Core Temp (T<sub className="text-[9px]">core</sub>)
            </span>
            <span className="font-mono font-semibold text-rose-300">
              {formatScientific(physics.protostarCoreTemp)} K
            </span>
          </div>
        )}

        {/* MESA Stellar Progenitor Composition Shell (Stage 3) */}
        {physics.stageIndex === 2 && (
          <div className="flex items-center justify-between py-1 border-b border-slate-800/50 bg-sky-950/30 px-2 rounded-lg border border-sky-800/40">
            <span className="text-slate-300 flex items-center gap-1.5 font-medium">
              <Layers className="w-3.5 h-3.5 text-sky-400" /> MESA Layer
            </span>
            <span className="font-mono font-bold" style={{ color: mesaShell.colorHex }}>
              {mesaShell.element} ({mesaShell.symbol})
            </span>
          </div>
        )}

        {/* Central Core Density */}
        {physics.stageIndex >= 2 && physics.stageIndex <= 3 && (
          <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Binary className="w-3.5 h-3.5 text-orange-400" /> Core Density (ρ<sub className="text-[9px]">c</sub>)
            </span>
            <span className="font-mono font-semibold text-orange-300">
              {formatScientific(physics.centralDensity)} g/cm³
            </span>
          </div>
        )}

        {/* Neutrino Burst Luminosity */}
        {physics.stageIndex >= 2 && physics.stageIndex <= 3 && (
          <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Neutrino Burst (L<sub className="text-[9px]">ν</sub>)
            </span>
            <span className="font-mono font-semibold text-amber-300">
              {formatScientific(physics.neutrinoLuminosity)} erg/s
            </span>
          </div>
        )}

        {/* Schwarzschild Radius */}
        <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Atom className="w-3.5 h-3.5 text-indigo-400" /> Horizon Radius (r<sub className="text-[9px]">s</sub>)
          </span>
          <span className="font-mono font-semibold text-sky-300">
            {physics.effectiveRsRatio > 0 ? `${formatScientific(rsKm)} km` : "Pre-Collapse (0.0 km)"}
          </span>
        </div>

        {/* Photon Ring Radius */}
        <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400" /> Photon Sphere (1.5 r<sub className="text-[9px]">s</sub>)
          </span>
          <span className="font-mono font-semibold text-amber-300">
            {physics.effectiveRsRatio > 0 ? `${formatScientific(rPhotonKm)} km` : "Pre-Collapse (0.0 km)"}
          </span>
        </div>

        {/* ISCO */}
        <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-purple-400" /> ISCO Inner Disk (3.0 r<sub className="text-[9px]">s</sub>)
          </span>
          <span className="font-mono font-semibold text-purple-300">
            {physics.effectiveRsRatio > 0 ? `${formatScientific(rISCOKm)} km` : "Pre-Collapse (0.0 km)"}
          </span>
        </div>

        {/* Hawking Temperature */}
        <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Thermometer className="w-3.5 h-3.5 text-rose-400" /> Hawking Temp (T<sub className="text-[9px]">H</sub>)
          </span>
          <span className="font-mono font-semibold text-rose-300">
            {formatScientific(hawkingTempK)} K
          </span>
        </div>

        {/* Evaporation Lifetime */}
        <div className="flex items-center justify-between py-1">
          <span className="text-slate-400 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" /> Evaporation Lifetime
          </span>
          <span className="font-mono font-semibold text-emerald-300">
            {physics.mass <= 0.0001 ? "< 1 sec (Terminal Burst)" : `${formatScientific(evapLifetimeYears)} yrs`}
          </span>
        </div>
      </div>
    </DraggablePanel>
  );
};
