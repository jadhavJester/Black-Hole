import React, { useState, useEffect, useRef } from 'react';
import { Scene } from './components/Scene';
import { DataPanel } from './components/DataPanel';
import { Timeline } from './components/Timeline';
import { ControlsPanel } from './components/ControlsPanel';
import { interpolatePhysicsState, PhysicsState } from './physics/schwarzschild';

export const App: React.FC = () => {
  // Timeline State: time ranges from 0.00 to 9.00 across 10 stages
  const [time, setTime] = useState<number>(0.0); // Start at Stage 1 (Molecular Cloud Collapse)
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(0.5);

  // Cinematic Tour Mode state
  const [isCinematicMode, setIsCinematicMode] = useState<boolean>(false);

  // Astronomical Environment Selection Index (0: Deep Star Field, 1: Cosmic Nebula, 2: Galactic Center, 3: Orion Cluster)
  const [environmentIndex, setEnvironmentIndex] = useState<number>(0);

  // Manual Overrides
  const [massOverride, setMassOverride] = useState<number | null>(null);
  const [spinOverride, setSpinOverride] = useState<number | null>(null);
  const [accretionOverride, setAccretionOverride] = useState<number | null>(null);

  // Performance & Rendering Settings
  const [raySteps, setRaySteps] = useState<number>(80);
  const [enableBloom, setEnableBloom] = useState<boolean>(true);

  // Calculate base physics state from timeline position
  const basePhysics = interpolatePhysicsState(time);

  // Apply manual overrides if set by user
  const physics: PhysicsState = {
    ...basePhysics,
    mass: massOverride !== null ? massOverride : basePhysics.mass,
    spin: spinOverride !== null ? spinOverride : basePhysics.spin,
    accretionRate: accretionOverride !== null ? accretionOverride : basePhysics.accretionRate,
  };

  // Timeline Auto-Advance Loop
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>();

  useEffect(() => {
    const advanceTimeline = (timestamp: number) => {
      if (lastTimeRef.current !== undefined && isPlaying) {
        const deltaSeconds = (timestamp - lastTimeRef.current) / 1000;
        setTime((prevTime) => {
          let nextTime = prevTime + deltaSeconds * 0.15 * speed;
          if (nextTime > 9.0) {
            nextTime = 0.0;
          }
          return nextTime;
        });
      }
      lastTimeRef.current = timestamp;
      requestRef.current = requestAnimationFrame(advanceTimeline);
    };

    if (isPlaying) {
      lastTimeRef.current = performance.now();
      requestRef.current = requestAnimationFrame(advanceTimeline);
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isPlaying, speed]);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none">
      {/* 3D Relativistic Scene Viewport */}
      <Scene
        physics={physics}
        raySteps={raySteps}
        enableBloom={enableBloom}
        environmentIndex={environmentIndex}
        isCinematicMode={isCinematicMode}
      />

      {/* Header Eyebrow Title */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none text-center">
        <h1 className="text-sm font-mono tracking-widest uppercase text-slate-300 font-bold bg-slate-900/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-800 shadow-xl">
          The Life of a Star: From Birth to Black Hole
        </h1>
      </div>

      {/* Relativistic Telemetry Readout & Scientific Citation Panel */}
      <DataPanel
        physics={physics}
        isCinematicMode={isCinematicMode}
        setIsCinematicMode={setIsCinematicMode}
      />

      {/* Live Physics & Shader Parameter Overrides */}
      <ControlsPanel
        massOverride={massOverride}
        setMassOverride={setMassOverride}
        spinOverride={spinOverride}
        setSpinOverride={setSpinOverride}
        accretionOverride={accretionOverride}
        setAccretionOverride={setAccretionOverride}
        raySteps={raySteps}
        setRaySteps={setRaySteps}
        enableBloom={enableBloom}
        setEnableBloom={setEnableBloom}
        environmentIndex={environmentIndex}
        setEnvironmentIndex={setEnvironmentIndex}
      />

      {/* Bottom Timeline Scrubber & Playback Controls */}
      <Timeline
        time={time}
        setTime={setTime}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        speed={speed}
        setSpeed={setSpeed}
      />
    </main>
  );
};

export default App;
