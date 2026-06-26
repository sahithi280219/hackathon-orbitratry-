import { useState, useEffect } from "react";
import StarfieldBg from "./components/StarfieldBg";
import SolarSystem3D from "./components/SolarSystem3D";
import SpaceWeather from "./components/SpaceWeather";
import ISSTracker from "./components/ISSTracker";
import NEOAlerts from "./components/NEOAlerts";
import APODPanel from "./components/APODPanel";
import LaunchHub from "./components/LaunchHub";
import COSMOChat from "./components/COSMOChat";
import CitiesPanorama from "./components/CitiesPanorama";
import { 
  Globe, 
  Radio, 
  Activity, 
  AlertTriangle, 
  Image, 
  Rocket, 
  Bot, 
  Menu, 
  X, 
  Clock, 
  Compass, 
  Zap, 
  ShieldCheck,
  ChevronRight,
  MessageSquare
} from "lucide-react";

type ActiveTab = "solar" | "weather" | "iss" | "neo" | "apod" | "launch" | "panorama";

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("solar");
  const [isCosmoOpen, setIsCosmoOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Real-time telemetry payload gathered to feed context into COSMO AI assistant
  const [telemetry, setTelemetry] = useState({
    kpIndex: { current: 3 },
    solarWind: { speed: 412 },
    iss: { latitude: 51.64, longitude: -12.44 },
    nextLaunch: { name: "Starlink Group 8-12", countdownText: "T-Minus 1.5 Days" },
    neoCount: 4
  });

  // Track system time in UTC
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Gather real-time numbers from our API endpoints occasionally to feed COSMO system prompt
  useEffect(() => {
    const fetchTelemetryContext = async () => {
      try {
        const [weatherRes, issRes, neoRes, launchRes] = await Promise.all([
          fetch("/api/space-weather").then(r => r.json()).catch(() => null),
          fetch("/api/iss").then(r => r.json()).catch(() => null),
          fetch("/api/neo").then(r => r.json()).catch(() => null),
          fetch("/api/launches").then(r => r.json()).catch(() => null),
        ]);

        setTelemetry({
          kpIndex: { current: weatherRes?.kpIndex?.current || 3 },
          solarWind: { speed: weatherRes?.solarWind?.speed || 412 },
          iss: { latitude: issRes?.latitude || 51.64, longitude: issRes?.longitude || -12.44 },
          nextLaunch: { 
            name: launchRes?.[0]?.name || "Starlink Group 8-12",
            countdownText: launchRes?.[0]?.dateUtc ? new Date(launchRes[0].dateUtc).toLocaleDateString() : "T-Minus 1 Day"
          },
          neoCount: neoRes?.length || 4
        });
      } catch (e) {
        console.warn("Unable to compile real-time telemetry package context for assistant:", e);
      }
    };

    fetchTelemetryContext();
    const telemetryInterval = setInterval(fetchTelemetryContext, 15000); // refresh context every 15s
    return () => clearInterval(telemetryInterval);
  }, []);

  return (
    <div className="min-h-screen relative overflow-x-hidden text-slate-100 flex flex-col font-sans select-none pb-12">
      
      {/* Parallax Starfield Canvas background */}
      <StarfieldBg />

      {/* Primary Cyber Observatory HUD Header */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/5 backdrop-blur-md px-4 py-3 md:px-8 flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg">
        
        {/* Brand name */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00FFCC] to-[#7B5FFF] p-0.5 flex items-center justify-center shadow-lg animate-pulse">
              <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center">
                <Compass className="w-5 h-5 text-[#00FFCC] animate-spin-slow" />
              </div>
            </div>
            {/* Live radar wave badge */}
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#00FFCC] border-2 border-slate-950 flex items-center justify-center animate-ping opacity-75" />
          </div>
          <div>
            <h1 className="font-sans font-black text-2xl tracking-wider text-slate-100 flex items-center gap-2">
              ORBITRA <span className="text-xs font-mono text-[#00FFCC] font-bold px-2 py-0.5 rounded bg-[#00FFCC]/10 border border-[#00FFCC]/20 tracking-normal">OBSERVATORY</span>
            </h1>
            <p className="text-[10px] font-mono text-slate-400 tracking-widest uppercase">COSMIC MONITORING SYSTEM HUD</p>
          </div>
        </div>

        {/* Global Real-time Cosmic Telemetry Ribbon */}
        <div className="hidden lg:flex items-center gap-4 text-[11px] font-mono border-x border-white/5 px-6 py-1 bg-slate-950/40 rounded">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-[#FFB400] animate-pulse" />
            <span className="text-slate-500">SOLAR FLUX:</span>
            <strong className="text-slate-200">{telemetry.solarWind.speed} km/s</strong>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-[#00FFCC]" />
            <span className="text-slate-500">MAGNETOSPHERE:</span>
            <strong className={`${telemetry.kpIndex.current >= 7 ? 'text-[#FF6060]' : telemetry.kpIndex.current >= 5 ? 'text-[#FFB400]' : 'text-[#00FFCC]'}`}>
              Kp {telemetry.kpIndex.current}
            </strong>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-[#40C4FF]" />
            <span className="text-slate-500">ISS VECTORS:</span>
            <strong className="text-slate-200">ALT {Math.round(51.64 + telemetry.iss.latitude)}° N</strong>
          </div>
        </div>

        {/* System Clocks (UTC & Local coordinates) */}
        <div className="flex items-center gap-3">
          <div className="text-right font-mono text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 justify-end">
              <Clock className="w-3.5 h-3.5 text-[#00FFCC]" />
              <span>UTC TIME: <strong className="text-slate-100">{currentTime.toUTCString().slice(17, 25)}</strong></span>
            </div>
            <div className="text-[9px] text-slate-500 mt-0.5">LOCAL OBSERVER: {currentTime.toLocaleTimeString()}</div>
          </div>

          {/* Glowing Purple COSMO AI Assistant Button */}
          <button
            onClick={() => setIsCosmoOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#7B5FFF] to-[#5a3ae1] hover:from-[#8c74ff] hover:to-[#7B5FFF] text-white font-mono font-semibold text-xs rounded-xl shadow-lg border border-[#7B5FFF]/40 flex items-center gap-1.5 hover:shadow-purple transition-all cursor-pointer animate-pulse"
          >
            <Bot className="w-4 h-4 animate-bounce" />
            COSMO AI
          </button>
        </div>

      </header>

      {/* Main Container Workspace */}
      <main className="max-w-7xl mx-auto w-full px-4 md:px-8 mt-6 space-y-6 flex-1">

        {/* Tab Selection HUD navigation control board */}
        <div className="w-full flex flex-wrap items-center justify-between gap-3 p-2 bg-slate-950/60 border border-white/5 rounded-2xl backdrop-blur-md">
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveTab("solar")}
              className={`px-4 py-2.5 rounded-xl font-mono text-xs tracking-wider font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "solar"
                  ? "bg-[#00FFCC]/15 text-[#00FFCC] border border-[#00FFCC]/25 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              <Globe className="w-4 h-4" />
              SOLAR SYSTEM 3D
            </button>

            <button
              onClick={() => setActiveTab("weather")}
              className={`px-4 py-2.5 rounded-xl font-mono text-xs tracking-wider font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "weather"
                  ? "bg-[#40C4FF]/15 text-[#40C4FF] border border-[#40C4FF]/25 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              <Activity className="w-4 h-4" />
              SPACE WEATHER
            </button>

            <button
              onClick={() => setActiveTab("iss")}
              className={`px-4 py-2.5 rounded-xl font-mono text-xs tracking-wider font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "iss"
                  ? "bg-[#00FFCC]/15 text-[#00FFCC] border border-[#00FFCC]/25 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              <Compass className="w-4 h-4" />
              ISS RADAR TRACK
            </button>

            <button
              onClick={() => setActiveTab("neo")}
              className={`px-4 py-2.5 rounded-xl font-mono text-xs tracking-wider font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "neo"
                  ? "bg-[#FFB400]/15 text-[#FFB400] border border-[#FFB400]/25 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              ASTEROID METRIC
            </button>

            <button
              onClick={() => setActiveTab("apod")}
              className={`px-4 py-2.5 rounded-xl font-mono text-xs tracking-wider font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "apod"
                  ? "bg-[#7B5FFF]/15 text-[#7B5FFF] border border-[#7B5FFF]/25 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              <Image className="w-4 h-4" />
              APOD+ TELESCOPE
            </button>

            <button
              onClick={() => setActiveTab("launch")}
              className={`px-4 py-2.5 rounded-xl font-mono text-xs tracking-wider font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "launch"
                  ? "bg-[#FFB400]/15 text-[#FFB400] border border-[#FFB400]/25 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              <Rocket className="w-4 h-4" />
              LAUNCH CONTROL
            </button>

            <button
              onClick={() => setActiveTab("panorama")}
              className={`px-4 py-2.5 rounded-xl font-mono text-xs tracking-wider font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "panorama"
                  ? "bg-[#FFD700]/15 text-[#FFD700] border border-[#FFD700]/25 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              <Compass className="w-4 h-4 text-[#FFD700]" />
              CITIES PANORAMA
            </button>
          </div>

          {/* Quick status report beacon */}
          <div className="hidden md:flex items-center gap-2 text-[10px] font-mono text-slate-400 px-3 py-1 border border-white/5 rounded-lg bg-slate-950">
            <span className="w-2 h-2 rounded-full bg-[#00FFCC] animate-pulse" />
            <span>ALL TELESCOPE SENSORS GO</span>
          </div>
        </div>

        {/* Tab View Container */}
        <div id="observatory-viewscreen-stage" className="w-full min-h-[500px]">
          {activeTab === "solar" && <SolarSystem3D />}
          {activeTab === "weather" && <SpaceWeather />}
          {activeTab === "iss" && <ISSTracker />}
          {activeTab === "neo" && <NEOAlerts />}
          {activeTab === "apod" && <APODPanel />}
          {activeTab === "launch" && <LaunchHub />}
          {activeTab === "panorama" && <CitiesPanorama />}
        </div>

      </main>

      {/* Persistent floating AI toggle button (on bottom right for easy touch/mouse trigger) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsCosmoOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#7B5FFF] to-[#5a3ae1] hover:from-[#8c74ff] hover:to-[#7B5FFF] text-white flex items-center justify-center shadow-2xl border border-[#7B5FFF]/50 hover:scale-110 transition-all cursor-pointer group"
          title="Open COSMO AI Officer"
        >
          <Bot className="w-7 h-7 group-hover:rotate-12 transition-transform" />
        </button>
      </div>

      {/* Slide-out COSMO Assistant Panel */}
      <COSMOChat 
        isOpen={isCosmoOpen} 
        onClose={() => setIsCosmoOpen(false)} 
        currentTelemetry={telemetry}
      />

    </div>
  );
}
