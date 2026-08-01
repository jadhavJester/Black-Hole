import React from 'react';
import { Sliders, Sparkles, Eye, Settings2, Globe } from 'lucide-react';
import { DraggablePanel } from './DraggablePanel';

interface ControlsPanelProps {
  massOverride: number | null;
  setMassOverride: (m: number | null) => void;
  spinOverride: number | null;
  setSpinOverride: (s: number | null) => void;
  accretionOverride: number | null;
  setAccretionOverride: (a: number | null) => void;
  raySteps: number;
  setRaySteps: (steps: number) => void;
  enableBloom: boolean;
  setEnableBloom: (b: boolean) => void;
  environmentIndex: number;
  setEnvironmentIndex: (idx: number) => void;
}

export const ENVIRONMENTS = [
  { id: 0, name: "Deep Star Field", file: "sky2.jpg" },
  { id: 1, name: "Cosmic Nebula", file: "cosmic.jpg" },
  { id: 2, name: "Galactic Center", file: "galaxybg.png" },
  { id: 3, name: "Orion Cluster", file: "sky1.jpg" },
];

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  massOverride,
  setMassOverride,
  spinOverride,
  setSpinOverride,
  accretionOverride,
  setAccretionOverride,
  raySteps,
  setRaySteps,
  enableBloom,
  setEnableBloom,
  environmentIndex,
  setEnvironmentIndex,
}) => {
  const headerTitle = (
    <div className="flex items-center gap-2">
      <Settings2 className="w-4 h-4 text-sky-400" />
      <span className="font-bold text-sky-300">PHYSICS & SHADER OVERRIDES</span>
    </div>
  );

  return (
    <DraggablePanel
      title={headerTitle}
      initialX={window.innerWidth - 370}
      initialY={16}
      initialWidth={350}
      minWidth={280}
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-sky-400" /> Live Override Controls
        </span>
        <button
          onClick={() => {
            setMassOverride(null);
            setSpinOverride(null);
            setAccretionOverride(null);
          }}
          className="text-[10px] font-mono text-sky-400 hover:underline"
        >
          Reset Overrides
        </button>
      </div>

      {/* Environment Selector */}
      <div className="flex flex-col gap-1.5 border-b border-slate-800 pb-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300 flex items-center gap-1.5 font-medium">
            <Globe className="w-3.5 h-3.5 text-sky-400" /> Astronomical Environment
          </span>
          <span className="font-mono text-sky-300 font-semibold text-[11px]">
            {ENVIRONMENTS[environmentIndex]?.name}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          {ENVIRONMENTS.map((env) => (
            <button
              key={env.id}
              onClick={() => setEnvironmentIndex(env.id)}
              className={`py-1.5 px-2 text-xs font-medium rounded-lg border transition-all truncate text-left ${
                environmentIndex === env.id
                  ? "bg-sky-500/20 text-sky-300 border-sky-500/50 font-bold"
                  : "bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700"
              }`}
            >
              {env.name}
            </button>
          ))}
        </div>
      </div>

      {/* Mass Override */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300">Black Hole Mass (M☉)</span>
          <span className="font-mono text-sky-300 font-semibold">
            {massOverride !== null ? `${massOverride.toFixed(1)} M☉ (Manual)` : "Auto (Timeline)"}
          </span>
        </div>
        <input
          type="range"
          min="0.5"
          max="100"
          step="0.5"
          value={massOverride ?? 30}
          onChange={(e) => setMassOverride(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
        />
      </div>

      {/* Spin Parameter Override */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300">Spin Parameter (a)</span>
          <span className="font-mono text-indigo-300 font-semibold">
            {spinOverride !== null ? spinOverride.toFixed(2) : "Auto (Timeline)"}
          </span>
        </div>
        <input
          type="range"
          min="0.0"
          max="0.99"
          step="0.01"
          value={spinOverride ?? 0.4}
          onChange={(e) => setSpinOverride(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
        />
      </div>

      {/* Accretion Disk Rate */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300">Accretion Rate</span>
          <span className="font-mono text-amber-300 font-semibold">
            {accretionOverride !== null ? `${(accretionOverride * 100).toFixed(0)}%` : "Auto (Timeline)"}
          </span>
        </div>
        <input
          type="range"
          min="0.0"
          max="1.0"
          step="0.01"
          value={accretionOverride ?? 0.8}
          onChange={(e) => setAccretionOverride(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
        />
      </div>

      {/* Ray Marching Quality Steps */}
      <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300 flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-emerald-400" /> Raymarching Steps
          </span>
          <span className="font-mono text-emerald-300 font-semibold">{raySteps} steps</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[48, 80, 128].map((steps) => (
            <button
              key={steps}
              onClick={() => setRaySteps(steps)}
              className={`py-1 text-xs font-mono rounded-lg border transition-all ${
                raySteps === steps
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold"
                  : "bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700"
              }`}
            >
              {steps === 48 ? "Fast (48)" : steps === 80 ? "Medium (80)" : "Ultra (128)"}
            </button>
          ))}
        </div>
      </div>

      {/* Bloom Toggle */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
        <span className="text-slate-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" /> Post-Processing Bloom
        </span>
        <button
          onClick={() => setEnableBloom(!enableBloom)}
          className={`px-3 py-1 font-mono text-xs rounded-lg border transition-all ${
            enableBloom
              ? "bg-sky-500/20 text-sky-300 border-sky-500/50 font-bold"
              : "bg-slate-900/60 text-slate-400 border-slate-800"
          }`}
        >
          {enableBloom ? "ENABLED" : "DISABLED"}
        </button>
      </div>
    </DraggablePanel>
  );
};
