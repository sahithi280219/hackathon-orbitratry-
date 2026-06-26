import { useState, useEffect } from "react";
import { NearEarthObject } from "../types";
import { AlertTriangle, ShieldCheck, Compass, Info, Radio, RefreshCw } from "lucide-react";

export default function NEOAlerts() {
  const [neos, setNeos] = useState<NearEarthObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchNEOs = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch("/api/neo");
      if (!res.ok) throw new Error("NEO server stream offline");
      const data = await res.json();
      setNeos(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError("Failed to sync NEO approaches");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNEOs();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[400px] flex flex-col items-center justify-center border border-white/5 rounded-2xl glass-panel text-slate-400 font-mono text-sm">
        <AlertTriangle className="w-8 h-8 text-[#FFB400] animate-bounce mb-3" />
        PLOTTING NEAR-EARTH ASTEROID VECTORS...
      </div>
    );
  }

  // Find the closest approaching asteroid today for prominent warning display
  const closestNEO = neos.length
    ? [...neos].sort((a, b) => a.missDistanceKm - b.missDistanceKm)[0]
    : null;

  return (
    <div id="near-earth-objects-observer" className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* Main Asteroids Vector List */}
      <div className="lg:col-span-2 rounded-2xl p-5 border border-white/5 glass-panel glow-gold flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#FFB400]" />
              <span className="text-xs font-mono font-semibold tracking-wider text-slate-300">NEAR-EARTH INTERSECTION LOG</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-[#FFB400] font-bold bg-[#FFB400]/10 border border-[#FFB400]/20 px-2 py-0.5 rounded">
                NASA NeoWs API
              </span>
              <button 
                onClick={fetchNEOs} 
                disabled={isRefreshing}
                className="text-slate-500 hover:text-[#00FFCC] transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#00FFCC]' : ''}`} />
              </button>
            </div>
          </div>

          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
            {neos.map(neo => (
              <div key={neo.id} className="p-3 bg-slate-950/40 rounded-xl border border-white/5 hover:border-[#FFB400]/30 transition-all grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                
                {/* Name & Magnitude */}
                <div className="md:col-span-1 space-y-1">
                  <h4 className="font-sans font-bold text-sm text-slate-200 truncate" title={neo.name}>{neo.name}</h4>
                  <span className="text-[10px] font-mono text-slate-500 block">MAGNITUDE: {neo.absoluteMagnitude} H</span>
                </div>

                {/* Diameter & Speed */}
                <div className="md:col-span-1 font-mono text-[11px] text-slate-300 space-y-1">
                  <div>
                    <span className="text-slate-500 text-[9px] block">EST. DIAMETER</span>
                    <span>{neo.estimatedDiameterKm.min.toFixed(2)} - {neo.estimatedDiameterKm.max.toFixed(2)} KM</span>
                  </div>
                </div>

                {/* Miss Distance & Close Approach */}
                <div className="md:col-span-1 font-mono text-[11px] text-slate-300 space-y-1">
                  <div>
                    <span className="text-slate-500 text-[9px] block">MISS DISTANCE</span>
                    <span className="text-[#00FFCC] font-bold">{(neo.missDistanceKm / 1000000).toFixed(2)}M km</span>
                  </div>
                </div>

                {/* Hazard Badge & Speed */}
                <div className="md:col-span-1 flex items-center md:justify-end gap-2">
                  <div className="text-right font-mono text-[11px] mr-2">
                    <span className="text-slate-500 text-[9px] block">VELOCITY</span>
                    <span className="text-slate-300">{(neo.velocityKmh / 3600).toFixed(1)} km/s</span>
                  </div>
                  {neo.isPotentiallyHazardous ? (
                    <span className="text-[9px] font-mono text-[#FF6060] bg-[#FF6060]/10 border border-[#FF6060]/30 px-2 py-1 rounded-md flex items-center gap-1 shrink-0 animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5" /> HAZARDOUS
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono text-[#00FFCC] bg-[#00FFCC]/10 border border-[#00FFCC]/20 px-2 py-1 rounded-md flex items-center gap-1 shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5" /> NOMINAL
                    </span>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Orbit Visualization Schematic (Earth vs Moon Orbit Approaches) */}
      <div className="lg:col-span-1 rounded-2xl p-5 border border-white/5 glass-panel glow-red flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#FF6060]" />
              <span className="text-xs font-mono font-semibold tracking-wider text-slate-300">INTERSECT SCHEMATIC</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">PROJECTION SCREEN</span>
          </div>

          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            Astrophysical plot representing approaches today relative to Earth-Moon orbit standards (1 Lunar Distance ≈ 384,400 km).
          </p>

          {/* Visual Canvas Plot */}
          <div className="relative w-full h-[180px] bg-slate-950/60 border border-white/10 rounded-xl overflow-hidden flex items-center justify-center p-2">
            
            {/* Center Earth */}
            <div className="absolute w-12 h-12 rounded-full bg-[#40C4FF]/20 border border-[#40C4FF]/50 flex items-center justify-center animate-pulse z-10">
              <span className="text-[8px] font-mono font-bold text-[#40C4FF]">EARTH</span>
            </div>

            {/* Moon Orbit Ring */}
            <div className="absolute w-24 h-24 rounded-full border border-dashed border-white/10 flex items-center justify-end pr-1">
              <span className="text-[6px] font-mono text-slate-600">384K km</span>
            </div>

            {/* Orbit paths for approaching NEOs */}
            {neos.slice(0, 3).map((neo, idx) => {
              // Map miss distance into a relative coordinate
              // 1 Lunar Distance (384k km) is r=48px, max scale to 120px for 5M km
              const maxScaleDist = 5000000;
              const ratio = Math.min(1, neo.missDistanceKm / maxScaleDist);
              const r = 30 + ratio * 55;
              const angle = (idx * (Math.PI / 1.5)) - 0.5;

              const x = Math.cos(angle) * r;
              const y = Math.sin(angle) * r;

              return (
                <div
                  key={neo.id}
                  style={{ transform: `translate(${x}px, ${y}px)` }}
                  className="absolute"
                >
                  {/* Glowing warning asteroid dot */}
                  <div className={`w-3 h-3 rounded-full flex items-center justify-center relative group ${
                    neo.isPotentiallyHazardous ? "bg-[#FF6060]" : "bg-[#FFB400]"
                  }`}>
                    {/* Ripple warning ring */}
                    {neo.isPotentiallyHazardous && (
                      <div className="absolute inset-0 rounded-full border border-[#FF6060] animate-ping" />
                    )}
                    {/* Hover detail tooltip */}
                    <span className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-950 border border-white/10 text-[7px] font-mono text-slate-300 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                      {neo.name} ({Math.round(neo.missDistanceKm / 1000).toLocaleString()}k km)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Closest Asteroid highlight */}
        {closestNEO && (
          <div className="p-3 bg-slate-950/40 border border-white/5 rounded-lg flex flex-col gap-1 mt-4">
            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block">CLOSEST INTERSECT RANGE</span>
            <div className="flex justify-between items-center text-xs">
              <span className="font-sans font-semibold text-slate-200 truncate max-w-[120px]">{closestNEO.name}</span>
              <strong className="font-mono text-[#FFB400]">{Math.round(closestNEO.missDistanceKm / 384400).toFixed(1)} LD</strong>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
