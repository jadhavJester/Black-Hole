# 🌌 Scientifically Grounded 3D Life Cycle: Star Birth → Black Hole Death

An interactive, real-time 3D simulation of a star's complete 10-stage evolutionary journey—from a cold giant molecular cloud collapsing under Jeans instability to protostar fusion ignition, massive star evolution, core collapse supernova, event horizon formation, active accretion, binary inspiral merger, quiescence, and theoretical Hawking evaporation.

Built with **Three.js (r160+)**, **React**, **Vite**, **Tailwind CSS**, **Lucide Icons**, **Web Audio API**, and **custom GLSL fragment shaders** integrating curved spacetime geodesics in the **Kerr and Schwarzschild metrics** using **4th-Order Runge-Kutta (RK4) numerical integration**.

---

## 🌟 Key Visual & Astrophysics Features

- **3D Relativistic Ray-Lensing & Gargantua Halo Wrap-Around**: Accretion disk rays curve above and below the Kerr event horizon in 3D spacetime, producing the iconic *Interstellar* (Gargantua) and Event Horizon Telescope (EHT M87* / Sgr A*) halo wrap-around arcs.
- **Relativistic Doppler Beaming ($I_{obs} \propto \delta^4$)**: 4th-power intensity scaling law based on per-fragment 3D Keplerian orbital velocity $v(r) = c \sqrt{\frac{r_s}{2r}}$, showing distinct blue-shifted brightness on approaching disk material.
- **Kerr Spin & Dynamic ISCO (Bardeen-Press-Teukolsky 1972)**: Dynamic Kerr horizon $r_+ = M + \sqrt{M^2 - a^2}$ and spin-dependent ISCO radius ($r_{isco} = 3.0 r_s$ for $a=0$ down to $0.97 r_s$ for $a=0.95$). Shadow deforms into a flattened D-shape.
- **JWST Pillars of Creation Volumetric Cloud**: Stage 1 volumetric molecular cloud shader calibrated against JWST NIRCam M16 Eagle Nebula imagery.
- **MESA Progenitor Shell Structure**: Stage 3 massive OB supergiant onion-shell fusion structure ($Fe \to Si \to O \to C \to He \to H$).
- **GR1D / SNEC Two-Beat Core Collapse**: Sub-second iron core implosion to nuclear saturation density ($2.7 \times 10^{14} \text{ g/cm}^3$) followed by rebound shockwave expansion and $1.2 \times 10^{53} \text{ erg/s}$ neutrino burst.
- **LIGO GW150914 Strain Audio Chirp**: Binary merger stage features an exponential frequency chirp ($35 \text{ Hz} \to 300 \text{ Hz}$) matching LIGO open science strain data.
- **Web Audio API Procedural Cosmic Soundscapes**: Pure Web Audio API synthesis generating real-time stage-synchronized audio (sub-bass drones, solar wind noise, supernova booms, LIGO audio chirps, and Hawking radiation hiss).
- **Draggable, Resizable & Minimizable UI Consoles**: Telemetry HUD, Physics Overrides, and Timeline Bar can be freely moved, resized, or minimized anywhere on screen.
- **Cinematic Auto-Orbit Tour Mode**: Smooth documentary fly-through camera mode orbiting the 3D scene.

---

## 🔬 10-Stage Astrophysics Calibration Matrix

| Stage | Life-Cycle Stage | Primary Astrophysics Reference / Dataset | Physical Mechanism & Visual Model | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Stage 1** | **Molecular Cloud Collapse** | **Jeans Instability (Jeans 1902); JWST NIRCam Eagle Nebula (Pillars of Creation / M16)** | Cold (~15 K) giant molecular cloud exceeds Jeans mass $M_J \approx \left(\frac{5kT}{G\mu m_H}\right)^{3/2} \left(\frac{3}{4\pi\rho}\right)^{1/2}$, triggering turbulent density fragmentation into stellar clumps. Volumetric JWST-calibrated near-infrared cloud shader. | **Calibrated Reference** |
| **Stage 2** | **Protostar & Fusion Ignition** | **Kelvin-Helmholtz Contraction; MESA Pre-Main-Sequence Evolutionary Tracks** | Gravitational contraction heats protostar core to $T_{core} \approx 10^7 \text{ K}$, igniting CNO cycle hydrogen fusion in a brilliant flash transition into hydrostatic equilibrium. | **Calibrated Reference** |
| **Stage 3** | **Massive Star** | **MESA (Modules for Experiments in Stellar Astrophysics)** (`mesa.sourceforge.net`) | MESA ~20 M☉ progenitor density & temperature radial profiles ($Fe \to Si \to O \to C \to He \to H$). OB supergiant convective granules & limb darkening. | **Calibrated Reference** |
| **Stage 4** | **Core Collapse & Supernova** | **GR1D & SNEC** (`stellarcollapse.org`) | Two-beat general relativistic core collapse hydrodynamics. Sub-second core implosion to nuclear saturation ($\rho_c \approx 2.7 \times 10^{14} \text{ g/cm}^3$) followed by slower shockwave propagation, $1.2 \times 10^{53} \text{ erg/s}$ neutrino burst & prolate tidal elongation. | **Calibrated Reference** |
| **Stage 5** | **Event Horizon Formation** | **General Relativity (Oppenheimer-Snyder Collapse 1939)** | Mass compresses within Schwarzschild radius $r_s = \frac{2GM}{c^2}$. Light is trapped, creating the dark event horizon shadow and photon sphere ($r = 1.5 r_s$). | **Exact Relativistic Model** |
| **Stage 6** | **Active Accretion & Growth** | **Event Horizon Telescope (EHT 2019 M87* / 2022 Sgr A*) & iharm3D / HARM** | Keplerian orbital velocity $v = \sqrt{GM/r}$, 4th-power relativistic Doppler beaming ($I \propto \delta^4$), Planckian blackbody radiance, domain-warped shear turbulence, and polar jets. | **Calibrated to EHT Data** |
| **Stage 7** | **Binary Inspiral & Merger** | **LIGO/Virgo Collaboration (GW150914 Strain Data)** | Two-body orbital mechanics of dual event horizons accompanied by quadrupole gravitational wave strain chirp $f(t) \propto (t_{merger}-t)^{-3/8}$ matching GW150914 strain data (`gwosc.org`) and ringdown decay. | **Calibrated to LIGO Data** |
| **Stage 8** | **Quiescence** | **Kerr / Schwarzschild Metric Geodesic Integration** | Dormant black hole with accretion $< 0.5\%$, no jets, pristine Kerr shadow, and pure RK4 background starfield lensing. | **Exact Relativistic Model** |
| **Stage 9** | **Hawking Evaporation** | **Hawking Analytic Formula ($T_H = \frac{\hbar c^3}{8 \pi G M k_B}$)** | Quantum vacuum pair production at the horizon. Live mass decay $M(t) = (M_0^3 - 3 \alpha t)^{1/3}$ drives actual horizon shrinkage in real time. | ⚠️ **Theoretical Prediction (Unobserved)** |
| **Stage 10** | **Final Evaporation Burst** | **Theoretical Quantum Gravity End-States** | Runaway mass collapse to Planck scale ($M \to 0$), terminal temperature spike ($T \to 10^{32} \text{ K}$), and gamma-ray burst explosion. | ⚠️ **Theoretical Prediction (Unobserved)** |

---

## 🛠️ Project Architecture

```
/src
  /shaders
    blackhole.vert.glsl      (Screen quad vertex shader)
    blackhole.frag.glsl      (Kerr RK4 geodesic solver, thin photon rings, Gargantua 3D halo wrap, lensed background)
    disk.frag.glsl           (Keplerian velocity, relativistic Doppler beaming ∝ δ⁴, turbulent noise)
    collapse.frag.glsl       (Two-beat core collapse & shock propagation timing from GR1D/SNEC)
    gravwave.frag.glsl       (Quadrupole strain displacement shaped by GW150914 waveform)
    nebula.frag.glsl         (Volumetric JWST Pillars of Creation molecular cloud)
    protostar.frag.glsl      (Kelvin-Helmholtz contraction & CNO fusion ignition flash)
  /physics
    schwarzschild.ts         (10-stage timeline interpolator & Schwarzschild equations)
    stellar-profile.ts       (MESA ~20 M☉ progenitor shell structure & Morgan-Keenan spectral classes)
    kerr.ts                  (Kerr horizon r_+, Kerr ISCO radius, frame-dragging parameter)
    hawking.ts               (Hawking temperature T_H & live mass decay)
    jeans.ts                 (Jeans mass threshold M_J & free-fall time t_ff)
    preMainSequence.ts       (Kelvin-Helmholtz contraction curve & CNO core ignition)
    audio.ts                 (Web Audio API procedural cosmic soundscapes & LIGO audio chirp)
  /components
    Scene.tsx                (Three.js viewport, nebula cloud, protostar ignition & bloom setup)
    Timeline.tsx             (10 stage markers, continuous range scrubber, play/pause controls)
    DataPanel.tsx            (MESA, Jeans & StellarCollapse.org live telemetry HUD & citations)
    ControlsPanel.tsx        (Astronomical environment selector & live parameter overrides)
    DraggablePanel.tsx       (Reusable draggable, resizable & minimizable console container)
  App.tsx                    (App shell and state management)
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation & Local Run

```bash
# Clone repository
git clone https://github.com/jadhavJester/Black-Hole.git
cd Black-Hole

# Install dependencies
npm install

# Start Vite local development server
npm run dev
```

Open your browser and navigate to `http://localhost:3000/`.

### Building for Production

```bash
npm run build
```

---

## 📜 Credits & Citation References

- **MESA**: Modules for Experiments in Stellar Astrophysics (`mesa.sourceforge.net`)
- **StellarCollapse.org**: GR1D & SNEC Hydrodynamics (`stellarcollapse.org`)
- **Event Horizon Telescope (EHT)**: 2019 M87* and 2022 Sagittarius A* images (`eventhorizontelescope.org`)
- **LIGO Open Science Center**: GW150914 Strain Data (`gwosc.org`)
- **NASA / JWST**: NIRCam M16 Eagle Nebula (Pillars of Creation) imagery
- **Bardeen, Press, & Teukolsky (1972)**: Kerr metric ISCO astrophysics
- **Stephen Hawking (1974)**: Quantum black hole evaporation
- **CosmicStudio**: `github.com/bayramkotan/CosmicStudio`
- **Low-High-Mass-Star-Evolution**: `github.com/axr6077/Low-High-Mass-Star-Evolution`
