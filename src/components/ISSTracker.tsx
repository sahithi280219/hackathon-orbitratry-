import { useState, useEffect } from "react";
import { ISSData } from "../types";
import { Navigation, Users, Globe, Radar, MapPin, Radio, Compass, RefreshCw } from "lucide-react";

export default function ISSTracker() {
  const [issData, setIssData] = useState<ISSData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pathHistory, setPathHistory] = useState<{ lat: number; lng: number }[]>([]);

  const fetchISS = async () => {
    try {
      const res = await fetch("/api/iss");
      if (!res.ok) throw new Error("Telemetry channel offline");
      const data: ISSData = await res.json();
      setIssData(data);
      
      // Store trace path
      setPathHistory(prev => {
        const next = [...prev, { lat: data.latitude, lng: data.longitude }];
        if (next.length > 50) next.shift(); // Keep only last 50 readings
        return next;
      });
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError("ISS telemetry stream interrupted");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchISS();
    // Poll ISS position coordinates every 3 seconds to keep it live
    const interval = setInterval(fetchISS, 3000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[400px] flex flex-col items-center justify-center border border-white/5 rounded-2xl glass-panel text-slate-400 font-mono text-sm">
        <Radar className="w-8 h-8 text-[#00FFCC] animate-spin mb-3" />
        ESTABLISHING ORBITAL TELEMETRY INTERFACE FOR ISS MS-25...
      </div>
    );
  }

  const data = issData!;

  // Map coordinates to 2D vector graphic coordinates (Mercator scaling for container)
  const mapWidth = 600;
  const mapHeight = 300;
  const getXY = (lat: number, lng: number) => {
    const x = ((lng + 180) / 360) * mapWidth;
    // Simple Mercator-like projection
    const y = ((90 - lat) / 180) * mapHeight;
    return { x, y };
  };

  const issPos = getXY(data.latitude, data.longitude);

  return (
    <div id="iss-radar-tracker" className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* ISS Vector Orbit Map & Radar Panel */}
      <div className="lg:col-span-2 rounded-2xl p-5 border border-white/5 glass-panel glow-cyan flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Radar className="w-4 h-4 text-[#00FFCC] animate-pulse" />
            <span className="text-xs font-mono font-semibold tracking-wider text-slate-300">GROUND TRACK ORBITAL RESOLVER</span>
          </div>
          <span className="text-[10px] font-mono text-[#00FFCC] font-bold bg-[#00FFCC]/10 border border-[#00FFCC]/20 px-2 py-0.5 rounded">
            LIVE SIGNAL LOCKED
          </span>
        </div>

        {/* Live Vector Map */}
        <div className="relative w-full h-[320px] bg-slate-950/60 border border-white/5 rounded-xl overflow-hidden my-4 flex items-center justify-center">
          
          {/* Subtle Grid backdrop */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />

          {/* Simple Vector Map Outline Overlay */}
          <svg className="absolute w-full h-full p-2" viewBox={`0 0 ${mapWidth} ${mapHeight}`} preserveAspectRatio="xMidYMid meet">
            {/* Equator line */}
            <line x1="0" y1={mapHeight / 2} x2={mapWidth} y2={mapHeight / 2} stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" strokeDasharray="3,3" />
            {/* Prime Meridian */}
            <line x1={mapWidth / 2} y1="0" x2={mapWidth / 2} y2={mapHeight} stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" strokeDasharray="3,3" />

            {/* Orbit trace path */}
            {pathHistory.length > 1 && (
              <polyline
                fill="none"
                stroke="rgba(0, 255, 204, 0.35)"
                strokeWidth="1.5"
                strokeDasharray="4,2"
                points={pathHistory.map(p => {
                  const pt = getXY(p.lat, p.lng);
                  return `${pt.x},${pt.y}`;
                }).join(" ")}
              />
            )}

            {/* ISS marker */}
            <g transform={`translate(${issPos.x}, ${issPos.y})`}>
              {/* Radar sweep pulse rings */}
              <circle r="22" fill="none" stroke="#00FFCC" strokeWidth="0.5" className="animate-ping opacity-25" />
              <circle r="12" fill="none" stroke="#00FFCC" strokeWidth="1" className="opacity-40" />
              {/* Core ISS Dot */}
              <circle r="4.5" fill="#00FFCC" className="animate-pulse" />
              {/* Label */}
              <text x="10" y="4" fill="#00FFCC" fontSize="8" fontFamily="Space Mono" fontWeight="bold">ISS (ZARYA)</text>
            </g>
          </svg>

          {/* Latitude & Longitude Labels */}
          <div className="absolute bottom-3 left-3 flex gap-3 text-[9px] font-mono text-slate-500">
            <span>EQUATOR COMPONENT LOCKED</span>
            <span>ALT: {data.altitude} KM</span>
          </div>
          <div className="absolute top-3 right-3 text-[9px] font-mono text-slate-400 flex items-center gap-1.5 bg-slate-900/80 px-2 py-0.5 rounded border border-white/5">
            <MapPin className="w-3 h-3 text-[#FF6060] animate-bounce" />
            LAT: <strong className="text-slate-100">{data.latitude.toFixed(4)}°</strong> / LNG: <strong className="text-slate-100">{data.longitude.toFixed(4)}°</strong>
          </div>
        </div>

        {/* Real-time coordinates dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-950/40 p-2.5 rounded border border-white/5 font-mono">
            <span className="text-[9px] text-slate-500 block">ORBITAL HEIGHT</span>
            <span className="text-lg font-bold text-[#00FFCC]">{data.altitude} <span className="text-[10px] text-slate-400">KM</span></span>
          </div>
          <div className="bg-slate-950/40 p-2.5 rounded border border-white/5 font-mono">
            <span className="text-[9px] text-slate-500 block">DOCK VELOCITY</span>
            <span className="text-lg font-bold text-[#7B5FFF]">{data.velocity.toLocaleString()} <span className="text-[10px] text-slate-400">KM/H</span></span>
          </div>
          <div className="bg-slate-950/40 p-2.5 rounded border border-white/5 font-mono">
            <span className="text-[9px] text-slate-500 block">INCLINATION DEGREES</span>
            <span className="text-lg font-bold text-[#FFB400]">51.64° <span className="text-[10px] text-slate-400">DEG</span></span>
          </div>
          <div className="bg-slate-950/40 p-2.5 rounded border border-white/5 font-mono">
            <span className="text-[9px] text-slate-500 block">ORBIT PERIOD DAYS</span>
            <span className="text-lg font-bold text-[#40C4FF]">92.8 <span className="text-[10px] text-slate-400">MINS</span></span>
          </div>
        </div>
      </div>

      {/* ISS Crew Manifest Panel */}
      <div className="lg:col-span-1 rounded-2xl p-5 border border-white/5 glass-panel glow-purple flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#7B5FFF]" />
              <span className="text-xs font-mono font-semibold tracking-wider text-slate-300">ACTIVE ISS CREW MANIFEST</span>
            </div>
            <span className="text-[10px] font-mono text-[#7B5FFF] font-bold bg-[#7B5FFF]/10 border border-[#7B5FFF]/20 px-2 py-0.5 rounded">
              {data.crew.length} ABOARD
            </span>
          </div>

          {/* Crew list rows */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {data.crew.map((member, idx) => (
              <div key={idx} className="p-3 bg-slate-950/50 rounded border border-white/5 flex items-center justify-between font-mono text-xs">
                <div>
                  <h4 className="font-sans font-semibold text-slate-200">{member.name}</h4>
                  <span className="text-[9px] text-slate-500 block mt-0.5">ROLE: MISSION SPECIALIST</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#7B5FFF] bg-[#7B5FFF]/10 border border-[#7B5FFF]/20 px-2 py-0.5 rounded uppercase">
                    {member.craft || "ISS"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Safe orbital telemetry seal */}
        <div className="p-3 bg-slate-950/40 border border-white/5 rounded-lg flex items-center gap-3 font-mono text-[10px] text-slate-400 mt-4">
          <Radio className="w-4 h-4 text-[#7B5FFF] animate-pulse" />
          <span>STATION TELEMETRY LINK ESTABLISHED OVER TDRS DEEP NETWORK. RADAR LOCKED.</span>
        </div>
      </div>

    </div>
  );
}
