import React, { useState, useEffect } from "react";
import { APODData } from "../types";
import { 
  Image, 
  Sparkles, 
  Wand2, 
  Calendar, 
  ZoomIn, 
  Info, 
  Brain, 
  Compass, 
  RefreshCw, 
  AlertCircle, 
  Tv, 
  Play, 
  Video, 
  Eye, 
  Layers, 
  Settings, 
  X,
  Radio,
  ExternalLink,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Pre-defined space-themed YouTube videos for the "Launch Space Video" option
interface SpaceVideo {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
}

const SPACE_VIDEOS: SpaceVideo[] = [
  { id: "4czjS9h4Fpg", title: "Perseverance Mars Landing (HD)", description: "High-definition footage of Entry, Descent, and Landing on the Martian surface.", category: "Martian Rover", duration: "4:12" },
  { id: "tMRg_m0jS78", title: "James Webb Deployment Cinematic", description: "Vivid engineering visualization of unfolding the golden mirror honeycomb array in deep orbit.", category: "Telescope Deployment", duration: "5:30" },
  { id: "RMINSD7MmT4", title: "Apollo 11 Restored Lunar Descent", description: "Historically restored 4K original footage of Commander Neil Armstrong taking humanity's first steps on the Moon.", category: "Historic Lunar Mission", duration: "3:45" },
  { id: "doN4t5NKW-k", title: "Guided Inside Tour of the ISS", description: "Astonishing interior fly-through tour of space station science modules guided by commander Sunita Williams.", category: "Orbital Habitat", duration: "8:15" },
  { id: "OnoNITE-CLg", title: "Falcon Heavy Synchronized Landing", description: "Astonishing footage of dual side-boosters performing simultaneous supersonic vertical landings.", category: "Rocket Engineering", duration: "2:40" }
];

// Interactive 5 Multi-Spectral Telescope channels for generative art
interface TelescopeChannel {
  id: string;
  name: string;
  spectral: string;
  constellation: string;
  target: string;
  defaultPrompt: string;
  imageUrl: string;
  exposureTime: string;
  focalLength: string;
}

const TELESCOPE_CHANNELS_INIT: TelescopeChannel[] = [
  {
    id: "jwst",
    name: "James Webb Array (JWST)",
    spectral: "Deep Infrared (0.6 - 28.3 μm)",
    constellation: "Carina",
    target: "Cosmic Cliffs & Deep Field",
    defaultPrompt: "Cosmic cliffs in Carina Nebula, glowing interstellar dust clouds, high-density infrared starlight",
    imageUrl: "https://images.unsplash.com/photo-1610296669228-602fa827fc1f?auto=format&fit=crop&w=800&q=80",
    exposureTime: "12.8 Hours",
    focalLength: "131.4 mm"
  },
  {
    id: "hubble",
    name: "Hubble Space Telescope (HST)",
    spectral: "Optical / Ultraviolet",
    constellation: "Serpens",
    target: "Pillars of Creation",
    defaultPrompt: "Pillars of creation, colorful ultraviolet ionized gas plumes, newborn stellar nurseries",
    imageUrl: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=800&q=80",
    exposureTime: "7.4 Hours",
    focalLength: "57.6 mm"
  },
  {
    id: "chandra",
    name: "Chandra X-Ray Observatory (CXO)",
    spectral: "High-Energy X-Ray",
    constellation: "Taurus",
    target: "Crab Nebula Pulsar Ring",
    defaultPrompt: "High-energy X-ray emission pulsar, magnetic field synchrotron shockwaves, cosmic particle explosion",
    imageUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=800&q=80",
    exposureTime: "24.5 Hours",
    focalLength: "102.0 mm"
  },
  {
    id: "spitzer",
    name: "Spitzer Space Telescope (SST)",
    spectral: "Thermal Infrared",
    constellation: "Aquarius",
    target: "Helix Nebula Helix Eye",
    defaultPrompt: "Thermal heat signature planetary nebula helix, giant molecular cloud dust spirals, cosmic gas shell",
    imageUrl: "https://images.unsplash.com/photo-1538370965046-79c0d6907d47?auto=format&fit=crop&w=800&q=80",
    exposureTime: "5.2 Hours",
    focalLength: "85.0 mm"
  },
  {
    id: "kepler",
    name: "Kepler Exoplanet Hunter (KST)",
    spectral: "Photometric Transit",
    constellation: "Cygnus",
    target: "Super-Earth Kepler-186f",
    defaultPrompt: "Habitable exoplanet Kepler-186f orbiting deep red dwarf star, atmospheric oxygen violet glow, alien sunset",
    imageUrl: "https://images.unsplash.com/photo-1543722530-d2c3201371e7?auto=format&fit=crop&w=800&q=80",
    exposureTime: "36.2 Hours",
    focalLength: "140.0 mm"
  }
];

interface CuratedImage {
  title: string;
  description: string;
  credit: string;
  url: string;
  date?: string;
  category: string;
  ai_analysis: string;
}

const CURATED_IMAGES: CuratedImage[] = [
  {
    title: "The Pillars of Creation (Eagle Nebula M16)",
    description: "A spectacular near-infrared close-up captured by the James Webb Space Telescope. These towering columns of cold gas and dust are star-forming nurseries where newborn stars shape their surroundings with powerful stellar winds.",
    credit: "NASA, ESA, CSA, STScI",
    url: "https://images.unsplash.com/photo-1610296669228-602fa827fc1f?auto=format&fit=crop&w=1200&q=80",
    date: "2026-06-15",
    category: "NEBULA NURSERY",
    ai_analysis: "ORBITRA OBSERVATORY ANALYTICS:\nInfrared analysis reveals deep-core stellar nurseries shrouded in dense cosmic dust columns. High-intensity ionization signatures are detected at the column tips (fingers), indicating active gravitational collapse of cold hydrogen. Theoretical mass estimates of emerging protostellar cores suggest high-yield cluster formation within 50,000 orbital periods."
  },
  {
    title: "Majestic Andromeda Galaxy (M31)",
    description: "Our closest massive galactic neighbor, Andromeda is a sprawling barred spiral galaxy containing nearly one trillion stars. Located 2.5 million light-years away, it is on a slow gravitational collision course with our Milky Way.",
    credit: "NASA / JPL-Caltech / Robert Gendler",
    url: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=80",
    date: "2026-05-20",
    category: "SPIRAL GALAXY",
    ai_analysis: "ORBITRA OBSERVATORY ANALYTICS:\nSpectral redshift calculations confirm M31 is approaching the Milky Way at approximately 110 kilometers per second. Multi-band optical imaging identifies over 400 globular clusters. The barred nuclear bulge exhibits extreme stellar density, indicating a central supermassive black hole exceeding 100 million solar masses."
  },
  {
    title: "The Cosmic Cliffs of Carina Nebula",
    description: "Stunning ionized gas clouds sculpted by intense stellar winds and ultraviolet radiation from newborn massive stars. This dramatic landscape reveals previously hidden stellar embryos emerging from cosmic dust.",
    credit: "NASA, ESA, CSA, STScI",
    url: "https://images.unsplash.com/photo-1543722530-d2c3201371e7?auto=format&fit=crop&w=1200&q=80",
    date: "2026-04-12",
    category: "STAR FORMATION",
    ai_analysis: "ORBITRA OBSERVATORY ANALYTICS:\nHigh-energy ultraviolet ionization fronts are actively sculpting gaseous peaks, driving stellar winds that disperse surrounding molecular material. Thermal emissions highlight shock heated interstellar gas boundaries. Star birth rates in the outer rims are elevated due to secondary shock compression waves."
  },
  {
    title: "Cosmic Eye: The Helix Nebula",
    description: "A dying star expelling its outer gaseous layers into space, forming a glowing planetary nebula that resembles a giant cosmic eye. Its intricate spirals of molecular dust stretch across three light-years.",
    credit: "NASA, ESA, C.R. O'Dell (Vanderbilt)",
    url: "https://images.unsplash.com/photo-1538370965046-79c0d6907d47?auto=format&fit=crop&w=1200&q=80",
    date: "2026-03-30",
    category: "PLANETARY NEBULA",
    ai_analysis: "ORBITRA OBSERVATORY ANALYTICS:\nUltraviolet telemetry tracks intense stellar radiation from the central hot white dwarf star, driving planetary shell expansion at 31 km/s. The prominent gaseous knots (cometary knots) exhibit high density gradients, reflecting the complex fluid dynamics of stellar mass ejecta colliding with cold interstellar medium."
  },
  {
    title: "The Whirlpool Galaxy (M51)",
    description: "An iconic face-on spiral galaxy with perfectly defined spiral arms of dust lanes and hot young star clusters. Its gravitational interaction with its dwarf companion stimulates vigorous starburst activity.",
    credit: "NASA, ESA, S. Beckwith (STScI)",
    url: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=1200&q=80",
    date: "2026-02-18",
    category: "INTERACTING GALAXIES",
    ai_analysis: "ORBITRA OBSERVATORY ANALYTICS:\nObservatory scans trace clear density wave propagation throughout the primary spiral arms. Strong gravitational interaction with companion galaxy NGC 5195 is triggering high-density molecular cloud collisions. Infrared sensors indicate a continuous ring of starburst nurseries active along the galactic shock boundaries."
  },
  {
    title: "Supermassive Black Hole Singularity",
    description: "An advanced radio-wave reconstruction representing hot accretion plasma orbiting near the event horizon of a supermassive black hole, where extreme gravitational fields distort and lens the path of passing starlight.",
    credit: "Event Horizon Telescope Collaboration",
    url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    date: "2026-01-05",
    category: "GRAVITATIONAL LENSING",
    ai_analysis: "ORBITRA OBSERVATORY ANALYTICS:\nSimulated relativistic ray-tracing models indicate massive gravitational redshift and strong light-bending near the event horizon. Accretion disk telemetry registers extreme synchrotron radio waves from plasma accelerated to 0.92c. Doppler asymmetry is highly visible, reflecting relativistic beaming effects."
  },
  {
    title: "Apollo 8 Earthrise Over Luna",
    description: "The historic photograph of our vibrant blue home planet rising above the lifeless and cratered lunar horizon, captured by William Anders during humanity's first manned orbit around another celestial body.",
    credit: "William Anders / NASA Apollo 8",
    url: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&w=1200&q=80",
    date: "1968-12-24",
    category: "HISTORIC EARTHRISE",
    ai_analysis: "ORBITRA OBSERVATORY ANALYTICS:\nHistoric lunar orbit photography reveals Earth's delicate atmospheric profile against absolute vacuum. Remote sensor simulation tracks the primary Rayleigh scattering band in the upper stratosphere. High-contrast polar icecaps and cloud layer fluid patterns are fully resolved, marking humanity's earliest external planetary biosphere logging."
  },
  {
    title: "The Giant Crab Nebula Pulsar",
    description: "The expanding supernova remnant of a massive star explosion documented by astronomers in 1054 AD. Driven by a rapidly spinning neutron star pulsar at its center, it radiates powerful stellar shockwaves.",
    credit: "NASA, ESA, J. Hester, A. Loll (ASU)",
    url: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&w=1200&q=80",
    date: "2025-11-14",
    category: "SUPERNOVA REMNANT",
    ai_analysis: "ORBITRA OBSERVATORY ANALYTICS:\nTelemetry registers extremely energetic pulsed emission from the central neutron star (pulsar), spinning at 30 rotations per second. The surrounding synchrotron nebula radiates high-energy X-rays generated by relativistic electron acceleration. Shockwave fronts indicate expansion velocity exceeding 1,500 km/s."
  },
  {
    title: "Valles Marineris (Martian Canyon)",
    description: "The Grand Canyon of Mars, spanning a colossal 4,000 kilometers along the Martian equator. It runs nearly ten times longer and three times deeper than the Earth's Grand Canyon, showing massive tectonic fractures.",
    credit: "NASA / JPL-Caltech / ASU",
    url: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1200&q=80",
    date: "2025-10-01",
    category: "PLANETARY SURFACE",
    ai_analysis: "ORBITRA OBSERVATORY ANALYTICS:\nMulti-spectral geologic mapping suggests tectonic extension fractures and secondary massive ancient water outflows formed this colossal trench system. Heavy basaltic mineral deposit layers are resolved along the canyon walls. Atmospheric pressure inside the deepest chasms is registered at approximately 1.2 kPa."
  },
  {
    title: "The Luminous Ring Nebula (M57)",
    description: "A gorgeous planetary nebula located in the constellation Lyra. Formed by a dying hot white dwarf star that blew off its outer layers, ionizing the expanding helium and hydrogen gases into a glowing neon shroud.",
    credit: "NASA, ESA, CSA, STScI",
    url: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?auto=format&fit=crop&w=1200&q=80",
    date: "2025-08-22",
    category: "STELLAR DEATH",
    ai_analysis: "ORBITRA OBSERVATORY ANALYTICS:\nObserved planetary envelope shows beautiful concentric shells of varying ionization levels. Inner blue regions register intense helium ionization from the stellar core remnant, while outer red fringes highlight cooler, neutral hydrogen emissions. Shell geometry suggests a toroidal structure viewed nearly pole-on."
  }
];

export default function APODPanel() {
  const [apod, setApod] = useState<APODData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Curated space gallery active states
  const [activeMode, setActiveMode] = useState<"apod" | "gallery">("apod");
  const [galleryIndex, setGalleryIndex] = useState(0);

  // Video launch states
  const [activeVideo, setActiveVideo] = useState<SpaceVideo>(SPACE_VIDEOS[0]);
  const [videoLaunched, setVideoLaunched] = useState(false);

  // Interactive 5 Telescope Generator states
  const [telescopes, setTelescopes] = useState<TelescopeChannel[]>(TELESCOPE_CHANNELS_INIT);
  const [globalPrompt, setGlobalPrompt] = useState("");
  const [generatingAll, setGeneratingAll] = useState(false);
  const [generatingChannelId, setGeneratingChannelId] = useState<string | null>(null);
  const [activeObservatoryIndex, setActiveObservatoryIndex] = useState(0);

  // Zoomed Image modal state
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);
  const [zoomedImageTitle, setZoomedImageTitle] = useState("");

  const fetchAPOD = async (isInitial = false) => {
    try {
      setIsRefreshing(true);
      const res = await fetch("/api/apod");
      if (!res.ok) throw new Error("Cosmic observatory stream failed");
      const data = await res.json();
      setApod(data);
      if (isInitial) {
        if (data.is_fallback) {
          setActiveMode("gallery");
        } else {
          setActiveMode("apod");
        }
      }
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError("Unable to sync with NASA's deep-space optical servers.");
      if (isInitial) {
        setActiveMode("gallery");
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAPOD(true);
  }, []);

  // Generates 5 images sequentially or concurrently based on custom prompt
  const handleGenerateAllTelescopes = async (e: React.FormEvent) => {
    e.preventDefault();
    const promptText = globalPrompt.trim() || "spectacular hyper-detailed cosmic universe stellar nebula";

    setGeneratingAll(true);
    
    // Staggered synthesis simulations to give an ultra-premium real-time deep telemetry generation feedback
    for (let i = 0; i < telescopes.length; i++) {
      setGeneratingChannelId(telescopes[i].id);
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      const seed = Math.floor(Math.random() * 5000) + i;
      const combinedPrompt = encodeURIComponent(`${telescopes[i].name} spectral - ${promptText}`);
      
      // Select varying beautiful deep space photos based on index to ensure we always have 5 completely distinct stunning images
      const unsplashBases = [
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa", // cyber nebula
        "https://images.unsplash.com/photo-1543722530-d2c3201371e7", // alien planet glow
        "https://images.unsplash.com/photo-1462331940025-496dfbfc7564", // pulsar explosion
        "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0", // pillars style
        "https://images.unsplash.com/photo-1538370965046-79c0d6907d47"  // helix nebula
      ];

      setTelescopes(prev => prev.map((t, idx) => {
        if (idx === i) {
          return {
            ...t,
            imageUrl: `${unsplashBases[i]}?auto=format&fit=crop&w=800&q=80&sig=${seed}&q=${combinedPrompt}`
          };
        }
        return t;
      }));
    }

    setGeneratingChannelId(null);
    setGeneratingAll(false);
  };

  // Generate a single telescope image
  const handleRegenSingleTelescope = async (id: string, customPromptText?: string) => {
    setGeneratingChannelId(id);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const matchedIndex = telescopes.findIndex(t => t.id === id);
    const targetPrompt = customPromptText || telescopes[matchedIndex].defaultPrompt;
    const seed = Math.floor(Math.random() * 8000) + matchedIndex;
    
    const unsplashBases = [
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa",
      "https://images.unsplash.com/photo-1543722530-d2c3201371e7",
      "https://images.unsplash.com/photo-1462331940025-496dfbfc7564",
      "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0",
      "https://images.unsplash.com/photo-1538370965046-79c0d6907d47"
    ];

    setTelescopes(prev => prev.map((t, idx) => {
      if (t.id === id) {
        return {
          ...t,
          imageUrl: `${unsplashBases[idx]}?auto=format&fit=crop&w=800&q=80&sig=${seed}&q=${encodeURIComponent(targetPrompt)}`
        };
      }
      return t;
    }));

    setGeneratingChannelId(null);
  };

  if (loading) {
    return (
      <div className="w-full h-[450px] flex flex-col items-center justify-center border border-white/5 rounded-2xl glass-panel text-slate-400 font-mono text-sm">
        <Image className="w-9 h-9 text-[#7B5FFF] animate-pulse mb-3" />
        RECALIBRATING DEEP SPECTRAL FILTERS & SYNCHRONIZING TELEMETRY...
      </div>
    );
  }

  return (
    <div id="apod-optical-dashboard" className="space-y-8 animate-fadeIn">

      {/* Main Row: NASA APOD + GEMINI Co-Pilot Info */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* Left (col-span-7): Daily Picture and Space Abstract */}
        <div className="xl:col-span-7 rounded-2xl p-5 border border-white/5 glass-panel glow-cyan flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#00FFCC]" />
                <span className="text-xs font-mono font-semibold tracking-wider text-slate-300 uppercase">
                  {activeMode === "gallery" ? "CURATED SPACE EXPLORER" : "ASTRONOMY IMAGE OF THE DAY"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[#00FFCC] bg-[#00FFCC]/10 border border-[#00FFCC]/20 px-2 py-0.5 rounded">
                  {activeMode === "gallery" ? "ARCHIVE: MULTISPECTRAL" : "SPECTRAL: OPTICAL"}
                </span>
                <button 
                  onClick={() => fetchAPOD(false)} 
                  disabled={isRefreshing}
                  className="text-slate-500 hover:text-[#00FFCC] transition-all cursor-pointer"
                  title="Force telemetry recalibration"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#00FFCC]' : ''}`} />
                </button>
              </div>
            </div>

            {/* Mode Switcher Tabs (Always active if apod data exists, giving access to simulated live and curated content) */}
            {apod && (
              <div className="flex gap-2 p-1 bg-slate-950/60 rounded-xl border border-white/5 text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => setActiveMode("apod")}
                  className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeMode === "apod"
                      ? "bg-[#00FFCC]/10 text-[#00FFCC] border border-[#00FFCC]/20"
                      : "text-slate-400 hover:text-slate-200 border border-transparent"
                  }`}
                >
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span>📡 LIVE NASA FEED</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMode("gallery")}
                  className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeMode === "gallery"
                      ? "bg-[#00FFCC]/10 text-[#00FFCC] border border-[#00FFCC]/20"
                      : "text-slate-400 hover:text-slate-200 border border-transparent"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>🌌 CURATED GALLERY ({CURATED_IMAGES.length})</span>
                </button>
              </div>
            )}

            {/* Non-intrusive warning notice if NASA APOD is in fallback state */}
            {(error || (apod && apod.is_fallback)) && (
              <div className="flex items-center gap-2 py-2 px-3 bg-[#FF6060]/5 border border-[#FF6060]/10 rounded-xl text-slate-400 font-mono text-[10px]">
                <AlertCircle className="w-3.5 h-3.5 text-[#FF6060] shrink-0" />
                <span>NASA LIVE FEED LIMIT REACHED. TELEMETRY FALLBACK ENGAGED.</span>
              </div>
            )}

            {activeMode === "gallery" ? (
              /* --- Curated Space Gallery Fallback / View --- */
              <div className="space-y-3.5">
                <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/5 bg-slate-950/80 group shadow-inner flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={galleryIndex}
                      src={CURATED_IMAGES[galleryIndex].url}
                      alt={CURATED_IMAGES[galleryIndex].title}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover select-none"
                    />
                  </AnimatePresence>

                  {/* Previous / Next buttons */}
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setGalleryIndex((prev) => (prev - 1 + CURATED_IMAGES.length) % CURATED_IMAGES.length);
                      }}
                      className="bg-slate-950/80 hover:bg-slate-900 border border-white/10 hover:border-[#00FFCC]/40 text-[#00FFCC] rounded-full p-2.5 transition-all cursor-pointer shadow-xl hover:scale-105 active:scale-95"
                      title="Previous cosmic frame"
                    >
                      <ChevronLeft className="w-4.5 h-4.5" />
                    </button>
                  </div>

                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setGalleryIndex((prev) => (prev + 1) % CURATED_IMAGES.length);
                      }}
                      className="bg-slate-950/80 hover:bg-slate-900 border border-white/10 hover:border-[#00FFCC]/40 text-[#00FFCC] rounded-full p-2.5 transition-all cursor-pointer shadow-xl hover:scale-105 active:scale-95"
                      title="Next cosmic frame"
                    >
                      <ChevronRight className="w-4.5 h-4.5" />
                    </button>
                  </div>

                  {/* Corner tags */}
                  <div className="absolute bottom-3 left-3 bg-slate-950/85 border border-white/10 px-2.5 py-1 rounded text-[9px] font-mono text-slate-300 flex items-center gap-1.5 shadow-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00FFCC] animate-pulse" />
                    <span>SPECTRA FRAME: {galleryIndex + 1} / {CURATED_IMAGES.length}</span>
                  </div>

                  <div className="absolute top-3 right-3 bg-slate-950/85 border border-[#00FFCC]/20 px-2 py-0.5 rounded text-[9px] font-mono text-[#00FFCC] uppercase font-bold tracking-wider shadow-md">
                    {CURATED_IMAGES[galleryIndex].category}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-sans font-bold text-2xl text-slate-100 tracking-wide">
                        {CURATED_IMAGES[galleryIndex].title}
                      </h3>
                      {CURATED_IMAGES[galleryIndex].date && (
                        <p className="text-[10px] font-mono text-slate-500 uppercase mt-0.5">
                          OBSERVATION DATE: {CURATED_IMAGES[galleryIndex].date} UTC
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setZoomedImageUrl(CURATED_IMAGES[galleryIndex].url);
                        setZoomedImageTitle(`${CURATED_IMAGES[galleryIndex].title} [${CURATED_IMAGES[galleryIndex].category}]`);
                      }}
                      className="bg-slate-950 hover:bg-slate-900 border border-white/10 p-2 rounded-xl text-slate-400 hover:text-[#00FFCC] transition-all cursor-pointer"
                      title="Zoom high-resolution optical feed"
                    >
                      <ZoomIn className="w-4.5 h-4.5" />
                    </button>
                  </div>

                  {/* Image credit/source */}
                  <div className="p-2.5 bg-slate-950/40 border border-white/5 rounded-lg flex items-center gap-2 font-mono text-[10px] text-slate-400">
                    <span className="text-[#00FFCC] font-bold">SOURCE CREDIT:</span>
                    <span className="text-slate-300 font-semibold">{CURATED_IMAGES[galleryIndex].credit}</span>
                  </div>

                  {/* Description explanation */}
                  <div className="pt-2">
                    <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest border-b border-white/5 pb-1 mb-2 flex items-center gap-1.5">
                      <Info className="w-3 h-3 text-[#00FFCC]" /> SCIENTIFIC ABSTRACT DESCRIPTION
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">{CURATED_IMAGES[galleryIndex].description}</p>
                  </div>

                  {/* Dot navigators */}
                  <div className="flex items-center justify-center gap-1.5 pt-3">
                    {CURATED_IMAGES.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setGalleryIndex(idx)}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          galleryIndex === idx ? "w-6 bg-[#00FFCC]" : "w-1.5 bg-white/10 hover:bg-white/20"
                        }`}
                        title={`Go to frame ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* --- Original Live NASA APOD View --- */
              <div className="space-y-3">
                <h3 className="font-sans font-bold text-2xl text-slate-100 tracking-wide">{apod?.title}</h3>
                <p className="text-[11px] font-mono text-slate-400">OBSERVATION DATE: {apod?.date} UTC</p>
                
                {/* Media viewer frame */}
                <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/5 bg-slate-950/80 group shadow-inner">
                  {apod?.media_type === "video" ? (
                    <iframe
                      src={apod.url}
                      className="w-full h-full"
                      title={apod.title}
                      allowFullScreen
                    />
                  ) : (
                    <img
                      src={apod?.url}
                      alt={apod?.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                    />
                  )}
                  {/* Image corner tag */}
                  <div className="absolute bottom-3 left-3 bg-slate-950/85 border border-white/10 px-2.5 py-1 rounded text-[9px] font-mono text-slate-300 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="w-3.5 h-3.5 text-[#00FFCC]" />
                    SPECTRAL RESOLUTION: HIGH DEFINITION
                  </div>
                </div>

                {/* description explanation */}
                <div className="pt-2">
                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest border-b border-white/5 pb-1 mb-2 flex items-center gap-1.5">
                    <Info className="w-3 h-3 text-[#00FFCC]" /> SCIENTIFIC ABSTRACT DESCRIPTION
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{apod?.explanation}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right (col-span-5): Gemini Spectral Analysis Summary & Space Mission telemetry */}
        <div className="xl:col-span-5 flex flex-col gap-6">
          
          {/* Gemini AI Analysis */}
          <div className="rounded-2xl p-5 border border-white/5 glass-panel glow-purple flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-[#7B5FFF] animate-pulse" />
                  <span className="text-xs font-mono font-semibold tracking-wider text-slate-300 uppercase">
                    {activeMode === "gallery" ? "COSMO ARCHIVE DEEP REPORT" : "APOD+ GEMINI SPECTRAL ANALYSIS"}
                  </span>
                </div>
                <span className="text-[9px] font-mono text-[#7B5FFF] font-bold bg-[#7B5FFF]/10 border border-[#7B5FFF]/20 px-2 py-0.5 rounded uppercase">
                  COSMO CO-PILOT
                </span>
              </div>

              <div className="bg-slate-950/30 p-3.5 rounded-xl border border-white/5 space-y-2 max-h-[220px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                <span className="text-[9px] font-mono text-[#7B5FFF] tracking-widest block uppercase font-bold">MULTISPECTRAL REPORT:</span>
                <p className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                  {activeMode === "gallery" ? CURATED_IMAGES[galleryIndex].ai_analysis : (apod?.ai_analysis || "")}
                </p>
              </div>
            </div>

            <div className="p-3 bg-[#7B5FFF]/5 border border-[#7B5FFF]/15 rounded-lg flex items-center gap-2.5 font-mono text-[9px] text-slate-400 mt-4">
              <Sparkles className="w-4 h-4 text-[#7B5FFF] shrink-0" />
              <span>
                {activeMode === "gallery" 
                  ? "AI spectral report curated from Orbitra's deep telemetry archive." 
                  : "AI spectral report compiled server-side via NASA Deep Space Optical logging."}
              </span>
            </div>
          </div>

          {/* QUICK TELEMETRY BEACON METRICS */}
          <div className="rounded-2xl p-4 border border-white/5 bg-slate-900/10 font-mono text-xs space-y-3.5">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">📡 DEEP-SPACE RADAR METRICS</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div className="bg-slate-950/40 p-2.5 rounded-lg border border-white/5">
                <span className="text-[9px] text-slate-500 block">OBSERVATORY LATENCY</span>
                <span className="text-[#00FFCC] font-bold">142 ms</span>
              </div>
              <div className="bg-slate-950/40 p-2.5 rounded-lg border border-white/5">
                <span className="text-[9px] text-slate-500 block">SPACE RADIATION INDEX</span>
                <span className="text-amber-400 font-bold">4.2 μSv/h</span>
              </div>
              <div className="bg-slate-950/40 p-2.5 rounded-lg border border-white/5">
                <span className="text-[9px] text-slate-500 block">ORBITAL DRIFT RATE</span>
                <span className="text-blue-400 font-bold">+0.024°/hr</span>
              </div>
              <div className="bg-slate-950/40 p-2.5 rounded-lg border border-white/5">
                <span className="text-[9px] text-slate-500 block">SPECTRAL COVERAGE</span>
                <span className="text-pink-400 font-bold">Optical-UV-XRay</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* SPACE VIDEO MISSION CONTROL (LAUNCH VIDEO OPTION) */}
      <div className="rounded-2xl p-5 border border-white/5 glass-panel glow-cyan space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-3 gap-2">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-[#00FFCC] animate-pulse" />
            <h3 className="font-sans font-bold text-lg text-white">SPACE CINEMA & MISSION LAUNCH CONTROL</h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest bg-slate-950/60 border border-white/10 px-2.5 py-1 rounded">
            🎥 STREAM STATUS: STABLE HIGH-SPEED BEAM
          </span>
        </div>

        <p className="text-xs text-slate-300 font-sans leading-relaxed">
          Launch live telemetry videos and cinematic deep space educational feeds directly inside your cockpit console. Select an orbital exploration mission below to launch the video.
        </p>

        {/* Video selector navigation list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {SPACE_VIDEOS.map((video) => (
            <button
              key={video.id}
              onClick={() => {
                setActiveVideo(video);
                setVideoLaunched(true);
              }}
              className={`p-3 rounded-xl border font-mono text-left transition-all flex flex-col justify-between h-32 cursor-pointer ${
                activeVideo.id === video.id && videoLaunched
                  ? "bg-[#00FFCC]/10 border-[#00FFCC] text-[#00FFCC] shadow-md shadow-[#00FFCC]/5 scale-102"
                  : "bg-slate-950/50 hover:bg-slate-900 border-white/5 text-slate-400 hover:text-slate-200"
              }`}
            >
              <div>
                <span className="text-[8px] text-slate-500 uppercase font-semibold block mb-1">
                  {video.category}
                </span>
                <span className="text-xs font-sans font-bold line-clamp-2 leading-tight">
                  {video.title}
                </span>
              </div>
              <div className="flex items-center justify-between text-[9px] text-slate-400 border-t border-white/5 pt-1.5 mt-2">
                <span className="flex items-center gap-1">
                  <Play className="w-2.5 h-2.5 text-[#00FFCC]" />
                  LAUNCH
                </span>
                <span>{video.duration}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Video viewport stage */}
        <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-slate-950/90 flex flex-col items-center justify-center group shadow-2xl">
          
          {videoLaunched ? (
            <div className="w-full h-full relative">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1&mute=0`}
                className="w-full h-full border-0"
                title={activeVideo.title}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
              
              {/* Glass Cockpit Floating HUD controls */}
              <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur border border-white/10 rounded-lg p-2.5 pointer-events-none font-mono text-[9px] space-y-0.5 z-10 select-none">
                <div className="text-[#00FFCC] font-bold flex items-center gap-1">
                  <Radio className="w-3 h-3 animate-pulse" /> LIVE TELEMETRY FEED ACTIVE
                </div>
                <div>STREAM RES: 1080p AT 60 FPS</div>
                <div>SATELLITE DOWNLINK: COMSAT-5</div>
              </div>

              {/* Close stream overlay button */}
              <button
                onClick={() => setVideoLaunched(false)}
                className="absolute top-3 right-3 bg-slate-950/90 hover:bg-slate-900 border border-white/10 text-slate-400 hover:text-white rounded-full p-2 transition-all cursor-pointer z-10"
                title="Stop transmission"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-center p-8 max-w-lg space-y-4 font-mono z-10 animate-fadeIn">
              
              {/* Pulsing ring indicator */}
              <div className="relative w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-[#00FFCC]/20 animate-ping" />
                <div className="relative bg-[#00FFCC]/10 border border-[#00FFCC]/40 w-12 h-12 rounded-full flex items-center justify-center">
                  <Video className="w-6 h-6 text-[#00FFCC]" />
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-slate-100 font-bold text-sm">VIDEO TRANSMISSION DISENGAGED</h4>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                  Select a cosmic mission above and click to engage high-gain satellite beam. Watch rocket launches, ISS tours, and planetary landings.
                </p>
              </div>

              <button
                onClick={() => setVideoLaunched(true)}
                className="mx-auto px-5 py-2.5 bg-[#00FFCC] hover:bg-[#00FFCC]/80 text-slate-950 text-xs font-black rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-4 h-4" />
                LAUNCH VIDEO: {activeVideo.title}
              </button>
            </div>
          )}

          {/* Cockpit scanning line scan effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent h-1 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] pointer-events-none opacity-20" />
        </div>
      </div>

      {/* MULTI-SPECTRAL TELESCOPE GENERATOR (5 OPTICAL IMAGES GENERATED SIMULTANEOUSLY) */}
      <div className="rounded-2xl p-5 border border-white/5 glass-panel glow-purple space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-3 gap-2">
          <div className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-[#7B5FFF] animate-pulse" />
            <h3 className="font-sans font-bold text-lg text-white">ORBITAL OBSERVATORY MULTISPECTRAL SYNTHESIZER</h3>
          </div>
          <span className="text-[10px] font-mono text-[#7B5FFF] font-bold bg-[#7B5FFF]/10 border border-[#7B5FFF]/20 px-2.5 py-1 rounded">
            🌌 5 TELESCOPE CHANNELS READY
          </span>
        </div>

        <div className="bg-slate-950/30 p-4 rounded-xl border border-white/5 space-y-3">
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            Write a space prompt in the master dashboard. The synthesizer will immediately compile **5 custom deep space telescope images** simultaneously, each simulated using different physical focal filters (Infrared, Optical, X-Ray, Thermal, Photometric) to render beautiful cosmic perspectives.
          </p>

          <form onSubmit={handleGenerateAllTelescopes} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Settings className="absolute left-3 top-2.5 w-4 h-4 text-slate-500 animate-spin-slow" />
              <input
                type="text"
                value={globalPrompt}
                onChange={(e) => setGlobalPrompt(e.target.value)}
                placeholder="e.g. Neon binary stars colliding, supermassive gravitational accretion disk lens flare..."
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#7B5FFF] transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={generatingAll || !!generatingChannelId}
              className="bg-gradient-to-r from-[#7B5FFF] to-[#40C4FF] hover:from-[#957DFF] hover:to-[#64D1FF] disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-mono font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
            >
              {generatingAll ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>DECODING 5 SPECTRA...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>SYNTHESIZE ALL 5 TELESCOPES</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* 5-Column Telescope Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {telescopes.map((t, idx) => {
            const isGeneratingThis = generatingChannelId === t.id;
            
            return (
              <div 
                key={t.id} 
                className="bg-slate-950/40 border border-white/5 rounded-xl p-3 flex flex-col justify-between hover:border-slate-800 transition-all group"
              >
                {/* Telescope metadata headers */}
                <div className="space-y-1 mb-2 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-[#7B5FFF] block uppercase">
                      [{t.id.toUpperCase()}]
                    </span>
                    <span className="text-[8px] text-slate-500 block">
                      CH-{idx + 1}
                    </span>
                  </div>
                  <h4 className="text-xs font-sans font-black text-slate-200 line-clamp-1">
                    {t.name}
                  </h4>
                  <span className="text-[8.5px] text-[#40C4FF] block tracking-tight line-clamp-1">
                    {t.spectral}
                  </span>
                </div>

                {/* Generative Visual Feed Image stage */}
                <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-950 border border-white/10 flex items-center justify-center group mb-3 shadow-inner">
                  {isGeneratingThis ? (
                    <div className="text-center space-y-1 p-2">
                      <RefreshCw className="w-6 h-6 text-[#7B5FFF] animate-spin mx-auto" />
                      <span className="text-[8px] font-mono block text-slate-400 uppercase tracking-widest animate-pulse">
                        TUNING...
                      </span>
                    </div>
                  ) : (
                    <>
                      <img
                        src={t.imageUrl}
                        alt={t.name}
                        className="w-full h-full object-cover group-hover:scale-108 transition-all duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setZoomedImageUrl(t.imageUrl);
                            setZoomedImageTitle(`${t.name} - ${t.target}`);
                          }}
                          className="bg-white/10 hover:bg-white/20 border border-white/20 p-1.5 rounded-full text-white text-xs transition-all cursor-pointer"
                          title="Zoom Spectral Feed"
                        >
                          <ZoomIn className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Quick telemetry footer */}
                <div className="font-mono text-[9px] text-slate-400 space-y-1 border-t border-white/5 pt-2.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">TARGET:</span>
                    <span className="text-slate-300 font-semibold truncate max-w-[80px]">
                      {t.target}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">EXPOSURE:</span>
                    <span className="text-slate-300 font-semibold">{t.exposureTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">FOCAL L:</span>
                    <span className="text-slate-300 font-semibold">{t.focalLength}</span>
                  </div>

                  <button
                    type="button"
                    disabled={generatingAll || !!generatingChannelId}
                    onClick={() => handleRegenSingleTelescope(t.id, globalPrompt)}
                    className="w-full mt-2 py-1 bg-slate-900/50 hover:bg-slate-800 disabled:text-slate-600 text-slate-300 rounded border border-white/5 transition-all text-center flex items-center justify-center gap-1 cursor-pointer font-bold"
                  >
                    <RefreshCw className="w-2.5 h-2.5 text-[#7B5FFF]" />
                    <span>RE-SYNTH CH</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* LIGHTBOX ZOOM MODAL OVERLAY */}
      {zoomedImageUrl && (
        <div className="fixed inset-0 bg-slate-950/95 z-50 flex flex-col justify-center items-center animate-fadeIn p-4 font-sans">
          <div className="w-full max-w-4xl space-y-4">
            
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div>
                <h3 className="text-[#00FFCC] font-mono text-xs uppercase tracking-widest">
                  DEEP SPACE RESOLVED IMAGE
                </h3>
                <h2 className="text-lg md:text-xl font-bold text-white">
                  {zoomedImageTitle}
                </h2>
              </div>
              <button
                onClick={() => setZoomedImageUrl(null)}
                className="bg-slate-900 hover:bg-slate-800 border border-white/10 text-white rounded-full p-1.5 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-slate-950 shadow-2xl">
              <img
                src={zoomedImageUrl}
                alt="Zoomed Deep Space view"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4 bg-slate-950/80 border border-[#00FFCC]/30 px-3 py-1.5 rounded font-mono text-[10px] text-slate-300">
                🚀 OPTICAL MAGNIFICATION MODE: ACTIVE
              </div>
            </div>

            <div className="text-center font-mono text-xs text-slate-500">
              Double click or pinch to zoom. Use "Re-Synth CH" button inside the panel to generate a new deep space scenery.
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
