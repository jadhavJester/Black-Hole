import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

import { PhysicsState, calculateSchwarzschildRadiusKm } from '../physics/schwarzschild';
import { cosmicAudio } from '../physics/audio';

// Import GLSL shader strings
import blackholeVert from '../shaders/blackhole.vert.glsl';
import blackholeFrag from '../shaders/blackhole.frag.glsl';
import starVert from '../shaders/star.vert.glsl';
import collapseFrag from '../shaders/collapse.frag.glsl';
import gravwaveVert from '../shaders/gravwave.vert.glsl';
import gravwaveFrag from '../shaders/gravwave.frag.glsl';
import nebulaFrag from '../shaders/nebula.frag.glsl';
import protostarFrag from '../shaders/protostar.frag.glsl';

// Import astronomical skybox environment textures
import sky2Url from '../assets/sky2.jpg';
import cosmicUrl from '../assets/cosmic.jpg';
import galaxybgUrl from '../assets/galaxybg.png';
import sky1Url from '../assets/sky1.jpg';

interface SceneProps {
  physics: PhysicsState;
  raySteps: number;
  enableBloom: boolean;
  environmentIndex: number;
  isCinematicMode: boolean;
}

export const Scene: React.FC<SceneProps> = ({ physics, raySteps, enableBloom, environmentIndex, isCinematicMode }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const bloomPassRef = useRef<UnrealBloomPass | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // Loaded environment textures array
  const envTexturesRef = useRef<THREE.Texture[]>([]);

  // Shader materials & meshes
  const blackholeMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
  const starMeshRef = useRef<THREE.Mesh | null>(null);
  const starMaterialRef = useRef<THREE.ShaderMaterial | null>(null);

  const nebulaMeshRef = useRef<THREE.Mesh | null>(null);
  const nebulaMaterialRef = useRef<THREE.ShaderMaterial | null>(null);

  const protostarMeshRef = useRef<THREE.Mesh | null>(null);
  const protostarMaterialRef = useRef<THREE.ShaderMaterial | null>(null);

  const gravwaveMeshRef = useRef<THREE.Mesh | null>(null);
  const gravwaveMaterialRef = useRef<THREE.ShaderMaterial | null>(null);

  // Particle systems
  const hawkingParticlesRef = useRef<THREE.Points | null>(null);
  const ejectaParticlesRef = useRef<THREE.Points | null>(null);
  const solarWindParticlesRef = useRef<THREE.Points | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera setup - Inclined angle (y=3.5, z=17.0) to reveal Interstellar Gargantua 3D halo wrap-around!
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 3.5, 17);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      precision: "highp"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 3.0;
    controls.maxDistance = 120.0;
    controlsRef.current = controls;

    // 5. Postprocessing Bloom Composer
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      1.2, // strength
      0.4, // radius
      0.85 // threshold
    );
    bloomPassRef.current = bloomPass;
    composer.addPass(bloomPass);
    composerRef.current = composer;

    // Load astronomical environment textures
    const textureLoader = new THREE.TextureLoader();
    const urls = [sky2Url, cosmicUrl, galaxybgUrl, sky1Url];
    const loadedTextures = urls.map(url => {
      const tex = textureLoader.load(url);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      return tex;
    });
    envTexturesRef.current = loadedTextures;

    // 6. Black Hole Raymarching Quad Mesh
    const quadGeometry = new THREE.PlaneGeometry(2, 2);
    const inverseProjMat = new THREE.Matrix4();
    const inverseViewMat = new THREE.Matrix4();

    const blackholeMaterial = new THREE.ShaderMaterial({
      vertexShader: blackholeVert,
      fragmentShader: blackholeFrag,
      uniforms: {
        u_cameraPos: { value: new THREE.Vector3() },
        u_inverseProjectionMatrix: { value: inverseProjMat },
        u_inverseViewMatrix: { value: inverseViewMat },
        u_resolution: { value: new THREE.Vector2(width, height) },
        u_time: { value: 0 },
        u_skyTexture: { value: loadedTextures[environmentIndex] || loadedTextures[0] },
        u_rs: { value: 0.0 },
        u_accretionRate: { value: 0.0 },
        u_diskTemp: { value: 12000 },
        u_jetIntensity: { value: 0.0 },
        u_hawkingIntensity: { value: 0.0 },
        u_supernovaBlast: { value: 0.0 },
        u_spin: { value: 0.0 },
        u_binaryPos2: { value: new THREE.Vector3() },
        u_maxSteps: { value: raySteps },
      },
      depthWrite: false,
      depthTest: false,
    });
    blackholeMaterialRef.current = blackholeMaterial;

    const quadMesh = new THREE.Mesh(quadGeometry, blackholeMaterial);
    quadMesh.frustumCulled = false;
    scene.add(quadMesh);

    // 7. Stage 1 Molecular Cloud Volumetric Mesh
    const nebulaGeo = new THREE.SphereGeometry(6, 64, 64);
    const nebulaMaterial = new THREE.ShaderMaterial({
      vertexShader: starVert,
      fragmentShader: nebulaFrag,
      uniforms: {
        u_time: { value: 0 },
        u_collapseProgress: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    nebulaMaterialRef.current = nebulaMaterial;

    const nebulaMesh = new THREE.Mesh(nebulaGeo, nebulaMaterial);
    nebulaMesh.visible = false;
    nebulaMeshRef.current = nebulaMesh;
    scene.add(nebulaMesh);

    // 8. Stage 2 Protostar Ignition Mesh
    const protostarGeo = new THREE.SphereGeometry(1.5, 64, 64);
    const protostarMaterial = new THREE.ShaderMaterial({
      vertexShader: starVert,
      fragmentShader: protostarFrag,
      uniforms: {
        u_time: { value: 0 },
        u_ignitionProgress: { value: 0 },
      },
      transparent: true,
      depthWrite: true,
    });
    protostarMaterialRef.current = protostarMaterial;

    const protostarMesh = new THREE.Mesh(protostarGeo, protostarMaterial);
    protostarMesh.visible = false;
    protostarMeshRef.current = protostarMesh;
    scene.add(protostarMesh);

    // 9. Stage 3 & 4 Massive Star / Collapse Mesh
    const starGeo = new THREE.SphereGeometry(1, 64, 64);
    const starMaterial = new THREE.ShaderMaterial({
      vertexShader: starVert,
      fragmentShader: collapseFrag,
      uniforms: {
        u_time: { value: 0 },
        u_collapseProgress: { value: 0 },
      },
      transparent: true,
      depthWrite: true,
    });
    starMaterialRef.current = starMaterial;

    const starMesh = new THREE.Mesh(starGeo, starMaterial);
    starMesh.visible = false;
    starMeshRef.current = starMesh;
    scene.add(starMesh);

    // 10. Stage 7 Binary Merger Gravitational Wave Plane
    const gravGeo = new THREE.PlaneGeometry(60, 60, 128, 128);
    gravGeo.rotateX(-Math.PI / 2);
    const gravMaterial = new THREE.ShaderMaterial({
      vertexShader: gravwaveVert,
      fragmentShader: gravwaveFrag,
      uniforms: {
        u_time: { value: 0 },
        u_gwAmplitude: { value: 0 },
        u_gwFrequency: { value: 10.0 },
      },
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    gravwaveMaterialRef.current = gravMaterial;

    const gravMesh = new THREE.Mesh(gravGeo, gravMaterial);
    gravMesh.position.y = -0.5;
    gravMesh.visible = false;
    gravwaveMeshRef.current = gravMesh;
    scene.add(gravMesh);

    // 11. Solar Wind & Coronal Mass Ejection (CME) Plasma Particles (1,500 particles)
    const solarCount = 1500;
    const solarGeo = new THREE.BufferGeometry();
    const solarPos = new Float32Array(solarCount * 3);
    const solarVel = new Float32Array(solarCount * 3);

    for (let i = 0; i < solarCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 2.5 + Math.random() * 0.5;

      solarPos[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      solarPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      solarPos[i * 3 + 2] = r * Math.cos(phi);

      solarVel[i * 3 + 0] = Math.sin(phi) * Math.cos(theta) * (0.8 + Math.random() * 1.5);
      solarVel[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * (0.8 + Math.random() * 1.5);
      solarVel[i * 3 + 2] = Math.cos(phi) * (0.8 + Math.random() * 1.5);
    }

    solarGeo.setAttribute('position', new THREE.BufferAttribute(solarPos, 3));

    const solarMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.18,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });

    const solarWindParticles = new THREE.Points(solarGeo, solarMat);
    solarWindParticles.visible = false;
    solarWindParticlesRef.current = solarWindParticles;
    scene.add(solarWindParticles);

    // 12. Instanced Hawking Quantum Particle Emission System
    const particleCount = 1200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleVel = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 1.0 + Math.random() * 0.5;

      particlePos[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      particlePos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      particlePos[i * 3 + 2] = r * Math.cos(phi);

      particleVel[i * 3 + 0] = Math.sin(phi) * Math.cos(theta) * (0.5 + Math.random());
      particleVel[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * (0.5 + Math.random());
      particleVel[i * 3 + 2] = Math.cos(phi) * (0.5 + Math.random());
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.15,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const hawkingParticles = new THREE.Points(particleGeo, particleMat);
    hawkingParticles.visible = false;
    hawkingParticlesRef.current = hawkingParticles;
    scene.add(hawkingParticles);

    // 13. Supernova Explosive Ejecta Particle System
    const ejectaCount = 2500;
    const ejectaGeo = new THREE.BufferGeometry();
    const ejectaPos = new Float32Array(ejectaCount * 3);
    const ejectaVel = new Float32Array(ejectaCount * 3);

    for (let i = 0; i < ejectaCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const speed = 2.5 + Math.random() * 6.0;

      ejectaPos[i * 3 + 0] = 0;
      ejectaPos[i * 3 + 1] = 0;
      ejectaPos[i * 3 + 2] = 0;

      ejectaVel[i * 3 + 0] = Math.sin(phi) * Math.cos(theta) * speed;
      ejectaVel[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * speed;
      ejectaVel[i * 3 + 2] = Math.cos(phi) * speed;
    }

    ejectaGeo.setAttribute('position', new THREE.BufferAttribute(ejectaPos, 3));

    const ejectaMat = new THREE.PointsMaterial({
      color: 0xff6600,
      size: 0.25,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });

    const ejectaParticles = new THREE.Points(ejectaGeo, ejectaMat);
    ejectaParticles.visible = false;
    ejectaParticlesRef.current = ejectaParticles;
    scene.add(ejectaParticles);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
      if (blackholeMaterialRef.current) {
        blackholeMaterialRef.current.uniforms.u_resolution.value.set(w, h);
      }
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Update Audio Soundscape Engine
      cosmicAudio.updateStageAudio(physics.stageIndex, physics.stageProgress, physics.gwAmplitude, physics.gwFrequency);

      // Cinematic Tour Mode: Smooth documentary fly-through auto-orbit camera
      if (isCinematicMode && cameraRef.current) {
        const radius = 17.0 + Math.sin(elapsedTime * 0.25) * 3.0;
        const camX = Math.cos(elapsedTime * 0.12) * radius;
        const camZ = Math.sin(elapsedTime * 0.12) * radius;
        const camY = Math.sin(elapsedTime * 0.18) * 3.5 + 2.5;

        cameraRef.current.position.set(camX, camY, camZ);
        cameraRef.current.lookAt(0, 0, 0);
      } else {
        controls.update();
      }

      camera.updateMatrixWorld();
      camera.matrixWorldInverse.copy(camera.matrixWorld).invert();

      inverseProjMat.copy(camera.projectionMatrix).invert();
      inverseViewMat.copy(camera.matrixWorld);

      if (blackholeMaterialRef.current) {
        const u = blackholeMaterialRef.current.uniforms;
        u.u_cameraPos.value.copy(camera.position);
        u.u_inverseProjectionMatrix.value.copy(inverseProjMat);
        u.u_inverseViewMatrix.value.copy(inverseViewMat);
        u.u_time.value = elapsedTime;
      }

      if (nebulaMaterialRef.current) {
        nebulaMaterialRef.current.uniforms.u_time.value = elapsedTime;
      }

      if (protostarMaterialRef.current) {
        protostarMaterialRef.current.uniforms.u_time.value = elapsedTime;
      }

      if (starMaterialRef.current) {
        starMaterialRef.current.uniforms.u_time.value = elapsedTime;
      }

      if (gravwaveMaterialRef.current) {
        gravwaveMaterialRef.current.uniforms.u_time.value = elapsedTime;
      }

      // Update Solar Wind Plasma Flares in Stages 2 & 3
      if (solarWindParticlesRef.current && solarWindParticlesRef.current.visible) {
        const positions = solarWindParticlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < solarCount; i++) {
          positions[i * 3 + 0] += solarVel[i * 3 + 0] * 0.05;
          positions[i * 3 + 1] += solarVel[i * 3 + 1] * 0.05;
          positions[i * 3 + 2] += solarVel[i * 3 + 2] * 0.05;

          const dist = Math.sqrt(
            positions[i * 3 + 0] ** 2 +
            positions[i * 3 + 1] ** 2 +
            positions[i * 3 + 2] ** 2
          );

          if (dist > 12.0) {
            const u = Math.random();
            const v = Math.random();
            const theta = u * 2.0 * Math.PI;
            const phi = Math.acos(2.0 * v - 1.0);
            const r = 2.5;

            positions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);
          }
        }
        solarWindParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      if (hawkingParticlesRef.current && hawkingParticlesRef.current.visible) {
        const positions = hawkingParticlesRef.current.geometry.attributes.position.array as Float32Array;
        const currentRs = Math.max(0.1, calculateSchwarzschildRadiusKm(physics.mass) * 0.05);

        for (let i = 0; i < particleCount; i++) {
          positions[i * 3 + 0] += particleVel[i * 3 + 0] * 0.04;
          positions[i * 3 + 1] += particleVel[i * 3 + 1] * 0.04;
          positions[i * 3 + 2] += particleVel[i * 3 + 2] * 0.04;

          const dist = Math.sqrt(
            positions[i * 3 + 0] ** 2 +
            positions[i * 3 + 1] ** 2 +
            positions[i * 3 + 2] ** 2
          );

          if (dist > currentRs * 5.0) {
            const u = Math.random();
            const v = Math.random();
            const theta = u * 2.0 * Math.PI;
            const phi = Math.acos(2.0 * v - 1.0);
            const r = currentRs * 1.02;

            positions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);
          }
        }
        hawkingParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      if (ejectaParticlesRef.current && ejectaParticlesRef.current.visible) {
        const positions = ejectaParticlesRef.current.geometry.attributes.position.array as Float32Array;
        const p = physics.stageProgress;

        for (let i = 0; i < ejectaCount; i++) {
          positions[i * 3 + 0] = ejectaVel[i * 3 + 0] * p * 3.5;
          positions[i * 3 + 1] = ejectaVel[i * 3 + 1] * p * 3.5;
          positions[i * 3 + 2] = ejectaVel[i * 3 + 2] * p * 3.5;
        }
        ejectaParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      if (enableBloom && composerRef.current) {
        composerRef.current.render();
      } else {
        renderer.render(scene, camera);
      }
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update Active Skybox Environment Texture
  useEffect(() => {
    if (blackholeMaterialRef.current && envTexturesRef.current[environmentIndex]) {
      blackholeMaterialRef.current.uniforms.u_skyTexture.value = envTexturesRef.current[environmentIndex];
    }
  }, [environmentIndex]);

  // Update Shader Uniforms & Mesh Visibility across 10 Stages
  useEffect(() => {
    if (!blackholeMaterialRef.current) return;

    const baseRs = calculateSchwarzschildRadiusKm(physics.mass) * 0.05;
    const sceneRs = Math.max(0.0, Math.min(4.5, baseRs)) * physics.effectiveRsRatio;

    const u = blackholeMaterialRef.current.uniforms;
    u.u_rs.value = sceneRs;
    u.u_accretionRate.value = physics.accretionRate;
    u.u_diskTemp.value = physics.diskTemperature;
    u.u_jetIntensity.value = physics.jetIntensity;
    u.u_hawkingIntensity.value = physics.hawkingIntensity;
    u.u_supernovaBlast.value = physics.supernovaBlast;
    u.u_spin.value = physics.spin;
    u.u_binaryPos2.value.copy(physics.binaryOffset);
    u.u_maxSteps.value = raySteps;

    // Stage 0: Molecular Cloud Collapse
    if (nebulaMeshRef.current && nebulaMaterialRef.current) {
      if (physics.stageIndex === 0) {
        nebulaMeshRef.current.visible = true;
        nebulaMaterialRef.current.uniforms.u_collapseProgress.value = physics.stageProgress;
      } else {
        nebulaMeshRef.current.visible = false;
      }
    }

    // Stage 1: Protostar & Fusion Ignition
    if (protostarMeshRef.current && protostarMaterialRef.current) {
      if (physics.stageIndex === 1) {
        protostarMeshRef.current.visible = true;
        const pRadius = Math.max(0.2, physics.starRadius);
        protostarMeshRef.current.scale.set(pRadius, pRadius, pRadius);
        protostarMaterialRef.current.uniforms.u_ignitionProgress.value = physics.stageProgress;
      } else {
        protostarMeshRef.current.visible = false;
      }
    }

    // Stage 2: Massive Star & Solar Wind Plasma Flares
    if (solarWindParticlesRef.current) {
      if (physics.stageIndex === 1 || physics.stageIndex === 2) {
        solarWindParticlesRef.current.visible = true;
      } else {
        solarWindParticlesRef.current.visible = false;
      }
    }

    // Stage 2 & 3: Massive Star & Core Collapse
    if (starMeshRef.current && starMaterialRef.current) {
      if (physics.stageIndex === 2 || (physics.stageIndex === 3 && physics.starRadius > 0.01)) {
        starMeshRef.current.visible = true;
        const radiusScale = Math.max(0.1, physics.starRadius * 4.5);
        starMeshRef.current.scale.set(radiusScale, radiusScale, radiusScale);
        starMaterialRef.current.uniforms.u_collapseProgress.value = physics.stageProgress;
      } else {
        starMeshRef.current.visible = false;
      }
    }

    if (ejectaParticlesRef.current) {
      if (physics.stageIndex === 3) {
        ejectaParticlesRef.current.visible = true;
        (ejectaParticlesRef.current.material as THREE.PointsMaterial).opacity = Math.sin(physics.stageProgress * Math.PI) * 0.95;
      } else {
        ejectaParticlesRef.current.visible = false;
      }
    }

    if (gravwaveMeshRef.current && gravwaveMaterialRef.current) {
      if (physics.gwAmplitude > 0.005) {
        gravwaveMeshRef.current.visible = true;
        gravwaveMaterialRef.current.uniforms.u_gwAmplitude.value = physics.gwAmplitude;
        gravwaveMaterialRef.current.uniforms.u_gwFrequency.value = physics.gwFrequency;
      } else {
        gravwaveMeshRef.current.visible = false;
      }
    }

    if (hawkingParticlesRef.current) {
      if (physics.hawkingIntensity > 0.02) {
        hawkingParticlesRef.current.visible = true;
        (hawkingParticlesRef.current.material as THREE.PointsMaterial).opacity = Math.min(1.0, physics.hawkingIntensity * 1.5);
      } else {
        hawkingParticlesRef.current.visible = false;
      }
    }
  }, [physics, raySteps]);

  useEffect(() => {
    if (bloomPassRef.current) {
      bloomPassRef.current.enabled = enableBloom;
    }
  }, [enableBloom]);

  return <div ref={mountRef} className="w-full h-full absolute inset-0 z-0 bg-slate-950" />;
};
