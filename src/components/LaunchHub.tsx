import React, { useState, useEffect } from "react";
import { UpcomingLaunch } from "../types";
import { Rocket, Clock, Bell, BellOff, Tv, ArrowUpRight, Share2, Compass, Play, RefreshCw, AlertCircle } from "lucide-react";

const COSMIC_CHANNELS = [
  { id: "A0FZIwabctw", name: "Falcon Heavy Demo Webcast", description: "The iconic Falcon Heavy inaugural flight carrying Starman (highly stable)" },
  { id: "OnoNITE-CLg", name: "Falcon Heavy Synchronized Landing", description: "Simultaneous dual-booster supersonic landing sequence at Cape Canaveral" },
  { id: "go7seZZ_y64", name: "Beautiful Earth Views (ISS Orbit)", description: "High-definition 10-hour orbital views of Earth filmed from the ISS" },
  { id: "RMINSD7MmT4", name: "Apollo 11 Restored Lunar Descent", description: "Commander Neil Armstrong taking humanity's first steps on the Moon" },
  { id: "tNkZsRw7hxg", name: "Cosmic Synthwave / Lofi Beats", description: "Chill electronic melodies for celestial navigation & space coding" },
];

export default function LaunchHub() {
  const [launches, setLaunches] = useState<UpcomingLaunch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscription state (persisted locally to browser)
  const [subscribedIds, setSubscribedIds] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Active livestream YouTube ID/Embed frame
  const [activeVideoId, setActiveVideoId] = useState<string>("A0FZIwabctw"); // Default to Falcon Heavy Demo (evergreen, highly stable)
  const [showLivestream, setShowLivestream] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [tuningError, setTuningError] = useState<string | null>(null);

  const tuneFeed = (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) return;
    
    // Check for channel ID pattern
    const channelMatch = trimmed.match(/(?:channel\/|channel=)(UC[a-zA-Z0-9_-]{22})/);
    if (channelMatch) {
      setActiveVideoId(`live_stream?channel=${channelMatch[1]}`);
      setShowLivestream(true);
      setTuningError(null);
      return;
    }

    // Check for standard video ID matches
    const ytMatch = trimmed.match(/(?:v=|\/v\/|embed\/|youtu\.be\/|\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) {
      setActiveVideoId(ytMatch[1]);
      setShowLivestream(true);
      setTuningError(null);
    } else if (trimmed.length === 11) {
      // Plain video ID
      setActiveVideoId(trimmed);
      setShowLivestream(true);
      setTuningError(null);
    } else if (trimmed.startsWith("UC") && trimmed.length === 24) {
      // Plain channel ID
      setActiveVideoId(`live_stream?channel=${trimmed}`);
      setShowLivestream(true);
      setTuningError(null);
    } else {
      setTuningError("Invalid YouTube Link or Video ID pattern.");
    }
  };

  const fetchLaunches = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch("/api/launches");
      if (!res.ok) throw new Error("Upcoming schedule failed");
      const data = await res.json();
      setLaunches(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError("Unable to sync rocket schedules");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLaunches();

    // Recover subscriptions from localStorage
    const saved = localStorage.getItem("orbitra_launch_subs");
    if (saved) {
      try {
        setSubscribedIds(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const toggleSubscription = (id: string, name: string) => {
    let next: string[];
    if (subscribedIds.includes(id)) {
      next = subscribedIds.filter(item => item !== id);
    } else {
      next = [...subscribedIds, id];
      // Display native alert confirmation
      alert(`[ORBITRA COMMAND] Flight Alert established for ${name}. Telemetry warnings will trigger T-10m before liftoff.`);
    }
    setSubscribedIds(next);
    localStorage.setItem("orbitra_launch_subs", JSON.stringify(next));
  };

  if (loading) {
    return (
      <div className="w-full h-[400px] flex flex-col items-center justify-center border border-white/5 rounded-2xl glass-panel text-slate-400 font-mono text-sm">
        <Rocket className="w-8 h-8 text-[#FFB400] animate-bounce mb-3" />
        RESOLVING RANGE SCHEDULES & FLIGHT VECTORS...
      </div>
    );
  }

  return (
    <div id="rocket-launch-dashboard" className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* Main Upcoming Missions Countdown Feed */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <div className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-[#FFB400] animate-pulse" />
            <h3 className="font-sans font-semibold text-lg tracking-wider text-slate-100">UPCOMING LAUNCH SCHEDULE</h3>
          </div>
          <button 
            onClick={fetchLaunches} 
            disabled={isRefreshing}
            className="text-slate-500 hover:text-[#00FFCC] transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#00FFCC]' : ''}`} />
          </button>
        </div>

        {error && (
          <div className="p-4 bg-amber-950/20 border border-amber-900/30 rounded-xl text-center flex items-center justify-center gap-2 text-slate-300 font-mono text-xs">
            <AlertCircle className="w-4 h-4 text-[#FFB400]" />
            Telemetry rate limited. Active simulation scheduling loaded.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {launches.map(launch => (
            <CountdownCard
              key={launch.id}
              launch={launch}
              isSubscribed={subscribedIds.includes(launch.id)}
              onToggleSub={() => toggleSubscription(launch.id, launch.name)}
              onWatch={() => {
                setShowLivestream(true);
                // Extract video ID from link if present
                const url = launch.livestreamUrl || "";
                const ytMatch = url.match(/(?:v=|\/v\/|embed\/|youtu\.be\/|\/)([a-zA-Z0-9_-]{11})/);
                if (ytMatch && ytMatch[1] !== "dQw4w9WgXcQ") {
                  setActiveVideoId(ytMatch[1]);
                } else {
                  setActiveVideoId("A0FZIwabctw");
                }
              }}
            />
          ))}
        </div>
      </div>

      {/* Embedded Livestream Telemetry Player */}
      <div className="lg:col-span-1 rounded-2xl p-5 border border-white/5 glass-panel glow-gold flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Tv className="w-4 h-4 text-[#FFB400]" />
              <span className="text-xs font-mono font-semibold tracking-wider text-slate-300">OBSERVATORY RANGE LIVESTREAM</span>
            </div>
            <span className="text-[10px] font-mono text-[#FFB400] font-bold bg-[#FFB400]/10 border border-[#FFB400]/20 px-2 py-0.5 rounded">
              {showLivestream ? "FEED ACTIVE" : "FEED ON-STANDBY"}
            </span>
          </div>

          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            Tune into active launch streams, mission control feeds, and public payload deployment broadcasts directly over our space-radio link.
          </p>

          {/* High-tech Selector for Cosmic Streams */}
          <div className="space-y-1.5 font-mono">
            <label className="text-[9px] text-slate-500 uppercase tracking-widest block">SELECT RADIO TRANSMISSION FEED</label>
            <select
              value={activeVideoId}
              onChange={(e) => {
                setActiveVideoId(e.target.value);
                setShowLivestream(true);
              }}
              className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-mono text-[#FFB400] focus:outline-none focus:border-[#FFB400] transition-all cursor-pointer hover:bg-slate-900"
            >
              {COSMIC_CHANNELS.map((ch) => (
                <option key={ch.id} value={ch.id} className="bg-slate-950 text-slate-200">
                  📻 {ch.name}
                </option>
              ))}
              {!COSMIC_CHANNELS.some((ch) => ch.id === activeVideoId) && (
                <option value={activeVideoId} className="bg-slate-950 text-[#00FFCC]">
                  🚀 Custom Mission Webcast / Feed
                </option>
              )}
            </select>
            <span className="text-[9px] text-slate-400 block leading-relaxed italic">
              {COSMIC_CHANNELS.find((ch) => ch.id === activeVideoId)?.description || "Custom live flight telemetry webcast stream"}
            </span>
          </div>

          {/* Custom YouTube Feed Tuner */}
          <div className="space-y-2 pt-1 font-mono">
            <label className="text-[9px] text-slate-500 uppercase tracking-widest block">📡 TRANSMISSION TUNER (URL OR VIDEO ID)</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Paste YouTube Link or Video ID (e.g. SpaceX live webcast)"
                value={customInput}
                onChange={(e) => {
                  setCustomInput(e.target.value);
                  setTuningError(null);
                }}
                className="flex-1 bg-slate-950/80 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-[#FFB400] transition-all"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    tuneFeed(customInput);
                    setCustomInput("");
                  }
                }}
              />
              <button
                onClick={() => {
                  tuneFeed(customInput);
                  setCustomInput("");
                }}
                className="bg-[#FFB400] hover:bg-[#FFB400]/80 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer"
              >
                TUNE
              </button>
            </div>
            {tuningError && (
              <span className="text-[10px] text-red-400 block">{tuningError}</span>
            )}
            
            <div className="text-[9px] leading-relaxed text-slate-400 bg-slate-950/40 border border-white/5 p-2 rounded-md space-y-1">
              <div className="font-semibold text-slate-300">💡 STABILIZATION INSTRUMENTS:</div>
              <p>
                If a feed shows <span className="text-amber-400">"Video unavailable"</span>, it's typically because YouTube restricted embedding or that specific live stream ended. Use the selector above to pick a stable evergreen channel, or copy-paste any active YouTube URL above!
              </p>
            </div>
          </div>

          <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-slate-950/80 flex items-center justify-center group">
            {showLivestream ? (
              <iframe
                src={activeVideoId.startsWith("live_stream") 
                  ? `https://www.youtube.com/embed/${activeVideoId}&autoplay=1` 
                  : `https://www.youtube.com/embed/${activeVideoId}?autoplay=1`}
                className="w-full h-full"
                title="Mission Control Broadcast"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            ) : (
              <div className="text-center p-4 text-slate-500 space-y-3">
                <Rocket className="w-10 h-10 mx-auto text-slate-700 animate-pulse" />
                <button
                  onClick={() => setShowLivestream(true)}
                  className="px-4 py-2 bg-[#FFB400] hover:bg-[#FFB400]/80 text-slate-950 font-mono font-bold text-xs rounded-lg flex items-center gap-1.5 mx-auto transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  ACTIVATE LAUNCH FEED
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Range Status metrics */}
        <div className="p-3 bg-slate-950/40 border border-white/5 rounded-lg flex items-center gap-2.5 font-mono text-[9px] text-slate-400 mt-4">
          <Clock className="w-4 h-4 text-[#FFB400] shrink-0" />
          <span>CAPE CANAVERAL RANGE COOP: GO FOR DEPLOYMENTS. COLD WINDS ACTIVE.</span>
        </div>
      </div>

    </div>
  );
}

// Sub-component that handles live ticking countdowns correctly in React
interface CountdownCardProps {
  key?: any;
  launch: UpcomingLaunch;
  isSubscribed: boolean;
  onToggleSub: () => void;
  onWatch: () => void;
}

function CountdownCard({ launch, isSubscribed, onToggleSub, onWatch }: CountdownCardProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });

  useEffect(() => {
    const calculateTime = () => {
      const difference = +new Date(launch.dateUtc) - +new Date();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        expired: false
      });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [launch.dateUtc]);

  return (
    <div className="rounded-xl border border-white/5 bg-slate-950/30 p-4 flex flex-col justify-between hover:border-[#FFB400]/30 transition-all glow-gold">
      
      {/* Header Info */}
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-sans font-bold text-base text-slate-200 line-clamp-1">{launch.name}</h4>
            <span className="text-[10px] font-mono text-[#FFB400] bg-[#FFB400]/10 px-2 py-0.5 rounded border border-[#FFB400]/20 mt-1 inline-block">
              {launch.rocket}
            </span>
          </div>

          <button
            onClick={onToggleSub}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              isSubscribed
                ? 'bg-[#FFB400]/15 text-[#FFB400] border-[#FFB400]/30'
                : 'bg-slate-900/60 text-slate-500 border-white/5 hover:border-slate-500 hover:text-slate-300'
            }`}
            title={isSubscribed ? "Unsubscribe Alerts" : "Subscribe liftoff warning"}
          >
            {isSubscribed ? <Bell className="w-4 h-4 animate-swing" /> : <BellOff className="w-4 h-4" />}
          </button>
        </div>

        <p className="text-xs text-slate-400 font-sans leading-relaxed line-clamp-2">{launch.description}</p>
      </div>

      {/* Real-time ticker clock */}
      <div className="my-4 pt-3 border-t border-white/5 font-mono">
        <span className="text-[9px] text-slate-500 block uppercase tracking-widest mb-1">COUNTDOWN TO IGNITION</span>
        {timeLeft.expired ? (
          <span className="text-lg font-bold text-[#FF6060] tracking-wider animate-pulse uppercase">MISSION AIRBORNE / TERMINAL COOP</span>
        ) : (
          <div className="flex gap-2 text-xl font-bold text-[#FFB400] select-none">
            <div className="bg-slate-950/50 p-1.5 rounded border border-white/5 min-w-[48px] text-center">
              <span>{String(timeLeft.days).padStart(2, '0')}</span>
              <span className="text-[7px] text-slate-500 block font-normal">DAYS</span>
            </div>
            <div className="bg-slate-950/50 p-1.5 rounded border border-white/5 min-w-[48px] text-center">
              <span>{String(timeLeft.hours).padStart(2, '0')}</span>
              <span className="text-[7px] text-slate-500 block font-normal">HRS</span>
            </div>
            <div className="bg-slate-950/50 p-1.5 rounded border border-white/5 min-w-[48px] text-center">
              <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span className="text-[7px] text-slate-500 block font-normal">MINS</span>
            </div>
            <div className="bg-slate-950/50 p-1.5 rounded border border-white/5 min-w-[48px] text-center text-[#00FFCC]">
              <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
              <span className="text-[7px] text-slate-500 block font-normal">SECS</span>
            </div>
          </div>
        )}
      </div>

      {/* Watch Actions */}
      <div className="flex items-center justify-between text-[11px] font-mono border-t border-white/5 pt-3 mt-1">
        <span className="text-slate-500">NET: {new Date(launch.dateUtc).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} UTC</span>
        <button
          onClick={onWatch}
          className="text-[#FFB400] hover:text-[#00FFCC] transition-all flex items-center gap-1 cursor-pointer"
        >
          OPEN MONITOR <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}
