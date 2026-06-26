import React, { useState, useEffect, useRef } from "react";
import { PlanetTelemetry } from "../types";
import { Info, HelpCircle, Activity, Globe, Compass, Minimize2, ZoomIn, ZoomOut, Sparkles } from "lucide-react";

// Planet telemetry catalog matching realistic JPL orbital standards
const PLANET_TELEMETRY: PlanetTelemetry[] = [
  {
    name: "Sun",
    distanceFromSunAU: 0,
    orbitalPeriodDays: 0,
    diameterKm: 1392700,
    surfaceTempC: 5500,
    currentVelocityKms: 0,
    moonsCount: 0,
    description: "The primary star of our solar system, comprising 99.8% of the system's total mass. Its energetic output drives stellar flares, coronal mass ejections, and the solar wind tracked by Orbitra's space weather systems.",
    coordinates: { x: 0, y: 0, z: 0 }
  },
  {
    name: "Mercury",
    distanceFromSunAU: 0.39,
    orbitalPeriodDays: 88,
    diameterKm: 4879,
    surfaceTempC: 167,
    currentVelocityKms: 47.4,
    moonsCount: 0,
    description: "The smallest and closest planet to the Sun. It experiences extreme thermal ranges (from -173C at night to 427C during the day) and possesses no atmosphere, leaving its cratered crust exposed to solar wind weathering.",
    coordinates: { x: 0, y: 0, z: 0 }
  },
  {
    name: "Venus",
    distanceFromSunAU: 0.72,
    orbitalPeriodDays: 224.7,
    diameterKm: 12104,
    surfaceTempC: 464,
    currentVelocityKms: 35.0,
    moonsCount: 0,
    description: "Wrapped in a dense, suffocating atmosphere of carbon dioxide, Venus experiences a runaway greenhouse effect, making it the hottest planetary surface in our system. Faint neon glow profiles are detected in its acidic cloud deck.",
    coordinates: { x: 0, y: 0, z: 0 }
  },
  {
    name: "Earth",
    distanceFromSunAU: 1.0,
    orbitalPeriodDays: 365.25,
    diameterKm: 12756,
    surfaceTempC: 15,
    currentVelocityKms: 29.8,
    moonsCount: 1,
    description: "Our home planet—the only world known to support life. Earth is shielded from solar storm flares by its powerful magnetosphere, channeling charged particles into spectacular polar aurora displays.",
    coordinates: { x: 0, y: 0, z: 0 }
  },
  {
    name: "Mars",
    distanceFromSunAU: 1.52,
    orbitalPeriodDays: 687,
    diameterKm: 6792,
    surfaceTempC: -65,
    currentVelocityKms: 24.1,
    moonsCount: 2,
    description: "The Red Planet. Mars is a cold, desert world with a thin CO2 atmosphere. NASA rovers actively crawl its basaltic plains, studying dry riverbeds, gigantic extinct volcanoes like Olympus Mons, and potential subterranean water ice.",
    coordinates: { x: 0, y: 0, z: 0 }
  },
  {
    name: "Jupiter",
    distanceFromSunAU: 5.2,
    orbitalPeriodDays: 4333,
    diameterKm: 142984,
    surfaceTempC: -110,
    currentVelocityKms: 13.1,
    moonsCount: 95,
    description: "A colossal gas giant, more than twice as massive as all other planets combined. Jupiter features fierce storm bands, a immense magnetosphere, and the legendary Great Red Spot—a massive hurricane active for centuries.",
    coordinates: { x: 0, y: 0, z: 0 }
  },
  {
    name: "Saturn",
    distanceFromSunAU: 9.58,
    orbitalPeriodDays: 10759,
    diameterKm: 120536,
    surfaceTempC: -140,
    currentVelocityKms: 9.7,
    moonsCount: 146,
    description: "The jewel of the solar system, famous for its magnificent ring system composed of billions of water ice and rock particles. Saturn's icy moon Enceladus harbors active geysers spraying liquid water into orbit.",
    coordinates: { x: 0, y: 0, z: 0 }
  },
  {
    name: "Uranus",
    distanceFromSunAU: 19.2,
    orbitalPeriodDays: 30687,
    diameterKm: 51118,
    surfaceTempC: -195,
    currentVelocityKms: 6.8,
    moonsCount: 28,
    description: "An ice giant rotating on an extreme 98-degree axial tilt, literally rolling around the Sun on its side. Its pale blue-green hue stems from atmospheric methane, which absorbs red sunlight.",
    coordinates: { x: 0, y: 0, z: 0 }
  },
  {
    name: "Neptune",
    distanceFromSunAU: 30.05,
    orbitalPeriodDays: 60190,
    diameterKm: 49528,
    surfaceTempC: -200,
    currentVelocityKms: 5.4,
    moonsCount: 16,
    description: "A dark, frozen ice giant subjected to the most violent winds in the solar system, reaching speeds up to 2,100 km/h. Powered by internal heat, Neptune features active storm vortex systems.",
    coordinates: { x: 0, y: 0, z: 0 }
  }
];

export default function SolarSystem3D() {
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetTelemetry>(PLANET_TELEMETRY[3]); // Earth default
  const [timeScale, setTimeScale] = useState(1); // multiplier
  const [showControlsInfo, setShowControlsInfo] = useState(true);

  // Rotation parameters
  const [pitch, setPitch] = useState(-0.6); // Angle looking down
  const [yaw, setYaw] = useState(0.4); // Left/right rotation
  const [zoom, setZoom] = useState(250); // Scale factor

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // For WASD Flight Controls (pans offset)
  const [offset, setOffset] = useState({ x: 0, y: 0, z: 0 });
  const offsetRef = useRef({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);

  // Handle keys for flying inside system (WASD/Arrows)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const step = 15;
      const key = e.key.toLowerCase();
      if (key === "w" || e.key === "ArrowUp") {
        setOffset(prev => ({ ...prev, y: prev.y + step }));
      } else if (key === "s" || e.key === "ArrowDown") {
        setOffset(prev => ({ ...prev, y: prev.y - step }));
      } else if (key === "a" || e.key === "ArrowLeft") {
        setOffset(prev => ({ ...prev, x: prev.x - step }));
      } else if (key === "d" || e.key === "ArrowRight") {
        setOffset(prev => ({ ...prev, x: prev.x + step }));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Mouse drag handles
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    setYaw(prev => prev + dx * 0.007);
    setPitch(prev => Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, prev + dy * 0.007)));

    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    setZoom(prev => Math.max(50, Math.min(800, prev - e.deltaY * 0.5)));
  };

  // Simulation Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const resizeObserver = new ResizeObserver(() => {
      if (canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = canvas.parentElement.clientHeight;
      }
    });
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    let angleMultiplier = 0;

    // Standard colors for outer ring orbits and planets
    const planetTheme: { [key: string]: { planetColor: string; orbitColor: string; size: number } } = {
      "Sun": { planetColor: "#FFA500", orbitColor: "rgba(255, 165, 0, 0.4)", size: 15 },
      "Mercury": { planetColor: "#A9A9A9", orbitColor: "rgba(169, 169, 169, 0.15)", size: 3.5 },
      "Venus": { planetColor: "#E6C280", orbitColor: "rgba(230, 194, 128, 0.15)", size: 5 },
      "Earth": { planetColor: "#40C4FF", orbitColor: "rgba(64, 196, 255, 0.25)", size: 5.5 },
      "Mars": { planetColor: "#FF6060", orbitColor: "rgba(255, 96, 96, 0.2)", size: 4.5 },
      "Jupiter": { planetColor: "#FFB400", orbitColor: "rgba(255, 180, 0, 0.15)", size: 10 },
      "Saturn": { planetColor: "#E2D3A1", orbitColor: "rgba(226, 211, 161, 0.15)", size: 8.5 },
      "Uranus": { planetColor: "#00FFCC", orbitColor: "rgba(0, 255, 204, 0.15)", size: 7 },
      "Neptune": { planetColor: "#7B5FFF", orbitColor: "rgba(123, 95, 255, 0.15)", size: 6.8 },
    };

    const render = () => {
      ctx.fillStyle = "#050A1A";
      ctx.fillRect(0, 0, width, height);

      // Advanced grid pattern behind solar system
      ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Increment orbital motion
      angleMultiplier += 0.01 * timeScale;

      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);

      // Projects 3D space vectors into 2D viewport screen coordinates
      const project = (x: number, y: number, z: number) => {
        // Apply flight manual offsets
        const xo = x + offsetRef.current.x * 0.1;
        const yo = y + offsetRef.current.y * 0.1;
        const zo = z + offsetRef.current.z * 0.1;

        // Apply 3D rotation matrix
        // Around Y axis (yaw)
        let x1 = xo * cosY - zo * sinY;
        let z1 = xo * sinY + zo * cosY;

        // Around X axis (pitch)
        let y2 = yo * cosP - z1 * sinP;
        let z2 = yo * sinP + z1 * cosP;

        // Perspective division factor
        const perspective = 1000 / (1000 + z2);
        return {
          x: width / 2 + x1 * zoom * perspective * 0.05,
          y: height / 2 + y2 * zoom * perspective * 0.05,
          depth: z2,
          visible: z2 > -1000
        };
      };

      // Draw planetary orbits first (to keep them underneath planets)
      PLANET_TELEMETRY.forEach(planet => {
        if (planet.name === "Sun") return;

        const theme = planetTheme[planet.name];
        const orbitalRadius = planet.distanceFromSunAU * 120; // Scale AU for visibility

        ctx.beginPath();
        ctx.strokeStyle = theme.orbitColor;
        ctx.lineWidth = 1;

        // Plot orbit ellipse in 3D
        const segments = 120;
        for (let i = 0; i <= segments; i++) {
          const theta = (i / segments) * Math.PI * 2;
          const px = Math.cos(theta) * orbitalRadius;
          const pz = Math.sin(theta) * orbitalRadius * 0.8; // subtle eccentricity
          const py = 0;

          const pt = project(px, py, pz);
          if (i === 0) {
            ctx.moveTo(pt.x, pt.y);
          } else {
            ctx.lineTo(pt.x, pt.y);
          }
        }
        ctx.stroke();
      });

      // Prepare list of objects to render, sorting by depth for perfect overlapping layers (painters algorithm)
      const renderQueue: {
        name: string;
        x: number;
        y: number;
        pt: { x: number; y: number; depth: number; visible: boolean };
        size: number;
        planetColor: string;
        isSun: boolean;
      }[] = [];

      // Render Sun in center
      const sunPt = project(0, 0, 0);
      renderQueue.push({
        name: "Sun",
        x: 0,
        y: 0,
        pt: sunPt,
        size: planetTheme["Sun"].size,
        planetColor: planetTheme["Sun"].planetColor,
        isSun: true
      });

      // Calculate and push planets
      PLANET_TELEMETRY.forEach(planet => {
        if (planet.name === "Sun") return;

        const orbitalRadius = planet.distanceFromSunAU * 120;
        // Faster orbital rates for inner planets (Keplers third law ratio)
        const periodFactor = 365.25 / planet.orbitalPeriodDays;
        const currentAngle = angleMultiplier * periodFactor;

        const px = Math.cos(currentAngle) * orbitalRadius;
        const pz = Math.sin(currentAngle) * orbitalRadius * 0.8;
        const py = 0;

        planet.coordinates = { x: px, y: py, z: pz }; // store coordinates

        const pt = project(px, py, pz);
        renderQueue.push({
          name: planet.name,
          x: px,
          y: pz,
          pt,
          size: planetTheme[planet.name].size,
          planetColor: planetTheme[planet.name].planetColor,
          isSun: false
        });
      });

      // Sort by depth (further objects first, closer objects overlap them)
      renderQueue.sort((a, b) => b.pt.depth - a.pt.depth);

      renderQueue.forEach(item => {
        if (!item.pt.visible) return;

        // Check if selected
        const isSelected = selectedPlanet.name === item.name;

        // Render glow filter
        if (item.isSun) {
          ctx.beginPath();
          const glow = ctx.createRadialGradient(item.pt.x, item.pt.y, 1, item.pt.x, item.pt.y, item.size * 3.5);
          glow.addColorStop(0, "rgba(255, 180, 0, 1)");
          glow.addColorStop(0.3, "rgba(255, 96, 0, 0.4)");
          glow.addColorStop(1, "rgba(255, 60, 0, 0)");
          ctx.fillStyle = glow;
          ctx.arc(item.pt.x, item.pt.y, item.size * 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Selected planet glowing beacon
        if (isSelected) {
          ctx.beginPath();
          ctx.strokeStyle = "#00FFCC";
          ctx.lineWidth = 1.5;
          ctx.arc(item.pt.x, item.pt.y, item.size + 10, 0, Math.PI * 2);
          ctx.stroke();

          // Animated tracking pulse ring
          ctx.beginPath();
          ctx.strokeStyle = "rgba(0, 255, 204, 0.3)";
          ctx.lineWidth = 1;
          const pulseRadius = item.size + 10 + (Math.sin(angleMultiplier * 3) * 6);
          ctx.arc(item.pt.x, item.pt.y, Math.max(item.size + 1, pulseRadius), 0, Math.PI * 2);
          ctx.stroke();
        }

        // Draw planet sphere
        ctx.beginPath();
        ctx.fillStyle = item.planetColor;
        ctx.arc(item.pt.x, item.pt.y, item.size, 0, Math.PI * 2);
        ctx.fill();

        // 3D light crescent shadow overlay
        if (!item.isSun) {
          // Darken the side facing away from the Sun
          const sunAngle = Math.atan2(item.pt.y - sunPt.y, item.pt.x - sunPt.x);
          ctx.beginPath();
          ctx.fillStyle = "rgba(0, 8, 20, 0.65)";
          ctx.arc(item.pt.x, item.pt.y, item.size, sunAngle - Math.PI / 2, sunAngle + Math.PI / 2);
          ctx.fill();
        }

        // Saturn rings projection
        if (item.name === "Saturn") {
          ctx.beginPath();
          ctx.strokeStyle = "rgba(226, 211, 161, 0.5)";
          ctx.lineWidth = 2.5;
          ctx.ellipse(item.pt.x, item.pt.y, item.size * 2, item.size * 0.4, -0.2, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Planet text label
        ctx.fillStyle = isSelected ? "#00FFCC" : "rgba(255, 255, 255, 0.7)";
        ctx.font = isSelected ? "bold 11px 'Space Mono'" : "9px 'Space Mono'";
        ctx.textAlign = "center";
        ctx.fillText(item.name.toUpperCase(), item.pt.x, item.pt.y - item.size - 6);

        // Subtext orbital speeds for Earth to feel alive
        if (isSelected && !item.isSun) {
          ctx.fillStyle = "rgba(0, 255, 204, 0.6)";
          ctx.font = "8px 'Space Mono'";
          ctx.fillText(`${PLANET_TELEMETRY.find(p => p.name === item.name)?.currentVelocityKms} KM/S`, item.pt.x, item.pt.y + item.size + 11);
        }
      });

      animId = requestAnimationFrame(render);
    };

    render();

    // Planet click selection handler
    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);

      // Re-evaluate current visual locations to detect click intersection
      for (let i = 0; i < PLANET_TELEMETRY.length; i++) {
        const planet = PLANET_TELEMETRY[i];
        let px = 0;
        let pz = 0;

        if (planet.name !== "Sun") {
          const orbitalRadius = planet.distanceFromSunAU * 120;
          const periodFactor = 365.25 / planet.orbitalPeriodDays;
          // Sync with render multiplier
          const currentAngle = angleMultiplier * periodFactor;
          px = Math.cos(currentAngle) * orbitalRadius;
          pz = Math.sin(currentAngle) * orbitalRadius * 0.8;
        }

        const xo = px + offsetRef.current.x * 0.1;
        const yo = offsetRef.current.y * 0.1;
        const zo = pz + offsetRef.current.z * 0.1;

        let x1 = xo * cosY - zo * sinY;
        let z1 = xo * sinY + zo * cosY;
        let y2 = yo * cosP - z1 * sinP;
        let z2 = yo * sinP + z1 * cosP;

        const perspective = 1000 / (1000 + z2);
        const screenX = width / 2 + x1 * zoom * perspective * 0.05;
        const screenY = height / 2 + y2 * zoom * perspective * 0.05;

        // Detect tap overlap
        const distance = Math.hypot(mouseX - screenX, mouseY - screenY);
        const radiusHit = Math.max(12, planetTheme[planet.name].size + 8);
        if (distance < radiusHit) {
          setSelectedPlanet(planet);
          break;
        }
      }
    };

    canvas.addEventListener("click", handleClick);

    return () => {
      resizeObserver.disconnect();
      canvas.removeEventListener("click", handleClick);
      cancelAnimationFrame(animId);
    };
  }, [pitch, yaw, zoom, timeScale, selectedPlanet]);

  return (
    <div id="solar-system-observer" className="relative w-full h-[520px] md:h-[620px] rounded-2xl overflow-hidden border border-white/5 glass-panel shadow-2xl">
      
      {/* 3D Canvas element */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Outer Hologram Overlay Labels */}
      <div className="absolute top-4 left-4 pointer-events-none flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-[#00FFCC] animate-spin-slow" />
          <h3 className="font-sans font-semibold text-lg tracking-wider text-slate-100">
            SOLAR OBSERVER <span className="text-xs font-mono text-[#00FFCC] px-2 py-0.5 rounded bg-[#00FFCC]/10 border border-[#00FFCC]/20">3D VECTOR</span>
          </h3>
        </div>
        <p className="text-xs font-mono text-slate-400">PITCH: {(pitch * 57.29).toFixed(0)}° / YAW: {(yaw * 57.29).toFixed(0)}°</p>
      </div>

      {/* Flight & Map Control actions */}
      <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setZoom(prev => Math.min(800, prev + 40))}
          className="p-2 rounded bg-slate-950/80 hover:bg-[#00FFCC]/20 border border-white/5 hover:border-[#00FFCC]/40 text-slate-300 transition-all cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(prev => Math.max(50, prev - 40))}
          className="p-2 rounded bg-slate-950/80 hover:bg-[#00FFCC]/20 border border-white/5 hover:border-[#00FFCC]/40 text-slate-300 transition-all cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setPitch(-0.6);
            setYaw(0.4);
            setZoom(250);
            setOffset({ x: 0, y: 0, z: 0 });
          }}
          className="px-3 py-2 rounded bg-slate-950/80 hover:bg-[#00FFCC]/20 border border-white/5 hover:border-[#00FFCC]/40 text-xs font-mono text-slate-300 tracking-wider transition-all cursor-pointer"
        >
          RESET CAMERA
        </button>

        {/* Orbit speed controller */}
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-950/80 border border-white/5 rounded">
          <span className="text-[10px] font-mono text-slate-400">TIME SCALE:</span>
          <button
            onClick={() => setTimeScale(1)}
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-all ${timeScale === 1 ? 'bg-[#00FFCC]/20 text-[#00FFCC]' : 'text-slate-400 hover:text-slate-200'}`}
          >
            1X
          </button>
          <button
            onClick={() => setTimeScale(5)}
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-all ${timeScale === 5 ? 'bg-[#00FFCC]/20 text-[#00FFCC]' : 'text-slate-400 hover:text-slate-200'}`}
          >
            5X
          </button>
          <button
            onClick={() => setTimeScale(15)}
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-all ${timeScale === 15 ? 'bg-[#00FFCC]/20 text-[#00FFCC]' : 'text-slate-400 hover:text-slate-200'}`}
          >
            15X
          </button>
        </div>
      </div>

      {/* Help info widget overlay */}
      <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2">
        <button
          onClick={() => setShowControlsInfo(!showControlsInfo)}
          className="p-2 rounded-full bg-slate-950/80 hover:bg-slate-900 border border-white/10 text-slate-400 hover:text-[#00FFCC] transition-all cursor-pointer"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {showControlsInfo && (
          <div className="p-3 max-w-[220px] rounded-lg bg-slate-950/95 border border-[#00FFCC]/20 text-[10px] text-slate-300 font-mono shadow-xl space-y-2 relative animate-fade-in">
            <button 
              onClick={() => setShowControlsInfo(false)}
              className="absolute top-1.5 right-1.5 text-slate-500 hover:text-slate-300"
            >
              <Minimize2 className="w-3 h-3" />
            </button>
            <p className="font-semibold text-[#00FFCC] text-xs">OBSERVATORY MANUAL</p>
            <ul className="space-y-1 text-slate-400">
              <li>• <span className="text-slate-200">Drag Mouse:</span> Rotate viewport</li>
              <li>• <span className="text-slate-200">Scroll:</span> Zoom in / out</li>
              <li>• <span className="text-slate-200">WASD keys:</span> Fly through system</li>
              <li>• <span className="text-slate-200">Click Planet:</span> Select telemetry</li>
            </ul>
          </div>
        )}
      </div>

      {/* Right Telemetry Sidebar Card */}
      <div className="absolute bottom-4 right-4 left-4 md:left-auto md:top-16 md:bottom-auto md:w-[320px] max-h-[85%] overflow-y-auto glass-panel border border-[#00FFCC]/20 rounded-xl p-4 shadow-xl z-10">
        <div className="flex items-start justify-between border-b border-white/10 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#00FFCC] animate-pulse" />
            <span className="text-xs font-mono text-[#00FFCC] tracking-widest font-semibold">COSMIC TELEMETRY</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">VECTOR LOCKED</span>
        </div>

        <div className="space-y-3">
          <div>
            <h4 className="font-sans font-bold text-2xl text-slate-100 tracking-wide">{selectedPlanet.name.toUpperCase()}</h4>
            <span className="text-[10px] font-mono text-[#00FFCC]/80 bg-[#00FFCC]/10 px-2 py-0.5 rounded border border-[#00FFCC]/20 mt-1 inline-block">
              {selectedPlanet.name === "Sun" ? "PRIMARY G-TYPE STAR" : `ORBIT: ${selectedPlanet.distanceFromSunAU} AU`}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">{selectedPlanet.description}</p>

          <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-3 font-mono text-[11px]">
            <div className="bg-white/2 p-2 rounded">
              <span className="text-slate-500 block text-[9px]">DIAMETER</span>
              <span className="text-slate-200 font-semibold">{selectedPlanet.diameterKm.toLocaleString()} km</span>
            </div>
            <div className="bg-white/2 p-2 rounded">
              <span className="text-slate-500 block text-[9px]">SURFACE TEMP</span>
              <span className="text-slate-200 font-semibold">{selectedPlanet.surfaceTempC > 0 ? '+' : ''}{selectedPlanet.surfaceTempC}°C</span>
            </div>
            <div className="bg-white/2 p-2 rounded">
              <span className="text-slate-500 block text-[9px]">ORBITAL PERIOD</span>
              <span className="text-slate-200 font-semibold">{selectedPlanet.orbitalPeriodDays ? `${selectedPlanet.orbitalPeriodDays.toLocaleString()} Days` : "N/A"}</span>
            </div>
            <div className="bg-white/2 p-2 rounded">
              <span className="text-slate-500 block text-[9px]">MOONS DETECTED</span>
              <span className="text-slate-200 font-semibold">{selectedPlanet.moonsCount}</span>
            </div>
          </div>

          {selectedPlanet.name !== "Sun" && (
            <div className="bg-[#00FFCC]/5 border border-[#00FFCC]/15 p-2 rounded flex items-center gap-2 mt-2">
              <Compass className="w-3.5 h-3.5 text-[#00FFCC]" />
              <span className="text-[9px] font-mono text-slate-300">
                VELOCITY: <strong className="text-[#00FFCC]">{selectedPlanet.currentVelocityKms} km/s</strong> (orbital velocity)
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
