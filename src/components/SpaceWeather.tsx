import { useState, useEffect } from "react";
import { SpaceWeatherData } from "../types";
import { Zap, Radio, ShieldAlert, Waves, Compass, Activity, ArrowUpRight, RefreshCw, AlertOctagon } from "lucide-react";

export default function SpaceWeather() {
  const [weatherData, setWeatherData] = useState<SpaceWeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchWeather = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch("/api/space-weather");
      if (!res.ok) throw new Error("Subsystem data failed");
      const data = await res.json();
      setWeatherData(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError("Solar wind telemetry interrupted");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchWeather, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[400px] flex flex-col items-center justify-center border border-white/5 rounded-2xl glass-panel text-slate-400 font-mono text-sm">
        <Activity className="w-8 h-8 text-[#FFB400] animate-pulse mb-3" />
        DECODING NOAA SPACE WEATHER BEACONS...
      </div>
    );
  }

  const data = weatherData!;

  // Helper to resolve Kp storm warning details
  const getKpDetails = (kp: number) => {
    if (kp >= 7) return { text: "Kp STORM STATUS (G3+)", desc: "Major Geomagnetic Storm. Grid issues & widespread auroras.", color: "text-[#FF6060]", bg: "bg-[#FF6060]/10", border: "border-[#FF6060]/30", glowClass: "glow-red" };
    if (kp >= 5) return { text: "Kp ACTIVE WARNING (G1-G2)", desc: "Moderate Storm active. High latitude power impacts.", color: "text-[#FFB400]", bg: "bg-[#FFB400]/10", border: "border-[#FFB400]/30", glowClass: "glow-gold" };
    return { text: "GEOMAGNETIC STATUS NORMAL", desc: "Quiet magnetosphere. Nominal communications.", color: "text-[#00FFCC]", bg: "bg-[#00FFCC]/10", border: "border-[#00FFCC]/30", glowClass: "glow-cyan" };
  };

  const kpInfo = getKpDetails(data?.kpIndex?.current || 3);

  // Math variables for Kp dial gauge
  const maxKp = 9;
  const currentKp = data?.kpIndex?.current || 3;
  const strokeDashoffset = 251.2 - (251.2 * (currentKp / maxKp));

  // Determine maximum wind speed for SVG rendering height scaling
  const maxWindSpeed = Math.max(...data.solarWind.history.map(h => h.speed), 500);
  const minWindSpeed = Math.min(...data.solarWind.history.map(h => h.speed), 300);

  // Formulate SVG Area coordinates dynamically
  const svgWidth = 450;
  const svgHeight = 120;
  const windPoints = data.solarWind.history.map((pt, index) => {
    const x = (index / (data.solarWind.history.length - 1)) * svgWidth;
    // Scale speed to fit SVG height
    const normalizedY = svgHeight - 15 - ((pt.speed - minWindSpeed) / (maxWindSpeed - minWindSpeed)) * (svgHeight - 30);
    return { x, y: normalizedY, speed: pt.speed, time: pt.time };
  });

  const windLinePath = windPoints.map(p => `${p.x},${p.y}`).join(" L ");
  const windAreaPath = `${windPoints[0].x},${svgHeight} L ${windLinePath} L ${windPoints[windPoints.length - 1].x},${svgHeight} Z`;

  return (
    <div id="space-weather-dashboard" className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* Main Stats, Gauges, Kp Index */}
      <div className={`lg:col-span-1 rounded-2xl p-5 border glass-panel flex flex-col justify-between transition-all ${kpInfo.border} ${kpInfo.glowClass}`}>
        <div className="flex items-start justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Radio className={`w-4 h-4 ${kpInfo.color} animate-pulse`} />
            <span className="text-xs font-mono font-semibold tracking-wider text-slate-300">MAGNETOSPHERE READOUT</span>
          </div>
          <button 
            onClick={fetchWeather} 
            disabled={isRefreshing}
            className="text-slate-500 hover:text-[#00FFCC] transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#00FFCC]' : ''}`} />
          </button>
        </div>

        {/* Circular Dial Gauge for Kp Index */}
        <div className="flex flex-col items-center justify-center my-6 relative">
          <svg className="w-36 h-36 transform -rotate-90">
            <circle
              cx="72"
              cy="72"
              r="40"
              className="stroke-slate-850 fill-none"
              strokeWidth="7"
            />
            <circle
              cx="72"
              cy="72"
              r="40"
              className={`fill-none transition-all duration-1000 ${
                currentKp >= 7 ? 'stroke-[#FF6060]' : currentKp >= 5 ? 'stroke-[#FFB400]' : 'stroke-[#00FFCC]'
              }`}
              strokeWidth="8"
              strokeDasharray="251.2"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute text-center">
            <span className="text-4xl font-mono font-bold text-slate-100">{currentKp}</span>
            <span className="text-slate-500 text-[10px] block font-mono">Kp INDEX</span>
          </div>
        </div>

        {/* Status Alerts Block */}
        <div className={`p-3 rounded-lg ${kpInfo.bg} border border-white/5 space-y-1 mt-auto`}>
          <div className="flex items-center gap-2">
            <ShieldAlert className={`w-4 h-4 ${kpInfo.color}`} />
            <span className={`text-xs font-mono font-bold ${kpInfo.color}`}>{kpInfo.text}</span>
          </div>
          <p className="text-[11px] text-slate-300 font-sans leading-relaxed">{kpInfo.desc}</p>
        </div>
      </div>

      {/* Real-time Solar Wind Speed Line Chart (SVG) */}
      <div className="lg:col-span-2 rounded-2xl p-5 border border-white/5 glass-panel flex flex-col justify-between glow-cyan">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Waves className="w-4 h-4 text-[#00FFCC]" />
            <span className="text-xs font-mono font-semibold tracking-wider text-slate-300">SOLAR WIND DISCHARGE TRACKER</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">REAL-TIME DATASTREAM</span>
        </div>

        {/* Numeric Live wind readings */}
        <div className="grid grid-cols-3 gap-3 my-4">
          <div className="bg-slate-950/40 p-2.5 rounded border border-white/5">
            <span className="text-[9px] font-mono text-slate-500 block">WIND VELOCITY</span>
            <span className="text-xl font-mono font-bold text-[#00FFCC]">{data.solarWind.speed} <span className="text-[10px] text-slate-400">km/s</span></span>
          </div>
          <div className="bg-slate-950/40 p-2.5 rounded border border-white/5">
            <span className="text-[9px] font-mono text-slate-500 block">PROTON DENSITY</span>
            <span className="text-xl font-mono font-bold text-[#7B5FFF]">{data.solarWind.density} <span className="text-[10px] text-slate-400">p/cm³</span></span>
          </div>
          <div className="bg-slate-950/40 p-2.5 rounded border border-white/5">
            <span className="text-[9px] font-mono text-slate-500 block">CORE TEMPERATURE</span>
            <span className="text-xl font-mono font-bold text-[#FFB400]">{data.solarWind.temperature.toLocaleString()} <span className="text-[10px] text-slate-400">K</span></span>
          </div>
        </div>

        {/* SVG Area Line Chart */}
        <div className="relative w-full h-[120px] bg-slate-950/20 border border-white/5 rounded-lg overflow-hidden mt-2 p-1">
          <div className="absolute top-2 left-2 text-[8px] font-mono text-slate-500">MAX: {maxWindSpeed} km/s</div>
          <div className="absolute bottom-2 left-2 text-[8px] font-mono text-slate-500">MIN: {minWindSpeed} km/s</div>
          
          <svg className="w-full h-full" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id="windGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00FFCC" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#00FFCC" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {/* Fill Area */}
            <path d={`M 0,${svgHeight} L ${windAreaPath}`} fill="url(#windGrad)" />
            {/* Line */}
            <path d={`M ${windLinePath}`} fill="none" stroke="#00FFCC" strokeWidth="1.5" />
            
            {/* Dotted threshold line */}
            <line x1="0" y1={svgHeight * 0.4} x2={svgWidth} y2={svgHeight * 0.4} stroke="rgba(255, 180, 0, 0.2)" strokeWidth="1" strokeDasharray="3,3" />
          </svg>

          {/* Spark points details overlay */}
          <div className="absolute inset-x-0 bottom-1 flex justify-between px-2 text-[7px] font-mono text-slate-500">
            {data.solarWind.history.filter((_, idx) => idx % 3 === 0).map((h, i) => (
              <span key={i}>{h.time}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Aurora Probabilities & Solar Flares alerts */}
      <div className="lg:col-span-2 rounded-2xl p-5 border border-white/5 glass-panel glow-blue space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#40C4FF]" />
            <span className="text-xs font-mono font-semibold tracking-wider text-slate-300">AURORA OVAL ABSORPTION INDEX</span>
          </div>
          <span className="text-[10px] font-mono text-[#40C4FF] font-semibold bg-[#40C4FF]/10 px-2 py-0.5 rounded">IONIZATION INDEX</span>
        </div>

        {/* Aurora Probabilities Progress */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5 font-mono">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">HIGH LATITUDE (60°+)</span>
              <span className="text-[#00FFCC]">{data.auroraProbability.highLatitude}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-[#00FFCC] transition-all duration-1000" style={{ width: `${data.auroraProbability.highLatitude}%` }} />
            </div>
          </div>
          <div className="space-y-1.5 font-mono">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">MID LATITUDE (45°+)</span>
              <span className="text-[#40C4FF]">{data.auroraProbability.midLatitude}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-[#40C4FF] transition-all duration-1000" style={{ width: `${data.auroraProbability.midLatitude}%` }} />
            </div>
          </div>
          <div className="space-y-1.5 font-mono">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">LOW LATITUDE (35°+)</span>
              <span className="text-[#FFB400]">{data.auroraProbability.lowLatitude}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-[#FFB400] transition-all duration-1000" style={{ width: `${data.auroraProbability.lowLatitude}%` }} />
            </div>
          </div>
        </div>

        {/* Solar Flares List */}
        <div className="pt-2">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest border-b border-white/5 pb-1.5 mb-2 flex items-center gap-1">
            <Zap className="w-3 h-3 text-[#FFB400]" /> SOLAR FLARING EMISSIONS (CME FEED)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {data.solarFlares.map((flare, idx) => (
              <div key={idx} className="bg-slate-950/30 border border-white/5 p-2 rounded flex items-center justify-between">
                <div>
                  <span className={`text-xs font-mono font-bold ${flare.class.startsWith('X') ? 'text-[#FF6060]' : 'text-[#FFB400]'}`}>{flare.class} Flare</span>
                  <span className="text-[9px] block text-slate-400 font-mono mt-0.5">{flare.region}</span>
                </div>
                {flare.active ? (
                  <span className="text-[8px] font-mono text-[#FF6060] bg-[#FF6060]/10 border border-[#FF6060]/30 px-1.5 py-0.5 rounded animate-pulse">ACTIVE EVENT</span>
                ) : (
                  <span className="text-[8px] font-mono text-slate-500">DECAYED</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active NOAA Alerts Sidebar Log Feed */}
      <div className="lg:col-span-1 rounded-2xl p-5 border border-white/5 glass-panel glow-gold space-y-4 max-h-[340px] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#FFB400]" />
            <span className="text-xs font-mono font-semibold tracking-wider text-slate-300">CRITICAL LIVE NOTICES</span>
          </div>
          <span className="text-xs font-mono text-[#FFB400] bg-[#FFB400]/10 border border-[#FFB400]/20 px-2 py-0.5 rounded">NOAA SWPC</span>
        </div>

        <div className="space-y-3">
          {data.activeAlerts.map(alert => (
            <div key={alert.id} className="p-3 bg-slate-950/50 rounded border border-white/5 space-y-1.5 font-mono text-[11px]">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                  alert.severity === 'danger' ? 'bg-[#FF6060]/15 text-[#FF6060] border border-[#FF6060]/20' :
                  alert.severity === 'warning' ? 'bg-[#FFB400]/15 text-[#FFB400] border border-[#FFB400]/20' :
                  'bg-[#40C4FF]/15 text-[#40C4FF] border border-[#40C4FF]/20'
                }`}>
                  {alert.type}
                </span>
                <span className="text-[9px] text-slate-500">{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC</span>
              </div>
              <p className="text-slate-300 font-sans leading-relaxed text-xs">{alert.message}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
