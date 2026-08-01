import React from 'react';
import { STAGES } from '../physics/schwarzschild';
import { DraggablePanel } from './DraggablePanel';
import { Play, Pause, RotateCcw, FastForward, Gauge, Film } from 'lucide-react';

interface TimelineProps {
  time: number;
  setTime: (t: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  speed: number;
  setSpeed: (s: number) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  time,
  setTime,
  isPlaying,
  setIsPlaying,
  speed,
  setSpeed,
}) => {
  const currentStageIndex = Math.floor(Math.max(0, Math.min(9, time)));

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTime(parseFloat(e.target.value));
  };

  const handleStageClick = (index: number) => {
    setTime(index);
  };

  const speedOptions = [0.25, 0.5, 1, 2, 5, 10];

  const defaultX = Math.max(16, (window.innerWidth - 920) / 2);
  const defaultY = Math.max(100, window.innerHeight - 195);

  const headerTitle = (
    <div className="flex items-center gap-2">
      <Film className="w-4 h-4 text-sky-400" />
      <span className="font-bold text-sky-300">LIFE-CYCLE TIMELINE CONSOLE (10 STAGES)</span>
    </div>
  );

  return (
    <DraggablePanel
      title={headerTitle}
      initialX={defaultX}
      initialY={defaultY}
      initialWidth={920}
      minWidth={380}
    >
      {/* Playback Controls & Speed Selectors */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition-all shadow-lg shadow-sky-500/20 active:scale-95"
            title={isPlaying ? "Pause Timeline" : "Play Timeline"}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          <button
            onClick={() => { setTime(0); setIsPlaying(false); }}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700"
            title="Reset Timeline to Start"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono text-slate-300">
            <Gauge className="w-3.5 h-3.5 text-sky-400" />
            <span>Time: <strong className="text-white font-bold">{time.toFixed(2)}</strong> / 9.00</span>
          </div>
        </div>

        {/* Speed Selector Buttons */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <span className="text-[10px] font-mono uppercase text-slate-400 px-2 flex items-center gap-1">
            <FastForward className="w-3 h-3" /> Speed
          </span>
          {speedOptions.map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-2 py-0.5 text-xs font-mono rounded-lg transition-all ${
                speed === s
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* 10 Stage Markers Jump Bar */}
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-1 text-center">
        {STAGES.map((stg) => {
          const isActive = currentStageIndex === stg.id;
          return (
            <button
              key={stg.id}
              onClick={() => handleStageClick(stg.id)}
              className={`p-1.5 rounded-xl text-left flex flex-col gap-0.5 border transition-all duration-200 ${
                isActive
                  ? "bg-sky-500/15 border-sky-400/60 shadow-lg shadow-sky-500/10"
                  : stg.isTheoretical
                  ? "bg-slate-900/40 border-amber-500/20 hover:border-amber-500/40"
                  : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className={`text-[9px] font-mono font-bold ${isActive ? "text-sky-400" : "text-slate-400"}`}>
                  S{stg.id + 1}
                </span>
                {stg.isTheoretical && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Theoretical Prediction" />
                )}
              </div>
              <span className={`text-[10px] font-medium truncate ${isActive ? "text-white font-semibold" : "text-slate-300"}`}>
                {stg.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Continuous Drag Scrubber Range Slider */}
      <div className="relative w-full pt-1">
        <input
          type="range"
          min="0"
          max="9"
          step="0.001"
          value={time}
          onChange={handleSliderChange}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400 focus:outline-none"
        />
      </div>
    </DraggablePanel>
  );
};
